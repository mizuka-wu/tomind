/**
 * Logic Chart 布局 — 逻辑图
 *
 * 逻辑图: 根节点在左/右，子节点水平展开，每个分支独立
 * 与 Tree 的区别: Logic 的子节点不是垂直堆叠，而是各自独立的水平分支
 */
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
  if (doc.type === 'topic') return doc
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

/** 递归计算子树总高度（垂直方向的总跨度） */
function subtreeTotalHeight(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.height
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.height
  let total = 0
  for (let i = 0; i < children.length; i++) {
    total += subtreeTotalHeight(children[i], options, sizeMap)
    if (i < children.length - 1) total += options.verticalGap
  }
  return Math.max(size.height, total)
}

/** 递归计算子树总宽度（水平方向的总跨度） */
function subtreeTotalWidth(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.width
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.width
  let maxChildWidth = 0
  for (const child of children) {
    maxChildWidth = Math.max(maxChildWidth, subtreeTotalWidth(child, options, sizeMap))
  }
  return size.width + options.horizontalGap + maxChildWidth
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
  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth: 0, titleHeight: 0, branchHeight: 0 })

  if (isCollapsed(node)) return
  const children = getAttachedChildren(node)
  if (children.length === 0) return

  // 子节点垂直堆叠，向右展开
  let totalH = 0
  for (let i = 0; i < children.length; i++) {
    totalH += subtreeTotalHeight(children[i], options, sizeMap)
    if (i < children.length - 1) totalH += options.verticalGap
  }

  let childY = y + (size.height - totalH) / 2
  const childX = x + size.width + options.horizontalGap

  for (const child of children) {
    const ch = subtreeTotalHeight(child, options, sizeMap)
    layoutSubtree(child, childX, childY, options, sizeMap, nodes)
    childY += ch + options.verticalGap
  }
}

export const logicRightLayoutAlgorithm: LayoutAlgorithm = {
  name: 'logic-right',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap)

    const totalH = subtreeTotalHeight(root, options, sizeMap)
    const rootX = options.rootOffsetX
    const rootY = (totalH - sizeMap.get(root.id)!.height) / 2

    layoutSubtree(root, rootX, rootY, options, sizeMap, nodes)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }
    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}

export const logicLeftLayoutAlgorithm: LayoutAlgorithm = {
  name: 'logic-left',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap)

    const totalH = subtreeTotalHeight(root, options, sizeMap)
    const totalW = subtreeTotalWidth(root, options, sizeMap)
    const rootW = sizeMap.get(root.id)!.width
    const rootX = totalW - rootW - options.rootOffsetX
    const rootY = (totalH - sizeMap.get(root.id)!.height) / 2

    // 左侧布局：子节点向左展开
    layoutSubtreeLeft(root, rootX, rootY, options, sizeMap, nodes)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }
    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}

function layoutSubtreeLeft(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
): void {
  const size = sizeMap.get(node.id)!
  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth: 0, titleHeight: 0, branchHeight: 0 })

  if (isCollapsed(node)) return
  const children = getAttachedChildren(node)
  if (children.length === 0) return

  let totalH = 0
  for (let i = 0; i < children.length; i++) {
    totalH += subtreeTotalHeight(children[i], options, sizeMap)
    if (i < children.length - 1) totalH += options.verticalGap
  }

  let childY = y + (size.height - totalH) / 2
  const childX = x - options.horizontalGap

  for (const child of children) {
    const cs = sizeMap.get(child.id)!
    const ch = subtreeTotalHeight(child, options, sizeMap)
    layoutSubtreeLeft(child, childX - cs.width, childY, options, sizeMap, nodes)
    childY += ch + options.verticalGap
  }
}
