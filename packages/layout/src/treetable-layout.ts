/**
 * TreeTable 布局算法
 *
 * 对齐 snowbrush 的 treeTable 结构：
 * - 树转表格：每行 = 根到叶子的路径，列 = 深度层级
 * - 父节点跨行（跨其所有后代叶子）
 * - 列宽 = 单行最大宽度 + 扩展宽度
 * - 行高 = 单列最大高度 + 扩展高度
 * - 节点在单元格内左对齐（默认 textAlign=left）
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine, ResolvedStyle } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import { isCollapsed, getAttachedChildren, findRootTopic, getAttr } from './layout-utils'
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

/**
 * 收集所有叶子节点到 root 的路径
 * 每个路径 = 一行，列 = 深度层级
 * 父节点在多行中出现 = 跨行
 */
type TableRow = (NodeDesc | null)[]

function buildTable(root: NodeDesc, maxDepth: number): TableRow[] {
  const rows: TableRow[] = []

  function walk(node: NodeDesc, path: (NodeDesc | null)[], depth: number) {
    const newPath = [...path]
    // 填充 null 到之前缺失的深度
    while (newPath.length < depth) {
      newPath.push(null)
    }
    newPath.push(node)

    const children = isCollapsed(node) ? [] : getAttachedChildren(node)
    if (children.length === 0) {
      // 叶子节点 = 一行
      while (newPath.length <= maxDepth) {
        newPath.push(null)
      }
      rows.push(newPath)
    } else {
      for (const child of children) {
        walk(child, newPath, depth + 1)
      }
    }
  }

  walk(root, [], 0)
  return rows
}

/** 获取节点在表格中首次出现的行索引 */
function getFirstRow(rows: TableRow[], nodeId: string): number {
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[i].length; j++) {
      if (rows[i][j]?.id === nodeId) return i
    }
  }
  return -1
}

/** 获取节点在表格中最后出现的行索引 */
function getLastRow(rows: TableRow[], nodeId: string): number {
  for (let i = rows.length - 1; i >= 0; i--) {
    for (let j = 0; j < rows[i].length; j++) {
      if (rows[i][j]?.id === nodeId) return i
    }
  }
  return -1
}

/** 获取节点的扩展宽度（padding + border）对齐 SB getExtendWidth */
function getExtendWidth(
  node: NodeDesc,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  options: LayoutOptions,
): number {
  const spacing = getNodeSpacing(node, options, styleEngine, state)
  const padding = spacing.padding
  // SB: borderWidth + marginLeft + marginRight
  // TM 没有 borderWidth，用 padding left + right 模拟
  return padding.left + padding.right
}

function getExtendHeight(
  node: NodeDesc,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  options: LayoutOptions,
): number {
  const spacing = getNodeSpacing(node, options, styleEngine, state)
  const padding = spacing.padding
  return padding.top + padding.bottom
}

