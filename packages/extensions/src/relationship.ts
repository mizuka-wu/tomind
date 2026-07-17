/**
 * RelationshipExtension — 关联线交互扩展
 *
 * 从旧 svgdraggable/relationship.ts（1057行）迁移：
 * - 端点拖拽（起始/终止节点吸附）
 * - 控制点拖拽（贝塞尔曲线手柄）
 * - 路径实时更新
 *
 * 已修复 TODO:
 * - 从 node.attrs 读取真实的 fromId/toId，从 layoutResult 获取端点位置
 * - 多边形吸附区域检测（topic 感应区 + boundary 感应区）
 * - 贝塞尔控制点根据端点位置自动计算
 */

import { Group, Path, Ellipse } from 'leafer-ui'
import { createExtension } from '@tomind/core'
import { DraggableRegister, type DragMoveInfo } from './draggable'
import type { ExtensionContext } from '@tomind/core'

// ==================== 常量 ====================

const ENDPOINT_RADIUS = 5
const CONTROL_POINT_RADIUS = 4
const ENDPOINT_COLOR = '#4A90D9'
const CONTROL_POINT_COLOR = '#ff6b6b'
const CONTROL_LINE_COLOR = '#999'
const SNAP_DISTANCE = 30
/** 感应区外扩 padding（旧系统 POLYGON_PADDING = 60） */
const POLYGON_PADDING = 60
/** boundary 感应区内外扩 gap（旧系统 BOUNDARYGAP + 5） */
const BOUNDARY_GAP = 25

// ==================== Storage ====================

interface RelationshipStorage extends Record<string, unknown> {
  overlayGroup: Group | null
  currentTargetId: string | null
  registers: DraggableRegister[]
}

// ==================== 工具函数 ====================

function findNodeGroup(group: Group, nodeId: string): Group | null {
  const children = (group as any).children
  if (!children) return null
  for (const child of children) {
    if (child.name === nodeId) return child
    if (child.children?.length) {
      const found = findNodeGroup(child, nodeId)
      if (found) return found
    }
  }
  return null
}

/** 生成三次贝塞尔路径 */
function generateCubicPath(
  startX: number, startY: number,
  endX: number, endY: number,
  cp1X: number, cp1Y: number,
  cp2X: number, cp2Y: number,
): string {
  return `M ${startX} ${startY} C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${endX} ${endY}`
}

/** 根据端点位置自动计算默认控制点（水平偏移） */
function computeDefaultControlPoints(
  fromX: number, fromY: number,
  toX: number, toY: number,
): { cp1X: number; cp1Y: number; cp2X: number; cp2Y: number } {
  const dx = toX - fromX
  const offset = Math.abs(dx) * 0.4 + 30 // 至少偏移30px
  return {
    cp1X: fromX + (dx >= 0 ? offset : -offset),
    cp1Y: fromY,
    cp2X: toX - (dx >= 0 ? offset : -offset),
    cp2Y: toY,
  }
}

/** 判断点是否在四边形内（射线法） */
function isPointInPolygon(px: number, py: number, polygon: { x: number; y: number }[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y
    const xj = polygon[j].x, yj = polygon[j].y
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

/** 计算点到线段的最短距离 */
function pointToSegmentDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2)
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const projX = ax + t * dx
  const projY = ay + t * dy
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2)
}

// ==================== 多边形吸附区域 ====================

