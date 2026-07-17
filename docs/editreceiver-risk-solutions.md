# EditReceiver Rewrite — High-Risk Area Solutions

> Generated: 2026-06-23
> Context: Migrating from global `<textarea>` EditReceiver to LeaferJS native text editing

---

## Risk 1: Standin (Live Layout Preview During Editing)

### 1.1 Current Architecture Deep-Dive

#### The `standin()` function (`src/utils/branch.ts:380-627`)

**What it clones:**
1. Deep-clones the branch model's JSON (`branchView.model.toJSON()`)
2. Strips children, summaries, and boundaries from the clone (lines 383-385)
3. Assigns a new UUID to the cloned model
4. Creates a fresh `parseTopic()` model from the stripped data
5. Sets the standin model's parent to the original branch's parent

**How the Proxy works (lines 409-429):**

```typescript
const newModel = new Proxy(standinModel, {
  get(target, key) {
    // Hijack _type to return original branch's topic type
    if (key === "_type") return branchView.model.type();
    
    const v = target[key];
    // For all functions except on/once:
    if (isFunction(v) && !["on", "once"].includes(key) && !beforeStandinRemove) {
      return function (...args) {
        v.apply(branchView.model, args);  // ← Apply to ORIGINAL model
        return v.apply(standinModel, args); // ← Apply to STANDIN model
      };
    }
    return v;
  }
});
```

**Critical behavior:** When `beforeStandinRemove === false` (normal editing), every model method call (like `changeTitle`) is **dual-written** to both the original model AND the standin model. When `beforeStandinRemove === true` (during `noSideEffect` calls or during remove), methods only apply to the standin.

**Layout triggers on creation:**
1. `standinBranchView.figure.setLayoutable(false, false)` — standin's own branch layout is frozen
2. `branchView.figure.setLayoutable(false, false)` — original branch layout is frozen
3. `branchView.topicView.setForcedInvisible(true)` — original topic is hidden
4. `branchView.topicView.figure.setLayoutable(false, false)` — original topic layout is frozen
5. Standin's topic view layout remains **active** (not explicitly disabled)

**Change:bounds listener (lines 538-575):**
When the standin's topicView emits `change:bounds` (because text size changed), the listener:
- Calculates a new position to keep the standin centered relative to the original position
- Calls `standinBranchView.setPosition(p)` and `updateRealPosition()`
- For tree-table cells, also updates the cell overlay paths

#### How `updateTextClientSize()` feeds the standin (`editreceiver.ts:661-677`)

```typescript
updateTextClientSize() {
  if (this._dummyTargetBranchView) {
    const transformedText = Util.getTransformedText(
      this._inputElement.value, this.currentTextStyle.textTransform
    );
    // noSideEffect = beforeStandinRemove=true, so Proxy doesn't dual-write
    this._dummyTargetBranchView.noSideEffect(
      this._dummyTargetBranchView.saveEdit, transformedText, { isSilent: true }
    );
    // After layout settles, reposition textarea overlay
    lazyRunner.work(AFTER_EACH, {
      execute: () => { this.updateInputPosition(); this._setInputSize(); }
    });
  }
}
```

**Key insight:** During `noSideEffect`, the Proxy's `beforeStandinRemove=true`, so `saveEdit` only writes to the **standin model**, NOT the original. The original model only gets the final text when `EditReceiver.saveEdit()` is called on edit-end (line 743-748), which calls `this._targetView.saveEdit(value)` on the **original** branchView directly.

#### Dirty-flag chain: Text change → Layout update

```
User types in textarea
  ↓
EditReceiver.onInput() → updateTextClientSize()
  ↓
standin.noSideEffect(standin.saveEdit, text, {isSilent: true})
  ↓
standinModel.changeTitle(text)   [model layer]
  ↓  (model triggers change event → titleView picks up)
TitleView.setText(text)
  ↓
this.text = protectedHandleText(text)  [may transform text]
this.figure.setText(this.text)
  ↓
TitleFigure.setText(): this.text !== text → textDirty=true
  → invalidateLayout()  → dirtyLayout=true → lazyrunner.schedule(LAYOUT)
  → invalidatePaint()   → dirtyPaint=true  → lazyrunner.schedule(RENDER)
  ↓
[LazyRunner flushes LAYOUT priority]
Figure.validateLayout() → layoutWorker.work(titleView)
  ↓
titleLayoutWorker.work():
  1. resolveString(text, fontInfo, maxWidth) → wrapped lines
  2. str2NodesArr(resolvedText, fontInfo) → text nodes
  3. getNodesSize(nodes) → {width, height}  [SVG-based text measurement]
  4. titleView.setSize({width, height})
  ↓
TextView.setSize() → figure.setSize() + figure.setTextSize()
  ↓
TitleFigure.setTextSize(): if size changed → textSizeDirty=true
  → invalidateLayout() (again, but this time for parent chain)
  → invalidatePaint()
  ↓
Parent chain propagation: title's figure.invalidateLayout()
  → topicView.figure.invalidateLayout()
  ↓
topicLayoutWorker.work() → recalculates full topic layout
  → topicView.trigger("change:bounds", bounds)
  ↓
standin's change:bounds listener → repositions standin
```

