import type { NodeDesc } from '@tomind/schema'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { hasNonTitleParts } from './part-measure'
import { measurePartAwareNode, measureTitleOnlyNode } from './part-node-size'
import {
  getTitle,
  getFontSize,
  isCollapsed,
  getAttachedChildren,
  findRootTopic,
} from './layout-utils'

// ─── 配置 ───

interface MapLayoutConfig {
  name: string
  /** clockwise: 前 numRight 个子节点在右侧；anticlockwise: 前 numRight 个在左侧 */
  direction: 'clockwise' | 'anticlockwise'
  /** false = 允许从节点 attrs.numRight 读取手动分割点 */
  balanced: boolean
}

// ─── 类型 ───

interface BoundaryBounds {
  x: number
  y: number
  width: number
  height: number
}

interface NodeSize {
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  partBounds?: Map<string, { x: number; y: number; width: number; height: number }>
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

// ─── 测量 ───

function measureNode(node: NodeDesc, options: LayoutOptions): NodeSize {
  if (hasNonTitleParts(node)) {
    const result = measurePartAwareNode(node, options)
    return {
      width: result.width,
      height: result.height,
      titleWidth: result.titleWidth,
      titleHeight: result.titleHeight,
      partBounds: result.partBounds,
    }
  }
  const result = measureTitleOnlyNode(node, options.nodePadding, options)
  return {
    width: result.width,
    height: result.height,
    titleWidth: result.titleWidth,
    titleHeight: result.titleHeight,
    partBounds: result.partBounds,
  }
}

function measureSubtree(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>): void {
  sizeMap.set(node.id, measureNode(node, options))
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureSubtree(child, options, sizeMap)
    }
  }
}

// ─── Boundary 计算 ───

function computeBoundaryBounds(
  node: NodeDesc,
  nodes: Map<string, NodeLayout>,
  boundaryBoundsMap: Map<string, BoundaryBounds>,
): BoundaryBounds {
  const nl = nodes.get(node.id)
  if (!nl) return { x: 0, y: 0, width: 0, height: 0 }

  let minX = nl.x
  let minY = nl.y
  let maxX = nl.x + nl.width
  let maxY = nl.y + nl.height

  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      const childBounds = computeBoundaryBounds(child, nodes, boundaryBoundsMap)
      minX = Math.min(minX, childBounds.x)
      minY = Math.min(minY, childBounds.y)
      maxX = Math.max(maxX, childBounds.x + childBounds.width)
      maxY = Math.max(maxY, childBounds.y + childBounds.height)
    }
  }

  const bounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
  boundaryBoundsMap.set(node.id, bounds)
  return bounds
}

/** 平移整棵子树的所有节点 */
function shiftSubtree(
  node: NodeDesc,
  dx: number,
  dy: number,
  nodes: Map<string, NodeLayout>,
): void {
  const nl = nodes.get(node.id)
  if (!nl) return
  nl.x += dx
  nl.y += dy
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      shiftSubtree(child, dx, dy, nodes)
    }
  }
}

// ─── 间距计算（对齐 snowbrush）───

const MIN_TOP_BOTTOM_SPACING = 80
const MAX_TOP_BOTTOM_SPACING = 180
const PARENT_TOPIC_THRESHOLD = 230

function getSpacingMajor(_node: NodeDesc, options: LayoutOptions): number {
  return options.horizontalGap
}

function getSpacingMinor(_node: NodeDesc, options: LayoutOptions): number {
  return options.verticalGap || 20
}

/**
 * 自适应垂直间距（对齐 snowbrush getMinSumTopicSpacing）
 * 根据父节点高度和子节点数量计算最小总间距
 */
function getAdaptiveSpacingMinor(
  parentHeight: number,
  children: readonly NodeDesc[],
  _options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
): number {
  let topBottomSpacing = MIN_TOP_BOTTOM_SPACING
  if (parentHeight > PARENT_TOPIC_THRESHOLD) {
    topBottomSpacing = Math.min(
      MAX_TOP_BOTTOM_SPACING,
      parentHeight - PARENT_TOPIC_THRESHOLD + topBottomSpacing,
    )
  }

  const n = children.length
  if (n <= 2) return topBottomSpacing

  // snowbrush: sumSpacing = topBottomSpacing - sum(middle children heights)
  // 当子节点多时，间距会被子节点高度"吃掉"，但保证首尾有足够空间
  let sumSpacing = topBottomSpacing
  for (let i = 1; i < n - 1; i++) {
    const childSize = sizeMap.get(children[i].id)
    if (childSize) sumSpacing -= childSize.height
  }
  return sumSpacing
}

// ─── 权重计算（对齐 snowbrush）───

function subtreeHeight(node: NodeDesc, sizeMap: Map<string, NodeSize>): number {
  const size = sizeMap.get(node.id)
  return size?.height ?? 0
}

