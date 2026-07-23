/**
 * MatrixRenderer — 矩阵布局渲染器
 *
 * 管理 matrix 布局中的所有子视图：
 * - MatrixCellView（单元格）
 * - MatrixPlusView（添加按钮）
 * - MatrixLabelView（列标签）
 */

import { Group, Rect, Text, Path } from 'leafer-ui'
import type { Renderer } from './renderer'
import type { LayoutResult } from '@tomind/layout'
import {
  ColumnMap,
  Matrix,
  MatrixContainer,
  MatrixCell,
  LEFT,
  MIDDLE,
} from '@tomind/layout'

// ============== 常量 ==============
const PLUS_VIEW_RADIUS = 8
const PLUS_VIEW_PADDING = 8
const SELECT_COLOR = 'rgb(94, 187, 254)'
const HOVER_COLOR = 'rgb(154, 213, 255)'
const DEFOCUS_COLOR = '#9f9f9f'

// ============== MatrixCellView ==============
class MatrixCellView {
  private _group: Group
  private _rect: Rect
  private _selectedPath: Path
  private _isFront = false
  private _bounds: { x: number; y: number; width: number; height: number }

  constructor(
    bounds: { x: number; y: number; width: number; height: number },
    events: Record<string, (...args: any[]) => void> = {},
  ) {
    this._bounds = bounds

    // 创建 Group
    this._group = new Group({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    })

    // 创建背景矩形
    this._rect = new Rect({
      x: 0,
      y: 0,
      width: bounds.width,
      height: bounds.height,
      fill: 'none',
      stroke: '#ccc',
      strokeWidth: 1,
    })
    this._group.add(this._rect)

    // 创建选中路径
    this._selectedPath = new Path({
      x: 0,
      y: 0,
      width: bounds.width,
      height: bounds.height,
      visible: false,
      stroke: SELECT_COLOR,
      strokeWidth: 2,
    })
    this._group.add(this._selectedPath)

    // 绑定事件
    this._bindEvents(events)
  }

  get group() { return this._group }
  get bounds() { return this._bounds }

  private _bindEvents(events: Record<string, (...args: any[]) => void>) {
    if (events.dblclick) {
      this._group.on('dblclick', events.dblclick)
    }
    if (events.doubletap) {
      this._group.on('doubletap', events.doubletap)
    }
    if (events.click) {
      this._group.on('click', events.click)
    }
    if (events.tap) {
      this._group.on('tap', events.tap)
    }
  }

  setFillColor(color: string) {
    this._rect.set({ fill: color })
  }

  setBorderColor(color: string) {
    this._rect.set({ stroke: color })
  }

  setBorderWidth(width: number) {
    this._rect.set({ strokeWidth: width })
  }

  displaySelect() {
    this._front()
    this._selectedPath.set({ visible: true, stroke: SELECT_COLOR })
  }

  displayDeselect() {
    this._back()
    this._selectedPath.set({ visible: false })
  }

  displayHover() {
    this._front()
    this._selectedPath.set({ visible: true, stroke: HOVER_COLOR })
  }

  displayDehover() {
    this._back()
    this._selectedPath.set({ visible: false })
  }

  displayDeFocus() {
    this._front()
    this._selectedPath.set({ visible: true, stroke: DEFOCUS_COLOR })
  }

  private _front() {
    if (!this._isFront) {
      this._isFront = true
      this._group.zIndex = 1000
    }
  }

  private _back() {
    if (this._isFront) {
      this._isFront = false
      this._group.zIndex = 0
    }
  }

  destroy() {
    this._group.destroy()
  }
}

// ============== MatrixPlusView ==============
class MatrixPlusView {
  private _group: Group
  private _clickEvent: () => void

  constructor(bounds: { x: number; y: number; width: number; height: number }, clickEvent: () => void) {
    this._clickEvent = clickEvent

    this._group = new Group({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    })

    // 创建 "+" 图标
    const path = new Path({
      x: 0,
      y: 0,
      width: bounds.width,
      height: bounds.height,
      path: `M ${bounds.width / 2} 0 L ${bounds.width / 2} ${bounds.height} M 0 ${bounds.height / 2} L ${bounds.width} ${bounds.height / 2}`,
      stroke: '#666',
      strokeWidth: 2,
      cursor: 'pointer',
    })
    this._group.add(path)

    // 绑定点击事件
    this._group.on('click', this._clickEvent)
  }

  get group() { return this._group }

