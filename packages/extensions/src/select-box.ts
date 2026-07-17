/**
 * SelectBoxExtension — Summary/Boundary 选择框扩展
 *
 * 从旧 svgdraggable/view/selectbox.ts（883行）迁移：
 * - Summary/Boundary 选择框渲染（圆角矩形 + 控制条）
 * - 4方向拖拽调整范围（UP/DOWN/LEFT/RIGHT）
 * - 状态机（NORMAL → HOVER → SELECT → DRAG → DEFOCUS）
 *
 * 已修复 TODO:
 * - transitionState 根据状态更新视觉（选中蓝色 + 显示控制条 / 失焦灰色 + 隐藏控制条）
 * - dragEnd 反算 rangeStart/rangeEnd 并发出 rangeChanged 事件
 * - getSelectBoxSize 从 layoutResult 遍历子节点计算 bounding box
 */

import { Group, Path } from 'leafer-ui'
import { createExtension } from '@tomind/core'
import { DraggableRegister, type DragMoveInfo, type DragPosition } from './draggable'
import type { ExtensionContext } from '@tomind/core'

// ==================== 常量 ====================

const SELECT_BOX_COLOR = '#2ebdff'
const SELECT_BOX_DEFOCUS_COLOR = '#9f9f9f'
const CONTROL_BOX_LENGTH = 7
const CONTROL_BOX_FILLCOLOR = '#ffffff'
const CONTROL_BOX_PADDING = 2
const CONTROL_BOX_STROKE_WIDTH = 2
const CONTROL_BOX_RADIUS = 4

type Direction = 'up' | 'down' | 'left' | 'right' | 'UD' | 'LR'

// ==================== Storage ====================

