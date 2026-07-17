/**
 * Matrix 数据结构
 *
 * 管理 matrix 布局的网格、单元格、列映射。
 */

// ============== 常量 ==============
export const LEFT = 'LEFT'
export const MIDDLE = 'MIDDLE'
export const RIGHT = 'RIGHT'

const CELL_PADDING = 4
const CELL_DEFAULT_WIDTH = 120

// ============== 工具函数 ==============
const copy = (obj: any) => Array.isArray(obj) ? obj.slice() : { ...obj }
const flatten = (arr: any[]) => arr.reduce((a, b) => a.concat(b), [])

const getCenterDelta = (s1: { width: number; height: number }, s2: { width: number; height: number }) => {
  return {
    x: (s1.width - s2.width) / 2,
    y: (s1.height - s2.height) / 2,
  }
}

const transpose = (rows: any[][]) => {
  const t: any[][] = []
  if (rows.length === 0) return t
  const rowLength = rows.length
  const colLength = rows[0].length
  for (let i = 0; i < colLength; i++) {
    t[i] = []
    for (let j = 0; j < rowLength; j++) {
      t[i][j] = rows[j][i]
    }
  }
  return t
}

// 分配策略: 将多余的长度分配给 arr 的最后一位
const allocSize0 = (arr: number[], x1: number) => {
  const x0 = arr.reduce((a, b) => a + b, 0)
  const dx = x1 - x0
  arr[arr.length - 1] += dx
}

// 分配策略: 将多余的长度平均分配给 arr 的每一位
const allocSize1 = (arr: number[], x1: number) => {
  const x0 = arr.reduce((a, b) => a + b, 0)
  const dx = x1 - x0
  const dxAvg = dx / arr.length
  for (let i = 0; i < arr.length; i++) {
    arr[i] += dxAvg
  }
}

// ============== Matrix ==============
export class Matrix {
  columns: any[][]
  rows: any[][]
  rowHeightArr: number[]
  colWidthArr: number[]
  size: { width: number; height: number } | null
  pos: { x: number; y: number } | null

  constructor(arrList: any[][] = [], isColumn = false) {
    if (isColumn) {
      this.columns = arrList
      this.rows = transpose(this.columns)
    } else {
      this.rows = arrList
      this.columns = transpose(this.rows)
    }
    this.rowHeightArr = []
    this.colWidthArr = []
    this.size = null
    this.pos = null
  }

  getMinSize() {
    this._calCellSize()
    const width = this.colWidthArr.reduce((a, b) => a + b)
    const height = this.rowHeightArr.reduce((a, b) => a + b)
    return { width, height }
  }

  setSize(newSize: { width: number; height: number }) {
    this.size = newSize
    const { width, height } = newSize
    allocSize0(this.colWidthArr, width)
    allocSize0(this.rowHeightArr, height)
    this.rows.forEach((row, i) => {
      row.forEach((cell, j) => {
        const height = this.rowHeightArr[i]
        const width = this.colWidthArr[j]
        cell.setSize({ width, height })
      })
    })
  }

  setPos(newPos: { x: number; y: number }) {
    this.pos = newPos
    const p1 = copy(newPos)
    this.rows.forEach((row, i) => {
      const p2 = copy(p1)
      row.forEach((cell, j) => {
        const colWidth = this.colWidthArr[j]
        const pos = copy(p2)
        cell.setPos(pos)
        p2.x += colWidth
      })
      p1.y += this.rowHeightArr[i]
    })
  }

  getCells(): MatrixCell[] {
    const cellsArr = this.rows.map((row) => {
      const cellsArr = row.map((cell) => cell.getCells())
      return flatten(cellsArr)
    })
    return flatten(cellsArr)
  }

  getColumnSize(index: number) {
    const height = this.rowHeightArr.reduce((a, b) => a + b)
    const width = this.colWidthArr[index]
    return { width, height }
  }

  getRowSize(index: number) {
    const width = this.colWidthArr.reduce((a, b) => a + b)
    const height = this.rowHeightArr[index]
    return { width, height }
  }

  private _calCellSize() {
    this.rowHeightArr.length = 0
    this.colWidthArr.length = 0
    this.rows.forEach((row, i) => {
      row.forEach((cell, j) => {
        const { width, height } = cell.getMinSize()
        this.rowHeightArr[i] = this.rowHeightArr[i] || 0
        this.colWidthArr[j] = this.colWidthArr[j] || 0
        this.rowHeightArr[i] = Math.max(height, this.rowHeightArr[i])
        this.colWidthArr[j] = Math.max(width, this.colWidthArr[j])
      })
    })
  }
}

// ============== MatrixContainer ==============
export class MatrixContainer {
  cells: (MatrixCell | Matrix)[]
  cellHeightArr: number[]
  size: { width: number; height: number } | null
  pos: { x: number; y: number } | null
  isTranspose: boolean

  constructor(cells: (MatrixCell | Matrix)[] = []) {
    this.cells = cells
    this.cellHeightArr = []
    this.size = null
    this.pos = null
    this.isTranspose = false
  }

