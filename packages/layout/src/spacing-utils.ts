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
import { getAttr } from './layout-utils'

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
