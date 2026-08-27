/**
 * BaseLayout — 布局算法公共基类
 *
 * 提供跨布局复用的定位算法：
 * - 累积定位（子节点沿主轴方向依次排列）
 * - 子树尺寸递归计算
 * - 父节点居中
 * - posYoffsetToClosestChild（snowbrush 对齐）
 * - maxOffset 对齐（boundaryBounds 与 topicView 偏移）
 * - boundaryBounds 计算
 * - 子树平移
 */
import type { NodeDesc } from '@tomind/schema'
import type { SheetState } from '@tomind/state'
import type { StyleEngine } from '@tomind/style'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions, NodeLayout } from './layout-engine'
import { isCollapsed, getAttachedChildren } from './layout-utils'

// ─── 公共类型 ───

export interface BoundaryBounds {
  x: number
  y: number
  width: number
  height: number
}

// ─── 抽象基类 ───

export abstract class BaseLayout implements LayoutAlgorithm {
  abstract readonly name: string

  abstract layout(
    doc: NodeDesc,
    options: LayoutOptions,
    styleEngine?: StyleEngine | null,
    state?: SheetState | null,
  ): LayoutResult

  // ── 累积定位 ──

  /**
   * 沿主轴累积定位子节点，返回每个子节点的起始位置。
   * @param children 子节点列表
   * @param startPos 主轴起始位置（第一个子节点的中心点）
   * @param minorSpacing 兄弟间距
   * @param getAxisSize 获取单个子节点在主轴方向的尺寸（含 outsidePadding）
   * @returns 每个子节点在主轴方向的起始位置（中心点）
   */
  protected calcCumulativePositions(
    children: readonly NodeDesc[],
    startPos: number,
    minorSpacing: number,
    getAxisSize: (child: NodeDesc, index: number) => number,
  ): number[] {
    const n = children.length
    if (n === 0) return []

    // 计算总高度
    let totalSize = 0
    const sizes: number[] = []
    for (let i = 0; i < n; i++) {
      const s = getAxisSize(children[i], i)
      sizes.push(s)
      totalSize += s
      if (i < n - 1) totalSize += minorSpacing
    }

    // 从 startPos - totalSize/2 开始累积
    let pos = startPos - totalSize / 2
    const positions: number[] = []
    for (let i = 0; i < n; i++) {
      positions.push(pos + sizes[i] / 2)
      pos += sizes[i]
      if (i < n - 1) pos += minorSpacing
    }
    return positions
  }

  // ── 子树尺寸递归 ──

  /**
   * 递归计算子树在主轴方向的总跨度。
   * @param node 根节点
   * @param sizeMap 节点尺寸映射
   * @param getAxisSize 获取单个节点在主轴方向的尺寸
   * @param spacing 兄弟间距
   */
  protected calcSubtreeAxisSize(
    node: NodeDesc,
    sizeMap: Map<string, { width: number; height: number }>,
    getAxisSize: (node: NodeDesc) => number,
    spacing: number,
  ): number {
    const selfSize = getAxisSize(node)
    if (isCollapsed(node)) return selfSize

    const children = getAttachedChildren(node)
    if (children.length === 0) return selfSize

    let total = 0
    for (let i = 0; i < children.length; i++) {
      total += this.calcSubtreeAxisSize(children[i], sizeMap, getAxisSize, spacing)
      if (i < children.length - 1) total += spacing
    }
    return Math.max(selfSize, total)
  }

  // ── 父节点居中 ──

  /**
   * 计算父节点在子节点总跨度中的居中偏移。
   * @returns 偏移量（加到父节点的主轴位置上）
   */
  protected calcParentCenterOffset(
    childrenTotalSize: number,
    parentSize: number,
  ): number {
    return (childrenTotalSize - parentSize) / 2
  }

  // ── posYoffsetToClosestChild ──

