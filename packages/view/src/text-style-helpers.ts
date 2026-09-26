/**
 * LeaferJS Text 样式工具
 *
 * 将 snowbrush 样式值转换为 LeaferJS 兼容类型
 * 使用 Text 实例属性类型来推导返回类型，避免 `as any`
 */

import type { Text } from 'leafer-ui'

/** LeaferJS Text 属性类型 */
type TextDecoration = NonNullable<Text['textDecoration']>
type TextAlign = NonNullable<Text['textAlign']>
type FontWeight = NonNullable<Text['fontWeight']>

/** textDecoration 映射：snowbrush → LeaferJS */
const DECORATION_MAP: Record<string, TextDecoration> = {
  'underline': 'under',
  'line-through': 'delete',
  'under-delete': 'under-delete',
  'none': 'none',
}

/**
 * 将 snowbrush textDecoration 值转为 LeaferJS 格式
 */
export function mapTextDecoration(value: string): TextDecoration {
  const mapped = DECORATION_MAP[value]
  if (mapped) return mapped
  if (value === 'under' || value === 'delete' || value === 'none') return value
  return 'none'
}

/**
 * 类型安全的 textAlign 赋值
 * snowbrush 和 LeaferJS 的 textAlign 值一致（left | center | right）
 */
export function mapTextAlign(value: string): TextAlign {
  if (value === 'left' || value === 'center' || value === 'right') return value
  return 'left'
}

/**
 * 类型安全的 fontWeight 赋值
 * snowbrush 和 LeaferJS 的 fontWeight 值一致
 */
export function mapFontWeight(value: string | number): FontWeight {
  if (typeof value === 'number') {
    const n = Math.round(value / 100) * 100
    if (n >= 100 && n <= 900) return n as FontWeight
    return 400
  }
  switch (value) {
    case 'thin': case 'extra-light': case 'light': case 'normal':
    case 'medium': case 'semi-bold': case 'bold': case 'extra-bold': case 'black':
      return value
    default:
      return 'normal'
  }
}
