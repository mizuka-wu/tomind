# Tomind

Tiptap 风格的思维导图编辑器引擎，基于 TypeScript + LeaferJS 渲染。

## 特性

- **Extension 系统** — 对标 Tiptap 的扩展架构，支持 NodeView、命令、快捷键、布局算法的注册与生命周期管理
- **多布局算法** — 支持 14 种布局（tree/matrix/map/logic/org-chart/timeline/fishbone），每个方向独立插件
- **增量更新** — 基于 DirtyFlag 6 级脏标记的增量渲染，避免全量重绘
- **事务系统** — ProseMirror 风格的 Step → Transform → Transaction → State 分层，支持 undo/redo
- **多 Sheet 支持** — WorkbookEditor 管理多个 SheetEditor 实例，共享 StyleEngine/LayoutEngine
- **XMind 兼容** — 存储格式兼容 XMind，支持导入导出
- **主题系统** — 内置 235 色彩主题 + 43 骨架主题，支持 XMind 主题数据

## 项目结构

```
tomind/
├── packages/
│   ├── schema/          # 类型定义（NodeDesc, SelectionState, Viewport）
│   ├── state/           # 状态管理（SheetState, Transaction, Transform, Step）
│   ├── view/            # 视图层（ViewDesc, NodeViewDesc, Renderers）
│   ├── layout/          # 布局引擎（14 种布局算法）
│   ├── style/           # 样式系统（StyleEngine, ThemePackage）
│   ├── extension/       # 扩展系统（createExtension, ExtensionManager）
│   ├── extensions/      # 具体扩展（20+ 个扩展）
│   ├── commands/        # 命令系统（CommandDef, CommandManager）
│   ├── editor/          # 编辑器（SheetEditor, WorkbookEditor）
│   ├── assets/          # 资源管理（stickers, markers, illustrations）
│   ├── formats/         # 格式转换（XMind, FreeMind, OPML, Markdown 等）
│   ├── plugins/         # 插件（history, selection, view-plugin）
│   ├── xap/             # XAP 资源格式
│   └── core/            # 核心 barrel 包（re-export 所有子包）
├── startkits/
│   └── vanilla/         # 默认预装包（组合 core + 扩展）
├── tests/               # 集成测试
├── apps/
│   └── demo/            # 演示应用
└── docs/                # 架构文档
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 类型检查
pnpm typecheck

# 运行测试
pnpm test

# 构建
pnpm build

# 启动 demo
cd apps/demo && pnpm dev
```

## 架构概览

```
Extension.onCreate(ctx)
  → ctx.registerCommand(name, cmdFn)
  → ctx.registerNodeView(name, ViewDescClass)
  → ctx.registerLayout(algorithm)

SheetEditor.dispatch(tr)
  → updateState(newState, tr)
    → layoutEngine.compute(newState)     // 布局只算一次
    → analyzeSteps(tr.steps)             // 推理标脏
    → updateDocView(newDoc, tr)          // 增量更新 ViewDesc 树
      → NodeViewDesc.update()
        → updateStyle() → layoutEngine.getLayoutResult()  // 读缓存
        → updateContent()
```

### 依赖方向

```
@tomind/starter-vanilla
  ├── @tomind/extensions ──→ @tomind/extension
  │                        ──→ @tomind/schema/state/view/layout/style
  └── @tomind/editor ──→ @tomind/state/view/extension/commands
```

原则：**单向依赖，低层包不依赖上层。**

## 扩展开发

参见 [docs/architecture.md](docs/architecture.md) 和 [packages/extensions/README.md](packages/extensions/README.md)。

### 创建扩展

```ts
import { createExtension } from '@tomind/core'

export const MyExtension = createExtension({
  name: 'myExtension',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx) {
    ctx.registerCommand('myCommand', (state, dispatch, args) => {
      if (!dispatch) return true
      // ...
      return true
    })

    return () => { /* cleanup */ }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-m': (ctx) => ctx.executeCommand('myCommand'),
    }
  },
})
```

### 布局扩展

一个大类一个文件夹，index 导出多个独立方向插件：

```
packages/extensions/src/tree/
├── index.ts           → 导出 4 个方向插件
├── tree-right.ts      → TreeRightExtension
├── tree-left.ts       → TreeLeftExtension
├── tree-down.ts       → TreeDownExtension
└── tree-up.ts         → TreeUpExtension
```

## 已有扩展

| 扩展 | 功能 |
|------|------|
| topic | 节点编辑（addChild/addSibling/delete + 导航） |
| keymap | 快捷键管理 |
| viewport | 视口控制（缩放/拖拽/滚轮） |
| selection | 选择管理（点击/框选/多选） |
| history | undo/redo |
| edit-bridge | 双击编辑桥接 |
| collapse | 折叠展开 |
| boundary/summary | 边界框/摘要 |
| relationship | 关联线 |
| copy-paste | 复制粘贴 |
| context-menu | 右键菜单 |
| mini-map | 小地图 |
| drag-handler/draggable | 拖拽 |
| theme-exporter | 主题导出 |
| preset-theme | 预设主题（235 色彩 + 43 骨架主题） |
| assets | 资源管理 |

## 布局算法

| 类型 | 方向 | XMind structureClass |
|------|------|---------------------|
| tree | right/left/down/up | `org.xmind.ui.tree.*` |
| map | clockwise/unbalanced | `org.xmind.ui.map.*` |
| logic | right/left | `org.xmind.ui.logic.*` |
| org-chart | down/up | `org.xmind.ui.org-chart.*` |
| timeline | horizontal/vertical | `org.xmind.ui.timeline.*` |
| fishbone | leftHeaded/rightHeaded | `org.xmind.ui.fishbone.*` |

## 格式支持

| 格式 | 导入 | 导出 |
|------|------|------|
| XMind (.xmind) | ✅ | ✅ |
| FreeMind (.mm) | ✅ | ✅ |
| OPML | ✅ | ✅ |
| Markdown | ✅ | ✅ |
| MindManager | ✅ | — |
| MindNode | ✅ | — |

## 开发规范

- **TypeScript 严格模式** — `strict: true`
- **禁止 `as` 类型断言** — 用类型守卫、泛型或精确类型定义
- **小步增量改动** — 每次改完通过验证
- **测试框架** — vitest，测试文件位于 `tests/` 目录
- **包命名** — `@tomind/<名称>`，扩展包 `@tomind/extension-<名称>`

## 文档

- [架构文档](docs/architecture.md)
- [布局引擎](docs/layout-engine.md)
- [事件系统](docs/EVENT_SYSTEM.md)
- [代码地图](docs/CODEMAP.md)
- [待办事项](docs/TODO.md)

## License

MIT
