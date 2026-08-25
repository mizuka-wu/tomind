/**
 * Extensions 共享类型
 *
 * 定义 extensions 层访问 view 层的类型接口，
 * 避免 `ctx.getView() as any` 模式。
 */
import type { LayoutResult } from '@tomind/layout'
import type { Group } from 'leafer-ui'

/** view 层最小接口 — extensions 需要的属性 */
export interface ViewLike {
  layoutEngine?: { getLayoutResult(): LayoutResult } | null
  leaferView?: { parent?: Group | null; app?: unknown } | null
}

/** LeaferJS 视图最小接口 */
export interface LeaferViewLike {
  $el?: unknown
  parent?: Group | null
  app?: unknown
}

/** 类型安全的 getView 包装 */
export function getViewLike(ctx: { getView(): unknown | null }): ViewLike | null {
  return (ctx.getView() ?? null) as ViewLike | null
}

/** 获取 LeaferJS canvas 的 DOM 元素 */
export function getCanvasElement(leaferView: { $el?: unknown }): HTMLElement | null {
  return (leaferView.$el ?? null) as HTMLElement | null
}
