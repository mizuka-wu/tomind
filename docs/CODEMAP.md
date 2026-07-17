# CODEMAP — snowbrush-v2 代码地图

> 从 y-mindmap engine 包复制的 Snowbrush v2.47.0 反编译代码，631 个 TS 文件，147,592 行。
> 本文档为重构参考，标记每个模块的职责、依赖、风险和 `any` 使用情况。

---

## 总览

| 指标 | 数据 |
|------|------|
| 总文件数 | 631 |
| 总代码行 | 147,592 |
| `any` 使用 | 1,450 处 (338 文件) |
| 最大文件 | `snowball/lib/data/colorthemes.ts` (30,229行 — 数据文件) |
| 最大业务文件 | `view/branchview.ts` (2,505行), `models/topic.ts` (2,428行) |
| 外部依赖 | Backbone, jQuery, underscore, SVG.js, MobX, animejs, roughjs, Hammer.js, MathJax, CryptoJS |

---

## 目录结构与职责

```
src/
├── state/          # 数据模型 (TopicModel, SheetModel, WorkbookModel, BaseModel)
├── core/           # 基础设施 (events, base-view, abstracteditor, sheeteditor, workbookeditor, services, actions/)
├── formats/        # 格式转换 (import/xmind, export/markdown, lib/bplist-parser)
├── structures/     # 布局算法 (map, tree, timeline, orgchart, spreadsheet)
├── render/         # SVG 渲染 (figure, connectionfigure, layoutengine, renderengine, shapes)
├── view/           # 编辑器视图 (branchview, topicview, svgview, sheetview, indicatorview)
├── modules/        # 功能模块 (uievents, snowball, snowbird, copypaste, draghandler, etc.)
├── utils/          # 纯工具函数 (dom-helpers, native-helpers, browser, file, branch, style, constants/)
└── __tests__/      # 测试 (e2e, vitest)
```

---

## 层间依赖关系

```
                    ┌──────────┐
                    │ actions  │ ← 167 个命令文件
                    └────┬─────┘
                         │ 依赖 models + utils + common
                    ┌────▼─────┐
          ┌─────────┤  models  ├──────────┐
          │         └────┬─────┘          │
          │              │ 依赖 common + utils
          │         ┌────▼──────┐         │
          │         │ structures│         │
          │         └────┬──────┘         │
          │              │ 依赖 utils + common + render + figures
          │         ┌────▼──────┐         │
          │         │  figures  │         │
          │         └────┬──────┘         │
          │              │ 依赖 common + utils + render
          │         ┌────▼──────┐         │
          └────────►│   view    │◄────────┘
                    └────┬──────┘
                         │ 依赖 utils + common + figures + structures + models
                    ┌────▼──────┐
                    │  modules  │
                    └───────────┘
                         │ 依赖 common + utils + view
                    ┌────▼──────┐
                    │   core    │ ← SheetEditor 协调所有模块
                    └───────────┘
```

**独立模块**（无层间依赖）：
- `common/` — 常量和基础工具，被所有层依赖
- `utils/` — 纯工具函数，被所有层依赖
- `dom/` — XML/Entity Map，几乎未使用
- `snowball/` — 主题数据，仅被 stylemanager 使用
- `snowbird/` — 资源数据，仅被 marker/illustration 使用
- `formatconverter/` — 格式转换，仅依赖 `lib/` + JSZip
- `render/` — 连线画笔，被 structures + figures 使用
- `cssjs/` — CSS 注入，仅被 core 使用

---

## 核心模块详解

### 1. core/ — 编辑器核心 (4 文件, 1,811 行)

| 文件 | 行数 | 职责 | `any` |
|------|------|------|-------|
| `sheeteditor.ts` | 932 | **核心协调器** — 注册模块、执行 Action、事件分发 | 10 |
| `workbookeditor.ts` | 331 | 多 Sheet 管理、Sheet 切换 | 5 |
| `abstracteditor.ts` | 341 | 编辑器基类 (extends Backbone.View) | 3 |
| `services.ts` | 207 | 服务容器 (剪贴板、SVG 尺寸等) | 0 |

**SheetEditor 启动流程**：
```
constructor → 注册 15 个模块 → 初始化 SvgView → SheetView → BranchView 树
```

**依赖**：Backbone.View, jQuery, underscore, MobX

---

### 2. models/ — 数据模型 (19 文件, 5,628 行)

