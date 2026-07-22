# State

ProseMirror 风格的不可变状态管理。

## SheetState

```ts
class SheetState {
  readonly doc: NodeDesc          // 文档树
  readonly selection: SelectionState
  readonly viewport: Viewport
  readonly decorations: DecorationSet

  static create(opts: { doc: NodeDesc }): SheetState
  apply(tr: Transaction): SheetState
  field<T>(key: PluginKey<T>): T
}
```

## Transaction

```ts
class Transaction {
  steps: Step[]
  selection: SelectionState
  doc: NodeDesc

  static empty(doc: NodeDesc): Transaction
  setSelection(sel: SelectionState): this
  setViewport(vp: Viewport): this
}
```

## Step

```ts
class Step {
  type: StepType
  nodeId: string
  attrs: Record<string, unknown>
}

// 具体步骤
InsertNodeStep   // 插入节点
RemoveNodeStep   // 删除节点
UpdateNodeStep   // 更新节点属性
SetSelectionStep // 设置选区
SetViewportStep  // 设置视口
```
