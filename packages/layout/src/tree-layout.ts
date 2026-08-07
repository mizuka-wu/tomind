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
import type { StyleEngine, ResolvedStyle } from '@tomind/style'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'

const ATTACHED = 'attached'

export type TreeDirection = 'right' | 'left' | 'down' | 'up'

// ─── 工具函数 ───

function getTitle(node: NodeDesc): string {
  const title = node.attrs.title
  if (typeof title === 'string') return title
  if (Array.isArray(title)) {
    return title.map((u: { text?: string }) => u.text ?? '').join('')
  }
  return ''
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
  if (doc.type === 'topic' || doc.type === 'root') return doc
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
  return {
    horizontalGap: isHorizontal ? majorGap : minorGap,
    verticalGap: isHorizontal ? minorGap : majorGap,
    padding: {
      top: parseStyleValue(style.marginTop, options.nodePadding.top),
      right: parseStyleValue(style.marginRight, options.nodePadding.right),
      bottom: parseStyleValue(style.marginBottom, options.nodePadding.bottom),
      left: parseStyleValue(style.marginLeft, options.nodePadding.left),
    },
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
  const spacing = getNodeSpacing(style, ctx.options, direction)
  ctx.spacingCache.set(nodeId, spacing)
  return spacing
}

// ─── 测量 ───

interface NodeSize {
  width: number
  height: number
  titleWidth: number
  titleHeight: number
}

function measureNodeSize(
  node: NodeDesc,
  padding: { top: number; right: number; bottom: number; left: number },
  options: LayoutOptions,
): NodeSize {
  const fontSize = getFontSize(node)
  const title = getTitle(node)
  const { width: titleWidth, height: titleHeight } = measureTextSize(title, fontSize, options)
  return {
    width: titleWidth + padding.left + padding.right,
    height: titleHeight + padding.top + padding.bottom,
    titleWidth,
    titleHeight,
  }
}

function measureSubtree(
  ctx: TreeLayoutContext,
  node: NodeDesc,
  sizeMap: Map<string, NodeSize>,
  direction: TreeDirection,
): void {
  const spacing = getNodeSpacingCached(ctx, node.id, direction)
  sizeMap.set(node.id, measureNodeSize(node, spacing.padding, ctx.options))
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureSubtree(ctx, child, sizeMap, direction)
    }
  }
}

// ─── 布局 ───

interface NodeLayoutOutput {
  x: number
  y: number
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  branchHeight: number
}

/** 子树在主轴方向的总跨度（递归计算） */
function subtreeAxisSize(
  ctx: TreeLayoutContext,
  node: NodeDesc,
  sizeMap: Map<string, NodeSize>,
  dir: TreeDirection,
): number {
  const h = isHorizontal(dir)
  const size = sizeMap.get(node.id)!
  const spacing = getNodeSpacingCached(ctx, node.id, dir)
  
  if (isCollapsed(node)) {
    return h ? size.height : size.width
  }
  
  const children = getAttachedChildren(node)
  if (children.length === 0) {
    return h ? size.height : size.width
  }
  
  // 计算所有子节点的子树总跨度
  let childrenTotal = 0
  for (let i = 0; i < children.length; i++) {
    childrenTotal += subtreeAxisSize(ctx, children[i], sizeMap, dir)
    if (i < children.length - 1) {
      childrenTotal += h ? spacing.verticalGap : spacing.horizontalGap
    }
  }
  
  // 返回 max(自身, 子节点总跨度)
  const selfSize = h ? size.height : size.width
  return Math.max(selfSize, childrenTotal)
}

function isHorizontal(dir: TreeDirection): boolean {
  return dir === 'right' || dir === 'left'
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
  const h = isHorizontal(direction)

  const branchAxisSize = subtreeAxisSize(ctx, node, sizeMap, direction)

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth: size.titleWidth, titleHeight: size.titleHeight, branchHeight: branchAxisSize })

  if (isCollapsed(node) || children.length === 0) return

  // 计算所有子节点的子树总跨度
  let childrenTotal = 0
  for (let i = 0; i < children.length; i++) {
    childrenTotal += subtreeAxisSize(ctx, children[i], sizeMap, direction)
    if (i < children.length - 1) {
      childrenTotal += h ? spacing.verticalGap : spacing.horizontalGap
    }
  }

  if (h) {
    // ── 水平布局（right/left）──
    // 子节点沿 Y 轴排列，从子树空间的起始位置开始
    const subtreeStartY = y - (branchAxisSize - size.height) / 2
    let childY = subtreeStartY
    for (const child of children) {
      const childSubtreeSize = subtreeAxisSize(ctx, child, sizeMap, direction)
      const childNodeSize = sizeMap.get(child.id)!

      const childX = direction === 'right'
        ? x + size.width + spacing.horizontalGap
        : x - childNodeSize.width - spacing.horizontalGap

      // 垂直居中节点在它的子树空间内
      const childYCentered = childY + (childSubtreeSize - childNodeSize.height) / 2
      layoutSubtree(ctx, child, childX, childYCentered, direction, sizeMap, nodes)
      childY += childSubtreeSize + spacing.verticalGap
    }
  } else {
    // ── 垂直布局（down/up）──
    const subtreeStartX = x - (branchAxisSize - size.width) / 2
    let childX = subtreeStartX
    for (const child of children) {
      const childSubtreeSize = subtreeAxisSize(ctx, child, sizeMap, direction)
      const childNodeSize = sizeMap.get(child.id)!
      const childY = direction === 'down'
        ? y + size.height + spacing.verticalGap
        : y - childNodeSize.height - spacing.verticalGap
      // 水平居中节点在它的子树空间内
      const childXCentered = childX + (childSubtreeSize - childNodeSize.width) / 2
      layoutSubtree(ctx, child, childXCentered, childY, direction, sizeMap, nodes)
      childX += childSubtreeSize + spacing.horizontalGap
    }
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

      const rootAxisSize = subtreeAxisSize(ctx, root, sizeMap, direction)
      const rootSize = sizeMap.get(root.id)!
      let rootX: number
      let rootY: number

      if (isHorizontal(direction)) {
        rootX = direction === 'right' ? options.rootOffsetX : 0
        rootY = (rootAxisSize - rootSize.height) / 2
      } else {
        rootX = (rootAxisSize - rootSize.width) / 2
        rootY = direction === 'down' ? options.rootOffsetX : 0
      }

      layoutSubtree(ctx, root, rootX, rootY, direction, sizeMap, nodes)

      // 平移到正数区
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (const l of nodes.values()) {
        minX = Math.min(minX, l.x)
        minY = Math.min(minY, l.y)
        maxX = Math.max(maxX, l.x + l.width)
        maxY = Math.max(maxY, l.y + l.height)
      }
      if (minX < 0 || minY < 0) {
        const ox = minX < 0 ? -minX : 0
        const oy = minY < 0 ? -minY : 0
        for (const l of nodes.values()) { l.x += ox; l.y += oy }
        maxX += ox; maxY += oy
      }

      return { nodes, totalWidth: maxX, totalHeight: maxY }
    },
  }
}
