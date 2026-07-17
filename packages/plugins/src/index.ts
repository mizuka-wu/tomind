/**
 * Plugins 模块导出
 */

// PluginState 基类
export { PluginState } from './plugin-state'

// History 插件
export {
  HistoryState,
  createHistoryPlugin,
  createUndoTransaction,
  createRedoTransaction,
} from './history'
export type { HistoryConfig } from './history'

// ViewPlugin 接口
export {
  ViewPluginManager,
  createViewPlugin,
} from './view-plugin'
export type { ViewPlugin, WidgetViewFactory } from './view-plugin'

// Selection 插件
export {
  SelectionPluginState,
  createSelectionPlugin,
  createSetSelectionTransaction,
  createAddToSelectionTransaction,
  createClearSelectionTransaction,
} from './selection'
export type { SelectionPluginConfig } from './selection'