/** 获取所有节点的感应区多边形 */
function getAllSnapPolygons(state: any): { nodeId: string; outer: { x: number; y: number }[]; inner: { x: number; y: number }[]; cx: number; cy: number }[] {
  const layoutResult = (state as any)._layoutResult
  if (!layoutResult) return []

  const result: { nodeId: string; outer: { x: number; y: number }[]; inner: { x: number; y: number }[]; cx: number; cy: number }[] = []

  for (const [id, layout] of layoutResult.nodes) {
    const x = layout.x ?? 0
    const y = layout.y ?? 0
    const w = layout.width ?? 100
    const h = layout.height ?? 60
    const cx = x + w / 2
    const cy = y + h / 2

    // topic 的感应区（矩形 + POLYGON_PADDING 外扩）
    const outer = [
      { x: x - POLYGON_PADDING, y: y - POLYGON_PADDING },
      { x: x + w + POLYGON_PADDING, y: y - POLYGON_PADDING },
      { x: x + w + POLYGON_PADDING, y: y + h + POLYGON_PADDING },
      { x: x - POLYGON_PADDING, y: y + h + POLYGON_PADDING },
    ]
    // 内缩区域用于精确吸附判定
    const inner = [
      { x: x - POLYGON_PADDING * 0.7, y: y - POLYGON_PADDING * 0.7 },
      { x: x + w + POLYGON_PADDING * 0.7, y: y - POLYGON_PADDING * 0.7 },
      { x: x + w + POLYGON_PADDING * 0.7, y: y + h + POLYGON_PADDING * 0.7 },
      { x: x - POLYGON_PADDING * 0.7, y: y + h + POLYGON_PADDING * 0.7 },
    ]

    result.push({ nodeId: id, outer, inner, cx, cy })
  }

  return result
}

/**
 * 查找最近的吸附目标
 * 使用多边形感应区：先用 outer 粗筛，再用 inner 精确判定
 */
function findSnapTarget(
  state: any,
  x: number,
  y: number,
  excludeId: string,
): { nodeId: string; x: number; y: number } | null {
  const polygons = getAllSnapPolygons(state)

  let closest: { nodeId: string; x: number; y: number; dist: number } | null = null

  for (const poly of polygons) {
    if (poly.nodeId === excludeId) continue

    // outer 区域快速过滤
    if (!isPointInPolygon(x, y, poly.outer)) continue

    // inner 区域精确吸附
    const isInner = isPointInPolygon(x, y, poly.inner)

    // 计算到节点边界最近点的距离
    const nodeLayout = (state as any)._layoutResult?.nodes?.get(poly.nodeId)
    if (!nodeLayout) continue
    const nx = nodeLayout.x ?? 0
    const ny = nodeLayout.y ?? 0
    const nw = nodeLayout.width ?? 100
    const nh = nodeLayout.height ?? 60

    // 四条边的距离
    const distTop = pointToSegmentDist(x, y, nx, ny, nx + nw, ny)
    const distBottom = pointToSegmentDist(x, y, nx, ny + nh, nx + nw, ny + nh)
    const distLeft = pointToSegmentDist(x, y, nx, ny, nx, ny + nh)
    const distRight = pointToSegmentDist(x, y, nx + nw, ny, nx + nw, ny + nh)
    const dist = Math.min(distTop, distBottom, distLeft, distRight)

    // inner 区域内直接吸附，否则需要距离 < SNAP_DISTANCE
    if (isInner || dist < SNAP_DISTANCE) {
      // 吸附到最近的边中点
      let snapX = poly.cx
      let snapY = poly.cy
      if (distTop <= distBottom && distTop <= distLeft && distTop <= distRight) {
        snapX = x
        snapY = ny
      } else if (distBottom <= distTop && distBottom <= distLeft && distBottom <= distRight) {
        snapX = x
        snapY = ny + nh
      } else if (distLeft <= distTop && distLeft <= distBottom && distLeft <= distRight) {
        snapX = nx
        snapY = y
      } else {
        snapX = nx + nw
        snapY = y
      }

      if (!closest || dist < closest.dist) {
        closest = { nodeId: poly.nodeId, x: snapX, y: snapY, dist }
      }
    }
  }

  return closest ? { nodeId: closest.nodeId, x: closest.x, y: closest.y } : null
}

// ==================== Overlay 创建 ====================

/**
 * 创建关联线 overlay
 * 从 node.attrs 读取 fromId/toId，从 layoutResult 获取端点位置
 */
