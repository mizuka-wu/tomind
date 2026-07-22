# View

ViewDesc 树 + 28 种渲染器 + 事件系统。

## ViewDesc

视图描述基类，管理 LeaferJS 元素的创建和更新。

```ts
class ViewDesc {
  readonly node: NodeDesc
  readonly role: NodeRole
  readonly element: Group | null

  addChild(view: ViewDesc, index?: number): void
  removeChild(view: ViewDesc): void
  findById(id: string): ViewDesc | null
  markDirty(flag: DirtyFlag): void
  markAllDirty(flag: DirtyFlag): void
  update(node: NodeDesc): boolean
  destroy(): void
}
```

## DirtyFlag

6 级脏标记系统：

```ts
const enum DirtyFlag {
  CLEAN = 0,
  CONTENT = 1 << 0,    // 内容变更
  SIZE = 1 << 1,       // 尺寸变更
  LAYOUT = 1 << 2,     // 布局变更
  STYLE = 1 << 3,      // 样式变更
  CONNECTION = 1 << 4, // 连接线变更
  CHILDREN = 1 << 5,   // 子节点变更
}
```

## NodeViewDesc

24 种节点视图描述：TopicNodeViewDesc、RelationshipNodeViewDesc、BoundaryNodeViewDesc 等。

## 事件系统

- `EventDelegator` — 事件委托
- `EventManager` — 事件管理
- `EventThrottler` — 事件节流
- `KeyboardEventManager` — 键盘事件
