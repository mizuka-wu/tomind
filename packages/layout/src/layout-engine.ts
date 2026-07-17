/**
 * LayoutEngine — 布局引擎
 *
 * 输入：SheetState + StyleEngine
 * 输出：LayoutResult（每个节点的坐标和尺寸）
 *
 * 设计原则：
 * 1. 从 StyleEngine 读取布局参数（spacingMajor/spacingMinor/margin-*）
 * 2. 支持按节点类型的布局参数（通过 compactLayoutModeLevel）
 * 3. 分层：先算尺寸，再算位置
 * 4. 支持注册新的布局算法（类似 Extension 注册表模式）
 */

import type { NodeDesc } from '@tomind/schema'
import type { SheetState } from '@tomind/state'
import { getTitleText } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { ResolvedStyle } from '@tomind/style'

// ==================== 类型定义 ====================

/** LayoutEngine 接口（供 editor 层引用） */
export interface LayoutEngine {
  /** 注入 StyleEngine */
  setStyleEngine(engine: StyleEngine): void
  /** 计算布局 */
  compute(state: SheetState): LayoutResult
  /** 获取上次计算结果 */
  getLayoutResult(): LayoutResult
  /** 注册布局算法 */
  registerAlgorithm(algorithm: LayoutAlgorithm): void
}

/** 单个节点的布局结果 */
export interface NodeLayout {
  x: number
  y: number
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  branchHeight: number
  parentId?: string  // 父节点 ID，用于计算相对坐标
}

/** 完整的布局结果 */
export interface LayoutResult {
  nodes: Map<string, NodeLayout>
  totalWidth: number
  totalHeight: number
}

/** 布局配置（兜底默认值） */
export interface LayoutOptions {
  /** 水平间距（父子节点间）— 当样式未指定时使用 */
  horizontalGap: number
  /** 垂直间距（兄弟节点间）— 当样式未指定时使用 */
  verticalGap: number
  /** 节点内边距 — 当样式未指定时使用 */
  nodePadding: { top: number; right: number; bottom: number; left: number }
  /** 根节点 X 偏移 */
  rootOffsetX: number
  /** 行高 */
  lineHeight: number
  /** 字符宽度因子 */
  charWidthFactor: number
}

/** 默认布局配置 */
export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  horizontalGap: 40,
  verticalGap: 10,
  nodePadding: { top: 8, right: 16, bottom: 8, left: 16 },
  rootOffsetX: 50,
  lineHeight: 20,
  charWidthFactor: 0.6,
}

/** 布局算法接口 */
export interface LayoutAlgorithm {
  /** 布局算法名称 */
  name: string
  /** 执行布局计算 */
  layout(
    node: NodeDesc,
    options: LayoutOptions,
    styleEngine: StyleEngine | null,
    state: SheetState | null,
  ): LayoutResult
}

const ATTACHED = 'attached'

// ==================== 布局注册表 ====================

const layoutRegistry = new Map<string, LayoutAlgorithm>()

/** 注册布局算法 */
export function registerLayout(algorithm: LayoutAlgorithm): void {
  layoutRegistry.set(algorithm.name, algorithm)
}

/** 注销布局算法 */
export function unregisterLayout(name: string): void {
  layoutRegistry.delete(name)
}

/** 获取布局算法 */
export function getLayout(name: string): LayoutAlgorithm | undefined {
  return layoutRegistry.get(name)
}

// ==================== 工具函数 ====================

function getTitle(node: NodeDesc): string {
  return getTitleText(node.attrs)
}

function getFontSize(node: NodeDesc): number {
  const style = node.attrs.style as Record<string, unknown> | undefined
  return (style?.fontSize as number) ?? 14
}

function isCollapsed(node: NodeDesc): boolean {
  return (node.attrs.collapsed as boolean) ?? false
}

function getAttachedChildren(node: NodeDesc): readonly NodeDesc[] {
  return node.children[ATTACHED] ?? []
}

function findRootTopic(doc: NodeDesc): NodeDesc | null {
  if (doc.type === 'TOPIC') return doc
  const attached = getAttachedChildren(doc)
  if (attached.length > 0) return attached[0]
  for (const children of Object.values(doc.children)) {
    for (const child of children) {
      const found = findRootTopic(child)
      if (found) return found
    }
  }
  return null
}