function createRelationshipOverlay(
  state: any,
  nodeId: string,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): Group {
  const group = new Group({ name: 'relationship-overlay' })

  // 默认控制点
  const { cp1X, cp1Y, cp2X, cp2Y } = computeDefaultControlPoints(fromX, fromY, toX, toY)

  // 主路径
  const mainPath = generateCubicPath(fromX, fromY, toX, toY, cp1X, cp1Y, cp2X, cp2Y)
  const path = new Path({
    name: 'main-path',
    path: mainPath,
    stroke: ENDPOINT_COLOR,
    strokeWidth: 2,
    fill: 'none',
  })
  group.add(path)

  // 起始端点
  const startDot = new Ellipse({
    name: 'start-point',
    x: fromX,
    y: fromY,
    width: ENDPOINT_RADIUS * 2, height: ENDPOINT_RADIUS * 2,
    fill: ENDPOINT_COLOR,
    cursor: 'grab',
  })
  group.add(startDot)

  // 终止端点
  const endDot = new Ellipse({
    name: 'end-point',
    x: toX,
    y: toY,
    width: ENDPOINT_RADIUS * 2, height: ENDPOINT_RADIUS * 2,
    fill: ENDPOINT_COLOR,
    cursor: 'grab',
  })
  group.add(endDot)

  // 控制点1 + 连接线
  const cpLine1 = new Path({
    name: 'cp-line-1',
    path: `M ${fromX} ${fromY} L ${cp1X} ${cp1Y}`,
    stroke: CONTROL_LINE_COLOR,
    strokeWidth: 1,
    fill: 'none',
    strokeDasharray: [4, 4],
  })
  group.add(cpLine1)

  const cp1 = new Ellipse({
    name: 'control-point-1',
    x: cp1X,
    y: cp1Y,
    width: CONTROL_POINT_RADIUS * 2, height: CONTROL_POINT_RADIUS * 2,
    fill: CONTROL_POINT_COLOR,
    cursor: 'grab',
  })
  group.add(cp1)

  // 控制点2 + 连接线
  const cpLine2 = new Path({
    name: 'cp-line-2',
    path: `M ${toX} ${toY} L ${cp2X} ${cp2Y}`,
    stroke: CONTROL_LINE_COLOR,
    strokeWidth: 1,
    fill: 'none',
    strokeDasharray: [4, 4],
  })
  group.add(cpLine2)

  const cp2 = new Ellipse({
    name: 'control-point-2',
    x: cp2X,
    y: cp2Y,
    width: CONTROL_POINT_RADIUS * 2, height: CONTROL_POINT_RADIUS * 2,
    fill: CONTROL_POINT_COLOR,
    cursor: 'grab',
  })
  group.add(cp2)

  return group
}

// ==================== 拖拽逻辑 ====================

/** 端点拖拽 */
function setupEndpointDrag(
  ctx: ExtensionContext,
  overlay: Group,
  dotName: 'start-point' | 'end-point',
  cpName: 'control-point-1' | 'control-point-2',
  cpLineName: 'cp-line-1' | 'cp-line-2',
  pathName: string,
  nodeId: string,
): DraggableRegister | null {
  const dot = overlay.findOne(dotName) as Ellipse
  if (!dot) return null

  const reg = new DraggableRegister(dot, {
    showShadow: false,
    allowMouseDownPropagation: false,
  })

  reg.dragMove((info: DragMoveInfo, _e: MouseEvent | TouchEvent) => {
    const newX = (dot.x ?? 0) + info.deltaX
    const newY = (dot.y ?? 0) + info.deltaY

    // 吸附检测
    const state = ctx.getState() as any
    const snap = findSnapTarget(state, newX, newY, nodeId)
    const finalX = snap ? snap.x : newX
    const finalY = snap ? snap.y : newY

    dot.set({ x: finalX, y: finalY })

    // 更新连接线
    const cp = overlay.findOne(cpName) as Ellipse
    const cpLine = overlay.findOne(cpLineName) as Path
    if (cp && cpLine) {
      cpLine.path = `M ${finalX} ${finalY} L ${cp.x ?? 0} ${cp.y ?? 0}`
    }

    // 更新主路径
    updateMainPath(overlay)
  })

  reg.dragEnd(() => {
    ctx.emit('relationship:endpointMoved', {
      nodeId,
      endpoint: dotName === 'start-point' ? 'start' : 'end',
      x: dot.x ?? 0,
      y: dot.y ?? 0,
    })
  })

  return reg
}

