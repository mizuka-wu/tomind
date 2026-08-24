/**
 * Extensions 共享工具
 */
import type { ExtensionContext } from '@tomind/core'

/** 类型安全的 storage 访问 */
export function typedStorage<T>(ctx: ExtensionContext): T {
  return ctx.storage as T
}
