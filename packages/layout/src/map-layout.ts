import type { NodeDesc } from '@tomind/schema'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'

const ATTACHED = 'attached'

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
}

function measureNode(node: NodeDesc, options: LayoutOptions, styleEngine?: any, state?: any): NodeSize {
  const fontSize = getFontSize(node, styleEngine, state)
  const title = getTitle(node)
  const style = node.attrs.style as Record<string, unknown> | undefined
  const fontFamily = (style?.fontFamily as string) || 'NeverMind, Microsoft YaHei, PingFang SC, Microsoft JhengHei'
  const fontWeight = (style?.fontWeight as string | number) || 'normal'
  const fontStyle = (style?.fontStyle as string) || 'normal'
  const { width, height } = measureTextSize(title, fontSize, options, fontFamily, fontWeight, fontStyle)
  return {
    width: width + options.nodePadding.left + options.nodePadding.right,
    height: height + options.nodePadding.top + options.nodePadding.bottom,
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

function getMinSumTopicSpacing(children: readonly NodeDesc[], parentHeight: number, sizeMap: Map<string, NodeSize>): number {
  const minTopBottomSpacing = 80
  const maxTopBottomSpacing = 180
  const parentTopicThreshold = 230

  let topBottomSpacing = minTopBottomSpacing
  if (parentHeight > parentTopicThreshold) {
    topBottomSpacing = Math.min(
      maxTopBottomSpacing,
      parentHeight - parentTopicThreshold + minTopBottomSpacing,
    )
  }

  const n = children.length
  if (n <= 2) {
    return topBottomSpacing
  }

  let sumSpacing = topBottomSpacing
  for (let i = 0; i < n; i++) {
    if (i !== 0 && i !== n - 1) {
      const childSize = sizeMap.get(children[i].id)!
      sumSpacing -= childSize.height
    }
  }

  return Math.max(0, sumSpacing)
}

function getNodeSize(node: NodeDesc, options: LayoutOptions): NodeSize {
  const fontSize = getFontSize(node)
  const title = getTitle(node)
  const { width, height } = measureTextSize(title, fontSize, options)
  return {
    width: width + options.nodePadding.left + options.nodePadding.right,
    height: height + options.nodePadding.top + options.nodePadding.bottom,
  }
}

function subtreeHeight(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: any, state?: any): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.height
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.height

  let total = 0
  for (let i = 0; i < children.length; i++) {
    total += subtreeHeight(children[i], options, sizeMap, styleEngine, state)
    if (i < children.length - 1) {
      const spacingMinor = getSpacingMinor(children[i], options, styleEngine, state)
      total += spacingMinor
    }
  }
  return Math.max(size.height, total)
}

function getWeight(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: any, state?: any): number {
  return subtreeHeight(node, options, sizeMap, styleEngine, state) + 30
}

function calcNumRight(children: readonly NodeDesc[], options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: any, state?: any): number {
  if (children.length <= 1) return children.length

  const totalWeight = children.reduce((sum, child) => sum + getWeight(child, options, sizeMap, styleEngine, state), 0)
  const halfWeight = totalWeight / 2

  let rightWeight = 0
  let lastIndex = -1

  for (let i = 0; i < children.length; i++) {
    const weight = getWeight(children[i], options, sizeMap, styleEngine, state)
    const newRightWeight = rightWeight + weight

    if (newRightWeight >= halfWeight) {
      if (lastIndex >= 0 && newRightWeight - halfWeight > halfWeight - rightWeight) {
        return lastIndex + 1
      }
      return i + 1
    }

    rightWeight = newRightWeight
    lastIndex = i
  }

  return children.length
}

function getSpacingMinor(node: NodeDesc, options: LayoutOptions, styleEngine?: any, state?: any): number {
  if (styleEngine && state) {
    const resolved = styleEngine.computeStyle(state, node.id)
    if (resolved?.spacingMinor != null) {
      const value = resolved.spacingMinor
      if (typeof value === 'string') {
        const parsed = parseInt(value)
        return isNaN(parsed) ? options.verticalGap : parsed
      }
      if (typeof value === 'number') {
        return value
      }
    }
  }

  const style = node.attrs.style as Record<string, unknown> | undefined
  const spacingMinor = style?.spacingMinor
  if (typeof spacingMinor === 'string') {
    const parsed = parseInt(spacingMinor)
    return isNaN(parsed) ? options.verticalGap : parsed
  }
  if (typeof spacingMinor === 'number') {
    return spacingMinor
  }
  return options.verticalGap
}

function layoutSideChildren(
  children: readonly NodeDesc[],
  startX: number,
  startY: number,
  parentHeight: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
  styleEngine?: any,
  state?: any,
): void {
  if (children.length === 0) return

  const minSumTopicSpacing = getMinSumTopicSpacing(children, parentHeight, sizeMap)
  let sumTopicSpacing = minSumTopicSpacing

  const yPosRelativeToFirstChild = [0]
  for (let i = 1; i < children.length; i++) {
    const pre = children[i - 1]
    const now = children[i]
    const preSize = sizeMap.get(pre.id)!
    const nowSize = sizeMap.get(now.id)!

    const gap1 = getSpacingMinor(now, options, styleEngine, state)
    const gap2 = sumTopicSpacing / (children.length - i)

    // 使用类似 snowbrush 的 boundaryBounds 计算方式
    // boundaryBounds.y 是子节点边界框的 Y 坐标（相对于父节点）
    // boundaryBounds.height 是子节点的总高度，包括子节点之间的间距
    const preBoundsY = yPosRelativeToFirstChild[i - 1]
    const preBoundsHeight = preSize.height
    const nowBoundsY = 0 // 当前子节点的边界框 Y 坐标（相对于自身）

    yPosRelativeToFirstChild[i] = Math.max(
      preBoundsY + preBoundsHeight + gap1 - nowBoundsY,
      preBoundsY + preBoundsHeight + gap2 - nowBoundsY,
    )

    sumTopicSpacing -= (yPosRelativeToFirstChild[i] - yPosRelativeToFirstChild[i - 1] - preSize.height)
  }

  const lastChildSize = sizeMap.get(children[children.length - 1].id)!
  const totalH = yPosRelativeToFirstChild[children.length - 1] + lastChildSize.height
  const firstChildY = -totalH / 2

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const size = sizeMap.get(child.id)!
    const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(child), getFontSize(child), options)
    const cy = startY + firstChildY + yPosRelativeToFirstChild[i]
    nodes.set(child.id, { x: startX, y: cy, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height })
    layoutSubtree(child, startX, cy, options, sizeMap, nodes, styleEngine, state)
  }
}

