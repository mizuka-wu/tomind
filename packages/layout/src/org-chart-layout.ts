/**
 * Org Chart 布局 — 组织架构图
 *
 * 根节点在顶部/底部，子节点水平展开，父节点居中对齐子节点组
 *
 * 对齐 snowbrush 定位逻辑:
 *   - childrenSizeWidth = sum(children topicW) + gaps（递归前读 boundaryBounds.width）
 *   - 定位循环中 curX += subtreeW + gap（递归后读 boundaryBounds.width）
 *   - levelWidth = childrenSizeWidth + firstChild.bbX - lastChild.topicW - lastChild.bbX
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import { isCollapsed, getAttachedChildren, findRootTopic } from './layout-utils'
import { getNodeSpacing, parseStyleValue } from './spacing-utils'
import { hasNonTitleParts } from './part-measure'
import { measurePartAwareNode, measureTitleOnlyNode } from './part-node-size'

const SNOWBRUSH_INNER_SPACING = 20

/** SB对齐的topicW = titleWidth + innerSpacing(20) + 2×borderWidth */
function getSBTopicWidth(
  titleWidth: number,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  nodeId: string,
): number {
  const style = styleEngine && state ? styleEngine.computeStyle(state, nodeId) : null
  const borderWidth = parseStyleValue(style?.borderWidth, 0)
  return titleWidth + SNOWBRUSH_INNER_SPACING + 2 * borderWidth
}

interface NodeSize {
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  partBounds?: Map<string, { x: number; y: number; width: number; height: number }>
}

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

/** 风格感知的子树测量 */
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
 * - logic 结构: topicW + spacingMajor + maxChildSubtreeW
 * - org-chart 结构: max(csW, topicW)
 *   csW = sum(child.topicW) + gaps — 对齐 SB getChildrenSize（递归前读 topicW）
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

  if (!isCollapsed(node)) {
    for (const child of children) {
      computeSubtreeWidthMap(child, options, sizeMap, subtreeMap, styleEngine, state)
    }
  }

  if (isCollapsed(node) || children.length === 0) {
    subtreeMap.set(node.id, getSBTopicWidth(sizeMap.get(node.id)!.titleWidth, styleEngine, state, node.id))
    return
  }

  const structClass = getNodeStructureClass(node, styleEngine, state)

  if (isLogicStructure(structClass)) {
    const style = styleEngine && state ? styleEngine.computeStyle(state, node.id) : null
    let spacingMajor = parseStyleValue(style?.spacingMajor, options.horizontalGap)

    const SLANT_LINE_CLASSES = ['curve', 'straight', 'fold', 'roundedfold', 'bight']
    const lineClass = styleEngine && state ? styleEngine.getStyleValue(state, node.id, 'lineClass') : null
    const lineClassStr = typeof lineClass === 'string' ? lineClass : ''
    if (SLANT_LINE_CLASSES.some(cls => lineClassStr.includes(cls))) {
      spacingMajor *= 2
    }

    const topicW = getSBTopicWidth(sizeMap.get(node.id)!.titleWidth, styleEngine, state, node.id)
    let maxChildW = 0
    for (const child of children) {
      maxChildW = Math.max(maxChildW, subtreeMap.get(child.id)!)
    }
    subtreeMap.set(node.id, topicW + spacingMajor + maxChildW)
    return
  }

  // Org-chart 结构
  const style = styleEngine && state ? styleEngine.computeStyle(state, node.id) : null
  const spacingMinor = parseStyleValue(style?.spacingMinor, options.horizontalGap)
  const borderWidth = parseStyleValue(style?.borderWidth, 0)
  const gap = spacingMinor + borderWidth
  const topicW = getSBTopicWidth(sizeMap.get(node.id)!.titleWidth, styleEngine, state, node.id)

  // SB: childrenSize = sum(child.boundaryBounds.width) + gaps
  // 暂用 topicW，后续修正树结构后改用 subtreeW
  let csW = 0
  for (const child of children) {
    csW += getSBTopicWidth(sizeMap.get(child.id)!.titleWidth, styleEngine, state, child.id)
  }
  if (children.length > 1) csW += gap * (children.length - 1)

  subtreeMap.set(node.id, Math.max(csW, topicW))
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

/**
 * 计算子节点的 boundaryBounds.x（bbX）
 * 对齐 SB: boundaryBounds.x = -topicW/2 - padding (叶子) 或 min(minChildX, -topicW/2) (非叶)
 */
