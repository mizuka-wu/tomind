# Extension

Tiptap 风格扩展系统。

## createExtension

```ts
import { createExtension } from '@tomind/extension'

const MyExtension = createExtension({
  name: 'my-extension',
  type: 'extension',
  defaultOptions: {},
  onCreate(ctx) { },
  destroy() { },
})
```

## createNodeExtension

```ts
import { createNodeExtension } from '@tomind/extension'

const TopicExtension = createNodeExtension({
  name: 'topic',
  addNodeView() {
    return TopicNodeViewDesc
  },
})
```

## ExtensionContext

扩展上下文，由 `onCreate` 回调提供：

| 方法 | 说明 |
|------|------|
| `registerCommand(name, fn)` | 注册命令 |
| `registerNodeView(type, ViewDesc)` | 注册 NodeView |
| `registerLayout(algorithm)` | 注册布局算法 |
| `on(event, handler)` | 监听编辑器事件 |
| `off(event, handler)` | 取消监听 |
| `emit(event, data)` | 触发事件 |
| `getState()` | 获取当前状态 |
| `dispatch(tr)` | 分发事务 |

## ExtensionManager

```ts
const manager = new ExtensionManager()
manager.register(ext)
manager.setup(ctx)
manager.destroy()
```
