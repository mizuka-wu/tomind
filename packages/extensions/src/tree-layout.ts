import { createExtension } from '@tomind/core'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from '@tomind/layout'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'
import type { SheetState } from '@tomind/state'
import type { StyleEngine, ResolvedStyle } from '@tomind/style'
import { getTitleText } from '@tomind/schema'

const ATTACHED = 'attached'

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

interface LayoutContext {
  options: LayoutOptions
  styleEngine: StyleEngine | null
  state: SheetState | null
  styleCache: Map<string, ResolvedStyle>
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

function getNodeSpacingCached(ctx: LayoutContext, nodeId: string) {
  if (ctx.spacingCache.has(nodeId)) {
    return ctx.spacingCache.get(nodeId)!
  }
  const style = getNodeStyle(ctx, nodeId)
  const spacing = getNodeSpacing(style, ctx.options)
  ctx.spacingCache.set(nodeId, spacing)
  return spacing
}

function measureNodeSize(
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
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
): void {
  const size = sizeMap.get(node.id)!
  const spacing = getNodeSpacingCached(ctx, node.id)
  const children = getAttachedChildren(node)

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

  nodes.set(node.id, {
    x,
    y,
    width: size.width,
    height: size.height,
    titleWidth: size.titleWidth,
    titleHeight: size.titleHeight,
    branchHeight,
  })

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

const treeLayoutAlgorithm: LayoutAlgorithm = {
  name: 'tree',

  layout(
    doc: NodeDesc,
    options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS,
    styleEngine: StyleEngine | null = null,
    state: SheetState | null = null,
  ): LayoutResult {
    const nodes = new Map()
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

    const sizeMap = new Map()
    measureSubtree(ctx, root, sizeMap)

    const rootX = options.rootOffsetX
    const rootY = 0
    layoutSubtree(ctx, root, rootX, rootY, sizeMap, nodes)

    let totalWidth = 0
    let totalHeight = 0
    for (const layout of nodes.values()) {
      totalWidth = Math.max(totalWidth, layout.x + layout.width)
      totalHeight = Math.max(totalHeight, layout.y + layout.height)
    }

    return { nodes, totalWidth, totalHeight }
  },
}

export const TreeLayoutExtension = createExtension({
  name: 'treeLayout',
  type: 'extension',
  defaultOptions: { enabled: true },

  addLayout() {
    return treeLayoutAlgorithm
  },
})