**Important note on SVG-based text measurement:** The `titleLayoutWorker` uses `utils.str2NodesArr()` + `utils.getNodesSize()` for text measurement — these are NOT LeaferJS measurements. They use SVG DOM measurement (via a hidden SVG container). This is separate from what the LeaferJS `Text` element renders.

#### TitleRenderWorker (`titlerenderworker.ts`)

The `work()` method checks dirty flags on the figure and applies them to a LeaferJS `Text` element:

```typescript
work() {
  if (this.figure.textFnDirty) {
    this.titleText.text = this.figure.textFn;   // function-based text
  } else if (this.figure.textDirty) {
    this.titleText.text = this.figure.text || ""; // plain text
  }
  // Also handles: textColor, textDecoration, textTransform, textAlign,
  // fontSize, fontFamily, fontWeight, fontStyle, textPosition, isVisible
}
```

The `titleText` is a `new Text({ cursor: 'default' })` from LeaferJS. When `.text` is set, LeaferJS internally recalculates the text's bounds — but this is **only for rendering**, not for layout. The layout size computation is handled separately by `titleLayoutWorker` using SVG measurement.

---

### 1.2 Solution A: Keep Standin — Intercept LeaferJS Text Editor Changes

**Concept:** Replace the hidden `<textarea>` with LeaferJS's native text editing on the standin's Text element. Keep the standin architecture for layout preview. Intercept intermediate text changes from the LeaferJS editor and feed them into `standin.saveEdit()`.

**Prerequisites:** LeaferJS 2.x (`^2.1.7`) supports `Editor.openEditText()` for in-place text editing on `Text` elements.

#### Implementation Steps

**1. Create a LeaferJS text editing controller:**

```typescript
// src/modules/editreceiver-leafer.ts (new file)

import type { App, Text as LeaferText } from 'leafer-ui';

interface TextEditController {
  open(textElement: LeaferText, initialText: string, onTextChange: (text: string) => void): void;
  close(): string; // returns final text
  isActive(): boolean;
  getTextElement(): LeaferText | null;
}

export class LeaferTextEditController implements TextEditController {
  private _textElement: LeaferText | null = null;
  private _onTextChange: ((text: string) => void) | null = null;
  private _originalText: string = '';
  private _proxyObserver: (() => void) | null = null;
  
  constructor(private app: App) {}
  
  open(textElement: LeaferText, initialText: string, onTextChange: (text: string) => void) {
    this._textElement = textElement;
    this._originalText = initialText;
    this._onTextChange = onTextChange;
    
    // Use Proxy on the Text element's 'text' property to intercept changes
    // Alternative: use Object.defineProperty to observe text changes
    this._installTextObserver(textElement);
    
    // Trigger LeaferJS native text editing
    this.app.editor.openEditText(textElement);
  }
  
  close(): string {
    if (this._textElement) {
      this.app.editor.closeEditText();
      this._removeTextObserver();
      const finalText = this._textElement.text;
      this._textElement = null;
      return finalText;
    }
    return this._originalText;
  }
  
  isActive(): boolean {
    return this._textElement !== null;
  }
  
  getTextElement(): LeaferText | null {
    return this._textElement;
  }
  
  private _installTextObserver(textElement: LeaferText) {
    // Intercept LeaferJS Text.text setter via Proxy or defineProperty
    // When LeaferJS editor modifies text, we catch it and forward to standin
    let currentText = textElement.text;
    const descriptor = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(textElement), 'text'
    ) || Object.getOwnPropertyDescriptor(textElement, 'text');
    
    if (descriptor?.set) {
      const originalSet = descriptor.set;
      const self = this;
      Object.defineProperty(textElement, 'text', {
        get: descriptor.get ? descriptor.get.bind(textElement) : () => currentText,
        set(value: string) {
          originalSet.call(textElement, value);
          currentText = value;
          self._onTextChange?.(value);
        },
        configurable: true,
        enumerable: true,
      });
      this._proxyObserver = () => {
        // Restore original descriptor
        if (descriptor) {
          Object.defineProperty(textElement, 'text', descriptor);
        }
      };
    }
  }
  
  private _removeTextObserver() {
    this._proxyObserver?.();
    this._proxyObserver = null;
  }
}
```

**2. Modify EditReceiver to use LeaferJS editor + standin:**

