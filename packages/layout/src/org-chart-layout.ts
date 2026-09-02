/**
 * Org Chart 布局 — 组织架构图
 *
 * 根节点在顶部/底部，子节点水平展开，父节点居中对齐子节点组
 *
 * 对齐 snowbrush 定位逻辑:
 *   - subtreeTotalWidth = sum(children node widths) + gaps，不 Math.max 节点宽度
 *   - 子节点组围绕父节点中心 (x + width/2) 居中
 *   - 子树可以重叠（用 sizeMap.x 偏移，不计算 subtree 包围盒）
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import { isCollapsed, getAttachedChildren, findRootTopic } from './layout-utils'
import { getNodeSpacing, getLayoutWidth, parseStyleValue } from './spacing-utils'
import { hasNonTitleParts } from './part-measure'
import { measurePartAwareNode, measureTitleOnlyNode } from './part-node-size'

/** 获取节点的 structureClass */
function getNodeStructureClass(
  node: NodeDesc,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): string {
  if (styleEngine && state) {
    const style = styleEngine.computeStyle(state, node.id)
    if (style?.structureClass) return String(style.structureClass)
  }
  return ''
}

/** 判断是否为 logic 结构 */
function isLogicStructure(structClass: string): boolean {
  return structClass.includes('logic')
}

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

/**
 * 预计算每个节点的子树包围盒宽度（对齐 SB boundaryBounds.width）
 *
 * - logic 结构: layoutW + spacingMajor + maxChildSubtreeW
 * - 其他结构: getBoundaryWidth（含 BOUNDARYGAP padding）
 */
function computeSubtreeWidthMap(
  node: NodeDesc,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  subtreeMap: Map<string, number>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): void {
  const children = getAttachedChildren(node)

  // 先递归计算所有子节点
  if (!isCollapsed(node)) {
    for (const child of children) {
      computeSubtreeWidthMap(child, options, sizeMap, subtreeMap, styleEngine, state)
    }
  }

  if (isCollapsed(node) || children.length === 0) {
    // 叶子节点：用 getLayoutWidth（不含 BOUNDARYGAP，因为叶子没有 boundary padding）
    subtreeMap.set(node.id, getLayoutWidth(node, sizeMap.get(node.id)!.width, styleEngine, state))
    return
  }

  const structClass = getNodeStructureClass(node, styleEngine, state)

  if (isLogicStructure(structClass)) {
    // Logic 结构: 子节点垂直排列，宽度 = 本节点 + spacingMajor + 最宽子树
    const style = styleEngine && state ? styleEngine.computeStyle(state, node.id) : null
    const spacingMajor = parseStyleValue(style?.spacingMajor, options.horizontalGap)
    const layoutW = getLayoutWidth(node, sizeMap.get(node.id)!.width, styleEngine, state)
    let maxChildW = 0
    for (const child of children) {
      maxChildW = Math.max(maxChildW, subtreeMap.get(child.id)!)
    }
    subtreeMap.set(node.id, layoutW + spacingMajor + maxChildW)
    return
  }

  // Org-chart 或其他结构：用 getBoundaryWidth（原有逻辑）
  // 父节点的 subtreeWidth 由 layoutSubtreeDown 中的 childrenSize 计算
  // 这里只设置叶子/中间节点的默认值
  // 注意：非叶子节点的 subtreeWidth 会在 layoutSubtreeDown 中被 childrenSize 覆盖
  // 所以这里只需要保证子节点有正确的值
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
  subtreeMap: Map<string, number>,
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
  const parentCenterX = x + getLayoutWidth(node, size.width, styleEngine, state) / 2

  // childrenSize: sum of child boundaryBounds widths + gaps (snowbrush getChildrenSize)
  let childrenSizeWidth = 0
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    childrenSizeWidth += subtreeMap.get(child.id)!
  }
  if (children.length > 1) childrenSizeWidth += spacing.horizontalGap * (children.length - 1)

  let childX = parentCenterX - childrenSizeWidth / 2
  const childY = y + size.height + spacing.verticalGap

  // Position children using sizeMap.x offsets (snowbrush calAttachedChildrenPos)
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const cs = sizeMap.get(child.id)!
    layoutSubtreeDown(child, childX, childY, options, sizeMap, subtreeMap, nodes, styleEngine, state)
    childX += subtreeMap.get(child.id)! + spacing.horizontalGap
  }
}

function layoutSubtreeUp(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  subtreeMap: Map<string, number>,
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
  const parentCenterX = x + getLayoutWidth(node, size.width, styleEngine, state) / 2

  // childrenSize: sum of child boundaryBounds widths + gaps (snowbrush getChildrenSize)
  let childrenSizeWidth = 0
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    childrenSizeWidth += subtreeMap.get(child.id)!
  }
  if (children.length > 1) childrenSizeWidth += spacing.horizontalGap * (children.length - 1)

  let childX = parentCenterX - childrenSizeWidth / 2
  const childY = y - spacing.verticalGap

  // Position children using sizeMap.x offsets (snowbrush calAttachedChildrenPos)
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const cs = sizeMap.get(child.id)!
    layoutSubtreeUp(child, childX, childY - cs.height, options, sizeMap, subtreeMap, nodes, styleEngine, state)
    childX += subtreeMap.get(child.id)! + spacing.horizontalGap
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

    const subtreeMap = new Map<string, number>()
    computeSubtreeWidthMap(root, options, sizeMap, subtreeMap, styleEngine, state)

    const rootSize = sizeMap.get(root.id)!
    const rootX = -getLayoutWidth(root, rootSize.width, styleEngine, state) / 2

    layoutSubtreeDown(root, rootX, 50, options, sizeMap, subtreeMap, nodes, styleEngine, state)

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

    const subtreeMap = new Map<string, number>()
    computeSubtreeWidthMap(root, options, sizeMap, subtreeMap, styleEngine, state)

    const rootSize = sizeMap.get(root.id)!
    const rootX = -getLayoutWidth(root, rootSize.width, styleEngine, state) / 2
    const rootY = subtreeHeight(root, options, sizeMap, styleEngine, state) - rootSize.height - 50

    layoutSubtreeUp(root, rootX, rootY, options, sizeMap, subtreeMap, nodes, styleEngine, state)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
