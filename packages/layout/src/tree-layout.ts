// TODO: 与 XMind 原生 tree 布局逐一对齐间距/偏移
// TODO: 折叠节点时 branchHeight 计算验证
// TODO: summary/boundary 联动布局
/**
 * Tree Layout — 方向参数化的树布局算法
 *
 * 支持方向: right / left / down / up
 * 提供给 @tomind/extensions 的各个 TreeLayoutExtension 使用
 */
import type { NodeDesc } from '@tomind/schema'
import type { SheetState } from '@tomind/state'
import { findById } from '@tomind/style'
import type { StyleEngine, ResolvedStyle } from '@tomind/style'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import { hasNonTitleParts } from './part-measure'
import { measurePartAwareNode, measureTitleOnlyNode } from './part-node-size'
import { isCollapsed, getAttachedChildren, findRootTopic, getAttr } from './layout-utils'
import { layoutSummaries, getSummaryChildren } from './summary-layout'

export type TreeDirection = 'right' | 'left' | 'down' | 'up'

import { computeOutsidePadding, computeMasterOutsidePadding } from './boundary-padding'
import type { OutsidePadding } from './boundary-padding'
import { computeChildrenTotalHeight } from './spacing-utils'
import { SC } from './child-structure'
import type { DelegableStructure } from './child-structure'
import { resolveStructures, structurePresetOf } from './structure-resolve'
import type { StructureResolution } from './structure-resolve'
import { layoutDelegatedSubtree } from './subtree-delegate'
import type { DelegatedSubtreeLayout } from './subtree-delegate'

/** Snowbrush: PADDING * 2 = 40, 用于父子垂直间距 */
const PARENT_GAP = 40
/** snowbrush layoutConstant.BOUNDARYGAP */
const TREE_BOUNDARY_GAP = 10
/** snowbrush treeleftandright: centerPadding / endPointLineOffset / PADDING */
const TREE_CENTER_PADDING = 30
const TREE_END_POINT_LINE_OFFSET = 15
const TREE_PADDING = 20
const TREE_SPECIAL_LINE_CLASSES = ['straight', 'curve', 'fold', 'roundedfold']

function getTreeLineEndPatchGap(ctx: TreeLayoutContext, node: NodeDesc): number {
  if (!ctx.styleEngine || !ctx.state) return 0
  const arrow = ctx.styleEngine.getStyleValue(ctx.state, node.id, 'arrowEndClass')
  const hasArrow = typeof arrow === 'string' && arrow !== '' && !arrow.includes('none')
  if (!hasArrow) return 0
  const lwRaw = ctx.styleEngine.getStyleValue(ctx.state, node.id, 'lineWidth')
  const lw = typeof lwRaw === 'number' ? lwRaw : parseFloat(String(lwRaw ?? '')) || 0
  return lw * 4 + 16
}

function getParentBorderWidth(ctx: TreeLayoutContext, node: NodeDesc): number {
  if (!ctx.styleEngine || !ctx.state) return 0
  const v = ctx.styleEngine.getStyleValue(ctx.state, node.id, 'borderWidth')
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
  return Number.isFinite(n) ? n : 0
}

function parseStyleValue(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return isNaN(num) ? fallback : num
  }
  return fallback
}

function getNodeSpacing(
  style: ResolvedStyle | undefined,
  options: LayoutOptions,
  direction: TreeDirection,
  rawMargin?: unknown,
) {
  if (!style) {
    return {
      horizontalGap: options.horizontalGap,
      verticalGap: options.verticalGap,
      padding: options.nodePadding,
    }
  }

  const majorGap = parseStyleValue(style.spacingMajor, options.horizontalGap)
  const minorGap = parseStyleValue(style.spacingMinor, options.verticalGap)

  // 根据方向映射：spacingMajor=父子间距, spacingMinor=兄弟间距
  // 水平方向(right/left)：父子沿 X 轴 → horizontalGap；兄弟沿 Y 轴 → verticalGap
  // 垂直方向(down/up)：父子沿 Y 轴 → verticalGap；兄弟沿 X 轴 → horizontalGap
  const isHorizontal = direction === 'right' || direction === 'left'

  // 对齐 snowbrush getTopicMargins: 先读统一 margin，有值则四方向使用，否则 fallback 到分侧值
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
    horizontalGap: isHorizontal ? majorGap : minorGap,
    verticalGap: isHorizontal ? minorGap : majorGap,
    padding: { top, right, bottom, left },
  }
}

