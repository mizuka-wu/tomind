// TODO: 与 XMind logic.right/left 间距对齐
// TODO: 子分支垂直堆叠间距验证
/**
 * Logic Chart 布局 — 逻辑图
 *
 * 逻辑图: 根节点在左/右，子节点水平展开，每个分支独立
 * 与 Tree 的区别: Logic 的子节点不是垂直堆叠，而是各自独立的水平分支
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { getTitle, getFontSize, isCollapsed, getAttachedChildren, findRootTopic, measureSimpleSubtree } from './layout-utils'
type NodeSize = import('./layout-utils').SimpleNodeSize

function getSpacingMajor(node: NodeDesc, options: LayoutOptions, styleEngine: StyleEngine | null, state: SheetState | null): number {
  if (styleEngine && state) {
    const val = styleEngine.getStyleValue(state, node.id, 'spacingMajor')
    if (typeof val === 'number') return val
  }
  return options.horizontalGap
}

function getSpacingMinor(node: NodeDesc, options: LayoutOptions, styleEngine: StyleEngine | null, state: SheetState | null): number {
  if (styleEngine && state) {
    const val = styleEngine.getStyleValue(state, node.id, 'spacingMinor')
    if (typeof val === 'number') return val
  }
  return options.verticalGap
}

/** 递归计算子树总高度（垂直方向的总跨度） */
function subtreeTotalHeight(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine: StyleEngine | null, state: SheetState | null): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.height
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.height
  let total = 0
  for (let i = 0; i < children.length; i++) {
    total += subtreeTotalHeight(children[i], options, sizeMap, styleEngine, state)
    if (i < children.length - 1) total += getSpacingMinor(node, options, styleEngine, state)
  }
  return Math.max(size.height, total)
}

/** 递归计算子树总宽度（水平方向的总跨度） */
function subtreeTotalWidth(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine: StyleEngine | null, state: SheetState | null): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.width
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.width
  let maxChildWidth = 0
  for (const child of children) {
    maxChildWidth = Math.max(maxChildWidth, subtreeTotalWidth(child, options, sizeMap, styleEngine, state))
  }
  return size.width + getSpacingMajor(node, options, styleEngine, state) + maxChildWidth
}

function layoutSubtree(
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

  // 子节点垂直堆叠，向右展开
  let totalH = 0
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      totalH += subtreeTotalHeight(children[i], options, sizeMap, styleEngine, state)
      if (i < children.length - 1) totalH += getSpacingMinor(node, options, styleEngine, state)
    }
  }

  nodes.set(node.id, {
    x, y,
    width: size.width, height: size.height,
    titleWidth, titleHeight,
    branchHeight: children.length > 0 && !isCollapsed(node) ? totalH : size.height,
  })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  let childY = y + (size.height - totalH) / 2
  const childX = x + size.width + getSpacingMajor(node, options, styleEngine, state)

  for (const child of children) {
    const ch = subtreeTotalHeight(child, options, sizeMap, styleEngine, state)
    layoutSubtree(child, childX, childY, options, sizeMap, nodes, styleEngine, state)
    childY += ch + getSpacingMinor(node, options, styleEngine, state)
  }
}

export const logicRightLayoutAlgorithm: LayoutAlgorithm = {
  name: 'logic-right',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSimpleSubtree(root, options, sizeMap)

    const totalH = subtreeTotalHeight(root, options, sizeMap, styleEngine, state)
    const rootX = options.rootOffsetX
    const rootY = (totalH - sizeMap.get(root.id)!.height) / 2

    layoutSubtree(root, rootX, rootY, options, sizeMap, nodes, styleEngine, state)

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

export const logicLeftLayoutAlgorithm: LayoutAlgorithm = {
  name: 'logic-left',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSimpleSubtree(root, options, sizeMap)

    const totalH = subtreeTotalHeight(root, options, sizeMap, styleEngine, state)
    const totalW = subtreeTotalWidth(root, options, sizeMap, styleEngine, state)
    const rootW = sizeMap.get(root.id)!.width
    const rootX = totalW - rootW - options.rootOffsetX
    const rootY = (totalH - sizeMap.get(root.id)!.height) / 2

    // 左侧布局：子节点向左展开
    layoutSubtreeLeft(root, rootX, rootY, options, sizeMap, nodes, styleEngine, state)

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

function layoutSubtreeLeft(
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

  let totalH = 0
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      totalH += subtreeTotalHeight(children[i], options, sizeMap, styleEngine, state)
      if (i < children.length - 1) totalH += getSpacingMinor(node, options, styleEngine, state)
    }
  }

  nodes.set(node.id, {
    x, y,
    width: size.width, height: size.height,
    titleWidth, titleHeight,
    branchHeight: children.length > 0 && !isCollapsed(node) ? totalH : size.height,
  })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  let childY = y + (size.height - totalH) / 2
  const childX = x - getSpacingMajor(node, options, styleEngine, state)

  for (const child of children) {
    const cs = sizeMap.get(child.id)!
    const ch = subtreeTotalHeight(child, options, sizeMap, styleEngine, state)
    layoutSubtreeLeft(child, childX - cs.width, childY, options, sizeMap, nodes, styleEngine, state)
    childY += ch + getSpacingMinor(node, options, styleEngine, state)
  }
}
