// TODO: 与 XMind logic.right/left 间距对齐
// TODO: 子分支垂直堆叠间距验证
/**
 * Logic Chart 布局 — 逻辑图
 *
 * 逻辑图: 根节点在左/右，子节点水平展开，每个分支独立
 * 与 Tree 的区别: Logic 的子节点不是垂直堆叠，而是各自独立的水平分支
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine, ResolvedStyle } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import { isCollapsed, getAttachedChildren, findRootTopic, getAttr } from './layout-utils'
import { hasNonTitleParts } from './part-measure'
import { measurePartAwareNode, measureTitleOnlyNode } from './part-node-size'

/**
 * 对齐 snowbrush calcOutwardDistanceByAttachedChildren：
 * 子节点数 >= 8 且连接线非 elbow/roundedElbow 时，子节点整体向外偏移。
 */
const OUTWARD_CHILDREN_LIMIT = 8
const OUTWARD_K = 0.15
const OUTWARD_MIN = 400
const OUTWARD_MAX = 800
const NON_OUTWARD_LINE_CLASSES = ['elbow']

function parseStyleValue(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return isNaN(num) ? fallback : num
  }
  return fallback
}

/**
 * 读取节点的间距配置，对齐 tree-layout.ts 的 getNodeSpacing 模式：
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
    const result = measurePartAwareNode(node, options, styleEngine, state, padding)
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

function getSpacingMajor(node: NodeDesc, options: LayoutOptions, styleEngine: StyleEngine | null, state: SheetState | null, extra: number = 0): number {
  // 对齐 snowbrush calcSpacingMajor：curve/straight 线 ×2
  const gap = getNodeSpacing(node, options, styleEngine, state).horizontalGap
  if (styleEngine && state) {
    const lineClass = styleEngine.getStyleValue(state, node.id, 'lineClass')
    const s = typeof lineClass === 'string' ? lineClass : ''
    const DOUBLE = ['curve', 'straight', 'fold', 'bight']
    if (DOUBLE.some(c => s.includes(c))) return gap * 2 + extra
    return gap + extra
  }
  return gap + extra
}

function getSpacingMinor(node: NodeDesc, options: LayoutOptions, styleEngine: StyleEngine | null, state: SheetState | null): number {
  return getNodeSpacing(node, options, styleEngine, state).verticalGap
}

/** 对齐 snowbrush: 兄弟堆叠间距 = spacingMinor + 父节点 borderWidth */
function getMinorStep(node: NodeDesc, options: LayoutOptions, styleEngine: StyleEngine | null, state: SheetState | null): number {
  let bw = 0
  if (styleEngine && state) {
    const v = styleEngine.getStyleValue(state, node.id, 'borderWidth')
    const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
    if (Number.isFinite(n)) bw = n
  }
  return getSpacingMinor(node, options, styleEngine, state) + bw
}

function usesOutwardOffset(node: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null): boolean {
  if (!styleEngine || !state) return true
  const v = styleEngine.getStyleValue(state, node.id, 'lineClass')
  const s = typeof v === 'string' ? v : ''
  // snowbrush calcOutwardDistanceByAttachedChildren 仅 map/logic/org 结构生效；brace 不外扩
  if (s.includes('brace')) return false
  return !NON_OUTWARD_LINE_CLASSES.some(c => s.includes(c))
}

function calcOutwardDistance(
  node: NodeDesc,
  children: readonly NodeDesc[],
  subtreeHeight: (c: NodeDesc) => number,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): number {
  if (children.length < OUTWARD_CHILDREN_LIMIT) return 0
  if (!usesOutwardOffset(node, styleEngine, state)) return 0
  const totalHeight = children.reduce((sum, c) => sum + subtreeHeight(c), 0)
  if (totalHeight <= OUTWARD_MIN) return 0
  return OUTWARD_K * (Math.min(totalHeight, OUTWARD_MAX) - OUTWARD_MIN)
}

interface LocalBB {
  /** 子树包围盒顶边相对本节点中心 Y */
  y: number
  height: number
}