function getChildBBX(
  child: NodeDesc,
  subtreeW: number,
  sizeMap: Map<string, NodeSize>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): number {
  const childTopicW = getSBTopicWidth(sizeMap.get(child.id)!.titleWidth, styleEngine, state, child.id)
  const childChildren = getAttachedChildren(child)
  if (isCollapsed(child) || childChildren.length === 0) return -childTopicW / 2 - 15
  return Math.min(-subtreeW / 2, -childTopicW / 2)
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
  const parentCenterX = x + size.width / 2

  // childrenSize: 对齐 SB getChildrenSize — 用 topicW（递归前值）
  const style = styleEngine && state ? styleEngine.computeStyle(state, node.id) : null
  const spacingMinor = parseStyleValue(style?.spacingMinor, options.horizontalGap)
  const lineWidth = parseStyleValue(style?.borderWidth, 0)
  const childGap = spacingMinor + lineWidth

  let childrenSizeWidth = 0
  for (let i = 0; i < children.length; i++) {
    childrenSizeWidth += subtreeMap.get(children[i].id)!
  }
  if (children.length > 1) childrenSizeWidth += childGap * (children.length - 1)

  const childY = y + size.height + spacing.verticalGap

  // Position children — 对齐 SB calAttachedChildrenPos
  // levelWidth = childrenSizeWidth + firstChild.bbX - lastChild.subtreeW - lastChild.bbX
  const firstChild = children[0]
  const firstChildX = getChildBBX(firstChild, subtreeMap.get(firstChild.id)!, sizeMap, styleEngine, state)
  const lastChild = children[children.length - 1]
  const lastChildW = subtreeMap.get(lastChild.id)!
  const lastChildX = getChildBBX(lastChild, subtreeMap.get(lastChild.id)!, sizeMap, styleEngine, state)
  const gcW = firstChildX - lastChildW - lastChildX
  const levelWidth = childrenSizeWidth + gcW
  let minChildX = -levelWidth / 2 + firstChildX
  let curX = minChildX

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const childW = subtreeMap.get(child.id)!
    const bbX = getChildBBX(child, childW, sizeMap, styleEngine, state)
    const posX = curX - bbX
    const childCenterX = parentCenterX + posX
    layoutSubtreeDown(child, childCenterX - childW / 2, childY, options, sizeMap, subtreeMap, nodes, styleEngine, state)
    curX += childW + childGap
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
  const parentCenterX = x + size.width / 2

  const style = styleEngine && state ? styleEngine.computeStyle(state, node.id) : null
  const spacingMinor = parseStyleValue(style?.spacingMinor, options.horizontalGap)
  const lineWidth = parseStyleValue(style?.borderWidth, 0)
  const childGap = spacingMinor + lineWidth

  let childrenSizeWidth = 0
  for (let i = 0; i < children.length; i++) {
    childrenSizeWidth += subtreeMap.get(children[i].id)!
  }
  if (children.length > 1) childrenSizeWidth += childGap * (children.length - 1)

  // 对齐 SB calAttachedChildrenPos
  const firstChild = children[0]
  const firstChildX = getChildBBX(firstChild, subtreeMap.get(firstChild.id)!, sizeMap, styleEngine, state)
  const lastChild = children[children.length - 1]
  const lastChildW = subtreeMap.get(lastChild.id)!
  const lastChildX = getChildBBX(lastChild, subtreeMap.get(lastChild.id)!, sizeMap, styleEngine, state)
  const gcW = firstChildX - lastChildW - lastChildX
  const levelWidth = childrenSizeWidth + gcW
  let minChildX = -levelWidth / 2 + firstChildX
  let curX = minChildX

  const childY = y - spacing.verticalGap
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const childW = subtreeMap.get(child.id)!
    const bbX = getChildBBX(child, childW, sizeMap, styleEngine, state)
    const posX = curX - bbX
    const childCenterX = parentCenterX + posX
    const cs = sizeMap.get(child.id)!
    layoutSubtreeUp(child, childCenterX - childW / 2, childY - cs.height, options, sizeMap, subtreeMap, nodes, styleEngine, state)
    curX += childW + childGap
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
    const rootX = -rootSize.width / 2

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
    const rootX = -rootSize.width / 2
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