interface SelectBoxStorage extends Record<string, unknown> {
  overlayGroup: Group | null
  currentTargetId: string | null
  state: 'normal' | 'hover' | 'select' | 'drag' | 'defocus'
  registers: DraggableRegister[]
  lastSize: { x: number; y: number; width: number; height: number } | null
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

/** 获取节点的所有子 branch */
function getChildBranches(state: any, nodeId: string): any[] {
  const node = state.nodes?.get(nodeId)
  if (!node) return []
  const children: any[] = []
  for (const key of Object.keys(node.children ?? {})) {
    for (const child of node.children[key] ?? []) {
      if (child.type === 'topic') {
        children.push(child)
      }
    }
  }
  return children
}

// ==================== SVG Path 生成 ====================

/**
 * 生成圆角矩形 SVG path
 * 对应旧系统 generateBoxPath()
 */
function generateBoxPath(
  x: number,
  y: number,
  width: number,
  height: number,
): string {
  const px = CONTROL_BOX_PADDING
  const py = CONTROL_BOX_PADDING
  const r = CONTROL_BOX_RADIUS

  const x0 = x - px
  const y0 = y - py
  const x1 = x + width + px
  const y1 = y + height + py

  return [
    `M ${x0 + r} ${y0}`,
    `L ${x1 - r} ${y0}`,
    `Q ${x1} ${y0} ${x1} ${y0 + r}`,
    `L ${x1} ${y1 - r}`,
    `Q ${x1} ${y1} ${x1 - r} ${y1}`,
    `L ${x0 + r} ${y1}`,
    `Q ${x0} ${y1} ${x0} ${y1 - r}`,
    `L ${x0} ${y0 + r}`,
    `Q ${x0} ${y0} ${x0 + r} ${y0}`,
    'z',
  ].join(' ')
}

/**
 * 生成控制条 path（方块 + 连接线）
 * 对应旧系统 generateControlBarPath()
 */
function generateControlBarPath(
  direction: Direction,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number,
): string {
  const px = CONTROL_BOX_PADDING
  const py = CONTROL_BOX_PADDING
  const bw = boxWidth + px * 2
  const bh = boxHeight + py * 2
  const halfW = bw / 2
  const halfH = bh / 2
  const len = CONTROL_BOX_LENGTH

  let barX = 0, barY = 0
  let lineStartX = 0, lineStartY = 0
  let lineEndX = 0, lineEndY = 0

  const bx = boxX - px
  const by = boxY - py

  switch (direction) {
    case 'up':
      barX = bx + halfW - len / 2
      barY = by
      lineStartX = bx + CONTROL_BOX_RADIUS
      lineStartY = by
      lineEndX = bx + bw - CONTROL_BOX_RADIUS
      lineEndY = by
      break
    case 'down':
      barX = bx + halfW - len / 2
      barY = by + bh
      lineStartX = bx + CONTROL_BOX_RADIUS
      lineStartY = by + bh
      lineEndX = bx + bw - CONTROL_BOX_RADIUS
      lineEndY = by + bh
      break
    case 'left':
      barX = bx
      barY = by + halfH - len / 2
      lineStartX = bx
      lineStartY = by + CONTROL_BOX_RADIUS
      lineEndX = bx
      lineEndY = by + bh - CONTROL_BOX_RADIUS
      break
    case 'right':
      barX = bx + bw
      barY = by + halfH - len / 2
      lineStartX = bx + bw
      lineStartY = by + CONTROL_BOX_RADIUS
      lineEndX = bx + bw
      lineEndY = by + bh - CONTROL_BOX_RADIUS
      break
  }

  const isUD = direction === 'up' || direction === 'down'
  const bar = `M ${barX} ${barY} L ${barX} ${barY + len} L ${barX + len} ${barY + len} L ${barX + len} ${barY} Z`

  if (isUD) {
    return `${bar} M ${lineStartX} ${lineStartY} L ${barX} ${lineStartY} M ${barX + len} ${lineEndY} L ${lineEndX} ${lineEndY}`
  } else {
    return `${bar} M ${lineStartX} ${lineStartY} L ${lineStartX} ${barY} M ${lineEndX} ${barY + len} L ${lineEndX} ${lineEndY}`
  }
}

// ==================== 尺寸计算 ====================

/**
 * 计算选择框尺寸
 * Boundary: 直接用节点尺寸
 * Summary: 遍历 rangeStart..rangeEnd 范围内的子节点计算 bounding box
 *
 * 旧系统 rangeStart/rangeEnd 是 model 上的范围索引
 * 新系统从 node.attrs 获取 rangeStart/rangeEnd
 */
function getSelectBoxSize(
  state: any,
  nodeId: string,
  direction: Direction,
): { x: number; y: number; width: number; height: number; rangeStart: number; rangeEnd: number } {
  const node = state.nodes?.get(nodeId)
  if (!node) return { x: 0, y: 0, width: 100, height: 60, rangeStart: 0, rangeEnd: 0 }

  const layoutResult = (state as any)._layoutResult
  const nodeLayout = layoutResult?.nodes?.get(nodeId)

  // Boundary: 直接用节点尺寸
  if (node.type === 'boundary') {
    if (nodeLayout) {
      return {
        x: nodeLayout.x ?? 0,
        y: nodeLayout.y ?? 0,
        width: nodeLayout.width ?? 100,
        height: nodeLayout.height ?? 60,
        rangeStart: 0,
        rangeEnd: 0,
      }
    }
    return { x: 0, y: 0, width: 100, height: 60, rangeStart: 0, rangeEnd: 0 }
  }

  // Summary: 遍历子节点计算 bounding box
  const children = getChildBranches(state, nodeId)
  if (children.length === 0) {
    return { x: 0, y: 0, width: 100, height: 60, rangeStart: 0, rangeEnd: 0 }
  }

  // rangeStart/rangeEnd 从 node.attrs 获取（旧 model.rangeStart/rangeEnd）
  const rangeStart = node.attrs?.rangeStart ?? 0
  const rangeEnd = node.attrs?.rangeEnd ?? children.length - 1

  let minX = Infinity, minY = Infinity
  let maxX = -Infinity, maxY = -Infinity

  // 只遍历 rangeStart..rangeEnd 范围内的子节点
  const clampedStart = Math.max(0, Math.min(rangeStart, children.length - 1))
  const clampedEnd = Math.max(clampedStart, Math.min(rangeEnd, children.length - 1))

  for (let i = clampedStart; i <= clampedEnd; i++) {
    const child = children[i]
    if (!child) continue
    const childLayout = layoutResult?.nodes?.get(child.id)
    if (childLayout) {
      minX = Math.min(minX, childLayout.x ?? 0)
      minY = Math.min(minY, childLayout.y ?? 0)
      maxX = Math.max(maxX, (childLayout.x ?? 0) + (childLayout.width ?? 50))
      maxY = Math.max(maxY, (childLayout.y ?? 0) + (childLayout.height ?? 30))
    }
  }

  if (minX === Infinity) {
    return { x: 0, y: 0, width: 100, height: 60, rangeStart: clampedStart, rangeEnd: clampedEnd }
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    rangeStart: clampedStart,
    rangeEnd: clampedEnd,
  }
}

// ==================== Overlay 创建 ====================

function createSelectBoxOverlay(
  _nodeId: string,
  size: { x: number; y: number; width: number; height: number },
  direction: Direction,
): Group {
  const group = new Group({ name: 'select-box-overlay' })
  const isUD = direction === 'UD' || direction === 'up' || direction === 'down'

  // 选择框边框 (Path)
  const boxPath = generateBoxPath(size.x, size.y, size.width, size.height)
  const box = new Path({
    name: 'select-box',
    path: boxPath,
    stroke: SELECT_BOX_COLOR,
    strokeWidth: CONTROL_BOX_STROKE_WIDTH,
    fill: 'none',
  })
  group.add(box)

  // 控制条 1 (bar one)
  const bar1Dir = isUD ? 'up' : 'left'
  const bar1Path = generateControlBarPath(bar1Dir, size.x, size.y, size.width, size.height)
  const bar1 = new Path({
    name: 'bar-one',
    path: bar1Path,
    stroke: SELECT_BOX_COLOR,
    strokeWidth: CONTROL_BOX_STROKE_WIDTH,
    fill: CONTROL_BOX_FILLCOLOR,
    cursor: isUD ? 'row-resize' : 'col-resize',
  })
  group.add(bar1)

  // 控制条 2 (bar two)
  const bar2Dir = isUD ? 'down' : 'right'
  const bar2Path = generateControlBarPath(bar2Dir, size.x, size.y, size.width, size.height)
  const bar2 = new Path({
    name: 'bar-two',
    path: bar2Path,
    stroke: SELECT_BOX_COLOR,
    strokeWidth: CONTROL_BOX_STROKE_WIDTH,
    fill: CONTROL_BOX_FILLCOLOR,
    cursor: isUD ? 'row-resize' : 'col-resize',
  })
  group.add(bar2)

  return group
}

// ==================== 视觉更新 ====================

/** 根据当前状态更新 overlayGroup 视觉 */
function applyVisualState(storage: SelectBoxStorage): void {
  const overlay = storage.overlayGroup
  if (!overlay) return

  const box = overlay.findOne('select-box') as Path
  const bar1 = overlay.findOne('bar-one') as Path
  const bar2 = overlay.findOne('bar-two') as Path

  switch (storage.state) {
    case 'select':
    case 'drag':
      // 选中/拖拽: 蓝色边框 + 显示控制条
      if (box) {
        box.set({ stroke: SELECT_BOX_COLOR, strokeOpacity: 1 })
      }
      if (bar1) bar1.set({ opacity: 1 })
      if (bar2) bar2.set({ opacity: 1 })
      break

    case 'defocus':
      // 失焦: 灰色边框 + 隐藏控制条
      if (box) {
        box.set({ stroke: SELECT_BOX_DEFOCUS_COLOR, strokeOpacity: 1 })
      }
      if (bar1) bar1.set({ opacity: 0 })
      if (bar2) bar2.set({ opacity: 0 })
      break

    case 'normal':
    case 'hover':
    default:
      // 未选中: 隐藏整个 overlay
      overlay.set({ visible: false })
      break
  }
}

// ==================== 拖拽逻辑 ====================

/**
 * 从拖拽后的视觉位置反算新的 rangeStart/rangeEnd
 * 根据最终 box 的覆盖区域，判断哪些子节点在范围内
 */
function computeRangeFromDragResult(
  state: any,
  nodeId: string,
  finalSize: { x: number; y: number; width: number; height: number },
  direction: Direction,
): { rangeStart: number; rangeEnd: number } {
  const children = getChildBranches(state, nodeId)
  if (children.length === 0) return { rangeStart: 0, rangeEnd: 0 }

  const layoutResult = (state as any)._layoutResult
  const isUD = direction === 'UD' || direction === 'up' || direction === 'down'

  // 根据方向收集子节点的轴向位置
  // UD: 用 y 轴判断范围
  // LR: 用 x 轴判断范围
  const axis = isUD ? 'y' : 'x'
  const sizeAxis = isUD ? 'height' : 'width'

  const boxStart = finalSize[axis]
  const boxEnd = finalSize[axis] + finalSize[sizeAxis]

  const childRanges: { index: number; start: number; end: number }[] = []
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const childLayout = layoutResult?.nodes?.get(child.id)
    if (childLayout) {
      const childStart = (childLayout[axis] ?? 0)
      const childEnd = childStart + (childLayout[sizeAxis] ?? 0)
      childRanges.push({ index: i, start: childStart, end: childEnd })
    }
  }

