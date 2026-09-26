// snowbrush fishbone 对角线算法对齐 (BONE_CONNECTION_TAN = 1.5)
/**
 * Fishbone 布局 — 鱼骨图（石川图）
 *
 * 鱼骨图: 中间一条主脊，原因分支斜向排列
 * leftHeaded: 鱼头在左（问题在左，原因在右）
 * rightHeaded: 鱼头在右（问题在右，原因在左）
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine, ResolvedStyle } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import { isCollapsed, getAttachedChildren, findRootTopic, getAttr } from './layout-utils'
import { hasNonTitleParts } from './part-measure'
import { measurePartAwareNode, measureTitleOnlyNode } from './part-node-size'

/** snowbrush fishbone 骨线斜率 (tan 值) */
const BONE_CONNECTION_TAN = 1.5

function parseStyleValue(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return isNaN(num) ? fallback : num
  }
  return fallback
}

/**
 * 读取节点的间距配置，对齐 logic-layout.ts 的 getNodeSpacing 模式：
 * - spacingMajor / spacingMinor 从 resolved style 读取
 * - padding 从 resolved style margin 属性 + attrs.style.margin 统一回退
 */
function getNodeSpacing(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
) {
  let style: ResolvedStyle | undefined
  if (styleEngine && state) {
    style = styleEngine.computeStyle(state, node.id)
  }

  if (!style) {
    return {
      horizontalGap: options.horizontalGap,
      verticalGap: options.verticalGap,
      padding: options.nodePadding,
    }
  }

  const majorGap = parseStyleValue(style.spacingMajor, options.horizontalGap)
  const minorGap = parseStyleValue(style.spacingMinor, options.verticalGap)

  // 对齐 snowbrush getTopicMargins: 先读统一 margin，有值则四方向使用，否则 fallback 到分侧值
  const rawStyle = getAttr<Record<string, unknown>>(node, 'style')
  const rawMargin = rawStyle?.margin

  let top: number
  let bottom: number
  let left: number
  let right: number

  if (typeof rawMargin === 'number' && rawMargin > 0) {
    top = bottom = left = right = rawMargin
  } else if (typeof rawMargin === 'string') {
    const parsed = parseFloat(rawMargin)
    if (!isNaN(parsed) && parsed > 0) {
      top = bottom = left = right = parsed
    } else {
      top = parseStyleValue(style.marginTop, options.nodePadding.top)
      bottom = parseStyleValue(style.marginBottom, options.nodePadding.bottom)
      left = parseStyleValue(style.marginLeft, options.nodePadding.left)
      right = parseStyleValue(style.marginRight, options.nodePadding.right)
    }
  } else {
    top = parseStyleValue(style.marginTop, options.nodePadding.top)
    bottom = parseStyleValue(style.marginBottom, options.nodePadding.bottom)
    left = parseStyleValue(style.marginLeft, options.nodePadding.left)
    right = parseStyleValue(style.marginRight, options.nodePadding.right)
  }

  return {
    horizontalGap: majorGap,
    verticalGap: minorGap,
    padding: { top, right, bottom, left },
  }
}

interface NodeSize {
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  partBounds?: Map<string, { x: number; y: number; width: number; height: number }>
}

function measureNodeSize(
  node: NodeDesc,
  padding: { top: number; right: number; bottom: number; left: number },
  options: LayoutOptions,
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): NodeSize {
  if (hasNonTitleParts(node)) {
    const result = measurePartAwareNode(node, options, styleEngine, state)
    return {
      width: result.width,
      height: result.height,
      titleWidth: result.titleWidth,
      titleHeight: result.titleHeight,
      partBounds: result.partBounds,
    }
  }

  const result = measureTitleOnlyNode(node, padding, options, styleEngine, state)
  return {
    width: result.width,
    height: result.height,
    titleWidth: result.titleWidth,
    titleHeight: result.titleHeight,
    partBounds: result.partBounds,
  }
}

function measureSubtree(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: StyleEngine | null, state?: SheetState | null): void {
  const spacing = getNodeSpacing(node, options, styleEngine ?? null, state ?? null)
  sizeMap.set(node.id, measureNodeSize(node, spacing.padding, options, styleEngine, state))
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureSubtree(child, options, sizeMap, styleEngine, state)
    }
  }
}

