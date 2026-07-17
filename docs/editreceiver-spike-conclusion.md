# Spike 结论：LeaferJS 文本编辑器集成可行性

> Date: 2026-06-23

## 验证结果

### ✅ 可行 — setter 劫持方案有效

**核心发现：** `@leafer-in/text-editor` 的 `TextEditor.onInput()` 直接设置：
```js
this.editTarget.text = this.isHTMLText ? editDom.innerHTML : editDom.innerText;
```
这意味着通过 `Object.defineProperty` 劫持 `Text.text` 的 setter，可以拦截所有中间文字变更。

### ✅ 可行 — 编辑器 UI 可配置

`editor: { selector: false }` 配置阻止了编辑器选择 UI（选框、控制点）的渲染。文本编辑功能（`contentEditable` div 覆盖层）独立于选择 UI，仍可正常工作。

### ✅ 可行 — 事件系统完整

`InnerEditorEvent` 提供四个生命周期事件：
- `BEFORE_OPEN` — 编辑器即将打开
- `OPEN` — 编辑器已打开
- `BEFORE_CLOSE` — 编辑器即将关闭
- `CLOSE` — 编辑器已关闭

事件会同时在 `app` 和 `editTarget`（Text 元素）上触发。

### ⚠️ 已知问题

1. **HMR 模块加载顺序**：开发模式下 HMR 时，`@leafer-in/text-editor` 可能在 `@leafer-in/editor` 之前加载，导致 "please install and import plugin" 错误。生产构建不会有此问题。

2. **Enter 键行为**：TextEditor 默认 Enter 插入 `<br>` 换行。Snowbrush 的 BranchView 编辑需要 Enter 保存。需要通过 `onKeydown` 拦截或配置覆盖。

3. **Esc 键行为**：TextEditor 默认 Esc 关闭编辑器（调用 `editor.closeInnerEditor()`）。需要在此时触发 `saveEdit()` 流程。

## 技术方案确认

### Risk 1: Standin — ✅ setter 劫持方案

```
LeaferJS 编辑器用户输入
  ↓
TextEditor.onInput() → editTarget.text = newText
  ↓ (被 defineProperty setter 拦截)
EditBridge.onTextChange(newText)
  ↓
standin.noSideEffect(standin.saveEdit, transformedText, {isSilent: true})
  ↓
standin 重新布局 → change:bounds → 其他节点让位
```

### Risk 2: Clipboard — ✅ 隐藏 input 方案

保留一个隐藏的 `<input>` 元素，用于：
- 持有焦点以接收键盘事件
- 捕获 copy/paste/cut DOM 事件
- 转发给 CopyPasteManager

编辑时释放焦点给 LeaferJS 的 `contentEditable` div。

## 实施步骤

1. **配置 App** — `editor: { selector: false }` + 导入插件
2. **Text 元素设 editable: true** — 在各 render worker 中
3. **创建 EditBridge** — 监听 InnerEditorEvent，管理 standin 生命周期
4. **setter 劫持** — 在编辑开始时安装，编辑结束时移除
5. **键盘映射** — Enter 保存、Esc 取消、Ctrl+Enter 换行
6. **隐藏 input** — 焦点管理 + 剪贴板事件转发
7. **删除 EditReceiver** — 清理旧代码
