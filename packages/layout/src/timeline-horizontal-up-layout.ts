// TODO: 与 XMind timeline.horizontal.up/down 间距对齐
/**
 * Timeline Horizontal Up 布局 — 水平时间线上方
 *
 * 节点沿水平轴排列，子节点全部挂在时间线上方
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

  // 分支高度 = 上方子节点的垂直总跨度
  let branchHeight = size.height
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    let maxChildH = 0
    for (const child of children) {
      maxChildH = Math.max(maxChildH, sizeMap.get(child.id)!.height)
    }
    branchHeight = maxChildH + size.height + options.verticalGap
  }

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  // 子节点全部在上方
  let childX = x + size.width + options.horizontalGap
  for (const child of children) {
    const cs = sizeMap.get(child.id)!
    const childY = y - cs.height - options.verticalGap
    layoutSubtree(child, childX, childY, options, sizeMap, nodes)
    childX += cs.width + options.horizontalGap
  }
}

export const timelineHorizontalUpLayoutAlgorithm: LayoutAlgorithm = {
  name: 'timeline-horizontal-up',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap)

    layoutSubtree(root, options.rootOffsetX, 200, options, sizeMap, nodes)

    // 平移到正数区
    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      minX = Math.min(minX, l.x)
      minY = Math.min(minY, l.y)
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }
    if (minX < 0 || minY < 0) {
      const ox = minX < 0 ? -minX : 0
      const oy = minY < 0 ? -minY : 0
      for (const l of nodes.values()) {
        l.x += ox
        l.y += oy
      }
      maxX += ox
      maxY += oy
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