/** 从样式中提取数值，解析 "16pt" → 16 */
function parseStyleValue(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return isNaN(num) ? fallback : num
  }
  return fallback
}

/** 从节点样式获取间距参数 */
function getNodeSpacing(
  style: ResolvedStyle | undefined,
  options: LayoutOptions,
): { horizontalGap: number; verticalGap: number; padding: { top: number; right: number; bottom: number; left: number } } {
  if (!style) {
    return {
      horizontalGap: options.horizontalGap,
      verticalGap: options.verticalGap,
      padding: options.nodePadding,
    }
  }
  return {
    horizontalGap: parseStyleValue(style.spacingMajor, options.horizontalGap),
    verticalGap: parseStyleValue(style.spacingMinor, options.verticalGap),
    padding: {
      top: parseStyleValue(style.marginTop, options.nodePadding.top),
      right: parseStyleValue(style.marginRight, options.nodePadding.right),
      bottom: parseStyleValue(style.marginBottom, options.nodePadding.bottom),
      left: parseStyleValue(style.marginLeft, options.nodePadding.left),
    },
  }
}

// ==================== 尺寸计算 ====================

export function measureTextSize(
  text: string,
  fontSize: number,
  options: LayoutOptions,
): { width: number; height: number } {
  if (!text) return { width: 0, height: 0 }
  const charWidth = fontSize * options.charWidthFactor
  const maxWidth = 200
  const textWidth = Math.min(text.length * charWidth, maxWidth)
  const lines = Math.ceil((text.length * charWidth) / maxWidth)
  const textHeight = lines * options.lineHeight
  return { width: Math.ceil(textWidth), height: Math.ceil(textHeight) }
}

export function measureNodeSize(
  node: NodeDesc,
  padding: { top: number; right: number; bottom: number; left: number },
  options: LayoutOptions,
): { width: number; height: number; titleWidth: number; titleHeight: number } {
  const fontSize = getFontSize(node)
  const title = getTitle(node)
  const { width: titleWidth, height: titleHeight } = measureTextSize(title, fontSize, options)
  const width = titleWidth + padding.left + padding.right
  const height = titleHeight + padding.top + padding.bottom
  return { width, height, titleWidth, titleHeight }
}

// ==================== 树布局算法 ====================

interface LayoutContext {
  options: LayoutOptions
  styleEngine: StyleEngine | null
  state: SheetState | null
  /** 缓存每个节点的样式，避免重复计算 */
  styleCache: Map<string, ResolvedStyle>
  /** 缓存每个节点的间距参数 */
  spacingCache: Map<string, { horizontalGap: number; verticalGap: number; padding: { top: number; right: number; bottom: number; left: number } }>
}

function getNodeStyle(ctx: LayoutContext, nodeId: string): ResolvedStyle | undefined {
  if (ctx.styleCache.has(nodeId)) {
    return ctx.styleCache.get(nodeId)
  }
  if (!ctx.styleEngine || !ctx.state) {
    return undefined
  }
  const style = ctx.styleEngine.computeStyle(ctx.state, nodeId)
  ctx.styleCache.set(nodeId, style)
  return style
}

function getNodeSpacingCached(ctx: LayoutContext, nodeId: string): { horizontalGap: number; verticalGap: number; padding: { top: number; right: number; bottom: number; left: number } } {
  if (ctx.spacingCache.has(nodeId)) {
    return ctx.spacingCache.get(nodeId)!
  }
  const style = getNodeStyle(ctx, nodeId)
  const spacing = getNodeSpacing(style, ctx.options)
  ctx.spacingCache.set(nodeId, spacing)
  return spacing
}

// ==================== 默认树布局算法 ====================

