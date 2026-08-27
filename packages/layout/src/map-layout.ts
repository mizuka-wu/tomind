/**
 * Map Layout — 思维导图布局（map-clockwise / map-anticlockwise / map-unbalanced）
 *
 * 继承 BaseLayout，复用公共定位算法。
 * 对齐 snowbrush basemap.ts + map.ts 的布局逻辑。
 */
import type { NodeDesc } from '@tomind/schema'
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
import { computeOutsidePadding, computeMasterOutsidePadding } from './boundary-padding'
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
  override readonly name: string
  private readonly config: MapLayoutConfig
  private _styleEngine: import('@tomind/style').StyleEngine | null = null
  private _state: import('@tomind/state').SheetState | null = null

  constructor(config: MapLayoutConfig) {
    super()
    this.config = config
    this.name = config.name
  }

  layout(
    doc: NodeDesc,
    options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS,
    styleEngine: import('@tomind/style').StyleEngine | null = null,
    state: import('@tomind/state').SheetState | null = null,
  ): LayoutResult {
    this._styleEngine = styleEngine
    this._state = state
    const nodes = new Map<string, import('./layout-engine').NodeLayout>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    this.measureSubtree(root, options, sizeMap)

    const rootX = 0
    const rootY = 0

    // 第一遍：计算位置（无 boundaryBounds）
    this.layoutNode(root, rootX, rootY, options, sizeMap, nodes, undefined)

    // 计算 boundaryBounds
    const boundaryBoundsMap = new Map<string, BoundaryBounds>()
    this.computeBoundaryBounds(root, nodes, boundaryBoundsMap)

    // 第二遍：用 boundaryBounds 做 X offset 对齐
    const nodes2 = new Map<string, import('./layout-engine').NodeLayout>()
    this.layoutNode(root, rootX, rootY, options, sizeMap, nodes2, boundaryBoundsMap)

    // 平移到正数区
    const { totalWidth, totalHeight } = this.normalizePositions(nodes2)
    return { nodes: nodes2, totalWidth, totalHeight }
  }

  // ── 测量 ──

  private measureNode(node: NodeDesc, options: LayoutOptions): NodeSize {
    if (hasNonTitleParts(node)) {
      const result = measurePartAwareNode(node, options)
      return {
        width: result.width,
        height: result.height,
        titleWidth: result.titleWidth,
        titleHeight: result.titleHeight,
        partBounds: result.partBounds,
        outsidePadding: { top: 0, bottom: 0, left: 0, right: 0 },
      }
    }
    const result = measureTitleOnlyNode(node, options.nodePadding, options)
    return {
      width: result.width,
      height: result.height,
      titleWidth: result.titleWidth,
      titleHeight: result.titleHeight,
      partBounds: result.partBounds,
      outsidePadding: { top: 0, bottom: 0, left: 0, right: 0 },
    }
  }

  private measureSubtree(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>): void {
    sizeMap.set(node.id, this.measureNode(node, options))
    if (!isCollapsed(node)) {
      for (const child of getAttachedChildren(node)) {
        this.measureSubtree(child, options, sizeMap)
      }
      for (const summary of getSummaryChildren(node)) {
        sizeMap.set(summary.id, this.measureNode(summary, options))
      }
    }
  }

  // ── 间距计算 ──

  private getSpacingMajor(node: NodeDesc, options: LayoutOptions): number {
    // 对齐 snowbrush calcSpacingMajor: majorSpacing + patch
    // 大多数 map 节点 majorSpacing=0, patch=0 → spacingMajor=0
    // 间距完全靠 boundary 对齐（maxOffset）提供
    if (this._styleEngine && this._state) {
      const val = this._styleEngine.getStyleValue(this._state, node.id, 'spacingMajor')
      if (typeof val === 'number' && !isNaN(val)) return val
    }
    return 0
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

  // ── 扇形外扩 ──

  private calcOutwardDistance(
    children: readonly NodeDesc[],
    sizeMap: Map<string, NodeSize>,
  ): number {
    const CHILDREN_COUNT_LIMIT = 8
    const K = 0.15
    const MIN = 400
    const MAX = 800

    if (children.length < CHILDREN_COUNT_LIMIT) return 0

    const totalHeight = children.reduce((sum, child) => {
      const size = sizeMap.get(child.id)
      return sum + (size?.height ?? 0)
    }, 0)

    if (totalHeight <= MIN) return 0
    return K * (Math.min(totalHeight, MAX) - MIN)
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
  ): void {
    const size = sizeMap.get(node.id)!
    const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node), options)

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
      this.positionSummaries(node, regularChildren, nodes, options, sizeMap)
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

    const spacingMajor = this.getSpacingMajor(node, options)

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
    const minorSpacing = this.getAdaptiveSpacingMinor(size.height, regularChildren, sizeMap)
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

    // 布局右侧子节点（对齐 snowbrush: x = parentRight + spacingMajor）
    if (rightChildren.length > 0) {
      const childX = x + size.width + spacingMajor
      const childY = y + size.height / 2
      this.layoutSide(rightChildren, childX, childY, size.height, 'right', options, sizeMap, nodes, boundaryBoundsMap, node)
    }

    // 布局左侧子节点（对齐 snowbrush: x = parentLeft - spacingMajor）
    if (leftChildren.length > 0) {
      const childX = x - spacingMajor
      const childY = y + size.height / 2
      this.layoutSide(leftChildren, childX, childY, size.height, 'left', options, sizeMap, nodes, boundaryBoundsMap, node)
    }

    this.positionSummaries(node, regularChildren, nodes, options, sizeMap)
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
  ): void {
    const n = children.length
    if (n === 0) return

    const treeDir = side === 'right' ? 'right' as const : 'left' as const
    const spacingMinor = this.getAdaptiveSpacingMinor(parentHeight, children, sizeMap)

    // 设置 outsidePadding
    for (let i = 0; i < n; i++) {
      const size = sizeMap.get(children[i].id)!
      size.outsidePadding = computeOutsidePadding(parent, i, treeDir)
    }

    // 使用基类的 snowbrush 对齐算法
    const yPos = this.calcCumulativePositions(
      children,
      spacingMinor,
      (child) => sizeMap.get(child.id)!.height,
      (child, i) => this.calcSubtreeHeight(child, sizeMap, parent, i, treeDir, spacingMinor),
      parentHeight,
    )

    // 父节点居中于首尾子节点之间
    const firstChildCenter = yPos[0] + sizeMap.get(children[0].id)!.height / 2
    const lastChildCenter = yPos[n - 1] + sizeMap.get(children[n - 1].id)!.height / 2
    const childrenCenterY = (firstChildCenter + lastChildCenter) / 2
    const firstChildY = startY - childrenCenterY

    // posYoffsetToClosestChild（对齐 snowbrush）
    let posYoffsetToClosestChild = Infinity
    for (let i = 0; i < n; i++) {
      const childCenterY = firstChildY + yPos[i] + sizeMap.get(children[i].id)!.height / 2
      const offset = childCenterY - startY
      if (Math.abs(offset) < Math.abs(posYoffsetToClosestChild)) {
        posYoffsetToClosestChild = offset
      }
    }

    // 放置子节点
    for (let i = 0; i < n; i++) {
      const child = children[i]
      const size = sizeMap.get(child.id)!
      const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(child), getFontSize(child), options)
      const cy = firstChildY + yPos[i] - posYoffsetToClosestChild
      nodes.set(child.id, {
        x: startX, y: cy,
        width: size.width, height: size.height,
        titleWidth, titleHeight,
        branchHeight: size.height,
        partBounds: size.partBounds,
      })
      this.layoutNode(child, startX, cy, options, sizeMap, nodes, boundaryBoundsMap)
    }

    // X offset 对齐（对齐 snowbrush getMapOfXOffSetByBranchIndex）
    if (boundaryBoundsMap) {
      const { offsets, maxOffset } = this.calcMaxOffset(children, nodes, boundaryBoundsMap, side)
      for (let i = 0; i < n; i++) {
        const shift = maxOffset - offsets[i]
        if (shift > 0) {
          const dx = side === 'right' ? shift : -shift
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
        ? measureTextSize(getTitle(summaryNode), getFontSize(summaryNode), options)
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
