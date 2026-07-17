# Tomind 架构设计文档

> 基于 snowbrush-v2 重构，采用 Tiptap 风格扩展系统
> 最后更新：2026-07-16

---

## 1. 项目概述

Tomind 是一个现代思维导图引擎，从 Snowbrush v2.47.0（631 文件、147,592 行）重构而来。

### 1.1 设计目标

- **零旧依赖**：移除 Backbone / jQuery / underscore / SVG.js / MobX
- **类型安全**：TypeScript strict mode，零 `any`（除必要的 LeaferJS 交互）
- **可扩展**：Tiptap 风格 Extension 系统，功能以插件形式注册
- **不可变状态**：ProseMirror 风格的 Document → State → Transaction 数据流

### 1.2 技术栈

| 层级 | 技术 |
|------|------|
| 渲染 | LeaferJS 2.x（Canvas/WebGL） |
| 状态 | 自研不可变状态（对标 ProseMirror） |
| 扩展 | Tiptap 风格 Extension 系统 |
| 构建 | Vite + pnpm workspace + Turbo |
| 测试 | Vitest（单元） + Playwright（E2E） |

---

## 2. 目录结构

```
tomind/
├── packages/core/           # 核心引擎（主包）
│   └── src/
│       ├── state/           # 不可变状态管理
│       ├── schema/          # 数据类型定义
│       ├── view/            # ViewDesc 树 + 渲染器
│       ├── editor/          # 编辑器主类
│       ├── extension/       # 扩展系统
│       ├── commands/        # 命令系统
│       ├── core/            # 布局引擎 + 样式引擎
│       ├── plugins/         # 内置插件
│       ├── assets/          # 资源管理
│       ├── themes/          # 主题配置
│       ├── xap/             # XAP 资源系统
│       ├── utils/           # 工具函数
│       └── __tests__/       # 测试
├── src/                     # 旧架构（迁移来源，最终删除）
│   ├── core/                # 旧编辑器
│   ├── models/              # 旧数据模型
│   ├── formats/             # 格式转换
│   └── utils/               # 工具函数
├── docs/                    # 文档
└── MIGRATION_PLAN.md        # 迁移计划
```

---

## 3. 核心数据流

```
输入（XMind/FreeMind/OPML 文件）
    ↓ formatconverter.fromXMind()
旧 Model (TopicModel/SheetModel)
    ↓ modelToState()
SheetState { doc: NodeDesc, selection, viewport }
    ↓ SheetEditor.dispatch(tr)
Transaction → Step 序列 → 新 SheetState
    ↓ ViewDesc.update(state)
LeaferJS 渲染 (Group/Rect/Text)
    ↓ LayoutEngine.compute()
坐标定位
    ↓ StyleEngine.computeStyle()
样式应用
```

### 3.1 数据模型

```
NodeDesc（运行时节点）
├── id: string              # 唯一标识
├── type: string            # ROOT / TOPIC / RELATIONSHIP / BOUNDARY / SUMMARY
├── attrs: Record<string, unknown>  # 属性（标题、样式等）
└── children: Record<string, NodeDesc[]>  # 子节点（按角色分组）
    ├── attached: NodeDesc[]    # 附属节点
    ├── callout: NodeDesc[]     # 呼出框
    └── ...
```

**关键设计**：
- `children` 是嵌套结构，按角色分组
- 无 `parent` 引用（用 pos 系统定位）
- 无 `depth`（通过树遍历计算）
- 不可变（任何修改产生新对象）

---

## 4. 状态管理（ProseMirror 风格）

### 4.1 SheetState

```typescript
class SheetState {
  readonly doc: NodeDesc                    // 文档树（唯一数据源）
  readonly _nodeMap: Map<string, NodeDesc>  // id → NodeDesc 查询优化
  readonly selection: SelectionState        // 选区
  readonly viewport: Viewport               // 视口
  readonly decorations: DecorationSet       // 装饰集
  readonly plugins: Plugin[]                // 插件列表
}
```