function getSpacingMajor(node: NodeDesc, options: LayoutOptions, styleEngine: StyleEngine | null, state: SheetState | null): number {
  return getNodeSpacing(node, options, styleEngine, state).horizontalGap
}

function getSpacingMinor(node: NodeDesc, options: LayoutOptions, styleEngine: StyleEngine | null, state: SheetState | null): number {
  return getNodeSpacing(node, options, styleEngine, state).verticalGap
}

/** 递归计算子树总高度（垂直方向的总跨度） */
function subtreeTotalHeight(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine: StyleEngine | null, state: SheetState | null): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.height
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.height
  let total = 0
  for (let i = 0; i < children.length; i++) {
    total += subtreeTotalHeight(children[i], options, sizeMap, styleEngine, state)
    if (i < children.length - 1) total += getSpacingMinor(node, options, styleEngine, state)
  }
  return Math.max(size.height, total)
}

/** 递归计算子树总宽度（水平方向的总跨度），沿主脊方向使用 spineGap */
function subtreeTotalWidth(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine: StyleEngine | null, state: SheetState | null): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.width
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.width
  const spineGap = getSpacingMajor(node, options, styleEngine, state) * 1.5
  let maxChildWidth = 0
  for (const child of children) {
    maxChildWidth = Math.max(maxChildWidth, subtreeTotalWidth(child, options, sizeMap, styleEngine, state))
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
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number; partBounds?: Map<string, { x: number; y: number; width: number; height: number }> }>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  /**
   * 骨线侧别：
   * - 'split'（默认，鱼头层）：子节点按 i%2 分到上下两条骨线
   * - 'top' / 'bottom'：整条骨线同侧堆叠（对齐 snowbrush TOP/BOTTOM BONE）
   */
  side: 'split' | 'top' | 'bottom' = 'split',
): void {
  const size = sizeMap.get(node.id)!
  const children = getAttachedChildren(node)
  const lineSpacing = getSpacingMajor(node, options, styleEngine, state)
  // snowbrush BONE_PADDING_VERTICAL=40 / SUB_BONE_PADDING_VERTICAL=20
  const bonePad = side === 'split' ? 40 : 32

  // 分支高度 = 上下两组子节点的最大累积高度
  let branchHeight = size.height
  if (!isCollapsed(node) && children.length > 0) {
    let topH = 0
    let bottomH = 0
    for (let i = 0; i < children.length; i++) {
      const onTop = side === 'split' ? i % 2 === 0 : side === 'top'
      const h = subtreeTotalHeight(children[i], options, sizeMap, styleEngine, state)
      if (onTop) topH = Math.max(topH, h)
      else bottomH = Math.max(bottomH, h)
    }
    branchHeight = topH + size.height + bottomH + bonePad * 2
  }

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth: size.titleWidth, titleHeight: size.titleHeight, branchHeight, partBounds: size.partBounds })

  if (isCollapsed(node) || children.length === 0) return

  const boneX = headLeft ? x + size.width + lineSpacing : x - lineSpacing
  const boneBaseY = y + size.height / 2

  // 上下骨线各自维护游标
  let topBoneBaseX = boneX
  let topBoneBaseY = boneBaseY + (side === 'bottom' ? 0 : -bonePad)
  let bottomBoneBaseX = boneX
  let bottomBoneBaseY = boneBaseY + (side === 'top' ? 0 : bonePad)

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const cs = sizeMap.get(child.id)!
    const isTop = side === 'split' ? i % 2 === 0 : side === 'top'
    const direction = isTop ? -1 : 1

    const currentBaseX = isTop ? topBoneBaseX : bottomBoneBaseX
    const currentBaseY = isTop ? topBoneBaseY : bottomBoneBaseY

    const childSubH = subtreeTotalHeight(child, options, sizeMap, styleEngine, state)
    // Y 步进用子树高 ×1.2，逼近 SB 鱼骨垂直展开
    const stepY = childSubH * 1.2 + bonePad
    const childY = currentBaseY + (isTop ? -stepY : bonePad)
    // X 步进用 topic 高（SB 骨线紧凑），Y 累计用子树高（撑开垂直分布）
    const offsetX = -(cs.height / 2 / BONE_CONNECTION_TAN) * direction
    const childX = currentBaseX + offsetX

    layoutLogicFromFishbone(child, childX, childY, headLeft, options, sizeMap, nodes, styleEngine, state)

    const childDistanceY = stepY * direction
    // X 骨线推进用 topic 高，避免子树高度把对角拉得过宽
    const nextBaseX = currentBaseX - ((cs.height + bonePad) / BONE_CONNECTION_TAN) * direction
    const nextBaseY = currentBaseY + childDistanceY

    if (isTop) {
      topBoneBaseX = nextBaseX
      topBoneBaseY = nextBaseY
    } else {
      bottomBoneBaseX = nextBaseX
      bottomBoneBaseY = nextBaseY
    }
  }
}