export const treeTableLayoutAlgorithm: LayoutAlgorithm = {
  name: 'treetable',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    // 测量所有节点尺寸
    const sizeMap = new Map<string, NodeSize>()
    function measureSubtree(node: NodeDesc): void {
      const spacing = getNodeSpacing(node, options, styleEngine, state)
      sizeMap.set(node.id, measureNodeSize(node, spacing.padding, options, styleEngine, state))
      if (!isCollapsed(node)) {
        for (const child of getAttachedChildren(node)) {
          measureSubtree(child)
        }
      }
    }
    measureSubtree(root)

    // 计算树的最大深度
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
    const maxDepth = getMaxDepth(root)

    // 构建表格：每行 = 根到叶子的路径
    const rows = buildTable(root, maxDepth)

    // 收集所有唯一节点
    const allNodeIds = new Set<string>()
    for (const row of rows) {
      for (const cell of row) {
        if (cell) allNodeIds.add(cell.id)
      }
    }

    // SB: calcTableCellWidth - 对齐每列
    // 单行项：max(topicBounds.width + extendWidth)
    // 跨行项：累加
    const colCount = maxDepth + 1
    const cellWidths: number[] = new Array(colCount).fill(0)

    // 先计算每列单行项的最大宽度
    for (let col = 0; col < colCount; col++) {
      const singleItems: { node: NodeDesc; extendW: number }[] = []
      for (const row of rows) {
        const item = row[col]
        if (!item) continue
        // 检查是否是跨行项（同一行中多次出现）
        // SB 的 isExpandItem 是针对同一行的，但 TM 的表格每列只有一个节点
        // 所以我们用不同方式判断：如果节点在多行中出现，它是跨行项
        const firstRow = getFirstRow(rows, item.id)
        const lastRow = getLastRow(rows, item.id)
        if (firstRow === lastRow) {
          // 单行项
          const extendW = getExtendWidth(item, styleEngine, state, options)
          singleItems.push({ node: item, extendW })
        }
      }
      if (singleItems.length > 0) {
        cellWidths[col] = Math.max(...singleItems.map(({ node, extendW }) => {
          const size = sizeMap.get(node.id)!
          return size.width + extendW
        }))
      }
    }

    // 计算跨行项的宽度
    for (const nodeId of allNodeIds) {
      const firstRow = getFirstRow(rows, nodeId)
      const lastRow = getLastRow(rows, nodeId)
      if (firstRow < lastRow) {
        // 跨行项：宽度 = sum(跨越的列宽)
        const item = rows[firstRow].find(n => n?.id === nodeId)
        if (item) {
          const size = sizeMap.get(nodeId)!
          const extendW = getExtendWidth(item, styleEngine, state, options)
          let spannedWidth = 0
          for (let col = 0; col < colCount; col++) {
            if (rows[firstRow][col]?.id === nodeId) {
              spannedWidth += cellWidths[col]
            }
          }
          const neededWidth = size.width + extendW
          if (spannedWidth < neededWidth) {
            // 需要额外宽度
            const extra = neededWidth - spannedWidth
            // 找到最后一个相关列
            for (let col = colCount - 1; col >= 0; col--) {
              if (rows[firstRow][col]?.id === nodeId) {
                cellWidths[col] += extra
                break
              }
            }
          }
        }
      }
    }

    // SB: calcTableCellHeight - 对齐每行
    // 单列项：max(topicBounds.height + extendHeight)
    const cellHeights: number[] = new Array(rows.length).fill(0)
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      let maxH = 0
      for (let col = 0; col < colCount; col++) {
        const item = rows[rowIdx][col]
        if (!item) continue
        const firstRow = getFirstRow(rows, item.id)
        const lastRow = getLastRow(rows, item.id)
        if (firstRow === lastRow) {
          // 单行项
          const size = sizeMap.get(item.id)!
          const extendH = getExtendHeight(item, styleEngine, state, options)
          maxH = Math.max(maxH, size.height + extendH)
        }
      }
      cellHeights[rowIdx] = maxH || (rows[rowIdx].find(n => n !== null) ? sizeMap.get(rows[rowIdx].find(n => n !== null)!.id)!.height : 40)
    }

    // 计算跨行项的高度调整
    for (const nodeId of allNodeIds) {
      const firstRow = getFirstRow(rows, nodeId)
      const lastRow = getLastRow(rows, nodeId)
      if (firstRow < lastRow) {
        // 跨行项：高度 = sum(跨越的行高)
        const item = rows[firstRow].find(n => n?.id === nodeId)
        if (item) {
          const size = sizeMap.get(nodeId)!
          const extendH = getExtendHeight(item, styleEngine, state, options)
          let spannedHeight = 0
          for (let r = firstRow; r <= lastRow; r++) {
            spannedHeight += cellHeights[r]
          }
          const neededHeight = size.height + extendH
          if (spannedHeight < neededHeight) {
            const extra = (neededHeight - spannedHeight) / (lastRow - firstRow + 1)
            for (let r = firstRow; r <= lastRow; r++) {
              cellHeights[r] += extra
            }
          }
        }
      }
    }

    // SB: calcTableCellPosition - 累加列宽/行高
    const cellXPositions: number[] = new Array(colCount).fill(0)
    let accX = 0
    for (let col = 0; col < colCount; col++) {
      cellXPositions[col] = accX
      accX += cellWidths[col]
    }

    const cellYPositions: number[] = new Array(rows.length).fill(0)
    let accY = 0
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      cellYPositions[rowIdx] = accY
      accY += cellHeights[rowIdx]
    }

    // SB: calcTableCellItemPosition + calcTableBounds
    // 节点在单元格内左对齐（默认 textAlign=left），垂直居中
    const nodePositions = new Map<string, { x: number; y: number; cellWidth: number; cellHeight: number }>()

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      for (let col = 0; col < colCount; col++) {
        const item = rows[rowIdx][col]
        if (!item) continue

        const existing = nodePositions.get(item.id)
        if (existing) continue // 已经定位过（跨行项只定位一次）

        const firstRow = getFirstRow(rows, item.id)
        const lastRow = getLastRow(rows, item.id)

        // 计算跨行项的单元格高度
        let totalCellHeight = 0
        for (let r = firstRow; r <= lastRow; r++) {
          totalCellHeight += cellHeights[r]
        }

        // 计算跨列的单元格宽度
        let totalCellWidth = 0
        for (let c = 0; c < colCount; c++) {
          if (rows[firstRow][c]?.id === item.id) {
            totalCellWidth += cellWidths[c]
          }
        }

        nodePositions.set(item.id, {
          x: cellXPositions[col],
          y: cellYPositions[firstRow],
          cellWidth: totalCellWidth,
          cellHeight: totalCellHeight,
        })
      }
    }

    // 设置最终位置
    for (const [nodeId, pos] of nodePositions) {
      const size = sizeMap.get(nodeId)!
      // SB: getItemCellXY - 左对齐（默认），垂直居中
      const extendW = 0 // 已经包含在 cellWidth 中
      const x = pos.x + extendW / 2
      const y = pos.y + (pos.cellHeight - size.height) / 2

      nodes.set(nodeId, {
        x,
        y,
        width: size.width,
        height: size.height,
        titleWidth: size.titleWidth,
        titleHeight: size.titleHeight,
        branchHeight: pos.cellHeight,
      })
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
