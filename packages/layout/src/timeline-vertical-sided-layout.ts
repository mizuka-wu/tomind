/**
 * Timeline Vertical（SB `STRUCTURECLASS.TREESIDED` === TIMELINEVERTICAL，同一个字符串）
 * —— 精确移植 snowbrush `structures/timelinevertical.ts`
 *
 * 竖轴：轴节点的 attached 子分支**从上往下**堆叠，按 `getRightSide` 交替长在左右两侧，
 * 每侧的子树默认按 **tree.right / tree.left** 长（`getChildStructure`），
 * available = 按侧的 TREE_RIGHT_EXPOSED / TREE_LEFT_EXPOSED ⇒ 声明别的结构也能生效（要委派）。
 *
 * `getRightSide(branch)`：第 0 个恒为 right，之后逐个翻转，
 * 只有 `isInSameRange(branch, i)`（boundary / summary 把 i-1 与 i 圈在一起）时保持同侧
 * ⇒ 无 boundary/summary 时就是 `i % 2 === 0 → right`（与 timeline 系其它结构一致）。
 *
 * 旧实现（timeline-layout.ts 里那份）是「i%2 左右 + options.horizontalGap/verticalGap」的粗近似：
 * 没有 maxOffset 对齐、没有 SPACING=PADDING×1.5 的双约束递推、子树不委派 tree
 * ⇒ 实测 test-timeline-vertical-inherit 602.3 / 426.2。
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions, NodeLayout } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { getTitle, getFontSize, isCollapsed, getAttachedChildren, findRootTopic } from './layout-utils'
import { measureStyledSubtree, getLineEndSpacingPatchGap, hasLineEndArrow } from './spacing-utils'
import { SC, resolveChildStructure, delegationOf } from './child-structure'
import type { DelegableStructure } from './child-structure'
import { structurePresetOf } from './structure-resolve'
import { layoutDelegatedSubtree } from './subtree-delegate'

type NodeSize = import('./layout-utils').SimpleNodeSize
interface TvBB { x: number; y: number; width: number; height: number }

/** SB `layoutConstant.PADDING` */
const TV_PADDING = 20
/** SB `const SPACING = PADDING * 1.5` */
const TV_SPACING = TV_PADDING * 1.5
/** SB `offsetRatioOfStaticAngle = lineShape === STRAIGHT ? tan(30°) : 0` */
const TAN30 = Math.tan((Math.PI * 30) / 180)

const originYOf = (s: NodeSize): number => s.originY ?? s.height / 2

function parseIntStyle(value: unknown, fallback: number): number {
  if (typeof value === 'number') return Math.trunc(value)
  if (typeof value === 'string') {
    const n = parseInt(value, 10)
    return Number.isNaN(n) ? fallback : n
  }
  return fallback
}

/** SB `branch.figure.lineShape === BRANCHCONNECTION.STRAIGHT` */
function isStraightLine(node: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null): boolean {
  if (!styleEngine || !state) return false
  const v = styleEngine.getStyleValue(state, node.id, 'lineClass')
  if (typeof v !== 'string') return false
  const short = v.startsWith('org.xmind.branchConnection.') ? v.slice('org.xmind.branchConnection.'.length) : v
  return short.toLowerCase() === 'straight'
}

/** 轴节点自己的结构类是 timeline.vertical ⇒ 不是 through ⇒ 线尾补丁用 LINE_SPACING(16) */
function lineEndPatch(node: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null): number {
  if (!styleEngine || !state) return 0
  return getLineEndSpacingPatchGap({
    isTimelineThrough: false,
    hasArrow: hasLineEndArrow(styleEngine.getStyleValue(state, node.id, 'arrowEndClass')),
    lineWidth: parseIntStyle(styleEngine.getStyleValue(state, node.id, 'lineWidth'), 0),
  })
}

interface TvProv {
  nodes: Map<string, NodeLayout>
  bb: TvBB
  own: NodeLayout
  originY: number
  /** 子主题盒（SB topicView.bounds）相对 child 原点：{x: -w/2, y: -originY, width, height} */
  tb: { x: number; y: number; width: number; height: number }
  isRight: boolean
}

/**
 * 轴布局本体（SB `timelinevertical.calAttachedChildrenPos`），坐标帧 = 本节点原点平移到
 * (originX, originY)。返回 SB 的 `branch.bounds`（相对本节点原点）。
 */
