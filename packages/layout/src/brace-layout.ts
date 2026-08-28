// TODO: 与 XMind brace.left/right 间距对齐
/**
 * Brace 布局 — 大括号布局
 *
 * 大括号布局: 根节点在左/右，子节点垂直堆叠，用大括号连接
 * 与 Logic 的区别: Brace 的子节点更紧凑，适合表示列表或分组
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { getTitle, getFontSize, getFontFamily, getFontWeight, getFontStyle, isCollapsed, getAttachedChildren, findRootTopic, measureSimpleSubtree } from './layout-utils'
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

// ─── 右侧大括号布局 ───

function layoutSubtreeRight(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): void {
  const size = sizeMap.get(node.id)!
  const { width: titleWidth, height: titleHeight } = measureTextSize(
    getTitle(node), getFontSize(node, styleEngine, state), options,
    getFontFamily(node, styleEngine, state), getFontWeight(node, styleEngine, state), getFontStyle(node, styleEngine, state),
  )

  // 子节点垂直堆叠，向右展开
  let totalH = 0
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      totalH += subtreeTotalHeight(children[i], options, sizeMap)
      if (i < children.length - 1) totalH += options.verticalGap
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

  // 大括号布局：子节点更紧凑，间距减半
  const compactGap = options.verticalGap * 0.5
  let childY = y + (size.height - totalH) / 2
  const childX = x + size.width + options.horizontalGap

  for (const child of children) {
    const ch = subtreeTotalHeight(child, options, sizeMap)
    layoutSubtreeRight(child, childX, childY, options, sizeMap, nodes, styleEngine, state)
    childY += ch + compactGap
  }
}

// ─── 左侧大括号布局 ───

function layoutSubtreeLeft(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): void {
  const size = sizeMap.get(node.id)!
  const { width: titleWidth, height: titleHeight } = measureTextSize(
    getTitle(node), getFontSize(node, styleEngine, state), options,
    getFontFamily(node, styleEngine, state), getFontWeight(node, styleEngine, state), getFontStyle(node, styleEngine, state),
  )

  let totalH = 0
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      totalH += subtreeTotalHeight(children[i], options, sizeMap)
      if (i < children.length - 1) totalH += options.verticalGap
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

  // 大括号布局：子节点更紧凑，间距减半
  const compactGap = options.verticalGap * 0.5
  let childY = y + (size.height - totalH) / 2
  const childX = x - options.horizontalGap

  for (const child of children) {
    const cs = sizeMap.get(child.id)!
    const ch = subtreeTotalHeight(child, options, sizeMap)
    layoutSubtreeLeft(child, childX - cs.width, childY, options, sizeMap, nodes, styleEngine, state)
    childY += ch + compactGap
  }
}

// ─── 公开算法 ───

export const braceRightLayoutAlgorithm: LayoutAlgorithm = {
  name: 'brace-right',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSimpleSubtree(root, options, sizeMap, styleEngine, state)

    const totalH = subtreeTotalHeight(root, options, sizeMap)
    const rootX = options.rootOffsetX
    const rootY = (totalH - sizeMap.get(root.id)!.height) / 2

    layoutSubtreeRight(root, rootX, rootY, options, sizeMap, nodes, styleEngine, state)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}

export const braceLeftLayoutAlgorithm: LayoutAlgorithm = {
  name: 'brace-left',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSimpleSubtree(root, options, sizeMap, styleEngine, state)

    const totalH = subtreeTotalHeight(root, options, sizeMap)
    const totalW = subtreeTotalWidth(root, options, sizeMap)
    const rootW = sizeMap.get(root.id)!.width
    const rootX = totalW - rootW - options.rootOffsetX
    const rootY = (totalH - sizeMap.get(root.id)!.height) / 2

    layoutSubtreeLeft(root, rootX, rootY, options, sizeMap, nodes, styleEngine, state)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