  setVisible(visible: boolean) {
    this._group.set({ visible })
  }

  destroy() {
    this._group.destroy()
  }
}

// ============== MatrixLabelView ==============
class MatrixLabelView {
  private _group: Group
  private _text: Text
  private _bounds: { x: number; y: number; width: number; height: number }
  private _textStr: string
  private _cells: { items: any[] }[]

  constructor(
    text: string,
    cells: { items: any[] }[],
    fontInfo: Record<string, any>,
  ) {
    this._textStr = text
    this._cells = cells
    this._bounds = { x: 0, y: 0, width: 0, height: 0 }

    this._group = new Group()
    this._text = new Text({
      x: 0,
      y: 0,
      text,
      fontSize: fontInfo.fontSize || 12,
      fontFamily: fontInfo.fontFamily || 'Helvetica, Arial, sans-serif',
      fill: '#000',
    })
    this._group.add(this._text)
  }

  get group() { return this._group }
  get bounds() { return this._bounds }
  get text() { return this._textStr }

  setPosition(positions: { x: number; y: number }) {
    this._group.set({ x: positions.x, y: positions.y })
  }

  setText(text: string) {
    this._textStr = text
    this._text.set({ text })
  }

  setTextColor(color: string) {
    this._text.set({ fill: color })
  }

  select() {
    // 选中状态
  }

  deselect() {
    // 取消选中
  }

  getEditContent() {
    return this._textStr || 'Label'
  }

  saveEdit(newText: string) {
    this.setText(newText)
    // 通知关联的单元格更新
    this._cells?.forEach((cell) => {
      cell.items?.forEach((view: any) => {
        if (view.model?.changeLabel) {
          view.model.changeLabel(newText)
        }
      })
    })
  }

  destroy() {
    this._group.destroy()
  }
}

// ============== MatrixRenderer ==============
export class MatrixRenderer implements Renderer {
  private _parent: Group | null = null
  private _matrixGrid: MatrixContainer | null = null
  private _cellViews: MatrixCellView[] = []
  private _plusViews: MatrixPlusView[] = []
  private _labelViews: MatrixLabelView[] = []
  private _columnMap: ColumnMap | null = null
  private _onCellClick: ((cell: MatrixCell) => void) | null = null
  private _onCellDblClick: ((cell: MatrixCell) => void) | null = null

  constructor(_nodeId: string) {
  }

  create(parent: Group): void {
    this._parent = parent
  }

  /**
   * 设置单元格点击回调
   */
  setOnCellClick(callback: (cell: MatrixCell) => void): void {
    this._onCellClick = callback
  }

  /**
   * 设置单元格双击回调
   */
  setOnCellDblClick(callback: (cell: MatrixCell) => void): void {
    this._onCellDblClick = callback
  }

  render(_layout: LayoutResult, _style: Record<string, unknown>): void {
    // 渲染逻辑在 updateMatrix 中处理
  }

  destroy(): void {
    this._destroyMatrix()
    this._parent = null
  }

  /**
   * 更新矩阵布局
   */
  updateMatrix(
    children: any[],
    _getNode: (id: string) => any,
  ): void {
    if (!this._parent) return

    // 重新创建矩阵
    this._destroyMatrix()

    if (children.length === 0) return

    // 创建列映射
    this._columnMap = this._createColumnMap(children)

    // 创建网格
    this._matrixGrid = this._createMatrixGrid(children, this._columnMap, false)

    // 初始化位置
    this._initGrid(this._matrixGrid)

    // 创建视图
    this._createCellViews(this._matrixGrid)
    this._createPlusViews(this._matrixGrid)
    this._createLabelViews(this._columnMap)

    // 添加到父容器
    this._addToParent()
  }

  private _createColumnMap(children: any[]): ColumnMap {
    const columnMap = new ColumnMap(children.length)
    children.forEach((child: any, index: number) => {
      const grandChildren = child.children?.TOPIC || []
      grandChildren.forEach((gChild: any) => {
        const key = gChild.attrs?.label || ''
        const cell = columnMap.getCell(index, key)
        cell.items.push(gChild)
      })
    })
    return columnMap
  }

  private _createMatrixGrid(children: any[], columnMap: ColumnMap, isTranspose: boolean): MatrixContainer {
    // 主单元格
    const mainCell = new MatrixCell(children[0], { align: LEFT })

    // 标签行
    const labelRow = this._createLabelRow(columnMap)

    // 分支行
    const branchRows = this._createBranchRows(columnMap, mainCell, children)

    const totalRows = [labelRow, ...branchRows]
    const matrix = new Matrix(totalRows, isTranspose)
    const matrixGrid = new MatrixContainer([mainCell, matrix])
    matrixGrid.isTranspose = isTranspose

    return matrixGrid
  }

