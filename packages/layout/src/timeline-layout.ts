// TODO: 与 XMind timeline 交替上下/左右排列验证
// TODO: 时间线轴线偏移量
/**
 * Timeline 布局 — 时间线
 *
 * 节点沿水平/垂直轴排列，子节点挂在时间线上方/下方（或左右）
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import { DEFAULT_STYLES, classifyNode } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions, NodeLayout } from './layout-engine'
import { delegateLogicSubtree } from './skeleton-delegate'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { getTitle, getFontSize, isCollapsed, getAttachedChildren, findRootTopic } from './layout-utils'
import { measureStyledSubtree, getLineEndSpacingPatchGap, hasLineEndArrow } from './spacing-utils'
type NodeSize = import('./layout-utils').SimpleNodeSize

function getSpacing(node: NodeDesc, key: 'spacingMajor' | 'spacingMinor', fallback: number, styleEngine: StyleEngine | null, state: SheetState | null): number {
  if (styleEngine && state) {
    const val = styleEngine.getStyleValue(state, node.id, key)
    if (typeof val === 'number') return val
  }
  return fallback
}

/** 递归计算子树总高度（垂直方向的总跨度） */
function subtreeTotalHeight(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine: StyleEngine | null, state: SheetState | null, gapKey: 'spacingMajor' | 'spacingMinor'): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.height
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.height
  let total = 0
  for (let i = 0; i < children.length; i++) {
    total += subtreeTotalHeight(children[i], options, sizeMap, styleEngine, state, gapKey)
    if (i < children.length - 1) total += getSpacing(node, gapKey, options.verticalGap, styleEngine, state)
  }
  return Math.max(size.height, total)
}

// ─── 水平时间线 ───

/** 解析样式数值（'26pt' → 26） */
function parseNum(v: unknown, fallback: number): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v)
    if (!Number.isNaN(n)) return n
  }
  return fallback
}

/** snowbrush defaultStyles 的 spacingMajor（按节点 class），用于 getTopicSpacing 比例换算 */
function getDefaultSpacingMajor(state: SheetState | null, node: NodeDesc): number {
  if (!state) return 26
  const cls = classifyNode(state.doc, node.id)
  const entry = (DEFAULT_STYLES as Record<string, Record<string, unknown>>)[cls]
  return parseNum(entry?.spacingMajor, 26)
}

/**
 * SB `getLineEndSpacingPatchGap(node)`。`isTimelineThrough` 按**这个节点自己的结构类**判：
 * timeline.horizontal 的轴节点 → true（LINE_TIMELINE_THROUGH_SPACING = 4），
 * 它的 up/down 子分支（timeline.horizontal.up/down）→ false（LINE_SPACING = 16）。
 */
function getLineEndPatch(node: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null, isTimelineThrough: boolean): number {
  if (!styleEngine || !state) return 0
  return getLineEndSpacingPatchGap({
    isTimelineThrough,
    hasArrow: hasLineEndArrow(styleEngine.getStyleValue(state, node.id, 'arrowEndClass')),
    lineWidth: parseNum(styleEngine.getStyleValue(state, node.id, 'lineWidth'), 0),
  })
}

/** snowbrush timelinehorizontal.getTopicSpacing: styleSpacing * 100 / defaultSpacing + lineEnd */
function getAxisSpacing(node: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null): number {
  const styleSpacing = styleEngine && state ? parseNum(styleEngine.getStyleValue(state, node.id, 'spacingMajor'), 0) : 0
  const defaultSpacing = getDefaultSpacingMajor(state, node) || 1
  // 轴节点的生效结构类 = timeline.horizontal → isTimelineThroughStructure 为真 → 补丁用 4
  return (styleSpacing * 100) / defaultSpacing + getLineEndPatch(node, styleEngine, state, true)
}

/** snowbrush timelinehorizontalup/down.getTopicSpacing: styleSpacing * PADDING(20) / defaultSpacing + lineEnd */
function getBranchSpacing(node: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null): number {
  const styleSpacing = styleEngine && state ? parseNum(styleEngine.getStyleValue(state, node.id, 'spacingMajor'), 0) : 0
  const defaultSpacing = getDefaultSpacingMajor(state, node) || 1
  // up/down 分支的结构类是 timeline.horizontal.up/down → 不是 through → 补丁用 16
  return (styleSpacing * 20) / defaultSpacing + getLineEndPatch(node, styleEngine, state, false)
}

