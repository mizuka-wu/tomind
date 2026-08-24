// TODO: 与 XMind timeline 交替上下/左右排列验证
// TODO: 时间线轴线偏移量
/**
 * Timeline 布局 — 时间线
 *
 * 节点沿水平/垂直轴排列，子节点挂在时间线上方/下方（或左右）
 */
import type { NodeDesc } from '@tomind/schema'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { getTitle, getFontSize, isCollapsed, getAttachedChildren, findRootTopic, measureSimpleSubtree } from './layout-utils'
type NodeSize = import('./layout-utils').SimpleNodeSize

/** 递归计算子树总高度（垂直方向的总跨度） */
function subtreeTotalHeight(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.height
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.height
  let total = 0
  for (let i = 0; i < children.length; i++) {
    total += subtreeTotalHeight(children[i], options, sizeMap)
    if (i < children.length - 1) total += options.verticalGap
  }
  return Math.max(size.height, total)
}

/** 递归计算子树总宽度（水平方向的总跨度） */
function subtreeTotalWidth(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.width
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.width
  let maxChildWidth = 0
  for (const child of children) {
    maxChildWidth = Math.max(maxChildWidth, subtreeTotalWidth(child, options, sizeMap))
  }
  return size.width + options.horizontalGap + maxChildWidth
}

// ─── 水平时间线 ───

function layoutTimelineHorizontal(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
): void {
  const size = sizeMap.get(node.id)!
  const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node), options)

  // 分支高度 = 上下两侧子节点的垂直总跨度
  let branchHeight = size.height
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    let topH = 0
    let bottomH = 0
    for (let i = 0; i < children.length; i++) {
      if (i % 2 === 0) topH = Math.max(topH, subtreeTotalHeight(children[i], options, sizeMap))
      else bottomH = Math.max(bottomH, subtreeTotalHeight(children[i], options, sizeMap))
    }
    branchHeight = topH + size.height + bottomH + options.verticalGap * 2
  }

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  // 子节点沿水平轴排列，交替上下
  let childX = x + size.width + options.horizontalGap
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const cs = sizeMap.get(child.id)!
    const childY = (i % 2 === 0)
      ? y - cs.height - options.verticalGap  // 上方
      : y + size.height + options.verticalGap  // 下方
    layoutTimelineHorizontal(child, childX, childY, options, sizeMap, nodes)
    childX += subtreeTotalWidth(child, options, sizeMap) + options.horizontalGap
  }
}

export const timelineHorizontalLayoutAlgorithm: LayoutAlgorithm = {
  name: 'timeline-horizontal',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSimpleSubtree(root, options, sizeMap)

    layoutTimelineHorizontal(root, options.rootOffsetX, 200, options, sizeMap, nodes)

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
): void {
  const size = sizeMap.get(node.id)!
  const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node), options)

  // 分支高度 = 子节点沿垂直轴排列的总跨度
  let branchHeight = size.height
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    let total = 0
    for (let i = 0; i < children.length; i++) {
      total += subtreeTotalHeight(children[i], options, sizeMap)
      if (i < children.length - 1) total += options.verticalGap
    }
    branchHeight = Math.max(size.height, total)
  }

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  // 子节点沿垂直轴排列，交替左右
  let childY = y + size.height + options.verticalGap
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const cs = sizeMap.get(child.id)!
    const childX = (i % 2 === 0)
      ? x - cs.width - options.horizontalGap  // 左侧
      : x + size.width + options.horizontalGap  // 右侧
    layoutTimelineVertical(child, childX, childY, options, sizeMap, nodes)
    childY += subtreeTotalHeight(child, options, sizeMap) + options.verticalGap
  }
}

export const timelineVerticalLayoutAlgorithm: LayoutAlgorithm = {
  name: 'timeline-vertical',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSimpleSubtree(root, options, sizeMap)

    layoutTimelineVertical(root, 200, options.rootOffsetX, options, sizeMap, nodes)

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