// ─── 上下文 ───

interface TreeLayoutContext {
  options: LayoutOptions
  styleEngine: StyleEngine | null
  state: SheetState | null
  styleCache: Map<string, ResolvedStyle>
  spacingCache: Map<string, ReturnType<typeof getNodeSpacing>>
  /**
   * 逐节点的生效结构 + 委派表（SB getViewStructure）。down/up 方向 SB 没有对应结构，
   * 保持 null（= 不委派，与旧行为一致）。
   */
  structs: StructureResolution | null
}

function getNodeStyle(ctx: TreeLayoutContext, nodeId: string): ResolvedStyle | undefined {
  if (ctx.styleCache.has(nodeId)) return ctx.styleCache.get(nodeId)
  if (!ctx.styleEngine || !ctx.state) return undefined
  const style = ctx.styleEngine.computeStyle(ctx.state, nodeId)
  ctx.styleCache.set(nodeId, style)
  return style
}

function getNodeSpacingCached(ctx: TreeLayoutContext, nodeId: string, direction: TreeDirection) {
  if (ctx.spacingCache.has(nodeId)) return ctx.spacingCache.get(nodeId)!
  const style = getNodeStyle(ctx, nodeId)
  // 读取节点原始 attrs.style.margin，传递给 getNodeSpacing 做 unified margin fallback
  const node = ctx.state ? findById(ctx.state.doc, nodeId) : undefined
  const rawStyle = node ? getAttr<Record<string, unknown>>(node, 'style') : undefined
  const rawMargin = rawStyle?.margin
  const spacing = getNodeSpacing(style, ctx.options, direction, rawMargin)
  ctx.spacingCache.set(nodeId, spacing)
  return spacing
}

// ─── 测量 ───

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
  outsidePadding: OutsidePadding
}

function measureNodeSize(
  node: NodeDesc,
  padding: { top: number; right: number; bottom: number; left: number },
  options: LayoutOptions,
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): NodeSize {
  // 检查是否有非 title 的 part
  if (hasNonTitleParts(node)) {
    // 使用 part-aware 测量
    const result = measurePartAwareNode(node, options, styleEngine, state, padding)
    return {
      width: result.width,
      height: result.height,
      originY: result.shapeHeight / 2,
      titleWidth: result.titleWidth,
      titleHeight: result.titleHeight,
      partBounds: result.partBounds,
      outsidePadding: { top: 0, bottom: 0, left: 0, right: 0 },
    }
  }

  // 快速路径：只测量 title + padding
  const result = measureTitleOnlyNode(node, padding, options, styleEngine, state)
  return {
    width: result.width,
    height: result.height,
    originY: result.shapeHeight / 2,
    titleWidth: result.titleWidth,
    titleHeight: result.titleHeight,
    partBounds: result.partBounds,
    outsidePadding: { top: 0, bottom: 0, left: 0, right: 0 },
  }
}

function measureSubtree(
  ctx: TreeLayoutContext,
  node: NodeDesc,
  sizeMap: Map<string, NodeSize>,
  direction: TreeDirection,
): void {
  const spacing = getNodeSpacingCached(ctx, node.id, direction)
  sizeMap.set(node.id, measureNodeSize(node, spacing.padding, ctx.options, ctx.styleEngine, ctx.state))
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureSubtree(ctx, child, sizeMap, direction)
    }
    // Also measure summary nodes so they're in sizeMap
    for (const summary of getSummaryChildren(node)) {
      const summarySpacing = getNodeSpacingCached(ctx, summary.id, direction)
      sizeMap.set(summary.id, measureNodeSize(summary, summarySpacing.padding, ctx.options, ctx.styleEngine, ctx.state))
    }
  }
}

