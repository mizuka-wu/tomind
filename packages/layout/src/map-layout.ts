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
import { findById } from '@tomind/style'
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
  getAttr,
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
  /** 子树高度（boundaryBounds.height 近似），用于 calcNumRight 权重 */
  subtreeHeight: number
}

const MAX_BRANCH_POSITION_REALIGN_OFFSET = 30
const BRANCH_POSITION_REALIGN_RATIO = 0.15

// ─── MapLayout 类 ───

class MapLayout extends BaseLayout {
  readonly name: string
  private readonly config: MapLayoutConfig

  constructor(config: MapLayoutConfig) {
    super()
    this.config = config
    this.name = config.name
  }

  private getNodeSpacingMajor(node: NodeDesc, options: LayoutOptions, styleEngine?: StyleEngine | null, state?: SheetState | null, _isRootLevel: boolean = false): number {
    if (options.getSpacingMajor) return options.getSpacingMajor(node)

    // 对齐 snowbrush calcSpacingMajor 逻辑
    if (styleEngine && state) {
      const lineClass = styleEngine.getStyleValue(state, node.id, 'lineClass')
      const lineClassStr = typeof lineClass === 'string' ? lineClass : ''

      // snowbrush: fold/roundedFold/bight → LINECOLPOS * 3 = 39px
      const FOLD_LINE_CLASSES = [
        'org.xmind.branchConnection.fold',
        'org.xmind.branchConnection.roundedfold',
        'org.xmind.branchConnection.bight',
      ]
      const isFold = FOLD_LINE_CLASSES.some(cls => lineClassStr.includes(cls))
      if (isFold) {
        // snowbrush basemap.calcSpacingMajor: fold 系 → LINECOLPOS * 3 + patchGap
        return 39 + this.getLineEndPatchGap(node, styleEngine, state)
      }

      // 其他连接线：读取 spacingMajor 样式值
      let spacingMajor = 0
      const raw = styleEngine.getStyleValue(state, node.id, 'spacingMajor')
      if (typeof raw === 'number' && raw > 0) {
        spacingMajor = raw
      } else if (typeof raw === 'string') {
        const parsed = parseFloat(raw)
        if (!isNaN(parsed) && parsed > 0) spacingMajor = parsed
      }
      if (spacingMajor <= 0) spacingMajor = options.horizontalGap

      // snowbrush basemap/AbstractStructure.calcSpacingMajor: map 系不翻倍，仅 major + patchGap
      // （翻倍只发生在 logic / org-chart 结构）
      return spacingMajor + this.getLineEndPatchGap(node, styleEngine, state)
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
    this.layoutNode(root, rootX, rootY, options, sizeMap, nodes, undefined, styleEngine, state, localBBMap, undefined, true)

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
    this.layoutNode(root, rootX, rootY, options, sizeMap, nodes2, boundaryBoundsMap, styleEngine, state, new Map(), subtreeHeightMap, true)

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
    parentId?: string,
    styleEngine?: StyleEngine | null,
    state?: SheetState | null,
  ): number {
    const CHILDREN_COUNT_LIMIT = 8
    const K = 0.15
    const MIN = 400
    const MAX = 800

    if (children.length < CHILDREN_COUNT_LIMIT) return 0
    // snowbrush: 仅当连接线非 elbow/roundedElbow 时才外扩
    if (styleEngine && state) {
      const v = styleEngine.getStyleValue(state, parentId ?? '', 'lineClass')
      const ls = typeof v === 'string' ? v : ''
      if (ls.includes('elbow')) return 0
    }
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
      const result = measurePartAwareNode(node, options, styleEngine, state, padding)
      return {
        width: result.width,
        height: result.height,
        titleWidth: result.titleWidth,
        titleHeight: result.titleHeight,
        partBounds: result.partBounds,
        outsidePadding: { top: 0, bottom: 0, left: 0, right: 0 },
        subtreeHeight: result.height,
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
      subtreeHeight: result.height,
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
    // snowbrush getTopicMargins: margin + borderWidth（borderWidth 跟随主题解析值）
    const rawBw = styleEngine.getStyleValue(state, node.id, 'borderWidth')
    const bw = typeof rawBw === 'string' ? (parseFloat(rawBw) || 0) : (typeof rawBw === 'number' ? rawBw : 0)
    // 对齐 snowbrush getTopicMargins：先读统一 margin，有值则四方向使用，否则 fallback 到分侧值
    // ResolvedStyle 没有 margin 键，所以从节点原始 attrs.style.margin 读取
    const node2 = findById(state.doc, node.id)
    const rawStyle = node2 ? getAttr<Record<string, unknown>>(node2, 'style') : undefined
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
        top = readVal('marginTop')
        bottom = readVal('marginBottom')
        left = readVal('marginLeft')
        right = readVal('marginRight')
      }
    } else {
      top = readVal('marginTop')
      bottom = readVal('marginBottom')
      left = readVal('marginLeft')
      right = readVal('marginRight')
    }

    top += bw; bottom += bw; left += bw; right += bw
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
    // bottom-up 累加子树高度（对齐 snowbrush boundaryBounds.height）
    this.computeSubtreeHeight(node, sizeMap)
  }