export const fishboneLeftHeadedLayoutAlgorithm: LayoutAlgorithm = {
  name: 'fishbone-leftHeaded',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number; partBounds?: Map<string, { x: number; y: number; width: number; height: number }> }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap, styleEngine, state)

    // 鱼头在左侧
    layoutFishbone(root, options.rootOffsetX, 200, true, options, sizeMap, nodes, styleEngine, state)

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
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number; partBounds?: Map<string, { x: number; y: number; width: number; height: number }> }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap, styleEngine, state)

    // 鱼头在右侧
    const totalW = (() => {
      let w = 0
      const children = getAttachedChildren(root)
      for (let i = 0; i < children.length; i++) {
        w += subtreeTotalWidth(children[i], options, sizeMap, styleEngine, state) + getSpacingMajor(root, options, styleEngine, state) * 1.5
      }
      return w + sizeMap.get(root.id)!.width
    })()

    layoutFishbone(root, totalW - sizeMap.get(root.id)!.width - options.rootOffsetX, 200, false, options, sizeMap, nodes, styleEngine, state)

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

/**
 * 鱼骨原因节点的后代布局 — 对齐 snowbrush LOGICRIGHT/LEFT
 * 子节点全部放在同一侧，垂直堆叠，水平向外展开
 */
function layoutLogicFromFishbone(
  node: NodeDesc,
  x: number,
  y: number,
  headLeft: boolean,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number; partBounds?: Map<string, { x: number; y: number; width: number; height: number }> }>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): void {
  const size = sizeMap.get(node.id)!
  const children = getAttachedChildren(node)
  const spacing = getNodeSpacing(node, options, styleEngine ?? null, state ?? null)
  const minorGap = spacing.verticalGap
  const majorGap = spacing.horizontalGap

  let branchHeight = size.height
  if (!isCollapsed(node) && children.length > 0) {
    let total = 0
    for (let i = 0; i < children.length; i++) {
      total += subtreeTotalHeight(children[i], options, sizeMap, styleEngine, state)
      if (i < children.length - 1) total += minorGap
    }
    branchHeight = Math.max(size.height, total)
  }

  nodes.set(node.id, {
    x, y, width: size.width, height: size.height,
    titleWidth: size.titleWidth, titleHeight: size.titleHeight,
    branchHeight, partBounds: size.partBounds,
  })

  if (isCollapsed(node) || children.length === 0) return

  // 垂直堆叠，中心对齐父节点；水平向外
  let childX: number
  if (headLeft) {
    childX = x + size.width + majorGap
  } else {
    // 先算子树最大宽度，从父节点左侧开始
    let maxW = 0
    for (const c of children) {
      maxW = Math.max(maxW, subtreeTotalWidth(c, options, sizeMap, styleEngine, state))
    }
    childX = x - majorGap - maxW
  }

  let curY = y + size.height / 2 - branchHeight / 2
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const cs = sizeMap.get(child.id)!
    const childH = subtreeTotalHeight(child, options, sizeMap, styleEngine, state)
    layoutLogicFromFishbone(child, childX, curY + (childH - cs.height) / 2, headLeft, options, sizeMap, nodes, styleEngine, state)
    curY += childH + minorGap
  }
}
