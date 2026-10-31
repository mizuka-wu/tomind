/**
 * Timeline Sided Horizontal 布局 — 精确移植 snowbrush `structures/timelinesidedhorizontal.ts`
 *
 * 与 timeline.horizontal 的**共同点**（所以子分支布局可以直接复用 `layoutTimelineBranch`）：
 *   `getChildStructure` → 按 `getFinalTimelineChildDirection` 给 TIMELINEHORIZONTALUP / DOWN，
 *   `getAvailableChildStructure` → **[]**（任何 preset 都不可用，连镜像都不试）。
 *
 * **不同点**（旧实现全错，实测 test-timeline-sided-inherit 1123.9 / 422.8 / ΔW 14.9 / ΔH 11.9）：
 * 1. 两套间距，而且都不是 timeline.horizontal 的那一个：
 *      MAIN_LINE_PADDING = getMainlineSpacing = parseInt(spacingMajor) × designPadding ÷ default(spacingMajor)
 *                          + getLineEndSpacingPatchGap(parent)     designPadding = 中央主题 18 / 其它 10
 *      CHILDREN_PADDING  = getTopicSpacing    = parseInt(spacingMinor) × designPadding ÷ default(spacingMinor)
 *                                                                   designPadding = 中央主题 20 / 其它 10
 *    （timeline.horizontal 是 spacingMajor × 100 ÷ default；up/down 分支才是 × 20）
 * 2. 子分支不在父主题的**中心线**上，而是上下各让出 `MAIN_LINE_PADDING × 3`：
 *      y = parentShapeOffsetY + (isUp ? -(MLP×3 + currShapeOffsetY) + maxBoundaryOffsetY.up
 *                                     :  MLP×3 - currShapeOffsetY + maxBoundaryOffsetY.down)
 *    currShapeOffsetY = getBasePoint(child, isUp ? DOWN : UP).y = isUp ? +originY : -originY
 * 3. `maxBoundaryOffsetY` 是全侧的一次预扫描（SB 原文）：
 *      up   = min(0, …) over UP   children of  tb.height + tb.y - (bb.height + bb.y)
 *      down = max(0, …) over DOWN children of  tb.y - bb.y
 * 4. X 的两个约束里「上一个兄弟」那一项：首个子节点的间距是 **1.5 ×** CHILDREN_PADDING，
 *    其余是 1 ×；而且 prevShapeOffsetX 只取 `getBasePoint(prev, RIGHT).x`
 *    （**不**加 getPointOffset —— 这点和 timeline.horizontal 不同）。
 * 5. 同侧约束用的是 `MAIN_LINE_PADDING`（timeline.horizontal 用 CHILDREN_PADDING / 2），
 *    且首项取父的 `topicView.shapeBounds`（不是 boundaryBounds）。
 *
 * 收尾同 SB：`childrenSize = getChildrenSize(parent)`（= ∪ vector(child.bb, child.position)），
 * `newBounds = getUnionBoundingBox(topicView.bounds, childrenSize)`。
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import { DEFAULT_STYLES, classifyNode } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions, NodeLayout } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { getTitle, getFontSize, isCollapsed, getAttachedChildren, findRootTopic } from './layout-utils'
import { measureStyledSubtree, getLineEndSpacingPatchGap, hasLineEndArrow } from './spacing-utils'
import { layoutTimelineBranch } from './timeline-layout'
import type { TlBB } from './timeline-layout'

type NodeSize = import('./layout-utils').SimpleNodeSize

/** 主题盒原点（shape 中心）到盒顶的距离；part-blind 时退回 height/2 */
const originYOf = (s: NodeSize): number => s.originY ?? s.height / 2

/** SB 用 `parseInt(styleValue)`（"35pt" → 35），不是 parseFloat */
function parseIntStyle(value: unknown, fallback: number): number {
  if (typeof value === 'number') return Math.trunc(value)
  if (typeof value === 'string') {
    const n = parseInt(value, 10)
    return Number.isNaN(n) ? fallback : n
  }
  return fallback
}

/** SB `defaultStyles.getStyleValue(className, key)` */
function getDefaultSpacing(state: SheetState | null, node: NodeDesc, key: 'spacingMajor' | 'spacingMinor'): number {
  const fallback = key === 'spacingMajor' ? 26 : 8
  if (!state) return fallback
  const cls = classifyNode(state.doc, node.id)
  const entry = (DEFAULT_STYLES as Record<string, Record<string, unknown>>)[cls]
  return parseIntStyle(entry?.[key], fallback)
}

function isCentral(state: SheetState | null, node: NodeDesc): boolean {
  return state ? classifyNode(state.doc, node.id) === 'centralTopic' : false
}

