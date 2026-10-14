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
  isElbowLineClass,
} from './layout-utils'
import { computeOutsidePadding } from './boundary-padding'
import type { OutsidePadding } from './boundary-padding'
import { layoutSummaries, getSummaryChildren } from './summary-layout'
import { layoutLogicSubtree } from './logic-layout'
import type { LogicNodeLayout } from './logic-layout'


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
  /**
   * 主题盒原点（SB branch position = **shape 中心**）到盒顶的距离 = shapeHeight/2。
   * SB 的 boundaryBounds / topicView.bounds.y 都以原点为参考（bounds.y = -originY），
   * 有 labels 时 height > shapeHeight，原点不在盒中心。
   */
  originY: number
  titleWidth: number
  titleHeight: number
  partBounds?: Map<string, { x: number; y: number; width: number; height: number }>
  outsidePadding: OutsidePadding
  /** 子树高度（boundaryBounds.height 近似），用于 calcNumRight 权重 */
  subtreeHeight: number
}

const MAX_BRANCH_POSITION_REALIGN_OFFSET = 30
const BRANCH_POSITION_REALIGN_RATIO = 0.15

// ─── callout 布局上下文 ───

/** 以 callout 主题盒左上角为 (0,0) 的子树布局结果（layoutLogicSubtree(co, 0, 0, …)） */
interface CalloutSub {
  nodes: Map<string, LogicNodeLayout>
  /** 子树包围盒，参考帧 = callout 的**原点（shape 中心）**，等于 SB callout.boundaryBounds */
  bb: { x: number; y: number; width: number; height: number }
}

/**
 * callout 的布局上下文：
 * - `sideOf`：每条非中央分支的生效 logic 侧（SB 的 callout 结构类要继承它）
 * - `subs`：callout 子树在**局部帧**里的布局结果。
 *   SB 的 `calCalloutChildrenPos` 在 `calBoundsAndChildrenPos` 内就把 callout 的
 *   boundaryBounds 并进父分支的 `newBounds`（→ `branch.bounds`），而这个 bounds 又会被
 *   父层级拿去算 X 对齐偏移（Step g）与子树高（outward）——所以 callout 子树必须在
 *   **bottom-up 阶段**就先算出来（局部帧与绝对位置无关），最后再平移到最终位置。
 */
interface CalloutCtx {
  sideOf: Map<string, 'left' | 'right'>
  subs: Map<string, CalloutSub>
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

    const calloutCtx: CalloutCtx = { sideOf: new Map(), subs: new Map() }

    // First pass: compute positions and localBBMap (position-independent boundaryBounds)
    const localBBMap = new Map<string, BoundaryBounds>()
    this.layoutNode(root, rootX, rootY, options, sizeMap, nodes, styleEngine, state, localBBMap, undefined, true, null, calloutCtx)

    // Derive subtreeHeightMap from localBBMap for calcOutwardDistance
    const subtreeHeightMap = new Map<string, number>()
    for (const [id, bb] of localBBMap) {
      subtreeHeightMap.set(id, bb.height)
    }

    // Second pass: subtreeHeightMap 已知，calcOutwardDistance 得到最终值
    const nodes2 = new Map<string, import('./layout-engine').NodeLayout>()
    this.layoutNode(root, rootX, rootY, options, sizeMap, nodes2, styleEngine, state, new Map(), subtreeHeightMap, true, null, calloutCtx)