```typescript
// In EditReceiver class

show(text: string, targetView: BranchView) {
  if (!targetView) return;
  
  this.updateTargetView(targetView);
  this.semaphoreModule.increase(UI_STATUS.EDIT_TITLE, { forceFlush: true });
  
  // Create standin (same as before)
  this._dummyTargetBranchView = utils.standin(targetView);
  this._dummyTargetBranchView.topicView.on('change:bounds', () => {
    // No need to update textarea size — LeaferJS editor handles this
    // But we may need to scroll viewport if standin goes off-screen
    this._moveViewPortIfOutOfScreen();
  });
  this.selectionManager.selectSingle(this._dummyTargetBranchView);
  
  // Get the LeaferJS Text element from the standin's render worker
  const leaferText = this._dummyTargetBranchView.topicView.titleView
    .figure.renderWorker.titleText;
  
  // Open native LeaferJS text editing
  this._leaferTextEditor.open(leaferText, text, (newText) => {
    // Feed intermediate text into standin for live layout preview
    const transformedText = Util.getTransformedText(
      newText, this.currentTextStyle.textTransform
    );
    this._dummyTargetBranchView.noSideEffect(
      this._dummyTargetBranchView.saveEdit, transformedText, { isSilent: true }
    );
  });
  
  this._hasEdited = true;
}
```

**3. On edit-end (Enter/Escape/blur):**

```typescript
_endEditing() {
  if (!this._dummyTargetBranchView) return;
  
  const finalText = this._leaferTextEditor.close();
  // Save to the ORIGINAL model (not standin)
  this._targetView.saveEdit(finalText);
  
  // Clean up standin (same as current _setHideStyle)
  this._dummyTargetBranchView.remove();
  this._dummyTargetBranchView = null;
  
  this._hasEdited = false;
  this.semaphoreModule.decrease(UI_STATUS.EDIT_TITLE, { forceFlush: true });
}
```

#### Risks for Solution A

| Risk | Severity | Mitigation |
|------|----------|------------|
| LeaferJS `openEditText()` may not expose intermediate text changes via property setter | High | Use MutationObserver on the underlying canvas or hook into LeaferJS editor events (`EditorEvent.TEXT_CHANGE` if available). Fallback: poll `textElement.text` on `requestAnimationFrame`. |
| Property descriptor override on LeaferJS `Text` may break internal LeaferJS state | Medium | Use `editor.on('text', callback)` event if LeaferJS provides it. Otherwise, use a `Proxy` wrapper around the text element. |
| Standin creation is still expensive (model clone + view creation) | Medium | Same as current — no regression. Could optimize by caching standin views. |
| IME (Chinese/Japanese input) composition events may behave differently with LeaferJS editor vs textarea | High | Need to test thoroughly. LeaferJS editor should handle IME natively since it uses a real contenteditable or textarea internally. |
| LeaferJS text editor cursor/selection may conflict with standin's position calculations | Medium | The standin text is set to `opacity: 0` (line 576-580), so the visible editing happens on the LeaferJS native editor overlay. Need to ensure the LeaferJS editor positions correctly relative to the standin. |
| Tree-table cell overlay updates during editing | Low | Same logic as current — the `change:bounds` listener handles this. |

---

### 1.3 Solution B: Eliminate Standin — Direct Layout Invalidation

**Concept:** Remove the standin entirely. Edit the original topic's Text element directly using LeaferJS text editor. When text changes during editing, directly invalidate the topic's layout to reflow all siblings in real-time.

#### Implementation Steps

**1. Remove standin creation from EditReceiver:**

```typescript
// In EditReceiver class

show(text: string, targetView: BranchView) {
  if (!targetView) return;
  
  this.updateTargetView(targetView);
  this.semaphoreModule.increase(UI_STATUS.EDIT_TITLE, { forceFlush: true });
  
  // NO standin — edit the original directly
  // Mark the branch as "editing" to prevent certain interactions
  this._editingBranchView = targetView;
  this._originalText = text;
  
  // Get the LeaferJS Text element from the ORIGINAL topic's render worker
  const leaferText = targetView.topicView.titleView
    .figure.renderWorker.titleText;
  
  // Store original layout flags for restoration
  this._savedLayoutFlags = {
    branchForbidLayout: targetView.figure.forbidInvalidateLayout,
    branchForbidLayoutParent: targetView.figure.forbidInvalidateLayoutParent,
  };
  
  // Open native LeaferJS text editing on the original element
  this._leaferTextEditor.open(leaferText, text, (newText) => {
    this._onIntermediateTextChange(targetView, newText);
  });
  
  this._hasEdited = true;
}

private _onIntermediateTextChange(branchView: BranchView, newText: string) {
  const transformedText = Util.getTransformedText(
    newText, this.currentTextStyle.textTransform
  );
  
  // Directly update the title figure's text (without going through model)
  // This triggers the full layout chain
  const titleView = branchView.topicView.titleView;
  titleView.figure.setText(transformedText);
  
  // The layout chain fires automatically:
  // TitleFigure.setText() → invalidateLayout() → lazyrunner
  // → titleLayoutWorker.work() → compute new size → setTextSize()
  // → topicLayoutWorker.work() → topicView bounds change
  // → branchLayoutWorker.work() → branch bounds change
  // → parent layout → siblings reflow
  
  // After layout settles, ensure viewport follows
  lazyRunner.work(AFTER_EACH, {
    execute: () => this._moveViewPortIfOutOfScreen()
  });
}
```

