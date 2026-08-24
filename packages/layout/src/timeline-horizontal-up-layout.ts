// TODO: 与 XMind timeline.horizontal.up/down 间距对齐
/**
 * Timeline Horizontal Up 布局 — 水平时间线上方
 *
 * 节点沿水平轴排列，子节点全部挂在时间线上方
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

function layoutSubtree(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
): void {
  const size = sizeMap.get(node.id)!
  const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node), options)

  // 分支高度 = 上方子节点的垂直总跨度
  let branchHeight = size.height
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    let maxChildH = 0
    for (const child of children) {
      maxChildH = Math.max(maxChildH, subtreeTotalHeight(child, options, sizeMap))
    }
    branchHeight = maxChildH + size.height + options.verticalGap
  }

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  // 子节点全部在上方
  let childX = x + size.width + options.horizontalGap
  for (const child of children) {
    const cs = sizeMap.get(child.id)!
    const childY = y - cs.height - options.verticalGap
    layoutSubtree(child, childX, childY, options, sizeMap, nodes)
    childX += subtreeTotalWidth(child, options, sizeMap) + options.horizontalGap
  }
}

export const timelineHorizontalUpLayoutAlgorithm: LayoutAlgorithm = {
  name: 'timeline-horizontal-up',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSimpleSubtree(root, options, sizeMap)

    layoutSubtree(root, options.rootOffsetX, 200, options, sizeMap, nodes)

    // 平移到正数区
    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      minX = Math.min(minX, l.x)
      minY = Math.min(minY, l.y)
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }
    if (minX < 0 || minY < 0) {
      const ox = minX < 0 ? -minX : 0
      const oy = minY < 0 ? -minY : 0
      for (const l of nodes.values()) {
        l.x += ox
        l.y += oy
      }
      maxX += ox
      maxY += oy
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
