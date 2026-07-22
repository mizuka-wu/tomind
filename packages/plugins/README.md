# @tomind/plugins

插件系统：History（undo/redo）、Selection、ViewPlugin。

## 导出

- `PluginState` — 插件状态基类
- `createHistoryPlugin()` / `HistoryState` — 历史插件
- `createViewPlugin()` / `ViewPluginManager` — 视图插件
- `createSelectionPlugin()` / `SelectionPluginState` — 选择插件

## 依赖

- `@tomind/schema`
- `@tomind/state`