/** 轴节点自己的结构类是 timeline.sided.horizontal ⇒ 不是 through ⇒ 线尾补丁用 LINE_SPACING(16) */
function lineEndPatch(node: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null): number {
  if (!styleEngine || !state) return 0
  return getLineEndSpacingPatchGap({
    isTimelineThrough: false,
    hasArrow: hasLineEndArrow(styleEngine.getStyleValue(state, node.id, 'arrowEndClass')),
    lineWidth: parseIntStyle(styleEngine.getStyleValue(state, node.id, 'lineWidth'), 0),
  })
}

/** SB `timelinesidedhorizontal.getMainlineSpacing`（designPadding = 中央主题 18 / 其它 10） */
function getMainlineSpacing(node: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null): number {
  const designPadding = isCentral(state, node) ? 18 : 10
  const spacingMajor = styleEngine && state
    ? parseIntStyle(styleEngine.getStyleValue(state, node.id, 'spacingMajor'), 0)
    : 0
  const def = getDefaultSpacing(state, node, 'spacingMajor') || 1
  return (spacingMajor * designPadding) / def + lineEndPatch(node, styleEngine, state)
}

/** SB `timelinesidedhorizontal.getTopicSpacing`（designPadding = 中央主题 20 / 其它 10，读 spacingMinor） */
function getTopicSpacing(node: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null): number {
  const designPadding = isCentral(state, node) ? 20 : 10
  const spacingMinor = styleEngine && state
    ? parseIntStyle(styleEngine.getStyleValue(state, node.id, 'spacingMinor'), 0)
    : 0
  const def = getDefaultSpacing(state, node, 'spacingMinor') || 1
  return (spacingMinor * designPadding) / def
}

interface SidedProv {
  nodes: Map<string, NodeLayout>
  bb: TlBB
  own: NodeLayout
  originY: number
}

/**
 * 轴布局本体（SB `timelinesidedhorizontal.calAttachedChildrenPos`），坐标帧 = 本节点原点
 * 平移到 (originX, originY)。返回 SB 的 `branch.bounds`（相对本节点原点）。
 */
