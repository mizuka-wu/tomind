/**
 * ViewPlugin — 视图插件接口（对标 ProseMirror Plugin.view）
 *
 * 允许插件注入 Widget Decoration（折叠按钮、编号、指示器等）。
 * ViewPlugin 在每次视图更新时被调用，返回 Decoration 列表。
 *
 * 设计原则：
 * - 插件声明"要什么 Widget"，ViewDesc 负责"怎么渲染"
 * - Decoration 是数据，Widget ViewDesc 是渲染
 * - 插件通过 widgetViewFactory 注册 Widget 类型
 */

import type { SheetState } from '@tomind/state'
import type { Decoration } from '@tomind/state'
import type { NodeDesc } from '@tomind/schema'

/**
 * Widget View 工厂
 *
 * 根据 widgetType 创建对应的 ViewDesc
 */
export type WidgetViewFactory = (
  widgetType: string,
  widgetId: string,
  node: NodeDesc
) => { element: unknown } | null

/**
 * ViewPlugin 接口
 *
 * 插件实现此接口来注入 Widget Decoration
 */
export interface ViewPlugin {
  /**
   * 插件名称
   */
  readonly name: string

  /**
   * 生成 Widget Decoration
   *
   * 每次视图更新时调用，返回要应用的 Decoration 列表。
   * 返回空数组表示此插件不注入任何 Decoration。
   */
  decorations(state: SheetState): Decoration[]

  /**
   * Widget View 工厂（可选）
   *
   * 注册 widgetType → ViewDesc 的映射。
   * 不注册则使用默认的 Widget 渲染。
   */
  widgetViewFactory?: WidgetViewFactory
}

/**
 * 创建简单的 ViewPlugin
 *
 * @example
 * ```typescript
 * const collapsePlugin = createViewPlugin('collapse', (state) => {
 *   const decorations: Decoration[] = []
 *   for (const topicId of state.getTopicIds()) {
 *     const node = state.getNode(topicId)
 *     if (node && node.role === 'central' || node?.role === 'main') {
 *       decorations.push(
 *         widgetDecoration(topicId, `collapse-${topicId}`, 'collapse-button', 'after')
 *       )
 *     }
 *   }
 *   return decorations
 * })
 * ```
 */
export function createViewPlugin(
  name: string,
  decorationFn: (state: SheetState) => Decoration[],
  widgetViewFactory?: WidgetViewFactory
): ViewPlugin {
  return {
    name,
    decorations: decorationFn,
    widgetViewFactory,
  }
}

/**
 * ViewPluginManager — 管理所有 ViewPlugin
 *
 * 收集所有插件的 Decoration，合并为 DecorationSet
 */
export class ViewPluginManager {
  private readonly plugins: ViewPlugin[] = []

  constructor(plugins: ViewPlugin[] = []) {
    this.plugins = plugins
  }

  /**
   * 添加插件
   */
  add(plugin: ViewPlugin): ViewPluginManager {
    return new ViewPluginManager([...this.plugins, plugin])
  }

  /**
   * 移除插件
   */
  remove(name: string): ViewPluginManager {
    return new ViewPluginManager(this.plugins.filter(p => p.name !== name))
  }

  /**
   * 收集所有插件的 Decoration
   */
  collectDecorations(state: SheetState): Decoration[] {
    const result: Decoration[] = []
    for (const plugin of this.plugins) {
      result.push(...plugin.decorations(state))
    }
    return result
  }

  /**
   * 获取 Widget View 工厂映射
   */
  getWidgetViewFactories(): Map<string, WidgetViewFactory> {
    const map = new Map<string, WidgetViewFactory>()
    for (const plugin of this.plugins) {
      if (plugin.widgetViewFactory) {
        map.set(plugin.name, plugin.widgetViewFactory)
      }
    }
    return map
  }

  /**
   * 插件数量
   */
  get size(): number {
    return this.plugins.length
  }

  /**
   * 是否包含指定插件
   */
  has(name: string): boolean {
    return this.plugins.some(p => p.name === name)
  }
}
