// TODO: 与 XMind treetable 行列对齐验证
/**
 * TreeTable 布局算法
 *
 * 将思维导图转换为表格形式，每个节点占一行，子节点展开为列
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine, ResolvedStyle } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { getTitle, getFontSize, getFontFamily, getFontWeight, getFontStyle, isCollapsed, getAttachedChildren, findRootTopic, getAttr } from './layout-utils'
import { measureTitleOnlyNode } from './part-node-size'

interface NodeSize {
  width: number
  height: number
  titleWidth: number
  titleHeight: number
}

function parseStyleValue(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return isNaN(num) ? fallback : num
  }
  return fallback
}

/**
 * 读取节点的间距配置，对齐 logic-layout.ts 的 getNodeSpacing 模式：
 * - spacingMajor / spacingMinor 从 resolved style 读取
 * - padding 从 resolved style margin 属性 + attrs.style.margin 统一回退
 */
function getNodeSpacing(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
) {
  let style: ResolvedStyle | undefined
  if (styleEngine && state) {
    style = styleEngine.computeStyle(state, node.id)
  }

  if (!style) {
    return {
      horizontalGap: options.horizontalGap,
      verticalGap: options.verticalGap,
      padding: options.nodePadding,
    }
  }

  const majorGap = parseStyleValue(style.spacingMajor, options.horizontalGap)
  const minorGap = parseStyleValue(style.spacingMinor, options.verticalGap)

  // 对齐 snowbrush getTopicMargins: 先读统一 margin，有值则四方向使用，否则 fallback 到分侧值
  const rawStyle = getAttr<Record<string, unknown>>(node, 'style')
  const rawMargin = rawStyle?.margin

  let top: number
  let bottom: number
  let left: number
  let right: number

  if (typeof rawMargin === 'number' && rawMargin > 0) {
    top = bottom = left = right = rawMargin
  } else if (typeof rawMargin === 'string') {
    const parsed = parseFloat(rawMargin)
    if (!isNaN(parsed) && parsed > 0) {
      top = bottom = left = right = parsed
    } else {
      top = parseStyleValue(style.marginTop, options.nodePadding.top)
      bottom = parseStyleValue(style.marginBottom, options.nodePadding.bottom)
      left = parseStyleValue(style.marginLeft, options.nodePadding.left)
      right = parseStyleValue(style.marginRight, options.nodePadding.right)
    }
  } else {
    top = parseStyleValue(style.marginTop, options.nodePadding.top)
    bottom = parseStyleValue(style.marginBottom, options.nodePadding.bottom)
    left = parseStyleValue(style.marginLeft, options.nodePadding.left)
    right = parseStyleValue(style.marginRight, options.nodePadding.right)
  }

  return {
    horizontalGap: majorGap,
    verticalGap: minorGap,
    padding: { top, right, bottom, left },
  }
}

function measureNodeSize(
  node: NodeDesc,
  padding: { top: number; right: number; bottom: number; left: number },
  options: LayoutOptions,
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): NodeSize {
  const result = measureTitleOnlyNode(node, padding, options, styleEngine, state)
  return {
    width: result.width,
    height: result.height,
    titleWidth: result.titleWidth,
    titleHeight: result.titleHeight,
  }
}

function measureSubtree(
  node: NodeDesc,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): void {
  const spacing = getNodeSpacing(node, options, styleEngine ?? null, state ?? null)
  sizeMap.set(node.id, measureNodeSize(node, spacing.padding, options, styleEngine, state))
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureSubtree(child, options, sizeMap, styleEngine, state)
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
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap, styleEngine, state)

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
        const spacing = getNodeSpacing(node, options, styleEngine, state)
        const fontFamily = getFontFamily(node, styleEngine, state)
        const fontWeight = getFontWeight(node, styleEngine, state)
        const fontStyle = getFontStyle(node, styleEngine, state)
        const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node, styleEngine, state), options, fontFamily, fontWeight, fontStyle)

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

        currentX += cellWidth + spacing.horizontalGap
      }
      currentY += rowHeights[row] + getNodeSpacing(levelNodes[0], options, styleEngine, state).verticalGap
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
