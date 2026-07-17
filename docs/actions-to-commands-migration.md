# Actions → Commands 迁移报告

> 生成时间：2026-06-26
> 目标：将 editor 层从 Action（直接 mutate model）迁移到 Command（Transaction 模式）

## 概览

| 指标 | 数量 |
|------|------|
| ACTION_NAMES 常量 | **130** |
| Sheet Action 文件 | **150** |
| Workbook Action 文件 | **12** |
| 已有 CommandDef（.command.ts） | **23 文件，~60 命令** |
| execAction 调用点（外部模块） | **~50 处** |

## 架构差异

```
旧模式（Action）:
  UI 事件 → execAction(ACTION_NAME, args)
    → Action.doExecute(args)
      → this._context.getModule(SELECTION).getSelections()  // 取 view
      → target.model.changeTitle(newTitle)                   // 直接 mutate model
      → model 内部触发 undo task + view 事件

新模式（Command）:
  UI 事件 → commandManager.execute(name, params, state, dispatch)
    → CommandDef.execute(params, state, dispatch)
      → 创建 SheetTransaction + Step
      → dispatch(tr)
        → SheetEditorView.dispatch(tr)
          → state.apply(tr) → newState        // 不可变状态更新
          → modelSync(tr)                      // 同步到 model
          → figure.onStepChange(change)        // 通知 view
          → historyPlugin.push(tr)             // undo 栈
```

## 迁移分类

### ✅ 已有 Command 覆盖（~35 个，27%）

这些 Action 已经有对应的 `.command.ts` 定义，但 command 的 execute 还是操作 SheetState，
需要改为调 model 方法或建 modelSync 层。

| Command 文件 | 命令 | 对应 Action |
|---|---|---|
| change-title.command.ts | change_title | CHANGE_TITLE |
| change-style.command.ts | change_style, change_fill_color | SET_STYLE_OBJECT |
| color.command.ts | 6 个颜色命令 | CHANGE_BORDER_COLOR 等 |
| text.command.ts | 8 个文字命令 | CHANGE_FONT_FAMILY 等 |
| font-style.command.ts | change_font_size | CHANGE_FONT_SIZE |
| image.command.ts | 5 个图片命令 | ADD_IMAGE 等 |
| select.command.ts | 4 个选择命令 | SELECT, SELECT_ALL 等 |
| add-topic.command.ts | 3 个添加命令 | ADD_TOPIC_AFTER 等 |
| delete.command.ts | delete_topic | DELETE_ITEM |
| duplicate.command.ts | 2 个复制命令 | DUPLICATE_TOPIC |
| viewport.command.ts | zoom | ZOOM |
| view.command.ts | 4 个视图命令 | MOVE_VIEWPORT 等 |
| relationship.command.ts | 3 个关系命令 | ADD_RELATIONSHIP 等 |
| boundary.command.ts | 3 个边界命令 | ADD_BOUNDARY 等 |
| summary.command.ts | 3 个摘要命令 | ADD_SUMMARY 等 |
| collapse.command.ts | 3 个折叠命令 | COLLAPSE_BRANCHES 等 |
| note.command.ts | 2 个笔记命令 | CHANGE_NOTE |
| marker.command.ts | 3 个标记命令 | CHANGE_MARKER 等 |
| link.command.ts | 2 个链接命令 | CHANGE_HYPER_LINK |
| label.command.ts | 2 个标签命令 | CHANGE_LABEL |
| move.command.ts | 2 个移动命令 | EXCHANGE_SIBLING_TOPIC |
| structure.command.ts | 4 个结构命令 | CHANGE_STRUCTURE 等 |
| sheet.command.ts | 4 个 sheet 命令 | CHANGE_SHEET_TITLE 等 |

### 🟢 简单样式类（~30 个，23%）— 可批量生成

模式统一：遍历选区 → `model.changeStyle(key, value)` 或 `model.set(key, value)`

```
CHANGE_COLOR, CHANGE_SHAPE_COLOR, CHANGE_LINE_COLOR
CHANGE_LINE_WIDTH, CHANGE_LINE_TAPERED, CHANGE_LINE_PATTERN
CHANGE_BORDER_WIDTH, CHANGE_BORDER_PATTERN
CHANGE_START_ARROW_TYPE, CHANGE_END_ARROW_TYPE
CHANGE_BOUNDARY_OPACITY, CHANGE_BOUNDARY_LINE_PATTERN
CHANGE_BOUNDARY_BACKGROUND_COLOR, CHANGE_BOUNDARY_LINE_COLOR
CHANGE_SHAPE_CLASS, CHANGE_FILL_PATTERN
CHANGE_RELATIONSHIP_LINE_COLOR
CHANGE_IMAGE_BORDER_COLOR, CHANGE_IMAGE_BORDER_WIDTH
CHANGE_IMAGE_SHADOW_VISIBLE, CHANGE_IMAGE_LOCK_RATIO, CHANGE_IMAGE_OPACITY
CHANGE_FLOATING_TOPIC_FLEXIBLE
CHANGE_LEGEND_DISPLAY, CHANGE_INFO_ITEM_DISPLAY
CHANGE_TEXT_TRANSFORM, CHANGE_TEXT_DECORATION
```

**迁移方式**：写一个 `makeStyleCommand(name, description, styleKey)` 工厂函数，批量生成。

### 🟡 中等复杂度（~35 个，27%）

