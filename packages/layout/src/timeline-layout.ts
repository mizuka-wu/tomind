// TODO: 与 XMind timeline 交替上下/左右排列验证
// TODO: 时间线轴线偏移量
/**
 * Timeline 布局 — 时间线
 *
 * 节点沿水平/垂直轴排列，子节点挂在时间线上方/下方（或左右）
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { getTitle, getFontSize, isCollapsed, getAttachedChildren, findRootTopic } from './layout-utils'
import { measureStyledSubtree } from './spacing-utils'
type NodeSize = import('./layout-utils').SimpleNodeSize

function getSpacing(node: NodeDesc, key: 'spacingMajor' | 'spacingMinor', fallback: number, styleEngine: StyleEngine | null, state: SheetState | null): number {
  if (styleEngine && state) {
    const val = styleEngine.getStyleValue(state, node.id, key)
    if (typeof val === 'number') return val
  }
  return fallback
}

/** 递归计算子树总高度（垂直方向的总跨度） */
function subtreeTotalHeight(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine: StyleEngine | null, state: SheetState | null, gapKey: 'spacingMajor' | 'spacingMinor'): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.height
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.height
  let total = 0
  for (let i = 0; i < children.length; i++) {
    total += subtreeTotalHeight(children[i], options, sizeMap, styleEngine, state, gapKey)
    if (i < children.length - 1) total += getSpacing(node, gapKey, options.verticalGap, styleEngine, state)
  }
  return Math.max(size.height, total)
}

/** 递归计算子树总宽度（水平方向的总跨度） */
function subtreeTotalWidth(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine: StyleEngine | null, state: SheetState | null, gapKey: 'spacingMajor' | 'spacingMinor'): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.width
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.width
  let maxChildWidth = 0
  for (const child of children) {
    maxChildWidth = Math.max(maxChildWidth, subtreeTotalWidth(child, options, sizeMap, styleEngine, state, gapKey))
  }
  return size.width + getSpacing(node, gapKey, options.horizontalGap, styleEngine, state) + maxChildWidth
}

// ─── 水平时间线 ───

function layoutTimelineHorizontal(
  node: NodeDesc,
  x: number,
  y: number,
  parent: NodeDesc | null,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  /**
   * 'axis'：时间轴层，子项沿水平线排（对齐 TIMELINEHORIZONTAL）
   * 'up'/'down'：子树纵向堆叠（对齐 TIMELINEHORIZONTALUP/DOWN）
   */
  mode: 'axis' | 'up' | 'down' = 'axis',
): void {
  const size = sizeMap.get(node.id)!
  const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node), options)

  const children = getAttachedChildren(node)
  const gapKey = mode === 'axis' ? 'spacingMinor' : 'spacingMajor'
  let branchHeight = size.height
  if (!isCollapsed(node) && children.length > 0) {
    if (mode === 'axis') {
      // 轴层：上下两侧交替
      let topH = 0
      let bottomH = 0
      for (let i = 0; i < children.length; i++) {
        const h = subtreeTotalHeight(children[i], options, sizeMap, styleEngine, state, 'spacingMinor')
        if (i % 2 === 0) topH = Math.max(topH, h)
        else bottomH = Math.max(bottomH, h)
      }
      branchHeight = topH + size.height + bottomH + getSpacing(node, 'spacingMinor', options.verticalGap, styleEngine, state) * 2
    } else {
      // 纵向堆叠：所有子项同侧
      let total = 0
      for (let i = 0; i < children.length; i++) {
        total += subtreeTotalHeight(children[i], options, sizeMap, styleEngine, state, 'spacingMajor')
        if (i < children.length - 1) total += getSpacing(node, 'spacingMajor', options.horizontalGap, styleEngine, state)
      }
      branchHeight = Math.max(size.height, total)
    }
  }

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  const CHILDREN_PADDING = getSpacing(node, 'spacingMajor', options.horizontalGap, styleEngine, state)
  const CHILDREN_GAP = getSpacing(node, 'spacingMinor', options.verticalGap, styleEngine, state)

  if (mode !== 'axis') {
    // 纵向堆叠（timeline-up/down）：子项在父节点下方/上方，水平居中
    let curY = mode === 'up'
      ? y + size.height + CHILDREN_PADDING
      : y - CHILDREN_PADDING
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const cs = sizeMap.get(child.id)!
      const childH = subtreeTotalHeight(child, options, sizeMap, styleEngine, state, 'spacingMajor')
      const childY = mode === 'up'
        ? curY
        : curY - childH
      layoutTimelineHorizontal(child, x + size.width / 2 - cs.width / 2, childY, node, options, sizeMap, nodes, styleEngine, state, mode)
      if (mode === 'up') curY += childH + CHILDREN_PADDING
      else curY -= childH + CHILDREN_PADDING
    }
    return
  }

  // 轴层：子项沿水平线，交替上下
  let lastUpBranch: NodeDesc | null = parent
  let lastDownBranch: NodeDesc | null = parent

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const cs = sizeMap.get(child.id)!
    const isUp = i % 2 === 0
    const sameDirBranch = isUp ? lastUpBranch : lastDownBranch

    let posXByPrevBranchTopicShape: number
    if (i === 0) {
      posXByPrevBranchTopicShape = x + size.width + CHILDREN_PADDING
    } else {
      const prevNode = children[i - 1]
      posXByPrevBranchTopicShape = nodes.get(prevNode.id)!.x + sizeMap.get(prevNode.id)!.width + CHILDREN_PADDING
    }

    let posXBySameDirBranch: number
    if (sameDirBranch === null || sameDirBranch === parent) {
      posXBySameDirBranch = x + size.width + CHILDREN_PADDING
    } else {
      const sameDirSubtreeW = subtreeTotalWidth(sameDirBranch, options, sizeMap, styleEngine, state, 'spacingMajor')
      posXBySameDirBranch = nodes.get(sameDirBranch.id)!.x + sameDirSubtreeW + CHILDREN_PADDING / 2
    }

    let posXByPrevBranchBounds = 0
    if (i > 0 && !isUp) {
      const prevChild = children[i - 1]
      const prevSubtreeW = subtreeTotalWidth(prevChild, options, sizeMap, styleEngine, state, 'spacingMajor')
      posXByPrevBranchBounds = nodes.get(prevChild.id)!.x + prevSubtreeW + CHILDREN_PADDING / 2
    }

    const childX = Math.max(posXByPrevBranchTopicShape, posXBySameDirBranch, posXByPrevBranchBounds)
    // 对齐 SB：轴层子项贴近父节点垂直中心，不交替撑开
    const childY = y + size.height / 2 - cs.height / 2

    layoutTimelineHorizontal(child, childX, childY, node, options, sizeMap, nodes, styleEngine, state, isUp ? 'up' : 'down')

    if (isUp) lastUpBranch = child
    else lastDownBranch = child
  }
}