  private computeSubtreeHeight(node: NodeDesc, sizeMap: Map<string, NodeSize>): number {
    const size = sizeMap.get(node.id)
    if (!size) return 0
    if (isCollapsed(node)) {
      size.subtreeHeight = size.height
      return size.subtreeHeight
    }
    const children = getAttachedChildren(node).filter(c => c.type !== 'summary')
    if (children.length === 0) {
      size.subtreeHeight = size.height
      return size.subtreeHeight
    }
    let childSum = 0
    for (const child of children) {
      childSum += this.computeSubtreeHeight(child, sizeMap)
    }
    // 近似 spacingMinor=0 时的子树高度
    size.subtreeHeight = Math.max(size.height, childSum)
    return size.subtreeHeight
  }

  // ── 间距计算 ──

  private getParentBorderWidth(node: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null): number {
    if (!styleEngine || !state) return 0
    const v = styleEngine.getStyleValue(state, node.id, 'borderWidth')
    const n2 = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
    return Number.isFinite(n2) ? n2 : 0
  }

  /** 侧向父子水平间距 = spacingMajor(+翻倍/patch) + outward（仅中央分支按侧计算 outward） */
  private getSideSpacingMajor(node: NodeDesc, options: LayoutOptions, styleEngine: StyleEngine | null, state: SheetState | null, isMapRoot: boolean): number {
    return this.getNodeSpacingMajor(node, options, styleEngine, state, isMapRoot)
  }

  private getSpacingMajor(options: LayoutOptions, node?: NodeDesc, styleEngine?: StyleEngine | null, state?: SheetState | null, isRootLevel: boolean = false): number {
    if (node) return this.getNodeSpacingMajor(node, options, styleEngine, state, isRootLevel)
    return options.horizontalGap
  }

  /**
   * 对齐 snowbrush getLineEndSpacingPatchGap：
   * 有箭头（arrow-end-class != none）时，间距补 lineWidth * arrowSizeRatio(4) + LINE_SPACING(16)
   */
  private getLineEndPatchGap(node: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null): number {
    if (!styleEngine || !state) return 0
    const arrow = styleEngine.getStyleValue(state, node.id, 'arrowEndClass')
    const hasArrow = typeof arrow === 'string' && arrow !== '' && !arrow.includes('none')
    if (!hasArrow) return 0
    const lwRaw = styleEngine.getStyleValue(state, node.id, 'lineWidth')
    const lw = typeof lwRaw === 'number' ? lwRaw : parseFloat(String(lwRaw ?? '')) || 0
    return lw * 4 + 16
  }