const LINECOLPOS = 13

interface TlBB { x: number; y: number; width: number; height: number }

/**
 * 主题盒原点（shape 中心）到盒顶的距离。measureStyledSubtree 现在是 part-aware 的，
 * 会填 originY = shapeHeight/2；无 labels 时恒等于 height/2（所以老 fixture 不受影响）。
 * SB 的 boundaryBounds.y / newBounds.y 都以原点为参考，所有「盒顶 ↔ 原点」换算都要用它。
 */
const originYOf = (s: NodeSize): number => s.originY ?? s.height / 2
interface TlProv {
  nodes: Map<string, NodeLayout>
  bb: TlBB
  own: NodeLayout
  /** 子树根的主题盒原点偏移（shapeHeight/2）。委派子树是 part-aware 的，必须用它；
   *  timeline 自己的递归是 part-blind（SimpleNodeSize），仍用 height/2 */
  originY: number
}

/**
 * 布局一个 axis 子分支（timeline-horizontal-up / down），对齐 snowbrush
 * timelinehorizontalup/down.calAttachedChildrenPos：
 * 子节点列在父中心右侧 PADDING 处垂直堆叠（up 向上 / down 向下），更深层委派 logic。
 */
function layoutTimelineBranch(
  node: NodeDesc,
  left: number,
  centerY: number,
  dir: 'up' | 'down',
  depth: number,
  nextBrotherHeight: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, NodeLayout>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): TlBB {
  const size = sizeMap.get(node.id)!
  const h = size.height
  const w = size.width
  const originY = originYOf(size)
  const tt = measureTextSize(getTitle(node), getFontSize(node, styleEngine, state), options)
  nodes.set(node.id, {
    x: left, y: centerY - originY, width: w, height: h,
    titleWidth: size.titleWidth ?? tt.width, titleHeight: size.titleHeight ?? tt.height,
    branchHeight: h, partBounds: size.partBounds,
  })

  const children = isCollapsed(node) ? [] : getAttachedChildren(node)
  if (children.length === 0) {
    return { x: -w / 2, y: -originY, width: w, height: h }
  }

  const PAD = getBranchSpacing(node, styleEngine, state)
  const lineCorner = styleEngine && state ? parseNum(styleEngine.getStyleValue(state, node.id, 'lineCorner'), 0) : 0
  const ext = nextBrotherHeight > h ? (nextBrotherHeight - h) / 2 : 0

  const provs: TlProv[] = []
  for (const child of children) {
    const del = delegateLogicSubtree(child, 0, 0, depth, options, styleEngine, state)
    if (del) {
      const own = del.nodes.get(child.id)!
      provs.push({ nodes: del.nodes, bb: { x: del.bb.x, y: del.bb.y, width: del.bb.width, height: del.bb.height }, own, originY: del.originY })
    } else {
      const provNodes = new Map<string, NodeLayout>()
      layoutTimelineHorizontal(child, 0, 0, node, options, sizeMap, provNodes, styleEngine, state, depth + 1)
      const cs = sizeMap.get(child.id)!
      const own = provNodes.get(child.id)!
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      for (const nl of provNodes.values()) {
        minX = Math.min(minX, nl.x); maxX = Math.max(maxX, nl.x + nl.width)
        minY = Math.min(minY, nl.y); maxY = Math.max(maxY, nl.y + nl.height)
      }
      provs.push({
        nodes: provNodes,
        bb: { x: minX - (own.x + cs.width / 2), y: minY - (own.y + originYOf(cs)), width: maxX - minX, height: maxY - minY },
        own,
        originY: originYOf(cs),
      })
    }
  }

  const childrenH = provs.reduce((a, p) => a + p.bb.height, 0) + (provs.length - 1) * PAD
  const childrenW = Math.max(...provs.map((p) => p.bb.width))
  const centerX = left + w / 2
  // SB newBounds.y = -originY、newBounds.height = 主题盒高（含 labels）
  const top = centerY - originY
  const bottom = top + h

  // snowbrush: childrenX = 2*newBounds.x + newBounds.width + PADDING（中心坐标下即 PADDING）
  const gcCenterX = centerX + PAD
  // SB 两个方向的「父盒 → 子列」间距口径不同，别混用：
  //   timelinehorizontalup.calAttachedChildrenPos:
  //     childrenY = newBounds.y - LINECOLPOS - lineCorner - childrenSize.height - ext
  //   timelinehorizontaldown.calAttachedChildrenPos:
  //     childrenY = newBounds.y + newBounds.height + PADDING + ext
  // PADDING = getTopicSpacing = spacingMajor * 20 / defaultSpacingMajor（本 fixture = 20），
  // 而 LINECOLPOS + lineCorner = 13 + 8 = 21 —— 之前 down 也用了 21，
  // 导致下侧分支整棵子树低 1px（timeline-horizontal avgΔY 0.5）。
  let bbTop: number
  if (dir === 'up') {
    bbTop = top - LINECOLPOS - lineCorner - childrenH - ext
  } else {
    bbTop = bottom + PAD + ext
  }
  let cum = bbTop
  for (const p of provs) {
    const dx = gcCenterX - p.bb.x - (p.own.x + p.own.width / 2)
    // 子树原点落到 cum - bb.y：bb.y 相对**原点**，所以这里要减 originY 而不是 height/2
    const dy = cum - p.bb.y - (p.own.y + p.originY)
    for (const [id, nl] of p.nodes) {
      nodes.set(id, { ...nl, x: nl.x + dx, y: nl.y + dy })
    }
    cum += p.bb.height + PAD
  }

  const bbY = dir === 'up' ? bbTop - centerY : -originY
  // SB down: newBounds.height = maxBottom - newBounds.y + ext = h + PADDING + childrenH + 2*ext
  // SB up:   newBounds.height += childrenSize.height + LINECOLPOS + lineCorner + ext
  const bbH = dir === 'up'
    ? h + LINECOLPOS + lineCorner + childrenH + ext
    : h + PAD + childrenH + 2 * ext
  const bbW = w / 2 + PAD + childrenW
  return { x: -w / 2, y: bbY, width: bbW, height: bbH }
}

