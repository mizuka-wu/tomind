# TODO — 已知问题与待办事项

> 基于 2026-07-29 全面 Code Review 生成，2026-08-24 更新。按优先级排列。

---

## ✅ 已完成

### P0 — 严重 Bug（已修复）
- [x] CopyPasteExtension 快捷键死代码
- [x] topic.edit 命令签名错误
- [x] selection.selectAll 子节点遍历 Bug
- [x] RemoveNodeStep.invert() 生成损坏节点
- [x] dirty-analysis removeNode 步骤不标脏
- [x] viewport setupViewportInteractions() 空桩
- [x] context-menu 事件绑定未注册
- [x] Transform.filter/map 不重新计算 doc
- [x] SheetEditor._workbookEditor: any

### 布局系统重写（2026-08-24）
- [x] **P0: 自适应 spacingMinor** — 对齐 snowbrush getMinSumTopicSpacing
- [x] **P0: 权重平衡左右分配** — 对齐 snowbrush calcNumRight
- [x] **P1: 扇形外扩** — 子节点≥8个时自动撑开（calcOutwardDistance）
- [x] **P1: X offset 子树对齐** — 对齐 snowbrush getMapOfXOffSetByBranchIndex
- [x] **P2: mapAnticlockwise 变体** — 前 N 个子节点在左侧
- [x] **P2: mapUnbalanced 变体** — 支持 attrs.numRight 手动分割点
- [x] **公共模块提取** — layout-utils.ts（7 个共享函数 + measureSimpleNode/Subtree）
- [x] **布局工具函数抽取** — 消除 12 个文件中的重复代码（净减 ~600 行）

### 架构改善（2026-08-24）
- [x] `exchangeSibling()` 完全空实现 — 已实现兄弟节点交换逻辑
- [x] `WorkbookState.renameSheet()` 空操作 — 已实现重命名逻辑
- [x] SheetState.findParent() O(n²) 性能 — 已维护 parentMap 缓存
- [x] NodeViewDesc 静态依赖注入反模式 — 已改为构造函数注入
- [x] Renderer 封装被破坏 — 已暴露公共 API
- [x] `matrix.ts` 类型系统完全缺失 — 已重建类型系统
- [x] `RelationshipRenderer.render()` 未实际渲染曲线 — 已实现曲线渲染
- [x] `ViewDesc.emit()` 事件冒泡无终止机制 — 已实现 stopPropagation
- [x] `PartViewDesc.update()` 浅比较不可靠 — 已改为深比较
- [x] `WorkbookEditor.createExtensionContext()` 命令注册委托不稳定 — 已修复
- [x] `ExtensionManager.setup()` 与 `setupExtension()` 快捷键处理不一致 — 已统一
- [x] `collapse.ts` 通过 `(tr2 as any).doc = newDoc` 绕过事务变更追踪 — 已修复
- [x] NodeViewDesc 静态注入 → 构造函数注入 — 已完成
- [x] Renderer 公共 API — 已暴露 `getPathRect()`/`getCircleFill()` 等方法

### 功能实现（2026-08-01 ~ 08-23）
- [x] 25+ topic shapes + 16 link styles + 13 boundary shapes + 10 arrow types
- [x] Numbering 功能（NumberingPlugin + NumberingExtension）
- [x] colord 替代 tinycolor2
- [x] Part-Aware Layout 系统（cell-layout + part-measure + part-cell-builder + part-node-size）
- [x] ImageData 扩展对齐 snowbrush（7 个新属性）
- [x] Note 富文本渲染（realHTML 格式）
- [x] Comments 功能（CommentData + CommentsExtension）
- [x] Labels 流式布局 + tooltip + 去重 + 溢出 "N+"
- [x] Legend 图例渲染器
- [x] handDrawnEllipse 形状
- [x] 括号/引号形状（8 个）
- [x] 所有 PartView 通过 Extension 注册（5 个 Extension）

---

## 🔴 P0 — 当前阻塞

无

---

## 🟡 P1 — 中等问题

### State 层
- [ ] **Transaction.docChanged 遗漏 viewport/selection 变更** — 只检查 insertNode/removeNode/updateNode，`SetSelectionStep`/`SetViewportStep` 不触发 docChanged
- [ ] **Transaction 继承 Transform** — "是一个"关系但语义不同，导致 9 处 `transform['_meta']` 重复访问。建议改为组合（has-a）。✅ meta getter 已添加，组合重构待完成

### View 层

