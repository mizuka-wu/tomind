# LayoutEngine 坐标系

## 概述

LayoutEngine 使用 LeaferJS 坐标系：**每个节点的 (x, y) 相对于父节点的 (0, 0)**。

LeaferJS Group 嵌套自动处理坐标变换，不需要计算绝对坐标。

## 坐标系设计

```
ROOT (0, 0)
└── centralTopic (rootOffsetX, 0)
    ├── mainTopic1 (parentWidth + gap, offset)
    │   ├── subTopic1 (parentWidth + gap, offset)
    │   └── subTopic2 (parentWidth + gap, offset)
    └── mainTopic2 (parentWidth + gap, offset)
```

### 节点坐标

| 节点 | x | y |
|------|---|---|
| ROOT | 0 | 0 |
| centralTopic | rootOffsetX | 0 |
| mainTopic1 | centralTopic.width + horizontalGap | 垂直居中偏移 |
| subTopic1 | mainTopic1.width + horizontalGap | 垂直居中偏移 |

### 布局算法

1. **自底向上**：计算每个分支的总高度 (`calcBranchHeight`)
2. **自顶向下**：分配相对坐标 (`layoutChildren`)

## API

### `layoutTree(doc, options)`

计算整棵树的布局。

```typescript
import { layoutTree } from './layout-engine'

const result = layoutTree(doc)
// result.nodes: Map<string, NodeLayout>
// result.totalWidth: number
// result.totalHeight: number
```

### `LayoutEngine` 类

封装布局计算的引擎类。

```typescript
import { LayoutEngine } from './layout-engine'

const engine = new LayoutEngine({
  horizontalGap: 40,
  verticalGap: 10,
})

const result = engine.layout(doc)
```

## 配置选项

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

## 应用布局

### `applyLayoutToViews(layoutResult, tree)`

将布局结果应用到 NodeView 树。

```typescript
import { applyLayoutToViews } from './apply-layout'

applyLayoutToViews(result, nodeViewTree)
```

### 工作原理

1. 遍历 `layoutResult.nodes`
2. 对每个节点调用 `nodeView.setPosition({ x, y })`
3. LeaferJS Group 嵌套自动处理坐标变换

## 绘制连接线

### `drawConnections(rootNodeView)`

绘制父子节点之间的连接线。

```typescript
import { drawConnections } from './draw-connections'

drawConnections(rootNodeView)
```

### 工作原理

1. 连接线在 `connectionContainer` 中绘制（根级别）
2. 需要绝对坐标，通过遍历父节点链计算
3. 每个父节点绘制到其所有子节点的折线

## 与旧系统的区别

| 旧系统 (SVG) | 新系统 (LeaferJS) |
|--------------|-------------------|
| 绝对坐标 | 相对坐标 |
| 手动计算绝对位置 | Group 嵌套自动处理 |
| 连接线使用绝对坐标 | 连接线遍历父节点链计算绝对坐标 |

## 示例

```typescript
import { layoutTree } from './layout-engine'
import { applyLayoutToViews } from './apply-layout'
import { drawConnections } from './draw-connections'

// 1. 计算布局
const layoutResult = layoutTree(state.doc)

// 2. 应用布局到视图
applyLayoutToViews(layoutResult, nodeViewTree)

// 3. 绘制连接线
drawConnections(rootNodeView)
```
