import type { NodeDesc } from '@tomind/schema'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { hasNonTitleParts } from './part-measure'
import { measurePartAwareNode, measureTitleOnlyNode } from './part-node-size'

const ATTACHED = 'attached'

interface BoundaryBounds {
  x: number
  y: number
  width: number
  height: number
}

function getTitle(node: NodeDesc): string {
  const title = node.attrs.title
  if (typeof title === 'string') return title
  if (Array.isArray(title)) {
    return title.map((u: { text?: string }) => u.text ?? '').join('')
  }
  return ''
}

function getFontSize(node: NodeDesc, styleEngine?: any, state?: any): number {
  if (styleEngine && state) {
    const resolved = styleEngine.computeStyle(state, node.id)
    if (resolved?.fontSize != null) {
      const value = resolved.fontSize
      if (typeof value === 'string') {
        const parsed = parseInt(value)
        return isNaN(parsed) ? 14 : parsed
      }
      if (typeof value === 'number') {
        return value
      }
    }
  }

  const style = node.attrs.style as Record<string, unknown> | undefined
  const fontSize = style?.fontSize
  if (typeof fontSize === 'string') {
    const parsed = parseInt(fontSize)
    return isNaN(parsed) ? 14 : parsed
  }
  if (typeof fontSize === 'number') {
    return fontSize
  }
  return 14
}

function isCollapsed(node: NodeDesc): boolean {
  return (node.attrs.collapsed as boolean) ?? false
}

function getAttachedChildren(node: NodeDesc): readonly NodeDesc[] {
  return node.children[ATTACHED] ?? []
}

function findRootTopic(doc: NodeDesc): NodeDesc | null {
  if (doc.type === 'topic' || doc.type === 'root') return doc
  const attached = getAttachedChildren(doc)
  if (attached.length > 0) return attached[0]
  for (const children of Object.values(doc.children)) {
    for (const child of children) {
      const found = findRootTopic(child)
      if (found) return found
    }
  }
  return null
}

interface NodeSize {
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  partBounds?: Map<string, { x: number; y: number; width: number; height: number }>
}

function measureNode(node: NodeDesc, options: LayoutOptions, _styleEngine?: any, _state?: any): NodeSize {
  // 检查是否有非 title 的 part
  if (hasNonTitleParts(node)) {
    // 使用 part-aware 测量
    const result = measurePartAwareNode(node, options)
    return {
      width: result.width,
      height: result.height,
      titleWidth: result.titleWidth,
      titleHeight: result.titleHeight,
      partBounds: result.partBounds,
    }
  }

  // 快速路径：只测量 title + padding
  const result = measureTitleOnlyNode(node, options.nodePadding, options)
  return {
    width: result.width,
    height: result.height,
    titleWidth: result.titleWidth,
    titleHeight: result.titleHeight,
    partBounds: result.partBounds,
  }
}

function measureSubtree(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: any, state?: any): void {
  sizeMap.set(node.id, measureNode(node, options, styleEngine, state))
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureSubtree(child, options, sizeMap, styleEngine, state)
    }
  }
}