| 文件 | 行数 | 职责 | `any` |
|------|------|------|-------|
| `topic.ts` | 2,428 | **最大** — Topic 节点模型 | 5 |
| `sheet.ts` | 980 | Sheet 容器 | 4 |
| `workbook.ts` | 417 | Workbook 管理 | 2 |
| `stylecomponent.ts` | 534 | 样式管理组件 | 3 |
| `base.ts` | 207 | BaseModel (extends Backbone.Model) | 2 |
| `basecomponent.ts` | 289 | BaseComponent (parent/owner 引用) | 1 |
| `extensions.ts` | 128 | 扩展数据 | 1 |
| `theme.ts` | 198 | 主题样式映射 | 2 |
| `relationship.ts` | 175 | 关系线 | 0 |
| `boundary.ts` | 156 | 边界框 | 0 |
| `summary.ts` | 138 | 摘要 | 0 |
| `marker.ts` | 103 | 标记 | 0 |
| `note.ts` | 85 | 备注 | 0 |
| `numbering.ts` | 98 | 编号 | 0 |
| `topicimage.ts` | 112 | 图片 | 0 |
| `href.ts` | 68 | 超链接 | 0 |
| `label.ts` | 62 | 标签 | 0 |
| `legend.ts` | 95 | 图例 | 0 |
| `sheetcomponentfactory.ts` | 183 | 组件工厂 | 6 |

**继承链**：`Backbone.Model → BaseModel → BaseComponent → StyleComponent → TopicModel/SheetModel/...`

---

### 3. view/ — 视图层 (38 文件, 13,189 行)

| 文件 | 行数 | 职责 | `any` |
|------|------|------|-------|
| `branchview.ts` | 2,505 | **最复杂** — 递归分支管理 | 15 |
| `topicview.ts` | 847 | 单个节点渲染 | 10 |
| `sheetview.ts` | 560 | Sheet 容器 (9 个 SVG 组) | 8 |
| `connectionview.ts` | 348 | 连线渲染 | 5 |
| `svgview.ts` | 391 | 根 SVG 画布 (缩放/平移) | 6 |
| `svgcomponentview.ts` | 432 | SVG 组件基类 (extends Backbone.View) | 12 |
| `titleableview.ts` | 285 | 可标题化视图基类 | 3 |
| `relationshipview.ts` | 233 | 关系线视图 | 4 |
| `boundaryview.ts` | 198 | 边界视图 | 2 |
| `summaryview.ts` | 165 | 摘要视图 | 2 |
| `collapseextendview.ts` | 156 | 折叠/展开按钮 | 2 |
| `mathjaxview.ts` | 162 | MathJax 渲染 | 3 |
| `imageview.ts` | 143 | 图片视图 | 2 |
| `labelsview.ts` | 124 | 标签视图 | 1 |
| `markerview.ts` | 108 | 标记视图 | 1 |
| `numberingview.ts` | 89 | 编号视图 | 1 |
| `textview.ts` | 118 | 文本视图 | 2 |
| `indicatorview.ts` | 982 | 指标视图 | 8 |
| 其他 | ~2,800 | 各种辅助视图 | ~20 |

**视图树**：
```
SvgView (根 SVG 画布)
  └── SheetView (9 个容器组)
        ├── BranchContainer → BranchView[] (递归)
        │     ├── TopicView (标题、形状、标记)
        │     ├── ConnectionView (连线)
        │     ├── CollapseExtendView (+/-)
        │     ├── BoundaryView[] (边界)
        │     ├── SummaryView[] (摘要)
        │     └── BranchView[] (子节点递归)
        ├── RelationshipContainer → RelationshipView[]
        ├── BoundaryContainer
        ├── ConnectionContainer
        └── ...
```

---

### 4. figures/ — 渲染管线 (130 文件, 15,658 行)

| 子目录 | 文件数 | 职责 | `any` |
|--------|--------|------|-------|
| `renderengine/svg/renderworkers/` | 32 | SVG 渲染 Worker | ~200 |
| `renderengine/svg/topicshapes/` | 40+ | Topic 形状 (圆角矩形、椭圆、云朵...) | ~80 |
| `layoutengine/` | 13 | 布局 Worker | ~40 |
| `lazyrunner/` | 4 | 惰性执行器 (脏标记 + 延迟执行) | ~10 |
| 根目录 | ~30 | Figure 基类 + 工厂 | ~26 |

**Figure 生命周期**：
```
dirtyLayout → lazyRunner → validatesLayout()
dirtyPaint  → lazyRunner → validatesPaint()
```

---

### 5. structures/ — 布局算法 (43 文件, 6,784 行)