无（全部已完成）

### Layout 层
- [x] **部分布局忽略 StyleEngine 间距覆盖** — fishbone/logic/org-chart/timeline 已接入 styleEngine spacingMajor/spacingMinor
- [x] **其他布局的 part-aware 测量** — logic/org-chart/fishbone 已接入 part-aware 测量
- [ ] **measureTextSize 可配置** — 支持中英文混合宽度计算、CSS white-space 等行为

### Extension 层
- [x] **`selection.ts` 模块级缓存变量** — `cachedLayoutResult`/`cachedLayoutState` 多 Sheet 场景下共享缓存（已修复：改为每次重新计算）

无（除 selection.ts 已标记外，其余已完成）

---

## 🟢 P2 — `as` 断言清理（项目规范禁止）

全局约 **375+ 处** `as` 类型断言违规：

| 包 | 违规数 | 高频模式 |
|----|--------|----------|
| `packages/schema/` | ~5 | `attrs.attributeTitle as ...` |
| `packages/state/` | ~16 | `transform['_meta'] as Map`（9处） |
| `packages/commands/` | ~2 | `(cmd as { name: string }).name = name` |
| `packages/view/` | ~40+ | `(this as any)._contentGroup`、双断言访问 Renderer |
| `packages/layout/` | ~19 | `node.attrs.style as Record<string, unknown>` |
| `packages/extensions/` | ~270 | `state as SheetState`（几乎所有命令） |
| `packages/extension/` | ~15 | — |
| `packages/editor/` | ~18 | `_workbookEditor: any` |

**重点消除清单：**
1. `Transaction` 中 9 处 `transform['_meta']` — 在 Transform 中添加 `get meta()` getter
2. `ExtensionContext.getState()` 返回 `unknown` — 泛型化 state 类型
3. `NodeViewDesc` 双断言访问 Renderer — Renderer 暴露公共 API
4. `matrix.ts` 全文件 `any` — 重建类型系统

---

## 🟢 P3 — 布局算法 TODO

每个布局文件中的 TODO 为与原生效果对齐的验证项：

| 文件 | TODO 数 | 内容 |
|------|---------|------|
| `tree-layout.ts` | 3 | 间距/偏移对齐；折叠 branchHeight 验证；summary/boundary 联动 |
| `fishbone-layout.ts` | 2 | 斜线角度/间距对齐；leftHeaded/rightHeaded 对称性 |
| `logic-layout.ts` | 2 | 间距对齐；子分支垂直堆叠间距验证 |
| `org-chart-layout.ts` | 2 | down/up 对齐；多层嵌套水平居中验证 |
| `timeline-layout.ts` | 2 | 交替排列验证；时间线轴线偏移量 |
| `map-layout.ts` | 0 | ✅ 全部完成 |
| `matrix-layout.ts` | 1 | 行列对齐验证 |

---

## 🟢 P4 — 架构改善

- [ ] **Transaction 继承 Transform → 组合** — 消除 `_meta` 私有字段访问问题
- [ ] **ExtensionContext 泛型化 state** — `getState<T>()` 替代 `getState(): unknown`
- [ ] **`TopicData` 旧类型清理** — `types.ts:194-253` 标记为迁移用，设 deadline 删除

---

## 📋 Review 修改记录

| 日期 | 修改 | 文件 |
|------|------|------|
| 2026-07-29 | CopyPasteExtension 添加 addKeyboardShortcuts | `copy-paste.ts` |
| 2026-07-29 | topic.edit 命令签名修复 | `edit-bridge.ts` |
| 2026-07-29 | selection.selectAll 遍历修复 | `selection.ts` |
| 2026-07-29 | dirty-analysis removeNode 标脏 | `dirty-analysis.ts` |
| 2026-07-29 | RemoveNodeStep.invert() 保存被删节点 | `step.ts` |
| 2026-07-29 | Transform.filter/map 重新计算 doc | `transform.ts` |
| 2026-07-29 | viewport setupViewportInteractions 接入事件 | `viewport.ts` |
| 2026-07-29 | context-menu 事件注册 | `context-menu.ts` |
| 2026-07-29 | SheetEditor._workbookEditor 类型修复 + getContainer 事件 | `sheet-editor.ts` |
| 2026-08-24 | Map 布局系统重写（P0/P1/P2） | `map-layout.ts` |
| 2026-08-24 | 公共模块 layout-utils.ts 提取 | `layout-utils.ts` + 14 files |
