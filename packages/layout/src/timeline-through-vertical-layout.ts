/**
 * Timeline Through Vertical 布局 — 穿透垂直时间线
 *
 * 节点沿垂直轴排列，子节点交替左右展开
 * 与 timeline-vertical 的区别：through 使用逻辑图风格的分支展开
 *
 * 对齐 snowbrush 双约束定位算法：
 *   - boundaryBounds 包含节点自身 + 所有后代的包围盒
 *   - Y 位置取两个候选值的 max（间距约束 vs bounds 约束）
 * snowbrush designPadding: central=60, 其他=36
 */
const DESIGN_PADDING = 10
import type { NodeDesc } from '@tomind/schema'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { getTitle, getFontSize, isCollapsed, getAttachedChildren, findRootTopic, measureSimpleSubtree } from './layout-utils'
type NodeSize = import('./layout-utils').SimpleNodeSize

/** boundaryBounds — 包含节点自身 + 所有后代的包围盒（相对于节点位置） */
interface BoundaryBounds {
  /** 相对于节点左侧的偏移（左子树扩展时为负值） */
  x: number
  /** 相对于节点顶部的偏移（子节点在下方，通常为 0） */
  y: number
  /** 总宽度 */
  width: number
  /** 总高度（节点自身 + 垂直间距 + 后代高度） */
  height: number
}

/**
 * 递归计算节点的 boundaryBounds
 * 对齐 snowbrush 的 boundaryBounds 概念：包含节点自身及其所有后代的包围盒
 */
function computeBoundaryBounds(
  node: NodeDesc,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  bbMap: Map<string, BoundaryBounds>,
): BoundaryBounds {
  const size = sizeMap.get(node.id)!
  const children = getAttachedChildren(node)

  if (isCollapsed(node) || children.length === 0) {
    const bb: BoundaryBounds = { x: 0, y: 0, width: size.width, height: size.height }
    bbMap.set(node.id, bb)
    return bb
  }

  // 递归计算所有子节点的 boundaryBounds
  const childBBs: BoundaryBounds[] = []
  for (const child of children) {
    childBBs.push(computeBoundaryBounds(child, options, sizeMap, bbMap))
  }

  // 子节点沿垂直方向排列，交替左右展开
  // 计算左/右两侧的最大扩展宽度
  let leftMaxWidth = 0
  let rightMaxWidth = 0
  let totalChildrenHeight = 0
  for (let i = 0; i < children.length; i++) {
    const cs = sizeMap.get(children[i].id)!
    if (i % 2 === 0) {
      // 左侧：子节点宽度 + horizontalGap
      leftMaxWidth = Math.max(leftMaxWidth, cs.width + options.horizontalGap)
    } else {
      // 右侧：子节点宽度 + horizontalGap
      rightMaxWidth = Math.max(rightMaxWidth, cs.width + options.horizontalGap)
    }
    totalChildrenHeight += childBBs[i].height
    if (i < children.length - 1) totalChildrenHeight += DESIGN_PADDING
  }

  const width = leftMaxWidth + size.width + rightMaxWidth
  const height = size.height + DESIGN_PADDING + totalChildrenHeight
  // x 偏移：左子树扩展时为负值
  const x = -leftMaxWidth

  const bb: BoundaryBounds = { x, y: 0, width, height }
  bbMap.set(node.id, bb)
  return bb
}

function subtreeTotalWidth(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.width
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.width
  let maxChildWidth = 0
  for (const child of children) {
    maxChildWidth = Math.max(maxChildWidth, subtreeTotalWidth(child, options, sizeMap))
  }
  return size.width + options.horizontalGap + maxChildWidth
}

function layoutSubtree(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  bbMap: Map<string, BoundaryBounds>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
): void {
  const size = sizeMap.get(node.id)!
  const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node), options)

  // branchHeight = 子树在垂直方向的总跨度
  let branchHeight = size.height
  const children = getAttachedChildren(node)
  if (!isCollapsed(node) && children.length > 0) {
    let total = 0
    for (let i = 0; i < children.length; i++) {
      const cBB = bbMap.get(children[i].id)!
      total += cBB.height
      if (i < children.length - 1) total += DESIGN_PADDING
    }
    branchHeight = Math.max(size.height, total)
  }

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight })

  if (isCollapsed(node) || children.length === 0) return

  // 双约束定位（对齐 snowbrush boundaryBounds 算法）
  // SB 核心公式：
  //   offsetYOfTopics = prevShapeOffsetY + TOPIC_SPACING - currBoundsY
  //   offsetYOfBounds = prevShapeOffsetY + prevBoundsHeight + prevBoundsY - currBoundsY
  //   y = prevPosY + Math.max(offsetYOfTopics, offsetYOfBounds)

  let prevY = y
  let prevBBHeight = size.height  // 初始：父节点自身高度作为"前一个"高度

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const cs = sizeMap.get(child.id)!
    const cBB = bbMap.get(child.id)!

    // 约束 1：基于节点间距 — 前一个位置底部 + 间距
    const offsetYOfTopics = prevY + DESIGN_PADDING
    // 约束 2：基于 boundaryBounds — 前一个位置 + 前一个 BB 高度
    //   确保当前子节点的子树不与前一个子节点的子树重叠
    const offsetYOfBounds = prevY + prevBBHeight

    // Y 位置取两个候选值的较大值
    const childY = Math.max(offsetYOfTopics, offsetYOfBounds)

    // X 位置：交替左右
    const childX = (i % 2 === 0)
      ? x - cs.width - options.horizontalGap   // 左侧
      : x + size.width + options.horizontalGap   // 右侧

    layoutSubtree(child, childX, childY, options, sizeMap, bbMap, nodes)

    // 更新 prev：使用当前子节点的 BB 高度（包含其所有后代）
    prevY = childY
    prevBBHeight = cBB.height
  }
}

export const timelineThroughVerticalLayoutAlgorithm: LayoutAlgorithm = {
  name: 'timeline-through-vertical',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSimpleSubtree(root, options, sizeMap)

    // 计算 boundaryBounds（双约束定位的基础）
    const bbMap = new Map<string, BoundaryBounds>()
    computeBoundaryBounds(root, options, sizeMap, bbMap)

    const totalW = subtreeTotalWidth(root, options, sizeMap)
    const rootX = (totalW - sizeMap.get(root.id)!.width) / 2
    const rootY = options.rootOffsetX

    layoutSubtree(root, rootX, rootY, options, sizeMap, bbMap, nodes)

    // 平移到正数区
    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      minX = Math.min(minX, l.x)
      minY = Math.min(minY, l.y)
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }
    if (minX < 0 || minY < 0) {
      const ox = minX < 0 ? -minX : 0
      const oy = minY < 0 ? -minY : 0
      for (const l of nodes.values()) {
        l.x += ox
        l.y += oy
      }
      maxX += ox
      maxY += oy
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
