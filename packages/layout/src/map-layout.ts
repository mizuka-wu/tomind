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

function getFontSize(node: NodeDesc): number {
  const style = node.attrs.style as Record<string, unknown> | undefined
  return (style?.fontSize as number) ?? 14
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

function measureNode(node: NodeDesc, options: LayoutOptions): NodeSize {
  const fontSize = getFontSize(node)
  const title = getTitle(node)
  const { width, height } = measureTextSize(title, fontSize, options)
  return {
    width: width + options.nodePadding.left + options.nodePadding.right,
    height: height + options.nodePadding.top + options.nodePadding.bottom,
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

function getMinSumTopicSpacing(children: readonly NodeDesc[], parentHeight: number, options: LayoutOptions): number {
  if (children.length <= 1) return 0

  const minTotalSpacing = 80
  const maxTotalSpacing = 180
  const parentThreshold = 230

  let baseSpacing = minTotalSpacing
  if (parentHeight > parentThreshold) {
    baseSpacing = Math.min(maxTotalSpacing, parentHeight - parentThreshold + minTotalSpacing)
  }

  return baseSpacing
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

function subtreeHeight(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.height
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.height

  let total = 0
  for (let i = 0; i < children.length; i++) {
    total += subtreeHeight(children[i], options, sizeMap)
    if (i < children.length - 1) total += options.verticalGap
  }
  return Math.max(size.height, total)
}

function getWeight(node: NodeDesc, sizeMap: Map<string, NodeSize>): number {
  const size = sizeMap.get(node.id)!
  return size.height + 30
}

function calcNumRight(children: readonly NodeDesc[], sizeMap: Map<string, NodeSize>): number {
  if (children.length <= 1) return children.length

  const totalWeight = children.reduce((sum, child) => sum + getWeight(child, sizeMap), 0)
  const halfWeight = totalWeight / 2

  let rightWeight = 0
  let lastIndex = -1

  for (let i = 0; i < children.length; i++) {
    const weight = getWeight(children[i], sizeMap)
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

function layoutSideChildren(
  children: readonly NodeDesc[],
  startX: number,
  startY: number,
  parentHeight: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
): void {
  if (children.length === 0) return

  const verticalGap = options.verticalGap
  let cy = startY
  for (const child of children) {
    const size = sizeMap.get(child.id)!
    const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(child), getFontSize(child), options)
    nodes.set(child.id, { x: startX, y: cy, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height })
    layoutSubtree(child, startX, cy, options, sizeMap, nodes)
    cy += size.height + verticalGap
  }
}

function layoutSubtree(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
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

  const numRight = calcNumRight(children, sizeMap)
  const rightChildren = children.slice(0, numRight)
  const leftChildren = children.slice(numRight)

  const verticalGap = options.verticalGap
  const rightTotalH = rightChildren.reduce((sum, child) => sum + subtreeHeight(child, options, sizeMap), 0) + Math.max(0, rightChildren.length - 1) * verticalGap
  const leftTotalH = leftChildren.reduce((sum, child) => sum + subtreeHeight(child, options, sizeMap), 0) + Math.max(0, leftChildren.length - 1) * verticalGap

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: Math.max(rightTotalH, leftTotalH) })

  if (rightChildren.length > 0) {
    const childX = x + size.width + options.horizontalGap
    const childY = y + size.height / 2 - rightTotalH / 2
    layoutSideChildren(rightChildren, childX, childY, size.height, options, sizeMap, nodes)
  }

  if (leftChildren.length > 0) {
    const maxLeftWidth = leftChildren.reduce((max, child) => {
      const childSize = sizeMap.get(child.id)!
      return Math.max(max, childSize.width)
    }, 0)
    const childX = x - maxLeftWidth - options.horizontalGap
    const childY = y + size.height / 2 - leftTotalH / 2
    layoutSideChildren(leftChildren, childX, childY, size.height, options, sizeMap, nodes)
  }
}

export const mapClockwiseLayoutAlgorithm: LayoutAlgorithm = {
  name: 'map-clockwise',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap)

    const rootSize = sizeMap.get(root.id)!
    const rootX = 0
    const rootY = 0

    layoutSubtree(root, rootX, rootY, options, sizeMap, nodes)

    const rootNode = nodes.get(root.id)
    if (rootNode) {
      const ox = -rootNode.x
      const oy = -rootNode.y
      for (const l of nodes.values()) {
        l.x += ox
        l.y += oy
      }
    }

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
