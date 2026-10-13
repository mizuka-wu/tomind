/**
 * Org Chart 布局 — 组织架构图
 *
 * 根节点在顶部/底部，子节点水平展开，父节点居中对齐子节点组
 *
 * 对齐 snowbrush 定位逻辑:
 *   - childrenSizeWidth = sum(children topicW) + gaps（递归前读 boundaryBounds.width）
 *   - 定位循环中 curX += subtreeW + gap（递归后读 boundaryBounds.width）
 *   - levelWidth = childrenSizeWidth + firstChild.bbX - lastChild.topicW - lastChild.bbX
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import { isCollapsed, getAttachedChildren, findRootTopic } from './layout-utils'
import { getNodeSpacing, parseStyleValue } from './spacing-utils'
import { hasNonTitleParts } from './part-measure'
import { measurePartAwareNode, measureTitleOnlyNode } from './part-node-size'
import { layoutLogicSubtree } from './logic-layout'

interface NodeSize {
  width: number
  height: number
  /**
   * 主题盒原点（SB branch position = **shape 中心**）到盒顶的距离 = shapeHeight/2。
   * SB 的 topicView.bounds.y / boundaryBounds.y 都以原点为参考（bounds.y = -originY），
   * 有 labels 时 height > shapeHeight，原点不在盒中心。
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

/** 风格感知的子树测量 */
function measureSubtree(
  node: NodeDesc,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): void {
  const spacing = getNodeSpacing(node, options, styleEngine ?? null, state ?? null, 'vertical')
  sizeMap.set(node.id, measureNodeSize(node, spacing.padding, options, styleEngine, state))
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureSubtree(child, options, sizeMap, styleEngine, state)
    }
  }
}

type NodeLayout = {
  x: number
  y: number
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  branchHeight: number
  partBounds?: Map<string, { x: number; y: number; width: number; height: number }>
}

function getOrgSpacingMajor(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): number {
  // SB orgchartupanddown.calcSpacingMajor → AbstractStructure.calcSpacingMajor 读的是
  // branchView.figure.majorSpacing（style 的 spacing-major），与排列轴无关。
  // 之前传 majorAxis='vertical' 再取 .horizontalGap，拿到的是 spacing-minor（35 而非 50），
  // 翻倍后 70 vs SB 100，整棵子树上移 30px。
  const spacing = getNodeSpacing(node, options, styleEngine, state)
  let gap = spacing.horizontalGap
  if (styleEngine && state) {
    const lc = String(styleEngine.getStyleValue(state, node.id, 'lineClass') ?? '')
    // snowbrush orgchartupanddown.calcSpacingMajor: curve/straight/fold/roundedFold/bight ×2
    if (['curve', 'straight', 'fold', 'roundedfold', 'bight'].some((c) => lc.toLowerCase().includes(c))) gap *= 2
    const arrow = String(styleEngine.getStyleValue(state, node.id, 'arrowEndClass') ?? '')
    if (arrow && !arrow.includes('none')) {
      const lw = parseStyleValue(styleEngine.getStyleValue(state, node.id, 'lineWidth'), 0)
      gap += lw * 4 + 16
    }
  }
  return gap
}

/** skeleton：子层级结构为 logic.* 时委派 logic 布局 */
function getOrgChildLogicSide(state: SheetState | null, depth: number): 'right' | 'left' | null {
  const sk = (state?.doc?.attrs as Record<string, unknown> | undefined)?.skeletonStructure as Record<string, string> | undefined
  if (!sk) return null
  const sc = sk[depth === 0 ? 'mainTopic' : 'subTopic'] ?? sk.mainTopic
  if (typeof sc !== 'string' || !sc.startsWith('org.xmind.ui.logic')) return null
  return sc.endsWith('left') ? 'left' : 'right'
}

/** snowbrush calcOutwardDistanceByAttachedChildren（org：水平方向，limit 7） */
function calcOrgOutward(provs: { bbW: number }[], lineClass: string): number {
  if (provs.length < 7) return 0
  if (lineClass.includes('elbow')) return 0
  const totalWidth = provs.reduce((s2, p) => s2 + p.bbW, 0)
  if (totalWidth <= 1000) return 0
  return 0.09 * (Math.min(totalWidth, 1600) - 1000)
}

/** SB branch.boundaryBounds — 相对主题盒中心的子树包围盒 */
interface OrgBB {
  bbX: number
  bbW: number
  bbY: number
  bbH: number
}

interface OrgProv extends OrgBB {
  nodes: Map<string, NodeLayout>
  own: NodeLayout
  /** 子节点主题盒原点到盒顶的距离（SB child.topicView.bounds.y = -originY） */
  originY: number
  /** SB getStartDirection(child) 为 LEFT/RIGHT（子分支水平生长）；仅上侧 currentAllHeight 用 */
  horizontal?: boolean
}