    // callout 后置遍历：此时每条分支都已在最终位置（layoutSide Step f/g 的 shiftSubtree 之后），
    // 把 bottom-up 阶段算好的局部帧子树平移过去
    this.placeAllCallouts(root, true, null, nodes2, sizeMap, calloutCtx, options, styleEngine ?? null, state ?? null)

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
      if (isElbowLineClass(ls)) return 0
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
        originY: result.shapeHeight / 2,
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
      originY: result.shapeHeight / 2,
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
    styleEngine?: StyleEngine | null,
    state?: SheetState | null,
    localBBMap: Map<string, BoundaryBounds> = new Map(),
    subtreeHeightMap?: Map<string, number>,
    isMapRoot: boolean = false,
    /** 非中央节点：子节点全部放在这一侧（对齐 snowbrush LOGICLEFT/RIGHT） */
    forceSide: 'left' | 'right' | null = null,
    calloutCtx?: CalloutCtx,
  ): { width: number; height: number; boundaryBounds: BoundaryBounds } {
    const size = sizeMap.get(node.id)!
    if (forceSide && calloutCtx) calloutCtx.sideOf.set(node.id, forceSide)

    // SB abstractstructure.calCalloutChildrenPos：callout 的 boundaryBounds 会并进
    // 父分支的 newBounds（→ branch.bounds），父层级再拿它算 X 对齐偏移（Step g）与子树高。
    // 与绝对位置无关，所以在 bottom-up 阶段就能算（局部帧 = 本节点主题盒左上角）。
    const calloutLocals = this.computeCalloutLocals(
      node, isMapRoot, forceSide, size, sizeMap, calloutCtx, options, styleEngine ?? null, state ?? null,
    )
    const withCallouts = (bb: BoundaryBounds): BoundaryBounds => {
      if (calloutLocals.length === 0) return bb
      let minX = bb.x
      let maxX = bb.x + bb.width
      let minY = bb.y
      let maxY = bb.y + bb.height
      for (const c of calloutLocals) {
        minX = Math.min(minX, c.ox + c.bb.x)
        maxX = Math.max(maxX, c.ox + c.bb.x + c.bb.width)
        minY = Math.min(minY, c.oy + c.bb.y)
        maxY = Math.max(maxY, c.oy + c.bb.y + c.bb.height)
      }
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
    }
    // titleWidth/titleHeight 直接取测量结果：measureNode 已按主题 fontFamily/fontWeight
    // 测过一遍，这里再用默认字体重算会和 size.width 用的值不一致（同一节点两套标题宽）
    const titleWidth = size.titleWidth
    const titleHeight = size.titleHeight

    // Leaf or collapsed: boundaryBounds = node's own size
    if (isCollapsed(node)) {
      const bb: BoundaryBounds = withCallouts({ x: 0, y: 0, width: size.width, height: size.height })
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
      const bb: BoundaryBounds = withCallouts({ x: 0, y: 0, width: size.width, height: size.height })
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
      const childY = y + size.originY
      // 子树方向：中央节点的右侧子树继续向右（LOGICRIGHT），左侧向左（LOGICLEFT）
      this.layoutSide(rightChildren, childX, childY, size.height, 'right', options, sizeMap, nodes, node, styleEngine, state, localBBMap, 'right', isMapRoot, calloutCtx)
    }

    // Layout left side: recursively lay out all left children, then position them
    if (leftChildren.length > 0) {
      const childX = x - spacingMajor - outwardOffsetLeft
      const childY = y + size.originY
      this.layoutSide(leftChildren, childX, childY, size.height, 'left', options, sizeMap, nodes, node, styleEngine, state, localBBMap, 'left', isMapRoot, calloutCtx)
    }

    // callout 不在这里放：layoutSide Step b 用**临时 y=0** 递归子节点、Step f 才 shiftSubtree
    // 到最终位置，而 shiftSubtree 只走 attached —— 在这里放 callout 会拿到临时 y
    // （实测挂在主分支上的 callout dy 差 1532px）。统一挪到 layout() 的 placeAllCallouts 后置遍历。

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

    const boundaryBounds: BoundaryBounds = withCallouts({
      x: bbMinX,
      y: bbMinY,
      width: bbMaxX - bbMinX,
      height: bbMaxY - bbMinY,
    })
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
   * 5. Applies X offset alignment (SB getOffsetForChildBranchView)
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
    parent: NodeDesc,
    styleEngine?: StyleEngine | null,
    state?: SheetState | null,
    localBBMap: Map<string, BoundaryBounds> = new Map(),
    /** 传递给子节点的单侧方向（LOGICLEFT/RIGHT） */
    childForceSide: 'left' | 'right' | null = null,
    isMapRoot: boolean = false,
    calloutCtx?: CalloutCtx,
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
      this.layoutNode(children[i], startX, 0, options, sizeMap, nodes, styleEngine, state, localBBMap, undefined, false, childForceSide, calloutCtx)
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
    /** SB child.topicView.bounds.y = -originY（shape 中心为原点，有 labels 时 ≠ -height/2） */
    const topicYs: number[] = []
    for (let i = 0; i < n; i++) {
      const cs = sizeMap.get(children[i].id)
      const h = cs?.height ?? childBBs[i].height
      const oy = cs?.originY ?? h / 2
      heights.push(h)
      topicYs.push(-oy)
      // localBBMap 的 bb 相对**盒顶**，SB 的 boundaryBounds 相对**原点** → 减 originY
      bbYc.push(childBBs[i].y - oy)
      spans.push(childBBs[i].height)
    }

    // Step e: 子节点中心相对父节点中心的 Y —— 移植 snowbrush 公式
    const centers: number[] = []
    // SB isNeedRedolayout 的 childrenSize 两套结构口径不同，各自算好：
    //   basemap.calSidePos        → Σ(bbH + spacingMinor) - spacingMinor
    //   logicleftandright         → 循环后的 currentChildY - spacingMinor - lineWidth
    //                               = childrenY + totalH（含起点，通常约为 totalH/2）
    let realignChildrenHeight = 0
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
        const preTopicY = topicYs[i - 1]
        const nowTopicY = topicYs[i]
        const boundaryConstraint = yPos[i - 1] + bbYc[i - 1] + spans[i - 1] + spacingMinor - bbYc[i]
        const topicConstraint = yPos[i - 1] + preTopicY + heights[i - 1] + sumTopicSpacing / (n - i) - nowTopicY
        yPos[i] = Math.max(boundaryConstraint, topicConstraint)
        sumTopicSpacing -= yPos[i] + nowTopicY - (yPos[i - 1] + preTopicY + heights[i - 1])
      }
      const parentPosRelativeToFirstChild = (yPos[0] + yPos[n - 1]) / 2
      for (let i = 0; i < n; i++) centers.push(yPos[i] - parentPosRelativeToFirstChild)
      realignChildrenHeight = spans.reduce((a, b, i) => a + b + (i < n - 1 ? spacingMinor : 0), 0)
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
      realignChildrenHeight = childrenY + totalH
    }

    // Step e2: posYoffsetToClosestChild 重对齐（两种结构共用，阈值口径按结构区分）
    let realignOffset = 0
    const maxRealignOffset = Math.min(MAX_BRANCH_POSITION_REALIGN_OFFSET, realignChildrenHeight * BRANCH_POSITION_REALIGN_RATIO)
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
    const parentCenterY = parentNL ? parentNL.y + (sizeMap.get(parent.id)?.originY ?? parentNL.height / 2) : startY
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
      const dy = desiredCenterY - (nl.y + (sizeMap.get(child.id)?.originY ?? nl.height / 2))
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

    // Step g: X offset alignment
    // 对齐 snowbrush getMapOfXOffSetByBranchIndexFromBranchList + getOffsetForChildBranchView：
    // xOffset 是 branch 局部量（topicView.bounds 与 boundaryBounds 同帧相减），
    // 与绝对坐标无关；普通分支统一取同侧 max。
    {
      const { offsets } = this.calcSideXOffsets(children, localBBMap, sizeMap, side)
      for (let i = 0; i < n; i++) {
        const offset = offsets[i] ?? 0
        if (offset > 0) {
          const dx = side === 'right' ? offset : -offset
          this.shiftSubtree(children[i], dx, 0, nodes)
        }
      }
    }
  }

  /**
   * 放置 callout 子树（后置遍历，必须在所有分支的最终位置确定之后调用）
   *
   * SB 的 callout 是一条**正常 branchView**：
   * - 位置 = 父主题盒原点（shape 中心）+ `model.position`（`abstractstructure` 里再过一遍
   *   OldHitDetect 防重叠，TM 未移植，见 skill 的已知差距）
   * - 它的 attached 子树按 `getStructureClass(callout)` 布局，而
   *   `utils/branch.getViewStructure` 对 callout 走
   *   `parentStruct.getCalloutStructure(parent, callout)`：
   *     · basemap 系（map / map.clockwise / map.anticlockwise / map.unbalanced）
   *       → `position.x <= 0 ? LOGICLEFT : LOGICRIGHT`（**<=**，x=0 归左）
   *     · timeline.horizontal / timeline.vertical → 结构自身
   *     · 其余（AbstractStructure 默认）→ `getChildStructure(STRUCTURECLASS, 0, parent)`，
   *       logic.left/right 的 getChildStructure 直接返回 parentStructure → **继承父分支的侧**
   *   （探针实测 test-callout-branch：挂在 logic.right 主分支上的 callout = logic.right、
   *    挂在 logic.left 主分支上的 = logic.left，与 model.position 符号无关）
   *
   * 旧实现两处错：
   * 1. 在 `layoutNode` 内联调用 → 非中央分支那时还是 layoutSide Step b 的**临时 y=0**，
   *    而 Step f 的 `shiftSubtree` 只走 attached，callout 永远留在临时帧
   *    （实测挂在主分支上的 callout dy 差 1532.5px）。
   * 2. 只放 callout 自己 + 它自己的 callout，**完全不布局 attached 子树**
   *    （test-callout-children：SB 256 个节点，TM 只有 238，缺 18 = 3 callout × 6 后代）。
   */
  private placeAllCallouts(
    node: NodeDesc,
    isMapRoot: boolean,
    /** node 自身的生效 logic 侧（中央主题为 null） */
    selfSide: 'left' | 'right' | null,
    nodes: Map<string, import('./layout-engine').NodeLayout>,
    sizeMap: Map<string, NodeSize>,
    ctx: CalloutCtx,
    options: LayoutOptions,
    styleEngine: StyleEngine | null,
    state: SheetState | null,
  ): void {
    const parentNL = nodes.get(node.id)
    if (parentNL) {
      const callouts = (node.children as Record<string, readonly NodeDesc[]> | undefined)?.callout ?? []
      const parentSize = sizeMap.get(node.id)
      const pcx = parentNL.x + parentNL.width / 2
      // 父主题盒原点（shape 中心）：callout 的 model.position 相对它
      const pcy = parentNL.y + (parentSize?.originY ?? parentNL.height / 2)
      for (const co of callouts) {
        const pos = getAttr<{ x?: number; y?: number }>(co, 'position')
        if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') continue
        const cs = sizeMap.get(co.id) ?? this.measureNode(co, options, styleEngine, state)
        sizeMap.set(co.id, cs)
        // callout 盒顶 = 原点 - originY（SB setPosition 定位的是 shape 中心）
        const coLeft = pcx + pos.x - cs.width / 2
        const coOriginY = pcy + pos.y
        const coTop = coOriginY - cs.originY
        const coSide = this.calloutSide(isMapRoot, selfSide, node.id, ctx, pos.x)
        // 子树在 bottom-up 阶段已按局部帧算好（callout 盒左上角 = (0,0)），这里只做平移。
        // 只有 callout 子树里的 callout 走不到 layoutNode → 现场补算（同一套局部帧代码）。
        let sub = ctx.subs.get(co.id)
        if (!sub) {
          sub = this.layoutCalloutSub(co, coSide, options, styleEngine, state)
          ctx.subs.set(co.id, sub)
        }
        const own = sub.nodes.get(co.id)
        const dx = coLeft - (own?.x ?? 0)
        const dy = coTop - (own?.y ?? 0)
        for (const [id, nl] of sub.nodes) {
          if (id === co.id) continue
          nodes.set(id, { ...nl, x: nl.x + dx, y: nl.y + dy })
        }
        nodes.set(co.id, {
          x: coLeft,
          y: coTop,
          width: cs.width,
          height: cs.height,
          titleWidth: cs.titleWidth,
          titleHeight: cs.titleHeight,
          branchHeight: sub.bb.height,
          partBounds: cs.partBounds,
        })
        // callout 子树里每条 branch 自己的 callout（SB 对每条 branch 都放）；
        // placeAllCallouts 末尾会自己走 co 的 attached 子节点，不用再调一次
        this.placeAllCallouts(co, false, coSide, nodes, sizeMap, ctx, options, styleEngine, state)
      }
    }
    this.walkAttachedForCallouts(node, selfSide, nodes, sizeMap, ctx, options, styleEngine, state)
  }

  /** 递归 attached 子节点，为每个节点放它自己的 callout（侧向从 sideOf 取，缺省继承父侧） */
  private walkAttachedForCallouts(
    node: NodeDesc,
    inheritSide: 'left' | 'right' | null,
    nodes: Map<string, import('./layout-engine').NodeLayout>,
    sizeMap: Map<string, NodeSize>,
    ctx: CalloutCtx,
    options: LayoutOptions,
    styleEngine: StyleEngine | null,
    state: SheetState | null,
  ): void {
    if (isCollapsed(node)) return
    for (const child of getAttachedChildren(node)) {
      if (child.type === 'summary') continue
      const side = ctx.sideOf.get(child.id) ?? inheritSide
      this.placeAllCallouts(child, false, side, nodes, sizeMap, ctx, options, styleEngine, state)
    }
  }

  /**
   * SB `getCalloutStructure(parent, callout)` 的侧向：
   * - 父是中央主题（basemap 系：map / map.clockwise / map.anticlockwise / map.unbalanced）
   *   → `position.x <= 0 ? LOGICLEFT : LOGICRIGHT`（**<=**，x=0 归左）
   * - 其余（AbstractStructure 默认 = `getChildStructure(STRUCTURECLASS, 0, parent)`，
   *   logic.left/right 的 getChildStructure 直接返回 parentStructure）→ **继承父分支的侧**
   *   （探针实测：挂在 logic.right 主分支上、position.x = -300 的 callout 仍是 logic.right，
   *    子树朝右；误用符号判定会把整棵子树翻到左边）
   */
  private calloutSide(
    isMapRoot: boolean,
    selfSide: 'left' | 'right' | null,
    nodeId: string,
    ctx: CalloutCtx | undefined,
    posX: number,
  ): 'left' | 'right' {
    if (isMapRoot) return posX > 0 ? 'right' : 'left'
    return selfSide ?? ctx?.sideOf.get(nodeId) ?? 'right'
  }

  /** 以 callout 主题盒左上角为 (0,0) 布局它的 attached 子树（一棵 logic 子树） */
  private layoutCalloutSub(
    co: NodeDesc,
    side: 'left' | 'right',
    options: LayoutOptions,
    styleEngine: StyleEngine | null,
    state: SheetState | null,
  ): CalloutSub {
    const r = layoutLogicSubtree(co, 0, 0, options, styleEngine, state, side)
    // layoutLogicSubtree 的 bb：bbX/bbW 相对主题盒中心 X，bb.y/height 相对原点（shape 中心）Y
    // —— 正是 SB boundaryBounds 的参考帧
    return { nodes: r.nodes, bb: { x: r.bbX, y: r.bb.y, width: r.bbW, height: r.bb.height } }
  }

  /**
   * 算出 node 的所有 callout 在**局部帧**（原点 = node 主题盒左上角）里的原点与 bb，
   * 并把子树布局缓存进 ctx.subs（供 placeAllCallouts 平移复用）。
   * 对应 SB `abstractstructure.calCalloutChildrenPos` 里对 `newBounds` 的合并：
   *   newBounds.x = min(x, position.x + calloutBounds.x)
   *   newBounds.width = max(width, maxRight - x)      // = 并集
   *   y / height 同理
   * ⚠️ SB 的 `position` 是过完 OldHitDetect 的修正值，TM 未移植 hit-detect → 用 model.position
   * （探针实测：离树足够远的 callout shiftFromModel = {0,0}，此时两边完全一致）。
   */
  private computeCalloutLocals(
    node: NodeDesc,
    isMapRoot: boolean,
    forceSide: 'left' | 'right' | null,
    size: NodeSize,
    sizeMap: Map<string, NodeSize>,
    ctx: CalloutCtx | undefined,
    options: LayoutOptions,
    styleEngine: StyleEngine | null,
    state: SheetState | null,
  ): Array<{ id: string; ox: number; oy: number; bb: { x: number; y: number; width: number; height: number } }> {
    const callouts = (node.children as Record<string, readonly NodeDesc[]> | undefined)?.callout ?? []
    if (callouts.length === 0) return []
    const out: Array<{ id: string; ox: number; oy: number; bb: { x: number; y: number; width: number; height: number } }> = []
    for (const co of callouts) {
      const pos = getAttr<{ x?: number; y?: number }>(co, 'position')
      if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') continue
      let cs = sizeMap.get(co.id)
      if (!cs) {
        cs = this.measureNode(co, options, styleEngine, state)
        sizeMap.set(co.id, cs)
      }
      const side = this.calloutSide(isMapRoot, forceSide, node.id, ctx, pos.x)
      let sub = ctx?.subs.get(co.id)
      if (!sub) {
        sub = this.layoutCalloutSub(co, side, options, styleEngine, state)
        ctx?.subs.set(co.id, sub)
      }
      out.push({
        id: co.id,
        // callout 原点在本节点主题盒帧里的位置
        ox: size.width / 2 + pos.x,
        oy: size.originY + pos.y,
        bb: sub.bb,
      })
    }
    return out
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
