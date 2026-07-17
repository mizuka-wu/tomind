/**
 * ClassList — 类名管理工具
 *
 * 对标旧系统 topicModel.classList()
 * 类名存储在 NodeDesc.attrs.class 中（空格分隔的字符串）
 */

// ==================== 常量 ====================

/** 类名分隔符 */
export const CLASS_SEPARATOR = ' '

// ==================== 解析 ====================

/**
 * 从 class 字符串解析类名数组
 */
export function parseClassList(classString: string | undefined): string[] {
  if (!classString || typeof classString !== 'string') return []
  return classString.split(CLASS_SEPARATOR).filter(className => className.length > 0)
}

/**
 * 将类名数组序列化为字符串
 */
export function serializeClassList(classList: readonly string[]): string {
  return classList.join(CLASS_SEPARATOR)
}

// ==================== 操作 ====================

/**
 * 检查是否包含指定类名
 */
export function hasClass(classList: readonly string[], className: string): boolean {
  return classList.includes(className)
}

/**
 * 添加类名（返回新数组）
 */
export function addClass(
  classList: readonly string[],
  className: string,
  index?: number
): string[] {
  if (!className || className.includes(CLASS_SEPARATOR)) {
    return [...classList]
  }
  if (classList.includes(className)) {
    return [...classList]
  }
  const newList = [...classList]
  if (index !== undefined && index >= 0 && index <= newList.length) {
    newList.splice(index, 0, className)
  } else {
    newList.push(className)
  }
  return newList
}

/**
 * 移除类名（返回新数组）
 */
export function removeClass(
  classList: readonly string[],
  className: string
): string[] {
  if (!className) return [...classList]
  return classList.filter(c => c !== className)
}

/**
 * 切换类名（存在则移除，不存在则添加）
 */
export function toggleClass(
  classList: readonly string[],
  className: string
): string[] {
  if (classList.includes(className)) {
    return removeClass(classList, className)
  }
  return addClass(classList, className)
}

// ==================== 样式查找 ====================

/**
 * 从 theme 查找 classList 对应的样式值
 *
 * 按 classList 顺序查找，后面的类名优先级更高（覆盖前面的）
 */
export function getClassStyleValue(
  classList: readonly string[],
  theme: Record<string, { properties?: Record<string, unknown> }> | undefined,
  key: string
): unknown {
  if (!theme || classList.length === 0) return undefined

  let value: unknown = undefined
  for (const className of classList) {
    const classEntry = theme[className]
    if (classEntry?.properties?.[key] !== undefined) {
      value = classEntry.properties[key]
    }
  }
  return value
}

/**
 * 从 theme 查找 classList 对应的所有样式
 *
 * 按 classList 顺序查找，后面的类名优先级更高（覆盖前面的）
 */
export function getClassStyles(
  classList: readonly string[],
  theme: Record<string, { properties?: Record<string, unknown> }> | undefined
): Record<string, unknown> {
  if (!theme || classList.length === 0) return {}

  const result: Record<string, unknown> = {}
  for (const className of classList) {
    const classEntry = theme[className]
    if (classEntry?.properties) {
      Object.assign(result, classEntry.properties)
    }
  }
  return result
}