// ─── 布局 ───

function isHorizontal(dir: TreeDirection): boolean {
  return dir === 'right' || dir === 'left'
}

export interface NodeLayoutOutput {
  x: number
  y: number
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  branchHeight: number
  partBounds?: Map<string, { x: number; y: number; width: number; height: number }>
}

/** 子树在主轴方向的总跨度（递归计算） */
function subtreeAxisSize(
  ctx: TreeLayoutContext,
  node: NodeDesc,
  sizeMap: Map<string, NodeSize>,
  dir: TreeDirection,
  parent?: NodeDesc,
  childIndex?: number,
): number {
  const h = isHorizontal(dir)
  const size = sizeMap.get(node.id)!
  const spacing = getNodeSpacingCached(ctx, node.id, dir)

  // Base size of the node itself + outsidePadding from its parent boundary
  // Snowbrush: boundaryBounds.height includes PADDING*2 for every node
  let selfSize: number
  if (parent !== undefined && childIndex !== undefined) {
    const outsidePad = computeOutsidePadding(parent, childIndex, dir)
    selfSize = h
      ? size.height + outsidePad.top + outsidePad.bottom
      : size.width + outsidePad.left + outsidePad.right
  } else {
    selfSize = h ? size.height : size.width
  }

  if (isCollapsed(node)) {
    return selfSize
  }

  const children = getAttachedChildren(node)
  // Filter out summary nodes — they are positioned separately
  const regularChildren: NodeDesc[] = []
  for (const child of children) {
    if (child.type !== 'summary') {
      regularChildren.push(child)
    }
  }
  if (regularChildren.length === 0) {
    return selfSize
  }

  // 计算所有子节点的子树总跨度
  const childrenTotal = computeChildrenTotalHeight(
    regularChildren,
    (child) => subtreeAxisSize(ctx, child, sizeMap, dir, node, regularChildren.indexOf(child)),
    () => h ? spacing.verticalGap : spacing.horizontalGap,
  )

  const result = Math.max(selfSize, childrenTotal)
  return result
}

/** Position summary nodes for a parent after its attached children are laid out */
function positionSummaries(
  parent: NodeDesc,
  regularChildren: readonly NodeDesc[],
  nodes: Map<string, NodeLayoutOutput>,
  direction: TreeDirection,
  sizeMap: Map<string, NodeSize>,
): void {
  // Build childPositions from already-laid-out nodes
  const childPositions = new Map<string, { x: number; y: number; width: number; height: number }>()
  for (const child of regularChildren) {
    const nl = nodes.get(child.id)
    if (nl) {
      childPositions.set(child.id, { x: nl.x, y: nl.y, width: nl.width, height: nl.height })
    }
  }

  const summaryPositions = layoutSummaries(
    parent,
    regularChildren,
    childPositions,
    direction,
    sizeMap,
  )

  // Add summary nodes to the layout result
  for (const [summaryId, pos] of summaryPositions) {
    const summarySize = sizeMap.get(summaryId)
    if (!summarySize) continue
    nodes.set(summaryId, {
      x: pos.x,
      y: pos.y,
      width: summarySize.width,
      height: summarySize.height,
      titleWidth: summarySize.titleWidth,
      titleHeight: summarySize.titleHeight,
      branchHeight: summarySize.height,
      partBounds: summarySize.partBounds,
    })
  }
}