### 4.2 Transaction

```typescript
class Transaction {
  steps: Step[]           // 变更步骤
  selection: SelectionState
  doc: NodeDesc           // 新文档
  annotations: Map<string, unknown>
}
```

**数据流**：
```
当前 SheetState + Transaction → applyTransaction() → 新 SheetState
```

---

## 5. ViewDesc 系统（视图层）

### 5.1 类层次

```
ViewDesc（基类）
├── NodeViewDesc（抽象）
│   ├── TopicNodeViewDesc           # 主题节点
│   ├── RelationshipNodeViewDesc    # 关联线
│   ├── BoundaryNodeViewDesc        # 边界框
│   ├── SummaryNodeViewDesc         # 摘要
│   ├── CollapseExtendNodeViewDesc  # 折叠/展开按钮
│   ├── NumberingNodeViewDesc       # 编号
│   ├── TopicTitleNodeViewDesc      # 标题
│   ├── InformationNodeViewDesc     # 信息
│   ├── LabelNodeViewDesc           # 标签
│   ├── PlaceholderTopicNodeViewDesc # 占位节点
│   ├── ImageNodeViewDesc           # 图片
│   ├── IndicatorNodeViewDesc       # 指标
│   ├── BoundaryTitleNodeViewDesc   # 边界标题
│   ├── MathjaxNodeViewDesc         # 数学公式
│   ├── SelectBoxNodeViewDesc       # 选择框
│   ├── TopicSelectBoxNodeViewDesc  # 主题选择框
│   ├── ResizeBoxNodeViewDesc       # 缩放框
│   ├── FishboneMainLineNodeViewDesc # 鱼骨主线
│   ├── FishboneHeadLineNodeViewDesc # 鱼骨头线
│   ├── MatrixCellNodeViewDesc      # 矩阵单元格
│   ├── TreeTableCellNodeViewDesc   # 树表单元格
│   ├── ConnectionNodeViewDesc      # 连接线
│   ├── LegendNodeViewDesc          # 图例
│   └── MarkerNodeViewDesc          # 标记
└── PartViewDesc（抽象）
    ├── TitlePartViewDesc           # 标题部分
    ├── ImagePartViewDesc           # 图片部分
    ├── MarkersPartViewDesc         # 标记部分
    ├── LabelsPartViewDesc          # 标签部分
    ├── NotePartViewDesc            # 备注部分
    └── LinkPartViewDesc            # 链接部分
```

### 5.2 ViewDesc 核心职责

```typescript
abstract class ViewDesc {
  readonly node: NodeDesc          // 关联的数据节点
  readonly role: NodeRole          // 节点角色
  protected _parent: ViewDesc | null
  protected _children: ViewDesc[]
  protected _element: Group | null  // LeaferJS 元素
  protected _dirty: DirtyFlag      // 脏标记（6级）
}
```

### 5.3 脏标记系统

```typescript
const enum DirtyFlag {
  CLEAN = 0,
  CONTENT = 1 << 0,    // 内容变更
  SIZE = 1 << 1,       // 尺寸变更
  LAYOUT = 1 << 2,     // 布局变更
  STYLE = 1 << 3,      // 样式变更
  CONNECTION = 1 << 4, // 连接线变更
  CHILDREN = 1 << 5,   // 子节点变更
  ALL = CONTENT | SIZE | LAYOUT | STYLE | CONNECTION | CHILDREN
}
```

---

## 6. Extension 系统（Tiptap 风格）

### 6.1 扩展接口

