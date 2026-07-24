// TODO: 与 XMind matrix 行列对齐验证
/**
 * Matrix 布局算法
 *
 * 计算 Matrix 布局中每个单元格的位置和大小
 */

import type { NodeDesc } from '@tomind/schema'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import {
  ColumnMap,
  Matrix,
  MatrixContainer,
  MatrixCell,
  LEFT,
  MIDDLE,
} from './matrix'

// ==================== Matrix 布局算法 ====================

export const matrixLayoutAlgorithm: LayoutAlgorithm = {
  name: 'matrix',

  layout(
    node: NodeDesc,
    _options: LayoutOptions,
  ): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()

    // 获取子节点
    const children = node.children?.TOPIC || []
    if (children.length === 0) {
      return { nodes, totalWidth: 0, totalHeight: 0 }
    }

    // 创建列映射
    const columnMap = createColumnMap(children)

    // 创建网格
    const matrixGrid = createMatrixGrid(node, columnMap, false)

    // 初始化位置
    initGrid(matrixGrid)

    // 将结果转换为 LayoutResult
    const cells = matrixGrid.getCells()
    for (const cell of cells) {
      if (cell.item) {
        const pos = cell.getAbsPos()
        nodes.set(cell.item.id, {
          x: pos.x,
          y: pos.y,
          width: cell.size?.width || 0,
          height: cell.size?.height || 0,
          titleWidth: 0,
          titleHeight: 0,
          branchHeight: 0,
        })
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
    const grandChildren = child.children?.TOPIC || []
    grandChildren.forEach((gChild) => {
      const key = (gChild.attrs?.label as string) || ''
      const cell = columnMap.getCell(index, key)
      cell.items.push(gChild)
    })
  })
  return columnMap
}

function createMatrixGrid(node: NodeDesc, columnMap: ColumnMap, isTranspose: boolean): MatrixContainer {
  const children = node.children?.TOPIC || []

  // 主单元格
  const mainCell = new MatrixCell(node, { align: LEFT })

  // 标签行
  const labelRow = createLabelRow(columnMap)

  // 分支行
  const branchRows = createBranchRows(columnMap, mainCell, children)

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
    const cell = new MatrixCell(column?.key, { align: MIDDLE })
    return cell
  })

  return [firstCell, ...otherCells]
}

function createBranchRows(columnMap: ColumnMap, mainCell: MatrixCell, branches: readonly NodeDesc[]): (MatrixCell | MatrixContainer)[][] {
  return branches.map((branch, i) => {
    const headCell = new MatrixCell(branch, { align: LEFT })
    headCell._parentCell = mainCell

    const otherContainers = columnMap
      .getColumns()
      .filter((column): column is NonNullable<typeof column> => Boolean(column))
      .map((column) => {
        const { items } = column.cells[i]
        const cells = items.map((item: any) => {
          const cell = new MatrixCell(item, { align: LEFT })
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