function computeBoundaryBounds(
  node: NodeDesc,
  nodes: Map<string, { x: number; y: number; width: number; height: number }>,
  boundaryBoundsMap: Map<string, BoundaryBounds>,
): BoundaryBounds {
  const nl = nodes.get(node.id)
  if (!nl) return { x: 0, y: 0, width: 0, height: 0 }

  // 子树边界框（绝对坐标）
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

function getSpacingMajor(node: NodeDesc, options: LayoutOptions, styleEngine?: any, state?: any): number {
  if (styleEngine && state) {
    const resolved = styleEngine.computeStyle(state, node.id)
    if (resolved?.spacingMajor != null) {
      const value = resolved.spacingMajor
      if (typeof value === 'string') {
        const parsed = parseInt(value)
        return isNaN(parsed) ? options.horizontalGap : parsed
      }
      if (typeof value === 'number') {
        return value
      }
    }
  }
  return options.horizontalGap
}

function getSpacingMinor(node: NodeDesc, options: LayoutOptions, styleEngine?: any, state?: any): number {
  // 如果有显式样式值，使用它
  if (styleEngine && state) {
    const resolved = styleEngine.computeStyle(state, node.id)
    if (resolved?.spacingMinor != null) {
      const value = resolved.spacingMinor
      if (typeof value === 'string') {
        const parsed = parseInt(value)
        if (!isNaN(parsed)) return parsed
      }
      if (typeof value === 'number') {
        return value
      }
    }
  }

  // 自适应逻辑（对齐 snowbrush getMinSumTopicSpacing）
  // 基础值：默认 verticalGap（通常为 0，需要给一个合理默认）
  const baseSpacing = options.verticalGap || 20

  // snowbrush 的自适应范围
  const MIN_TOP_BOTTOM_SPACING = 80
  const MAX_TOP_BOTTOM_SPACING = 180
  const PARENT_TOPIC_THRESHOLD = 230

  // 如果父节点高度超过阈值，增加最小间距
  // 注意：这里无法直接获取父节点高度，所以用基础值
  // 实际的自适应在 layoutSideChildren 中根据父节点高度调整
  return Math.max(baseSpacing, MIN_TOP_BOTTOM_SPACING / 4)
}

/**
 * 自适应垂直间距（根据父节点高度）
 * 对齐 snowbrush 的 getMinSumTopicSpacing
 */
function getAdaptiveSpacingMinor(
  parentHeight: number,
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine?: any,
  state?: any,
): number {
  // 如果有显式样式值，使用它
  if (styleEngine && state) {
    const resolved = styleEngine.computeStyle(state, node.id)
    if (resolved?.spacingMinor != null) {
      const value = resolved.spacingMinor
      if (typeof value === 'string') {
        const parsed = parseInt(value)
        if (!isNaN(parsed)) return parsed
      }
      if (typeof value === 'number') {
        return value
      }
    }
  }

  // snowbrush 自适应逻辑
  const MIN_TOP_BOTTOM_SPACING = 80
  const MAX_TOP_BOTTOM_SPACING = 180
  const PARENT_TOPIC_THRESHOLD = 230

  // 基础间距
  let spacing = options.verticalGap || 20

  // 如果父节点高度超过阈值，增加最小间距
  if (parentHeight > PARENT_TOPIC_THRESHOLD) {
    const extra = (parentHeight - PARENT_TOPIC_THRESHOLD) * 0.15
    spacing = Math.max(spacing, MIN_TOP_BOTTOM_SPACING + extra)
  }

  // 限制范围
  return Math.min(Math.max(spacing, MIN_TOP_BOTTOM_SPACING / 2), MAX_TOP_BOTTOM_SPACING)
}

function subtreeHeight(node: NodeDesc, _options: LayoutOptions, sizeMap: Map<string, NodeSize>, _styleEngine?: any, _state?: any): number {
  const size = sizeMap.get(node.id)!
  return size.height
}

/**
 * 计算子节点权重（对齐 snowbrush getWeight）
 * weight = subtreeHeight + (spacingMinor/2) * 3
 */
function getWeight(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: any, state?: any): number {
  const height = subtreeHeight(node, options, sizeMap, styleEngine, state)
  const spacingMinor = getSpacingMinor(node, options, styleEngine, state)
  return height + (spacingMinor / 2) * 3
}

/**
 * 权重平衡的左右分配（对齐 snowbrush）
 * 累加权重到 halfWeight 找最佳分割点
 */
function calcNumRight(children: readonly NodeDesc[], options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: any, state?: any): number {
  if (children.length <= 1) return children.length

  // 计算总权重
  let totalWeight = 0
  for (const child of children) {
    totalWeight += getWeight(child, options, sizeMap, styleEngine, state)
  }

  const halfWeight = totalWeight / 2
  let accWeight = 0

  for (let i = 0; i < children.length; i++) {
    accWeight += getWeight(children[i], options, sizeMap, styleEngine, state)
    if (accWeight >= halfWeight) {
      // 选择更接近一半的位置
      const diffAt = Math.abs(accWeight - halfWeight)
      const diffBefore = Math.abs((accWeight - getWeight(children[i], options, sizeMap, styleEngine, state)) - halfWeight)
      return diffAt < diffBefore ? i + 1 : i
    }
  }

  return Math.ceil(children.length / 2)
}

/**
 * 计算扇形外扩距离（对齐 snowbrush calcOutwardDistanceByAttachedChildren）
 * 子节点多时自动撑开，避免拥挤
 */
function calcOutwardDistance(
  children: readonly NodeDesc[],
  sizeMap: Map<string, NodeSize>,
): number {
  const CHILDREN_COUNT_LIMIT = 8
  const K = 0.15
  const MIN = 400
  const MAX = 800

  if (children.length < CHILDREN_COUNT_LIMIT) return 0

  // 计算子节点总高度
  const totalHeight = children.reduce((sum, child) => {
    const size = sizeMap.get(child.id)
    return sum + (size?.height ?? 0)
  }, 0)

  if (totalHeight <= MIN) return 0

  return K * (Math.min(totalHeight, MAX) - MIN)
}

function layoutSideChildren(
  children: readonly NodeDesc[],
  startX: number,
  startY: number,
  parentHeight: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number; partBounds?: Map<string, { x: number; y: number; width: number; height: number }> }>,
  boundaryBoundsMap?: Map<string, BoundaryBounds>,
  styleEngine?: any,
  state?: any,
): void {
  const n = children.length
  if (n === 0) return

  // 使用自适应间距
  const spacingMinor = getAdaptiveSpacingMinor(parentHeight, children[0], options, styleEngine, state)

  // 计算子节点总高度
  let totalHeight = 0
  const yPosRelativeToFirstChild: number[] = []
  for (let i = 0; i < n; i++) {
    const child = children[i]
    const size = sizeMap.get(child.id)!
    yPosRelativeToFirstChild.push(totalHeight)
    totalHeight += size.height
    if (i < n - 1) {
      totalHeight += spacingMinor
    }
  }

  // 垂直居中对齐到 parent
  const posYoffsetToClosestChild = totalHeight / 2

  for (let i = 0; i < n; i++) {
    const child = children[i]
    const size = sizeMap.get(child.id)!
    const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(child), getFontSize(child, styleEngine, state), options)
    const cy = startY + yPosRelativeToFirstChild[i] - posYoffsetToClosestChild + size.height / 2
    nodes.set(child.id, { x: startX, y: cy, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height, partBounds: size.partBounds })
    layoutSubtree(child, startX, cy, options, sizeMap, nodes, boundaryBoundsMap, styleEngine, state)
  }
}