function layoutTimelineSidedAxis(
  node: NodeDesc,
  originX: number,
  originY: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, NodeLayout>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  depth: number,
): TlBB {
  const size = sizeMap.get(node.id)!
  const w = size.width
  const h = size.height
  const selfOriginY = originYOf(size)
  const tt = measureTextSize(getTitle(node), getFontSize(node, styleEngine, state), options)
  nodes.set(node.id, {
    x: originX - w / 2,
    y: originY - selfOriginY,
    width: w,
    height: h,
    titleWidth: size.titleWidth ?? tt.width,
    titleHeight: size.titleHeight ?? tt.height,
    branchHeight: h,
    partBounds: size.partBounds,
  })

  const children = isCollapsed(node) ? [] : getAttachedChildren(node)
  if (children.length === 0) return { x: -w / 2, y: -selfOriginY, width: w, height: h }

  const MAIN_LINE_PADDING = getMainlineSpacing(node, styleEngine, state)
  const CHILDREN_PADDING = getTopicSpacing(node, styleEngine, state)
  // SB: addPoint(getBasePoint(parent, RIGHT), getPointOffset(parent, RIGHT)).y —— rect/roundedRect
  // 的 getPointOffset 恒为 {0,0}、getJointPosition(RIGHT).y 恒为 0 ⇒ parentShapeOffsetY = 0
  const parentShapeOffsetY = 0

  // 子分支一律是 timeline.horizontal.up / .down（available = [] ⇒ preset 全都不可用）
  const provs: SidedProv[] = []
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const dir: 'up' | 'down' = i % 2 === 0 ? 'up' : 'down'
    const nextH = i + 1 < children.length ? sizeMap.get(children[i + 1].id)!.height : 0
    const provNodes = new Map<string, NodeLayout>()
    const bb = layoutTimelineBranch(child, 0, 0, dir, depth + 1, nextH, options, sizeMap, provNodes, styleEngine, state)
    provs.push({ nodes: provNodes, bb, own: provNodes.get(child.id)!, originY: originYOf(sizeMap.get(child.id)!) })
  }

  // SB maxBoundaryOffsetY（先扫一遍所有子分支）
  let maxUp = 0
  let maxDown = 0
  for (let i = 0; i < children.length; i++) {
    const cs = sizeMap.get(children[i].id)!
    const cOriginY = originYOf(cs)
    // topicView.bounds = { y: -originY, height: 主题盒高（含 labels） }
    const tbY = -cOriginY
    const tbH = cs.height
    const bb = provs[i].bb
    if (i % 2 === 0) {
      maxUp = Math.min(maxUp, tbH + tbY - (bb.height + bb.y))
    } else {
      maxDown = Math.max(maxDown, tbY - bb.y)
    }
  }

  // SB 收尾用的并集（相对本节点原点）
  let minX = -w / 2
  let minY = -selfOriginY
  let maxX = w / 2
  let maxY = h - selfOriginY

  let lastUp: { posX: number; bb: TlBB } | null = null
  let lastDown: { posX: number; bb: TlBB } | null = null
  let prevPosX = 0
  let prevW = w

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const p = provs[i]
    const cs = sizeMap.get(child.id)!
    const cw = cs.width
    const cOriginY = originYOf(cs)
    const isUp = i % 2 === 0

    // getBasePoint(prev, RIGHT).x = prev 的 shapeWidth/2；getBasePoint(child, LEFT).x = -cw/2
    const prevShapeOffsetX = prevW / 2
    const currShapeOffsetX = -cw / 2
    const currShapeOffsetY = isUp ? cOriginY : -cOriginY
    const posXByPrevBranch =
      prevPosX + prevShapeOffsetX + (i === 0 ? 1.5 : 1) * CHILDREN_PADDING - currShapeOffsetX

    const sameDir = isUp ? lastUp : lastDown
    // 首项取父的 topicView.shapeBounds（{x: -w/2, width: w} ⇒ 右边缘 = +w/2）
    const posXBySameDirBranch = sameDir
      ? sameDir.posX + sameDir.bb.width + sameDir.bb.x + MAIN_LINE_PADDING - p.bb.x
      : 0 + w + (-w / 2) + MAIN_LINE_PADDING - p.bb.x

    const posX = Math.max(posXByPrevBranch, posXBySameDirBranch)
    const posY = parentShapeOffsetY + (isUp
      ? -(MAIN_LINE_PADDING * 3 + currShapeOffsetY) + maxUp
      : MAIN_LINE_PADDING * 3 - currShapeOffsetY + maxDown)

    const dx = (originX + posX - cw / 2) - p.own.x
    const dy = (originY + posY) - (p.own.y + p.originY)
    for (const [id, nl] of p.nodes) {
      nodes.set(id, { ...nl, x: nl.x + dx, y: nl.y + dy })
    }

    minX = Math.min(minX, posX + p.bb.x)
    maxX = Math.max(maxX, posX + p.bb.x + p.bb.width)
    minY = Math.min(minY, posY + p.bb.y)
    maxY = Math.max(maxY, posY + p.bb.y + p.bb.height)

    if (isUp) lastUp = { posX, bb: p.bb }
    else lastDown = { posX, bb: p.bb }
    prevPosX = posX
    prevW = cw
    void child
  }

  const ownLayout = nodes.get(node.id)
  if (ownLayout) ownLayout.branchHeight = Math.max(h, maxY - minY)

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

/**
 * 独立布局一棵 timeline.sided.horizontal 子树（供其它结构按生效结构委派使用）。
 * 契约同 `subtree-delegate.layoutDelegatedSubtree`。
 */
export function layoutTimelineSidedSubtree(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  baseDepth = 1,
): { nodes: Map<string, NodeLayout>; bb: TlBB; originY: number } {
  const sizeMap = new Map<string, NodeSize>()
  measureStyledSubtree(node, options, sizeMap, 'horizontal', styleEngine, state)
  const raw = new Map<string, NodeLayout>()
  const bb = layoutTimelineSidedAxis(node, 0, 0, options, sizeMap, raw, styleEngine, state, baseDepth)
  const own = raw.get(node.id)!
  const originY = originYOf(sizeMap.get(node.id)!)
  const ox = own.x + own.width / 2
  const oy = own.y + originY
  const nodes = new Map<string, NodeLayout>()
  for (const [id, nl] of raw) nodes.set(id, { ...nl, x: nl.x - ox, y: nl.y - oy })
  return { nodes, bb, originY }
}

export const timelineSidedHorizontalLayoutAlgorithm: LayoutAlgorithm = {
  name: 'timeline-sided-horizontal',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, NodeLayout>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureStyledSubtree(root, options, sizeMap, 'horizontal', styleEngine, state)

    layoutTimelineSidedAxis(root, 0, 0, options, sizeMap, nodes, styleEngine, state, 0)

    // 平移到正数区
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const l of nodes.values()) {
      minX = Math.min(minX, l.x)
      minY = Math.min(minY, l.y)
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }
    const ox = minX < 0 ? -minX : 0
    const oy = minY < 0 ? -minY : 0
    if (ox !== 0 || oy !== 0) {
      for (const l of nodes.values()) { l.x += ox; l.y += oy }
    }
    return { nodes, totalWidth: maxX - minX, totalHeight: maxY - minY }
  },
}
