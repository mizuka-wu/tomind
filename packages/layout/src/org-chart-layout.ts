// TODO: 与 XMind org-chart.down/up 对齐
// TODO: 多层嵌套水平居中验证
/**
 * Org Chart 布局 — 组织架构图
 *
 * 根节点在顶部/底部，子节点水平展开，父节点居中对齐子节点组
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

/** 子节点水平方向总跨度 */
function childrenTotalWidth(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>): number {
  if (isCollapsed(node)) return sizeMap.get(node.id)!.width
  const children = getAttachedChildren(node)
  if (children.length === 0) return sizeMap.get(node.id)!.width
  let total = 0
  for (let i = 0; i < children.length; i++) {
    total += childrenTotalWidth(children[i], options, sizeMap)
    if (i < children.length - 1) total += options.horizontalGap
  }
  return Math.max(sizeMap.get(node.id)!.width, total)
}

/** 子树总高度 */
function subtreeHeight(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.height
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.height
  let maxChildH = 0
  for (const child of children) {
    maxChildH = Math.max(maxChildH, subtreeHeight(child, options, sizeMap))
  }
  return size.height + options.verticalGap + maxChildH
}

function layoutSubtreeDown(
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

  // 子节点水平排列
  const childTotalW = (() => {
    let total = 0
    for (let i = 0; i < children.length; i++) {
      total += childrenTotalWidth(children[i], options, sizeMap)
      if (i < children.length - 1) total += options.horizontalGap
    }
    return total
  })()

  let childX = x + (size.width - childTotalW) / 2
  const childY = y + size.height + options.verticalGap

  for (const child of children) {
    const cw = childrenTotalWidth(child, options, sizeMap)
    layoutSubtreeDown(child, childX, childY, options, sizeMap, nodes)
    childX += cw + options.horizontalGap
  }
}

function layoutSubtreeUp(
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

  const childTotalW = (() => {
    let total = 0
    for (let i = 0; i < children.length; i++) {
      total += childrenTotalWidth(children[i], options, sizeMap)
      if (i < children.length - 1) total += options.horizontalGap
    }
    return total
  })()

  let childX = x + (size.width - childTotalW) / 2
  const childY = y - options.verticalGap

  for (const child of children) {
    const cs = sizeMap.get(child.id)!
    const cw = childrenTotalWidth(child, options, sizeMap)
    layoutSubtreeUp(child, childX, childY - cs.height, options, sizeMap, nodes)
    childX += cw + options.horizontalGap
  }
}

export const orgChartDownLayoutAlgorithm: LayoutAlgorithm = {
  name: 'org-chart-down',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap)

    const totalW = childrenTotalWidth(root, options, sizeMap)
    const rootX = (totalW - sizeMap.get(root.id)!.width) / 2 + options.rootOffsetX

    layoutSubtreeDown(root, rootX, 50, options, sizeMap, nodes)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }
    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}

export const orgChartUpLayoutAlgorithm: LayoutAlgorithm = {
  name: 'org-chart-up',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap)

    const totalW = childrenTotalWidth(root, options, sizeMap)
    const totalH = subtreeHeight(root, options, sizeMap)
    const rootX = (totalW - sizeMap.get(root.id)!.width) / 2 + options.rootOffsetX
    const rootY = totalH - sizeMap.get(root.id)!.height - 50

    layoutSubtreeUp(root, rootX, rootY, options, sizeMap, nodes)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }
    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
