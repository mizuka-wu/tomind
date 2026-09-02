/**
 * 共享的 spacing 读取工具 — 对齐 snowbrush getTopicMargins
 *
 * 所有布局算法统一使用此函数读取 spacingMajor/spacingMinor/margin，
 * 避免每个布局文件重复实现。
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine, ResolvedStyle } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutOptions } from './layout-engine'
import { measureTextSize } from './layout-engine'
import {
  getAttr,
  getFontSize,
  getFontFamily,
  getFontWeight,
  getFontStyle,
  getTitle,
  isCollapsed,
  getAttachedChildren,
} from './layout-utils'
import type { SimpleNodeSize } from './layout-utils'

export function parseStyleValue(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return isNaN(num) ? fallback : num
  }
  return fallback
}

export interface NodeSpacing {
  horizontalGap: number
  verticalGap: number
  padding: { top: number; right: number; bottom: number; left: number }
}

/**
 * 读取节点的间距配置：
 * - spacingMajor / spacingMinor 从 resolved style 读取
 * - padding 从 attrs.style.margin 统一回退 → 分侧 marginTop/... 回退
 *
 * @param majorAxis 'horizontal' | 'vertical' — spacingMajor 对应的轴
 */
export function getNodeSpacing(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  majorAxis: 'horizontal' | 'vertical' = 'horizontal',
): NodeSpacing {
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

  const majorGap = parseStyleValue(style.spacingMajor, majorAxis === 'horizontal' ? options.horizontalGap : options.verticalGap)
  const minorGap = parseStyleValue(style.spacingMinor, majorAxis === 'horizontal' ? options.verticalGap : options.horizontalGap)

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
    horizontalGap: majorAxis === 'horizontal' ? majorGap : minorGap,
    verticalGap: majorAxis === 'horizontal' ? minorGap : majorGap,
    padding: { top, right, bottom, left },
  }
}

/** 递归测量整棵子树，使用 getNodeSpacing 的样式感知 padding */
export function measureStyledSubtree(
  node: NodeDesc,
  options: LayoutOptions,
  sizeMap: Map<string, SimpleNodeSize>,
  majorAxis: 'horizontal' | 'vertical',
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): void {
  const fontSize = getFontSize(node, styleEngine, state)
  const title = getTitle(node)
  const fontFamily = getFontFamily(node, styleEngine, state)
  const fontWeight = getFontWeight(node, styleEngine, state)
  const fontStyle = getFontStyle(node, styleEngine, state)
  const spacing = getNodeSpacing(node, options, styleEngine ?? null, state ?? null, majorAxis)
  const { width, height } = measureTextSize(title, fontSize, options, fontFamily, fontWeight, fontStyle)
  sizeMap.set(node.id, {
    width: width + spacing.padding.left + spacing.padding.right,
    height: height + spacing.padding.top + spacing.padding.bottom,
  })
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureStyledSubtree(child, options, sizeMap, majorAxis, styleEngine, state)
    }
  }
}

/**
 * 计算子节点总高度（累加子树高度 + 间距）
 * @param children 子节点列表
 * @param getHeight 获取单个子节点高度的函数
 * @param getSpacing 获取相邻子节点间距的函数
 * @param options.parentGap 父子层间间距（tree=40, map=0）
 */
export function computeChildrenTotalHeight(
  children: readonly NodeDesc[],
  getHeight: (child: NodeDesc) => number,
  getSpacing: (index: number) => number,
  options?: { parentGap?: number },
): number {
  const parentGap = options?.parentGap ?? 0
  let total = 0
  for (let i = 0; i < children.length; i++) {
    total += getHeight(children[i]) + parentGap
    if (i < children.length - 1) {
      total += getSpacing(i)
    }
  }
  return total
}

/**
 * SB对齐的布局宽度 = nodeWidth + innerSpacing(20) + 2 × borderWidth
 * SB的topicBounds.width包含grid水平间距(horizontalSpacing=10 × 2 gaps)和borderWidth
 * TM的measureNodeSize不含这两项，需要在布局定位时补上
 */
export function getLayoutWidth(
  node: NodeDesc,
  nodeWidth: number,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): number {
  let style: Record<string, unknown> | null = null
  if (styleEngine && state) {
    style = styleEngine.computeStyle(state, node.id)
  }
  const borderWidth = parseStyleValue(style?.borderWidth, 0)
  return nodeWidth + 20 + 2 * borderWidth
}
