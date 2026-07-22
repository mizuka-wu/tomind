# 快速开始

## 安装

```bash
pnpm add @tomind/editor @tomind/starter-vanilla leafer-ui
```

## 基础用法

```ts
import { WorkbookEditor } from '@tomind/editor'
import { StyleEngine } from '@tomind/style'
import { DefaultLayoutEngine } from '@tomind/layout'
import { SheetState } from '@tomind/state'
import { StarterKit } from '@tomind/starter-vanilla'

// 1. 创建样式引擎
const styleEngine = new StyleEngine()

// 2. 创建布局引擎
const layoutEngine = new DefaultLayoutEngine()

// 3. 创建文档
const doc = {
  id: 'root',
  type: 'root',
  attrs: {},
  children: {
    attached: [{
      id: 'topic-1',
      type: 'topic',
      attrs: { title: '中心主题' },
      children: {},
    }],
  },
}

const state = SheetState.create({ doc })

// 4. 创建编辑器
const container = document.getElementById('app')!
const workbook = new WorkbookEditor({
  styleEngine,
  layoutEngine,
  editable: true,
  extensions: [StarterKit],
})

workbook.addSheet({
  id: 'sheet-1',
  name: 'Main Sheet',
  state,
  dom: container,
})

workbook.setup()
```

## Packages

| 包 | 说明 |
|---|------|
| `@tomind/schema` | 类型定义（NodeDesc, SelectionState, Viewport） |
| `@tomind/state` | 不可变状态管理（SheetState, Transaction, Step） |
| `@tomind/view` | ViewDesc 树 + 28 渲染器 + 事件系统 |
| `@tomind/layout` | 布局引擎（tree/matrix/fishbone） |
| `@tomind/style` | 样式引擎（StyleEngine + ThemePackage） |
| `@tomind/extension` | Tiptap 风格扩展系统 |
| `@tomind/commands` | CommandDef + CommandManager |
| `@tomind/editor` | SheetEditor + WorkbookEditor |
| `@tomind/extensions` | 20+ 内置扩展集合 |
| `@tomind/plugins` | History/Selection/ViewPlugin |
| `@tomind/assets` | 资源处理（stickers/markers/illustrations） |
| `@tomind/xap` | XAP 格式 |
| `@tomind/starter-vanilla` | 默认预装包 |
