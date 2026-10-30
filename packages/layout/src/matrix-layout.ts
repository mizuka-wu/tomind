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
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import { getNodeSpacing } from './spacing-utils'
import { SC, delegationOf, resolveChildStructure } from './child-structure'
import { structurePresetOf } from './structure-resolve'
import { layoutDelegatedSubtree } from './subtree-delegate'
import { measureTitleOnlyNode } from './part-node-size'
import type { PartAwareNodeSize } from './part-node-size'

/**
 * snowbrush matrix cell 的 minSize = topicBounds（title + 2*margin + bw）；
 * MatrixCell.getMinSize 会再加 padding*2（CELL_PADDING=5）。
 *
 * 返回**完整的** PartAwareNodeSize（不是只挑 width/height）：渲染层还要用
 * titleWidth/titleHeight 摆标题 —— 缺了它 topic-renderer 会退回
 * `layout.width - 16` 当换行宽度，把单元格标题挤成两行
 * （实测「测量方法」text 52×42 而不是 56×18）。
 */
function measureMinSize(node: NodeDesc, options: LayoutOptions, styleEngine?: any, state?: any): PartAwareNodeSize {
  const spacing = getNodeSpacing(node, options, styleEngine ?? null, state ?? null)
  return measureTitleOnlyNode(node, spacing.padding, options, styleEngine ?? null, state ?? null)
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
        // getAbsPos 已含 itemPos（= topic 左上角），不要再加一次
        const pos = cell.getAbsPos()
        // 节点盒 = topic bounds（cell minSize 可能是子树 bb，不能当作节点盒）
        const topicSize = measureMinSize(withoutLabels(cell.item), options, styleEngine, state)
        nodes.set(cell.item.id, {
          x: pos.x,
          y: pos.y,
          width: topicSize.width,
          height: topicSize.height,
          // titleWidth/titleHeight 是**标题文本盒**（SB titleView.bounds = 纯文本尺寸，
          // topicContentPosition = (-titleW/2, -titleH/2)），不是主题盒。
          // 旧代码写的是 topicSize.width/height（= 标题 + 2*margin），渲染层因此把
          // 标题画宽 12px（subTopic margin 6pt×2）、上移 6px（(30-30)/2 vs (30-18)/2），
          // 中央主题那格（margin 29pt/15pt）text.x 偏 -29、text.y 偏 -15。
          titleWidth: topicSize.titleWidth,
          titleHeight: topicSize.titleHeight,
          branchHeight: topicSize.height,
        })
      }
    }

    // cell 内嵌套子结构
    //
    // SB matrixcreateutils.createCell(CHILD_CELL) 的 item 是 branchView（HEAD_CELL/MAIN_CELL
    // 才是 topicView），所以 cell 的 minSize / getAbsPos 针对的是**整棵子树的 bounds**：
    //   getAbsPos = cellPos + itemPos - bounds{x,y}  →  子树包围盒左上角
    // 主题盒要在子树包围盒内居中，而不是贴着包围盒左上角。
    // 委派子树的坐标帧以 child **原点**（shape 中心）为 (0,0)，bb{X,Y} 也相对原点，
    // 故 origin = subtreeTopLeft - bb{X,Y}，topicTopLeft = origin - (topicW/2, originY)。
    // ⚠️ Y 要用 originY（part-aware：有 labels 时 ≠ topicH/2），否则带 labels 的子树整体上移 12。
    for (const del of delegations) {
      const placed = nodes.get(del.id)
      if (!placed) continue
      const originX = placed.x - del.bbX
      const originY = placed.y - del.bbY
      placed.x = originX - del.topicW / 2
      placed.y = originY - del.originY
      for (const [id, nl] of del.nodes) {
        if (id === del.id) continue
        nodes.set(id, { ...nl, x: nl.x + originX, y: nl.y + originY })
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
      // SB: gChild.model.getLabel() → labels[0] 文本；tomind 的 labels 是数组
      const labels = getAttr<unknown>(gChild, 'labels')
      const label = Array.isArray(labels) ? labels[0] : labels
      const key = typeof label === 'string' ? label : ''
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
  /** 委派结果：以 child **原点**（shape 中心）为 (0,0) */
  nodes: Map<string, any>
  bbX: number
  bbY: number
  cell: MatrixCell
  topicW: number
  topicH: number
  /** child 原点到主题盒顶的距离 = shapeHeight/2（part-aware；无 labels 时 = topicH/2） */
  originY: number
}

/**
 * 矩阵 cell 自身不渲染 labels —— SB `topicview._initFashionLabelsUnitCard` 里
 * `if (this._isMatrixItem()) return`（父分支结构为 spreadsheet.row/column 时不建 labelsView）：
 * 矩阵中的 label 已经被当成列归属消费掉了，不会再在主题下方画标签卡，
 * 所以主题盒高度不含 labels（探针实测 test-matrix「比较法」：labels=null、bounds 54×30）。
 * 只有 cell 自身受影响（父分支是行分支），cell 子树里的后代仍保留 labels。
 */
function withoutLabels(node: NodeDesc): NodeDesc {
  if (!getAttr(node, 'labels')) return node
  const attrs: Record<string, unknown> = { ...node.attrs }
  delete attrs.labels
  return { id: node.id, type: node.type, attrs, children: node.children }
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
          //
          // cell 的生效结构由 SB `spreadsheetrow`（/ `spreadsheetcolumn`，
          // `underscore.extend({}, spreadsheetRow, …)`）决定：
          //   getAvailableChildStructure 未覆写 ⇒ 继承 AbstractStructure 的 ATTACHED_EXPOSED
          //   getChildStructure() ⇒ **LOGICRIGHT**（与 skeleton 无关！）
          // ⚠️ 2026-10-30 第六轮之前这里走 `delegateLogicSubtree`（读 skeleton）：
          //   test-matrix 的 skeleton 写着 mainTopic: logic.right ⇒ 一直委派 ⇒ 假 0；
          //   对照组 noskel-spreadsheet（skeleton = spreadsheet）拿不到 logic ⇒ fallback
          //   只放 cell 自己一个盒 ⇒ **n=63/235**（172 个节点不存在）、avgΔY 2745.9。
          const cellEff = resolveChildStructure(SC.SPREADSHEET_ROW, structurePresetOf(item, state ?? null), {
            defaultChildStructure: SC.LOGIC_RIGHT,
          })
          const delegation = delegationOf(cellEff)
          const del = delegation
            ? layoutDelegatedSubtree(withoutLabels(item), delegation, options, styleEngine ?? null, state ?? null, depthOf?.get(item.id) ?? 2)
            : null
          let minSize: { width: number; height: number }
          if (del) {
            const own = del.own
            minSize = { width: del.bb.width, height: del.bb.height }
            delegations.push({ id: item.id, nodes: del.nodes, bbX: del.bb.x, bbY: del.bb.y, cell: null as any, topicW: own.width, topicH: own.height, originY: del.originY })
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


