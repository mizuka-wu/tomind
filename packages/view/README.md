# @tomind/view

ViewDesc 树、28 种渲染器、事件委托系统。

## 导出

- `ViewDesc` / `NodeViewDesc` / `PartViewDesc` — 视图描述基类
- 24 种具体 NodeViewDesc（TopicNodeViewDesc、RelationshipNodeViewDesc 等）
- 28 种渲染器（topic-renderer、boundary-renderer 等）
- `DirtyFlag` — 脏标记系统（6 级）
- `analyzeSteps` — 脏分析
- `EventDelegator` / `EventManager` / `EventThrottler` — 事件系统
- `KeyboardEventManager` — 键盘事件

## 依赖

- `@tomind/schema`
- `@tomind/state`
- `@tomind/style`
- `leafer-ui`
