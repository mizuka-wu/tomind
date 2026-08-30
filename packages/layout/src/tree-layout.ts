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

/** Snowbrush: PADDING * 2 = 40, 用于父子垂直间距 */
const PARENT_GAP = 40

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
    const result = measurePartAwareNode(node, options, styleEngine, state)
    return {
      width: result.width,
      height: result.height,
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

interface NodeLayoutOutput {
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
    { parentGap: PARENT_GAP },
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
    // ── 水平布局（right/left）──
    // 子节点从 parent 下方开始，顺序堆叠
    // Snowbrush: childrenY = newBounds.y + newBounds.height + PADDING * 2
    //            posY = childrenY - childBranch.boundaryBounds.y  (boundaryBounds.y = -outsidePadding.top)
    // Apply master boundary padding to parent bounds
    const masterPad = computeMasterOutsidePadding(node, direction)
    let childY = y + size.height + PARENT_GAP + masterPad.top
    for (const child of regularChildren) {
      const childIdx = regularChildren.indexOf(child)
      const outsidePad = computeOutsidePadding(node, childIdx, direction)
      const childNodeSize = sizeMap.get(child.id)!
      // Store the computed outsidePadding on the size
      childNodeSize.outsidePadding = outsidePad

      const childX = direction === 'right'
        ? x + size.width + spacing.horizontalGap
        : x - childNodeSize.width - spacing.horizontalGap

      // Use subtree height (full branch extent) for spacing, matching snowbrush boundaryBounds behavior
      const childSubtreeH = subtreeAxisSize(ctx, child, sizeMap, direction, node, childIdx)

      layoutSubtree(ctx, child, childX, childY, direction, sizeMap, nodes)
      childY += childSubtreeH + spacing.verticalGap
    }
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
      layoutSubtree(ctx, child, childX, childY, direction, sizeMap, nodes)
      childX += childSubtreeW + spacing.horizontalGap
    }
  }

  // Position summary nodes after regular children are laid out
  positionSummaries(node, regularChildren, nodes, direction, sizeMap)
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
      const ctx: TreeLayoutContext = {
        options,
        styleEngine,
        state,
        styleCache: new Map(),
        spacingCache: new Map(),
      }

      const root = findRootTopic(doc)
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