  private getWeight(node: NodeDesc, sizeMap: Map<string, NodeSize>): number {
    // snowbrush calcNumRight: weight = boundaryBounds.height + (PADDING/2)*3
    const size = sizeMap.get(node.id)
    return (size?.subtreeHeight ?? size?.height ?? 0) + 30
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
    isMapRoot: boolean = false,
    /** 非中央节点：子节点全部放在这一侧（对齐 snowbrush LOGICLEFT/RIGHT） */
    forceSide: 'left' | 'right' | null = null,
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
    let rightChildren: readonly NodeDesc[]
    let leftChildren: readonly NodeDesc[]

    if (forceSide) {
      // 非中央节点：全部子节点单侧堆叠（LOGICLEFT / LOGICRIGHT）
      if (forceSide === 'right') {
        rightChildren = regularChildren
        leftChildren = []
      } else {
        leftChildren = regularChildren
        rightChildren = []
      }
    } else {
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

      const isClockwise = this.config.direction === 'clockwise'
      if (isClockwise) {
        rightChildren = regularChildren.slice(0, numRight)
        leftChildren = regularChildren.slice(numRight).reverse()
      } else {
        leftChildren = regularChildren.slice(0, numRight)
        rightChildren = regularChildren.slice(numRight).reverse()
      }
    }

    const spacingMajor = this.getSpacingMajor(options, node, styleEngine, state, isMapRoot)

    // Calculate outward distance (uses subtreeHeightMap from first pass)
    const outwardOffsetRight = this.calcOutwardDistance(rightChildren, sizeMap, subtreeHeightMap, node.id, styleEngine, state)
    const outwardOffsetLeft = this.calcOutwardDistance(leftChildren, sizeMap, subtreeHeightMap, node.id, styleEngine, state)

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
      // 子树方向：中央节点的右侧子树继续向右（LOGICRIGHT），左侧向左（LOGICLEFT）
      this.layoutSide(rightChildren, childX, childY, size.height, 'right', options, sizeMap, nodes, boundaryBoundsMap, node, styleEngine, state, localBBMap, 'right', isMapRoot)
    }

    // Layout left side: recursively lay out all left children, then position them
    if (leftChildren.length > 0) {
      const childX = x - spacingMajor - outwardOffsetLeft
      const childY = y + size.height / 2
      this.layoutSide(leftChildren, childX, childY, size.height, 'left', options, sizeMap, nodes, boundaryBoundsMap, node, styleEngine, state, localBBMap, 'left', isMapRoot)
    }

    // callout 子节点：SB 用 model position（sheet 坐标，原点=中央主题中心）直接放置
    this.placeCallouts(node, x, y, size, options, sizeMap, nodes, styleEngine ?? null, state ?? null)

    // Compute boundaryBounds (SB mergeBounds: topic merged with children's actual extents)
    let bbMinX = 0
    let bbMaxX = size.width
    let bbMinY = 0
    let bbMaxY = size.height

    for (const child of regularChildren) {
      const nl = nodes.get(child.id)
      const childBB = localBBMap.get(child.id)
      if (!nl || !childBB) continue
      const relX = nl.x - x
      const relY = nl.y - y
      bbMinX = Math.min(bbMinX, relX + childBB.x)
      bbMaxX = Math.max(bbMaxX, relX + childBB.x + childBB.width)
      bbMinY = Math.min(bbMinY, relY + childBB.y)
      bbMaxY = Math.max(bbMaxY, relY + childBB.y + childBB.height)
    }