function layoutSubtree(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
  styleEngine?: any,
  state?: any,
): void {
  const size = sizeMap.get(node.id)!
  const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node), options)

  if (isCollapsed(node)) {
    nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height })
    return
  }
  const children = getAttachedChildren(node)
  if (children.length === 0) {
    nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height })
    return
  }

  const numRight = calcNumRight(children, options, sizeMap, styleEngine, state)
  const rightChildren = children.slice(0, numRight)
  const leftChildren = children.slice(numRight)

  const rightSpacingMinor = rightChildren.length > 0 ? getSpacingMinor(rightChildren[0], options, styleEngine, state) : getSpacingMinor(node, options, styleEngine, state)
  const leftSpacingMinor = leftChildren.length > 0 ? getSpacingMinor(leftChildren[0], options, styleEngine, state) : getSpacingMinor(node, options, styleEngine, state)
  const rightTotalH = rightChildren.reduce((sum, child) => sum + subtreeHeight(child, options, sizeMap, styleEngine, state), 0) + Math.max(0, rightChildren.length - 1) * rightSpacingMinor
  const leftTotalH = leftChildren.reduce((sum, child) => sum + subtreeHeight(child, options, sizeMap, styleEngine, state), 0) + Math.max(0, leftChildren.length - 1) * leftSpacingMinor

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: Math.max(rightTotalH, leftTotalH) })

  if (rightChildren.length > 0) {
    const childX = x + size.width + options.horizontalGap
    const childY = y + size.height / 2
    layoutSideChildren(rightChildren, childX, childY, size.height, options, sizeMap, nodes, styleEngine, state)
  }

  if (leftChildren.length > 0) {
    const maxLeftWidth = leftChildren.reduce((max, child) => {
      const childSize = sizeMap.get(child.id)!
      return Math.max(max, childSize.width)
    }, 0)
    const childX = x - maxLeftWidth - options.horizontalGap
    const childY = y + size.height / 2
    layoutSideChildren(leftChildren, childX, childY, size.height, options, sizeMap, nodes, styleEngine, state)
  }
}

export const mapClockwiseLayoutAlgorithm: LayoutAlgorithm = {
  name: 'map-clockwise',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine?: any, state?: any): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap, styleEngine, state)

    const rootSize = sizeMap.get(root.id)!
    const rootX = 0
    const rootY = 0

    layoutSubtree(root, rootX, rootY, options, sizeMap, nodes, styleEngine, state)

    let minX = Infinity, minY = Infinity
    for (const l of nodes.values()) {
      minX = Math.min(minX, l.x)
      minY = Math.min(minY, l.y)
    }

    for (const l of nodes.values()) {
      l.x -= minX
      l.y -= minY
    }

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
