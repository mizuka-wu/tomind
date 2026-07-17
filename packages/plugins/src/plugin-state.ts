/**
 * PluginState — 插件状态基类（对标 ProseMirror PluginField）
 *
 * 简化插件开发：插件只需继承此类并实现 apply 方法。
 * PluginKey 的类型参数 T 就是 PluginState 子类的实例类型。
 *
 * 设计原则：
 * - 不可变：apply 返回新实例
 * - 类型安全：PluginKey<T> 自动推断 state 类型
 * - 轻量：不强制继承，Plugin 接口可直接使用
 */

import type { Transaction } from '@tomind/state'
import type { SheetState } from '@tomind/state'
import type { Plugin, PluginKey } from '@tomind/state'

/**
 * PluginState 基类
 *
 * @example
 * ```typescript
 * class MyState extends PluginState<MyState> {
 *   readonly count: number
 *
 *   constructor(count: number = 0) {
 *     super()
 *     this.count = count
 *   }
 *
 *   apply(tr: Transaction, state: SheetState): MyState {
 *     return new MyState(this.count + 1)
 *   }
 * }
 *
 * const myKey = new PluginKey<MyState>('my-plugin')
 * const myPlugin = PluginState.createPlugin(myKey, () => new MyState())
 * ```
 */
export abstract class PluginState<T extends PluginState<T>> {
  /**
   * 应用事务，返回新状态
   */
  abstract apply(tr: Transaction, state: SheetState): T

  /**
   * 创建 Plugin 定义（工厂方法）
   */
  static createPlugin<T extends PluginState<T>>(
    key: PluginKey<T>,
    init: (state: SheetState) => T
  ): Plugin<T> {
    return {
      key,
      state: {
        init,
        apply: (tr, value, state) => value.apply(tr, state),
      },
    }
  }
}
