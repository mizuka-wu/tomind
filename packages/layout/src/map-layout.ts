/**
 * Map Layout — 思维导图布局（map-clockwise / map-anticlockwise / map-unbalanced）
 *
 * 继承 BaseLayout，复用公共定位算法。
 * 对齐 snowbrush basemap.ts + map.ts 的布局逻辑。
 */
import type { NodeDesc } from '@tomind/schema'
import type { SheetState } from '@tomind/state'
import type { StyleEngine } from '@tomind/style'
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

  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine?: StyleEngine | null, state?: SheetState | null): LayoutResult {
        const nodes = new Map<string, import('./layout-engine').NodeLayout>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    this.measureSubtree(root, options, sizeMap, styleEngine, state)

    const rootX = options.rootOffsetX
    const rootY = 0

    // 第一遍：计算位置（无 boundaryBounds）
    this.layoutNode(root, rootX, rootY, options, sizeMap, nodes, undefined, styleEngine, state)

    // 计算 boundaryBounds
    const boundaryBoundsMap = new Map<string, BoundaryBounds>()
    this.computeBoundaryBounds(root, nodes, boundaryBoundsMap)

    // 从第一遍结果提取子树高度，供 outward distance 使用
    const subtreeHeightMap = new Map<string, number>()
    for (const [id, nl] of nodes) {
      subtreeHeightMap.set(id, nl.branchHeight)
    }

    // 第二遍：用 boundaryBounds 做 X offset 对齐
    const nodes2 = new Map<string, import('./layout-engine').NodeLayout>()
    this.layoutNode(root, rootX, rootY, options, sizeMap, nodes2, boundaryBoundsMap, styleEngine, state, subtreeHeightMap)

    // 不做 normalizePositions — 保持原始坐标（对齐 snowbrush 坐标系）
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
    if (hasNonTitleParts(node)) {
      const result = measurePartAwareNode(node, options, styleEngine, state)
      return {
        width: result.width,
        height: result.height,
        titleWidth: result.titleWidth,
        titleHeight: result.titleHeight,
        partBounds: result.partBounds,
        outsidePadding: { top: 0, bottom: 0, left: 0, right: 0 },
      }
    }
    const result = measureTitleOnlyNode(node, options.nodePadding, options, styleEngine, state)
    return {
      width: result.width,
      height: result.height,
      titleWidth: result.titleWidth,
      titleHeight: result.titleHeight,
      partBounds: result.partBounds,
      outsidePadding: { top: 0, bottom: 0, left: 0, right: 0 },
    }
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
   * 对齐 snowbrush boundaryBounds.height。
   */
  private calcSubtreeHeight(
    node: NodeDesc,
    sizeMap: Map<string, NodeSize>,
    parent: NodeDesc,
    childIndex: number,
    treeDir: 'right' | 'left',
    spacingMinor: number,
  ): number {
    const size = sizeMap.get(node.id)!
    const outsidePad = computeOutsidePadding(parent, childIndex, treeDir)
    const selfH = size.height + outsidePad.top + outsidePad.bottom

    if (isCollapsed(node)) return selfH

    const children = getAttachedChildren(node)
    const regularChildren: NodeDesc[] = []
    for (const child of children) {
      if (child.type !== 'summary') regularChildren.push(child)
    }
    if (regularChildren.length === 0) return selfH

    let childrenTotal = 0
    for (let i = 0; i < regularChildren.length; i++) {
      childrenTotal += this.calcSubtreeHeight(regularChildren[i], sizeMap, node, i, treeDir, spacingMinor)
      if (i < regularChildren.length - 1) childrenTotal += spacingMinor
    }

    return Math.max(selfH, childrenTotal)
  }

  // ── 核心布局 ──

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
    subtreeHeightMap?: Map<string, number>,
  ): void {
    const size = sizeMap.get(node.id)!
    const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node, styleEngine, state), options)

    if (isCollapsed(node)) {
      nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height, partBounds: size.partBounds })
      return
    }

    const children = getAttachedChildren(node)
    const regularChildren: NodeDesc[] = []
    for (const child of children) {
      if (child.type !== 'summary') regularChildren.push(child)
    }

    if (regularChildren.length === 0) {
      nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height, partBounds: size.partBounds })
      this.positionSummaries(node, regularChildren, nodes, options, sizeMap, styleEngine, state)
      return
    }

    // 计算分割点
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

    // 根据方向分配左右子节点
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

    // 计算两侧总高度（用于 branchHeight）
    const rawMinorNode = (styleEngine && state)
      ? styleEngine.getStyleValue(state, node.id, 'spacingMinor')
      : undefined
    const minorSpacing = typeof rawMinorNode === 'number' ? rawMinorNode : 0
    const rightTotalH = rightChildren.reduce((sum, c) => sum + (sizeMap.get(c.id)?.height ?? 0), 0)
      + Math.max(0, rightChildren.length - 1) * minorSpacing
    const leftTotalH = leftChildren.reduce((sum, c) => sum + (sizeMap.get(c.id)?.height ?? 0), 0)
      + Math.max(0, leftChildren.length - 1) * minorSpacing

    nodes.set(node.id, {
      x, y,
      width: size.width, height: size.height,
      titleWidth, titleHeight,
      branchHeight: Math.max(rightTotalH, leftTotalH),
      partBounds: size.partBounds,
    })

    // snowbrush: x = topicView.bounds.x + topicView.bounds.width + spacingMajor
    // topicView.bounds = 节点自身 (x, width)，不含子节点

    // 对齐 snowbrush: calcOutwardDistanceByAttachedChildren
    const outwardOffsetRight = this.calcOutwardDistance(rightChildren, sizeMap, subtreeHeightMap)
    const outwardOffsetLeft = this.calcOutwardDistance(leftChildren, sizeMap, subtreeHeightMap)

    // 布局右侧子节点
    if (rightChildren.length > 0) {
      const childX = x + size.width + spacingMajor + outwardOffsetRight
      const childY = y + size.height / 2
      this.layoutSide(rightChildren, childX, childY, size.height, 'right', options, sizeMap, nodes, boundaryBoundsMap, node, styleEngine, state, subtreeHeightMap)
    }

    // 布局左侧子节点
    if (leftChildren.length > 0) {
      const childX = x - spacingMajor - outwardOffsetLeft
      const childY = y + size.height / 2
      this.layoutSide(leftChildren, childX, childY, size.height, 'left', options, sizeMap, nodes, boundaryBoundsMap, node, styleEngine, state, subtreeHeightMap)
    }

    this.positionSummaries(node, regularChildren, nodes, options, sizeMap, styleEngine, state)
  }

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
    subtreeHeightMap?: Map<string, number>,
  ): void {
    const n = children.length
    if (n === 0) return

    const treeDir = side === 'right' ? 'right' as const : 'left' as const
    // snowbrush: spacingMinor = branch.figure.minorSpacing ?? 0（来自样式系统）
    // 不要用 getAdaptiveSpacingMinor（那是 minSumTopicSpacing，不是 spacingMinor）
    const rawMinor = (styleEngine && state)
      ? styleEngine.getStyleValue(state, parent.id, 'spacingMinor')
      : undefined
    const spacingMinor = typeof rawMinor === 'number' ? rawMinor : 0

    // 设置 outsidePadding
    for (let i = 0; i < n; i++) {
      const size = sizeMap.get(children[i].id)!
      size.outsidePadding = computeOutsidePadding(parent, i, treeDir)
    }

    // 使用基类的 snowbrush 对齐算法
    // snowbrush boundaryBounds.y = -outsidePad.top
    const yPos = this.calcCumulativePositions(
      children,
      spacingMinor,
      (child) => sizeMap.get(child.id)!.height,
      (child, i) => this.calcSubtreeHeight(child, sizeMap, parent, i, treeDir, spacingMinor),
      parentHeight,
      (_child, i) => -(sizeMap.get(children[i].id)?.outsidePadding?.top ?? 0),
      undefined, // topicView.bounds.y 通常为 0
    )

    // 父节点居中于首尾子节点之间
    const firstChildCenter = yPos[0] + sizeMap.get(children[0].id)!.height / 2
    const lastChildCenter = yPos[n - 1] + sizeMap.get(children[n - 1].id)!.height / 2
    const childrenCenterY = (firstChildCenter + lastChildCenter) / 2
    const firstChildY = startY - childrenCenterY

    // 放置子节点
    for (let i = 0; i < n; i++) {
      const child = children[i]
      const size = sizeMap.get(child.id)!
      const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(child), getFontSize(child, styleEngine, state), options)
      const cy = firstChildY + yPos[i]
      nodes.set(child.id, {
        x: startX, y: cy,
        width: size.width, height: size.height,
        titleWidth, titleHeight,
        branchHeight: size.height,
        partBounds: size.partBounds,
      })
      this.layoutNode(child, startX, cy, options, sizeMap, nodes, boundaryBoundsMap, styleEngine, state, subtreeHeightMap)
    }

    // X offset 对齐（对齐 snowbrush getMapOfXOffSetByBranchIndex）
    // snowbrush: 所有正常子节点用同一个 maxOffset
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