function layoutSubtreeDown(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, NodeLayout>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  depth = 0,
): void {
  const size = sizeMap.get(node.id)!
  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth: size.titleWidth, titleHeight: size.titleHeight, branchHeight: size.height, partBounds: size.partBounds })

  const children = isCollapsed(node) ? [] : getAttachedChildren(node)
  if (children.length === 0) return

  const style = styleEngine && state ? styleEngine.computeStyle(state, node.id) : null
  const spacingMinor = parseStyleValue(style?.spacingMinor, 0)
  const lineWidth = parseStyleValue(style?.borderWidth, 0)
  const childGap = spacingMinor + lineWidth
  const spacingMajor = getOrgSpacingMajor(node, options, styleEngine, state)
  const lineClass = styleEngine && state ? String(styleEngine.getStyleValue(state, node.id, 'lineClass') ?? '') : ''

  // 子树 provisional 布局（skeleton 委派 logic，否则递归 org）
  const logicSide = getOrgChildLogicSide(state, depth)
  const provs: OrgProv[] = []
  for (const child of children) {
    const provNodes = new Map<string, NodeLayout>()
    let bbX = 0
    let bbW = 0
    let bbY = 0
    let bbH = 0
    if (logicSide) {
      const res = layoutLogicSubtree(child, 0, 0, options, styleEngine, state, logicSide)
      for (const [id, nl] of res.nodes) provNodes.set(id, nl as unknown as NodeLayout)
      bbY = res.bb.y
      bbH = res.bb.height
      bbX = res.bbX
      bbW = res.bbW
    } else {
      layoutSubtreeDown(child, 0, 0, options, sizeMap, provNodes, styleEngine, state, depth + 1)
      const cs = sizeMap.get(child.id)!
      const own = provNodes.get(child.id)!
      let minX = Infinity
      let maxX = -Infinity
      let minY = Infinity
      let maxY = -Infinity
      for (const nl of provNodes.values()) {
        minX = Math.min(minX, nl.x)
        maxX = Math.max(maxX, nl.x + nl.width)
        minY = Math.min(minY, nl.y)
        maxY = Math.max(maxY, nl.y + nl.height)
      }
      bbW = maxX - minX
      bbX = minX - (own.x + cs.width / 2)
      bbH = maxY - minY
      // bb 相对**主题盒原点**（shape 中心）= 盒顶 + originY
      bbY = minY - own.y - cs.originY
    }
    provs.push({ nodes: provNodes, bbX, bbW, bbY, bbH, originY: sizeMap.get(child.id)!.originY, own: provNodes.get(child.id)! })
  }

  // childrenSize.width = Σ bbW + gaps
  const n = children.length
  const childrenW = provs.reduce((s2, p) => s2 + p.bbW, 0) + (n - 1) * childGap
  let minChildX = -childrenW / 2
  if (n > 1) {
    const levelWidth = childrenW + provs[0].bbX - provs[n - 1].bbW - provs[n - 1].bbX
    minChildX = -levelWidth / 2 + provs[0].bbX
  }

  // Y：childrenY = parentBottom + spacingMajor；每个子节点再 + maxOffset + outward
  // SB: maxOffset = max(child.topicView.bounds.y - child.boundaryBounds.y)
  //   topicView.bounds.y = -originY（原点 = shape 中心，无 labels 时 = -h/2），bbY 同帧，
  //   即 maxOffset = max(-originY - bbY) = 「子树顶边到主题盒顶边的最大距离」。
  // 之前漏了 topicView.bounds.y 项，多算 22px（本 fixture 子节点高 44）。
  const maxOffset = Math.max(...provs.map((p) => -p.originY - p.bbY))
  const outward = calcOrgOutward(provs, lineClass)
  const childrenY = y + size.height + spacingMajor + maxOffset + outward

  // X 堆叠
  let cur = minChildX
  const posXs = provs.map((p) => {
    const v = cur - p.bbX
    cur += p.bbW + childGap
    return v
  })
  // posXoffsetToClosestChild 重对齐（endAnchor 在 top-middle → rel x = 0）
  let offset = 0
  if (n >= 3) {
    let best = posXs[0]
    for (const v of posXs) if (Math.abs(v) < Math.abs(best)) best = v
    if (Math.abs(best) < Math.min(30, childrenW * 0.15)) offset = best
  }

  const parentCenterX = x + size.width / 2
  let bbTop = 0
  let bbBottom = size.height
  let bbLeft = 0
  let bbRight = size.width
  for (let i = 0; i < n; i++) {
    const pv = provs[i]
    const centerX = parentCenterX + posXs[i] - offset
    const dx = centerX - (pv.own.x + pv.own.width / 2)
    const dy = childrenY - pv.own.y
    for (const [id, nl] of pv.nodes) {
      nodes.set(id, { ...nl, x: nl.x + dx, y: nl.y + dy })
    }
    const relTop = childrenY - y + pv.bbY
    bbTop = Math.min(bbTop, relTop)
    bbBottom = Math.max(bbBottom, relTop + pv.bbH)
    const relLeft = centerX - pv.own.width / 2 - x + pv.bbX
    bbLeft = Math.min(bbLeft, relLeft)
    bbRight = Math.max(bbRight, relLeft + pv.bbW)
  }
  const ownLayout = nodes.get(node.id)
  if (ownLayout) {
    ownLayout.branchHeight = bbBottom - bbTop
  }
}