  if (childRanges.length === 0) return { rangeStart: 0, rangeEnd: 0 }

  // 找到被 box 覆盖的子节点范围
  let newStart = childRanges.length
  let newEnd = -1

  for (const cr of childRanges) {
    // 节点中心在 box 范围内则纳入
    const center = (cr.start + cr.end) / 2
    if (center >= boxStart && center <= boxEnd) {
      newStart = Math.min(newStart, cr.index)
      newEnd = Math.max(newEnd, cr.index)
    }
  }

  // 至少保留一个节点
  if (newStart > newEnd) {
    newStart = 0
    newEnd = Math.max(0, children.length - 1)
  }

  return { rangeStart: newStart, rangeEnd: newEnd }
}

function setupBarDrag(
  ctx: ExtensionContext,
  nodeId: string,
  overlay: Group,
  barName: 'bar-one' | 'bar-two',
  size: { x: number; y: number; width: number; height: number },
  direction: Direction,
): DraggableRegister | null {
  const bar = overlay.findOne(barName) as Path
  if (!bar) return null

  const isUD = direction === 'UD' || direction === 'up' || direction === 'down'
  const isBarOne = barName === 'bar-one'

  const reg = new DraggableRegister(bar, {
    showShadow: false,
    allowMouseDownPropagation: false,
  })

  let startSize = { ...size }

  reg.dragStart(() => {
    startSize = { ...size }
    transitionState(ctx.storage as SelectBoxStorage, 'drag')
  })

  reg.dragMove((info: DragMoveInfo, _e: MouseEvent | TouchEvent) => {
    const compareDir = isUD ? info.deltaY : info.deltaX
    let newWidth: number
    let newHeight: number
    let offsetX = 0
    let offsetY = 0

    if (isUD) {
      newWidth = startSize.width
      newHeight = isBarOne
        ? startSize.height - compareDir
        : startSize.height + compareDir
      if (isBarOne) offsetY = compareDir
    } else {
      newWidth = isBarOne
        ? startSize.width - compareDir
        : startSize.width + compareDir
      newHeight = startSize.height
      if (isBarOne) offsetX = compareDir
    }

    // 最小尺寸
    if (newWidth < 20) newWidth = 20
    if (newHeight < 20) newHeight = 20

    // 更新路径
    const newX = startSize.x + offsetX
    const newY = startSize.y + offsetY
    const newBoxPath = generateBoxPath(newX, newY, newWidth, newHeight)

    const box = overlay.findOne('select-box') as Path
    if (box) box.path = newBoxPath

    // 更新控制条
    const bar1Dir = isUD ? 'up' : 'left'
    const bar2Dir = isUD ? 'down' : 'right'
    const bar1Path = generateControlBarPath(bar1Dir, newX, newY, newWidth, newHeight)
    const bar2Path = generateControlBarPath(bar2Dir, newX, newY, newWidth, newHeight)
    const b1 = overlay.findOne('bar-one') as Path
    const b2 = overlay.findOne('bar-two') as Path
    if (b1) b1.path = bar1Path
    if (b2) b2.path = bar2Path

    // 保存最终尺寸
    ;(ctx.storage as SelectBoxStorage).lastSize = { x: newX, y: newY, width: newWidth, height: newHeight }
  })

  reg.dragEnd((_pos: DragPosition, _e: MouseEvent | TouchEvent) => {
    transitionState(ctx.storage as SelectBoxStorage, 'dragEnd')

    // 从拖拽结果反算 rangeStart/rangeEnd
    const storage = ctx.storage as SelectBoxStorage
    const state = ctx.getState() as any
    if (state && storage.lastSize) {
      const rangeResult = computeRangeFromDragResult(state, nodeId, storage.lastSize, direction)
      ctx.emit('selectBox:rangeChanged', {
        nodeId,
        rangeStart: rangeResult.rangeStart,
        rangeEnd: rangeResult.rangeEnd,
        direction,
      })
    }
  })

  return reg
}