/** axis 层，对齐 snowbrush timelinehorizontal.calAttachedChildrenPos */
function layoutTimelineHorizontal(
  node: NodeDesc,
  x: number,
  y: number,
  parent: NodeDesc | null,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, NodeLayout>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  depth = 0,
): void {
  void parent
  const size = sizeMap.get(node.id)!
  const h = size.height
  const w = size.width
  const tt2 = measureTextSize(getTitle(node), getFontSize(node, styleEngine, state), options)
  nodes.set(node.id, {
    x, y, width: w, height: h,
    titleWidth: size.titleWidth ?? tt2.width, titleHeight: size.titleHeight ?? tt2.height,
    branchHeight: h, partBounds: size.partBounds,
  })

  const children = isCollapsed(node) ? [] : getAttachedChildren(node)
  if (children.length === 0) return

  const PAD = getAxisSpacing(node, styleEngine, state)
  const parentCenterX = x + w / 2
  // 轴上子分支对齐的是父主题的**原点**（shape 中心），不是主题盒中心
  const parentCenterY = y + originYOf(size)

  const provs: TlProv[] = []
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const dir: 'up' | 'down' = i % 2 === 0 ? 'up' : 'down'
    const nextH = i + 1 < children.length ? sizeMap.get(children[i + 1].id)!.height : 0
    const provNodes = new Map<string, NodeLayout>()
    const bb = layoutTimelineBranch(child, 0, 0, dir, depth + 1, nextH, options, sizeMap, provNodes, styleEngine, state)
    // 这一层的 own 来自 layoutTimelineBranch（part-blind 的 SimpleNodeSize 帧），
    // 原点就是 height/2；真正的 part-aware 衔接在 layoutTimelineBranch 内部（见 TlProv.originY）
    provs.push({ nodes: provNodes, bb, own: provNodes.get(child.id)!, originY: originYOf(sizeMap.get(child.id)!) })
  }

  // axis X：三个约束取 max（中心坐标；rect shape offset = ±w/2）
  let lastUp: { centerX: number; bb: TlBB } | null = null
  let lastDown: { centerX: number; bb: TlBB } | null = null
  let prevCenterX = 0
  let prevW = w
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const p = provs[i]
    const cw = p.own.width
    const isUp = i % 2 === 0

    const posXByPrevTopic = prevCenterX + prevW / 2 + PAD + cw / 2
    const sameDir: { centerX: number; bb: TlBB } | null = isUp ? lastUp : lastDown
    const posXBySameDir: number = sameDir
      ? sameDir.centerX + sameDir.bb.x + sameDir.bb.width + PAD / 2 - p.bb.x
      : -w / 2 + w + PAD / 2 - p.bb.x
    const centerX: number = parentCenterX + Math.max(posXByPrevTopic, posXBySameDir, 0)
    const dx = centerX - (p.own.x + cw / 2)
    const dy = parentCenterY - (p.own.y + p.originY)
    for (const [id, nl] of p.nodes) {
      nodes.set(id, { ...nl, x: nl.x + dx, y: nl.y + dy })
    }
    // bb 保持子节点自身坐标系（centerX 已单独记录），避免偏移重复累加
    const relBB: TlBB = { x: p.bb.x, y: p.bb.y, width: p.bb.width, height: p.bb.height }
    const relCenterX: number = centerX - parentCenterX
    if (isUp) lastUp = { centerX: relCenterX, bb: relBB }
    else lastDown = { centerX: relCenterX, bb: relBB }
    prevCenterX = relCenterX
    prevW = cw
    void child
  }

  let bbTop = Infinity
  let bbBottom = -Infinity
  for (let i = 0; i < children.length; i++) {
    const own = nodes.get(children[i].id)!
    const relTop = own.y - y + provs[i].bb.y
    bbTop = Math.min(bbTop, relTop)
    bbBottom = Math.max(bbBottom, relTop + provs[i].bb.height)
  }
  const ownLayout = nodes.get(node.id)
  if (ownLayout) ownLayout.branchHeight = Math.max(h, bbBottom) - Math.min(0, bbTop)
}