  private _createLabelRow(columnMap: ColumnMap): MatrixCell[] {
    const firstCell = new MatrixCell(undefined, { align: LEFT })
    firstCell._isNull = true

    const otherCells = columnMap.getColumns().map((column) => {
      const cell = new MatrixCell(column?.key, { align: MIDDLE })
      return cell
    })

    return [firstCell, ...otherCells]
  }

  private _createBranchRows(columnMap: ColumnMap, mainCell: MatrixCell, branches: any[]): (MatrixCell | MatrixContainer)[][] {
    return branches.map((branch: any, i: number) => {
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

  private _initGrid(matrixGrid: MatrixContainer) {
    const size = matrixGrid.getMinSize()
    matrixGrid.setSize(size)
    matrixGrid.setPos({ x: 0, y: 0 })

    const matrix = matrixGrid.cells[1] as Matrix
    matrix.getCells().forEach((cell) => {
      if (cell.item) {
        // 设置位置
        void cell.getAbsPos()
      }
    })
  }

  private _createCellViews(matrixGrid: MatrixContainer) {
    const cells = matrixGrid.getCells()
    this._cellViews = cells.map((cell) => {
      const bounds = {
        x: cell.pos?.x || 0,
        y: cell.pos?.y || 0,
        width: cell.size?.width || 0,
        height: cell.size?.height || 0,
      }
      
      // 创建事件处理函数
      const events: Record<string, (...args: any[]) => void> = {
        ...cell._events,
        // 点击选择
        click: () => {
          // 触发选择事件
          this._onCellClick?.(cell)
        },
        // 双击编辑
        dblclick: () => {
          // 触发编辑事件
          this._onCellDblClick?.(cell)
        },
      }
      
      const view = new MatrixCellView(bounds, events)
      return view
    })
  }

  private _createPlusViews(matrixGrid: MatrixContainer) {
    const matrix = matrixGrid.cells[1] as Matrix
    const n = matrix.rows.length
    const m = matrix.rows[0].length
    const b0 = matrix.rows[0][m - 1].view.bounds
    const b1 = matrix.rows[n - 1][0].view.bounds
    const diameter = PLUS_VIEW_RADIUS * 2
    const s1 = { width: diameter, height: diameter }
    const padding = PLUS_VIEW_PADDING
    const vb0 = { ...b0, ...s1, x: b0.x + b0.width + padding }
    const vb1 = { ...b1, ...s1, y: b1.y + b1.height + padding }

    const addLabel = () => {
      // 添加列标签
      console.log('Add label')
    }

    const addHeadTopic = () => {
      // 添加行
      console.log('Add head topic')
    }

    let fn0 = addLabel
    let fn1 = addHeadTopic

    if (matrixGrid.isTranspose) {
      ;[fn0, fn1] = [fn1, fn0]
    }

    this._plusViews = [
      new MatrixPlusView(vb0, fn0),
      new MatrixPlusView(vb1, fn1),
    ]
  }

  private _createLabelViews(columnMap: ColumnMap) {
    const fontInfo = {
      fontSize: 12,
      fontFamily: 'Helvetica, Arial, sans-serif',
    }

    this._labelViews = columnMap.getColumns().map((column) => {
      if (!column) return null
      const { key, cells } = column
      const labelView = new MatrixLabelView(key, cells, fontInfo)
      return labelView
    }).filter((view): view is MatrixLabelView => view !== null)
  }

  private _addToParent() {
    if (!this._parent) return

    // 添加单元格视图
    this._cellViews.forEach((view) => {
      this._parent!.add(view.group)
    })

    // 添加标签视图
    this._labelViews.forEach((view) => {
      this._parent!.add(view.group)
    })

    // 添加添加按钮
    this._plusViews.forEach((view) => {
      this._parent!.add(view.group)
    })
  }

  private _destroyMatrix() {
    this._cellViews.forEach((view) => view.destroy())
    this._plusViews.forEach((view) => view.destroy())
    this._labelViews.forEach((view) => view.destroy())
    this._cellViews = []
    this._plusViews = []
    this._labelViews = []
    this._matrixGrid = null
    this._columnMap = null
  }
}