const MAX_BRANCH_POSITION_REALIGN_OFFSET = 30
const BRANCH_POSITION_REALIGN_RATIO = 0.15

interface LogicPlacement {
  /** 每个子节点中心相对本节点中心 Y */
  centers: number[]
  bb: LocalBB
}

/**
 * 后序遍历计算每个节点的子树包围盒（相对自身中心），
 * 完全对齐 snowbrush logicleftandright.calAttachedChildrenPos 的堆叠公式：
 *   childrenY = (bbLast.y + bbLast.h - bbFirst.y - H) / 2 + bbFirst.y
 *   posY_i    = childrenY + cum_i - bbY_i
 *   realign:  n >= 3 且 |min posY| < min(30, 0.15 * childrenHeight) 时整体上移
 */
function computePlacement(
  node: NodeDesc,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  placement: Map<string, LogicPlacement>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): LocalBB {
  const size = sizeMap.get(node.id)!
  const h = size.height
  const children = isCollapsed(node) ? [] : getAttachedChildren(node)
  if (children.length === 0) {
    const bb = { y: -h / 2, height: h }
    placement.set(node.id, { centers: [], bb })
    return bb
  }

  const childBBs = children.map((c) => computePlacement(c, options, sizeMap, placement, styleEngine, state))
  const ms = getMinorStep(node, options, styleEngine, state)
  const totalH = childBBs.reduce((s2, b) => s2 + b.height, 0) + (children.length - 1) * ms

  const first = childBBs[0]
  const last = childBBs[childBBs.length - 1]
  const childrenY = (last.y + last.height - first.y - totalH) / 2 + first.y

  const centers: number[] = []
  let cum = childrenY
  for (let i = 0; i < children.length; i++) {
    centers.push(cum - childBBs[i].y)
    cum += childBBs[i].height + ms
  }

  const childrenHeight = childrenY + totalH
  let offset = 0
  let minAbs = Infinity
  for (const c of centers) minAbs = Math.min(minAbs, Math.abs(c))
  if (minAbs === Infinity) minAbs = 0
  const maxOffset = Math.min(MAX_BRANCH_POSITION_REALIGN_OFFSET, childrenHeight * BRANCH_POSITION_REALIGN_RATIO)
  if (children.length >= 3 && minAbs < maxOffset) {
    offset = centers.reduce((best, c) => (Math.abs(c) < Math.abs(best) ? c : best), centers[0])
  }
  for (let i = 0; i < centers.length; i++) centers[i] -= offset

  let bbTop = -h / 2
  let bbBottom = h / 2
  for (let i = 0; i < children.length; i++) {
    bbTop = Math.min(bbTop, centers[i] + childBBs[i].y)
    bbBottom = Math.max(bbBottom, centers[i] + childBBs[i].y + childBBs[i].height)
  }
  const bb = { y: bbTop, height: bbBottom - bbTop }
  placement.set(node.id, { centers, bb })
  return bb
}

function layoutSubtree(
  node: NodeDesc,
  x: number,
  centerY: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  placement: Map<string, LogicPlacement>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number; partBounds?: Map<string, { x: number; y: number; width: number; height: number }> }>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  side: 'right' | 'left',
  spacingMajorExtra: number = 0,
): void {
  const size = sizeMap.get(node.id)!
  const pl = placement.get(node.id)!

  nodes.set(node.id, {
    x,
    y: centerY - size.height / 2,
    width: size.width,
    height: size.height,
    titleWidth: size.titleWidth,
    titleHeight: size.titleHeight,
    branchHeight: pl.bb.height,
    partBounds: size.partBounds,
  })

  const children = isCollapsed(node) ? [] : getAttachedChildren(node)
  if (children.length === 0) return

  const outwardOffset = calcOutwardDistance(
    node,
    children,
    (c) => placement.get(c.id)!.bb.height,
    styleEngine,
    state,
  )
  const spacingMajor = getSpacingMajor(node, options, styleEngine, state, spacingMajorExtra)

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const cs = sizeMap.get(child.id)!
    let childX: number
    if (side === 'right') {
      childX = x + size.width + spacingMajor + outwardOffset
    } else {
      childX = x - spacingMajor - outwardOffset - cs.width
    }
    // spacingMajorExtra（brace 的 line-spacing patch）只作用于中央分支自身
    layoutSubtree(child, childX, centerY + pl.centers[i], options, sizeMap, placement, nodes, styleEngine, state, side, 0)
  }
}