function getWeight(node: NodeDesc, sizeMap: Map<string, NodeSize>): number {
  return subtreeHeight(node, sizeMap) + 20 * 1.5 // PADDING/2 * 3, PADDING=20
}

/**
 * 权重平衡的左右分配（对齐 snowbrush calcNumRight）
 * 累加权重到 halfWeight 找最佳分割点
 */
function calcNumRight(
  children: readonly NodeDesc[],
  sizeMap: Map<string, NodeSize>,
): number {
  if (children.length <= 1) return children.length

  let totalWeight = 0
  for (const child of children) {
    totalWeight += getWeight(child, sizeMap)
  }

  const halfWeight = totalWeight / 2
  let accWeight = 0

  for (let i = 0; i < children.length; i++) {
    accWeight += getWeight(children[i], sizeMap)
    if (accWeight >= halfWeight) {
      const diffAt = Math.abs(accWeight - halfWeight)
      const prevWeight = accWeight - getWeight(children[i], sizeMap)
      const diffBefore = Math.abs(prevWeight - halfWeight)
      return diffAt < diffBefore ? i + 1 : i
    }
  }

  return Math.ceil(children.length / 2)
}

// ─── 扇形外扩（对齐 snowbrush calcOutwardDistanceByAttachedChildren）───

function calcOutwardDistance(
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

// ─── 子节点布局 ───

function layoutSideChildren(
  children: readonly NodeDesc[],
  startX: number,
  startY: number,
  parentHeight: number,
  side: 'right' | 'left',
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, NodeLayout>,
  boundaryBoundsMap: Map<string, BoundaryBounds> | undefined,
): void {
  const n = children.length
  if (n === 0) return

  // 自适应间距
  const spacingMinor = getAdaptiveSpacingMinor(parentHeight, children, options, sizeMap)

  // 计算子节点位置（相对于第一个子节点）
  let totalHeight = 0
  const yPosArr: number[] = []
  for (let i = 0; i < n; i++) {
    yPosArr.push(totalHeight)
    const size = sizeMap.get(children[i].id)!
    totalHeight += size.height
    if (i < n - 1) totalHeight += spacingMinor
  }

  const posYoffset = totalHeight / 2

  for (let i = 0; i < n; i++) {
    const child = children[i]
    const size = sizeMap.get(child.id)!
    const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(child), getFontSize(child), options)
    const cy = startY + yPosArr[i] - posYoffset + size.height / 2
    nodes.set(child.id, {
      x: startX, y: cy,
      width: size.width, height: size.height,
      titleWidth, titleHeight,
      branchHeight: size.height,
      partBounds: size.partBounds,
    })
    layoutSubtreeInner(child, startX, cy, options, sizeMap, nodes, boundaryBoundsMap)
  }

  // ─── X offset 对齐（对齐 snowbrush getMapOfXOffSetByBranchIndex）───
  // 使同侧兄弟的 boundary 内边缘对齐（而非 topic 边缘）
  if (boundaryBoundsMap) {
    // 计算每个子节点的内边缘偏移
    const offsets: number[] = []
    let maxOffset = 0
    for (let i = 0; i < n; i++) {
      const child = children[i]
      const nl = nodes.get(child.id)
      const bb = boundaryBoundsMap.get(child.id)
      if (!nl || !bb) { offsets.push(0); continue }

      let offset: number
      if (side === 'right') {
        // 右侧子节点：boundary 向左延伸的距离
        offset = nl.x - bb.x
      } else {
        // 左侧子节点：boundary 向右延伸的距离
        offset = (bb.x + bb.width) - (nl.x + nl.width)
      }
      offsets.push(Math.max(0, offset))
      maxOffset = Math.max(maxOffset, offsets[i])
    }

    // 平移子树使内边缘对齐
    for (let i = 0; i < n; i++) {
      const shift = maxOffset - offsets[i]
      if (shift > 0) {
        const dx = side === 'right' ? shift : -shift
        shiftSubtree(children[i], dx, 0, nodes)
      }
    }
  }
}

