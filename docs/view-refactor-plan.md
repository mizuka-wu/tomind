# View 层重构规划：移除 Model 依赖

## 当前架构问题

现在有**两套并行的视图创建系统**：

```
旧路径（实际渲染）：
SheetEditor.initInnerView()
  └─ new SheetView(model)
       └─ initView()
            └─ new BranchView(rootTopic.model)
                 └─ constructor: new TopicView(model)
                      └─ TitleView, MarkersView, ImageView...
                 └─ onAddTopic: new BranchView(childTopic.model)  ← 递归

新路径（未连接渲染）：
SheetEditor.initialize()
  └─ new NodeViewTree(stateToDoc(state))
       └─ BranchNodeView → createView() → new BranchView(modelShim)
            └─ TopicNodeView → createView() → new TopicView(modelShim)
                 └─ BranchNodeView → ...  ← 递归
```

**问题**：NodeViewTree 创建的 View 从未加入场景图，实际渲染的是旧路径创建的 View。

## 目标架构

```
SheetEditor
  └─ NodeViewTree(stateToDoc(state))  ← 唯一视图创建路径
       └─ BranchNodeView(rootNode)
            └─ createView() → new BranchView()  ← 纯 View，无 Model
            └─ addTo(sheetView.branchContainer)
            └─ TopicNodeView(childNode)
                 └─ createView() → new TopicView()  ← 纯 View，无 Model
                 └─ addTo(branchView)
                 └─ applyChanges() → 直接调 View 方法刷新
```

**核心变化**：
1. View 变成纯渲染器（无 Model、无事件监听）
2. NodeViewTree 负责创建/销毁 View 并管理场景图
3. applyChanges() 是唯一的更新通道

## 依赖链分析

```
SheetView
  ├─ @Style mixin: model.on(changeStyle/changeTheme/addTheme/setStyleObject)
  ├─ initView(): new BranchView(sheet.rootTopic())
  ├─ initView(): model.relationships() → new RelationshipView(r)
  └─ initView(): model.getLegendModel() → new LegendView

BranchView
  ├─ @Style mixin: model.on(changeStyle/changeClass/setStyleObject/changeStructureClass)
  ├─ @UpdateBranchViewConnectionMask: autoRun
  ├─ @BackgroundCellBranchViewEnable: context.on(AFTER_SHEET_CONTENT_CHANGE)
  ├─ constructor: new TopicView(this.model, this)
  ├─ initEventsListener(): model.on(addTopic/removeTopic/moveChildTopic/...)
  └─ onAddTopic(): new BranchView(childTopic.model)  ← 递归创建

TopicView
  ├─ @Style mixin: model.on(changeStyle)
  ├─ constructor: new TitleView, MarkersView, ImageView, LabelsView...
  └─ initEventsListener(): model.on(change:title/changeStyle/addImage/...)

TitleView
  └─ 纯渲染（setText/getSvg），无 Model 依赖
```

## 分阶段实施

### Phase 1: SheetView → 纯容器
**目标**：SheetView 不再依赖 Model，变成纯容器

**改动**：
- [ ] 移除 `@Style` mixin（model.on(changeStyle/changeTheme/...)）
- [ ] 移除 `initView()`（不再创建 BranchView/RelationshipView/LegendView）
- [ ] 移除 `initEventsListener()`（model.on(addRelationship/removeRelationship/...)）
- [ ] 移除构造函数中的 `this.model = model`
- [ ] 保留：figure、containers、bounds、refreshStyles() 方法
- [ ] 新增：`addBranchView(view)`, `removeBranchView(view)`, `addRelationshipView(view)` 等方法

**验证**：SheetView 可以 `new SheetView()` 无参数创建，不报错

### Phase 2: BranchView → 纯视图
**目标**：BranchView 不再监听 Model 事件

**改动**：
- [ ] 移除 `@Style` mixin（model.on(changeStyle/changeClass/...)）
- [ ] 移除 `@UpdateBranchViewConnectionMask` mixin
- [ ] 移除 `@BackgroundCellBranchViewEnable` mixin
- [ ] 移除 `initEventsListener()` 中所有 model.on(...)
- [ ] 保留：figure、layout、bounds、refreshStyles() 方法
- [ ] 新增：`setTopicView(view)`, `addChildBranch(view)`, `removeChildBranch(view)` 方法

**验证**：BranchView 可以 `new BranchView()` 无参数创建

### Phase 3: TopicView → 纯视图
**目标**：TopicView 不再监听 Model 事件

**改动**：
- [ ] 移除 `@Style` mixin（model.on(changeStyle)）
- [ ] 移除 `initEventsListener()` 中所有 model.on(...)
- [ ] 保留：figure、TitleView、MarkersView、ImageView 等子视图
- [ ] 新增：`setTitle(text)`, `setImage(data)`, `setMarkers(data)` 等方法

**验证**：TopicView 可以 `new TopicView()` 无参数创建

### Phase 4: NodeViewTree 连接场景图
**目标**：NodeViewTree 创建的 View 成为实际渲染的 View

**改动**：
- [ ] NodeViewTree 持有 SheetView 引用
- [ ] BranchNodeView.createView() 创建 BranchView 并添加到 SheetView.branchContainer
- [ ] TopicNodeView.createView() 创建 TopicView 并添加到 BranchView
- [ ] NodeViewTree.update() 时，diff 结果驱动 View 的创建/销毁
- [ ] applyChanges() 直接调 View 方法（refreshStyles, setTitle, etc.）

**验证**：通过 NodeViewTree 创建的 View 能正确渲染

### Phase 5: 清理 SheetEditor
**目标**：SheetEditor 移除 Model 依赖

**改动**：
- [ ] `initInnerView()` 不再创建 SheetView(model)
- [ ] 改为：创建 SheetView() + NodeViewTree(stateToDoc(state))
- [ ] NodeViewTree 自动将 View 添加到 SheetView
- [ ] 移除 `this.model` 相关代码

**验证**：SheetEditor 通过 `doc` 选项初始化，无 Model

### Phase 6: 清理旧代码
**目标**：移除不再需要的代码

**改动**：
- [ ] 移除 `src/models/` 下的 Model 文件（如果不再需要）
- [ ] 移除 `model-to-state.ts` 桥接文件
- [ ] 移除 ModelShim（NodeView 不再需要桥接）
- [ ] 更新 NodeView 实现，直接操作 View 而不通过 ModelShim

## 风险点

1. **样式刷新机制**：旧路径通过 model.on(changeStyle) 触发，新路径通过 applyChanges() 触发。需要确保所有样式变化都能被 NodeView 检测到。

2. **递归视图创建**：BranchView.initView() 递归创建子 BranchView。NodeViewTree 需要正确处理这个递归。

3. **布局引擎**：layoutTree() 目前依赖旧 View 的 bounds。需要确保新 View 的 bounds 计算一致。

4. **模块系统**：SelectionManager、DragManager 等模块可能依赖旧 View 的 API。需要适配。

5. **LegendView**：特殊视图，不在 Node 树中。需要单独处理。

## 建议执行顺序

**从里到外**：
1. Phase 3: TopicView → 纯视图（最内层）
2. Phase 2: BranchView → 纯视图
3. Phase 1: SheetView → 纯容器
4. Phase 4: NodeViewTree 连接场景图
5. Phase 5: 清理 SheetEditor
6. Phase 6: 清理旧代码

每完成一个 Phase 都要：
- `pnpm typecheck` 通过
- `pnpm test` 通过
- 提交 commit
