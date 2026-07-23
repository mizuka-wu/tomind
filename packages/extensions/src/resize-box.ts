/**
 * ResizeBoxExtension — 图片调整大小扩展
 *
 * 功能（从旧 svgdraggable/resizebox.ts 迁移）：
 * - hover ImageNodeViewDesc 时显示 8 方向 resize 锚点
 * - 拖拽锚点调整图片大小（支持旋转补偿、最小/最大尺寸）
 * - dragend 发出 resize:changed 事件
 *
 * 依赖：
 * - DraggableRegister（拖拽逻辑）
 * - selection 事件（hover）
 */

import { Group, Rect } from 'leafer-ui'
import { createExtension } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'

// ==================== 类型安全辅助 ====================

/** 从 ExtensionContext.storage 安全提取类型化存储 */
function typedStorage<T>(ctx: ExtensionContext): T {
  return ctx.storage as T
}
import { DraggableRegister, type DragMoveInfo } from './draggable'

// ==================== 常量 ====================

/** 图片最大尺寸（像素） */
const IMAGE_MAX_SIZE = 2000

/** 最小尺寸 */
const MIN_SIZE = 20

/** 锚点尺寸 */
const ANCHOR_SIZE = 16
const ANCHOR_BTN_SIZE = 7
const ANCHOR_BTN_MARGIN = (ANCHOR_SIZE - ANCHOR_BTN_SIZE) / 2

// ==================== 类型 ====================

type Direction = 'lt' | 'lm' | 'lb' | 'ct' | 'cb' | 'rt' | 'rm' | 'rb'

/** 扩展 storage 类型 */
interface ResizeBoxStorage extends Record<string, unknown> {
  anchorRegisters: DraggableRegister[]
  overlayGroup: Group | null
}

// ==================== 工具常量 ====================

/** 对角锚点映射 */
const DirectOpposite: Record<Direction, Direction> = {
  lt: 'rb', lm: 'rm', lb: 'rt',
  ct: 'cb', cb: 'ct',
  rt: 'lb', rm: 'lm', rb: 'lt',
}

/** 锚点光标 */
const CursorMap: Record<Direction, string> = {
  lt: 'nwse-resize', lb: 'nesw-resize',
  rt: 'nesw-resize', rb: 'nwse-resize',
  lm: 'ew-resize', rm: 'ew-resize',
  ct: 'ns-resize', cb: 'ns-resize',
}

/** 方向系数：l/t = -1, c/m = 0, r/b = 1 */
const F: Record<string, number> = { l: -1, c: 0, r: 1, t: -1, m: 0, b: 1 }

// ==================== 工具函数 ====================

/** 获取某方向在矩形中的位置 */
function getCornerPosition(
  direction: Direction,
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: (direction[0] === 'l' ? 0 : direction[0] === 'r' ? width : width / 2),
    y: (direction[1] === 't' ? 0 : direction[1] === 'b' ? height : height / 2),
  }
}

/** 递归查找命名的 Group */
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

// ==================== Overlay 创建 ====================

function createOverlay(nodeId: string, width: number, height: number): Group {
  const group = new Group({ name: `resize-box-${nodeId}` })

  // 边框
  const box = new Rect({
    width,
    height,
    stroke: '#4A90D9',
    strokeWidth: 1,
    fill: 'rgba(74, 144, 217, 0.05)',
  })
  group.add(box)

  // 8 方向锚点
  const pos = { l: 0, m: height / 2, r: width, t: 0, c: width / 2, b: height }
  const anchorKeys: Direction[] = ['lt', 'lm', 'lb', 'ct', 'cb', 'rt', 'rm', 'rb']

  for (const key of anchorKeys) {
    const cursor = CursorMap[key]
    const anchorGroup = new Group({ name: `anchor-${key}`, cursor })
    group.add(anchorGroup)

    // 动作区域
    const actionArea = new Rect({
      width: ANCHOR_SIZE,
      height: ANCHOR_SIZE,
      opacity: 0,
    })
    anchorGroup.add(actionArea)

    // 锚点按钮
    const btn = new Rect({
      width: ANCHOR_BTN_SIZE,
      height: ANCHOR_BTN_SIZE,
      x: ANCHOR_BTN_MARGIN,
      y: ANCHOR_BTN_MARGIN,
      fill: '#fff',
      stroke: '#4A90D9',
      strokeWidth: 1,
    })
    anchorGroup.add(btn)

    // 位置
    anchorGroup.set({
      x: -ANCHOR_SIZE / 2 + pos[key[0] as keyof typeof pos],
      y: -ANCHOR_SIZE / 2 + pos[key[1] as keyof typeof pos],
    })
  }

  return group
}

// ==================== 拖拽逻辑 ====================