function layoutSubtree(
  ctx: TreeLayoutContext,
  node: NodeDesc,
  x: number,
  y: number,
  direction: TreeDirection,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, NodeLayoutOutput>,
  depth = 0,
  isCentral = depth === 0,
): void {
  const size = sizeMap.get(node.id)!
  const spacing = getNodeSpacingCached(ctx, node.id, direction)
  const children = getAttachedChildren(node)
  // Separate regular children from summary children
  const regularChildren: NodeDesc[] = []
  for (const child of children) {
    if (child.type !== 'summary') {
      regularChildren.push(child)
    }
  }
  const h = isHorizontal(direction)

  const branchAxisSize = subtreeAxisSize(ctx, node, sizeMap, direction)

  nodes.set(node.id, { 
    x, y, 
    width: size.width, 
    height: size.height, 
    titleWidth: size.titleWidth, 
    titleHeight: size.titleHeight, 
    branchHeight: branchAxisSize,
    partBounds: size.partBounds,
  })

  if (isCollapsed(node) || regularChildren.length === 0) {
    // Even if no regular children, still position summaries
    if (!isCollapsed(node)) {
      positionSummaries(node, regularChildren, nodes, direction, sizeMap)
    }
    return
  }

  if (h) {
    // ── 水平布局（right/left）── 对齐 snowbrush treeleftandright.calAttachedChildrenPos
    // 子树先以临时原点布局（skeleton 委派 logic 或递归 tree），再按 boundary 顶边堆叠平移
    // isCentral 由调用方给：SB 用的是 `branch.isCentralBranch()`（只有中央主题那个 branchView 为真），
    // 被宿主委派进来的 tree 子树根**不是**中央分支（endPointLineOffset=15、无 centerPadding=30）。
    const lineGap = getTreeLineEndPatchGap(ctx, node)
    const childrenXOffset = TREE_BOUNDARY_GAP + (isCentral ? TREE_CENTER_PADDING : TREE_END_POINT_LINE_OFFSET) + lineGap
    const parentBw = getParentBorderWidth(ctx, node)
    const lineClass = ctx.styleEngine && ctx.state
      ? String(ctx.styleEngine.getStyleValue(ctx.state, node.id, 'lineClass') ?? '')
      : ''

    // ── 每个子分支先按**它自己的生效结构**布局好（SB：父结构只拿 child.boundaryBounds 摆位）──
    const provs: { nodes: Map<string, NodeLayoutOutput>; bbX: number; bbW: number; bbY: number; bbH: number; top: number; left: number; w: number; h: number; originY: number }[] = []
    for (const child of regularChildren) {
      const childSize = sizeMap.get(child.id)!
      childSize.outsidePadding = { top: 0, bottom: 0, left: 0, right: 0 }
      const provNodes = new Map<string, NodeLayoutOutput>()
      const del: DelegableStructure | undefined = ctx.structs?.delegate.get(child.id)
      let bbX = 0
      let bbW = 0
      let bbY = 0
      let bbH = 0
      let ownH = childSize.height
      let ownOriginY = childSize.originY
      if (del) {
        // 生效结构不是 tree.<同向> ⇒ 整棵交出去（logic.* / brace.* / tree.<反向>）
        const res: DelegatedSubtreeLayout = layoutDelegatedSubtree(
          child,
          del,
          ctx.options,
          ctx.styleEngine,
          ctx.state,
          ctx.structs?.depth.get(child.id) ?? depth + 1,
        )
        for (const [id, nl] of res.nodes) provNodes.set(id, nl as NodeLayoutOutput)
        bbX = res.bb.x
        bbW = res.bb.width
        bbY = res.bb.y
        bbH = res.bb.height
        ownH = res.own.height
        ownOriginY = res.originY
      } else {
        layoutSubtree(ctx, child, 0, 0, direction, sizeMap, provNodes, depth + 1, false)
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
        const me = provNodes.get(child.id)!
        bbW = maxX - minX
        bbH = maxY - minY
        // bb 相对**主题盒原点**（shape 中心）：X 相对盒中心、Y 相对盒顶 + originY
        bbX = minX - (me.x + me.width / 2)
        bbY = minY - me.y - childSize.originY
      }
      const own = provNodes.get(child.id)!
      provs.push({ nodes: provNodes, bbX, bbW, bbY, bbH, top: own.y, left: own.x, w: own.width, h: ownH, originY: ownOriginY })
    }

    // ── SB maxOffset：子树朝**父节点那一侧**超出自己主题盒的最大距离 ──
    //   isRight : max(child.topicView.bounds.x - child.boundaryBounds.x)          = max(-w/2 - bbX)
    //   !isRight: max(bb.x + bb.width - bounds.x - bounds.width)                  = max(bbX + bbW - w/2)
    // 同向的 tree/logic 子树这一项恒为 0（bb 的靠父侧就是自己的盒），只有被委派成
    // **反向**生长（tree.right 宿主里长出 tree.left 分支）时才 >0，此时 SB 会把
    // 所有子节点整体往外推 maxOffset。旧实现完全没有这一项。
    const maxOffset = provs.reduce(
      (res, pv) => direction === 'right'
        ? Math.max(res, -pv.w / 2 - pv.bbX)
        : Math.max(res, pv.bbX + pv.bbW - pv.w / 2),
      Number.MIN_SAFE_INTEGER,
    )

    let childrenY = y + size.height + TREE_PADDING * 2
    if (TREE_SPECIAL_LINE_CLASSES.some((c) => lineClass.includes(c)) && provs.length > 0) {
      // SB: triangleOffset = tan(30°) * (|childrenX| + |maxOffset|)  ← 旧实现漏了 |maxOffset|
      const triangleOffset = Math.tan((Math.PI * 30) / 180) * (Math.abs(childrenXOffset) + Math.abs(maxOffset))
      const halfOfFirstChildHeight = provs[0].h / 2
      if (triangleOffset > halfOfFirstChildHeight) {
        childrenY += triangleOffset - halfOfFirstChildHeight
      }
    }

    let cum = childrenY
    let bbTop = 0
    let bbBottom = size.height
    for (let i = 0; i < regularChildren.length; i++) {
      const child = regularChildren[i]
      const pv = provs[i]
      // SB posY = childrenY - child.boundaryBounds.y 定位的是子分支**原点**，
      // 盒顶 = 原点 - originY（有 labels 时 ≠ 原点 - h/2）
      const center = cum - pv.bbY
      const desiredTop = center - pv.originY
      const childW = pv.w
      // SB treeleftandright: childBranch.setPosition(posX, …) 的 posX 是相对**父分支原点
      // （= 主题盒中心）**的偏移，posX = childrenX ∓ topicView.bounds.x ∓ maxOffset，
      // 故子主题盒左边缘 = 父中心 + childrenX + maxOffset（右侧）
      //                / 父中心 - childrenX - maxOffset - 子宽（左侧）。
      // 之前按父主题盒右边缘起算，整棵子树多偏移了 父宽/2（root 208 → 偏 104px）。
      const parentCenterX = x + size.width / 2
      const childX = direction === 'right'
        ? parentCenterX + childrenXOffset + maxOffset
        : parentCenterX - childrenXOffset - maxOffset - childW
      const dx = childX - pv.left
      const dy = desiredTop - pv.top
      for (const [id, nl] of pv.nodes) {
        nodes.set(id, { ...nl, x: nl.x + dx, y: nl.y + dy })
      }
      const relTop = desiredTop - y + pv.bbY
      bbTop = Math.min(bbTop, relTop)
      bbBottom = Math.max(bbBottom, relTop + pv.bbH)
      cum += pv.bbH + spacing.verticalGap + parentBw
    }
    const ownLayout = nodes.get(node.id)
    if (ownLayout) ownLayout.branchHeight = bbBottom - bbTop
  } else {
    // ── 垂直布局（down/up）──
    // Apply master boundary padding to parent bounds
    const masterPad = computeMasterOutsidePadding(node, direction)
    let childX = x + size.width + spacing.horizontalGap + masterPad.left
    for (const child of regularChildren) {
      const childIdx = regularChildren.indexOf(child)
      const outsidePad = computeOutsidePadding(node, childIdx, direction)
      const childNodeSize = sizeMap.get(child.id)!
      // Store the computed outsidePadding on the size
      childNodeSize.outsidePadding = outsidePad

      // Use subtree width (full branch extent) for spacing, matching snowbrush boundaryBounds behavior
      const childSubtreeW = subtreeAxisSize(ctx, child, sizeMap, direction, node, childIdx)

      const childY = direction === 'down'
        ? y + size.height + spacing.verticalGap
        : y - childNodeSize.height - spacing.verticalGap
      layoutSubtree(ctx, child, childX, childY, direction, sizeMap, nodes, depth + 1, false)
      childX += childSubtreeW + spacing.horizontalGap + PARENT_GAP
    }
  }

  // Position summary nodes after regular children are laid out
  positionSummaries(node, regularChildren, nodes, direction, sizeMap)
}

