// TODO: 与 XMind treetable 行列对齐验证
/**
 * TreeTable 布局算法
 *
 * 将思维导图转换为表格形式，每个节点占一行，子节点展开为列
 */
import type { NodeDesc } from '@tomind/schema'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { getTitle, getFontSize, isCollapsed, getAttachedChildren, findRootTopic } from './layout-utils'

interface NodeSize {
  width: number
  height: number
}

function measureNode(node: NodeDesc, options: LayoutOptions): NodeSize {
  const fontSize = getFontSize(node)
  const title = getTitle(node)
  const { width, height } = measureTextSize(title, fontSize, options)
  return {
    width: width + options.nodePadding.left + options.nodePadding.right,
    height: height + options.nodePadding.top + options.nodePadding.bottom,
  }
}

function measureSubtree(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>): void {
  sizeMap.set(node.id, measureNode(node, options))
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureSubtree(child, options, sizeMap)
    }
  }
}

/** 计算树的最大深度 */
function getMaxDepth(node: NodeDesc, depth = 0): number {
  if (isCollapsed(node)) return depth
  const children = getAttachedChildren(node)
  if (children.length === 0) return depth
  let maxChildDepth = 0
  for (const child of children) {
    maxChildDepth = Math.max(maxChildDepth, getMaxDepth(child, depth + 1))
  }
  return maxChildDepth
}

/** 收集所有节点 */
function collectAllNodes(node: NodeDesc, nodes: NodeDesc[] = []): NodeDesc[] {
  nodes.push(node)
  const children = getAttachedChildren(node)
  for (const child of children) {
    collectAllNodes(child, nodes)
  }
  return nodes
}

export const treeTableLayoutAlgorithm: LayoutAlgorithm = {
  name: 'treetable',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap)

    // 收集所有节点
    const allNodes = collectAllNodes(root)

    // 计算列宽（每列取最大宽度）
    const maxDepth = getMaxDepth(root)
    const colWidths: number[] = new Array(maxDepth + 1).fill(0)
    for (const node of allNodes) {
      const depth = getNodeDepth(node, root)
      const size = sizeMap.get(node.id)!
      colWidths[depth] = Math.max(colWidths[depth], size.width)
    }

    // 计算行高（每行取最大高度）
    const nodesByLevel: NodeDesc[][] = []
    function collectByLevel(node: NodeDesc, level: number) {
      if (!nodesByLevel[level]) nodesByLevel[level] = []
      nodesByLevel[level].push(node)
      const children = getAttachedChildren(node)
      for (const child of children) {
        collectByLevel(child, level + 1)
      }
    }
    collectByLevel(root, 0)

    const rowHeights: number[] = []
    for (const levelNodes of nodesByLevel) {
      let maxH = 0
      for (const node of levelNodes) {
        const size = sizeMap.get(node.id)!
        maxH = Math.max(maxH, size.height)
      }
      rowHeights.push(maxH)
    }

    // 计算位置
    let currentY = 0
    for (let row = 0; row < nodesByLevel.length; row++) {
      const levelNodes = nodesByLevel[row] || []
      let currentX = 0
      for (let col = 0; col < levelNodes.length; col++) {
        const node = levelNodes[col]
        const size = sizeMap.get(node.id)!
        const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node), options)

        // 居中对齐
        const cellWidth = colWidths[getNodeDepth(node, root)]
        const cellHeight = rowHeights[row]
        const x = currentX + (cellWidth - size.width) / 2
        const y = currentY + (cellHeight - size.height) / 2

        nodes.set(node.id, {
          x,
          y,
          width: size.width,
          height: size.height,
          titleWidth,
          titleHeight,
          branchHeight: cellHeight,
        })

        currentX += cellWidth + options.horizontalGap
      }
      currentY += rowHeights[row] + options.verticalGap
    }

    // 计算总尺寸
    let totalWidth = 0
    let totalHeight = 0
    for (const layout of nodes.values()) {
      totalWidth = Math.max(totalWidth, layout.x + layout.width)
      totalHeight = Math.max(totalHeight, layout.y + layout.height)
    }

    return { nodes, totalWidth, totalHeight }
  },
}

function getNodeDepth(node: NodeDesc, root: NodeDesc): number {
  function findDepth(current: NodeDesc, targetId: string, depth: number): number {
    if (current.id === targetId) return depth
    const children = getAttachedChildren(current)
    for (const child of children) {
      const found = findDepth(child, targetId, depth + 1)
      if (found >= 0) return found
    }
    return -1
  }
  return findDepth(root, node.id, 0)
}