```typescript
interface Extension<Options = {}> {
  name: string
  type: 'extension' | 'node' | 'mark'
  defaultOptions: ExtensionOptions<Options>
  
  // 生命周期
  onCreate?: (ctx: ExtensionContext) => CleanupFn | void
  destroy?: () => void
  
  // Tiptap 风格钩子
  addOptions?: () => Partial<Options>
  addStorage?: () => Record<string, unknown>
  addNodeView?: () => new (...args: any[]) => any  // 注册 NodeViewDesc
  addCommands?: () => Record<string, (...args: any[]) => any>
  addKeyboardShortcuts?: () => Record<string, KeyboardShortcutHandler>
  addLayout?: () => LayoutAlgorithm
}
```

### 6.2 ExtensionContext（扩展上下文）

```typescript
interface ExtensionContext {
  storage: Record<string, unknown>  // 当前扩展的存储
  getWorkbook: () => WorkbookEditorInterface
  getState: () => SheetState
  dispatch: (tr: Transaction) => void
  getView: () => SheetEditor | null
  
  // 命令注册
  registerCommand: (name: string, command: CommandFn) => void
  unregisterCommand: (name: string) => void
  
  // NodeView 注册
  registerNodeView: (nodeType: string, viewDesc: new (...) => ViewDesc) => void
  unregisterNodeView: (nodeType: string) => void
  
  // 布局注册
  registerLayout: (algorithm: LayoutAlgorithm) => void
  unregisterLayout: (name: string) => void
  
  // 事件系统
  on: (event: string, handler: EventHandler) => void
  off: (event: string, handler: EventHandler) => void
  emit: (event: string, ...args: unknown[]) => void
}
```

### 6.3 已实现扩展

| 扩展 | 类型 | 功能 |
|------|------|------|
| `KeymapExtension` | extension | 快捷键管理 |
| `ViewportExtension` | extension | 视口控制 |
| `SelectDragExtension` | extension | 选区拖拽 |
| `MouseBoxSelectExtension` | extension | 鼠标框选 |
| `DropExtension` | extension | 拖放处理 |
| `ContextMenuExtension` | extension | 右键菜单 |
| `ResizeBoxExtension` | extension | 缩放框 |
| `TopicSelectBoxExtension` | extension | Topic 选区框 |
| `SelectBoxExtension` | extension | 通用选区框 |
| `RelationshipExtension` | extension | 关联线交互 |
| `EditBridgeExtension` | extension | 双击编辑桥接 |
| `ThemeExporterExtension` | extension | 主题导出 |
| `MatrixExtension` | node | 矩阵布局 |

### 6.4 NodeView 注册机制

**目标状态**（通过 Extension 注册）：

```typescript
// 每个节点类型一个 Extension
const TopicExtension = createNodeExtension({
  name: 'topic',
  addNodeView() {
    return TopicNodeViewDesc
  }
})

// StarterKit 包含所有基础扩展
const StarterKit = createStarterKit({
  extensions: [
    TopicExtension,
    RelationshipExtension,
    BoundaryExtension,
    SummaryExtension,
  ]
})
```

**ExtensionManager.setup() 自动注册**：

```typescript
if (extension.type === 'node' && extension.addNodeView) {
  const NodeViewClass = extension.addNodeView()
  ctx.registerNodeView(name, NodeViewClass)
}
```

---

## 7. 布局引擎

### 7.1 坐标系

LeaferJS 坐标系：**每个节点的 (x, y) 相对于父节点的 (0, 0)**

```
ROOT (0, 0)
└── centralTopic (rootOffsetX, 0)
    ├── mainTopic1 (parentWidth + gap, offset)
    │   ├── subTopic1 (parentWidth + gap, offset)
    │   └── subTopic2 (parentWidth + gap, offset)
    └── mainTopic2 (parentWidth + gap, offset)
```

### 7.2 布局算法

1. **自底向上**：计算每个分支的总高度 (`calcBranchHeight`)
2. **自顶向下**：分配相对坐标 (`layoutChildren`)

### 7.3 API

