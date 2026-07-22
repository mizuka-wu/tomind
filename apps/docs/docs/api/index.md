# API 概览

Tomind 由 13 个独立包组成，核心 API 分布如下：

## 编辑器

- **`SheetEditor`** — 单 sheet 编辑器（`@tomind/editor`）
- **`WorkbookEditor`** — 多 sheet 管理器（`@tomind/editor`）
- **`CommandChain`** — 命令链式调用（`@tomind/editor`）

## 状态

- **`SheetState`** — 编辑器状态（`@tomind/state`）
- **`Transaction`** — 变更事务（`@tomind/state`）
- **`Step`** — 变更步骤（`@tomind/state`）

## 视图

- **`ViewDesc`** — 视图描述基类（`@tomind/view`）
- **`NodeViewDesc`** — 节点视图描述（`@tomind/view`）
- **24 种 NodeViewDesc** — Topic, Relationship, Boundary 等

## 扩展

- **`createExtension`** — 创建扩展（`@tomind/extension`）
- **`ExtensionManager`** — 扩展管理器（`@tomind/extension`）

## 布局

- **`layoutTree`** — 执行布局计算（`@tomind/layout`）
- **`registerLayout`** — 注册布局算法（`@tomind/layout`）

## 样式

- **`StyleEngine`** — 样式引擎（`@tomind/style`）
