/**
 * Extensions 共享工具
 */
import type { UI, Group } from 'leafer-ui'

/** 类型安全的 findOne — 从 Group 中查找指定名称的元素 */
export function findOne<T extends UI = UI>(group: Group, name: string): T | null {
  return (group.findOne(name) as T | null)
}