**2. On edit-end:**

```typescript
_endEditing() {
  if (!this._editingBranchView) return;
  
  const finalText = this._leaferTextEditor.close();
  
  // Save to model (this triggers the normal model→view update chain)
  this._editingBranchView.saveEdit(finalText);
  
  // Restore layout flags if needed
  this._editingBranchView = null;
  this._hasEdited = false;
  this.semaphoreModule.decrease(UI_STATUS.EDIT_TITLE, { forceFlush: true });
}
```

**3. Handle the "original text not changing" problem:**

The current standin architecture has a key benefit: the original model doesn't change during editing (only the standin does). If we eliminate the standin, we need to handle:

- **Undo history:** If the user cancels editing (Escape), we need to revert the text. Currently, the model only changes on edit-end. Without standin, the figure text changes during typing but we need to NOT write to the model until confirmed.
- **Solution:** Only update `figure.text` directly (skip model). On confirm, write to model. On cancel, restore original `figure.text`.

```typescript
// Only update figure, not model
_onIntermediateTextChange(branchView: BranchView, newText: string) {
  const titleView = branchView.topicView.titleView;
  const transformedText = Util.getTransformedText(
    newText, this.currentTextStyle.textTransform
  );
  // Directly set figure text — bypasses model entirely
  titleView.figure.setText(transformedText);
  // Layout chain fires automatically
}

// On cancel:
_cancelEditing() {
  const titleView = this._editingBranchView.topicView.titleView;
  titleView.figure.setText(this._originalText); // Restore
  this._leaferTextEditor.close();
  // Layout will re-compute with original text
}
```

**4. Handle selection visibility:**

Without the standin, there's no separate "editing overlay" branch. The original branch stays visible and editable. We need to:
- Show a visual indicator that the topic is being edited (cursor highlight, border)
- Ensure the topic's shape/background doesn't interfere with the editor

#### Risks for Solution B

| Risk | Severity | Mitigation |
|------|----------|------------|
| Every keystroke triggers FULL layout recalculation (topic → branch → siblings → parent) | High | Performance risk. The layout chain is expensive: titleLayoutWorker → topicLayoutWorker → branchLayoutWorker → parent reflow. Mitigate with layout debouncing (batch updates via `requestAnimationFrame`) or throttle layout to every N keystrokes. |
| LeaferJS text editor may set `.text` on the Text element directly, conflicting with the figure's dirty-flag system | High | The figure's `setText()` sets `textDirty` and calls `invalidateLayout()`. If LeaferJS editor also sets `.text` directly, the figure won't know about the change. Need to intercept ALL text changes through the figure's setter. |
| No visual separation between "editing" and "committed" state | Medium | The standin provides a clear visual separation (standin is the "draft", original is the "committed"). Without it, we need CSS/visual indicators on the original branch. |
| Model/view coupling during editing | Medium | Currently the model only gets the final text. Without standin, if something reads `model.getTitle()` during editing, it would get stale text. Need to either: (a) update model in real-time (like the Proxy dual-write), or (b) ensure nothing reads model title during editing. |
| Race conditions with other layout-triggering operations during editing | Medium | If the user performs another action (e.g., undo) while editing, the layout state could be inconsistent. The standin isolates editing layout from the main tree. |
| Tree-table cell editing (special case in current standin) | Medium | Current standin has special overlay logic for tree-table cells (lines 460-574). Without standin, we'd need to reimplement this as direct overlays on the original branch. |
| Text measurement mismatch | Low | The `titleLayoutWorker` uses SVG-based text measurement. LeaferJS editor may render text slightly differently. The layout preview may not exactly match the editor's rendered text. |

---

### 1.4 Risk 1 Recommendation: **Solution A (Keep Standin)**

**Reasons:**

1. **Proven architecture:** The standin system is battle-tested. It correctly isolates editing layout from the committed tree, handles undo/cancel cleanly, and supports complex cases like tree-table cells.

2. **Performance:** Solution B triggers full layout recalculation on every keystroke against the real tree. The standin limits the blast radius — only the standin's topic re-layouts during editing, and the final layout of the real tree happens once on edit-end.

3. **Clean cancellation:** With standin, cancel is trivial — just remove the standin. With Solution B, we need to restore figure text, re-trigger layout, and handle any side effects.

4. **Lower integration risk:** Solution A only changes the input mechanism (textarea → LeaferJS editor) while keeping the layout plumbing identical. Solution B restructures the entire edit→layout→render pipeline.

5. **Incremental migration:** Solution A can be implemented first, and if performance of the standin becomes an issue, Solution B can be explored later as an optimization.

**The main risk of Solution A** is the LeaferJS text editor integration — specifically, reliably intercepting intermediate text changes. This needs a prototype spike to validate.

---

## Risk 2: Clipboard (Copy/Paste When NOT Editing)

### 2.1 Current Architecture Deep-Dive

#### EditReceiver clipboard handling (`editreceiver.ts`)

