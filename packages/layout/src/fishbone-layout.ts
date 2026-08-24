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
import { getTitle, getFontSize, isCollapsed, getAttachedChildren, findRootTopic, measureSimpleSubtree } from './layout-utils'
type NodeSize = import('./layout-utils').SimpleNodeSize

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

/** 递归计算子树总宽度（水平方向的总跨度），沿主脊方向使用 spineGap */
function subtreeTotalWidth(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.width
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.width
  const spineGap = options.horizontalGap * 1.5
  let maxChildWidth = 0
  for (const child of children) {
    maxChildWidth = Math.max(maxChildWidth, subtreeTotalWidth(child, options, sizeMap))
  }
  return size.width + spineGap + maxChildWidth
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
  const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node), options)

  // 分支高度 = 主脊上下两侧子节点的垂直总跨度
  let branchHeight = size.height
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    let topH = 0
    let bottomH = 0
    for (let i = 0; i < children.length; i++) {
      if (i % 2 === 0) topH = Math.max(topH, subtreeTotalHeight(children[i], options, sizeMap))
      else bottomH = Math.max(bottomH, subtreeTotalHeight(children[i], options, sizeMap))
    }
    branchHeight = topH + size.height + bottomH + options.verticalGap * 4
  }

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight })

  if (isCollapsed(node)) return
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
      ? childX + subtreeTotalWidth(child, options, sizeMap) + spineGap
      : childX - subtreeTotalWidth(child, options, sizeMap) - spineGap
  }
}

export const fishboneLeftHeadedLayoutAlgorithm: LayoutAlgorithm = {
  name: 'fishbone-leftHeaded',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSimpleSubtree(root, options, sizeMap)

    // 鱼头在左侧
    layoutFishbone(root, options.rootOffsetX, 200, true, options, sizeMap, nodes)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    // 居中根节点
    const rootLayout = nodes.get(root.id)
    if (rootLayout) {
      const ox = maxX / 2 - (rootLayout.x + rootLayout.width / 2)
      const oy = maxY / 2 - (rootLayout.y + rootLayout.height / 2)
      if (Math.abs(ox) > 0.5 || Math.abs(oy) > 0.5) {
        for (const l of nodes.values()) { l.x += ox; l.y += oy }
        maxX += ox; maxY += oy
      }
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
    measureSimpleSubtree(root, options, sizeMap)

    // 鱼头在右侧
    const totalW = (() => {
      let w = 0
      const children = getAttachedChildren(root)
      for (let i = 0; i < children.length; i++) {
        w += subtreeTotalWidth(children[i], options, sizeMap) + options.horizontalGap * 1.5
      }
      return w + sizeMap.get(root.id)!.width
    })()

    layoutFishbone(root, totalW - sizeMap.get(root.id)!.width - options.rootOffsetX, 200, false, options, sizeMap, nodes)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    // 居中根节点
    const rootLayout = nodes.get(root.id)
    if (rootLayout) {
      const ox = maxX / 2 - (rootLayout.x + rootLayout.width / 2)
      const oy = maxY / 2 - (rootLayout.y + rootLayout.height / 2)
      if (Math.abs(ox) > 0.5 || Math.abs(oy) > 0.5) {
        for (const l of nodes.values()) { l.x += ox; l.y += oy }
        maxX += ox; maxY += oy
      }
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