/**
 * tree 宿主的生效结构表（SB getViewStructure）。
 *
 * SB 只有 tree.left / tree.right 两种 tree 结构，`down/up` 是 TM 自己的扩展方向
 * （SB 里朝上/朝下的堆叠是 org-chart.up/down），保持 null = 不委派，与旧行为一致。
 *
 * isSelf = 「同族**且同向**」：tree.right 宿主里声明 tree.left 的分支要真的委派出去
 * （SB TREE_RIGHT_EXPOSED_STRUCTURE = RIGHT_EXPOSED_STRUCTURE，**含 tree.left**，
 *   实测 probe-tree.right+tree.left：SB eff = tree.left，TM 旧实现按 tree.right 递归
 *   ⇒ 265.9 / 4.8）；声明 logic.* / brace.* 同样委派。
 */
function buildTreeStructures(
  root: NodeDesc,
  direction: TreeDirection,
  state: SheetState | null,
  rootDepth: number,
): StructureResolution | null {
  if (direction !== 'right' && direction !== 'left') return null
  const nominal = direction === 'right' ? SC.TREE_RIGHT : SC.TREE_LEFT
  const preset = structurePresetOf(root, state)
  const rootEff = (preset === SC.TREE_RIGHT || preset === SC.TREE_LEFT) ? preset : nominal
  return resolveStructures(root, rootEff, state, (d) => d.kind === 'tree' && d.dir === direction, rootDepth)
}

