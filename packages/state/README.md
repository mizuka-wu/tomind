# @tomind/state

ProseMirror 风格的不可变状态管理：SheetState、Transaction、Step、Transform。

## 导出

- `SheetState` — 编辑器状态（doc, selection, viewport, decorations, plugins）
- `Transaction` — 变更事务（steps, selection, doc）
- `Transform` — 状态变换器（apply, dispatch）
- `Step` / `InsertNodeStep` / `RemoveNodeStep` / `UpdateNodeStep` — 变更步骤
- `DecorationSet` — 装饰集
- `PluginKey` — 插件键

## 依赖

- `@tomind/schema`
