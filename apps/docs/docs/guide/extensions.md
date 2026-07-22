# 扩展系统

Tomind 采用 Tiptap 风格的扩展系统，所有功能以插件形式注册。

## 创建扩展

```ts
import { createExtension } from '@tomind/extension'

const MyExtension = createExtension({
  name: 'my-extension',
  type: 'extension',
  defaultOptions: {},
  onCreate(ctx) {
    // 注册命令
    ctx.registerCommand('myCommand', (state, dispatch, params) => {
      // ...
      return true
    })
    // 监听事件
    ctx.on('stateUpdate', (newState) => {
      // ...
    })
  },
  destroy() {
    // 清理
  },
})
```

## 创建 NodeView 扩展

```ts
import { createNodeExtension } from '@tomind/extension'
import { TopicNodeViewDesc } from '@tomind/view'

const TopicExtension = createNodeExtension({
  name: 'topic',
  addNodeView() {
    return TopicNodeViewDesc
  },
})
```

## StarterKit

`@tomind/starter-vanilla` 预装了所有内置扩展：

- KeymapExtension — 快捷键
- ViewportExtension — 视口控制
- SelectDragExtension — 选区拖拽
- MouseBoxSelectExtension — 框选
- DropExtension — 拖放
- ContextMenuExtension — 右键菜单
- ResizeBoxExtension — 缩放框
- RelationshipExtension — 关联线
- EditBridgeExtension — 双击编辑
- ThemeExporterExtension — 主题导出
- MatrixExtension — 矩阵布局
- 等 20+ 扩展