**Setup (lines 257-266):**
```typescript
const eventMap = {
  copy: e => this.onCopy(e),
  paste: e => this.onPaste(e),
  cut: e => this.onCut(e),
  // ... other events
};
Object.keys(eventMap).forEach(eventName => {
  this._inputElement.addEventListener(eventName, eventMap[eventName]);
});
```

**Event handlers (lines 968-989):**
```typescript
onCopy(e) {
  if (!this.isVisible()) {   // NOT editing
    e.preventDefault();       // Suppress default textarea copy
    this.trigger('copy', e);  // Emit custom event
  }
  // When editing (isVisible), let default textarea copy work
}

onPaste(e) {
  if (!this.isVisible()) {
    e.preventDefault();
    this.trigger('paste', e);
  }
}

onCut(e) {
  if (!this.isVisible()) {
    e.preventDefault();
    this.trigger('cut', e);
  }
}
```

**Key insight:** The textarea must hold focus at all times for these events to fire. The textarea is positioned at `z-index: -1, opacity: 0` when not editing.

#### CopyPaste module event wiring (`copypaste.ts:538-574`)

```typescript
export class CopyPaste {
  constructor(context) {
    const copyPasteManager = new CopyPasteManager(context);
    
    const editReceiver = context.getModule(MODULE_NAME.EDIT_RECEIVER);
    
    editReceiver.on("copy", (e) => {
      copyPasteManager.copy(e);
    });
    
    editReceiver.on("paste", (e) => {
      if (context.isReadOnly()) return;
      copyPasteManager.paste(e, {
        toImage: true, toMarker: true, toBranch: true, toMathJax: true,
      });
    });
    
    editReceiver.on("cut", (e) => {
      if (copyPasteManager.copy(e)) {
        context.execAction(ACTION_NAMES.DELETE_ITEM);
      }
    });
    
    return copyPasteManager;
  }
}
```

**Event chain:**
```
User presses Ctrl+C (not editing)
  ↓
Hidden <textarea> receives native 'copy' DOM event
  ↓
EditReceiver.onCopy(e):
  - isVisible() === false (z-index ≤ 0)
  - e.preventDefault() — suppresses default browser copy
  - this.trigger('copy', e) — emits via EventEmitter
  ↓
CopyPaste module's listener:
  - editReceiver.on('copy', (e) => copyPasteManager.copy(e))
  ↓
CopyPasteManager.copy(e):
  - Gets selections from SelectionManager
  - Determines type (branch, image, marker, mathjax)
  - clipboardHelper.setDataTransfer(e.clipboardData)
  - Serializes selected topics
  - Writes to e.clipboardData via setData()
```

#### Service layer (`core/services.ts:137-175`)

The `COPY_TO_CLIPBOARD` service is used for **programmatic** copy (not user-initiated):

```typescript
[SERVICE_NAME.COPY_TO_CLIPBOARD]: (() => {
  let textArea: HTMLTextAreaElement;
  
  function createFakeTextArea() {
    const fakeTextArea = document.createElement('textarea');
    context.getAppToolsContainer().appendChild(fakeTextArea);
    fakeTextArea.style.position = 'fixed';
    fakeTextArea.style.top = '-9999px';
    fakeTextArea.setAttribute('readonly', 'true');
    return fakeTextArea;
  }
  
  return (text: string) => {
    if (!textArea) textArea = createFakeTextArea();
    // Copy styles from EditReceiver's textarea
    textArea.setAttribute('style',
      context.getModule<EditReceiver>(MODULE_NAME.EDIT_RECEIVER)
        .getInputDOM().getAttribute('style')
    );
    textArea.style.display = 'none';
    textArea.value = text;
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
  };
})()
```

**Dependency on EditReceiver:** This service uses `editReceiver.getInputDOM()` to copy styles. It also steals focus from the EditReceiver temporarily (with a `reFocus` handler to restore it).

#### KeyBind module (`keybind.ts`)

**No copy/paste shortcuts.** KeyBind only handles:
- Tab, Enter, Delete/Backspace, Z (undo/redo), A (select all)
- Arrow keys (navigation), Space, Esc
- Copy/paste/cut are entirely delegated to the textarea's native DOM events

---

### 2.2 Solution A: Keep Hidden Focus Element (Minimal Version)

**Concept:** Replace the full EditReceiver textarea with a minimal, lightweight focus-capture element. It only needs to: (1) hold focus, (2) capture clipboard events, (3) forward them. When editing starts, the real LeaferJS text editor takes over.

#### Implementation

**1. Create a minimal FocusCaptureElement:**