export const timelineHorizontalLayoutAlgorithm: LayoutAlgorithm = {
  name: 'timeline-horizontal',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, NodeLayout>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureStyledSubtree(root, options, sizeMap, 'horizontal', styleEngine, state)

    layoutTimelineHorizontal(root, options.rootOffsetX, 200, null, options, sizeMap, nodes, styleEngine, state)

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

// ─── 垂直时间线 ───

function layoutTimelineVertical(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): void {
  const size = sizeMap.get(node.id)!
  const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node), options)

  // 分支高度 = 子节点沿垂直轴排列的总跨度
  let branchHeight = size.height
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    let total = 0
    for (let i = 0; i < children.length; i++) {
      total += subtreeTotalHeight(children[i], options, sizeMap, styleEngine, state, 'spacingMajor')
      if (i < children.length - 1) total += getSpacing(node, 'spacingMajor', options.verticalGap, styleEngine, state)
    }
    branchHeight = Math.max(size.height, total)
  }

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight })

  if (isCollapsed(node)) return
  if (children.length === 0) return

  // 子节点沿垂直轴排列，交替左右
  let childY = y + size.height + getSpacing(node, 'spacingMajor', options.verticalGap, styleEngine, state)
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const cs = sizeMap.get(child.id)!
    const childX = (i % 2 === 0)
      ? x - cs.width - getSpacing(node, 'spacingMinor', options.horizontalGap, styleEngine, state)  // 左侧
      : x + size.width + getSpacing(node, 'spacingMinor', options.horizontalGap, styleEngine, state)  // 右侧
    layoutTimelineVertical(child, childX, childY, options, sizeMap, nodes, styleEngine, state)
    childY += subtreeTotalHeight(child, options, sizeMap, styleEngine, state, 'spacingMajor') + getSpacing(node, 'spacingMajor', options.verticalGap, styleEngine, state)
  }
}

export const timelineVerticalLayoutAlgorithm: LayoutAlgorithm = {
  name: 'timeline-vertical',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureStyledSubtree(root, options, sizeMap, 'horizontal', styleEngine, state)

    layoutTimelineVertical(root, 200, options.rootOffsetX, options, sizeMap, nodes, styleEngine, state)

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
