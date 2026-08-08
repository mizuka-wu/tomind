# Tomind Tree Layout 算法摘要

## 概述

Tree Layout 是一个方向参数化的树布局算法，支持四种方向：`right`、`left`、`down`、`up`。

---

## 1. 节点间距/边距常量

### 默认配置 (DEFAULT_LAYOUT_OPTIONS)

```typescript
{
  horizontalGap: 20,        // 默认水平间距
  verticalGap: 8,          // 默认垂直间距
  nodePadding: {
    top: 8,                 // 节点上边距
    right: 16,              // 节点右边距
    bottom: 8,              // 节点下边距
    left: 16                // 节点左边距
  },
  rootOffsetX: 50,          // 根节点X轴偏移
  lineHeight: 1.0,           // 行高倍率（× fontSize）
  charWidthFactor: 0.8      // 字符宽度系数（中文≈0.8×fontSize）
}
```

### 样式覆盖机制

通过 `getNodeSpacing()` 函数，可以根据节点样式动态调整间距：

- `style.spacingMajor` → 主间距（父子间距）
- `style.spacingMinor` → 次间距（兄弟间距）
- `style.marginTop/Right/Bottom/Left` → 节点边距

**方向映射规则**：
- 水平方向 (right/left)：`spacingMajor` → `horizontalGap`，`spacingMinor` → `verticalGap`
- 垂直方向 (down/up)：`spacingMajor` → `verticalGap`，`spacingMinor` → `horizontalGap`

---

## 2. 文字宽度计算方式

### measureTextSize() 函数

```typescript
function measureTextSize(
  text: string,
  fontSize: number,
  options: LayoutOptions
): { width: number; height: number }
```

**计算逻辑**：
1. **字符宽度** = `fontSize * charWidthFactor`
2. **最大宽度限制** = `200px`
3. **文本宽度** = `min(text.length * charWidth, maxWidth)`
4. **行数计算** = `ceil((text.length * charWidth) / maxWidth)`
5. **文本高度** = `lines * lineHeight`

**示例**：
- 文本："Hello World" (11字符)
- 字体大小：14px
- 字符宽度：14 * 1.0 = 14px
- 文本宽度：min(11 * 14, 200) = 154px
- 行数：ceil(154 / 200) = 1行
- 文本高度：1 * 20 = 20px

---

## 3. 垂直居中逻辑

### 布局计算流程

#### 3.1 计算子树总跨度 (subtreeAxisSize)

```typescript
function subtreeAxisSize(ctx, node, sizeMap, dir): number
```

- 水平方向：返回子树在Y轴的总高度
- 垂直方向：返回子树在X轴的总宽度
- 折叠节点：返回节点自身的尺寸

#### 3.2 布局子树 (layoutSubtree)

**水平方向 (right/left)**：
```typescript
// 子树起始Y坐标 = 当前Y - (子树总高度 - 节点高度) / 2
const subtreeStartY = y - (branchAxisSize - size.height) / 2

// 子节点在子树空间内垂直居中
const childYCentered = childY + (childSubtreeSize - childNodeSize.height) / 2
```

**垂直方向 (down/up)**：
```typescript
// 子树起始X坐标 = 当前X - (子树总宽度 - 节点宽度) / 2
const subtreeStartX = x - (branchAxisSize - size.width) / 2

// 子节点在子树空间内水平居中
const childXCentered = childX + (childSubtreeSize - childNodeSize.width) / 2
```

#### 3.3 根节点居中

布局完成后，根节点会被移到整个树的bounding box中心：

```typescript
const bbCenterX = maxX / 2
const bbCenterY = maxY / 2
const rootCenterX = rootLayout.x + rootLayout.width / 2
const rootCenterY = rootLayout.y + rootLayout.height / 2
const offsetX = bbCenterX - rootCenterX
const offsetY = bbCenterY - rootCenterY
```

---

## 4. 连线起点终点计算

### 连接线渲染器 (ConnectionRenderer)

连线的起点和终点通过 `setEndpoints()` 方法设置：

```typescript
setEndpoints(start: { x: number; y: number }, end: { x: number; y: number }): void
```

**连线类型**：
1. **普通直线**：从起点到终点的直线
   ```typescript
   const d = `M ${this.start.x} ${this.start.y} L ${this.end.x} ${this.end.y}`
   ```

2. **锥形线**：从起点到终点的锥形线
   ```typescript
   const angle = Math.atan2(ey - sy, ex - sx)
   const perpX = Math.sin(angle) * (width / 2)
   const perpY = -Math.cos(angle) * (width / 2)
   // 构建锥形路径
   ```

**连线样式参数**：
- `lineColor` / `stroke`：线条颜色
- `lineStrokeWidth` / `strokeWidth`：线条宽度
- `strokeDash` / `dashPattern`：虚线模式
- `lineTapered`：是否为锥形线

---

## 5. 算法流程图

```
1. 查找根节点 (findRootTopic)
       ↓
2. 测量子树尺寸 (measureSubtree)
   - 计算每个节点的文本尺寸
   - 计算节点总尺寸（文本 + 边距）
       ↓
3. 计算子树总跨度 (subtreeAxisSize)
   - 递归计算子树在主轴方向的总跨度
       ↓
4. 布局子树 (layoutSubtree)
   - 确定节点位置
   - 子节点在子树空间内居中
       ↓
5. 平移到正数区
   - 确保所有坐标 >= 0
       ↓
6. 居中根节点
   - 将根节点移到bounding box中心
       ↓
7. 返回布局结果
```

---

## 6. 关键参数表

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `horizontalGap` | 40 | 默认水平间距 |
| `verticalGap` | 10 | 默认垂直间距 |
| `nodePadding.top` | 8 | 节点上边距 |
| `nodePadding.right` | 16 | 节点右边距 |
| `nodePadding.bottom` | 8 | 节点下边距 |
| `nodePadding.left` | 16 | 节点左边距 |
| `rootOffsetX` | 50 | 根节点X轴偏移 |
| `lineHeight` | 20 | 文本行高 |
| `charWidthFactor` | 1.0 | 字符宽度系数 |
| `maxTextWidth` | 200 | 最大文本宽度（硬编码） |

---

## 7. 注意事项

1. **TODO 项**：
   - 与 XMind 原生 tree 布局逐一对齐间距/偏移
   - 折叠节点时 branchHeight 计算验证
   - summary/boundary 联动布局

2. **性能优化**：
   - 使用 `styleCache` 和 `spacingCache` 缓存计算结果
   - 避免重复计算节点样式和间距

3. **方向支持**：
   - right: 从左到右
   - left: 从右到左
   - down: 从上到下
   - up: 从下到上
