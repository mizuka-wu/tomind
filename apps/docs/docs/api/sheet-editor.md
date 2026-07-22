# SheetEditor

编辑器主类，对标 ProseMirror EditorView。

## 构造函数

```ts
new SheetEditor(options: SheetEditorOptions)
```

### 选项

| 参数 | 类型 | 说明 |
|------|------|------|
| `dom` | `HTMLElement` | 容器 DOM |
| `state` | `SheetState` | 初始状态 |
| `plugins` | `Plugin[]` | 插件列表 |
| `extensions` | `Extension[]` | 扩展列表 |
| `styleEngine` | `StyleEngine` | 样式引擎 |
| `layoutEngine` | `LayoutEngine` | 布局引擎 |

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `state` | `SheetState` | 当前状态（只读） |
| `docView` | `ViewDesc \| null` | 根视图描述 |
| `viewport` | `Viewport` | 当前视口 |

## 方法

### dispatch(tr: Transaction)

唯一事务入口。创建新状态并更新视图。

### on(event, callback) / off(event, callback)

事件监听：
- `viewportChange` — 视口变化
- `stateUpdate` — 状态更新
- `dispatch` — 事务分发
- `layoutUpdated` — 布局更新

### chain()

创建命令链式调用：

```ts
editor.chain()
  .addNode({ parentId: 'root', type: 'topic' })
  .addClass({ nodeId: 'n1', className: 'highlight' })
  .run()
```

### destroy()

销毁编辑器，清理所有资源。
