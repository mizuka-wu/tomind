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
import { isCollapsed, getAttachedChildren, findRootTopic, getAttr, getEffectiveStructureClass, getStructurePreset, isElbowLineClass } from './layout-utils'
import { hasNonTitleParts } from './part-measure'
import { measurePartAwareNode, measureTitleOnlyNode } from './part-node-size'
import { getLineEndSpacingPatchGap, hasLineEndArrow } from './spacing-utils'
import { SC } from './child-structure'
import type { DelegableStructure } from './child-structure'
import { resolveStructures } from './structure-resolve'
import { layoutDelegatedSubtree, placeDelegatedSubtree } from './subtree-delegate'
import type { DelegatedSubtreeLayout } from './subtree-delegate'

/**
 * 对齐 snowbrush calcOutwardDistanceByAttachedChildren：
 * 子节点数 >= 8 且连接线非 elbow/roundedElbow 时，子节点整体向外偏移。
 */
const OUTWARD_CHILDREN_LIMIT = 8
const OUTWARD_K = 0.15
const OUTWARD_MIN = 400
const OUTWARD_MAX = 800
/** 见 layout-utils.isElbowLineClass —— SB 是精确相等，不是子串匹配 */

/**
 * snowbrush MAP_LIKE_STRUCTURES + LOGIC_CHART_STRUCTURES + ORG_CHART_STRUCTURES。
 * calcOutwardDistanceByAttachedChildren 只在这三类结构下生效。
 */
