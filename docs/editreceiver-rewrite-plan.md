# EditReceiver → LeaferJS Native Text Editor: Technical Design Document

> **Date:** 2026-06-23  
> **Status:** Draft  
> **Goal:** Replace the 1078-line global `<textarea>` EditReceiver with LeaferJS native inline text editing via `@leafer-in/editor` + `@leafer-in/text-editor`.

---

## Table of Contents

1. [Current Architecture Summary](#1-current-architecture-summary)
2. [Detailed Findings](#2-detailed-findings)
3. [Proposed New Architecture](#3-proposed-new-architecture)
4. [Step-by-Step Migration Plan](#4-step-by-step-migration-plan)
5. [Interface Changes Needed](#5-interface-changes-needed)
6. [Risk Areas and Mitigations](#6-risk-areas-and-mitigations)
7. [Effort Estimates](#7-effort-estimates)

---

## 1. Current Architecture Summary

### 1.1 Overview

The current edit system uses a single global `<textarea>` DOM element (`EditReceiver` class, 1078 lines) appended to `context.getAppToolsContainer()`. When a user double-clicks a topic/boundary/relationship/matrix-label/legend-marker, the textarea is:

1. Repositioned over the target element via CSS `left`/`top` + `transform: scale()`
2. Styled to match the target's font properties (fontSize, fontFamily, fontWeight, etc.)
3. Sized to match the target's text bounds
4. Focused to receive keyboard input

On save (Enter, blur, Tab, Esc), the textarea's `.value` is forwarded to `targetView.saveEdit(text)` which calls `model.changeTitle(newText)`.

### 1.2 Key Files

| File | Lines | Role |
|------|-------|------|
| `src/modules/editreceiver.ts` | 1078 | Global textarea controller |
| `src/view/titleview.ts` | 157 | Title rendering (extends TextView) |
| `src/view/textview.ts` | 140 | Base text view with LeaferJS Text figure |
| `src/render/titlefigure.ts` | 164 | Dirty-flag based figure state |
| `src/render/renderengine/svg/renderworkers/titlerenderworker.ts` | 113 | Creates `new Text()` from leafer-ui |
| `src/render/renderengine/svg/renderworkers/boundarytitlerenderworker.ts` | 83 | Boundary-specific: Group + Path bg + Text |
| `src/render/renderengine/svg/renderworkers/relationshiptitlerenderworker.ts` | 35 | Relationship title: direct Text |
| `src/render/renderengine/svg/renderworkers/matrixlabelrenderworker.ts` | 30 | Matrix label: Group + Text |
| `src/utils/branch.ts` (standin fn) | ~250 | Dummy branch view for live preview |
| `src/modules/index.ts` | 73 | Module registration |
| `src/core/sheeteditor.ts` | 852 | Module instantiation + event wiring |
| `src/core/actions/sheet/show-edit-box.ts` | 54 | ShowEditBox action |
| `src/core/actions/sheet/hide-edit-box.ts` | 15 | HideEditBox action |
| `src/core/actions/sheet/repair-edit-receiver-position.ts` | 28 | Repair position on scale change |
| `src/core/actions/sheet/focus-input.ts` | 32 | Focus the textarea |
| `src/core/services.ts` | 179 | Copy service uses editReceiver.getInputDOM() |
| `src/modules/copypaste/copypaste.ts` | 574 | Listens to editReceiver copy/paste/cut events |
| `src/modules/svgdraggable/view/selectbox.ts` | 880 | Boundary "add title" button calls editReceiver.show() |

### 1.3 Data Flow Diagram (Current)

```
User dbl-click → _onViewDbClick(e)
  → getView(e.currentTarget) → sbView
  → sbView.getEditContent() → current text string
  → EditReceiver.show(text, sbView)
    → semaphore.increase(EDIT_TITLE)
    → if BranchView: utils.standin(branchView) → dummyTargetBranchView
      → hide original topicView, show standin
      → standin model proxies writes to both models
    → textarea.value = text
    → textarea.style = match font/position/zoom
    → textarea.focus()

User types → onInput(e)
  → _hasEdited = true
  → if standin: standin.saveEdit(transformedText, {isSilent:true})
    → standin re-renders → layout adjusts → positions update
  → updateInputPosition() + _setInputSize()

User Enter → saveEdit() → _setHideStyle()
  → _targetView.saveEdit(textarea.value)
    → model.changeTitle(newText)
  → if standin: standin.remove() → restore original branchView
  → semaphore.decrease(EDIT_TITLE)

User blur → saveEdit() → _setHideStyle()
```

---

## 2. Detailed Findings

### 2.1 Title Elements — How Text Is Rendered

**All text in the system is already rendered as LeaferJS `Text` elements.**

- `TextView` creates a `TitleFigure` which uses `TitleRenderWorker`
- `TitleRenderWorker.initSVGStructure()` does:
  ```ts
  this.titleText = new Text({ cursor: 'default' })
  this.svg = this.titleText
  ```
- The `Text` element is a native `leafer-ui` Text with properties: `text`, `fill`, `fontSize`, `fontFamily`, `fontWeight`, `italic`, `textDecoration`, `textAlign`

**Variants:**
- **Topic title**: `TopicTitleFigure → TitleRenderWorker` — plain `new Text()`
- **Boundary title**: `BoundaryTitleFigure → BoundaryTitleRenderWorker` — `new Group()` containing `Path` (background) + `Text`
- **Relationship title**: `RelationshipTitleFigure → RelationshipTitleRenderWorker` — direct `new Text()` with `data-name="relationship-title"`
- **Matrix label**: `MatrixLabelRenderWorker` — `new Group()` containing `Text`

**Key insight:** Since the underlying elements are already `leafer-ui` Text objects, they can potentially support `editable: true` directly. However, `@leafer-in/text-editor` is not yet installed.

### 2.2 Edit Flow — Detailed Trace

#### What calls `show()` on EditReceiver?

| Caller | Trigger | Code |
|--------|---------|------|
| `_onViewDbClick(e)` | Double-click on Branch/Boundary/Relationship/MatrixLabel/LegendMarkerList | `this.show(sbView.getEditContent(), sbView)` |
| `onInput(e)` | Typing while textarea hidden + selection exists | `this.show(null, this._targetView)` |
| `onKeyDown → SPACE` | Space key while not editing | `this.show(this._targetView.getEditContent(), this._targetView)` |
| `onKeyDown → KEY_IN_COMPOSING` | IME input while not editing | `this.show(null, this._targetView)` |
| `ShowEditBoxAction.doExecute()` | External action call | `editReceiver.show(placeholder, target)` |
| `SelectBox.registerAddTitleButtonOnClickEvent()` | Click "add title" button on boundary | `editReceiver.show(this.refView.getEditContent(), this.refView)` |

#### What calls `saveEdit()`?

| Caller | Trigger |
|--------|---------|
| `onBlur(e)` | Textarea loses focus |
| `onKeyDown → ENTER` | Enter key (no Ctrl/Meta modifier) |
| `onKeyDown → TAB` | Tab key while editing |
| `onKeyDown → ESC` | Escape key while editing |
| `hide(notSaveEdit?)` | External hide call (unless `notSaveEdit=true`) |

#### How does edited text get back to the data model?

```
EditReceiver.saveEdit()
  → this._targetView.saveEdit(this._inputElement.value)

Per view type:
  BranchView.saveEdit(newText)     → this.model.changeTitle(newText)
  BoundaryView.saveEdit(newText)   → this.model.changeTitle(newText)
  RelationshipView.saveEdit(newText) → this.model.changeTitle(newText)
  MatrixLabelView.saveEdit(newText) → cell.items.forEach(v => v.model.changeLabel(newText))
  LegendMarkerListView.saveEdit(newText) → parent.legend.setUserMarkerDescription(id, newText)
```

#### What is `getEditContent()`?

Returns the current text content from the data model:
- **BranchView**: `this.model.getTitle()`
- **BoundaryView**: `this.model.get("title") || ""`
- **RelationshipView**: `this.model.get("title") || ""`
- **MatrixLabelView**: `this.text || context.getTranslatedText("LABEL_TITLE")`
- **LegendMarkerListView**: `this._markerDesc`

### 2.3 Dummy Branch View — `utils.standin()`

**Location:** `src/utils/branch.ts` lines 380–627

**What it does:**
1. Deep-clones the branch model data (without children/summaries/boundaries)
2. Creates a new `standinModel` with `parseTopic()`
3. Wraps it in a `Proxy` that forwards all method calls to **both** the standin and the original model
4. Creates a new `BranchView(standinModel)` — the "standin branch view"
5. Hides the original branch's topicView (`setForcedInvisible(true)`)
6. Sets the standin to the same position/bounds as the original
7. On `change:bounds` from the standin's topic view, adjusts standin position to stay centered
8. On standin `remove()`, restores the original branch view's layout state

**Why it's needed:**
The standin provides **live preview of layout changes during editing**. As the user types, the standin's text changes trigger real layout calculations (text wrapping, topic resizing, child repositioning), visible to the user in real-time. The original branch view stays frozen and hidden. When editing completes, the standin is removed and the original is restored — but now the model has the updated text, so the next layout pass picks up the changes.

**Can it be eliminated with LeaferJS editing?**
**Partially.** LeaferJS native text editing operates on the actual Text element in the scene graph. As the user types, the Text element's dimensions change naturally. However:
- The standin also handles **layout cascade** (topic shape resizing, child repositioning)
- LeaferJS text editing alone won't trigger the full layout pipeline
- **Recommendation:** Keep a simplified version of standin for BranchView editing, or integrate layout invalidation into the text change events from the LeaferJS editor

### 2.4 Multiple View Types — Text Rendering Patterns

| View Type | Text Element | Edit Interface | Has titleView? | Notes |
|-----------|-------------|----------------|----------------|-------|
| **Branch** | `TopicTitleFigure` → `TitleRenderWorker` → `new Text()` | Via `BranchView` (delegates to `topicView.titleView`) | Yes (`topicView.titleView`) | Uses standin for live preview |
| **Boundary** | `BoundaryTitleFigure` → `BoundaryTitleRenderWorker` → `Group(Path+Text)` | Via `BoundaryView.titleView` | Yes (direct) | Has background path shape |
| **Relationship** | `RelationshipTitleFigure` → `RelationshipTitleRenderWorker` → `new Text()` | Via `RelationshipView.titleText` | Yes (via `titleText` field) | Direct Text, no Group wrapper |
| **MatrixLabel** | `MatrixLabelFigure` → `MatrixLabelRenderWorker` → `Group(Text)` | Via `MatrixLabelView` | Yes (via figure) | Text inside Group |
| **LegendMarkerList** | `LegendMarkerListView.s$markerDescText` | Via `LegendMarkerListView` | No dedicated titleView | LeaferJS `Text` element |
| **InfoItem** | N/A (has its own `showEditor()`) | Custom `showEditor(e)` | N/A | Special case — not EditReceiver |

**Common pattern:** All 5 EditReceiver-handled types implement:
- `getEditContent(): string` — returns current text
- `saveEdit(newText: string): void` — writes to model
- `getTextClientStyle(): object` — font properties for textarea styling
- `getTextClientBounds(): DOMRect` — bounding rect for textarea positioning

### 2.5 Zoom/Scale Handling

**Current approach (manual):**
```ts
// In updateInputPosition():
const scale = svgView.currentScale;
// Position = (mindMap position * scale) + sheetTranslate
const transferPosition = {
  x: titleViewRealPosition.x * scale + mindmapCenterPositionTrans.x,
  y: titleViewRealPosition.y * scale + mindmapCenterPositionTrans.y,
};
this._inputAttributeDiffer.css({
  transform: `scale(${scale})`,
  left: `${transferPosition.x + offsetX}px`,
  top: `${transferPosition.y + offsetY}px`,
});
```

The textarea uses CSS `transform: scale()` to match the canvas zoom level. This is triggered on:
- `EVENTS.SCALE_CHANGED` → `_locateInputByCurrentSelection()`
- Window resize → `updateInputPosition()`
- Every input event → `updateTextClientSize()` → `updateInputPosition()`

**Does LeaferJS handle this automatically?**
**Yes.** LeaferJS's `@leafer-in/text-editor` creates an HTML overlay that is automatically positioned and scaled to match the Text element's world transform. The plugin handles zoom/pan/rotation transparently because it reads the element's screen-space bounds from the LeaferJS rendering pipeline. **This is a major simplification.**

### 2.6 Module Registration

**Static registration:**
```ts
// editreceiver.ts line 1077
EditReceiver.identifier = MODULE_NAME.EDIT_RECEIVER; // 'editreceiver'

// modules/index.ts — conditional registration
if (process.env.SB_MODE !== 'readonly') {
  availableModules.push(ModuleEditReceiver, ...);
}

// sheeteditor.ts — instantiation
static registerModule(module) {
  moduleMap[module.identifier.toLowerCase()] = module;
}
function initModules() {
  this._moduleMap = {};
  for (const key in moduleMap) {
    this._moduleMap[item.identifier.toLowerCase()] = new item(this);
  }
}
```

**Interface contract:**
- Must have static `identifier` string
- Constructor receives `context` (SheetEditor instance)
- Accessed via `context.getModule<EditReceiver>(MODULE_NAME.EDIT_RECEIVER)`

### 2.7 Events

#### Events EditReceiver **listens to:**

| Event | Source | Handler |
|-------|--------|---------|
| `dblclick` on BRANCH | context.onEvent | `_onViewDbClick` |
| `doubletap` on BRANCH | context.onGesture | `_onViewDbTap` |
| `dblclick` on BOUNDARY | context.onEvent | `_onViewDbClick` |
| `doubletap` on BOUNDARY | context.onGesture | `_onViewDbTap` |
| `dblclick` on RELATIONSHIP | context.onEvent | `_onViewDbClick` |
| `doubletap` on RELATIONSHIP | context.onGesture | `_onViewDbTap` |
| `dblclick` on MATRIX_LABEL | context.onEvent | `_onViewDbClick` |
| `doubletap` on MATRIX_LABEL | context.onGesture | `_onViewDbTap` |
| `dblclick` on LEGENDMARKERLIST | context.onEvent | `_onViewDbClick` |
| `click` on INFOITEM | context.onEvent | Calls `view.showEditor(e)` |
| `tap` on SVG | context.onGesture | Blur textarea |
| `SHEET_CONTENT_LOADED` | context.on | Locate input by selection |
| `SELECTION_CHANGED` | context.on | Enable/disable + relocate input |
| `SCALE_CHANGED` | context.on | Relocate input |
| `resize` on window | window.addEventListener | Update input position |
| `focus` on $el | $el.addEventListener | Prepare select |
| `keydown/blur/focus/input/copy/paste/cut/compositionstart/compositionend` | textarea.addEventListener | Various handlers |

#### Events EditReceiver **emits:**

| Event | Trigger | Consumers |
|-------|---------|-----------|
| `'copy'` | Copy while textarea not visible | CopyPasteManager |
| `'paste'` | Paste while textarea not visible | CopyPasteManager |
| `'cut'` | Cut while textarea not visible | CopyPasteManager |

#### External callers of EditReceiver methods:

| Method | Callers |
|--------|---------|
| `show(text, view)` | `_onViewDbClick`, `onInput`, `onKeyDown`, `ShowEditBoxAction`, `SelectBox.registerAddTitleButtonOnClickEvent` |
| `hide(notSaveEdit?)` | `HideEditBoxAction` |
| `repairPosition()` | `RepairEditReceiverPositionAction`, `SheetEditor` on SCALE_CHANGED |
| `getInputDOM()` | `FocusInputAction`, `coreServices` (copy service) |
| `getOriginalTargetView()` | (internal) |

### 2.8 Read-Only Mode

**Two layers:**

1. **Build-time exclusion:** `process.env.SB_MODE === 'readonly'` → EditReceiver not registered at all (in `modules/index.ts`)

2. **Runtime check:** In `show()`:
   ```ts
   if (this._context.isReadOnly()) {
     this.disableInput(); // textarea.setAttribute('readonly', 'true')
   } else {
     this.enableInput();  // textarea.removeAttribute('readonly')
   }
   ```
   Also, `isReadOnly()` is checked before drag, boundary title editing, relationship editing, and copy-paste operations.

---

## 3. Proposed New Architecture

### 3.1 Core Idea

Replace the global `<textarea>` with LeaferJS's native inline text editing. Each editable Text element gets `editable: true`, and the `@leafer-in/text-editor` plugin handles:
- HTML overlay creation and positioning
- Zoom/scale synchronization
- Text input, selection, cursor
- Font style matching

### 3.2 New Architecture Diagram

```
                    ┌─────────────────────────┐
                    │  @leafer-in/editor       │
                    │  @leafer-in/text-editor  │
                    │  (LeaferJS plugins)      │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │  LeaferJS App            │
                    │  (svgview.ts)            │
                    │  config: { editor: {} }  │
                    └───────────┬─────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                  │
    ┌─────────▼──────┐ ┌───────▼────────┐ ┌──────▼──────────┐
    │ Text elements   │ │ Text elements  │ │ Text elements    │
    │ editable: true  │ │ editable: true │ │ editable: true   │
    │ (Branch titles) │ │ (Boundaries)   │ │ (Relationships)  │
    └─────────┬──────┘ └───────┬────────┘ └──────┬──────────┘
              │                 │                  │
              └─────────────────┼──────────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │  EditBridge (new module) │
                    │  - Listens to InnerEditor│
                    │    events               │
                    │  - Calls saveEdit() on   │
                    │    view types            │
                    │  - Handles standin for   │
                    │    BranchView            │
                    │  - Copy/paste forwarding │
                    │  - Read-only gating      │
                    └─────────────────────────┘
```

### 3.3 Key Components

#### 3.3.1 LeaferJS App Configuration

```ts
// svgview.ts — initSVGStructure()
this.svg = new App({
  view: this.el,
  fill: 'transparent',
  editor: {},  // Enable @leafer-in/editor
});
```

Install dependencies:
```bash
pnpm add @leafer-in/editor @leafer-in/text-editor
```

#### 3.3.2 EditBridge Module (replaces EditReceiver)

A new ~200-line module that:
- Registers the `@leafer-in/text-editor` plugin
- Listens to `InnerEditorEvent.SAVE` / `InnerEditorEvent.CLOSE` on the LeaferJS app
- On save: finds the corresponding view type and calls `saveEdit(text)`
- Manages the standin lifecycle for BranchView editing
- Forwards copy/paste events when not editing
- Gates editing based on read-only state

#### 3.3.3 Text Element Configuration

In each render worker, set `editable: true` on the Text element when not in read-only mode:

```ts
// titlerenderworker.ts
this.titleText = new Text({ cursor: 'default', editable: true })
```

Or dynamically:
```ts
// After module init, mark text elements as editable
titleText.editable = !context.isReadOnly();
```

---

## 4. Step-by-Step Migration Plan

### Phase 1: Foundation (1–2 days)

#### Step 1.1: Install LeaferJS Editor Plugins
- Install `@leafer-in/editor` and `@leafer-in/text-editor`
- Verify they load without conflicts with existing LeaferJS setup
- **Files:** `package.json`

#### Step 1.2: Enable Editor in App Config
- Add `editor: {}` to the `App` constructor in `svgview.ts`
- Verify the editor plugin initializes (check console for errors)
- **Files:** `src/view/svgview.ts`

#### Step 1.3: Create EditBridge Module Skeleton
- Create `src/modules/editbridge.ts` with static `identifier = MODULE_NAME.EDIT_RECEIVER` (same identifier for backward compatibility)
- Register in `src/modules/index.ts`
- Wire up `InnerEditorEvent` listeners
- **Files:** `src/modules/editbridge.ts`, `src/modules/index.ts`

### Phase 2: Branch/Boundary/Relationship Text Elements (2–3 days)

#### Step 2.1: Make Topic Title Text Editable
- In `TitleRenderWorker`, set `editable: true` on the `titleText` LeaferJS Text
- Test: double-click a topic title → LeaferJS inline editor should appear
- Verify: text changes are reflected in the Text element
- **Files:** `src/render/renderengine/svg/renderworkers/titlerenderworker.ts`

#### Step 2.2: Wire Up Save Flow for BranchView
- In EditBridge, listen for `InnerEditorEvent.SAVE`
- Map the edited Text element back to its BranchView (via figure → viewController chain)
- Call `branchView.saveEdit(newText)`
- **Files:** `src/modules/editbridge.ts`

#### Step 2.3: Handle Standin for BranchView
- On edit start: create standin (reuse `utils.standin()`)
- On text change during editing: update standin for live layout preview
- On edit end: remove standin, trigger layout on original
- **Files:** `src/modules/editbridge.ts`, `src/utils/branch.ts`

#### Step 2.4: Boundary Title Editing
- `BoundaryTitleRenderWorker` wraps Text in a Group — need to make the inner `titleText` editable
- Verify: double-click boundary title → inline editor appears
- Wire up `BoundaryView.saveEdit(newText)`
- **Files:** `src/render/renderengine/svg/renderworkers/boundarytitlerenderworker.ts`, `src/modules/editbridge.ts`

#### Step 2.5: Relationship Title Editing
- `RelationshipTitleRenderWorker` uses direct Text — straightforward
- Wire up `RelationshipView.saveEdit(newText)`
- **Files:** `src/modules/editbridge.ts`

### Phase 3: Matrix Label & Legend Marker (1 day)

#### Step 3.1: Matrix Label Editing
- MatrixLabelRenderWorker wraps Text in Group
- Make inner `titleText.editable = true`
- Wire up `MatrixLabelView.saveEdit(newText)`
- **Files:** `src/render/renderengine/svg/renderworkers/matrixlabelrenderworker.ts`, `src/modules/editbridge.ts`

#### Step 3.2: Legend Marker List Editing
- `LegendMarkerListView` uses `s$markerDescText` (a LeaferJS Text)
- Make it editable
- Wire up `LegendMarkerListView.saveEdit(newText)`
- **Files:** `src/view/legendview.ts`, `src/modules/editbridge.ts`

### Phase 4: Keyboard & Interaction Parity (1–2 days)

#### Step 4.1: Keyboard Shortcut Mapping
- **Enter** (no modifier): End editing (LeaferJS default behavior)
- **Ctrl/Cmd+Enter**: Insert newline (verify LeaferJS handles this)
- **Esc**: Cancel/end editing
- **Tab**: End editing, move to next topic (custom handler needed)
- **Space on selection**: Start editing (keep existing keybind handler)
- **Files:** `src/modules/editbridge.ts`, `src/modules/keybind.ts`

#### Step 4.2: Copy/Paste Event Forwarding
- When NOT editing, copy/paste on the textarea forwarded topic-level operations
- With LeaferJS editing, the editor overlay captures clipboard events during editing
- Need a mechanism to forward clipboard events to CopyPasteManager when not editing
- Options: (a) Keep a hidden textarea for focus + clipboard, or (b) Listen on the LeaferJS canvas container
- **Files:** `src/modules/editbridge.ts`, `src/modules/copypaste/copypaste.ts`

#### Step 4.3: Double-Click / Double-Tap Handling
- LeaferJS editor triggers on double-click automatically for `editable` Text elements
- Remove the manual `context.onEvent(DB_CLICK, ...)` handlers from EditReceiver
- Verify no conflicts between LeaferJS editor's double-click and existing selection/drag handlers
- **Files:** `src/modules/editbridge.ts`

### Phase 5: Read-Only Mode & Edge Cases (1 day)

#### Step 5.1: Read-Only Mode
- When `isReadOnly()`, don't set `editable: true` on Text elements
- Or: dynamically toggle `editable` based on read-only state
- **Files:** `src/modules/editbridge.ts`, render workers

#### Step 5.2: Filter Mode Opacity
- Current: `setEditingTargetOpacityInFilterMode()` sets opacity on target figure
- New: May need to handle this differently since LeaferJS editor operates on the element directly
- **Files:** `src/modules/editbridge.ts`

#### Step 5.3: InfoItem Special Case
- InfoItem has its own `showEditor(e)` method, not handled by EditReceiver
- Keep this as-is — it's a separate editing system
- **Files:** None (no change needed)

### Phase 6: Cleanup & Removal (1 day)

#### Step 6.1: Remove EditReceiver
- Delete `src/modules/editreceiver.ts`
- Remove from `src/modules/index.ts`
- Update all callers:
  - `ShowEditBoxAction` → use new EditBridge
  - `HideEditBoxAction` → use new EditBridge
  - `RepairEditReceiverPositionAction` → may no longer be needed (LeaferJS handles positioning)
  - `FocusInputAction` → adapt or remove
  - `coreServices` copy service → adapt
  - `SelectBox.registerAddTitleButtonOnClickEvent()` → adapt
- **Files:** Multiple

#### Step 6.2: Remove Standin Complexity
- With LeaferJS native editing, the standin may be simplified
- If the Text element edits in-place, layout changes propagate naturally
- Evaluate if standin can be eliminated entirely or reduced to a simple layout invalidation trigger
- **Files:** `src/utils/branch.ts`

#### Step 6.3: Remove `getTextClientStyle()` and `getTextClientBounds()`
- These exist solely for EditReceiver textarea positioning
- No longer needed if LeaferJS handles positioning
- Remove from BranchView, BoundaryView, RelationshipView, MatrixLabelView, LegendMarkerListView
- **Files:** Multiple view files

---

## 5. Interface Changes Needed

### 5.1 New Interfaces

```ts
// src/modules/editbridge.ts
export class EditBridge extends EventEmitter {
  static identifier: string; // MODULE_NAME.EDIT_RECEIVER (same as before for compat)
  
  constructor(context: SheetEditor);
  
  // Public API (matches EditReceiver for backward compat)
  show(text: string, targetView: any): void;
  hide(notSaveEdit?: boolean): void;
  repairPosition(): void;  // May become no-op
  
  // New methods
  isEditing(): boolean;
  getCurrentEditTarget(): any;
}
```

### 5.2 Changed Interfaces

```ts
// TitleRenderWorker — add editable support
class TitleRenderWorker {
  setEditable(editable: boolean): void;
}

// View types — getEditContent/saveEdit remain unchanged
// getTextClientStyle/getTextClientBounds — can be removed (Phase 6)
```

### 5.3 Removed Interfaces

```ts
// These become unnecessary:
EditReceiver.getInputDOM(): HTMLTextAreaElement  // Remove
EditReceiver.getInputDOM().focus()               // Replace with LeaferJS focus
EditReceiver.enableInput() / disableInput()      // Replace with editable toggle
```

### 5.4 Action Changes

| Action | Current | New |
|--------|---------|-----|
| `ShowEditBoxAction` | `editReceiver.show(text, target)` | Same API (EditBridge compatible) |
| `HideEditBoxAction` | `editReceiver.hide(notSaveEdit)` | Same API |
| `RepairEditReceiverPositionAction` | `editReceiver.repairPosition()` | No-op or remove |
| `FocusInputAction` | `editReceiver.getInputDOM().focus()` | Adapt to LeaferJS focus |

---

## 6. Risk Areas and Mitigations

### 6.1 High Risk: Standin Integration

**Risk:** LeaferJS text editing modifies the Text element in-place. The standin system relies on intercepting model writes to trigger layout on a cloned view. If the Text element changes directly, the original branch's layout won't update until the standin is removed.

**Mitigation:** 
- Option A: Keep standin, intercept LeaferJS text change events to feed into standin model
- Option B: Eliminate standin, add direct layout invalidation on Text element changes
- **Recommendation:** Start with Option A (lower risk), evaluate Option B after core editing works

### 6.2 High Risk: Copy/Paste When Not Editing

**Risk:** The current system uses the textarea's focus to capture copy/paste events for topic-level operations (copy topic, paste topic). With LeaferJS editing, there's no global textarea to hold focus.

**Mitigation:**
- Keep a hidden focusable element (like the existing `fakeTextArea` in `coreServices`) for clipboard operations
- Or: listen for clipboard events on the LeaferJS canvas container
- **Recommendation:** Keep a minimal hidden element for focus/clipboard, separate from editing

### 6.3 Medium Risk: Keyboard Shortcut Conflicts

**Risk:** LeaferJS text editor may handle keyboard events differently than the current textarea. Enter, Esc, Tab behavior may conflict with existing keybind handlers.

**Mitigation:**
- Test each shortcut thoroughly during Phase 4
- Use `InnerEditorEvent` to hook into LeaferJS editor lifecycle
- May need to override LeaferJS default keyboard behavior for Enter/Ctrl+Enter

### 6.4 Medium Risk: IME (Chinese/Japanese Input)

**Risk:** The current system has explicit `compositionstart`/`compositionend` handling and `KEY_IN_COMPOSING` (keyCode 229) special case. LeaferJS editor must handle IME correctly.

**Mitigation:**
- Test with Chinese input methods early (Phase 2)
- LeaferJS editor likely handles IME since it uses a real HTML contenteditable/div
- If issues arise, may need to patch LeaferJS editor's IME handling

### 6.5 Medium Risk: Matrix Label Dual-Write

**Risk:** `MatrixLabelView.saveEdit()` writes to multiple cells (`cell.items.forEach(v => v.model.changeLabel(newText))`). The LeaferJS editor only knows about one Text element.

**Mitigation:**
- EditBridge must map the edited Text element to the correct MatrixLabelView
- Call `matrixLabelView.saveEdit(newText)` which handles the fan-out
- This is the same pattern as current — no new risk, just needs correct wiring

### 6.6 Low Risk: Legend Marker List Special Styling

**Risk:** Legend markers use `fontFamily: COMMON_FONT_FAMILY` and have a max width of 200px. The LeaferJS editor must respect these constraints.

**Mitigation:**
- Set `maxWidth` on the Text element
- Font family is already on the Text element
- LeaferJS editor should inherit these

### 6.7 Low Risk: Text Transform Handling

**Risk:** The current system applies `textTransform` (uppercase, etc.) via `Util.getTransformedText()` before saving. The standin receives the transformed text.

**Mitigation:**
- Apply text transform in `saveEdit()` before calling `model.changeTitle()`
- Or: handle in EditBridge's save handler

---

## 7. Effort Estimates

| Phase | Steps | Estimated Effort | Dependencies |
|-------|-------|-----------------|--------------|
| **Phase 1: Foundation** | 1.1–1.3 | 1–2 days | None |
| **Phase 2: Core Views** | 2.1–2.5 | 2–3 days | Phase 1 |
| **Phase 3: Matrix/Legend** | 3.1–3.2 | 1 day | Phase 2 |
| **Phase 4: Keyboard/Interaction** | 4.1–4.3 | 1–2 days | Phase 2 |
| **Phase 5: Read-Only/Edge Cases** | 5.1–5.3 | 1 day | Phase 4 |
| **Phase 6: Cleanup** | 6.1–6.3 | 1 day | Phase 5 |
| **Total** | | **7–10 days** | |

### Critical Path
Phase 1 → Phase 2 (Steps 2.1–2.3) → Phase 4 → Phase 6

### Recommended Order for Incremental Delivery
1. Phase 1 + Phase 2.1 + Phase 2.2 = **Topic title editing works** (biggest user impact)
2. Phase 2.3–2.5 = Boundary/Relationship editing
3. Phase 3 = Matrix/Legend editing
4. Phase 4 = Keyboard parity
5. Phase 5+6 = Polish and cleanup

---

## Appendix A: LeaferJS Text Editor Reference

### Installation
```bash
pnpm add @leafer-in/editor @leafer-in/text-editor
```

### App Configuration
```ts
import { App } from 'leafer-ui'
import '@leafer-in/editor'
import '@leafer-in/text-editor'

const app = new App({
  view: el,
  editor: {},
})
```

### Making Text Editable
```ts
import { Text } from 'leafer-ui'

const text = new Text({
  text: 'Hello',
  editable: true,
  fontSize: 16,
})
```

### Events
```ts
import { InnerEditorEvent } from '@leafer-in/editor'

app.on(InnerEditorEvent.SAVE, (e) => {
  // e.target is the edited Text element
  // e.target.text is the new text value
})

app.on(InnerEditorEvent.CLOSE, (e) => {
  // Editor closed (Esc or click outside)
})
```

### Key Behaviors
- Double-click on `editable: true` Text → inline editor appears
- Editor is an HTML overlay positioned over the Text element
- Zoom/scale handled automatically
- Font properties inherited from the Text element
- Enter → newline by default (may need customization)
- Esc → close editor
- Click outside → close editor

---

## Appendix B: Files to Modify (Summary)

### New Files
- `src/modules/editbridge.ts` — New module replacing EditReceiver

### Modified Files
- `package.json` — Add @leafer-in/editor, @leafer-in/text-editor
- `src/view/svgview.ts` — Add `editor: {}` to App config
- `src/modules/index.ts` — Replace EditReceiver import with EditBridge
- `src/render/renderengine/svg/renderworkers/titlerenderworker.ts` — Set `editable: true`
- `src/render/renderengine/svg/renderworkers/boundarytitlerenderworker.ts` — Set `editable: true` on inner text
- `src/render/renderengine/svg/renderworkers/relationshiptitlerenderworker.ts` — Set `editable: true`
- `src/render/renderengine/svg/renderworkers/matrixlabelrenderworker.ts` — Set `editable: true`
- `src/view/legendview.ts` — Set `editable: true` on marker description text
- `src/core/actions/sheet/show-edit-box.ts` — Use EditBridge
- `src/core/actions/sheet/hide-edit-box.ts` — Use EditBridge
- `src/core/actions/sheet/repair-edit-receiver-position.ts` — Remove or no-op
- `src/core/actions/sheet/focus-input.ts` — Adapt to LeaferJS
- `src/core/services.ts` — Adapt copy service
- `src/core/sheeteditor.ts` — Remove EditReceiver references
- `src/modules/copypaste/copypaste.ts` — Adapt clipboard forwarding
- `src/modules/svgdraggable/view/selectbox.ts` — Use EditBridge.show()
- `src/modules/keybind.ts` — Adapt keyboard shortcuts

### Deleted Files
- `src/modules/editreceiver.ts` — Replaced by editbridge.ts

### Potentially Simplified Files
- `src/utils/branch.ts` — `standin()` function may be simplified
- `src/view/branchview.ts` — Remove `getTextClientStyle()`, `getTextClientBounds()`
- `src/view/boundaryview.ts` — Remove `getTextClientStyle()`, `getTextClientBounds()`
- `src/view/relationshipview.ts` — Remove `getTextClientStyle()`, `getTextClientBounds()`
- `src/view/matrixlabelview.ts` — Remove `getTextClientStyle()`, `getTextClientBounds()`