/**
 * org-chart-up 子树布局 — 对齐 SB orgChartDownAndUp.calAttachedChildrenPos(isDown=false)
 *
 * X 堆叠与 down 侧共用同一份 SB 代码（provisional 布局 → boundaryBounds 宽 → minChildX/levelWidth
 * → posXoffsetToClosestChild 重对齐），Y 侧按 SB 的上侧公式：
 *   childrenY = -h/2 - spacingMajor                        （相对父主题盒中心）
 *   maxOffset = max(child.bb.y + child.bb.height - child.topicView.bounds.y - child.topicView.bounds.height)
 *             = max(bbY + bbH - h/2)                       「子树底边超出主题盒底边」的最大距离
 *   posY      = childrenY + child.bounds.y - maxOffset - outwardOffset
 *             → 子主题盒**底边** = childrenY - maxOffset - outward（down 侧对齐的是顶边）
 * 返回本分支的 boundaryBounds（相对主题盒中心）供父级使用，SB 上侧口径与「子节点真实并集」不同：
 *   bbY = min(-h/2, childrenY - max(child.bb.height))
 *   bbH = h + spacingMajor + outward + max(currentAllHeight)
 *   currentAllHeight = 子分支水平生长(getStartDirection=LEFT/RIGHT)
 *                        ? maxOffset + child.h/2 + |child.bb.y|   （down 侧是 bb.height + bb.y）
 *                        : maxOffset + child.bb.height
 *   bbW = max(childrenSize.width, w)；bbX = min(minChildX, -w/2)，触发重对齐时再减 offset
 *
 * 实测对照（test-org-chart-up.xmind 的 root「传感器技术」，sb-internals 探针值）：
 *   spacingMajor 100（majorSpacing 50 × curve 2）/ maxOffset 418 / outward 54
 *   max(child.bb.height) 898 / max(currentAllHeight) 984
 *   → 子主题盒顶边 y=-651，自身 bb = {-3562, -1033, 7651, 1208}，与 SB branchBounds 逐项一致。
 */