  /**
   * 计算父节点 Y 偏移，使父节点尽可能靠近最近的子节点（snowbrush 对齐）。
   * 在 snowbrush 中用于 map 布局的 calSidePos，使连接线最短。
   *
   * @param children 子节点列表
   * @param nodes 已布局的节点映射
   * @param parentCenterY 父节点的 Y 中心点
   * @returns Y 偏移量（正值=向下移动）
   */
  protected calcPosYOffsetToClosestChild(
    children: readonly NodeDesc[],
    nodes: Map<string, NodeLayout>,
    parentCenterY: number,
  ): number {
    if (children.length === 0) return 0

    let minDistance = Infinity
    let closestOffset = 0

    for (const child of children) {
      const nl = nodes.get(child.id)
      if (!nl) continue
      const childCenterY = nl.y + nl.height / 2
      const offset = childCenterY - parentCenterY
      if (Math.abs(offset) < Math.abs(minDistance)) {
        minDistance = Math.abs(offset)
        closestOffset = offset
      }
    }

    return closestOffset
  }

  // ── maxOffset 对齐 ──

  /**
   * 计算同侧子节点中 boundaryBounds 与 topicView 的最大偏移量。
   * 用于 X offset 对齐：使所有子节点的内边缘对齐。
   *
   * @param children 子节点列表
   * @param nodes 已布局的节点映射
   * @param boundaryBoundsMap boundaryBounds 映射
   * @param side 'right' 或 'left'
   * @returns 每个子节点的偏移量数组和最大偏移量
   */
  protected calcMaxOffset(
    children: readonly NodeDesc[],
    nodes: Map<string, NodeLayout>,
    boundaryBoundsMap: Map<string, BoundaryBounds>,
    side: 'right' | 'left',
  ): { offsets: number[]; maxOffset: number } {
    const offsets: number[] = []
    let maxOffset = 0

    for (const child of children) {
      const nl = nodes.get(child.id)
      const bb = boundaryBoundsMap.get(child.id)
      if (!nl || !bb) { offsets.push(0); continue }

      let offset: number
      if (side === 'right') {
        // 右侧子节点：boundary 向左延伸的距离
        offset = nl.x - bb.x
      } else {
        // 左侧子节点：boundary 向右延伸的距离
        offset = (bb.x + bb.width) - (nl.x + nl.width)
      }
      offsets.push(Math.max(0, offset))
      maxOffset = Math.max(maxOffset, Math.max(0, offset))
    }

    return { offsets, maxOffset }
  }

  // ── boundaryBounds 计算 ──

  /**
   * 递归计算节点的 boundaryBounds（包含所有后代节点的包围盒）。
   */
  protected computeBoundaryBounds(
    node: NodeDesc,
    nodes: Map<string, NodeLayout>,
    boundaryBoundsMap: Map<string, BoundaryBounds>,
  ): BoundaryBounds {
    const nl = nodes.get(node.id)
    if (!nl) return { x: 0, y: 0, width: 0, height: 0 }

    let minX = nl.x
    let minY = nl.y
    let maxX = nl.x + nl.width
    let maxY = nl.y + nl.height

    if (!isCollapsed(node)) {
      for (const child of getAttachedChildren(node)) {
        const childBounds = this.computeBoundaryBounds(child, nodes, boundaryBoundsMap)
        minX = Math.min(minX, childBounds.x)
        minY = Math.min(minY, childBounds.y)
        maxX = Math.max(maxX, childBounds.x + childBounds.width)
        maxY = Math.max(maxY, childBounds.y + childBounds.height)
      }
    }

    const bounds: BoundaryBounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
    boundaryBoundsMap.set(node.id, bounds)
    return bounds
  }

  // ── 子树平移 ──

  /**
   * 平移整棵子树的所有节点。
   */
  protected shiftSubtree(
    node: NodeDesc,
    dx: number,
    dy: number,
    nodes: Map<string, NodeLayout>,
  ): void {
    const nl = nodes.get(node.id)
    if (!nl) return
    nl.x += dx
    nl.y += dy
    if (!isCollapsed(node)) {
      for (const child of getAttachedChildren(node)) {
        this.shiftSubtree(child, dx, dy, nodes)
      }
    }
  }

  // ── 辅助：平移到正数区 ──

  protected normalizePositions(nodes: Map<string, NodeLayout>): { totalWidth: number; totalHeight: number } {
    let minX = Infinity, minY = Infinity
    for (const l of nodes.values()) {
      minX = Math.min(minX, l.x)
      minY = Math.min(minY, l.y)
    }
    for (const l of nodes.values()) {
      l.x -= minX
      l.y -= minY
    }
    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }
    return { totalWidth: maxX, totalHeight: maxY }
  }
}
