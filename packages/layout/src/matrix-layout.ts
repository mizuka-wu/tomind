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
import { getAttr, getFontSize } from './layout-utils'
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
import { getNodeSpacing, parseStyleValue } from './spacing-utils'
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
/**
 * SB `common/constants/models.TOPIC_MAX_CUSTOM_WIDTH`。
 * `figures/layoutengine/titlelayoutworker.getResolvedText`：
 * ```js
 * const parentBranchView = figure.viewController.parent().parent()   // titleView→topicView→**branchView**
 * } else if (isBranch(parentBranchView)
 *            && (isMatrixMainBranch(parentBranchView) || isTreeTableStructure(parentBranchView))) {
 *   strArr = resolveString(text, fontInfo, TOPIC_MAX_CUSTOM_WIDTH)   // 1024
 * } else {
 *   strArr = resolveString(text, fontInfo)                           // TITLE_MAX_WIDTH 300
 * }
 * ```
 * ⚠️ 变量名骗人：`parentBranchView` 是**标题自己所属的分支**（不是父分支）⇒
 * `isMatrixMainBranch` = 「这个节点自己的生效结构 ∈ MATRIX_GROUP_LIST」= **表格宿主自己**。
 * 主分支（eff = 私有的 spreadsheet.row）与 cell（eff = logic.right）都仍按 300
 * （实测把长标题放到 d1 上：SB/TM 都是 titleWidth 288 / titleHeight 72，零差距）。
 * 放到根上才量得到：SB titleBounds 990×40（1 行）、TM 300×160（4 行）⇒ 主题盒 1048×70 vs 358×190
 * （test-matrix-longtitle：avgΔW 2.9 / ΔH 0.5 / ΔY 2.7 —— 被 235 个节点稀释了，单点是 690×120）。
 */
const TOPIC_MAX_CUSTOM_WIDTH = 1024

function measureMinSize(node: NodeDesc, options: LayoutOptions, styleEngine?: any, state?: any): PartAwareNodeSize {
  const spacing = getNodeSpacing(node, options, styleEngine ?? null, state ?? null)
  return measureTitleOnlyNode(node, spacing.padding, options, styleEngine ?? null, state ?? null)
}

/**
 * 标签 cell 的 minSize = SB `MatrixLabelView.bounds`。
 *
 * SB `figures/layoutengine/matrixlabellayoutworker`：
 * ```js
 * titleLayoutWorker.work(vc)                       // textBounds = 纯文本盒
 * bounds = { x: textBounds.x - marginLeft, y: textBounds.y - marginTop,
 *            width:  marginLeft + textBounds.width  + marginRight,
 *            height: marginTop + textBounds.height + marginBottom }
 * ```
 * 字体与四边 margin 来自 `matrixcreateutils.createLabelViews`：
 * `_getStyleForLengthValue(children[0], …)` —— **本表第一个 head 分支**的
 * fontSize / marginTop·Bottom·Left·Right（`ignoreUser + ignoreClass`）。
 *
 * ⚠️ 空标签（所有 cell 都没有 labels ⇒ 列 key = ''）时 textBounds = 0
 * ⇒ bounds = {mL+mR, mT+mB}（实测嵌套 matrix：subTopic 的 6pt ⇒ 12×12、minSize 22×22）。
 * 旧实现是「fontSize 24 写死 + 12」，非空标签碰巧对上 mainTopic（18pt 文本 24 + 10pt margin×2 = 44），
 * 空标签却退回 `CELL_DEFAULT_WIDTH` 的 0 高 ⇒ 标签行 10 而不是 22，整张表矮 12
 * （test-matrix-inherit 的「avgΔY 0.4」真身：234 个节点齐刷 -12 被质心对齐吃掉）。
 */
function measureLabelMinSize(
  text: string,
  head: NodeDesc | undefined,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): { width: number; height: number } {
  const pad = head
    ? getNodeSpacing(head, options, styleEngine, state).padding
    : { top: 0, right: 0, bottom: 0, left: 0 }
  const fontSize = head ? getFontSize(head, styleEngine, state) : 12
  const { width, height } = measureTextSize(text, fontSize, options)
  return { width: pad.left + width + pad.right, height: pad.top + height + pad.bottom }
}

/** SB `layoutConstant.MATRIX_PLUS_RADIUS`（加号视图半径 9，直径 18） */
const MATRIX_PLUS_RADIUS = 9

// ==================== Matrix 布局算法 ====================