/** 控制点拖拽 */
function setupControlPointDrag(
  ctx: ExtensionContext,
  overlay: Group,
  cpName: 'control-point-1' | 'control-point-2',
  cpLineName: 'cp-line-1' | 'cp-line-2',
  dotName: 'start-point' | 'end-point',
  pathName: string,
  nodeId: string,
): DraggableRegister | null {
  const cp = overlay.findOne(cpName) as Ellipse
  if (!cp) return null

  const reg = new DraggableRegister(cp, {
    showShadow: false,
    allowMouseDownPropagation: false,
  })

  reg.dragMove((info: DragMoveInfo, _e: MouseEvent | TouchEvent) => {
    cp.set({
      x: (cp.x ?? 0) + info.deltaX,
      y: (cp.y ?? 0) + info.deltaY,
    })

    // 更新连接线
    const dot = overlay.findOne(dotName) as Ellipse
    const cpLine = overlay.findOne(cpLineName) as Path
    if (dot && cpLine) {
      cpLine.path = `M ${dot.x ?? 0} ${dot.y ?? 0} L ${cp.x ?? 0} ${cp.y ?? 0}`
    }

    // 更新主路径
    updateMainPath(overlay)
  })

  reg.dragEnd(() => {
    ctx.emit('relationship:controlPointMoved', {
      nodeId,
      controlPoint: cpName === 'control-point-1' ? 0 : 1,
      x: cp.x ?? 0,
      y: cp.y ?? 0,
    })
  })

  return reg
}

/** 更新主路径（根据当前端点和控制点位置） */
function updateMainPath(overlay: Group): void {
  const startDot = overlay.findOne('start-point') as Ellipse
  const endDot = overlay.findOne('end-point') as Ellipse
  const cp1 = overlay.findOne('control-point-1') as Ellipse
  const cp2 = overlay.findOne('control-point-2') as Ellipse
  const path = overlay.findOne('main-path') as Path

  if (startDot && endDot && cp1 && cp2 && path) {
    path.path = generateCubicPath(
      startDot.x ?? 0, startDot.y ?? 0,
      endDot.x ?? 0, endDot.y ?? 0,
      cp1.x ?? 0, cp1.y ?? 0,
      cp2.x ?? 0, cp2.y ?? 0,
    )
  }
}

// ==================== Hover 处理 ====================