// ==================== 状态机 ====================

function transitionState(storage: SelectBoxStorage, event: string): void {
  const s = storage.state
  switch (event) {
    case 'hover':
      if (s === 'normal') storage.state = 'hover'
      break
    case 'select':
      if (s === 'normal' || s === 'hover' || s === 'defocus') storage.state = 'select'
      break
    case 'deselect':
      storage.state = 'normal'
      break
    case 'out':
      if (s === 'hover') storage.state = 'normal'
      break
    case 'drag':
      if (s === 'select') storage.state = 'drag'
      break
    case 'dragEnd':
      if (s === 'drag') storage.state = 'select'
      break
    case 'defocus':
      if (s === 'select') storage.state = 'defocus'
      break
  }

  // 根据状态更新视觉
  applyVisualState(storage)
}

// ==================== Hover 处理 ====================

function handleHoverEnter(ctx: ExtensionContext, nodeId: string): void {
  const storage = ctx.storage as SelectBoxStorage
  const state = ctx.getState() as any
  if (!state) return

  const node = state.nodes?.get(nodeId)
  if (!node || (node.type !== 'summary' && node.type !== 'boundary')) return

  const view = ctx.getView() as any
  const layoutEngine = view?.layoutEngine
  if (!layoutEngine) return

  const layoutResult = layoutEngine.getLayoutResult()
  // 注入 layoutResult 到 state 供 getSelectBoxSize 使用
  state._layoutResult = layoutResult

  // 方向：从节点 attrs 获取，默认 'UD'
  const direction: Direction = (node.attrs?.direction as Direction) || 'UD'

  const size = getSelectBoxSize(state, nodeId, direction)

  const rootGroup = view?.leaferView?.parent
  if (!rootGroup) return

  const targetGroup = findNodeGroup(rootGroup, nodeId)
  if (!targetGroup) return

  // 创建 overlay
  const overlay = createSelectBoxOverlay(nodeId, size, direction)
  storage.overlayGroup = overlay
  storage.currentTargetId = nodeId
  storage.lastSize = size

  const parentGroup = targetGroup.parent
  if (parentGroup) {
    parentGroup.add(overlay)
  }

  // 注册控制条拖拽
  const bar1Reg = setupBarDrag(ctx, nodeId, overlay, 'bar-one', size, direction)
  const bar2Reg = setupBarDrag(ctx, nodeId, overlay, 'bar-two', size, direction)
  if (bar1Reg) storage.registers.push(bar1Reg)
  if (bar2Reg) storage.registers.push(bar2Reg)

  transitionState(storage, 'select')
}

function handleHoverLeave(ctx: ExtensionContext, _nodeId: string): void {
  const storage = ctx.storage as SelectBoxStorage
  transitionState(storage, 'deselect')
  destroyOverlay(ctx)
}

function destroyOverlay(ctx: ExtensionContext): void {
  const storage = ctx.storage as SelectBoxStorage

  for (const reg of storage.registers) {
    reg.destroy()
  }
  storage.registers = []

  if (storage.overlayGroup) {
    storage.overlayGroup.destroy()
    storage.overlayGroup = null
  }

  storage.currentTargetId = null
  storage.lastSize = null
}

// ==================== 扩展定义 ====================

export const SelectBoxExtension = createExtension({
  name: 'select-box',
  type: 'extension',

  addStorage(): Record<string, unknown> {
    return {
      overlayGroup: null,
      currentTargetId: null,
      state: 'normal',
      registers: [],
      lastSize: null,
    } as SelectBoxStorage
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