export const timelineHorizontalLayoutAlgorithm: LayoutAlgorithm = {
  name: 'timeline-horizontal',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureStyledSubtree(root, options, sizeMap, 'horizontal', styleEngine, state)

    layoutTimelineHorizontal(root, options.rootOffsetX, 200, null, options, sizeMap, nodes, styleEngine, state)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    // 居中根节点
    const rootLayout = nodes.get(root.id)
    if (rootLayout) {
      const ox = maxX / 2 - (rootLayout.x + rootLayout.width / 2)
      const oy = maxY / 2 - (rootLayout.y + rootLayout.height / 2)
      if (Math.abs(ox) > 0.5 || Math.abs(oy) > 0.5) {
        for (const l of nodes.values()) { l.x += ox; l.y += oy }
        maxX += ox; maxY += oy
      }
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}

// ─── 垂直时间线 ───

function layoutTimelineVertical(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): void {
  const size = sizeMap.get(node.id)!
  const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node), options)

  // 分支高度 = 子节点沿垂直轴排列的总跨度
  let branchHeight = size.height
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    let total = 0
    for (let i = 0; i < children.length; i++) {
      total += subtreeTotalHeight(children[i], options, sizeMap, styleEngine, state, 'spacingMajor')
      if (i < children.length - 1) total += getSpacing(node, 'spacingMajor', options.verticalGap, styleEngine, state)
    }
    branchHeight = Math.max(size.height, total)
  }

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  // 子节点沿垂直轴排列，交替左右
  let childY = y + size.height + getSpacing(node, 'spacingMajor', options.verticalGap, styleEngine, state)
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const cs = sizeMap.get(child.id)!
    const childX = (i % 2 === 0)
      ? x - cs.width - getSpacing(node, 'spacingMinor', options.horizontalGap, styleEngine, state)  // 左侧
      : x + size.width + getSpacing(node, 'spacingMinor', options.horizontalGap, styleEngine, state)  // 右侧
    layoutTimelineVertical(child, childX, childY, options, sizeMap, nodes, styleEngine, state)
    childY += subtreeTotalHeight(child, options, sizeMap, styleEngine, state, 'spacingMajor') + getSpacing(node, 'spacingMajor', options.verticalGap, styleEngine, state)
  }
}

export const timelineVerticalLayoutAlgorithm: LayoutAlgorithm = {
  name: 'timeline-vertical',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureStyledSubtree(root, options, sizeMap, 'horizontal', styleEngine, state)

    layoutTimelineVertical(root, 200, options.rootOffsetX, options, sizeMap, nodes, styleEngine, state)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    // 居中根节点
    const rootLayout = nodes.get(root.id)
    if (rootLayout) {
      const ox = maxX / 2 - (rootLayout.x + rootLayout.width / 2)
      const oy = maxY / 2 - (rootLayout.y + rootLayout.height / 2)
      if (Math.abs(ox) > 0.5 || Math.abs(oy) > 0.5) {
        for (const l of nodes.values()) { l.x += ox; l.y += oy }
        maxX += ox; maxY += oy
      }
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