// ─── 通用委派入口 ───

export interface TreeSubtreeBB {
  /** 相对 node 主题盒**原点**（shape 中心）的 X —— SB boundaryBounds.x */
  x: number
  y: number
  width: number
  height: number
}

export interface TreeSubtreeResult {
  /** 绝对坐标节点表（node 主题盒左上角 = (x, y)） */
  nodes: Map<string, NodeLayoutOutput>
  /** SB `branch.boundaryBounds` —— 相对 node 原点（X 相对盒中心、Y 相对 shape 中心） */
  bb: TreeSubtreeBB
  /** node 主题盒原点到盒顶的距离 = shapeHeight/2（有 labels 时 ≠ height/2） */
  originY: number
}

/**
 * 独立布局一棵 tree.left / tree.right 子树 —— **通用委派入口**，与 `layoutLogicSubtree` 对称。
 *
 * SB 里「子分支按别的结构长」不是一个特例：`utils/branch.getViewStructure` 对每个 attached
 * 子分支都跑一遍「preset ∈ 父结构的 getAvailableChildStructure ? preset : 镜像 : 继承父结构」，
 * 而 tree.left/right 在几乎所有 available 表里（org-chart.down 的 = ATTACHED_EXPOSED 去掉
 * org-chart.up；logic.left/right、tree.left/right、brace.*、treetable、map 系全都有）
 * ⇒ 任何宿主都可能要把整棵子树交给 tree 布局。
 *
 * bb 口径（实测 test-org-tree-branch 的「误差」分支，sb-internals 探针）：
 *   SB treeleftandright 收尾是 `newBounds = getUnionBoundingBox(topicView.bounds, getChildrenSize(branch))`，
 *   `getChildrenSize` = 所有 ATTACHED 子分支 `vector(child.boundaryBounds, child.position)` 的并集
 *   ⇒ **就是全部后代主题盒的真实并集**（summary 是另一类，不算）。
 *   探针核对：误差 origin=(-9088.1875,211)，13 个盒并集 = x[-9124.1875,-8915.1875] y[189,809]
 *   ⇒ bb = {-36, -22, 209, 620}，与 SB 的 boundaryBounds 逐项一致。
 *
 * @param x  node 主题盒左上角（绝对）
 * @param y  node 主题盒顶边（绝对）
 * @param baseDepth node 在文档中的深度（skeleton 角色判定用；被委派的子分支至少是 1）
 */
