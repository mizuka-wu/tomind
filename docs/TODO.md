# TODO — 已知问题与待办事项

> 基于 2026-07-29 全面 Code Review 生成。按优先级排列。

---

## 🔴 P0 — 严重 Bug（已修复）

- [x] **CopyPasteExtension 快捷键死代码** — `Mod-c/v/x` 快捷键定义在 `onCreate` 中但未注册到 `addKeyboardShortcuts()`，用户无法通过快捷键复制粘贴。已修复：添加 `addKeyboardShortcuts()` 返回快捷键映射。
- [x] **topic.edit 命令签名错误** — `edit-bridge.ts` 中 `topic.edit` 命令注册为 `(_params) => ...` 而非 `(state, dispatch, args) => ...`，`dispatch` 丢失导致命令无法分发事务。已修复：改为正确的三参数签名。
- [x] **selection.selectAll 子节点遍历 Bug** — `getAllVisibleNodes()` 中 `typeof child === 'string'` 永远为 false（children 是 `NodeDesc[]`），导致只选中根节点。已修复：改为 `walk(child.id)`。
- [x] **RemoveNodeStep.invert() 生成损坏节点** — `invert()` 返回 `{ id: this.nodeId } as NodeDesc` 缺少 type/attrs/children，undo 会插入损坏节点。已修复：`apply()` 中保存被删节点快照，`invert()` 用快照恢复。
- [x] **dirty-analysis removeNode 步骤不标脏** — 删除节点时父节点不标脏，导致 UI 残留。已修复：标记被删节点 ID 为 `DirtyFlag.ALL`。
- [x] **viewport setupViewportInteractions() 空桩** — 滚轮缩放和拖拽移动从未绑定。已修复：通过 `getContainer` 事件获取 DOM 容器并调用 `setupWheelZoom`/`setupDragMove`。
- [x] **context-menu 事件绑定未注册** — `setupEventHandlers()` 定义处理器但从未注册。已修复：通过 `ctx.on`/`ctx.off` 注册 `contextmenu`/`pointerdown`/`pointerup`/`pointermove` 事件。
- [x] **Transform.filter/map 不重新计算 doc** — 过滤/映射 step 后 doc 和 docs 未重新应用，状态不一致。已修复：从原始 doc 重新应用 filtered/mapped steps。
- [x] **SheetEditor._workbookEditor: any** — 缺乏类型约束。已修复：改为 `WorkbookEditor | null`，添加 `import type`。

---

## 🟡 P1 — 中等问题

### State 层
- [ ] **`exchangeSibling()` 完全空实现** — `transform.ts:138-142`，交换兄弟节点位置无任何逻辑
- [ ] **`WorkbookState.renameSheet()` 空操作** — `workbook-state.ts:104-107`，调用不产生效果
- [ ] **Transaction.docChanged 遗漏 viewport/selection 变更** — 只检查 insertNode/removeNode/updateNode，`SetSelectionStep`/`SetViewportStep` 不触发 docChanged
- [ ] **SheetState.findParent() O(n²) 性能** — 每次遍历整个 `_nodeMap`，应维护 parentMap 缓存
- [ ] **Transaction 继承 Transform** — "是一个"关系但语义不同，导致 9 处 `transform['_meta']` 重复访问。建议改为组合（has-a）

### View 层
- [ ] **NodeViewDesc 静态依赖注入反模式** — 4 个 static 可变全局状态（styleEngine/layoutEngine/state/_eventEmitter），多实例互相干扰
- [ ] **Renderer 封装被破坏** — 多处 `as unknown as { pathRect: Rect | null }` 双断言访问 Renderer 私有字段
- [ ] **`matrix.ts` 类型系统完全缺失** — 所有字段都是 `any`，`MatrixCell.getMinSize()` 不安全属性访问
- [ ] **`RelationshipRenderer.render()` 未实际渲染曲线** — style.stroke 分支为空实现
- [ ] **`ViewDesc.emit()` 事件冒泡无终止机制** — `stopPropagation` 是空函数
- [ ] **`PartViewDesc.update()` 浅比较不可靠** — 对象引用相同但属性变化会被跳过

### Layout 层
- [ ] **布局算法间工具函数大量重复** — `getTitle()`/`getFontSize()`/`isCollapsed()` 等 7 个函数在 6 个文件中重复定义
- [ ] **`measureTextSize()` 简化过度** — `charWidthFactor: 0.6` 对中文粗暴近似（实际 ≈ 1.0），`maxWidth: 200` 硬编码
- [ ] **部分布局忽略 StyleEngine 间距覆盖** — fishbone/logic/org-chart/timeline/map 硬编码使用 `DEFAULT_LAYOUT_OPTIONS`

### Extension 层
- [ ] **`WorkbookEditor.createExtensionContext()` 命令注册委托不稳定** — 委托给活动 Sheet，但活动 Sheet 可能为 null
- [ ] **`ExtensionManager.setup()` 与 `setupExtension()` 快捷键处理不一致** — 后注册扩展的旧式快捷键被忽略
- [ ] **`selection.ts` 模块级缓存变量** — `cachedLayoutResult`/`cachedLayoutState` 多 Sheet 场景下共享缓存
- [ ] **`collapse.ts` 通过 `(tr2 as any).doc = newDoc` 绕过事务变更追踪** — 直接修改 Transaction 私有属性

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
| `map-layout.ts` | 3 | 分支均匀分布验证；unbalanced 偏移量对齐；多层嵌套平衡性 |
| `matrix-layout.ts` | 1 | 行列对齐验证 |

---

## 🟢 P4 — 架构改善

- [ ] **NodeViewDesc 静态注入 → 构造函数注入** — 支持多编辑器实例共存
- [ ] **Transaction 继承 Transform → 组合** — 消除 `_meta` 私有字段访问问题
- [ ] **Renderer 公共 API** — 暴露 `getPathRect()`/`getCircleFill()` 等方法，替代双断言
- [ ] **布局工具函数抽取** — 7 个重复函数提取到 `@tomind/layout/src/utils.ts`
- [ ] **measureTextSize 可配置** — 支持中英文混合宽度计算、CSS white-space 等行为
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