interface MatrixGridRun {
  /** 网格坐标系（左上角 = (0,0)）下的节点表 */
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>
  /** `matrixGrid.size`（整张表，含标签行/列与主格）——**不含** matrixView.getSize 的两项附加 */
  gridWidth: number
  gridHeight: number
  /** SB `matrixView.getSize()` 的附加量：宽 + borderWidth/2、高 + 加号视图(18) + MATRIX_PLUS_RADIUS(9) */
  viewWidth: number
  viewHeight: number
  /** 表格根主题盒在网格里的左上角与尺寸 */
  rootBox: { x: number; y: number; width: number; height: number }
}

/**
 * 跑一次 matrix 网格布局（SB `spreadsheet.calChildrenBounds → _calMatrix` +
 * `matrixcreateutils.initGrid` + `spreadsheetrow.calAttachedChildrenPos` 的落位）。
 *
 * @param isTranspose SB `columnSpreadsheet = extend({}, structuresSpreadsheet, { _needTranspose: true })`
 *   ⇒ `createMatrixGrid(branch, columnMap, isTranspose)` → `new Matrix(totalRows, isColumn)`：
 *   **同一份 totalRows 数组被当成「列」而不是「行」**（`Matrix` 构造里 `columns = arrList;
 *   rows = transpose(columns)`）。之后 setSize / setPos / getCells 全走 `this.rows`
 *   ⇒ 几何自动转置，不需要额外分支。TM 此前恒传 false ⇒ spreadsheet.column 整张表没转
 *   （实测 test-matrix-column-inherit 1278.5 / 3264.7）。
 */
function runMatrixGrid(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  isTranspose: boolean,
  baseDepth = 0,
): MatrixGridRun | null {
  const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
  const children = node.children?.attached || []
  if (children.length === 0) return null

  // 创建列映射
  const columnMap = createColumnMap(children)

  // 创建网格（列内 cell 的子树委派记录在 delegations）
  const delegations: MatrixDelegation[] = []
  const depthOf = new Map<string, number>()
  const walkDepth = (n: NodeDesc, d: number) => {
    depthOf.set(n.id, d)
    for (const c of n.children?.attached || []) walkDepth(c, d + 1)
  }
  walkDepth(node, baseDepth)
  const matrixGrid = createMatrixGrid(node, columnMap, isTranspose, options, styleEngine, state, delegations, depthOf)

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
      // ⚠️ 主格（表格宿主自己）的标题按 1024 折行，其余 cell 仍是 300
      const topicOptions: LayoutOptions = cell.item.id === node.id
        ? { ...options, maxTitleWidth: TOPIC_MAX_CUSTOM_WIDTH }
        : options
      const topicSize = measureMinSize(withoutLabels(cell.item), topicOptions, styleEngine, state)
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

  const rootBox = nodes.get(node.id)
    ?? { x: 0, y: 0, width: 0, height: 0 }
  const gridSize = matrixGrid.size ?? { width: 0, height: 0 }
  /**
   * SB `view/matrixview.getSize()`：
   * ```js
   * width  = matrixGrid.size.width  + borderWidth / 2      // border-line-width of 表格根
   * height = matrixGrid.size.height + plusHeight + MATRIX_PLUS_RADIUS
   * ```
   * `plusHeight = _plusViews[1].bounds.height = MATRIX_PLUS_RADIUS * 2 = 18`（右下角那个加号）。
   * ⇒ 表格根的 `branch.bounds.height` 比网格高 **27**（实测嵌套 matrix：网格 498、bounds 525）。
   * 只有「matrix 被别的结构委派」时才消费得到（根宿主没有父分支），
   * 漏掉它 ⇒ 骨/格子里嵌一张表时宿主拿到的 bb 矮 27（probe-fishbone×spreadsheet 9.9/3.4）。
   */
  const borderWidth = styleEngine && state
    ? parseStyleValue(styleEngine.computeStyle(state, node.id)?.borderWidth, 0)
    : 0
  return {
    nodes,
    gridWidth: gridSize.width,
    gridHeight: gridSize.height,
    viewWidth: gridSize.width + borderWidth / 2,
    viewHeight: gridSize.height + MATRIX_PLUS_RADIUS * 2 + MATRIX_PLUS_RADIUS,
    rootBox,
  }
}