export function layoutTreeSubtree(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  direction: 'right' | 'left',
  baseDepth = 1,
): TreeSubtreeResult {
  const ctx: TreeLayoutContext = {
    options,
    styleEngine,
    state,
    styleCache: new Map(),
    spacingCache: new Map(),
    // 宿主已经解析出这个分支的生效结构 = tree.<direction>，直接当 rootEff
    structs: buildTreeStructures(node, direction, state, baseDepth),
  }
  const sizeMap = new Map<string, NodeSize>()
  measureSubtree(ctx, node, sizeMap, direction)

  const nodes = new Map<string, NodeLayoutOutput>()
  // 被委派进来的子树根不是中央分支（isCentral=false）
  layoutSubtree(ctx, node, x, y, direction, sizeMap, nodes, baseDepth, false)

  // SB getChildrenSize 只并 ATTACHED 子分支，summary 节点另算（不进 boundaryBounds）
  const attachedIds = new Set<string>()
  const collect = (n: NodeDesc): void => {
    if (n.type !== 'summary') attachedIds.add(n.id)
    if (isCollapsed(n)) return
    for (const c of getAttachedChildren(n)) collect(c)
  }
  collect(node)

  const own = nodes.get(node.id)!
  const originX = own.x + own.width / 2
  const originY = sizeMap.get(node.id)!.originY
  const originYPoint = own.y + originY

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const [id, nl] of nodes) {
    if (!attachedIds.has(id)) continue
    minX = Math.min(minX, nl.x)
    maxX = Math.max(maxX, nl.x + nl.width)
    minY = Math.min(minY, nl.y)
    maxY = Math.max(maxY, nl.y + nl.height)
  }
  if (!Number.isFinite(minX)) {
    minX = own.x
    maxX = own.x + own.width
    minY = own.y
    maxY = own.y + own.height
  }

  return {
    nodes,
    bb: { x: minX - originX, y: minY - originYPoint, width: maxX - minX, height: maxY - minY },
    originY,
  }
}

// ─── 公开工厂 ───

export function createTreeLayoutAlgorithm(name: string, direction: TreeDirection): LayoutAlgorithm {
  return {
    name,

    layout(
      doc: NodeDesc,
      options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS,
      styleEngine: StyleEngine | null = null,
      state: SheetState | null = null,
    ): LayoutResult {
      const nodes = new Map<string, NodeLayoutOutput>()
      const root = findRootTopic(doc)
      const ctx: TreeLayoutContext = {
        options,
        styleEngine,
        state,
        styleCache: new Map(),
        spacingCache: new Map(),
        structs: root ? buildTreeStructures(root, direction, state, 0) : null,
      }

      if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

      const sizeMap = new Map<string, NodeSize>()
      measureSubtree(ctx, root, sizeMap, direction)

      const rootSize = sizeMap.get(root.id)!
      let rootX: number
      let rootY: number

      const canvasWidth = options.canvasWidth ?? 10000
      const canvasHeight = options.canvasHeight ?? 10000
      const centerX = canvasWidth / 2
      const centerY = canvasHeight / 2

      if (isHorizontal(direction)) {
        rootX = centerX - rootSize.width / 2
        rootY = centerY - rootSize.height / 2
      } else {
        rootX = centerX - rootSize.width / 2
        rootY = centerY - rootSize.height / 2
      }

      layoutSubtree(ctx, root, rootX, rootY, direction, sizeMap, nodes)

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (const l of nodes.values()) {
        minX = Math.min(minX, l.x)
        minY = Math.min(minY, l.y)
        maxX = Math.max(maxX, l.x + l.width)
        maxY = Math.max(maxY, l.y + l.height)
      }

      if (minX < 0 || minY < 0) {
        const offsetX = minX < 0 ? -minX : 0
        const offsetY = minY < 0 ? -minY : 0
        for (const l of nodes.values()) {
          l.x += offsetX
          l.y += offsetY
        }
        maxX += offsetX
        maxY += offsetY
      }

      return { nodes, totalWidth: maxX, totalHeight: maxY }
    },
  }
}