const treeLayoutAlgorithm: LayoutAlgorithm = {
  name: 'tree',

  layout(
    doc: NodeDesc,
    options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS,
    styleEngine: StyleEngine | null = null,
    state: SheetState | null = null,
  ): LayoutResult {
    const nodes = new Map<string, NodeLayout>()
    const ctx: LayoutContext = {
      options,
      styleEngine,
      state,
      styleCache: new Map(),
      spacingCache: new Map(),
    }

    const root = findRootTopic(doc)
    if (!root) {
      return { nodes, totalWidth: 0, totalHeight: 0 }
    }

    // 第一遍：计算每个节点的尺寸
    const sizeMap = new Map<string, { width: number; height: number; titleWidth: number; titleHeight: number }>()
    measureSubtree(ctx, root, sizeMap)

    // 第二遍：计算每个节点的位置
    const rootX = options.rootOffsetX
    const rootY = 0
    layoutSubtree(ctx, root, rootX, rootY, sizeMap, nodes)

    // 计算总尺寸
    let totalWidth = 0
    let totalHeight = 0
    for (const layout of nodes.values()) {
      totalWidth = Math.max(totalWidth, layout.x + layout.width)
      totalHeight = Math.max(totalHeight, layout.y + layout.height)
    }

    return { nodes, totalWidth, totalHeight }
  },
}

function measureSubtree(
  ctx: LayoutContext,
  node: NodeDesc,
  sizeMap: Map<string, { width: number; height: number; titleWidth: number; titleHeight: number }>,
): void {
  const spacing = getNodeSpacingCached(ctx, node.id)
  const size = measureNodeSize(node, spacing.padding, ctx.options)
  sizeMap.set(node.id, size)

  if (!isCollapsed(node)) {
    const children = getAttachedChildren(node)
    for (const child of children) {
      measureSubtree(ctx, child, sizeMap)
    }
  }
}

function layoutSubtree(
  ctx: LayoutContext,
  node: NodeDesc,
  x: number,
  y: number,
  sizeMap: Map<string, { width: number; height: number; titleWidth: number; titleHeight: number }>,
  nodes: Map<string, NodeLayout>,
): void {
  const size = sizeMap.get(node.id)!
  const spacing = getNodeSpacingCached(ctx, node.id)
  const children = getAttachedChildren(node)

  // 计算子树高度
  let branchHeight = size.height
  if (!isCollapsed(node) && children.length > 0) {
    let childrenHeight = 0
    for (const child of children) {
      const childSize = sizeMap.get(child.id)!
      childrenHeight += childSize.height
    }
    childrenHeight += (children.length - 1) * spacing.verticalGap
    branchHeight = Math.max(size.height, childrenHeight)
  }

  // 设置当前节点布局
  nodes.set(node.id, {
    x,
    y,
    width: size.width,
    height: size.height,
    titleWidth: size.titleWidth,
    titleHeight: size.titleHeight,
    branchHeight,
  })

  // 布局子节点
  if (!isCollapsed(node) && children.length > 0) {
    let childY = y + (branchHeight - (children.reduce((sum, child) => {
      const childSize = sizeMap.get(child.id)!
      return sum + childSize.height
    }, 0) + (children.length - 1) * spacing.verticalGap)) / 2

    for (const child of children) {
      const childSize = sizeMap.get(child.id)!
      const childX = x + size.width + spacing.horizontalGap
      layoutSubtree(ctx, child, childX, childY, sizeMap, nodes)
      childY += childSize.height + spacing.verticalGap
    }
  }
}

// 注册默认的树布局算法
registerLayout(treeLayoutAlgorithm)

// ==================== 公共 API ====================

/**
 * 执行布局计算
 *
 * @param doc 文档根节点
 * @param options 布局配置
 * @param styleEngine 样式引擎
 * @param state 状态
 * @param layoutName 布局算法名称（默认 'tree'）
 */
export function layout(
  doc: NodeDesc,
  options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS,
  styleEngine?: StyleEngine,
  state?: SheetState,
  layoutName: string = 'tree',
): LayoutResult {
  const algorithm = layoutRegistry.get(layoutName)
  if (!algorithm) {
    console.warn(`Layout algorithm "${layoutName}" not found, using "tree"`)
    return treeLayoutAlgorithm.layout(doc, options, styleEngine ?? null, state ?? null)
  }
  return algorithm.layout(doc, options, styleEngine ?? null, state ?? null)
}

// 保持向后兼容
export const layoutTree = layout
