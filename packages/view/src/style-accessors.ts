/**
 * 样式值类型化访问器
 *
 * 从 Record<string, unknown> 中安全读取类型化值，
 * 消除 `style.xxx as string | undefined` 模式。
 */

/** 从样式对象中读取字符串值 */
export function getStringStyle(style: Record<string, unknown>, key: string): string | undefined {
  const v = style[key]
  return typeof v === 'string' ? v : undefined
}

/** 从样式对象中读取数值 */
export function getNumberStyle(style: Record<string, unknown>, key: string): number | undefined {
  const v = style[key]
  return typeof v === 'number' ? v : undefined
}

/** 从样式对象中读取布尔值 */
export function getBoolStyle(style: Record<string, unknown>, key: string): boolean | undefined {
  const v = style[key]
  return typeof v === 'boolean' ? v : undefined
}

/** 从样式对象中读取对象值 */
export function getObjectStyle<T>(style: Record<string, unknown>, key: string): T | undefined {
  const v = style[key]
  return (v && typeof v === 'object') ? v as T : undefined
}
