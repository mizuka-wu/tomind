// TODO: 与 XMind matrix 行列对齐验证
/**
 * Matrix 布局算法
 *
 * 计算 Matrix 布局中每个单元格的位置和大小
 */

import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { getAttr } from './layout-utils'
import {
  ColumnMap,
  Matrix,
  MatrixContainer,
  MatrixCell,
  LEFT,
  MIDDLE,
} from './matrix'
import { measureTextSize } from './layout-engine'
import { getTitle, getFontSize } from './layout-utils'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import { getNodeSpacing } from './spacing-utils'
import { delegateLogicSubtree } from './skeleton-delegate'
import { measureTitleOnlyNode } from './part-node-size'

/**
 * snowbrush matrix cell 的 minSize = topicBounds（title + 2*margin + bw）；
 * MatrixCell.getMinSize 会再加 padding*2（CELL_PADDING=5）。
 */
function measureMinSize(node: NodeDesc, options: LayoutOptions, styleEngine?: any, state?: any): { width: number; height: number } {
  const spacing = getNodeSpacing(node, options, styleEngine ?? null, state ?? null)
  const r = measureTitleOnlyNode(node, spacing.padding, options, styleEngine ?? null, state ?? null)
  return { width: r.width, height: r.height }
}

/** 标签文本 cell 的 minSize = 文本尺寸（padding 由 MatrixCell 追加） */
function measureLabelMinSize(text: string): { width: number; height: number } {
  const { width, height } = measureTextSize(text, 14, DEFAULT_LAYOUT_OPTIONS)
  return { width, height }
}

// ==================== Matrix 布局算法 ====================

export const matrixLayoutAlgorithm: LayoutAlgorithm = {
  name: 'matrix',

  layout(
    node: NodeDesc,
    options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS,
    styleEngine: StyleEngine | null = null,
    state: SheetState | null = null,
  ): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()

    // 获取子节点
    const children = node.children?.attached || []
    if (children.length === 0) {
      return { nodes, totalWidth: 0, totalHeight: 0 }
    }

    // 创建列映射
    const columnMap = createColumnMap(children)

    // 创建网格
    const matrixGrid = createMatrixGrid(node, columnMap, false, options, styleEngine, state)

    // 初始化位置
    initGrid(matrixGrid)

    // 将结果转换为 LayoutResult
    const cells = matrixGrid.getCells()
    for (const cell of cells) {
      // 只取分支 cell（标签 cell 的 item 是字符串）
      if (cell.item && typeof cell.item === 'object' && cell.item.id) {
        const pos = cell.getAbsPos()
        const ip = cell.itemPos ?? { x: 0, y: 0 }
        // 节点盒 = topic bounds = cell 内 itemPos 处、尺寸为 minSize（不含 cell padding）
        const topicSize = cell._minSize ?? { width: cell.size?.width ?? 0, height: cell.size?.height ?? 0 }
        nodes.set(cell.item.id, {
          x: pos.x + ip.x,
          y: pos.y + ip.y,
          width: topicSize.width,
          height: topicSize.height,
          titleWidth: topicSize.width,
          titleHeight: topicSize.height,
          branchHeight: topicSize.height,
        })
      }
    }

    // cell 内嵌套子结构（SB spreadsheet 的 cell 内由子结构继续布局）：
    // 对每个分支 cell 的子孙用 skeleton 委派（logic）布局，锚定到该节点已放置的位置
    const depthOf = new Map<string, number>()
    const walkDepth = (n: NodeDesc, d: number) => {
      depthOf.set(n.id, d)
      for (const c of n.children?.attached || []) walkDepth(c, d + 1)
    }
    walkDepth(node, 0)
    for (const cell of cells) {
      if (!(cell.item && typeof cell.item === 'object' && cell.item.id)) continue
      const placed = nodes.get(cell.item.id)
      if (!placed) continue
      const del = delegateLogicSubtree(cell.item, placed.x, placed.y + placed.height / 2, depthOf.get(cell.item.id) ?? 0, options, styleEngine, state)
      if (!del) continue
      for (const [id, nl] of del.nodes) {
        // 已被表格 cell 定位的节点不覆盖（cell 优先），只补未覆盖的子孙
        if (id === cell.item.id || nodes.has(id)) continue
        nodes.set(id, nl)
      }
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

// ==================== 工具函数 ====================

function createColumnMap(children: readonly NodeDesc[]): ColumnMap {
  const columnMap = new ColumnMap(children.length)
  children.forEach((child, index) => {
    const grandChildren = child.children?.attached || []
    grandChildren.forEach((gChild) => {
      const key = getAttr<string>(gChild, 'label') || ''
      const cell = columnMap.getCell(index, key)
      cell.items.push(gChild)
    })
  })
  return columnMap
}

function createMatrixGrid(node: NodeDesc, columnMap: ColumnMap, isTranspose: boolean, options: LayoutOptions, styleEngine?: any, state?: any): MatrixContainer {
  const children = node.children?.attached || []

  // 主单元格
  const mainCell = new MatrixCell(node, { align: LEFT, minSize: measureMinSize(node, options, styleEngine, state) })

  // 标签行
  const labelRow = createLabelRow(columnMap)

  // 分支行
  const branchRows = createBranchRows(columnMap, mainCell, children, options, styleEngine, state)

  const totalRows = [labelRow, ...branchRows]
  const matrix = new Matrix(totalRows, isTranspose)
  const matrixGrid = new MatrixContainer([mainCell, matrix])
  matrixGrid.isTranspose = isTranspose

  return matrixGrid
}

function createLabelRow(columnMap: ColumnMap): MatrixCell[] {
  const firstCell = new MatrixCell(undefined, { align: LEFT })
  firstCell._isNull = true

  const otherCells = columnMap.getColumns().map((column) => {
    const key = typeof column?.key === 'string' ? column.key : ''
    const cell = new MatrixCell(column?.key, { align: MIDDLE, minSize: key ? measureLabelMinSize(key) : undefined })
    return cell
  })

  return [firstCell, ...otherCells]
}

function createBranchRows(columnMap: ColumnMap, mainCell: MatrixCell, branches: readonly NodeDesc[], options: LayoutOptions, styleEngine?: any, state?: any): (MatrixCell | MatrixContainer)[][] {
  return branches.map((branch, i) => {
    const headCell = new MatrixCell(branch, { align: LEFT, minSize: measureMinSize(branch, options, styleEngine, state) })
    headCell._parentCell = mainCell

    const otherContainers = columnMap
      .getColumns()
      .filter((column): column is NonNullable<typeof column> => Boolean(column))
      .map((column) => {
        const { items } = column.cells[i]
        const cells = items.map((item: any) => {
          const cell = new MatrixCell(item, { align: LEFT, minSize: measureMinSize(item, options, styleEngine, state) })
          cell._parentCell = headCell
          return cell
        })
        if (cells.length === 0) {
          const emptyCell = new MatrixCell(undefined, { align: LEFT })
          emptyCell._parentCell = headCell
          emptyCell._isNull = true
          cells.push(emptyCell)
        }
        return new MatrixContainer(cells)
      })

    return [headCell, ...otherContainers]
  })
}

function initGrid(matrixGrid: MatrixContainer) {
  const size = matrixGrid.getMinSize()
  matrixGrid.setSize(size)
  matrixGrid.setPos({ x: 0, y: 0 })
}


