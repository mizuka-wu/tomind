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
import { layoutLogicSubtree } from './logic-layout'

const SNOWBRUSH_INNER_SPACING = 20

/** SB对齐的topicW = titleWidth + innerSpacing(20) + margins + 2×borderWidth */
function getSBTopicWidth(
  titleWidth: number,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  nodeId: string,
): number {
  const style = styleEngine && state ? styleEngine.computeStyle(state, nodeId) : null
  const borderWidth = parseStyleValue(style?.borderWidth, 0)
  const ml = parseStyleValue(style?.marginLeft, 0)
  const mr = parseStyleValue(style?.marginRight, 0)
  return titleWidth + SNOWBRUSH_INNER_SPACING + ml + mr + 2 * borderWidth
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
    const result = measurePartAwareNode(node, options, styleEngine, state, padding)
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
  // 层间距与 layoutSubtreeDown/Up 的 levelGap 保持一致（×4）
  return size.height + getNodeSpacing(node, options, styleEngine, state, 'vertical').verticalGap * 8 + maxChildH
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

function getOrgSpacingMajor(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): number {
  const spacing = getNodeSpacing(node, options, styleEngine, state, 'vertical')
  let gap = spacing.horizontalGap
  if (styleEngine && state) {
    const lc = String(styleEngine.getStyleValue(state, node.id, 'lineClass') ?? '')
    // snowbrush orgchartupanddown.calcSpacingMajor: curve/straight/fold/roundedFold/bight ×2
    if (['curve', 'straight', 'fold', 'bight'].some((c) => lc.includes(c))) gap *= 2
    const arrow = String(styleEngine.getStyleValue(state, node.id, 'arrowEndClass') ?? '')
    if (arrow && !arrow.includes('none')) {
      const lw = parseStyleValue(styleEngine.getStyleValue(state, node.id, 'lineWidth'), 0)
      gap += lw * 4 + 16
    }
  }
  return gap
}

/** skeleton：子层级结构为 logic.* 时委派 logic 布局 */
function getOrgChildLogicSide(state: SheetState | null, depth: number): 'right' | 'left' | null {
  const sk = (state?.doc?.attrs as Record<string, unknown> | undefined)?.skeletonStructure as Record<string, string> | undefined
  if (!sk) return null
  const sc = sk[depth === 0 ? 'mainTopic' : 'subTopic'] ?? sk.mainTopic
  if (typeof sc !== 'string' || !sc.startsWith('org.xmind.ui.logic')) return null
  return sc.endsWith('left') ? 'left' : 'right'
}

/** snowbrush calcOutwardDistanceByAttachedChildren（org：水平方向，limit 7） */
function calcOrgOutward(provs: { bbW: number }[], lineClass: string): number {
  if (provs.length < 7) return 0
  if (lineClass.includes('elbow')) return 0
  const totalWidth = provs.reduce((s2, p) => s2 + p.bbW, 0)
  if (totalWidth <= 1000) return 0
  return 0.09 * (Math.min(totalWidth, 1600) - 1000)
}

interface OrgProv {
  nodes: Map<string, NodeLayout>
  bbX: number
  bbW: number
  bbY: number
  bbH: number
  own: NodeLayout
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
  depth = 0,
): void {
  const size = sizeMap.get(node.id)!
  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth: size.titleWidth, titleHeight: size.titleHeight, branchHeight: size.height, partBounds: size.partBounds })

  const children = isCollapsed(node) ? [] : getAttachedChildren(node)
  if (children.length === 0) return

  const style = styleEngine && state ? styleEngine.computeStyle(state, node.id) : null
  const spacingMinor = parseStyleValue(style?.spacingMinor, 0)
  const lineWidth = parseStyleValue(style?.borderWidth, 0)
  const childGap = spacingMinor + lineWidth
  const spacingMajor = getOrgSpacingMajor(node, options, styleEngine, state)
  const lineClass = styleEngine && state ? String(styleEngine.getStyleValue(state, node.id, 'lineClass') ?? '') : ''

  // 子树 provisional 布局（skeleton 委派 logic，否则递归 org）
  const logicSide = getOrgChildLogicSide(state, depth)
  const provs: OrgProv[] = []
  for (const child of children) {
    const provNodes = new Map<string, NodeLayout>()
    let bbX = 0
    let bbW = 0
    let bbY = 0
    let bbH = 0
    if (logicSide) {
      const res = layoutLogicSubtree(child, 0, 0, options, styleEngine, state, logicSide)
      for (const [id, nl] of res.nodes) provNodes.set(id, nl as unknown as NodeLayout)
      bbY = res.bb.y
      bbH = res.bb.height
      bbX = res.bbX
      bbW = res.bbW
    } else {
      layoutSubtreeDown(child, 0, 0, options, sizeMap, subtreeMap, provNodes, styleEngine, state, depth + 1)
      const cs = sizeMap.get(child.id)!
      const own = provNodes.get(child.id)!
      let minX = Infinity
      let maxX = -Infinity
      let minY = Infinity
      let maxY = -Infinity
      for (const nl of provNodes.values()) {
        minX = Math.min(minX, nl.x)
        maxX = Math.max(maxX, nl.x + nl.width)
        minY = Math.min(minY, nl.y)
        maxY = Math.max(maxY, nl.y + nl.height)
      }
      bbW = maxX - minX
      bbX = minX - (own.x + cs.width / 2)
      bbH = maxY - minY
      bbY = minY - own.y - cs.height / 2
    }
    provs.push({ nodes: provNodes, bbX, bbW, bbY, bbH, own: provNodes.get(child.id)! })
  }

  // childrenSize.width = Σ bbW + gaps
  const n = children.length
  const childrenW = provs.reduce((s2, p) => s2 + p.bbW, 0) + (n - 1) * childGap
  let minChildX = -childrenW / 2
  if (n > 1) {
    const levelWidth = childrenW + provs[0].bbX - provs[n - 1].bbW - provs[n - 1].bbX
    minChildX = -levelWidth / 2 + provs[0].bbX
  }

  // Y：childrenY = parentBottom + spacingMajor；每个子节点再 + maxOffset + outward
  const maxOffset = Math.max(...provs.map((p) => -p.bbY))
  const outward = calcOrgOutward(provs, lineClass)
  const childrenY = y + size.height + spacingMajor + maxOffset + outward

  // X 堆叠
  let cur = minChildX
  const posXs = provs.map((p) => {
    const v = cur - p.bbX
    cur += p.bbW + childGap
    return v
  })
  // posXoffsetToClosestChild 重对齐（endAnchor 在 top-middle → rel x = 0）
  let offset = 0
  if (n >= 3) {
    let best = posXs[0]
    for (const v of posXs) if (Math.abs(v) < Math.abs(best)) best = v
    if (Math.abs(best) < Math.min(30, childrenW * 0.15)) offset = best
  }

  const parentCenterX = x + size.width / 2
  let bbTop = 0
  let bbBottom = size.height
  let bbLeft = 0
  let bbRight = size.width
  for (let i = 0; i < n; i++) {
    const pv = provs[i]
    const centerX = parentCenterX + posXs[i] - offset
    const dx = centerX - (pv.own.x + pv.own.width / 2)
    const dy = childrenY - pv.own.y
    for (const [id, nl] of pv.nodes) {
      nodes.set(id, { ...nl, x: nl.x + dx, y: nl.y + dy })
    }
    const relTop = childrenY - y + pv.bbY
    bbTop = Math.min(bbTop, relTop)
    bbBottom = Math.max(bbBottom, relTop + pv.bbH)
    const relLeft = centerX - pv.own.width / 2 - x + pv.bbX
    bbLeft = Math.min(bbLeft, relLeft)
    bbRight = Math.max(bbRight, relLeft + pv.bbW)
  }
  const ownLayout = nodes.get(node.id)
  if (ownLayout) {
    ownLayout.branchHeight = bbBottom - bbTop
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