function layoutSubtree(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number; partBounds?: Map<string, { x: number; y: number; width: number; height: number }> }>,
  boundaryBoundsMap?: Map<string, BoundaryBounds>,
  styleEngine?: any,
  state?: any,
): void {
  const size = sizeMap.get(node.id)!
  const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node, styleEngine, state), options)

  if (isCollapsed(node)) {
    nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height, partBounds: size.partBounds })
    return
  }
  const children = getAttachedChildren(node)
  if (children.length === 0) {
    nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height, partBounds: size.partBounds })
    return
  }

  const numRight = calcNumRight(children, options, sizeMap, styleEngine, state)
  const spacingMajor = getSpacingMajor(node, options, styleEngine, state)
  const spacingMinor = getSpacingMinor(node, options, styleEngine, state)

  const rightChildren = children.slice(0, numRight)
  // 左侧子节点反转以实现顺时针缠绕：index pos 在底部，index n-1 在顶部
  const leftChildren = children.slice(numRight).reverse()

  const rightSpacingMinor = rightChildren.length > 0 ? getSpacingMinor(rightChildren[0], options, styleEngine, state) : spacingMinor
  const leftSpacingMinor = leftChildren.length > 0 ? getSpacingMinor(leftChildren[0], options, styleEngine, state) : spacingMinor
  const rightTotalH = rightChildren.reduce((sum, child) => sum + subtreeHeight(child, options, sizeMap, styleEngine, state), 0) + Math.max(0, rightChildren.length - 1) * rightSpacingMinor
  const leftTotalH = leftChildren.reduce((sum, child) => sum + subtreeHeight(child, options, sizeMap, styleEngine, state), 0) + Math.max(0, leftChildren.length - 1) * leftSpacingMinor

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: Math.max(rightTotalH, leftTotalH), partBounds: size.partBounds })

  // 计算扇形外扩距离
  const outwardOffsetRight = calcOutwardDistance(rightChildren, sizeMap)
  const outwardOffsetLeft = calcOutwardDistance(leftChildren, sizeMap)

  if (rightChildren.length > 0) {
    const childX = x + size.width + spacingMajor + outwardOffsetRight
    const childY = y + size.height / 2
    layoutSideChildren(rightChildren, childX, childY, size.height, options, sizeMap, nodes, boundaryBoundsMap, styleEngine, state)
  }

  if (leftChildren.length > 0) {
    const maxLeftWidth = leftChildren.reduce((max, child) => {
      const childSize = sizeMap.get(child.id)!
      return Math.max(max, childSize.width)
    }, 0)
    const childX = x - maxLeftWidth - spacingMajor - outwardOffsetLeft
    const childY = y + size.height / 2
    layoutSideChildren(leftChildren, childX, childY, size.height, options, sizeMap, nodes, boundaryBoundsMap, styleEngine, state)
  }
}

export const mapClockwiseLayoutAlgorithm: LayoutAlgorithm = {
  name: 'map-clockwise',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine?: any, state?: any): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number; partBounds?: Map<string, { x: number; y: number; width: number; height: number }> }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap, styleEngine, state)

    const rootX = 0
    const rootY = 0

    // 第一遍：用当前逻辑计算位置
    layoutSubtree(root, rootX, rootY, options, sizeMap, nodes, undefined, styleEngine, state)

    // 计算 boundaryBounds（子树边界框）
    const boundaryBoundsMap = new Map<string, BoundaryBounds>()
    computeBoundaryBounds(root, nodes, boundaryBoundsMap)

    // 第二遍：用 boundaryBounds 重新计算位置
    const nodes2 = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number; partBounds?: Map<string, { x: number; y: number; width: number; height: number }> }>()
    layoutSubtree(root, rootX, rootY, options, sizeMap, nodes2, boundaryBoundsMap, styleEngine, state)

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
  },
}