```typescript
// 计算布局
const result = layoutTree(doc)
// result.nodes: Map<string, NodeLayout>
// result.totalWidth: number
// result.totalHeight: number

// 应用布局到视图
applyLayoutToViews(result, nodeViewTree)

// 绘制连接线
drawConnections(rootNodeView)
```

### 7.4 配置选项

```typescript
interface LayoutOptions {
  horizontalGap: number    // 父子节点水平间距 (默认 40)
  verticalGap: number      // 兄弟节点垂直间距 (默认 10)
  nodePadding: {           // 节点内边距
    top: number            // 默认 8
    right: number          // 默认 16
    bottom: number         // 默认 8
    left: number           // 默认 16
  }
  rootOffsetX: number      // 根节点水平偏移 (默认 50)
  lineHeight: number       // 文字行高 (默认 20)
  charWidthFactor: number  // 字符宽度系数 (默认 0.6)
}
```

---

## 8. 样式系统

### 8.1 StyleEngine

```typescript
interface StyleEngine {
  computeStyle(state: SheetState, nodeId: string): ResolvedStyle
  getLeaferStyle(state: SheetState, nodeId: string): Record<string, unknown>
  getTheme(): ThemeData
  setTheme(theme: ThemeData): void
}
```

### 8.2 样式计算流程

1. 从 ThemeData 读取主题配置
2. 根据节点类型和角色应用默认样式
3. 合并节点自定义样式
4. 输出 LeaferJS 兼容的样式对象

### 8.3 主题结构

```typescript
interface ThemeData {
  [className: string]: {
    id: string
    properties: Record<string, StyleValue>
  }
}

type StyleValue = string | number | boolean | null | undefined
```

---

## 9. 事件系统

### 9.1 ViewEvent

```typescript
interface ViewEvent<T = unknown> {
  type: ViewEventType
  targetId: string
  target: unknown
  nativeEvent: T
  position: { x: number; y: number }
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  preventDefault: () => void
  stopPropagation: () => void
}
```

### 9.2 支持的事件类型

| 事件类型 | 说明 | LeaferJS 映射 |
|----------|------|---------------|
| `click` | 点击 | `tap` |
| `dblclick` | 双击 | `doubletap` |
| `contextmenu` | 右键菜单 | `righttap` |
| `pointerdown` | 鼠标按下 | `pointerdown` |
| `pointerup` | 鼠标抬起 | `pointerup` |
| `pointermove` | 鼠标移动 | `pointermove` |
| `pointerenter` | 鼠标进入 | `pointerenter` |
| `pointerleave` | 鼠标离开 | `pointerleave` |

### 9.3 事件冒泡

```
Root ViewDesc
  └── Topic ViewDesc
        └── Child Topic ViewDesc (点击)
              ↓
        Topic ViewDesc (冒泡)
              ↓
        Root ViewDesc (冒泡)
```

---

## 10. 格式转换

### 10.1 支持的格式

| 格式 | 导入 | 导出 | 状态 |
|------|------|------|------|
| XMind | ✅ | ✅ | 旧架构，待迁移 |
| FreeMind | ✅ | ❌ | 旧架构，待迁移 |
| OPML | ✅ | ✅ | 旧架构，待迁移 |
| Markdown | ✅ | ❌ | 旧架构，待迁移 |
| MindManager | ✅ | ❌ | 旧架构，待迁移 |
| Lighten | ✅ | ❌ | 旧架构，待迁移 |
| MindNode | ✅ | ❌ | 旧架构，待迁移 |

### 10.2 迁移策略

每个格式迁移为独立 Extension：

```typescript
const ImportXMindExtension = createExtension({
  name: 'import-xmind',
  type: 'extension',
  addCommands() {
    return {
      importXMind: (file: File) => async (state, dispatch) => {
        const zip = await JSZip.loadAsync(file)
        const doc = await formatconverter.fromXMind(zip)
        const newState = modelToState(doc)
        dispatch(createTransaction(newState))
        return true
      }
    }
  }
})
```

---

