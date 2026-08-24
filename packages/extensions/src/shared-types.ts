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
