// TODO: 与 XMind timeline 交替上下/左右排列验证
// TODO: 时间线轴线偏移量
/**
 * Timeline 布局 — 时间线
 *
 * 节点沿水平/垂直轴排列，子节点挂在时间线上方/下方（或左右）
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

// ─── 水平时间线 ───

function layoutTimelineHorizontal(
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

  // 子节点沿水平轴排列，交替上下
  let childX = x + size.width + options.horizontalGap
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const cs = sizeMap.get(child.id)!
    const childY = (i % 2 === 0)
      ? y - cs.height - options.verticalGap  // 上方
      : y + size.height + options.verticalGap  // 下方
    layoutTimelineHorizontal(child, childX, childY, options, sizeMap, nodes)
    childX += cs.width + options.horizontalGap
  }
}

export const timelineHorizontalLayoutAlgorithm: LayoutAlgorithm = {
  name: 'timeline-horizontal',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap)

    layoutTimelineHorizontal(root, options.rootOffsetX, 200, options, sizeMap, nodes)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }
    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}

// ─── 垂直时间线 ───

function layoutTimelineVertical(
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

  // 子节点沿垂直轴排列，交替左右
  let childY = y + size.height + options.verticalGap
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const cs = sizeMap.get(child.id)!
    const childX = (i % 2 === 0)
      ? x - cs.width - options.horizontalGap  // 左侧
      : x + size.width + options.horizontalGap  // 右侧
    layoutTimelineVertical(child, childX, childY, options, sizeMap, nodes)
    childY += cs.height + options.verticalGap
  }
}

export const timelineVerticalLayoutAlgorithm: LayoutAlgorithm = {
  name: 'timeline-vertical',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap)

    layoutTimelineVertical(root, 200, options.rootOffsetX, options, sizeMap, nodes)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }
    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