| 类型 | Actions | 说明 |
|------|---------|------|
| 结构操作 | ADD_PARENT_TOPIC, ADD_CALLOUT_TOPIC, ADD_FLOATING_TOPIC, DIVIDE, ALIGN | 需调 model 方法 |
| 样式复合 | CHANGE_COMPONENT_PRE_INSTALL_STYLE, CHANGE_COLOR_GRADIENT, CHANGE_FILL_GRADIENT | 多步骤样式 |
| UI 状态 | SHOW_EDIT_BOX, HIDE_EDIT_BOX, FOCUS_INPUT, SHOW_TITLE, HIDE_TITLE | 依赖 view 层 |
| 视口 | SHOW_VIEW_IN_VIEW_PORT, SET_TRANSFORM, SET_DEVICE_SCALE, RESIZE_EDITOR | 操作 LeaferJS |
| 选择 | TOGGLE_SELECT, CLEAR_SELECTION, REMOVE_SELECTION, HIGH_LIGHT_SELECT | 需 SelectionManager |
| 标记 | ADD_CLASS, REMOVE_CLASS, CHANGE_STICKER, CHANGE_COMMENTS_INFO | model 方法调用 |
| 模式 | TOGGLE_COMPACT_MODE, CHANGE_COMPACT_LAYOUT_MODE_LEVEL, CHANGE_HAND_DRAWN_MODE_ACTIVE | editor 配置 |

### 🔴 复杂/跨模块（~30 个，23%）

| 类型 | Actions | 难点 |
|------|---------|------|
| 剪贴板 | COPY, CUT, PASTE, COPY_STYLE, PASTE_STYLE | 依赖 CopyPaste 模块 + 系统剪贴板 |
| Undo/Redo | UNDO, REDO | 两套 undo 系统需协调 |
| 主题 | CHANGE_THEME | 连锁操作（改主题→改所有样式→改手绘模式） |
| 导航 | SELECTION_NAVIGATE, SELECT_TOPIC_BY_ID | 复杂选择逻辑 |
| MathJax | CHANGE_MATH_JAX, RESIZE_MATH_JAX | 特殊渲染 |
| 过滤 | FILTER_BRANCH, COLLAPSE_TO_SPECIFIC_RELATIVE_LAYER, SHOW_BRANCH_ONLY | 递归逻辑 |
| Undo 保护 | OPEN/CLOSE_UNDO_KEEP_MODE | editor 状态 |
| 状态标记 | SHEET_SAVED, SHEET_MODIFIED, WORKBOOK_SAVED, WORKBOOK_MODIFIED | editor 事件 |

## execAction 调用点分布

| 文件 | 调用数 | 主要 Actions |
|------|--------|-------------|
| `modules/keybind.ts` | 18 | ADD_SUB_TOPIC, DELETE_ITEM, UNDO/REDO, SELECT_ALL, EXCHANGE_SIBLING, NAVIGATE |
| `modules/copypaste/copypaste.ts` | 3 | ADD_IMAGE, DELETE_ITEM |
| `modules/dropmanager.ts` | 5 | CHANGE_HYPER_LINK, CHANGE_STICKER, ADD_IMAGE |
| `modules/svgdraggable/topicselectbox.ts` | 1 | CHANGE_TOPIC_CUSTOM_WIDTH |
| `utils/matrixcreateutils.ts` | 2 | SHOW_EDIT_BOX, ADD_SUB_TOPIC |
| `core/sheeteditor.ts` | 2 | ZOOM, MOVE_VIEWPORT |
| `core/workbookeditor.ts` | 1 | SET_MINI_MAP_DISPLAY |

## 需要注意的坑

### 1. 选区获取不兼容
Action 用 `getModule(SELECTION).getSelections()` 返回 view 数组。
Command 需要明确传 `targetId`。
→ **迁移时在调用点先取选区 ID，再传给 Command。**

### 2. Action 内部互相调用（12+ 处）
如 CHANGE_SHAPE_COLOR → CHANGE_COLOR。
→ **Command 内部可以调其他 command，或在 dispatch 层组合。**

### 3. preaction/postaction 钩子
Action 基类支持前置/后置操作。
→ **在 Transaction 层面用 appendTransaction 处理。**

### 4. 两套 Undo 系统
Action 的 UNDO/REDO 调 `undoManager.undo()/redo()`。
Command 系统有自己的 Transaction history。
→ **需要统一为一套。**

### 5. UI 状态耦合
部分 Action 依赖 UI 状态（拖拽中禁用 undo 等）。
→ **Command 的 canExecute 只看数据状态，UI 状态在调用方判断。**

## 推荐迁移路径

### Phase 0：基础设施（本次 worktree）
1. 建 `modelSync` 层：transaction step → model 方法调用
2. SheetEditor 初始化 SheetEditorView + SheetState
3. execAction 改为走 CommandManager + dispatch
4. 用 changeTitle 走通整条链路

### Phase 1：批量生成样式 Command（~25 个）
用 `makeStyleCommand` 工厂函数批量处理纯样式操作。

### Phase 2：结构操作（~10 个）
ADD_PARENT_TOPIC, DELETE_ITEM, DIVIDE 等。

### Phase 3：选择系统（~10 个）
SELECT, SELECT_ALL, SELECTION_NAVIGATE 等。

### Phase 4：复杂模块（~15 个）
COPY/CUT/PASTE, UNDO/REDO, CHANGE_THEME 等。

### Phase 5：Workbook 级别（~10 个）
ADD_NEW_SHEET, REMOVE_SHEET 等。