function setupAnchorDrag(
  ctx: ExtensionContext,
  nodeId: string,
  overlay: Group,
  startWidth: number,
  startHeight: number,
  rotation: number,
): void {
  const storage = typedStorage<ResizeBoxStorage>(ctx)
  const registers: DraggableRegister[] = []
  const anchorKeys: Direction[] = ['lt', 'lm', 'lb', 'ct', 'cb', 'rt', 'rm', 'rb']

  // 拖拽状态
  let fixPt = { x: 0, y: 0 }
  let dragPt = { x: 0, y: 0 }
  let cosA = 1
  let sinA = 0

  if (rotation) {
    const rad = (rotation / 180) * Math.PI
    cosA = Math.cos(rad)
    sinA = Math.sin(rad)
  }

  for (const dir of anchorKeys) {
    const anchorGroup = overlay.findOne(`anchor-${dir}`) as Group
    if (!anchorGroup) continue

    const reg = new DraggableRegister(anchorGroup, {
      showShadow: false,
      allowMouseDownPropagation: false,
    })

    reg.dragStart(() => {
      const oldPt = getCornerPosition(dir, startWidth, startHeight)
      const oppDir = DirectOpposite[dir]
      fixPt = getCornerPosition(oppDir, startWidth, startHeight)
      dragPt = { x: oldPt.x, y: oldPt.y }
    })

    reg.dragMove((info: DragMoveInfo) => {
      let cursorPos: { x: number; y: number }

      if (rotation) {
        const rdx = info.deltaX * cosA + info.deltaY * sinA
        const rdy = -info.deltaX * sinA + info.deltaY * cosA
        cursorPos = { x: dragPt.x + rdx, y: dragPt.y + rdy }
      } else {
        cursorPos = { x: dragPt.x + info.deltaX, y: dragPt.y + info.deltaY }
      }

      const fd = F[dir[0]]
      const fe = F[dir[1]]

      let newWidth = Math.max(MIN_SIZE, fd * (cursorPos.x - fixPt.x)) || startWidth
      let newHeight = Math.max(MIN_SIZE, fe * (cursorPos.y - fixPt.y)) || startHeight

      // 最大尺寸约束
      const maxLen = Math.max(newWidth, newHeight)
      if (maxLen > IMAGE_MAX_SIZE) {
        const ratio = newWidth / newHeight
        if (newWidth > newHeight) {
          newWidth = IMAGE_MAX_SIZE
          newHeight = newWidth / ratio
        } else {
          newHeight = IMAGE_MAX_SIZE
          newWidth = newHeight * ratio
        }
      }

      // 更新 overlay 边框
      const box = overlay.findOne('') as Rect
      if (box) {
        box.set({ width: newWidth, height: newHeight })
      }

      // 更新锚点位置
      const newPos = { l: 0, m: newHeight / 2, r: newWidth, t: 0, c: newWidth / 2, b: newHeight }
      for (const k of anchorKeys) {
        const ag = overlay.findOne(`anchor-${k}`) as Group
        if (ag) {
          ag.set({
            x: -ANCHOR_SIZE / 2 + newPos[k[0] as keyof typeof newPos],
            y: -ANCHOR_SIZE / 2 + newPos[k[1] as keyof typeof newPos],
          })
        }
      }

      dragPt = { x: cursorPos.x, y: cursorPos.y }
    })

    reg.dragEnd(() => {
      const box = overlay.findOne('') as Rect
      if (!box) return

      const finalWidth = box.width ?? startWidth
      const finalHeight = box.height ?? startHeight

      ctx.emit('resize:changed', {
        nodeId,
        width: finalWidth,
        height: finalHeight,
      })
    })

    registers.push(reg)
  }

  storage.anchorRegisters = registers
}

// ==================== Hover 处理 ====================

function handleHoverEnter(ctx: ExtensionContext, nodeId: string): void {
  const storage = typedStorage<ResizeBoxStorage>(ctx)
  const state = ctx.getState() as any
  if (!state) return

  const node = state.nodes?.get(nodeId)
  if (!node || node.type !== 'image') return

  const view = ctx.getView() as any
  const layoutEngine = view?.layoutEngine
  if (!layoutEngine) return

  const layoutResult = layoutEngine.getLayoutResult()
  const nodeLayout = layoutResult?.nodes?.get(nodeId)
  if (!nodeLayout) return

  // 获取图片节点的 LeaferJS Group
  const rootGroup = view?.leaferView?.parent
  if (!rootGroup) return

  const imageGroup = findNodeGroup(rootGroup, nodeId)
  if (!imageGroup) return

  const width = nodeLayout.width ?? 100
  const height = nodeLayout.height ?? 100
  const rotation = node.attrs?.rotation ?? 0

  // 创建 overlay
  const overlay = createOverlay(nodeId, width, height)
  storage.overlayGroup = overlay

  // 位置：相对于图片 Group 的父级
  const parentGroup = imageGroup.parent
  if (parentGroup) {
    parentGroup.add(overlay)
  }

  setupAnchorDrag(ctx, nodeId, overlay, width, height, rotation)
}

function handleHoverLeave(ctx: ExtensionContext, _nodeId: string): void {
  destroyOverlay(ctx)
}

function destroyOverlay(ctx: ExtensionContext): void {
  const storage = typedStorage<ResizeBoxStorage>(ctx)

  for (const reg of storage.anchorRegisters) {
    reg.destroy()
  }
  storage.anchorRegisters = []

  if (storage.overlayGroup) {
    storage.overlayGroup.destroy()
    storage.overlayGroup = null
  }
}

// ==================== 扩展定义 ====================

export const ResizeBoxExtension = createExtension({
  name: 'resize-box',
  type: 'extension',

  addStorage(): Record<string, unknown> {
    return {
      anchorRegisters: [],
      overlayGroup: null,
    } as ResizeBoxStorage
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