function layoutTimelineVerticalAxis(
  node: NodeDesc,
  originX: number,
  originY: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, NodeLayout>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  depth: number,
): TvBB {
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

  // SB getRightSide：第 0 个恒 right，之后交替（同 boundary/summary range 时保持同侧，TM 未实现分组）
  const provs: TvProv[] = children.map((child, i) => {
    const isRight = i % 2 === 0
    // SB getViewStructure：preset → 过父结构的 available（按侧的 TREE_*_EXPOSED）→ getChildStructure
    const eff = resolveChildStructure(SC.TIMELINE_VERTICAL, structurePresetOf(child, state), {
      childIsRight: isRight,
      defaultChildStructure: isRight ? SC.TREE_RIGHT : SC.TREE_LEFT,
    }) ?? (isRight ? SC.TREE_RIGHT : SC.TREE_LEFT)
    const del: DelegableStructure = delegationOf(eff) ?? { kind: 'tree', dir: isRight ? 'right' : 'left' }
    const res = layoutDelegatedSubtree(child, del, options, styleEngine, state, depth + 1)
    const cs = sizeMap.get(child.id)!
    return {
      nodes: res.nodes,
      bb: { x: res.bb.x, y: res.bb.y, width: res.bb.width, height: res.bb.height },
      own: res.own,
      originY: res.originY,
      tb: { x: -cs.width / 2, y: -originYOf(cs), width: cs.width, height: cs.height },
      isRight,
    }
  })

  // SB maxOffset（⚠️ 初值是 Number.MIN_VALUE = 5e-324，**正数**，不是 MIN_SAFE_INTEGER）
  let maxRight = Number.MIN_VALUE
  let maxLeft = Number.MIN_VALUE
  for (const p of provs) {
    if (p.isRight) {
      maxRight = Math.max(maxRight, p.tb.x - p.bb.x)
    } else {
      maxLeft = Math.max(maxLeft, p.bb.x + p.bb.width - (p.tb.width + p.tb.x))
    }
  }

  const baseOffsetX = TV_PADDING
  const ratio = isStraightLine(node, styleEngine, state) ? TAN30 : 0
  const lineGap = lineEndPatch(node, styleEngine, state)
  // SB: branch.topicView.bounds.height + branch.topicView.bounds.y + SPACING
  let prevLeftBoundsEdgeY = h - selfOriginY + TV_SPACING
  let prevRightBoundsEdgeY = prevLeftBoundsEdgeY
  let prevEdgeY = prevLeftBoundsEdgeY

  let minX = -w / 2
  let minY = -selfOriginY
  let maxX = w / 2
  let maxY = h - selfOriginY

  for (const p of provs) {
    const cbbY = p.bb.y
    const cbbH = p.bb.height
    const posX = p.isRight
      ? baseOffsetX + maxRight - p.tb.x + lineGap
      : -baseOffsetX - maxLeft - (p.tb.width + p.tb.x) - lineGap
    const yOffsetForStaticAngle = (baseOffsetX + (p.isRight ? maxRight : maxLeft)) * ratio
    const posY = Math.max(
      (p.isRight ? prevRightBoundsEdgeY : prevLeftBoundsEdgeY) - cbbY + yOffsetForStaticAngle,
      prevEdgeY + TV_SPACING,
    )

    const dx = (originX + posX - p.own.width / 2) - p.own.x
    const dy = (originY + posY) - (p.own.y + p.originY)
    for (const [id, nl] of p.nodes) {
      nodes.set(id, { ...nl, x: nl.x + dx, y: nl.y + dy })
    }

    minX = Math.min(minX, posX + p.bb.x)
    maxX = Math.max(maxX, posX + p.bb.x + p.bb.width)
    minY = Math.min(minY, posY + cbbY)
    maxY = Math.max(maxY, posY + cbbY + cbbH)

    if (p.isRight) prevRightBoundsEdgeY = posY + cbbY + cbbH + TV_SPACING
    else prevLeftBoundsEdgeY = posY + cbbY + cbbH + TV_SPACING
    prevEdgeY = posY + TV_SPACING
  }

  const ownLayout = nodes.get(node.id)
  if (ownLayout) ownLayout.branchHeight = Math.max(h, maxY - minY)

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

/**
 * 独立布局一棵 timeline.vertical（treesided）子树（供其它结构按生效结构委派使用）。
 * 契约同 `subtree-delegate.layoutDelegatedSubtree`。
 */
export function layoutTimelineVerticalSubtree(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  baseDepth = 1,
): { nodes: Map<string, NodeLayout>; bb: TvBB; originY: number } {
  const sizeMap = new Map<string, NodeSize>()
  measureStyledSubtree(node, options, sizeMap, 'horizontal', styleEngine, state)
  const raw = new Map<string, NodeLayout>()
  const bb = layoutTimelineVerticalAxis(node, 0, 0, options, sizeMap, raw, styleEngine, state, baseDepth)
  const own = raw.get(node.id)!
  const originY = originYOf(sizeMap.get(node.id)!)
  const ox = own.x + own.width / 2
  const oy = own.y + originY
  const out = new Map<string, NodeLayout>()
  for (const [id, nl] of raw) out.set(id, { ...nl, x: nl.x - ox, y: nl.y - oy })
  return { nodes: out, bb, originY }
}

export const timelineVerticalLayoutAlgorithm: LayoutAlgorithm = {
  name: 'timeline-vertical',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, NodeLayout>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureStyledSubtree(root, options, sizeMap, 'horizontal', styleEngine, state)

    layoutTimelineVerticalAxis(root, 0, 0, options, sizeMap, nodes, styleEngine, state, 0)

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