## 11. 编辑器主类

### 11.1 SheetEditor

```typescript
class SheetEditor {
  readonly state: SheetState
  readonly docView: DocViewDesc | null
  readonly styleEngine: StyleEngine
  readonly layoutEngine: LayoutEngine
  readonly commandManager: CommandManager
  readonly extensionManager: ExtensionManager

  constructor(options: SheetEditorOptions)
  
  // 核心方法
  dispatch(tr: Transaction): void
  registerExtension(extension: Extension): void
  createExtensionContext(): ExtensionContext
}
```

### 11.2 WorkbookEditor

```typescript
class WorkbookEditor {
  readonly styleEngine: StyleEngine
  readonly layoutEngine: LayoutEngine
  readonly commandManager: CommandManager
  readonly extensionManager: ExtensionManager

  constructor(options: WorkbookEditorOptions)
  
  // Sheet 管理
  getActiveSheet(): SheetEditor | null
  switchSheet(sheetId: string): void
}
```

---

## 12. 与旧架构的对比

| 维度 | 旧架构 (Snowbrush) | 新架构 (Tomind) |
|------|---------------------|-----------------|
| 依赖 | Backbone, jQuery, underscore, SVG.js, MobX | leafer-ui, mitt |
| 状态 | 可变 Model + Backbone.Events | 不可变 SheetState + Transaction |
| 视图 | Backbone.View + SVG | LeaferJS Group + ViewDesc 树 |
| 扩展 | 15 个模块硬编码注册 | Tiptap 风格 Extension 系统 |
| 类型 | 1,450 处 `any` | strict mode，零 `any` |
| 布局 | 43 种结构算法（耦合） | 可注册 LayoutAlgorithm |
| 渲染 | SVG.js 自定义分支 | LeaferJS 2.x |

---

## 13. 关键文件索引

### 核心文件

| 文件 | 行数 | 描述 |
|------|------|------|
| `editor/sheet-editor.ts` | ~400 | 编辑器主类 |
| `view/node-view-desc.ts` | ~1400 | 24 个 NodeViewDesc 实现 |
| `view/part-view-desc.ts` | ~400 | 6 个 PartViewDesc 实现 |
| `state/sheet-state.ts` | ~200 | 不可变状态 |
| `extension/extension-manager.ts` | ~250 | 扩展管理器 |
| `core/layout-engine.ts` | ~400 | 布局引擎 |
| `core/style/style-engine.ts` | ~300 | 样式引擎 |

### 扩展文件

| 文件 | 描述 |
|------|------|
| `extension/extensions/*.ts` | 12 个已实现扩展 |
| `extension/starter-kit.ts` | 基础扩展包 |
| `extension/types.ts` | 扩展类型定义 |
| `extension/create-extension.ts` | 扩展工厂函数 |

### 渲染器文件

| 文件 | 描述 |
|------|------|
| `view/renderers/*.ts` | 28 个渲染器 |
| `view/renderers/components/` | 可复用渲染组件 |

---

## 14. 开发规范

### 14.1 新功能开发

1. **优先使用 Extension 系统**：新功能应实现为 Extension
2. **NodeView 注册**：通过 `addNodeView()` 注册，不要硬编码
3. **命令注册**：通过 `addCommands()` 注册
4. **事件通信**：通过 `ctx.emit/on` 跨扩展通信

### 14.2 代码迁移

1. **从 `src/` 迁移到 `packages/core/`**
2. **移除 Backbone/jQuery 依赖**
3. **补全 TypeScript 类型**
4. **参考对应的 Figure 类实现渲染逻辑**

### 14.3 禁止事项

- ❌ 在 `sheet-editor.ts` 硬编码 NodeView 注册
- ❌ 使用 `any` 类型（除必要的 LeaferJS 交互）
- ❌ 在 NodeDesc 中添加 `parent` 引用
- ❌ 修改存储格式（保持 SVG/HTML）