  getMinSize() {
    if (this.cells.length === 0) {
      return { width: 0, height: 0 }
    }
    const sizes = this.cells.map((cell) => cell.getMinSize())
    const widthArr = sizes.map((size) => size.width)
    const heightArr = sizes.map((size) => size.height)
    const width = Math.max(...widthArr)
    const height = heightArr.reduce((a, b) => a + b)
    this.cellHeightArr = heightArr
    return { width, height }
  }

  setSize(newSize: { width: number; height: number }) {
    this.size = newSize
    const { width, height } = newSize
    allocSize1(this.cellHeightArr, height)
    this.cells.forEach((cell, i) => {
      const height = this.cellHeightArr[i]
      cell.setSize({ width, height })
    })
  }

  setPos(newPos: { x: number; y: number }) {
    this.pos = newPos
    const p1 = copy(newPos)
    this.cells.forEach((cell, i) => {
      const pos = copy(p1)
      cell.setPos(pos)
      p1.y += this.cellHeightArr[i]
    })
  }

  getCells(): MatrixCell[] {
    const cellsArr = this.cells.map((cell) => cell.getCells())
    return flatten(cellsArr)
  }

  getItems() {
    return this.getCells()
      .map((cell) => cell.item)
      .filter((item) => item !== undefined)
  }
}

// ============== MatrixCell ==============
export class MatrixCell {
  item: any
  padding: number
  align: string
  size: { width: number; height: number } | null
  pos: { x: number; y: number } | null
  itemPos: { x: number; y: number }
  _view: any
  _parentCell: MatrixCell | undefined
  _events: Record<string, Function>
  _isNull: boolean

  constructor(item?: any, opts: { padding?: number; align?: string } = {}) {
    const defaultOpts = {
      padding: CELL_PADDING,
      align: MIDDLE,
    }
    const o = { ...defaultOpts, ...opts }
    this.item = item
    this.padding = o.padding
    this.align = o.align
    this.size = null
    this.pos = null
    this.itemPos = { x: 0, y: 0 }
    this._view = null
    this._events = {}
    this._isNull = false
  }

  getMinSize() {
    const defaultBounds = {
      width: CELL_DEFAULT_WIDTH,
      height: 0,
      x: 0,
      y: 0,
    }
    const { width, height } = this.item === undefined
      ? defaultBounds
      : this.item.bounds
    return {
      width: width + this.padding * 2,
      height: height + this.padding * 2,
    }
  }

  getCells(): MatrixCell[] {
    return [this]
  }

  setSize(newSize: { width: number; height: number }) {
    this.size = newSize
    this._setItemPos(newSize)
  }

  setPos(newPos: { x: number; y: number }) {
    this.pos = newPos
  }

  getAbsPos() {
    const defaultBounds = {
      width: CELL_DEFAULT_WIDTH,
      height: 0,
      x: 0,
      y: 0,
    }
    const bounds = this.item === undefined
      ? defaultBounds
      : this.item.bounds
    return {
      x: this.pos!.x + this.itemPos.x - bounds.x,
      y: this.pos!.y + this.itemPos.y - bounds.y,
    }
  }

  private _setItemPos(newSize: { width: number; height: number }) {
    const minSize = this.getMinSize()
    const { padding } = this
    let { x, y } = getCenterDelta(newSize, minSize)
    y += padding
    switch (this.align) {
      case LEFT:
        x = padding
        break
      case RIGHT:
        x = newSize.width - minSize.width + padding
        break
      case MIDDLE:
      default:
        x += padding
        break
    }
    this.itemPos = { x, y }
  }
}

// ============== ColumnMap ==============
export class ColumnMap {
  rowLength: number
  colMap: Map<string, { key: string; cells: { items: any[] }[] }>
  keyArr: string[]

  constructor(rowLength: number) {
    this.rowLength = rowLength
    this.colMap = new Map()
    this.keyArr = []
  }

  getColumn(key: string) {
    const { colMap, rowLength } = this
    if (!colMap.has(key)) {
      const cells = Array.from({ length: rowLength }).map(() => ({ items: [] }))
      colMap.set(key, { key, cells })
      this.keyArr.push(key)
    }
    return colMap.get(key)!
  }

  getCell(index: number, key: string) {
    const column = this.getColumn(key)
    return column.cells[index]
  }

  getColumns() {
    return this.keyArr.map((key) => this.colMap.get(key))
  }

  setKeyArr(labelKeyList: string[] = []) {
    const oldLabelKeyList = [...this.keyArr]
    const result: string[] = []
    labelKeyList.forEach((key) => {
      const index = oldLabelKeyList.indexOf(key)
      if (index !== -1) {
        oldLabelKeyList.splice(index, 1)
        result.push(key)
      }
    })
    this.keyArr = result.concat(oldLabelKeyList)
  }

  setKey(oldKey: string, newKey: string) {
    const index = this.keyArr.indexOf(oldKey)
    this.keyArr[index] = newKey
    this.colMap.set(newKey, this.colMap.get(oldKey)!)
    this.colMap.delete(oldKey)
  }

  changeKeyOrder(oldIndex: number, newIndex: number) {
    const [targetKey] = this.keyArr.splice(oldIndex, 1)
    this.keyArr.splice(newIndex, 0, targetKey)
  }
}