```typescript
// src/modules/focus-capture.ts (new file)

import { EventEmitter } from '../core/events';

/**
 * Minimal hidden element that holds keyboard focus and captures
 * clipboard events (copy/paste/cut) when not in text-editing mode.
 * 
 * Replaces the full <textarea> that EditReceiver currently uses.
 * When LeaferJS text editor is active, this element releases focus
 * to the LeaferJS editor's internal input.
 */
export class FocusCaptureElement extends EventEmitter {
  private _element: HTMLInputElement;
  private _isActive: boolean = true;
  
  constructor(container: HTMLElement) {
    super();
    
    // Use <input> instead of <textarea> — lighter, no multiline behavior
    this._element = document.createElement('input');
    this._element.setAttribute('class', 'focus-capture');
    this._element.setAttribute('tabindex', '-1');
    this._element.setAttribute('aria-hidden', 'true');
    this._element.setAttribute('data-purpose', 'clipboard-event-capture');
    
    // Style: completely hidden but focusable
    Object.assign(this._element.style, {
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      width: '1px',
      height: '1px',
      opacity: '0',
      pointerEvents: 'none',
      border: 'none',
      padding: '0',
      margin: '0',
    });
    
    container.appendChild(this._element);
    this._bindEvents();
  }
  
  private _bindEvents() {
    // Clipboard events
    this._element.addEventListener('copy', (e) => {
      if (!this._isActive) return;
      e.preventDefault();
      this.trigger('copy', e);
    });
    
    this._element.addEventListener('paste', (e) => {
      if (!this._isActive) return;
      e.preventDefault();
      this.trigger('paste', e);
    });
    
    this._element.addEventListener('cut', (e) => {
      if (!this._isActive) return;
      e.preventDefault();
      this.trigger('cut', e);
    });
    
    // Keyboard events for keybind forwarding
    this._element.addEventListener('keydown', (e) => {
      if (!this._isActive) return;
      this.trigger('keydown', e);
    });
    
    // Focus management
    this._element.addEventListener('focus', (e) => {
      e.preventDefault();
    });
    
    this._element.addEventListener('blur', () => {
      // Auto-refocus if we should be holding focus
      if (this._isActive) {
        requestAnimationFrame(() => {
          if (this._isActive && document.activeElement !== this._element) {
            this._element.focus();
          }
        });
      }
    });
  }
  
  /** Hold focus (default state — not editing) */
  holdFocus() {
    this._isActive = true;
    this._element.focus();
  }
  
  /** Release focus (when LeaferJS text editor takes over) */
  releaseFocus() {
    this._isActive = false;
    this._element.blur();
  }
  
  /** Check if this element currently has focus */
  hasFocus(): boolean {
    return document.activeElement === this._element;
  }
  
  /** Get the DOM element */
  getElement(): HTMLInputElement {
    return this._element;
  }
  
  dispose() {
    this._element.remove();
    this.off();
  }
}
```

**2. Modify CopyPaste to listen to FocusCaptureElement instead of EditReceiver:**

```typescript
// In CopyPaste constructor (copypaste.ts)

export class CopyPaste {
  constructor(context) {
    const copyPasteManager = new CopyPasteManager(context);
    
    if (!context.config(CONFIG.NO_KEYBIND) && !context.config(CONFIG.NO_EDIT_RECEIVER)) {
      const editReceiver = context.getModule(MODULE_NAME.EDIT_RECEIVER);
      
      // These events now come from FocusCaptureElement via EditReceiver
      editReceiver.on("copy", (e) => copyPasteManager.copy(e));
      editReceiver.on("paste", (e) => {
        if (context.isReadOnly()) return;
        copyPasteManager.paste(e, {
          toImage: true, toMarker: true, toBranch: true, toMathJax: true,
        });
      });
      editReceiver.on("cut", (e) => {
        if (copyPasteManager.copy(e)) {
          context.execAction(ACTION_NAMES.DELETE_ITEM);
        }
      });
    }
    
    return copyPasteManager;
  }
}
```

**3. Modify EditReceiver to use FocusCaptureElement:**

```typescript
// In EditReceiver class

constructor(context) {
  super();
  this._context = context;
  
  // Replace textarea with FocusCaptureElement
  this._focusCapture = new FocusCaptureElement(context.getAppToolsContainer());
  
  // Forward clipboard events from focus capture
  this._focusCapture.on('copy', (e) => this.trigger('copy', e));
  this._focusCapture.on('paste', (e) => this.trigger('paste', e));
  this._focusCapture.on('cut', (e) => this.trigger('cut', e));
  this._focusCapture.on('keydown', (e) => this.onKeyDown(e));
  
  this.initEventListener();
}

// When editing starts (LeaferJS editor opens):
show(text, targetView) {
  // ...
  this._focusCapture.releaseFocus(); // Let LeaferJS editor take focus
  // Open LeaferJS native text editing
  this._leaferTextEditor.open(/* ... */);
}

// When editing ends:
_endEditing() {
  // ...
  this._focusCapture.holdFocus(); // Reclaim focus for clipboard events
}
```

**4. Modify services.ts COPY_TO_CLIPBOARD:**

```typescript
// The COPY_TO_CLIPBOARD service needs updating since it references
// editReceiver.getInputDOM(). Replace with clipboard API:

[SERVICE_NAME.COPY_TO_CLIPBOARD]: (() => {
  return async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }
  };
})()
```

#### Risks for Solution A

