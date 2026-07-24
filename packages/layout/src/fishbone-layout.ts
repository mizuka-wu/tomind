// TODO: 与 XMind fishbone 斜线角度/间距对齐
// TODO: leftHeaded/rightHeaded 对称性
/**
 * Fishbone 布局 — 鱼骨图（石川图）
 *
 * 鱼骨图: 中间一条主脊，原因分支斜向排列
 * leftHeaded: 鱼头在左（问题在左，原因在右）
 * rightHeaded: 鱼头在右（问题在右，原因在左）
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

function layoutFishbone(
  node: NodeDesc,
  x: number,
  y: number,
  headLeft: boolean,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
): void {
  const size = sizeMap.get(node.id)!
  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth: 0, titleHeight: 0, branchHeight: 0 })

  if (isCollapsed(node)) return
  const children = getAttachedChildren(node)
  if (children.length === 0) return

  // 鱼骨: 子节点沿主脊排列，交替上下
  const spineGap = options.horizontalGap * 1.5
  let childX = headLeft
    ? x + size.width + spineGap  // 鱼头在左，原因向右
    : x - spineGap  // 鱼头在右，原因向左

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const cs = sizeMap.get(child.id)!
    const childY = (i % 2 === 0)
      ? y - cs.height - options.verticalGap * 2  // 上方（斜向上）
      : y + size.height + options.verticalGap * 2  // 下方（斜向下）

    // 水平偏移（斜线效果）
    const offsetX = headLeft ? -options.horizontalGap * 0.3 : options.horizontalGap * 0.3

    layoutFishbone(child, childX + offsetX, childY, headLeft, options, sizeMap, nodes)

    childX = headLeft
      ? childX + cs.width + spineGap
      : childX - cs.width - spineGap
  }
}

export const fishboneLeftHeadedLayoutAlgorithm: LayoutAlgorithm = {
  name: 'fishbone-leftHeaded',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap)

    // 鱼头在左侧
    layoutFishbone(root, options.rootOffsetX, 200, true, options, sizeMap, nodes)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }
    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}

export const fishboneRightHeadedLayoutAlgorithm: LayoutAlgorithm = {
  name: 'fishbone-rightHeaded',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap)

    // 鱼头在右侧
    const totalW = (() => {
      let w = 0
      const children = getAttachedChildren(root)
      for (let i = 0; i < children.length; i++) {
        const cs = sizeMap.get(children[i].id)!
        w += cs.width + options.horizontalGap * 1.5
      }
      return w + sizeMap.get(root.id)!.width
    })()

    layoutFishbone(root, totalW - sizeMap.get(root.id)!.width - options.rootOffsetX, 200, false, options, sizeMap, nodes)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }
    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
