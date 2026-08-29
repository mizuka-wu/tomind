// TODO: 与 XMind brace.left/right 间距对齐
/**
 * Brace 布局 — 大括号布局
 *
 * 大括号布局: 根节点在左/右，子节点垂直堆叠，用大括号连接
 * 与 Logic 的区别: Brace 的子节点更紧凑，适合表示列表或分组
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine, ResolvedStyle } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import { isCollapsed, getAttachedChildren, findRootTopic, getAttr } from './layout-utils'
import { measureTitleOnlyNode } from './part-node-size'

function parseStyleValue(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return isNaN(num) ? fallback : num
  }
  return fallback
}

/**
 * 读取节点的间距配置，对齐 logic-layout.ts 的 getNodeSpacing 模式：
 * - spacingMajor / spacingMinor 从 resolved style 读取
 * - padding 从 resolved style margin 属性 + attrs.style.margin 统一回退
 */
function getNodeSpacing(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
) {
  let style: ResolvedStyle | undefined
  if (styleEngine && state) {
    style = styleEngine.computeStyle(state, node.id)
  }

  if (!style) {
    return {
      horizontalGap: options.horizontalGap,
      verticalGap: options.verticalGap,
      padding: options.nodePadding,
    }
  }

  const majorGap = parseStyleValue(style.spacingMajor, options.horizontalGap)
  const minorGap = parseStyleValue(style.spacingMinor, options.verticalGap)

  // 对齐 snowbrush getTopicMargins: 先读统一 margin，有值则四方向使用，否则 fallback 到分侧值
  const rawStyle = getAttr<Record<string, unknown>>(node, 'style')
  const rawMargin = rawStyle?.margin

  let top: number
  let bottom: number
  let left: number
  let right: number

  if (typeof rawMargin === 'number' && rawMargin > 0) {
    top = bottom = left = right = rawMargin
  } else if (typeof rawMargin === 'string') {
    const parsed = parseFloat(rawMargin)
    if (!isNaN(parsed) && parsed > 0) {
      top = bottom = left = right = parsed
    } else {
      top = parseStyleValue(style.marginTop, options.nodePadding.top)
      bottom = parseStyleValue(style.marginBottom, options.nodePadding.bottom)
      left = parseStyleValue(style.marginLeft, options.nodePadding.left)
      right = parseStyleValue(style.marginRight, options.nodePadding.right)
    }
  } else {
    top = parseStyleValue(style.marginTop, options.nodePadding.top)
    bottom = parseStyleValue(style.marginBottom, options.nodePadding.bottom)
    left = parseStyleValue(style.marginLeft, options.nodePadding.left)
    right = parseStyleValue(style.marginRight, options.nodePadding.right)
  }

  return {
    horizontalGap: majorGap,
    verticalGap: minorGap,
    padding: { top, right, bottom, left },
  }
}

interface NodeSize {
  width: number
  height: number
  titleWidth: number
  titleHeight: number
}

function measureNodeSize(
  node: NodeDesc,
  padding: { top: number; right: number; bottom: number; left: number },
  options: LayoutOptions,
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): NodeSize {
  const result = measureTitleOnlyNode(node, padding, options, styleEngine, state)
  return {
    width: result.width,
    height: result.height,
    titleWidth: result.titleWidth,
    titleHeight: result.titleHeight,
  }
}

function measureSubtree(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: StyleEngine | null, state?: SheetState | null): void {
  const spacing = getNodeSpacing(node, options, styleEngine ?? null, state ?? null)
  sizeMap.set(node.id, measureNodeSize(node, spacing.padding, options, styleEngine, state))
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureSubtree(child, options, sizeMap, styleEngine, state)
    }
  }
}

function getSpacingMajor(node: NodeDesc, options: LayoutOptions, styleEngine: StyleEngine | null, state: SheetState | null): number {
  return getNodeSpacing(node, options, styleEngine, state).horizontalGap
}

function getSpacingMinor(node: NodeDesc, options: LayoutOptions, styleEngine: StyleEngine | null, state: SheetState | null): number {
  return getNodeSpacing(node, options, styleEngine, state).verticalGap
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

// ─── 右侧大括号布局 ───

function layoutSubtreeRight(
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
    titleWidth: size.titleWidth, titleHeight: size.titleHeight,
    branchHeight: children.length > 0 && !isCollapsed(node) ? totalH : size.height,
  })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  // 大括号布局：子节点更紧凑，间距减半
  const compactGap = getSpacingMinor(node, options, styleEngine, state) * 0.5
  let childY = y + (size.height - totalH) / 2
  const childX = x + size.width + getSpacingMajor(node, options, styleEngine, state)

  for (const child of children) {
    const ch = subtreeTotalHeight(child, options, sizeMap, styleEngine, state)
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
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): void {
  const size = sizeMap.get(node.id)!

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
    titleWidth: size.titleWidth, titleHeight: size.titleHeight,
    branchHeight: children.length > 0 && !isCollapsed(node) ? totalH : size.height,
  })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  // 大括号布局：子节点更紧凑，间距减半
  const compactGap = getSpacingMinor(node, options, styleEngine, state) * 0.5
  let childY = y + (size.height - totalH) / 2
  const childX = x - getSpacingMajor(node, options, styleEngine, state)

  for (const child of children) {
    const cs = sizeMap.get(child.id)!
    const ch = subtreeTotalHeight(child, options, sizeMap, styleEngine, state)
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
    measureSubtree(root, options, sizeMap, styleEngine, state)

    const totalH = subtreeTotalHeight(root, options, sizeMap, styleEngine, state)
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
    measureSubtree(root, options, sizeMap, styleEngine, state)

    const totalH = subtreeTotalHeight(root, options, sizeMap, styleEngine, state)
    const totalW = subtreeTotalWidth(root, options, sizeMap, styleEngine, state)
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