function handleHoverEnter(ctx: ExtensionContext, nodeId: string): void {
  const storage = ctx.storage as RelationshipStorage
  const state = ctx.getState() as any
  if (!state) return

  const node = state.nodes?.get(nodeId)
  if (!node || node.type !== 'relationship') return

  const view = ctx.getView() as any
  const layoutEngine = view?.layoutEngine
  if (!layoutEngine) return

  const layoutResult = layoutEngine.getLayoutResult()
  state._layoutResult = layoutResult

  const nodeLayout = layoutResult?.nodes?.get(nodeId)
  if (!nodeLayout) return

  const rootGroup = view?.leaferView?.parent
  if (!rootGroup) return

  const targetGroup = findNodeGroup(rootGroup, nodeId)
  if (!targetGroup) return

  /**
   * 从 node.attrs 读取真实的 fromId/toId
   * 如果没有设置，则用节点自身的位置作为默认端点
   */
  const fromId = node.attrs?.fromId as string | undefined
  const toId = node.attrs?.toId as string | undefined

  let fromX: number, fromY: number, toX: number, toY: number

  if (fromId) {
    const fromLayout = layoutResult.nodes?.get(fromId)
    if (fromLayout) {
      fromX = (fromLayout.x ?? 0) + (fromLayout.width ?? 0) / 2
      fromY = (fromLayout.y ?? 0) + (fromLayout.height ?? 0) / 2
    } else {
      fromX = nodeLayout.x ?? 0
      fromY = (nodeLayout.y ?? 0) + (nodeLayout.height ?? 0) / 2
    }
  } else {
    fromX = nodeLayout.x ?? 0
    fromY = (nodeLayout.y ?? 0) + (nodeLayout.height ?? 0) / 2
  }

  if (toId) {
    const toLayout = layoutResult.nodes?.get(toId)
    if (toLayout) {
      toX = (toLayout.x ?? 0) + (toLayout.width ?? 0) / 2
      toY = (toLayout.y ?? 0) + (toLayout.height ?? 0) / 2
    } else {
      toX = (nodeLayout.x ?? 0) + (nodeLayout.width ?? 100)
      toY = (nodeLayout.y ?? 0) + (nodeLayout.height ?? 0) / 2
    }
  } else {
    toX = (nodeLayout.x ?? 0) + (nodeLayout.width ?? 100)
    toY = (nodeLayout.y ?? 0) + (nodeLayout.height ?? 0) / 2
  }

  // 创建 overlay
  const overlay = createRelationshipOverlay(state, nodeId, fromX, fromY, toX, toY)
  storage.overlayGroup = overlay
  storage.currentTargetId = nodeId

  const parentGroup = targetGroup.parent
  if (parentGroup) {
    parentGroup.add(overlay)
  }

  // 注册端点拖拽
  const startReg = setupEndpointDrag(ctx, overlay, 'start-point', 'control-point-1', 'cp-line-1', 'main-path', nodeId)
  const endReg = setupEndpointDrag(ctx, overlay, 'end-point', 'control-point-2', 'cp-line-2', 'main-path', nodeId)

  // 注册控制点拖拽
  const cp1Reg = setupControlPointDrag(ctx, overlay, 'control-point-1', 'cp-line-1', 'start-point', 'main-path', nodeId)
  const cp2Reg = setupControlPointDrag(ctx, overlay, 'control-point-2', 'cp-line-2', 'end-point', 'main-path', nodeId)

  if (startReg) storage.registers.push(startReg)
  if (endReg) storage.registers.push(endReg)
  if (cp1Reg) storage.registers.push(cp1Reg)
  if (cp2Reg) storage.registers.push(cp2Reg)
}

function handleHoverLeave(ctx: ExtensionContext, _nodeId: string): void {
  destroyOverlay(ctx)
}

function destroyOverlay(ctx: ExtensionContext): void {
  const storage = ctx.storage as RelationshipStorage

  for (const reg of storage.registers) {
    reg.destroy()
  }
  storage.registers = []

  if (storage.overlayGroup) {
    storage.overlayGroup.destroy()
    storage.overlayGroup = null
  }

  storage.currentTargetId = null
}

// ==================== 扩展定义 ====================

export const RelationshipExtension = createExtension({
  name: 'relationship',
  type: 'extension',

  addStorage(): Record<string, unknown> {
    return {
      overlayGroup: null,
      currentTargetId: null,
      registers: [],
    } as RelationshipStorage
  },

  onCreate(ctx: ExtensionContext) {
    ctx.on('selection:hoverEnter', (data: unknown) => {
      const { nodeId } = data as { nodeId: string }
      handleHoverEnter(ctx, nodeId)
    })

    ctx.on('selection:hoverLeave', (data: unknown) => {
      const { nodeId } = data as { nodeId: string }
      handleHoverLeave(ctx, nodeId)
    })

    return () => {
      destroyOverlay(ctx)
    }
  },
})