| 类别 | 文件 | 结构类型 |
|------|------|----------|
| 径向 | `map.ts`, `mapclockwise.ts`, `mapanticlockwise.ts`, `mapunbalanced.ts` | Map |
| 层级 | `logicright.ts`, `logicleft.ts`, `logicleftandright.ts` | Logic |
| 树形 | `treeright.ts`, `treeleft.ts`, `treeleftandright.ts` | Tree |
| 组织图 | `orgchartdown.ts`, `orgchartup.ts`, `orgchartupanddown.ts` | OrgChart |
| 时间线 | `timelinehorizontal.ts`, `timelinevertical.ts` + 4 变体 | Timeline |
| 矩阵 | `spreadsheet.ts`, `spreadsheetrow.ts`, `spreadsheetcolumn.ts` | Spreadsheet |
| 鱼骨图 | `fishbonelefthead.ts`, `fishbonerighthead.ts` + 6 变体 | Fishbone |
| 括号 | `braceleft.ts`, `braceright.ts`, `braceleftandright.ts` | Brace |
| 树表 | `treetable.ts`, `treetabletoptitle.ts` | TreeTable |

**基类**：`abstractstructure.ts` (923 行) — 提供 `calAttachedChildrenPos()` 等通用方法

---

### 6. modules/ — 功能模块 (51 文件, 12,249 行)

| 模块 | 文件 | 行数 | 职责 | `any` |
|------|------|------|------|-------|
| SelectionManager | `selectionmanager.ts` | ~400 | 多选、Shift 选择 | 8 |
| Layout | `layout.ts` | ~500 | 异步布局协调 | 5 |
| DragManager | `dragmanager.ts` | ~350 | 拖拽重排序 | 6 |
| DropManager | `dropmanager.ts` | ~200 | 文件/图片拖放 | 3 |
| MoveViewport | `moveviewport.ts` | ~300 | 视口拖拽/滚轮 | 4 |
| KeyBind | `keybind.ts` | ~350 | 键盘快捷键 | 5 |
| MiniMap | `minimap.ts` | ~250 | 小地图 | 3 |
| CopyPaste | `copypaste/` | ~800 | 复制粘贴 (IndexedDB) | 12 |
| AnimationManager | `animationmanager/` | ~400 | animejs 动画 | 6 |
| OverridedStyle | `overridedstyle/` | ~600 | 样式覆盖 (紧凑/手绘) | 8 |
| SvgDraggable | `svgdraggable/` | ~1,500 | SVG 拖拽组件 | 15 |
| EditReceiver | `editreceiver.ts` | 1,076 | 编辑操作接收器 | 10 |
| DragHandler | `draghandler/` | ~800 | 6 种拖拽处理器 | 12 |
| 其他 | ~8 文件 | ~2,000 | UI 状态、信号量、修改检查 | ~20 |

---

### 7. actions/ — 命令系统 (167 文件, 8,106 行)

**命名模式**：
- 节点操作：`add-sub-topic`, `add-topic-after`, `add-parent-topic`, `remove-topic`, `select`
- 样式操作：`change-color`, `change-font-family`, `change-structure`, `set-style-object`
- 结构操作：`add-boundary`, `add-summary`, `add-relationship`
- 编辑操作：`copy`, `cut`, `paste`, `delete-item`, `undo`, `redo`
- 视图操作：`zoom`, `fit-map`, `center`, `show-branch-only`, `set-transform`

**执行流程**：
```
SheetEditor.execAction(name, args)
  → Action.doExecute(args)
    → Model method (e.g., topic.addChildTopic)
      → Model.set('attr', newValue)
      → topicChanged() / sheetChanged()
      → EVENTS.AFTER_SHEET_CONTENT_CHANGE
      → UndoManager.add({undo, redo})
```

---

### 8. formatconverter/ — 格式转换 (14 文件, 7,403 行)

| 功能 | 文件 | 行数 |
|------|------|------|
| XMind 导入 | `import/xmind.ts` | 1,932 |
| MindManager 导入 | `import/mindmanager.ts` | 1,277 |
| Markdown 导入/导出 | `import/markdown.ts` + `export/markdown.ts` | 947 + 312 |
| Freemind 导入 | `import/freemind.ts` | 345 |
| OPML 导入/导出 | `import/opml.ts` + `export/opml.ts` | 267 + 198 |
| MindNode 导入 | `import/mindnode.ts` | 378 |
| Lighten 导入 | `import/lighten.ts` | 289 |
| XMind 导出 | `export/xmind.ts` | 456 |
| 工具函数 | `lib/utils.ts` + `lib/constant.ts` | ~400 |
| 加密/解密 | `lib/bplist-parser.ts` | 300 |

**入口**：`formatconverter.fromXMind(zip, options)` → Promise

---

### 9. render/ — 渲染技术 (21 文件, 2,570 行)