/**
 * 独立布局一棵 spreadsheet / spreadsheet.column 子树（供其它结构按生效结构委派使用）。
 * 契约同 `subtree-delegate.layoutDelegatedSubtree`：节点表以 child 原点为 (0,0)、
 * bb = SB 的 `child.boundaryBounds`。
 *
 * SB `spreadsheet.calAttachedChildrenPos`：
 * ```js
 * const size = matrixView.getSize()                       // 整张表
 * const mainCell = matrixutils.getMainCell(matrixGrid)
 * const newPos = matrixutils.sub(newBounds, mainCell.itemPos)   // newBounds = topicView.bounds
 * Object.assign(newBounds, size, newPos)
 * ```
 * ⇒ `bounds = { x: -w/2 - itemPos.x, y: -originY - itemPos.y, width: gridW, height: gridH }`
 * —— 正是「把网格帧平移到表格根的原点」：网格左/上边缘相对原点 = -(itemPos + 半盒)。
 *
 * ⚠️ 2026-10-31 第七轮补：此前 `delegationOf(SPREADSHEET / COLUMN_SPREADSHEET)` 返回 null，
 * treetable 的 stop 格 / matrix 的 cell / fishbone 的骨子分支遇到它时 fallback
 * **只放一个盒**⇒ 丢节点（实测 probe-spreadsheet×spreadsheet.column n=220/235、
 * probe-fishbone×spreadsheet n=220/235）。
 */
export function layoutMatrixSubtree(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  baseDepth = 1,
  transpose = false,
): { nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>; bb: { x: number; y: number; width: number; height: number }; originY: number } {
  const run = runMatrixGrid(node, options, styleEngine, state, transpose, baseDepth)
  // 表格 cell 不渲染 labels（SB `topicview._isMatrixItem()`）⇒ 原点 = 盒中心
  const ownSize = measureMinSize(withoutLabels(node), { ...options, maxTitleWidth: TOPIC_MAX_CUSTOM_WIDTH }, styleEngine, state)
  const originY = ownSize.height / 2
  if (!run) {
    return {
      nodes: new Map(),
      bb: { x: -ownSize.width / 2, y: -originY, width: ownSize.width, height: ownSize.height },
      originY,
    }
  }
  const ox = run.rootBox.x + run.rootBox.width / 2
  const oy = run.rootBox.y + originY
  const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
  for (const [id, nl] of run.nodes) nodes.set(id, { ...nl, x: nl.x - ox, y: nl.y - oy })
  return { nodes, bb: { x: -ox, y: -oy, width: run.viewWidth, height: run.viewHeight }, originY }
}

function createMatrixAlgorithm(name: string, isTranspose: boolean): LayoutAlgorithm {
  return {
    name,
    layout(
      node: NodeDesc,
      options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS,
      styleEngine: StyleEngine | null = null,
      state: SheetState | null = null,
    ): LayoutResult {
      const run = runMatrixGrid(node, options, styleEngine, state, isTranspose, 0)
      if (!run) return { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
      // 计算总尺寸
      let totalWidth = 0
      let totalHeight = 0
      for (const layout of run.nodes.values()) {
        totalWidth = Math.max(totalWidth, layout.x + layout.width)
        totalHeight = Math.max(totalHeight, layout.y + layout.height)
      }
      return { nodes: run.nodes, totalWidth, totalHeight }
    },
  }
}

export const matrixLayoutAlgorithm: LayoutAlgorithm = createMatrixAlgorithm('matrix', false)

/** `org.xmind.ui.spreadsheet.column`（SB columnSpreadsheet，_needTranspose = true） */
export const matrixColumnLayoutAlgorithm: LayoutAlgorithm = createMatrixAlgorithm('matrix-column', true)

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

  // 主单元格（= 表格宿主自己 ⇒ 标题按 TOPIC_MAX_CUSTOM_WIDTH 折行，见常量注释）
  const mainOptions: LayoutOptions = { ...options, maxTitleWidth: TOPIC_MAX_CUSTOM_WIDTH }
  const mainCell = new MatrixCell(node, { align: LEFT, minSize: measureMinSize(node, mainOptions, styleEngine, state) })

  // 标签行（字体/边距取自本表第一个 head 分支，SB createLabelViews）
  const labelRow = createLabelRow(columnMap, children[0], options, styleEngine ?? null, state ?? null)

  // 分支行
  const branchRows = createBranchRows(columnMap, mainCell, children, options, styleEngine, state, delegations, depthOf)

  const totalRows = [labelRow, ...branchRows]
  const matrix = new Matrix(totalRows, isTranspose)
  const matrixGrid = new MatrixContainer([mainCell, matrix])
  matrixGrid.isTranspose = isTranspose

  return matrixGrid
}

function createLabelRow(
  columnMap: ColumnMap,
  firstHead: NodeDesc | undefined,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): MatrixCell[] {
  const firstCell = new MatrixCell(undefined, { align: LEFT })
  firstCell._isNull = true

  const otherCells = columnMap.getColumns().map((column) => {
    const key = typeof column?.key === 'string' ? column.key : ''
    // ⚠️ 空 key 也要给 minSize（SB 的 MatrixLabelView 空文本仍有 margin 撑出的 12×12）
    const cell = new MatrixCell(column?.key, {
      align: MIDDLE,
      minSize: measureLabelMinSize(key, firstHead, options, styleEngine, state),
    })
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


