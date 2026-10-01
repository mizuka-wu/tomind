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

/** 标签文本 cell 的 minSize = 标签视图盒（SB: 24px 文本 + 6px 四边 margin） */
function measureLabelMinSize(text: string): { width: number; height: number } {
  const { width, height } = measureTextSize(text, 24, DEFAULT_LAYOUT_OPTIONS)
  return { width: width + 12, height: height + 12 }
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

    // 创建网格（列内 cell 的子树委派记录在 delegations）
    const delegations: MatrixDelegation[] = []
    const depthOf = new Map<string, number>()
    const walkDepth = (n: NodeDesc, d: number) => {
      depthOf.set(n.id, d)
      for (const c of n.children?.attached || []) walkDepth(c, d + 1)
    }
    walkDepth(node, 0)
    const matrixGrid = createMatrixGrid(node, columnMap, false, options, styleEngine, state, delegations, depthOf)

    // 初始化位置
    initGrid(matrixGrid)

    // 将结果转换为 LayoutResult
    const cells = matrixGrid.getCells()
    for (const cell of cells) {
      // 只取分支 cell（标签 cell 的 item 是字符串）
      if (cell.item && typeof cell.item === 'object' && cell.item.id) {
        const pos = cell.getAbsPos()
        const ip = cell.itemPos ?? { x: 0, y: 0 }
        // 节点盒 = topic bounds（cell minSize 可能是子树 bb，不能当作节点盒）
        const topicSize = measureMinSize(cell.item, options, styleEngine, state)
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

    // cell 内嵌套子结构：把委派子树平移到 cell 内 topic 位置（SB getAbsPos = pos + itemPos - bounds）
    for (const del of delegations) {
      const placed = nodes.get(del.id)
      if (!placed) continue
      // topic 左上角 = placed；provisional 里 topic 左上角 = (0, -h/2)
      const dx = placed.x
      const dy = placed.y + del.topicH / 2
      for (const [id, nl] of del.nodes) {
        if (id === del.id) continue
        nodes.set(id, { ...nl, x: nl.x + dx, y: nl.y + dy })
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

function createMatrixGrid(node: NodeDesc, columnMap: ColumnMap, isTranspose: boolean, options: LayoutOptions, styleEngine?: any, state?: any, delegations: MatrixDelegation[] = [], depthOf?: Map<string, number>): MatrixContainer {
  const children = node.children?.attached || []

  // 主单元格
  const mainCell = new MatrixCell(node, { align: LEFT, minSize: measureMinSize(node, options, styleEngine, state) })

  // 标签行
  const labelRow = createLabelRow(columnMap)

  // 分支行
  const branchRows = createBranchRows(columnMap, mainCell, children, options, styleEngine, state, delegations, depthOf)

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

export interface MatrixDelegation {
  id: string
  nodes: Map<string, any>
  bbX: number
  bbY: number
  cell: MatrixCell
  topicH: number
}

function createBranchRows(columnMap: ColumnMap, mainCell: MatrixCell, branches: readonly NodeDesc[], options: LayoutOptions, styleEngine?: any, state?: any, delegations: MatrixDelegation[] = [], depthOf?: Map<string, number>): (MatrixCell | MatrixContainer)[][] {
  return branches.map((branch, i) => {
    const headCell = new MatrixCell(branch, { align: LEFT, minSize: measureMinSize(branch, options, styleEngine, state) })
    headCell._parentCell = mainCell

    const otherContainers = columnMap
      .getColumns()
      .filter((column): column is NonNullable<typeof column> => Boolean(column))
      .map((column) => {
        const { items } = column.cells[i]
        const cells = items.map((item: any) => {
          // SB: 列内 cell 的 minSize = 子树 boundaryBounds（cell 内嵌子结构）
          const del = delegateLogicSubtree(item, 0, 0, depthOf?.get(item.id) ?? 2, options, styleEngine, state)
          let minSize: { width: number; height: number }
          if (del) {
            minSize = { width: del.bb.width, height: del.bb.height }
            delegations.push({ id: item.id, nodes: del.nodes, bbX: del.bb.x, bbY: del.bb.y, cell: null as any, topicH: del.nodes.get(item.id)!.height })
          } else {
            minSize = measureMinSize(item, options, styleEngine, state)
          }
          const cell = new MatrixCell(item, { align: LEFT, minSize })
          cell._parentCell = headCell
          if (del) delegations[delegations.length - 1].cell = cell
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