| 文件 | 职责 |
|------|------|
| `brushes.ts` | 连线画笔 (Curve, Straight, Elbow, Horn, Sinus, Brace) |
| `topiclinestyle/` | 18 种 Topic 线条样式 |
| `relationshiplinetype.ts` | 关系线类型 |
| `summarylinestyle.ts` | 摘要线样式 |

---

### 10. common/ — 常量和基础 (29 文件, 2,338 行)

| 文件 | 职责 |
|------|------|
| `constants/index.ts` | 统一导出所有常量 |
| `constants/events.ts` | 事件常量 |
| `constants/structures.ts` | 结构常量 |
| `constants/styles.ts` | 样式常量 |
| `constants/models.ts` | 模型常量 |
| `constants/modules.ts` | 模块常量 |
| `config.ts` | 全局配置 |
| `undo.ts` | UndoManager (分组 undo/redo) |
| `utils/` | 基础工具 (bounds, point, number, syntax, base-event) |

---

### 11. lib/ — SVG 引擎 (4 文件, 4,356 行)

| 文件 | 行数 | 职责 |
|------|------|------|
| `svg.source.ts` | 3,878 | **自定义 svg.js 分支** — 核心 SVG 操作 |
| `svgpolyfill.ts` | 234 | SVG Polyfill |
| `svg2png.ts` | 178 | SVG 转 PNG |
| `index.ts` | 66 | 导出 |

---

### 12. snowball/ + snowbird/ — 资源数据 (31 文件, 47,230 行)

大部分是 JSON 数据文件：
- `snowball/lib/data/colorthemes.ts` — 30,229 行 (颜色主题)
- `snowball/lib/data/skeletonthemes.ts` — 6,980 行 (骨架主题)
- `snowbird/lib/stickers/stickers.ts` — 1,471 行 (贴纸)
- `snowbird/lib/markers/markers.ts` — 1,412 行 (标记)

---

## `any` 分布热力图

| 目录 | `any` 数 | 占比 |
|------|----------|------|
| `figures/` | 356 | 24.5% |
| `view/` | 247 | 17.0% |
| `actions/` | 241 | 16.6% |
| `modules/` | 209 | 14.4% |
| `formatconverter/` | 147 | 10.1% |
| `utils/` | 120 | 8.3% |
| `models/` | 28 | 1.9% |
| `core/` | 18 | 1.2% |
| 其他 | 84 | 5.8% |

**优先级**：figures > view > actions > modules > formatconverter > utils

---

## 外部依赖使用分布

### Backbone (19 直接导入, 752+ 间接调用)

| 用途 | 调用数 | 主要位置 |
|------|--------|----------|
| `.get(attr)` | 293 | models/(136), view/(41) |
| `.trigger(event)` | 223 | models/(128), modules/(43) |
| `this.model` | 215 | view/(136), models/(45) |
| `this.listenTo` | 139 | view/(111), modules/(12) |
| `.set(attr, val)` | 131 | models/(84) |
| `.on/.off` | 105 | 全局 |
| `backbone.Events` 混入 | 12 | modules/ |
| `backbone.View` 继承 | 5 | view/ + core/ |

### jQuery (20 文件, 54 调用)

| 用途 | 文件数 | 主要位置 |
|------|--------|----------|
| `jquery(...)` 包装 | 20 | imageexporter(20), modules(13), core(6) |

### underscore (48 文件, 102 调用)

| 用途 | 调用数 | 替代方案 |
|------|--------|----------|
| `_.extend` | 28 | `Object.assign` |
| `_.each` | 19 | `forEach` |
| `_.isEmpty` | 18 | 原生判断 |
| `_.isEqual` | 7 | 深比较函数 |
| `_.pick` | 4 | `Object.fromEntries` |
| 其他 | 26 | 均有原生替代 |

---

## 重构优先级建议

### Phase 1: 最小可运行 (先跑起来)
1. `formatconverter/` — xmind 导入，验证数据解析
2. `models/` — 数据模型，去掉 Backbone.Model
3. `common/` — 常量和 UndoManager

### Phase 2: 核心引擎
4. `core/events.ts` — EventEmitter 替代 Backbone.Events
5. `core/base-model.ts` — BaseModel 替代 Backbone.Model
6. `structures/` — 布局算法 (依赖少，相对独立)

### Phase 3: 渲染层
7. `figures/` — 渲染管线 (最大 `any` 热区)
8. `render/` — 连线画笔
9. `view/` — 视图层

### Phase 4: 功能模块
10. `modules/` — 功能模块
11. `actions/` — 命令系统

### Phase 5: 清理
12. 移除 `snowball/` + `snowbird/` 中的内联数据 → 外部 JSON
13. 移除 `dom/` 中未使用的文件
14. 清理 `lib/svg.source.ts` → 考虑替换为标准 svg.js
