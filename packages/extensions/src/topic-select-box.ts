/**
 * TopicSelectBoxExtension — 主题宽度控制条扩展
 *
 * 功能（从旧 svgdraggable/topicselectbox.ts 迁移）：
 * - 选中 Topic 时显示左右宽度控制条
 * - 拖拽控制条调整主题自定义宽度
 * - 约束：最小宽度（默认 100）、最大宽度（1024）
 * - dragend 发出 topic:customWidthChanged 事件
 *
 * 依赖：
 * - DraggableRegister（拖拽逻辑）
 * - selection 事件（hover）
 */

import { Group, Rect } from 'leafer-ui'
import { createExtension } from '@tomind/core'
import { type ViewLike, getViewLike } from './shared-types'
import { DraggableRegister, type DragMoveInfo, type DragPosition } from './draggable'
import type { ExtensionContext } from '@tomind/core'
import type { SelectionEvents } from './selection'
import { findOne } from './shared-utils'

// ==================== 常量 ====================

/** 最大自定义宽度 */
const TOPIC_MAX_CUSTOM_WIDTH = 1024

/** 默认最小宽度 */
const DEFAULT_MIN_WIDTH = 100

/** 控制条尺寸 */
const BAR_WIDTH = 6
const BAR_HEIGHT = 20

// ==================== Storage 类型 ====================

interface TopicSelectBoxStorage extends Record<string, unknown> {
  leftRegister: DraggableRegister | null
  rightRegister: DraggableRegister | null
  overlayGroup: Group | null
  currentTargetId: string | null
}

// ==================== 工具函数 ====================

/** 递归查找命名的 Group */
function findNodeGroup(group: Group, nodeId: string): Group | null {
  const children: Group[] = group.children as Group[]
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
  const group = new Group({ name: `topic-select-box-${nodeId}` })

  // 左控制条
  const leftBar = new Rect({
    name: 'left-bar',
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    x: -BAR_WIDTH / 2,
    y: height / 2 - BAR_HEIGHT / 2,
    fill: '#4A90D9',
    cursor: 'ew-resize',
    opacity: 0.8,
  })
  group.add(leftBar)

  // 右控制条
  const rightBar = new Rect({
    name: 'right-bar',
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    x: width - BAR_WIDTH / 2,
    y: height / 2 - BAR_HEIGHT / 2,
    fill: '#4A90D9',
    cursor: 'ew-resize',
    opacity: 0.8,
  })
  group.add(rightBar)

  return group
}

// ==================== 拖拽逻辑 ====================

function setupBarDrag(
  ctx: ExtensionContext<any, any>,
  nodeId: string,
  overlay: Group,
  barName: 'left-bar' | 'right-bar',
  startWidth: number,
  minWidth: number,
): DraggableRegister | null {
  const bar = findOne<Rect>(overlay, barName)
  if (!bar) return null

  const isLeft = barName === 'left-bar'

  const reg = new DraggableRegister(bar, {
    showShadow: false,
    allowMouseDownPropagation: false,
  })

  let startTopicWidth = startWidth
  let startClientX = 0

  reg.dragStart((_pos, e) => {
    startTopicWidth = startWidth
    startClientX = e instanceof MouseEvent ? e.clientX : e.touches[0]?.clientX ?? 0
  })

  reg.dragMove((info: DragMoveInfo, _e: MouseEvent | TouchEvent) => {
    const delta = isLeft ? -info.deltaX : info.deltaX
    let newWidth = startTopicWidth + delta

    // 约束
    if (newWidth > TOPIC_MAX_CUSTOM_WIDTH) {
      newWidth = TOPIC_MAX_CUSTOM_WIDTH
    } else if (newWidth < minWidth) {
      newWidth = minWidth
    }

    // 更新控制条位置
    if (isLeft) {
      const actualDelta = newWidth - startTopicWidth
      bar.x = -BAR_WIDTH / 2 - actualDelta
    } else {
      bar.x = newWidth - BAR_WIDTH / 2
    }
  })

  reg.dragEnd((pos: DragPosition, _e: MouseEvent | TouchEvent) => {
    const currentClientX = pos.x ?? 0
    const rawDelta = currentClientX - startClientX
    const delta = isLeft ? -rawDelta : rawDelta
    let newWidth = startTopicWidth + delta

    if (newWidth > TOPIC_MAX_CUSTOM_WIDTH) {
      newWidth = TOPIC_MAX_CUSTOM_WIDTH
    } else if (newWidth < minWidth) {
      newWidth = minWidth
    }

    ctx.emit('topic:customWidthChanged', {
      nodeId,
      customWidth: newWidth,
    })
  })

  return reg
}

// ==================== Hover 处理 ====================

function handleHoverEnter(ctx: ExtensionContext<TopicSelectBoxStorage>, nodeId: string): void {
  const storage = ctx.storage
  const state = ctx.getState<any>()
  if (!state) return

  const node = state.nodes?.get(nodeId)
  if (!node || node.type !== 'topic') return

  const view = getViewLike(ctx)
  const layoutEngine = view?.layoutEngine
  if (!layoutEngine) return

  const layoutResult = layoutEngine.getLayoutResult()
  const nodeLayout = layoutResult?.nodes?.get(nodeId)
  if (!nodeLayout) return

  // 获取 topic 节点的 LeaferJS Group
  const rootGroup = view?.leaferView?.parent
  if (!rootGroup) return

  const topicGroup = findNodeGroup(rootGroup, nodeId)
  if (!topicGroup) return

  const width = nodeLayout.width ?? 100
  const height = nodeLayout.height ?? 40
  const minWidth = node.attrs?.minimumWidth ?? DEFAULT_MIN_WIDTH

  // 创建 overlay
  const overlay = createOverlay(nodeId, width, height)
  storage.overlayGroup = overlay
  storage.currentTargetId = nodeId

  // 位置：相对于 topic Group 的父级
  const parentGroup = topicGroup.parent
  if (parentGroup) {
    parentGroup.add(overlay)
  }

  // 创建左右控制条的拖拽器
  storage.leftRegister = setupBarDrag(ctx, nodeId, overlay, 'left-bar', width, minWidth)
  storage.rightRegister = setupBarDrag(ctx, nodeId, overlay, 'right-bar', width, minWidth)
}

function handleHoverLeave(ctx: ExtensionContext<TopicSelectBoxStorage>, _nodeId: string): void {
  destroyOverlay(ctx)
}

function destroyOverlay(ctx: ExtensionContext<TopicSelectBoxStorage>): void {
  const storage = ctx.storage

  storage.leftRegister?.destroy()
  storage.leftRegister = null

  storage.rightRegister?.destroy()
  storage.rightRegister = null

  if (storage.overlayGroup) {
    storage.overlayGroup.destroy()
    storage.overlayGroup = null
  }

  storage.currentTargetId = null
}

// ==================== 扩展定义 ====================

export const TopicSelectBoxExtension = createExtension<Record<string, unknown>, TopicSelectBoxStorage, SelectionEvents>({
  name: 'topic-select-box',
  type: 'extension',

  addStorage(): TopicSelectBoxStorage {
    return {
      leftRegister: null,
      rightRegister: null,
      overlayGroup: null,
      currentTargetId: null,
    } as TopicSelectBoxStorage
  },

  onCreate(ctx) {
    ctx.on('selection:hoverEnter', ({ nodeId }) => {
      handleHoverEnter(ctx, nodeId)
    })

    ctx.on('selection:hoverLeave', ({ nodeId }) => {
      handleHoverLeave(ctx, nodeId)
    })

    return () => {
      destroyOverlay(ctx)
    }
  },
})