| Risk | Severity | Mitigation |
|------|----------|------------|
| `<input>` element may not receive `copy`/`paste` events when it has no text selected | Medium | Some browsers only fire clipboard events on elements with selected content. Mitigate by briefly selecting a space character before the copy event. Alternatively, keep using `<textarea>` with minimal content. |
| Focus management between LeaferJS editor and FocusCaptureElement | Medium | LeaferJS text editor likely uses its own hidden input. Need to coordinate focus handoff carefully. Use `releaseFocus()` before opening editor, `holdFocus()` after closing. |
| Mobile touch events may not propagate to hidden element | Low | Current code already handles mobile via gesture events (`doubletap`). Clipboard on mobile uses different mechanisms (long-press menu). |
| `services.ts` COPY_TO_CLIPBOARD style dependency | Low | The service copies styles from `editReceiver.getInputDOM()`. With FocusCaptureElement, these styles are different. But since we're switching to `navigator.clipboard.writeText()`, this is moot. |

---

### 2.3 Solution B: Canvas-Level Clipboard

**Concept:** Listen for clipboard events on the LeaferJS canvas container (or document level). Distinguish "editing text" vs "copying topic" based on whether the LeaferJS text editor is active.

#### Implementation

**1. Register clipboard listeners on the canvas container:**

```typescript
// src/modules/clipboard-listener.ts (new file)

import { EventEmitter } from '../core/events';

export class CanvasClipboardListener extends EventEmitter {
  private _container: HTMLElement;
  private _isEditing: () => boolean;
  
  constructor(container: HTMLElement, isEditingFn: () => boolean) {
    super();
    this._container = container;
    this._isEditing = isEditingFn;
    this._bindEvents();
  }
  
  private _bindEvents() {
    // Listen on the canvas container element
    // LeaferJS renders into a <canvas> inside a wrapper div
    const target = this._container;
    
    target.addEventListener('copy', (e) => this._onClipboardEvent('copy', e));
    target.addEventListener('paste', (e) => this._onClipboardEvent('paste', e));
    target.addEventListener('cut', (e) => this._onClipboardEvent('cut', e));
  }
  
  private _onClipboardEvent(type: string, e: ClipboardEvent) {
    if (this._isEditing()) {
      // User is editing text — let LeaferJS editor handle it
      // The editor's internal input gets the clipboard events
      return;
    }
    
    // Not editing — this is a topic copy/paste
    e.preventDefault();
    this.trigger(type, e);
  }
  
  dispose() {
    // Remove listeners (need to store references for removal)
    this.off();
  }
}
```

**2. Alternatively, use document-level listeners:**

```typescript
// If canvas container doesn't receive clipboard events (because LeaferJS
// uses a separate input element for text editing), use document-level:

document.addEventListener('copy', (e) => {
  if (isEditingText()) return; // Let editor handle it
  if (!isCanvasFocused()) return; // Not our business
  
  e.preventDefault();
  copyPasteManager.copy(e);
}, { capture: true }); // Use capture phase to intercept early
```

**3. Focus management for canvas:**

```typescript
// The LeaferJS App canvas needs to be focusable
const app = new App({ view: canvasElement, ... });

// Make the canvas container focusable
app.view.setAttribute('tabindex', '0');
app.view.style.outline = 'none'; // Remove focus outline

// Focus the canvas when clicking on it
app.view.addEventListener('mousedown', () => {
  if (!isEditingText()) {
    app.view.focus();
  }
});
```

**4. Distinguishing editing vs not-editing:**

```typescript
function isEditingText(): boolean {
  // Check if LeaferJS text editor is active
  // Option 1: Check app.editor state
  if (app.editor && app.editor.target && app.editor.target.tag === 'Text') {
    return true;
  }
  
  // Option 2: Check if LeaferJS's internal input element has focus
  const leaferInput = app.view.querySelector('[contenteditable]');
  if (leaferInput && document.activeElement === leaferInput) {
    return true;
  }
  
  // Option 3: Use a state flag
  return editReceiver.isEditing();
}
```

**5. Integration with CopyPaste module:**

```typescript
// In CopyPaste constructor — no longer needs EditReceiver events

export class CopyPaste {
  constructor(context) {
    const copyPasteManager = new CopyPasteManager(context);
    
    if (!context.config(CONFIG.NO_KEYBIND)) {
      const canvasContainer = context.getSVGView().getCanvasElement();
      
      const clipboardListener = new CanvasClipboardListener(
        canvasContainer,
        () => context.getActiveUIStatus().includes(UI_STATUS.EDIT_TITLE)
      );
      
      clipboardListener.on('copy', (e) => copyPasteManager.copy(e));
      clipboardListener.on('paste', (e) => {
        if (context.isReadOnly()) return;
        copyPasteManager.paste(e, {
          toImage: true, toMarker: true, toBranch: true, toMathJax: true,
        });
      });
      clipboardListener.on('cut', (e) => {
        if (copyPasteManager.copy(e)) {
          context.execAction(ACTION_NAMES.DELETE_ITEM);
        }
      });
    }
    
    return copyPasteManager;
  }
}
```