const OUTWARD_STRUCTURE_CLASSES: readonly string[] = [
  'org.xmind.ui.map',
  'org.xmind.ui.map.unbalanced',
  'org.xmind.ui.map.anticlockwise',
  'org.xmind.ui.map.clockwise',
  'org.xmind.ui.map.floating',
  'org.xmind.ui.map.floating.clockwise',
  'org.xmind.ui.map.floating.anticlockwise',
  'org.xmind.ui.logic.left',
  'org.xmind.ui.logic.right',
  'org.xmind.ui.org-chart.up',
  'org.xmind.ui.org-chart.down',
]

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
  /**
   * 主题盒原点（SB branch position = **shape 中心**）到盒顶的距离 = shapeHeight/2。
   * 有 labels 时 height > shapeHeight，原点不在盒中心，所有「盒顶 ↔ 原点」换算必须用它。
   */
  originY: number
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
      originY: result.shapeHeight / 2,
      titleWidth: result.titleWidth,
      titleHeight: result.titleHeight,
      partBounds: result.partBounds,
    }
  }

  const result = measureTitleOnlyNode(node, padding, options, styleEngine, state)
  return {
    width: result.width,
    height: result.height,
    originY: result.shapeHeight / 2,
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

/**
 * SB `AbstractStructure.calcSpacingMajor(branchView)`
 *   = parseInt(branchView.figure.majorSpacing) + getLineEndSpacingPatchGap(branchView)
 * figure.majorSpacing 已经含 curve/straight/fold/bight 的 ×2（refreshSpacingMajor）。
 *
 * 第二项此前**完全缺失**：只有 brace 通过 `spacingMajorExtra = 16` 硬编码补了一份
 * （= SB 的「isBrace && !hasArrow → LINE_SPACING」那一支）。有箭头时 SB 是
 * `lineWidth * arrowSizeRatio(4) + (isTimelineThrough ? 4 : 16)`，
 * 实测 logic.right 的 d2 节点（lineWidth 2 + triangle）SB calcSpacingMajor = 26 + 24 = **50**，
 * TM 只有 26 → 委派子树每层窄 24px，在 timeline 轴上累积成 -48 / -96 / -192。
 *
 * `isBrace` 的判据是 SB `utils/line.shouldPatchLineSpacing` 的第一句
 * `isBraceStructure(startBranchView)` —— 看的是**这个分支自己的生效结构类**，不是「算法入口是不是 brace」。
 * 旧实现用 `extra > 0`（= createLogicLikeAlgorithm 传的 BRACE_LINE_SPACING，只作用于最外层调用）
 * 近似它：test-brace-right 的 skeleton 写了 `mainTopic: logic.right`，深层 eff 确实是 logic.right，
 * 所以量到 0；但 skeleton 没写 mainTopic（或写的就是 brace.right）时，SB 里 d1+ 的 preset 缺失
 * ⇒ **继承父结构 brace.right** ⇒ 每一层都要加这 16px（实测 noskel-brace.right：TM 少 51.5px）。
 * 现在按 `structs.eff` 逐节点判定，`extra` 只作为拿不到生效结构时的兜底。
 */
function getSpacingMajor(node: NodeDesc, options: LayoutOptions, styleEngine: StyleEngine | null, state: SheetState | null, extra: number = 0, isBrace: boolean = extra > 0): number {
  // 对齐 snowbrush calcSpacingMajor：curve/straight 线 ×2
  const gap = getNodeSpacing(node, options, styleEngine, state).horizontalGap
  const DOUBLE = ['curve', 'straight', 'fold', 'bight']
  let base = gap
  if (styleEngine && state) {
    const lineClass = styleEngine.getStyleValue(state, node.id, 'lineClass')
    const s = typeof lineClass === 'string' ? lineClass : ''
    if (DOUBLE.some(c => s.includes(c))) base = gap * 2
  }
  const patch = styleEngine && state
    ? getLineEndSpacingPatchGap({
      isBrace,
      // logic/brace 结构的分支永远不是 timeline.horizontal / timeline.through.vertical
      isTimelineThrough: false,
      hasArrow: hasLineEndArrow(styleEngine.getStyleValue(state, node.id, 'arrowEndClass')),
      lineWidth: parseStyleValue(styleEngine.getStyleValue(state, node.id, 'lineWidth'), 0),
    })
    : extra
  return base + patch
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

function usesOutwardOffset(node: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null, effStructure?: string | null): boolean {
  // SB braceleftandright 自己覆写了 calAttachedChildrenPos，**根本不调用**
  // calcOutwardDistanceByAttachedChildren ⇒ 生效结构是 brace.* 的分支一律不外扩
  //（不看线型：skeleton 把整棵树都声明成 brace.right 时主题的 line-class 未必是 brace）。
  if (effStructure === SC.BRACE_RIGHT || effStructure === SC.BRACE_LEFT) return false
  if (!styleEngine || !state) return true
  const v = styleEngine.getStyleValue(state, node.id, 'lineClass')
  const s = typeof v === 'string' ? v : ''
  // snowbrush calcOutwardDistanceByAttachedChildren 仅 map/logic/org 结构生效；brace 不外扩
  if (s.includes('brace')) return false
  if (!isElbowLineClass(s)) {
    // 结构类不在白名单里也不外扩：SB 判据是 parentBranch.getStructureClass()，
    // 与走哪个布局算法无关。例如 legacy 'org.xmind.ui.fishbone.left' 在 SB 里
    // 回退成 logic 布局，但结构类不属于这三类 → outward=0；
    // TM 之前只看 lineClass，多算了 60px（root 12 个子节点 → 0.15*(800-400)）。
    if (state) {
      const sc = getEffectiveStructureClass(state.doc, node)
      if (sc !== null && !OUTWARD_STRUCTURE_CLASSES.includes(sc)) return false
    }
    return true
  }
  return false
}

function calcOutwardDistance(
  node: NodeDesc,
  children: readonly NodeDesc[],
  subtreeHeight: (c: NodeDesc) => number,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  effStructure?: string | null,
): number {
  if (children.length < OUTWARD_CHILDREN_LIMIT) return 0
  if (!usesOutwardOffset(node, styleEngine, state, effStructure)) return 0
  const totalHeight = children.reduce((sum, c) => sum + subtreeHeight(c), 0)
  if (totalHeight <= OUTWARD_MIN) return 0
  return OUTWARD_K * (Math.min(totalHeight, OUTWARD_MAX) - OUTWARD_MIN)
}

// ─── 生效结构 / 委派表（SB utils/branch.getViewStructure）───

/** 宿主算法属于哪一族：决定「哪些生效结构是本宿主自己的递归、不用委派」 */
export type LogicHostFamily = 'logic' | 'brace'

interface LogicStructures {
  /** nodeId → 生效结构类（含「preset 缺失 → 继承父结构」） */
  eff: Map<string, string>
  /** nodeId → 该子分支整棵交给别的结构布局（缺省 = 本宿主自己递归） */
  delegate: Map<string, DelegableStructure>
  /** nodeId → 文档深度（委派 tree 子树时给它当 skeleton 角色基准） */
  depth: Map<string, number>
  /** computePlacement 阶段算好的委派子树，layoutSubtree 阶段平移复用 */
  cache: Map<string, DelegatedSubtreeLayout>
  options: LayoutOptions
  styleEngine: StyleEngine | null
  state: SheetState | null
}

/**
 * 宿主自己就是这一族 ⇒ 不委派，走本地递归。
 * brace 也算 logic 族的本地递归：SB `BraceLeftAndRight` 与 `logicLeftAndRight` 是同一套堆叠公式
 * （差异只有 calcSpacingMajor 的 LINE_SPACING 补丁与不走 outward，两者都已按**生效结构**逐节点判），
 * 所以「logic 宿主下某个子分支声明 brace.right」不需要换布局器，只需要那一层多补 16px。
 * 只有 side 不同（右宿主里长出左子树）或换族（tree.*）才真的委派出去。
 */
function isHostOwnFamily(side: 'right' | 'left', d: DelegableStructure): boolean {
  if (d.kind === 'tree') return false
  return d.side === side
}

function buildLogicStructures(
  root: NodeDesc,
  rootEff: string,
  side: 'right' | 'left',
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  rootDepth = 0,
): LogicStructures {
  const r = resolveStructures(root, rootEff, state, (d) => isHostOwnFamily(side, d), rootDepth)
  return { eff: r.eff, delegate: r.delegate, depth: r.depth, cache: new Map(), options, styleEngine, state }
}

/** 取（并缓存）某个子分支的委派布局结果，坐标帧 = child 原点 (0,0) */
function delegatedOf(structs: LogicStructures, child: NodeDesc): DelegatedSubtreeLayout {
  const hit = structs.cache.get(child.id)
  if (hit) return hit
  const d = structs.delegate.get(child.id)!
  const res = layoutDelegatedSubtree(
    child,
    d,
    structs.options,
    structs.styleEngine,
    structs.state,
    structs.depth.get(child.id) ?? 1,
  )
  structs.cache.set(child.id, res)
  return res
}

/** 子树在堆叠轴上的高度：委派的取 SB child.boundaryBounds.height，本地递归的取 placement */
function childStackHeight(structs: LogicStructures, placement: Map<string, LogicPlacement>, c: NodeDesc): number {
  if (structs.delegate.has(c.id)) return delegatedOf(structs, c).bb.height
  return placement.get(c.id)!.bb.height
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
  structs: LogicStructures,
): LocalBB {
  const size = sizeMap.get(node.id)!
  const h = size.height
  // SB 的 boundaryBounds / topicView.bounds 都以**主题盒原点（shape 中心）**为参考，
  // 原点 = 盒顶 + originY（有 labels 时 originY = shapeHeight/2 ≠ height/2）
  const oy = size.originY
  const children = isCollapsed(node) ? [] : getAttachedChildren(node)
  if (children.length === 0) {
    const bb = { y: -oy, height: h }
    placement.set(node.id, { centers: [], bb })
    return bb
  }

  // 被委派的子分支：bb 直接用 SB 的 child.boundaryBounds（由那个结构自己算），
  // 宿主只负责按它堆叠 —— 这正是 SB 「父结构用 child.boundaryBounds 摆位」的分工。
  const childBBs = children.map((c) => structs.delegate.has(c.id)
    ? { y: delegatedOf(structs, c).bb.y, height: delegatedOf(structs, c).bb.height }
    : computePlacement(c, options, sizeMap, placement, styleEngine, state, structs))
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

  let bbTop = -oy
  let bbBottom = -oy + h
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
  structs: LogicStructures,
  side: 'right' | 'left',
  spacingMajorExtra: number = 0,
): void {
  const size = sizeMap.get(node.id)!
  const pl = placement.get(node.id)!

  nodes.set(node.id, {
    x,
    // centerY 是主题盒原点（shape 中心），盒顶 = 原点 - originY
    y: centerY - size.originY,
    width: size.width,
    height: size.height,
    titleWidth: size.titleWidth,
    titleHeight: size.titleHeight,
    branchHeight: pl.bb.height,
    partBounds: size.partBounds,
  })

  const children = isCollapsed(node) ? [] : getAttachedChildren(node)
  if (children.length === 0) return

  const effStructure = structs.eff.get(node.id) ?? null
  const outwardOffset = calcOutwardDistance(
    node,
    children,
    (c) => childStackHeight(structs, placement, c),
    styleEngine,
    state,
    effStructure,
  )
  // SB shouldPatchLineSpacing 的第一句看的是**本分支自己的生效结构类**是不是 brace.*
  const isBrace = effStructure === SC.BRACE_RIGHT || effStructure === SC.BRACE_LEFT
  const spacingMajor = getSpacingMajor(node, options, styleEngine, state, spacingMajorExtra, isBrace)

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    // 生效结构不是本宿主族的子分支 ⇒ 整棵交出去（SB：那个分支的 calAttachedChildrenPos
    // 由它自己的 structure 对象跑，父结构只用 child.boundaryBounds 把它摆到位）
    if (structs.delegate.has(child.id)) {
      const del = delegatedOf(structs, child)
      const boxLeft = side === 'right'
        ? x + size.width + spacingMajor + outwardOffset
        : x - spacingMajor - outwardOffset - del.own.width
      // 原点 X = 盒左 + 盒宽/2；原点 Y = 堆叠算出来的中心（SB posY 定位的就是原点）
      placeDelegatedSubtree(del, boxLeft + del.own.width / 2, centerY + pl.centers[i], nodes)
      continue
    }
    const cs = sizeMap.get(child.id)!
    let childX: number
    if (side === 'right') {
      childX = x + size.width + spacingMajor + outwardOffset
    } else {
      childX = x - spacingMajor - outwardOffset - cs.width
    }
    layoutSubtree(child, childX, centerY + pl.centers[i], options, sizeMap, placement, nodes, styleEngine, state, structs, side, 0)
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

export interface LogicSubtreeOptions {
  /**
   * 这棵子树根的**生效结构类**（SB getViewStructure 的结果）。缺省按 side 取 logic.right/left。
   * 宿主委派 brace.* 子树时传 brace.right/left ⇒ 那一层（及其继承者）才会加 LINE_SPACING 补丁。
   */
  rootEff?: string
  /** 子树根在文档中的深度（skeleton 角色基准） */
  baseDepth?: number
}

/**
 * 独立布局一棵 logic 子树（供其他结构按 skeleton / 生效结构委派使用）。
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
  extra: LogicSubtreeOptions = {},
): { nodes: Map<string, LogicNodeLayout>; bb: LocalBB; bbX: number; bbW: number; originY: number } {
  const sizeMap = new Map<string, NodeSize>()
  measureSubtree(node, options, sizeMap, styleEngine, state)
  const placement = new Map<string, LogicPlacement>()
  const structs = buildLogicStructures(
    node,
    extra.rootEff ?? (side === 'right' ? SC.LOGIC_RIGHT : SC.LOGIC_LEFT),
    side,
    options,
    styleEngine,
    state,
    extra.baseDepth ?? 1,
  )
  const bb = computePlacement(node, options, sizeMap, placement, styleEngine, state, structs)
  const nodes = new Map<string, LogicNodeLayout>()
  layoutSubtree(node, x, centerY, options, sizeMap, placement, nodes, styleEngine, state, structs, side)
  let minX = Infinity
  let maxX = -Infinity
  const own = nodes.get(node.id)!
  const centerX = own.x + own.width / 2
  for (const nl of nodes.values()) {
    minX = Math.min(minX, nl.x)
    maxX = Math.max(maxX, nl.x + nl.width)
  }
  // originY = 根节点主题盒原点（shape 中心）到盒顶的距离 = shapeHeight/2。
  // 宿主布局（timeline / treetable / matrix / org-chart / tree）把委派子树接到自己的
  // 坐标系时要按**原点**对齐，不能用 height/2 —— 有 labels 时两者差 (boxH-shapeH)/2 = 12。
  return { nodes, bb, bbX: minX - centerX, bbW: maxX - minX, originY: sizeMap.get(node.id)!.originY }
}

export function createLogicLikeAlgorithm(
  name: string,
  side: 'right' | 'left',
  spacingMajorExtra: number = 0,
  hostStructure: string = side === 'right' ? SC.LOGIC_RIGHT : SC.LOGIC_LEFT,
): LayoutAlgorithm {
  return {
    name,
    layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
      return runLogicLayout(doc, options, styleEngine, state, side, spacingMajorExtra, hostStructure)
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
  hostStructure: string = side === 'right' ? SC.LOGIC_RIGHT : SC.LOGIC_LEFT,
): LayoutResult {
  const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number; partBounds?: Map<string, { x: number; y: number; width: number; height: number }> }>()
  const root = findRootTopic(doc)
  if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

  const sizeMap = new Map<string, NodeSize>()
  measureSubtree(root, options, sizeMap, styleEngine, state)

  // 中央分支的生效结构：SB getViewStructure 的 `isCentralBranch()` 分支
  //   = modelStructure || skeleton[centralTopic] || MAP；TM 兜底用算法自己的结构族
  const rootEff = (state ? getStructurePreset(state.doc, root) : getAttr<string>(root, 'structureClass')) ?? hostStructure
  const structs = buildLogicStructures(root, rootEff, side, options, styleEngine, state, 0)

  const placement = new Map<string, LogicPlacement>()
  computePlacement(root, options, sizeMap, placement, styleEngine, state, structs)

  const rootX = side === 'right' ? options.rootOffsetX : 0
  layoutSubtree(root, rootX, 0, options, sizeMap, placement, nodes, styleEngine, state, structs, side, spacingMajorExtra)

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
