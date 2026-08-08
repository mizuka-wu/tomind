// TODO: 与 XMind map.anticlockwise 分支均匀分布验证
/**
 * Map Anticlockwise 布局 — 逆时针导图
 *
 * 根节点居中，子节点均匀分布在上下两侧（左侧为主）
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

  // 分成上下两组（逆时针：偶数在上，奇数在下）
  const topChildren: NodeDesc[] = []
  const bottomChildren: NodeDesc[] = []
  for (let i = 0; i < children.length; i++) {
    if (i % 2 === 0) {
      topChildren.push(children[i])
    } else {
      bottomChildren.push(children[i])
    }
  }

  // 逆时针：子节点在左侧
  const childX = x - options.horizontalGap

  // 上方组总高度
  let topTotalH = 0
  if (topChildren.length > 0) {
    for (const c of topChildren) topTotalH += subtreeHeight(c, options, sizeMap)
    topTotalH += (topChildren.length - 1) * options.verticalGap
  }
  // 下方组总高度
  let botTotalH = 0
  if (bottomChildren.length > 0) {
    for (const c of bottomChildren) botTotalH += subtreeHeight(c, options, sizeMap)
    botTotalH += (bottomChildren.length - 1) * options.verticalGap
  }

  // 分支高度 = 上下两组子节点的总高度
  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: topTotalH + botTotalH })

  // 布局上方子节点（从上到下）
  if (topChildren.length > 0) {
    let cy = y + size.height / 2 - topTotalH / 2
    for (const child of topChildren) {
      const ch = subtreeHeight(child, options, sizeMap)
      const cs = sizeMap.get(child.id)!
      layoutSubtree(child, childX - cs.width, cy, options, sizeMap, nodes)
      cy += ch + options.verticalGap
    }
  }

  // 布局下方子节点
  if (bottomChildren.length > 0) {
    let cy = y + size.height / 2 + (topChildren.length > 0 ? 0 : -botTotalH / 2)
    for (const child of bottomChildren) {
      const ch = subtreeHeight(child, options, sizeMap)
      const cs = sizeMap.get(child.id)!
      layoutSubtree(child, childX - cs.width, cy, options, sizeMap, nodes)
      cy += ch + options.verticalGap
    }
  }
}

export const mapAnticlockwiseLayoutAlgorithm: LayoutAlgorithm = {
  name: 'map-anticlockwise',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap)

    const rootH = subtreeHeight(root, options, sizeMap)
    const rootSize = sizeMap.get(root.id)!
    // 逆时针：根节点在右侧
    const rootX = options.rootOffsetX + rootSize.width
    const rootY = (rootH - rootSize.height) / 2

    layoutSubtree(root, rootX, rootY, options, sizeMap, nodes)

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