    const boundaryBounds: BoundaryBounds = {
      x: bbMinX,
      y: bbMinY,
      width: bbMaxX - bbMinX,
      height: bbMaxY - bbMinY,
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
    /** 传递给子节点的单侧方向（LOGICLEFT/RIGHT） */
    childForceSide: 'left' | 'right' | null = null,
    isMapRoot: boolean = false,
  ): void {
    const n = children.length
    if (n === 0) return

    const treeDir = side === 'right' ? 'right' as const : 'left' as const
    const rawMinor = (styleEngine && state)
      ? styleEngine.getStyleValue(state, parent.id, 'spacingMinor')
      : undefined
    const spacingMinor = typeof rawMinor === 'number' ? rawMinor : parseInt(String(rawMinor)) || 0

    // Step a: Set outsidePadding for each child
    for (let i = 0; i < n; i++) {
      const size = sizeMap.get(children[i].id)!
      size.outsidePadding = computeOutsidePadding(parent, i, treeDir)
    }

    // Step b: Layout each child at temp Y=0 (bottom-up: recursively lays out grandchildren first)
    for (let i = 0; i < n; i++) {
      this.layoutNode(children[i], startX, 0, options, sizeMap, nodes, boundaryBoundsMap, styleEngine, state, localBBMap, undefined, false, childForceSide)
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

    // Step d: 子树包围盒（相对子节点中心）
    const bbYc: number[] = []
    const spans: number[] = []
    const heights: number[] = []
    for (let i = 0; i < n; i++) {
      const h = sizeMap.get(children[i].id)?.height ?? childBBs[i].height
      heights.push(h)
      bbYc.push(childBBs[i].y - h / 2)
      spans.push(childBBs[i].height)
    }

    // Step e: 子节点中心相对父节点中心的 Y —— 移植 snowbrush 公式
    const centers: number[] = []
    if (isMapRoot) {
      // snowbrush basemap.calSidePos（仅中央分支）
      const minTopBottomSpacing = 80
      const maxTopBottomSpacing = 180
      const parentTopicThreshold = 230
      let topBottomSpacing = minTopBottomSpacing
      if (parentHeight > parentTopicThreshold) {
        topBottomSpacing = Math.min(maxTopBottomSpacing, parentHeight - parentTopicThreshold + minTopBottomSpacing)
      }
      let sumTopicSpacing = topBottomSpacing
      if (n > 2) {
        for (let i = 1; i < n - 1; i++) sumTopicSpacing -= spans[i]
      }
      const yPos: number[] = [0]
      for (let i = 1; i < n; i++) {
        const preTopicY = -heights[i - 1] / 2
        const nowTopicY = -heights[i] / 2
        const boundaryConstraint = yPos[i - 1] + bbYc[i - 1] + spans[i - 1] + spacingMinor - bbYc[i]
        const topicConstraint = yPos[i - 1] + preTopicY + heights[i - 1] + sumTopicSpacing / (n - i) - nowTopicY
        yPos[i] = Math.max(boundaryConstraint, topicConstraint)
        sumTopicSpacing -= yPos[i] + nowTopicY - (yPos[i - 1] + preTopicY + heights[i - 1])
      }
      const parentPosRelativeToFirstChild = (yPos[0] + yPos[n - 1]) / 2
      for (let i = 0; i < n; i++) centers.push(yPos[i] - parentPosRelativeToFirstChild)
    } else {
      // snowbrush logicleftandright.calAttachedChildrenPos（非中央层级）
      const ms = spacingMinor + this.getParentBorderWidth(parent, styleEngine ?? null, state ?? null)
      const totalH = spans.reduce((a, b) => a + b, 0) + (n - 1) * ms
      const childrenY = (bbYc[n - 1] + spans[n - 1] - bbYc[0] - totalH) / 2 + bbYc[0]
      let cum = childrenY
      for (let i = 0; i < n; i++) {
        centers.push(cum - bbYc[i])
        cum += spans[i] + ms
      }
    }

    // Step e2: posYoffsetToClosestChild 重对齐（两种结构共用）
    let realignOffset = 0
    let childrenHeight = 0
    for (let i = 0; i < n; i++) childrenHeight += spans[i] + (i < n - 1 ? spacingMinor : 0)
    const maxRealignOffset = Math.min(MAX_BRANCH_POSITION_REALIGN_OFFSET, childrenHeight * BRANCH_POSITION_REALIGN_RATIO)
    if (n >= 3) {
      let offset = centers[0]
      for (const c of centers) if (Math.abs(c) < Math.abs(offset)) offset = c
      if (Math.abs(offset) < maxRealignOffset) {
        realignOffset = offset
        for (let i = 0; i < n; i++) centers[i] -= offset
      }
    }

    // Step f: 移动到最终位置（Y 由 centers 决定，X 按列对齐）
    const parentNL = nodes.get(parent.id)
    const parentCenterY = parentNL ? parentNL.y + parentNL.height / 2 : startY
    const parentLeft = parentNL ? parentNL.x : startX
    const parentWidth = parentNL ? parentNL.width : 0
    const spanMap = new Map<string, number>()
    for (let i = 0; i < n; i++) spanMap.set(children[i].id, spans[i])
    const outward = this.calcOutwardDistance(children, sizeMap, spanMap, parent.id, styleEngine ?? null, state ?? null)
    // SB isFreePositionBranch: topicPositioning=free 且 mainTopic 且父结构为 map 时尊重存储 position
    const freePositioning = (state?.doc?.attrs as Record<string, unknown> | undefined)?.topicPositioning === 'free'
    for (let i = 0; i < n; i++) {
      const child = children[i]
      const nl = nodes.get(child.id)
      if (!nl) continue
      const childW = sizeMap.get(child.id)?.width ?? nl.width
      const freePos = (freePositioning && isMapRoot)
        ? (child.attrs as Record<string, unknown> | undefined)?.position as { x?: number; y?: number } | undefined
        : undefined
      const desiredCenterY = (freePos && typeof freePos.y === 'number')
        ? parentCenterY + freePos.y - realignOffset
        : parentCenterY + centers[i]
      const dy = desiredCenterY - (nl.y + nl.height / 2)
      let desiredLeft: number
      if (freePos && typeof freePos.x === 'number') {
        desiredLeft = parentLeft + parentWidth / 2 + freePos.x - childW / 2
      } else if (side === 'right') {
        desiredLeft = parentLeft + parentWidth + this.getSideSpacingMajor(parent, options, styleEngine ?? null, state ?? null, isMapRoot) + outward
      } else {
        desiredLeft = parentLeft - this.getSideSpacingMajor(parent, options, styleEngine ?? null, state ?? null, isMapRoot) - outward - childW
      }
      const dx = desiredLeft - nl.x
      if (dx !== 0 || dy !== 0) this.shiftSubtree(child, dx, dy, nodes)
    }

    // Step g: X offset alignment if boundaryBoundsMap provided
    // 对齐 snowbrush getMapOfXOffSetByBranchIndex：按子节点各自偏移，而非整侧统一 maxOffset
    if (boundaryBoundsMap) {
      const { offsets } = this.calcMaxOffset(children, nodes, boundaryBoundsMap, side)
      for (let i = 0; i < n; i++) {
        const offset = offsets[i] ?? 0
        if (offset > 0) {
          const dx = side === 'right' ? offset : -offset
          this.shiftSubtree(children[i], dx, 0, nodes)
        }
      }
    }
  }

  /** 放置 callout 子节点（递归）：position 相对父主题中心（sheet 坐标原点=根中心） */
  private placeCallouts(
    node: NodeDesc,
    parentLeft: number,
    parentTop: number,
    parentSize: { width: number; height: number },
    options: LayoutOptions,
    sizeMap: Map<string, NodeSize>,
    nodes: Map<string, import('./layout-engine').NodeLayout>,
    styleEngine: StyleEngine | null,
    state: SheetState | null,
  ): void {
    const callouts = (node.children as Record<string, readonly NodeDesc[]> | undefined)?.callout ?? []
    const pcx = parentLeft + parentSize.width / 2
    const pcy = parentTop + parentSize.height / 2
    for (const co of callouts) {
      const pos = (co.attrs as Record<string, unknown> | undefined)?.position as { x?: number; y?: number } | undefined
      if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') continue
      let cs = sizeMap.get(co.id)
      if (!cs) {
        const padding = this.getNodePadding(co, options, styleEngine ?? null, state ?? null)
        const m = measureTitleOnlyNode(co, padding, options, styleEngine ?? null, state ?? null)
        cs = { width: m.width, height: m.height, titleWidth: m.titleWidth, titleHeight: m.titleHeight, partBounds: m.partBounds, outsidePadding: { top: 0, bottom: 0, left: 0, right: 0 }, subtreeHeight: m.height }
        sizeMap.set(co.id, cs)
      }
      nodes.set(co.id, {
        x: pcx + pos.x - cs.width / 2,
        y: pcy + pos.y - cs.height / 2,
        width: cs.width,
        height: cs.height,
        titleWidth: cs.titleWidth,
        titleHeight: cs.titleHeight,
        branchHeight: cs.height,
        partBounds: cs.partBounds,
      })
      this.placeCallouts(co, pcx + pos.x - cs.width / 2, pcy + pos.y - cs.height / 2, cs, options, sizeMap, nodes, styleEngine, state)
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