function layoutSubtreeInner(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, NodeLayout>,
  boundaryBoundsMap: Map<string, BoundaryBounds> | undefined,
  config?: MapLayoutConfig,
): void {
  const size = sizeMap.get(node.id)!
  const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node), options)

  if (isCollapsed(node)) {
    nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height, partBounds: size.partBounds })
    return
  }
  const children = getAttachedChildren(node)
  if (children.length === 0) {
    nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height, partBounds: size.partBounds })
    return
  }

  // 计算分割点
  let numRight: number
  if (config && !config.balanced) {
    // unbalanced: 优先读节点属性
    const attrsNumRight = node.attrs.numRight
    if (typeof attrsNumRight === 'number' && attrsNumRight >= 0 && attrsNumRight <= children.length) {
      numRight = attrsNumRight
    } else {
      numRight = calcNumRight(children, sizeMap)
    }
  } else {
    numRight = calcNumRight(children, sizeMap)
  }

  const spacingMajor = getSpacingMajor(node, options)

  // 根据方向分配左右子节点
  let rightChildren: readonly NodeDesc[]
  let leftChildren: readonly NodeDesc[]

  const isClockwise = !config || config.direction === 'clockwise'
  if (isClockwise) {
    // clockwise: 前 numRight 个在右侧（从上到下），其余在左侧（从下到上）
    rightChildren = children.slice(0, numRight)
    leftChildren = children.slice(numRight).reverse()
  } else {
    // anticlockwise: 前 numRight 个在左侧（从上到下），其余在右侧（从下到上）
    leftChildren = children.slice(0, numRight)
    rightChildren = children.slice(numRight).reverse()
  }

  // 计算两侧总高度
  const rightTotalH = rightChildren.reduce((sum, c) => sum + subtreeHeight(c, sizeMap), 0)
    + Math.max(0, rightChildren.length - 1) * getSpacingMinor(node, options)
  const leftTotalH = leftChildren.reduce((sum, c) => sum + subtreeHeight(c, sizeMap), 0)
    + Math.max(0, leftChildren.length - 1) * getSpacingMinor(node, options)

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: Math.max(rightTotalH, leftTotalH), partBounds: size.partBounds })

  // 扇形外扩
  const outwardOffsetRight = calcOutwardDistance(rightChildren, sizeMap)
  const outwardOffsetLeft = calcOutwardDistance(leftChildren, sizeMap)

  // 布局右侧子节点
  if (rightChildren.length > 0) {
    const childX = x + size.width + spacingMajor + outwardOffsetRight
    const childY = y + size.height / 2
    layoutSideChildren(rightChildren, childX, childY, size.height, 'right', options, sizeMap, nodes, boundaryBoundsMap)
  }

  // 布局左侧子节点
  if (leftChildren.length > 0) {
    const maxLeftWidth = leftChildren.reduce((max, child) => {
      const childSize = sizeMap.get(child.id)!
      return Math.max(max, childSize.width)
    }, 0)
    const childX = x - maxLeftWidth - spacingMajor - outwardOffsetLeft
    const childY = y + size.height / 2
    layoutSideChildren(leftChildren, childX, childY, size.height, 'left', options, sizeMap, nodes, boundaryBoundsMap)
  }
}

// ─── 主布局入口 ───

function runMapLayout(
  config: MapLayoutConfig,
  doc: NodeDesc,
  options: LayoutOptions,
): LayoutResult {
  const nodes = new Map<string, NodeLayout>()
  const root = findRootTopic(doc)
  if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

  const sizeMap = new Map<string, NodeSize>()
  measureSubtree(root, options, sizeMap)

  const rootX = 0
  const rootY = 0

  // 第一遍：计算位置
  layoutSubtreeInner(root, rootX, rootY, options, sizeMap, nodes, undefined, config)

  // 计算 boundaryBounds
  const boundaryBoundsMap = new Map<string, BoundaryBounds>()
  computeBoundaryBounds(root, nodes, boundaryBoundsMap)

  // 第二遍：用 boundaryBounds 做 X offset 对齐
  const nodes2 = new Map<string, NodeLayout>()
  layoutSubtreeInner(root, rootX, rootY, options, sizeMap, nodes2, boundaryBoundsMap, config)

  // 平移到正数区
  let minX = Infinity, minY = Infinity
  for (const l of nodes2.values()) {
    minX = Math.min(minX, l.x)
    minY = Math.min(minY, l.y)
  }
  for (const l of nodes2.values()) {
    l.x -= minX
    l.y -= minY
  }

  let maxX = 0, maxY = 0
  for (const l of nodes2.values()) {
    maxX = Math.max(maxX, l.x + l.width)
    maxY = Math.max(maxY, l.y + l.height)
  }

  return { nodes: nodes2, totalWidth: maxX, totalHeight: maxY }
}

// ─── 导出算法 ───

export const mapClockwiseLayoutAlgorithm: LayoutAlgorithm = {
  name: 'map-clockwise',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    return runMapLayout({ name: 'map-clockwise', direction: 'clockwise', balanced: true }, doc, options)
  },
}

export const mapAnticlockwiseLayoutAlgorithm: LayoutAlgorithm = {
  name: 'map-anticlockwise',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    return runMapLayout({ name: 'map-anticlockwise', direction: 'anticlockwise', balanced: true }, doc, options)
  },
}

export const mapUnbalancedLayoutAlgorithm: LayoutAlgorithm = {
  name: 'map-unbalanced',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    return runMapLayout({ name: 'map-unbalanced', direction: 'clockwise', balanced: false }, doc, options)
  },
}
