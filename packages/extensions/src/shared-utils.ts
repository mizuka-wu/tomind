/**
 * Extensions 共享工具
 *
 * 此文件中的函数封装了跨层类型断言（boundary casts），
 * 避免在业务代码中散落 `as` 断言。
 */
import type { UI, Group } from 'leafer-ui'

/** 类型安全的 findOne — 从 Group 中查找指定名称的元素 */
export function findOne<T extends UI = UI>(group: Group, name: string): T | null {
  return (group.findOne(name) as T | null)
}

/** 获取 Group 的子元素（LeaferJS children 的类型安全包装） */
export function getGroupChildren(group: Group): Group[] {
  return (group.children ?? []) as Group[]
}
