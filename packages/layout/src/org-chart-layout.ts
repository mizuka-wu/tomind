// TODO: 与 XMind org-chart.down/up 对齐
// TODO: 多层嵌套水平居中验证
/**
 * Org Chart 布局 — 组织架构图
 *
 * 根节点在顶部/底部，子节点水平展开，父节点居中对齐子节点组
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { getTitle, getFontSize, isCollapsed, getAttachedChildren, findRootTopic, measureSimpleSubtree } from './layout-utils'
type NodeSize = import('./layout-utils').SimpleNodeSize

/** spacingMajor: 父→子方向间距（垂直），spacingMinor: 兄弟间间距（水平） */
function getSpacingMajor(node: NodeDesc, options: LayoutOptions, styleEngine: StyleEngine | null, state: SheetState | null): number {
  if (styleEngine && state) {
    const val = styleEngine.getStyleValue(state, node.id, 'spacingMajor')
    if (typeof val === 'number') return val
  }
  return options.verticalGap
}

function getSpacingMinor(node: NodeDesc, options: LayoutOptions, styleEngine: StyleEngine | null, state: SheetState | null): number {
  if (styleEngine && state) {
    const val = styleEngine.getStyleValue(state, node.id, 'spacingMinor')
    if (typeof val === 'number') return val
  }
  return options.horizontalGap
}

/** 子节点水平方向总跨度 */
function childrenTotalWidth(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine: StyleEngine | null, state: SheetState | null): number {
  if (isCollapsed(node)) return sizeMap.get(node.id)!.width
  const children = getAttachedChildren(node)
  if (children.length === 0) return sizeMap.get(node.id)!.width
  let total = 0
  for (let i = 0; i < children.length; i++) {
    total += childrenTotalWidth(children[i], options, sizeMap, styleEngine, state)
    if (i < children.length - 1) total += getSpacingMinor(node, options, styleEngine, state)
  }
  return Math.max(sizeMap.get(node.id)!.width, total)
}

/** 子树总高度 */
function subtreeHeight(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine: StyleEngine | null, state: SheetState | null): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.height
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.height
  let maxChildH = 0
  for (const child of children) {
    maxChildH = Math.max(maxChildH, subtreeHeight(child, options, sizeMap, styleEngine, state))
  }
  return size.height + getSpacingMajor(node, options, styleEngine, state) + maxChildH
}

function layoutSubtreeDown(
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

  // 分支高度 = 子节点子树的最大垂直延伸（子节点同层水平排列）
  let branchHeight = size.height
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    for (const child of children) {
      branchHeight = Math.max(branchHeight, subtreeHeight(child, options, sizeMap, styleEngine, state))
    }
  }

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  // 子节点水平排列
  const childTotalW = (() => {
    let total = 0
    for (let i = 0; i < children.length; i++) {
      total += childrenTotalWidth(children[i], options, sizeMap, styleEngine, state)
      if (i < children.length - 1) total += getSpacingMinor(node, options, styleEngine, state)
    }
    return total
  })()

  let childX = x + (size.width - childTotalW) / 2
  const childY = y + size.height + getSpacingMajor(node, options, styleEngine, state)

  for (const child of children) {
    const cw = childrenTotalWidth(child, options, sizeMap, styleEngine, state)
    layoutSubtreeDown(child, childX, childY, options, sizeMap, nodes, styleEngine, state)
    childX += cw + getSpacingMinor(node, options, styleEngine, state)
  }
}

function layoutSubtreeUp(
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

  let branchHeight = size.height
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    for (const child of children) {
      branchHeight = Math.max(branchHeight, subtreeHeight(child, options, sizeMap, styleEngine, state))
    }
  }

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  const childTotalW = (() => {
    let total = 0
    for (let i = 0; i < children.length; i++) {
      total += childrenTotalWidth(children[i], options, sizeMap, styleEngine, state)
      if (i < children.length - 1) total += getSpacingMinor(node, options, styleEngine, state)
    }
    return total
  })()

  let childX = x + (size.width - childTotalW) / 2
  const childY = y - getSpacingMajor(node, options, styleEngine, state)

  for (const child of children) {
    const cs = sizeMap.get(child.id)!
    const cw = childrenTotalWidth(child, options, sizeMap, styleEngine, state)
    layoutSubtreeUp(child, childX, childY - cs.height, options, sizeMap, nodes, styleEngine, state)
    childX += cw + getSpacingMinor(node, options, styleEngine, state)
  }
}

export const orgChartDownLayoutAlgorithm: LayoutAlgorithm = {
  name: 'org-chart-down',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSimpleSubtree(root, options, sizeMap)

    const totalW = childrenTotalWidth(root, options, sizeMap, styleEngine, state)
    const rootX = (totalW - sizeMap.get(root.id)!.width) / 2 + options.rootOffsetX

    layoutSubtreeDown(root, rootX, 50, options, sizeMap, nodes, styleEngine, state)

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

export const orgChartUpLayoutAlgorithm: LayoutAlgorithm = {
  name: 'org-chart-up',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSimpleSubtree(root, options, sizeMap)

    const totalW = childrenTotalWidth(root, options, sizeMap, styleEngine, state)
    const totalH = subtreeHeight(root, options, sizeMap, styleEngine, state)
    const rootX = (totalW - sizeMap.get(root.id)!.width) / 2 + options.rootOffsetX
    const rootY = totalH - sizeMap.get(root.id)!.height - 50

    layoutSubtreeUp(root, rootX, rootY, options, sizeMap, nodes, styleEngine, state)

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