#### Risks for Solution B

| Risk | Severity | Mitigation |
|------|----------|------------|
| Canvas elements don't receive clipboard events by default | **Critical** | `<canvas>` elements are not text input elements. They don't receive `copy`/`paste` events from keyboard shortcuts. **This is a fundamental limitation.** The events only fire on elements that can hold text selection (inputs, textareas, contenteditable). |
| LeaferJS text editor uses a separate hidden input | High | LeaferJS's text editing likely creates its own hidden `<textarea>` or `contenteditable` div. Clipboard events during editing go to THAT element, not the canvas. When NOT editing, no element has focus → no clipboard events fire. |
| Document-level listeners can't distinguish "our" copy from other apps | Medium | If listening on `document`, we'd catch ALL copy events. Need to check if the event target is within our app, or if the canvas/our container has focus. |
| Race condition: focus transitions between LeaferJS editor and canvas | Medium | When text editing ends, focus needs to move to the canvas (or some focusable element). There's a brief window where no element has focus and clipboard events are lost. |
| Browser security: `e.clipboardData.setData()` only works in response to user-initiated clipboard events | Low | Same as current — not a regression. |
| Multiple sheets/editors on the same page | Low | Need to ensure only the active sheet's clipboard listener responds. |

---

### 2.4 Risk 2 Recommendation: **Solution A (Keep Hidden Focus Element)**

**Reasons:**

1. **Fundamental limitation of Solution B:** Canvas elements don't receive clipboard events. Solution B requires either (a) a hidden focus element anyway (making it equivalent to Solution A), or (b) document-level listeners with fragile focus detection. Neither is cleaner than Solution A.

2. **Proven pattern:** The hidden focus element pattern is widely used by web editors (Google Docs, Figma, Notion). It's the standard approach for intercepting clipboard events in canvas/DOM-hybrid editors.

3. **Minimal change:** Solution A keeps the same event flow (focus element → EditReceiver → CopyPaste), just with a lighter element. The CopyPaste module doesn't need to change at all.

4. **Clean focus handoff:** With `FocusCaptureElement.releaseFocus()` / `holdFocus()`, the focus transitions are explicit and debuggable.

5. **services.ts simplification:** Switching `COPY_TO_CLIPBOARD` to `navigator.clipboard.writeText()` removes the dependency on `editReceiver.getInputDOM()` entirely, which is a net improvement.

**The key improvement over current code:** Replace the `<textarea>` (which carries editing state, IME handling, text selection behavior) with a minimal `<input>` or `<div tabindex="-1">` that only captures clipboard events. The editing responsibility moves entirely to LeaferJS.

**Alternative approach for clipboard:** If we want to eventually remove the hidden element entirely, the path would be:
1. Use LeaferJS's internal editor input as the focus target (it already holds focus during editing)
2. When NOT editing, use `document.addEventListener('copy', ..., { capture: true })` with a focus check on the canvas container (make it `tabindex="0"`)
3. But this still needs the canvas to be focused, and `<canvas>` elements need explicit focus management

This is a future optimization, not needed for the initial migration.

---

## Summary of Recommendations

| Risk Area | Recommended Solution | Key Rationale |
|-----------|---------------------|---------------|
| **Standin (Risk 1)** | **Solution A: Keep Standin** | Battle-tested architecture, clean cancellation, performance isolation. Only changes the input mechanism (textarea → LeaferJS editor). |
| **Clipboard (Risk 2)** | **Solution A: Hidden Focus Element** | Canvas elements can't receive clipboard events. Minimal focus-capture element is the standard pattern. Least change to existing event flow. |

### Implementation Order

1. **Phase 1:** Implement FocusCaptureElement (clipboard) — removes textarea dependency for non-editing state
2. **Phase 2:** Implement LeaferTextEditController — spike to validate text change interception
3. **Phase 3:** Integrate LeaferJS editor with standin system — replace textarea editing with native editing
4. **Phase 4:** Remove EditReceiver's textarea entirely — clean up old code

### Open Questions for Prototype

1. **LeaferJS text change observation:** Does `Editor.openEditText()` fire events when text changes? Can we hook into the `Text.text` setter reliably? This is the #1 unknown for Solution A (Risk 1). **Action:** Write a minimal spike that opens LeaferJS text editing and logs all text changes.

2. **LeaferJS editor focus behavior:** When `openEditText()` is called, does LeaferJS create its own hidden input? Does it steal focus from other DOM elements? How does it handle IME? **Action:** Inspect LeaferJS source or test in browser DevTools.

3. **Clipboard event propagation:** Does a `<input style="display:none">` (or positioned off-screen) receive clipboard events when focused? Test in Chrome, Firefox, Safari. **Action:** Quick cross-browser test.

4. **Performance of standin creation:** The standin involves model cloning, view initialization, and layout setup. How long does this take? If > 16ms, we may need to optimize or pre-create standins. **Action:** Profile `utils.standin()` with Chrome DevTools.