export interface LogicNodeLayout {
  x: number
  y: number
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  branchHeight: number
  partBounds?: Map<string, { x: number; y: number; width: number; height: number }>
}

/**
 * 独立布局一棵 logic 子树（供其他结构按 skeleton 委派使用）。
 * 返回绝对坐标节点表（child 主题左上角 = (x, centerY - h/2)）与子树包围盒（相对 child 中心）。
 */
export function layoutLogicSubtree(
  node: NodeDesc,
  x: number,
  centerY: number,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  side: 'right' | 'left',
): { nodes: Map<string, LogicNodeLayout>; bb: LocalBB; bbX: number; bbW: number } {
  const sizeMap = new Map<string, NodeSize>()
  measureSubtree(node, options, sizeMap, styleEngine, state)
  const placement = new Map<string, LogicPlacement>()
  const bb = computePlacement(node, options, sizeMap, placement, styleEngine, state)
  const nodes = new Map<string, LogicNodeLayout>()
  layoutSubtree(node, x, centerY, options, sizeMap, placement, nodes, styleEngine, state, side)
  let minX = Infinity
  let maxX = -Infinity
  const own = nodes.get(node.id)!
  const centerX = own.x + own.width / 2
  for (const nl of nodes.values()) {
    minX = Math.min(minX, nl.x)
    maxX = Math.max(maxX, nl.x + nl.width)
  }
  return { nodes, bb, bbX: minX - centerX, bbW: maxX - minX }
}

export function createLogicLikeAlgorithm(name: string, side: 'right' | 'left', spacingMajorExtra: number = 0): LayoutAlgorithm {
  return {
    name,
    layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
      return runLogicLayout(doc, options, styleEngine, state, side, spacingMajorExtra)
    },
  }
}

export const logicRightLayoutAlgorithm: LayoutAlgorithm = createLogicLikeAlgorithm('logic-right', 'right')

export const logicLeftLayoutAlgorithm: LayoutAlgorithm = createLogicLikeAlgorithm('logic-left', 'left')

function runLogicLayout(
  doc: NodeDesc,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  side: 'right' | 'left',
  spacingMajorExtra: number = 0,
): LayoutResult {
  const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number; partBounds?: Map<string, { x: number; y: number; width: number; height: number }> }>()
  const root = findRootTopic(doc)
  if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

  const sizeMap = new Map<string, NodeSize>()
  measureSubtree(root, options, sizeMap, styleEngine, state)

  const placement = new Map<string, LogicPlacement>()
  computePlacement(root, options, sizeMap, placement, styleEngine, state)

  const rootX = side === 'right' ? options.rootOffsetX : 0
  layoutSubtree(root, rootX, 0, options, sizeMap, placement, nodes, styleEngine, state, side, spacingMajorExtra)

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const l of nodes.values()) {
    minX = Math.min(minX, l.x)
    maxX = Math.max(maxX, l.x + l.width)
    minY = Math.min(minY, l.y)
    maxY = Math.max(maxY, l.y + l.height)
  }

  // 居中根节点
  const rootLayout = nodes.get(root.id)
  if (rootLayout) {
    const ox = (minX + maxX) / 2 - (rootLayout.x + rootLayout.width / 2)
    const oy = (minY + maxY) / 2 - (rootLayout.y + rootLayout.height / 2)
    if (Math.abs(ox) > 0.5 || Math.abs(oy) > 0.5) {
      for (const l of nodes.values()) {
        l.x += ox
        l.y += oy
      }
      maxX += ox
      maxY += oy
      minX += ox
      minY += oy
    }
  }

  return { nodes, totalWidth: maxX - minX, totalHeight: maxY - minY }
}
