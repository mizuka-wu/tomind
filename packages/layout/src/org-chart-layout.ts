/**
 * Org Chart 布局 — 组织架构图
 *
 * 根节点在顶部/底部，子节点水平展开，父节点居中对齐子节点组
 *
 * 对齐 snowbrush 定位逻辑:
 *   - subtreeTotalWidth = sum(children subtree widths) + gaps，不 Math.max 节点宽度
 *   - 子节点组围绕父节点中心 (x + width/2) 居中
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import { isCollapsed, getAttachedChildren, findRootTopic } from './layout-utils'
import { hasNonTitleParts } from './part-measure'
import { measurePartAwareNode, measureTitleOnlyNode } from './part-node-size'
import { getNodeSpacing } from './spacing-utils'

interface NodeSize {
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  partBounds?: Map<string, { x: number; y: number; width: number; height: number }>
}

function measureNodeSize(
  node: NodeDesc,
  padding: { top: number; right: number; bottom: number; left: number },
  options: LayoutOptions,
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): NodeSize {
  if (hasNonTitleParts(node)) {
    const result = measurePartAwareNode(node, options, styleEngine, state)
    return {
      width: result.width,
      height: result.height,
      titleWidth: result.titleWidth,
      titleHeight: result.titleHeight,
      partBounds: result.partBounds,
    }
  }

  const result = measureTitleOnlyNode(node, padding, options, styleEngine, state)
  return {
    width: result.width,
    height: result.height,
    titleWidth: result.titleWidth,
    titleHeight: result.titleHeight,
    partBounds: result.partBounds,
  }
}

/** 风格感知的子树测量，使用 getNodeSpacing padding */
function measureSubtree(
  node: NodeDesc,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): void {
  const spacing = getNodeSpacing(node, options, styleEngine ?? null, state ?? null, 'vertical')
  sizeMap.set(node.id, measureNodeSize(node, spacing.padding, options, styleEngine, state))
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureSubtree(child, options, sizeMap, styleEngine, state)
    }
  }
}

/** 子树水平方向总跨度 — 仅累加子节点宽度 + gaps，不 Math.max 节点宽度 */
function subtreeTotalWidth(
  node: NodeDesc,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): number {
  if (isCollapsed(node)) return sizeMap.get(node.id)!.width
  const children = getAttachedChildren(node)
  if (children.length === 0) return sizeMap.get(node.id)!.width
  let total = 0
  for (let i = 0; i < children.length; i++) {
    total += subtreeTotalWidth(children[i], options, sizeMap, styleEngine, state)
    if (i < children.length - 1) total += getNodeSpacing(node, options, styleEngine, state, 'vertical').horizontalGap
  }
  return total
}

/** 子树总高度 */
function subtreeHeight(
  node: NodeDesc,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.height
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.height
  let maxChildH = 0
  for (const child of children) {
    maxChildH = Math.max(maxChildH, subtreeHeight(child, options, sizeMap, styleEngine, state))
  }
  return size.height + getNodeSpacing(node, options, styleEngine, state, 'vertical').verticalGap + maxChildH
}

type NodeLayout = {
  x: number
  y: number
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  branchHeight: number
  partBounds?: Map<string, { x: number; y: number; width: number; height: number }>
}

function layoutSubtreeDown(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, NodeLayout>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): void {
  const size = sizeMap.get(node.id)!

  // 分支高度 = 子节点子树的最大垂直延伸（子节点同层水平排列）
  let branchHeight = size.height
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    for (const child of children) {
      branchHeight = Math.max(branchHeight, subtreeHeight(child, options, sizeMap, styleEngine, state))
    }
  }

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth: size.titleWidth, titleHeight: size.titleHeight, branchHeight, partBounds: size.partBounds })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  const spacing = getNodeSpacing(node, options, styleEngine, state, 'vertical')
  const parentCenterX = x + size.width / 2
  const childrenWidth = subtreeTotalWidth(node, options, sizeMap, styleEngine, state)
  let childX = parentCenterX - childrenWidth / 2
  const childY = y + size.height + spacing.verticalGap

  for (const child of children) {
    const cw = subtreeTotalWidth(child, options, sizeMap, styleEngine, state)
    const cs = sizeMap.get(child.id)!
    layoutSubtreeDown(child, childX + (cw - cs.width) / 2, childY, options, sizeMap, nodes, styleEngine, state)
    childX += cw + spacing.horizontalGap
  }
}

function layoutSubtreeUp(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, NodeLayout>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): void {
  const size = sizeMap.get(node.id)!

  let branchHeight = size.height
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    for (const child of children) {
      branchHeight = Math.max(branchHeight, subtreeHeight(child, options, sizeMap, styleEngine, state))
    }
  }

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth: size.titleWidth, titleHeight: size.titleHeight, branchHeight, partBounds: size.partBounds })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  const spacing = getNodeSpacing(node, options, styleEngine, state, 'vertical')
  const parentCenterX = x + size.width / 2
  const childrenWidth = subtreeTotalWidth(node, options, sizeMap, styleEngine, state)
  let childX = parentCenterX - childrenWidth / 2
  const childY = y - spacing.verticalGap

  for (const child of children) {
    const cs = sizeMap.get(child.id)!
    const cw = subtreeTotalWidth(child, options, sizeMap, styleEngine, state)
    layoutSubtreeUp(child, childX + (cw - cs.width) / 2, childY - cs.height, options, sizeMap, nodes, styleEngine, state)
    childX += cw + spacing.horizontalGap
  }
}

export const orgChartDownLayoutAlgorithm: LayoutAlgorithm = {
  name: 'org-chart-down',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, NodeLayout>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap, styleEngine, state)

    const totalW = subtreeTotalWidth(root, options, sizeMap, styleEngine, state)
    const rootSize = sizeMap.get(root.id)!
    const rootX = (totalW - rootSize.width) / 2 + options.rootOffsetX

    layoutSubtreeDown(root, rootX, 50, options, sizeMap, nodes, styleEngine, state)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}

export const orgChartUpLayoutAlgorithm: LayoutAlgorithm = {
  name: 'org-chart-up',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, NodeLayout>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap, styleEngine, state)

    const totalW = subtreeTotalWidth(root, options, sizeMap, styleEngine, state)
    const totalH = subtreeHeight(root, options, sizeMap, styleEngine, state)
    const rootSize = sizeMap.get(root.id)!
    const rootX = (totalW - rootSize.width) / 2 + options.rootOffsetX
    const rootY = totalH - rootSize.height - 50

    layoutSubtreeUp(root, rootX, rootY, options, sizeMap, nodes, styleEngine, state)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
