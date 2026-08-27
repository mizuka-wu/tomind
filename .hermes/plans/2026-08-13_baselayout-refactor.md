# BaseLayout 抽象类 + Map 布局重构

**Goal:** 将布局公共算法抽取为 `BaseLayout` 抽象类，map 布局改为继承模式

**Architecture:** 各布局算法从纯函数对象改为 class 继承 BaseLayout，公共定位算法作为 protected 方法

---

## 公共模式分析

| 模式 | map | tree | logic | 说明 |
|------|-----|------|-------|------|
| 累积定位 (Y/X) | ✅ | ✅ | ✅ | 子节点沿主轴累加定位 |
| 子树尺寸递归 | ✅ | ✅ | ✅ | subtreeHeight/Width |
| 父居中 | ✅ | ❌ | ✅ | parentCenter = (totalH - selfH) / 2 |
| posYoffsetToClosestChild | ❌ | ❌ | ❌ | snowbrush 有，tomind 缺失 |
| calcNumRight | ✅ | ❌ | ❌ | map 专用 |
| maxOffset 对齐 | ✅ | ❌ | ❌ | boundary 内边缘对齐 |

## Plan

### Task 1: 创建 BaseLayout 抽象类
**File:** `packages/layout/src/base-layout.ts`

```typescript
export abstract class BaseLayout implements LayoutAlgorithm {
  abstract name: string
  abstract layout(doc, options, styleEngine?, state?): LayoutResult

  // ── 公共方法 ──

  /** 沿主轴累积定位子节点 */
  protected calcCumulativePositions(children, startPos, minorSpacing, getAxisSize): number[]

  /** 递归计算子树在主轴方向的总跨度 */
  protected calcSubtreeAxisSize(node, sizeMap, getAxisSize, spacing): number

  /** 父节点居中偏移 */
  protected calcParentCenterOffset(childrenTotalSize, parentSize): number

  /** posYoffsetToClosestChild — snowbrush 对齐 */
  protected calcPosYOffsetToClosestChild(children, nodes, parentCenterY): number

  /** maxOffset — boundaryBounds 与 topicView 的偏移 */
  protected calcMaxOffset(children, nodes, boundaryBoundsMap, side): number

  /** 平移子树 */
  protected shiftSubtree(node, dx, dy, nodes): void

  /** 计算 boundaryBounds */
  protected computeBoundaryBounds(node, nodes): BoundaryBounds
}
```

### Task 2: Map 布局改为继承 BaseLayout
**File:** `packages/layout/src/map-layout.ts` (重构)

- `runMapLayout` → `MapLayout extends BaseLayout`
- `layoutSideChildren` 内联到 `layoutSide` 方法
- `layoutSubtreeInner` → `layoutNode` 方法
- 复用基类的 `calcCumulativePositions`、`calcParentCenterOffset`、`calcMaxOffset`

### Task 3: 验证
- `pnpm typecheck`
- `pnpm test` — 现有 156 测试必须全部通过

### Task 4: 提交
