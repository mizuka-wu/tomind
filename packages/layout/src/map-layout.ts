/**
 * Map Layout — 思维导图布局（map-clockwise / map-anticlockwise / map-unbalanced）
 *
 * 继承 BaseLayout，复用公共定位算法。
 * 对齐 snowbrush basemap.ts + map.ts 的布局逻辑。
 *
 * Architecture: true bottom-up recursive layout matching snowbrush.
 * - layoutNode(node) recursively lays out ALL children first, then positions them
 * - Each child returns its boundaryBounds (position-independent, relative to child's origin)
 * - Parent uses children's boundaryBounds to compute positions
 * - Parent computes its own boundaryBounds by merging children's bounds
 */
import type { NodeDesc } from '@tomind/schema'
import type { SheetState } from '@tomind/state'
import type { StyleEngine } from '@tomind/style'
import { DEFAULT_STYLES, classifyNode } from '@tomind/style'
import type { LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { BaseLayout } from './base-layout'
import type { BoundaryBounds } from './base-layout'
import { hasNonTitleParts } from './part-measure'
import { measurePartAwareNode, measureTitleOnlyNode } from './part-node-size'
import {
  getTitle,
  getFontSize,
  isCollapsed,
  getAttachedChildren,
  findRootTopic,
} from './layout-utils'
import { computeOutsidePadding } from './boundary-padding'
import type { OutsidePadding } from './boundary-padding'
import { layoutSummaries, getSummaryChildren } from './summary-layout'

// ─── 配置 ───

interface MapLayoutConfig {
  name: string
  /** clockwise: 前 numRight 个子节点在右侧；anticlockwise: 前 numRight 个在左侧 */
  direction: 'clockwise' | 'anticlockwise'
  /** false = 允许从节点 attrs.numRight 读取手动分割点 */
  balanced: boolean
}

// ─── 节点尺寸 ───

interface NodeSize {
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  partBounds?: Map<string, { x: number; y: number; width: number; height: number }>
  outsidePadding: OutsidePadding
}

// ─── MapLayout 类 ───

class MapLayout extends BaseLayout {
  readonly name: string
  private readonly config: MapLayoutConfig

  constructor(config: MapLayoutConfig) {
    super()
    this.config = config
    this.name = config.name
  }

  private getNodeSpacingMajor(node: NodeDesc, options: LayoutOptions, styleEngine?: StyleEngine | null, state?: SheetState | null): number {
    if (options.getSpacingMajor) return options.getSpacingMajor(node)
    
    // 对齐 snowbrush calcSpacingMajor 逻辑
    // 如果有 StyleEngine，根据连接线类型计算间距
    if (styleEngine && state) {
      const lineClass = styleEngine.getStyleValue(state, node.id, 'lineClass')
      const lineClassStr = typeof lineClass === 'string' ? lineClass : ''
      
      // snowbrush: fold/roundedFold/bight → LINECOLPOS * 3 = 39px
      const FOLD_LINE_CLASSES = [
        'org.xmind.branchConnection.fold',
        'org.xmind.branchConnection.roundedfold',
        'org.xmind.branchConnection.bight',
      ]
      if (FOLD_LINE_CLASSES.some(cls => lineClassStr.includes(cls))) {
        return 39 // LINECOLPOS * 3 = 13 * 3
      }
      
      // 其他连接线：读取 spacingMajor 样式值
      const spacingMajor = styleEngine.getStyleValue(state, node.id, 'spacingMajor')
      if (typeof spacingMajor === 'number' && spacingMajor > 0) {
        return spacingMajor
      }
      if (typeof spacingMajor === 'string') {
        const parsed = parseFloat(spacingMajor)
        if (!isNaN(parsed) && parsed > 0) return parsed
      }
    }
    
    return options.horizontalGap
  }

  // ── Entry point: two-pass bottom-up layout ──

  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine?: StyleEngine | null, state?: SheetState | null): LayoutResult {
    const nodes = new Map<string, import('./layout-engine').NodeLayout>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    this.measureSubtree(root, options, sizeMap, styleEngine, state)

    const rootX = options.rootOffsetX
    const rootY = 0

    // First pass: compute positions and localBBMap (position-independent boundaryBounds)
    const localBBMap = new Map<string, BoundaryBounds>()
    this.layoutNode(root, rootX, rootY, options, sizeMap, nodes, undefined, styleEngine, state, localBBMap)

    // Convert localBBMap to absolute boundaryBoundsMap for X offset alignment
    const boundaryBoundsMap = new Map<string, BoundaryBounds>()
    for (const [id, bb] of localBBMap) {
      const nl = nodes.get(id)
      if (nl) {
        boundaryBoundsMap.set(id, {
          x: nl.x + bb.x,
          y: nl.y + bb.y,
          width: bb.width,
          height: bb.height,
        })
      }
    }

    // Derive subtreeHeightMap from localBBMap for calcOutwardDistance
    const subtreeHeightMap = new Map<string, number>()
    for (const [id, bb] of localBBMap) {
      subtreeHeightMap.set(id, bb.height)
    }

    // Second pass: with boundaryBoundsMap for X offset alignment
    const nodes2 = new Map<string, import('./layout-engine').NodeLayout>()
    this.layoutNode(root, rootX, rootY, options, sizeMap, nodes2, boundaryBoundsMap, styleEngine, state, new Map(), subtreeHeightMap)

    let totalWidth = 0
    let totalHeight = 0
    for (const l of nodes2.values()) {
      totalWidth = Math.max(totalWidth, l.x + l.width)
      totalHeight = Math.max(totalHeight, l.y + l.height)
    }
    return { nodes: nodes2, totalWidth, totalHeight }
  }

  /**
   * 对齐 snowbrush calcOutwardDistanceByAttachedChildren
   * 子节点数量 ≥ CHILDREN_COUNT_LIMIT 时，添加扇出 X 偏移
   * snowbrush 用 boundaryBounds.height（子树高度），不是节点高度
   */
  private calcOutwardDistance(
    children: readonly NodeDesc[],
    sizeMap: Map<string, NodeSize>,
    subtreeHeightMap?: Map<string, number>,
  ): number {
    const CHILDREN_COUNT_LIMIT = 8
    const K = 0.15
    const MIN = 400
    const MAX = 800

    if (children.length < CHILDREN_COUNT_LIMIT) return 0
    // snowbrush 用 boundaryBounds.height（子树高度）
    const totalHeight = children.reduce(
      (sum, c) => sum + (subtreeHeightMap?.get(c.id) ?? sizeMap.get(c.id)?.height ?? 0), 0,
    )
    if (totalHeight <= MIN) {
      return 0
    }
    const result = K * (Math.min(totalHeight, MAX) - MIN)
    return result
  }

  // ── 测量 ──

  private measureNode(node: NodeDesc, options: LayoutOptions, styleEngine?: StyleEngine | null, state?: SheetState | null): NodeSize {
    // 从 StyleEngine 读取 margin 作为 padding（对齐 snowbrush topicView.bounds）
    const padding = this.getNodePadding(node, options, styleEngine, state)

    if (hasNonTitleParts(node)) {
      const result = measurePartAwareNode(node, { ...options, nodePadding: padding }, styleEngine, state)
      return {
        width: result.width,
        height: result.height,
        titleWidth: result.titleWidth,
        titleHeight: result.titleHeight,
        partBounds: result.partBounds,
        outsidePadding: { top: 0, bottom: 0, left: 0, right: 0 },
      }
    }
    const result = measureTitleOnlyNode(node, padding, options, styleEngine, state)
    return {
      width: result.width,
      height: result.height,
      titleWidth: result.titleWidth,
      titleHeight: result.titleHeight,
      partBounds: result.partBounds,
      outsidePadding: { top: 0, bottom: 0, left: 0, right: 0 },
    }
  }

  private getNodePadding(node: NodeDesc, options: LayoutOptions, styleEngine?: StyleEngine | null, state?: SheetState | null): { top: number; right: number; bottom: number; left: number } {
    if (!styleEngine || !state) return options.nodePadding
    const readVal = (key: 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight'): number => {
      const val = styleEngine.getStyleValue(state, node.id, key)
      if (typeof val === 'number') return val
      if (typeof val === 'string') { const n = parseFloat(val); return isNaN(n) ? 0 : n }
      return 0
    }
    // snowbrush getTopicMargins: margin + borderWidth
    // borderWidth 从 DEFAULT_STYLES 读取（对齐 SB 的 stableStyles，不受文件主题影响）
    const nodeType = classifyNode(state.doc, node.id)
    const defaults = (DEFAULT_STYLES as Record<string, Record<string, unknown>>)[nodeType] ?? DEFAULT_STYLES['mainTopic']
    const rawBw = defaults['borderWidth']
    const bw = typeof rawBw === 'string' ? parseFloat(rawBw) : (typeof rawBw === 'number' ? rawBw : 0)
    const top = readVal('marginTop') + bw
    const bottom = readVal('marginBottom') + bw
    const left = readVal('marginLeft') + bw
    const right = readVal('marginRight') + bw
    if (top === 0 && bottom === 0 && left === 0 && right === 0) return options.nodePadding
    return { top, right, bottom, left }
  }

  private measureSubtree(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: StyleEngine | null, state?: SheetState | null): void {
    sizeMap.set(node.id, this.measureNode(node, options, styleEngine, state))
    if (!isCollapsed(node)) {
      for (const child of getAttachedChildren(node)) {
        this.measureSubtree(child, options, sizeMap, styleEngine, state)
      }
      for (const summary of getSummaryChildren(node)) {
        sizeMap.set(summary.id, this.measureNode(summary, options, styleEngine, state))
      }
    }
  }

  // ── 间距计算 ──

  private getSpacingMajor(options: LayoutOptions, node?: NodeDesc, styleEngine?: StyleEngine | null, state?: SheetState | null): number {
    if (node) return this.getNodeSpacingMajor(node, options, styleEngine, state)
    return options.horizontalGap
  }

  private getAdaptiveSpacingMinor(
    parentHeight: number,
    children: readonly NodeDesc[],
    sizeMap: Map<string, NodeSize>,
  ): number {
    const MIN_TOP_BOTTOM_SPACING = 80
    const MAX_TOP_BOTTOM_SPACING = 180
    const PARENT_TOPIC_THRESHOLD = 230

    let topBottomSpacing = MIN_TOP_BOTTOM_SPACING
    if (parentHeight > PARENT_TOPIC_THRESHOLD) {
      topBottomSpacing = Math.min(
        MAX_TOP_BOTTOM_SPACING,
        parentHeight - PARENT_TOPIC_THRESHOLD + topBottomSpacing,
      )
    }

    const n = children.length
    if (n <= 2) return topBottomSpacing

    let sumSpacing = topBottomSpacing
    for (let i = 1; i < n - 1; i++) {
      const childSize = sizeMap.get(children[i].id)
      if (childSize) sumSpacing -= childSize.height
    }
    return sumSpacing
  }

  // ── 权重计算（对齐 snowbrush calcNumRight）───

  private getWeight(node: NodeDesc, sizeMap: Map<string, NodeSize>): number {
    const size = sizeMap.get(node.id)
    return (size?.height ?? 0) + 20 * 1.5
  }

  private calcNumRight(
    children: readonly NodeDesc[],
    sizeMap: Map<string, NodeSize>,
  ): number {
    if (children.length <= 1) return children.length

    let totalWeight = 0
    for (const child of children) {
      totalWeight += this.getWeight(child, sizeMap)
    }

    const halfWeight = totalWeight / 2
    let accWeight = 0

    for (let i = 0; i < children.length; i++) {
      accWeight += this.getWeight(children[i], sizeMap)
      if (accWeight >= halfWeight) {
        const diffAt = Math.abs(accWeight - halfWeight)
        const prevWeight = accWeight - this.getWeight(children[i], sizeMap)
        const diffBefore = Math.abs(prevWeight - halfWeight)
        return diffAt < diffBefore ? i + 1 : i
      }
    }

    return Math.ceil(children.length / 2)
  }

  // ── 递归子树高度 ──

  /**
   * 递归计算子树在主轴方向的总高度（含 outsidePadding + 所有后代）。
   * 对齐 snowbrush boundaryBounds.height = mergeBounds(topic.bounds, children.boundaryBounds)
   */
  private calcSubtreeHeight(
    node: NodeDesc,
    sizeMap: Map<string, NodeSize>,
    parent: NodeDesc,
    childIndex: number,
    treeDir: 'right' | 'left',
    styleEngine?: StyleEngine | null,
    state?: SheetState | null,
  ): number {
    const size = sizeMap.get(node.id)!
    const selfH = size.height

    if (isCollapsed(node)) return selfH

    const children = getAttachedChildren(node)
    const regularChildren: NodeDesc[] = []
    for (const child of children) {
      if (child.type !== 'summary') regularChildren.push(child)
    }
    if (regularChildren.length === 0) return selfH

    // snowbrush: minorSpacing 来自父节点（当前 node 是子节点们的父）
    const rawMinor = (styleEngine && state)
      ? styleEngine.getStyleValue(state, node.id, 'spacingMinor')
      : undefined
    const nodeSpacingMinor = typeof rawMinor === 'number' ? rawMinor : parseInt(String(rawMinor)) || 0

    let childrenTotal = 0
    const lineWidth = 1 // borderWidth，对齐 SB
    for (let i = 0; i < regularChildren.length; i++) {
      childrenTotal += this.calcSubtreeHeight(regularChildren[i], sizeMap, node, i, treeDir, styleEngine, state)
      if (i < regularChildren.length - 1) childrenTotal += nodeSpacingMinor + lineWidth
    }

    // snowbrush mergeBounds: bounds = merge(topicView.bounds, children.boundaryBounds)
    // 近似: 当 children 跨度 > topicHeight 时 ≈ childrenTotal
    return Math.max(selfH, childrenTotal)
  }

  // ── 核心布局：bottom-up recursive ──

  /**
   * Bottom-up recursive layout: recursively lays out ALL children first,
   * then positions them. Returns boundaryBounds (position-independent, relative to node's origin).
   */
  private layoutNode(
    node: NodeDesc,
    x: number,
    y: number,
    options: LayoutOptions,
    sizeMap: Map<string, NodeSize>,
    nodes: Map<string, import('./layout-engine').NodeLayout>,
    boundaryBoundsMap: Map<string, BoundaryBounds> | undefined,
    styleEngine?: StyleEngine | null,
    state?: SheetState | null,
    localBBMap: Map<string, BoundaryBounds> = new Map(),
    subtreeHeightMap?: Map<string, number>,
  ): { width: number; height: number; boundaryBounds: BoundaryBounds } {
    const size = sizeMap.get(node.id)!
    const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node, styleEngine, state), options)

    // Leaf or collapsed: boundaryBounds = node's own size
    if (isCollapsed(node)) {
      const bb: BoundaryBounds = { x: 0, y: 0, width: size.width, height: size.height }
      localBBMap.set(node.id, bb)
      nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height, partBounds: size.partBounds })
      return { width: size.width, height: size.height, boundaryBounds: bb }
    }

    const children = getAttachedChildren(node)
    const regularChildren: NodeDesc[] = []
    for (const child of children) {
      if (child.type !== 'summary') regularChildren.push(child)
    }

    // No regular children: leaf-like
    if (regularChildren.length === 0) {
      const bb: BoundaryBounds = { x: 0, y: 0, width: size.width, height: size.height }
      localBBMap.set(node.id, bb)
      nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height, partBounds: size.partBounds })
      this.positionSummaries(node, regularChildren, nodes, options, sizeMap, styleEngine, state)
      return { width: size.width, height: size.height, boundaryBounds: bb }
    }

    // Compute split point
    let numRight: number
    if (!this.config.balanced) {
      const attrsNumRight = node.attrs.numRight
      if (typeof attrsNumRight === 'number' && attrsNumRight >= 0 && attrsNumRight <= regularChildren.length) {
        numRight = attrsNumRight
      } else {
        numRight = this.calcNumRight(regularChildren, sizeMap)
      }
    } else {
      numRight = this.calcNumRight(regularChildren, sizeMap)
    }

    const spacingMajor = this.getSpacingMajor(options, node, styleEngine, state)

    // Assign left/right children based on direction
    let rightChildren: readonly NodeDesc[]
    let leftChildren: readonly NodeDesc[]

    const isClockwise = this.config.direction === 'clockwise'
    if (isClockwise) {
      rightChildren = regularChildren.slice(0, numRight)
      leftChildren = regularChildren.slice(numRight).reverse()
    } else {
      leftChildren = regularChildren.slice(0, numRight)
      rightChildren = regularChildren.slice(numRight).reverse()
    }

    // Calculate outward distance (uses subtreeHeightMap from first pass)
    const outwardOffsetRight = this.calcOutwardDistance(rightChildren, sizeMap, subtreeHeightMap)
    const outwardOffsetLeft = this.calcOutwardDistance(leftChildren, sizeMap, subtreeHeightMap)

    // Set node position (branchHeight will be updated after children are laid out)
    nodes.set(node.id, {
      x, y,
      width: size.width, height: size.height,
      titleWidth, titleHeight,
      branchHeight: 0,
      partBounds: size.partBounds,
    })

    // Layout right side: recursively lay out all right children, then position them
    if (rightChildren.length > 0) {
      const childX = x + size.width + spacingMajor + outwardOffsetRight
      const childY = y + size.height / 2
      this.layoutSide(rightChildren, childX, childY, size.height, 'right', options, sizeMap, nodes, boundaryBoundsMap, node, styleEngine, state, localBBMap)
    }

    // Layout left side: recursively lay out all left children, then position them
    if (leftChildren.length > 0) {
      const childX = x - spacingMajor - outwardOffsetLeft
      const childY = y + size.height / 2
      this.layoutSide(leftChildren, childX, childY, size.height, 'left', options, sizeMap, nodes, boundaryBoundsMap, node, styleEngine, state, localBBMap)
    }

    // Compute boundaryBounds (SB mergeBounds: topic merged with children's subtree extents)
    // X: use positioned children's actual extent (correct)
    let bbMinX = 0
    let bbMaxX = size.width

    for (const child of regularChildren) {
      const nl = nodes.get(child.id)
      const childBB = localBBMap.get(child.id)
      if (!nl || !childBB) continue
      const relX = nl.x - x
      bbMinX = Math.min(bbMinX, relX + childBB.x)
      bbMaxX = Math.max(bbMaxX, relX + childBB.x + childBB.width)
    }

    // Y/Height: use childrenTotalHeight (sum of bb.height + outsidePad + spacing)
    // to include full subtree extent, not positioned centering which clips to parent size.
    // This matches layoutSide's childrenTotalHeight calculation (step d).
    const rawSm = (styleEngine && state)
      ? styleEngine.getStyleValue(state, node.id, 'spacingMinor')
      : undefined
    const bbSpacingMinor = typeof rawSm === 'number' ? rawSm : parseInt(String(rawSm)) || 0
    const bbLineWidth = 1

    let childrenTotalHeight = 0
    for (let i = 0; i < regularChildren.length; i++) {
      const childBB = localBBMap.get(regularChildren[i].id)
      const childSize = sizeMap.get(regularChildren[i].id)
      const op = childSize?.outsidePadding
      const outsidePadH = (op?.top ?? 0) + (op?.bottom ?? 0)
      childrenTotalHeight += (childBB?.height ?? 0) + outsidePadH
      if (i < regularChildren.length - 1) childrenTotalHeight += bbSpacingMinor + bbLineWidth
    }

    const bbHeight = Math.max(size.height, childrenTotalHeight)

    const boundaryBounds: BoundaryBounds = {
      x: bbMinX,
      y: -(bbHeight - size.height) / 2,
      width: bbMaxX - bbMinX,
      height: bbHeight,
    }
    localBBMap.set(node.id, boundaryBounds)

    // Update branchHeight to boundaryBounds.height (SB-aligned)
    const nodeLayout = nodes.get(node.id)
    if (nodeLayout) nodeLayout.branchHeight = boundaryBounds.height

    this.positionSummaries(node, regularChildren, nodes, options, sizeMap, styleEngine, state)

    return { width: size.width, height: size.height, boundaryBounds }
  }

  /**
   * Bottom-up recursive layout for one side (right or left).
   *
   * 1. Recursively lays out each child (calling layoutNode — bottom-up)
   * 2. Reads children's boundaryBounds from localBBMap
   * 3. Computes positions using SB-style cumulative centering
   * 4. Shifts each subtree to its final position
   * 5. Applies X offset alignment if boundaryBoundsMap is provided
   */
  private layoutSide(
    children: readonly NodeDesc[],
    startX: number,
    startY: number,
    parentHeight: number,
    side: 'right' | 'left',
    options: LayoutOptions,
    sizeMap: Map<string, NodeSize>,
    nodes: Map<string, import('./layout-engine').NodeLayout>,
    boundaryBoundsMap: Map<string, BoundaryBounds> | undefined,
    parent: NodeDesc,
    styleEngine?: StyleEngine | null,
    state?: SheetState | null,
    localBBMap: Map<string, BoundaryBounds> = new Map(),
  ): void {
    const n = children.length
    if (n === 0) return

    const treeDir = side === 'right' ? 'right' as const : 'left' as const
    const rawMinor = (styleEngine && state)
      ? styleEngine.getStyleValue(state, parent.id, 'spacingMinor')
      : undefined
    const spacingMinor = typeof rawMinor === 'number' ? rawMinor : parseInt(String(rawMinor)) || 0
    const lineWidth = 1 // borderWidth

    // Step a: Set outsidePadding for each child
    for (let i = 0; i < n; i++) {
      const size = sizeMap.get(children[i].id)!
      size.outsidePadding = computeOutsidePadding(parent, i, treeDir)
    }

    // Step b: Layout each child at temp Y=0 (bottom-up: recursively lays out grandchildren first)
    for (let i = 0; i < n; i++) {
      this.layoutNode(children[i], startX, 0, options, sizeMap, nodes, boundaryBoundsMap, styleEngine, state, localBBMap)
    }

    // Step c: Read each child's boundaryBounds from localBBMap
    const childBBs: BoundaryBounds[] = []
    for (let i = 0; i < n; i++) {
      const bb = localBBMap.get(children[i].id)
      if (bb) {
        childBBs.push(bb)
      } else {
        const s = sizeMap.get(children[i].id)
        childBBs.push({ x: 0, y: 0, width: s?.width ?? 0, height: s?.height ?? 0 })
      }
    }

    // Step d: Compute childrenTotalHeight = sum(bb.height + outsidePad + spacingMinor + lineWidth)
    let childrenTotalHeight = 0
    for (let i = 0; i < n; i++) {
      const outsidePad = sizeMap.get(children[i].id)?.outsidePadding
      const outsidePadHeight = (outsidePad?.top ?? 0) + (outsidePad?.bottom ?? 0)
      childrenTotalHeight += childBBs[i].height + outsidePadHeight
      if (i < n - 1) childrenTotalHeight += spacingMinor + lineWidth
    }

    // Step e: Center children around startY (SB-style)
    let currentChildY = startY - childrenTotalHeight / 2

    // Step f: Shift each child to its final Y position
    for (let i = 0; i < n; i++) {
      const child = children[i]
      const bb = childBBs[i]
      const outsidePad = sizeMap.get(child.id)?.outsidePadding
      const finalY = currentChildY + (outsidePad?.top ?? 0) - bb.y
      this.shiftSubtree(child, 0, finalY, nodes)
      const outsidePadHeight = (outsidePad?.top ?? 0) + (outsidePad?.bottom ?? 0)
      currentChildY += bb.height + outsidePadHeight + spacingMinor + lineWidth
    }

    // Step g: X offset alignment if boundaryBoundsMap provided
    if (boundaryBoundsMap) {
      const { maxOffset } = this.calcMaxOffset(children, nodes, boundaryBoundsMap, side)
      if (maxOffset > 0) {
        const dx = side === 'right' ? maxOffset : -maxOffset
        for (let i = 0; i < n; i++) {
          this.shiftSubtree(children[i], dx, 0, nodes)
        }
      }
    }
  }

  // ── Summary 定位 ──

  private positionSummaries(
    parent: NodeDesc,
    regularChildren: readonly NodeDesc[],
    nodes: Map<string, import('./layout-engine').NodeLayout>,
    options: LayoutOptions,
    sizeMap: Map<string, NodeSize>,
    styleEngine?: StyleEngine | null,
    state?: SheetState | null,
  ): void {
    const childPositions = new Map<string, { x: number; y: number; width: number; height: number }>()
    for (const child of regularChildren) {
      const nl = nodes.get(child.id)
      if (nl) childPositions.set(child.id, { x: nl.x, y: nl.y, width: nl.width, height: nl.height })
    }

    const summaryPositions = layoutSummaries(parent, regularChildren, childPositions, 'right', sizeMap)

    const summaryChildren = getSummaryChildren(parent)
    for (const [summaryId, pos] of summaryPositions) {
      const summarySize = sizeMap.get(summaryId)
      if (!summarySize) continue
      const summaryNode = summaryChildren.find(s => s.id === summaryId)
      const { width: titleWidth, height: titleHeight } = summaryNode
        ? measureTextSize(getTitle(summaryNode), getFontSize(summaryNode, styleEngine, state), options)
        : { width: 0, height: 0 }
      nodes.set(summaryId, {
        x: pos.x, y: pos.y,
        width: summarySize.width, height: summarySize.height,
        titleWidth, titleHeight,
        branchHeight: summarySize.height,
        partBounds: summarySize.partBounds,
      })
    }
  }
}

// ─── 导出算法 ───

export const mapClockwiseLayoutAlgorithm = new MapLayout({
  name: 'map-clockwise',
  direction: 'clockwise',
  balanced: true,
})

export const mapAnticlockwiseLayoutAlgorithm = new MapLayout({
  name: 'map-anticlockwise',
  direction: 'anticlockwise',
  balanced: true,
})

export const mapUnbalancedLayoutAlgorithm = new MapLayout({
  name: 'map-unbalanced',
  direction: 'clockwise',
  balanced: false,
})