function layoutSubtreeUp(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, NodeLayout>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  depth = 0,
): OrgBB {
  const size = sizeMap.get(node.id)!
  const halfW = size.width / 2
  // 主题盒原点 = shape 中心：SB 的 newBounds.y / boundaryBounds.y 都是 -originY
  const originY = size.originY
  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth: size.titleWidth, titleHeight: size.titleHeight, branchHeight: size.height, partBounds: size.partBounds })

  const children = isCollapsed(node) ? [] : getAttachedChildren(node)
  // 无子节点时 SB 不进 calAttachedChildrenPos 主体，newBounds 就是 topicView.bounds
  if (children.length === 0) return { bbX: -halfW, bbW: size.width, bbY: -originY, bbH: size.height }

  const style = styleEngine && state ? styleEngine.computeStyle(state, node.id) : null
  const spacingMinor = parseStyleValue(style?.spacingMinor, 0)
  const lineWidth = parseStyleValue(style?.borderWidth, 0)
  const childGap = spacingMinor + lineWidth
  const spacingMajor = getOrgSpacingMajor(node, options, styleEngine, state)
  const lineClass = styleEngine && state ? String(styleEngine.getStyleValue(state, node.id, 'lineClass') ?? '') : ''

  // 子树 provisional 布局（skeleton 委派 logic，否则递归 org-up）
  const logicSide = getOrgChildLogicSide(state, depth)
  const provs: OrgProv[] = []
  for (const child of children) {
    const provNodes = new Map<string, NodeLayout>()
    let bb: OrgBB
    /** SB getStartDirection(child)：LEFT/RIGHT → 水平生长，currentAllHeight 走 restSize 口径 */
    let horizontal: boolean
    if (logicSide) {
      const res = layoutLogicSubtree(child, 0, 0, options, styleEngine, state, logicSide)
      for (const [id, nl] of res.nodes) provNodes.set(id, nl)
      bb = { bbX: res.bbX, bbW: res.bbW, bbY: res.bb.y, bbH: res.bb.height }
      horizontal = true
    } else {
      bb = layoutSubtreeUp(child, 0, 0, options, sizeMap, provNodes, styleEngine, state, depth + 1)
      horizontal = false // org-chart.up → getStartDirection = UP
    }
    provs.push({ nodes: provNodes, own: provNodes.get(child.id)!, originY: sizeMap.get(child.id)!.originY, horizontal, ...bb })
  }

  // childrenSize.width = Σ child.bb.width + gaps
  const n = children.length
  const childrenW = provs.reduce((s2, p) => s2 + p.bbW, 0) + (n - 1) * childGap
  let minChildX = -childrenW / 2
  if (n > 1) {
    const levelWidth = childrenW + provs[0].bbX - provs[n - 1].bbW - provs[n - 1].bbX
    minChildX = -levelWidth / 2 + provs[0].bbX
  }

  // SB: maxOffset = max(bb.y + bb.height - topicView.bounds.y - topicView.bounds.height)
  //               = max(bbY + bbH + originY - height)
  const maxOffset = Math.max(...provs.map((p) => p.bbY + p.bbH + p.originY - p.own.height))
  const outward = calcOrgOutward(provs, lineClass)
  const childrenY = -originY - spacingMajor

  // X 堆叠 + posXoffsetToClosestChild 重对齐（与 down 侧同一份 SB 代码）
  let cur = minChildX
  const posXs = provs.map((p) => {
    const v = cur - p.bbX
    cur += p.bbW + childGap
    return v
  })
  let offset = 0
  if (n >= 3) {
    let best = posXs[0]
    for (const v of posXs) if (Math.abs(v) < Math.abs(best)) best = v
    if (Math.abs(best) < Math.min(30, childrenW * 0.15)) offset = best
  }

  const parentCenterX = x + halfW
  // 子主题盒顶边（绝对）= y + childrenY + originY - maxOffset - outward - childH
  //（childrenY 在「父原点」帧，换算回「父盒顶」帧要 + originY）
  const childTopBase = y + childrenY + originY - maxOffset - outward
  for (let i = 0; i < n; i++) {
    const pv = provs[i]
    const centerX = parentCenterX + posXs[i] - offset
    const dx = centerX - (pv.own.x + pv.own.width / 2)
    const dy = childTopBase - pv.own.height - pv.own.y
    for (const [id, nl] of pv.nodes) {
      nodes.set(id, { ...nl, x: nl.x + dx, y: nl.y + dy })
    }
  }

  // 本分支的 boundaryBounds（SB 上侧口径，非子节点真实并集）
  const childrenSizeHeight = Math.max(...provs.map((p) => p.bbH))
  // SB: halfOfTopicHeight = topicBounds.height / 2（**盒高**的一半，不是 originY）
  const currentAllHeight = Math.max(
    ...provs.map((p) => maxOffset + (p.horizontal ? p.own.height / 2 + Math.abs(p.bbY) : p.bbH)),
  )
  const bbH = size.height + spacingMajor + outward + currentAllHeight
  const ownLayout = nodes.get(node.id)
  if (ownLayout) {
    ownLayout.branchHeight = bbH
  }
  return {
    bbX: Math.min(minChildX, -halfW) - offset,
    bbW: Math.max(childrenW, size.width),
    bbY: Math.min(-originY, childrenY - childrenSizeHeight),
    bbH,
  }
}

export const orgChartDownLayoutAlgorithm: LayoutAlgorithm = {
  name: 'org-chart-down',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, NodeLayout>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap, styleEngine, state)

    const rootSize = sizeMap.get(root.id)!
    const rootX = -rootSize.width / 2

    layoutSubtreeDown(root, rootX, 50, options, sizeMap, nodes, styleEngine, state)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}

export const orgChartUpLayoutAlgorithm: LayoutAlgorithm = {
  name: 'org-chart-up',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, NodeLayout>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap, styleEngine, state)

    const rootSize = sizeMap.get(root.id)!
    const rootX = -rootSize.width / 2

    // 先以 root 主题盒左上角 y=0 布局，再整体平移使最上端落在 50
    // （与 down 侧「root 固定在 y=50、子树往下」同一口径：生长方向起点留 50）
    layoutSubtreeUp(root, rootX, 0, options, sizeMap, nodes, styleEngine, state)

    let minY = Infinity
    for (const l of nodes.values()) minY = Math.min(minY, l.y)
    const shift = 50 - (Number.isFinite(minY) ? minY : 0)

    let maxX = 0, maxY = 0
    for (const [id, l] of nodes) {
      const moved = { ...l, y: l.y + shift }
      nodes.set(id, moved)
      maxX = Math.max(maxX, moved.x + moved.width)
      maxY = Math.max(maxY, moved.y + moved.height)
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
