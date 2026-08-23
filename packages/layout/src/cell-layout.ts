/**
 * Cell Layout System — 轻量级 Cell 布局系统
 *
 * 参考 snowbrush 的 LayoutCell / GridLayout 实现
 * 用于 Part-Aware Layout，让布局引擎感知 topic 内部的 Part
 */

// ==================== 类型定义 ====================

export type HorizontalAlignment = 'beginning' | 'center' | 'end' | 'fill'
export type VerticalAlignment = 'beginning' | 'center' | 'end' | 'fill'

export interface CellLayoutData {
  exclude: boolean
  horizontalAlignment: HorizontalAlignment
  verticalAlignment: VerticalAlignment
  horizontalSpan: number
  verticalSpan: number
  minimumWidth: number
  minimumHeight: number
}

export interface Size {
  width: number
  height: number
}

export interface Position {
  x: number
  y: number
}

export interface Bounds extends Position, Size {}

export interface Margins {
  top: number
  right: number
  bottom: number
  left: number
}

// ==================== CellGridLayout ====================

export class CellGridLayout {
  numColumns: number
  horizontalSpacing: number
  verticalSpacing: number
  margins: Margins

  constructor(numColumns: number = 1, options?: {
    horizontalSpacing?: number
    verticalSpacing?: number
    margins?: Partial<Margins>
  }) {
    this.numColumns = numColumns
    this.horizontalSpacing = options?.horizontalSpacing ?? 0
    this.verticalSpacing = options?.verticalSpacing ?? 0
    this.margins = {
      top: options?.margins?.top ?? 0,
      right: options?.margins?.right ?? 0,
      bottom: options?.margins?.bottom ?? 0,
      left: options?.margins?.left ?? 0,
    }
  }

  /**
   * 计算 parent 的首选尺寸
   */
  computeSize(parent: CellLayout, wHint: number, hHint: number): Size {
    const children = this.getVisibleChildren(parent)
    if (children.length === 0) {
      return {
        width: this.margins.left + this.margins.right,
        height: this.margins.top + this.margins.bottom,
      }
    }

    // 计算每个 child 的首选尺寸
    for (const child of children) {
      this.computeChildSize(child)
    }

    // 构建网格
    const { grid, rowCount, columnCount } = this.buildGrid(children)

    // 计算列宽
    const widths = this.computeColumnWidths(grid, rowCount, columnCount, wHint)

    // 计算行高
    const heights = this.computeRowHeights(grid, rowCount, columnCount, hHint)

    // 计算总尺寸
    let totalWidth = 0
    for (let i = 0; i < columnCount; i++) {
      totalWidth += widths[i]
    }
    totalWidth += this.horizontalSpacing * (columnCount - 1) + this.margins.left + this.margins.right

    let totalHeight = 0
    for (let i = 0; i < rowCount; i++) {
      totalHeight += heights[i]
    }
    totalHeight += this.verticalSpacing * (rowCount - 1) + this.margins.top + this.margins.bottom

    return {
      width: Math.max(0, totalWidth),
      height: Math.max(0, totalHeight),
    }
  }

  /**
   * 布局 children 到 parent 的 bounds 内
   */
  layout(parent: CellLayout, bounds: Bounds): void {
    const children = this.getVisibleChildren(parent)
    if (children.length === 0) return

    // 重置每个 child 的 computedSize
    for (const child of children) {
      child.computedSize = { width: -1, height: -1 }
    }

    // 计算每个 child 的首选尺寸
    for (const child of children) {
      this.computeChildSize(child)
    }

    // 构建网格
    const { grid, rowCount, columnCount } = this.buildGrid(children)

    // 计算可用空间
    const availableWidth = bounds.width - this.margins.left - this.margins.right - this.horizontalSpacing * (columnCount - 1)
    const availableHeight = bounds.height - this.margins.top - this.margins.bottom - this.verticalSpacing * (rowCount - 1)

    // 计算列宽
    const widths = this.computeColumnWidths(grid, rowCount, columnCount, bounds.width)

    // 计算行高
    const heights = this.computeRowHeights(grid, rowCount, columnCount, bounds.height)

    // 如果有可用空间，分配给可扩展的列/行
    this.distributeExtraSpace(widths, availableWidth, grid, rowCount, columnCount, 'horizontal')
    this.distributeExtraSpace(heights, availableHeight, grid, rowCount, columnCount, 'vertical')

    // 定位 children
    this.positionChildren(grid, rowCount, columnCount, widths, heights, bounds)
  }

  /**
   * 获取可见的 children（过滤 exclude=true 的）
   */
  private getVisibleChildren(parent: CellLayout): CellLayout[] {
    return parent.children.filter(child => !child.data.exclude)
  }

  /**
   * 计算 child 的首选尺寸
   */
  private computeChildSize(child: CellLayout): void {
    if (child.computedSize.width >= 0 && child.computedSize.height >= 0) return
    child.computedSize = child.getPreferredSize(-1, -1)
  }

  /**
   * 构建网格
   */
  private buildGrid(children: CellLayout[]): {
    grid: (CellLayout | null)[][]
    rowCount: number
    columnCount: number
  } {
    const columnCount = Math.min(children.length, this.numColumns)
    const grid: (CellLayout | null)[][] = []
    let row = 0
    let column = 0

    for (const child of children) {
      const hSpan = Math.min(child.data.horizontalSpan, columnCount)
      const vSpan = child.data.verticalSpan

      // 找到可用位置
      while (column + hSpan > columnCount) {
        column = 0
        row++
      }

      // 确保行存在
      while (grid.length <= row) {
        grid.push(new Array(columnCount).fill(null))
      }

      // 填充网格
      for (let i = 0; i < vSpan; i++) {
        while (grid.length <= row + i) {
          grid.push(new Array(columnCount).fill(null))
        }
        for (let j = 0; j < hSpan; j++) {
          grid[row + i][column + j] = child
        }
      }

      column += hSpan
      if (column >= columnCount) {
        column = 0
        row++
      }
    }

    return {
      grid,
      rowCount: grid.length,
      columnCount,
    }
  }

  /**
   * 计算列宽
   */
  private computeColumnWidths(
    grid: (CellLayout | null)[][],
    rowCount: number,
    columnCount: number,
    _wHint: number,
  ): number[] {
    const widths = new Array(columnCount).fill(0)

    // 单 span cell 设置 min
    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < columnCount; j++) {
        const cell = grid[i][j]
        if (!cell) continue

        const hSpan = Math.min(cell.data.horizontalSpan, columnCount)
        if (hSpan === 1) {
          widths[j] = Math.max(widths[j], cell.computedSize.width)
        }
      }
    }

    // 多 span cell 分配
    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < columnCount; j++) {
        const cell = grid[i][j]
        if (!cell) continue

        const hSpan = Math.min(cell.data.horizontalSpan, columnCount)
        if (hSpan > 1) {
          let spanWidth = 0
          for (let k = 0; k < hSpan; k++) {
            spanWidth += widths[j + k]
          }
          spanWidth += this.horizontalSpacing * (hSpan - 1)

          if (cell.computedSize.width > spanWidth) {
            const extra = cell.computedSize.width - spanWidth
            const delta = Math.floor(extra / hSpan)
            const remainder = extra % hSpan
            for (let k = 0; k < hSpan; k++) {
              widths[j + k] += delta
            }
            widths[j] += remainder
          }
        }
      }
    }

    return widths
  }

  /**
   * 计算行高
   */
  private computeRowHeights(
    grid: (CellLayout | null)[][],
    rowCount: number,
    columnCount: number,
    _hHint: number,
  ): number[] {
    const heights = new Array(rowCount).fill(0)

    // 单 span cell 设置 min
    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < columnCount; j++) {
        const cell = grid[i][j]
        if (!cell) continue

        const vSpan = Math.min(cell.data.verticalSpan, rowCount)
        if (vSpan === 1) {
          heights[i] = Math.max(heights[i], cell.computedSize.height)
        }
      }
    }

    // 多 span cell 分配
    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < columnCount; j++) {
        const cell = grid[i][j]
        if (!cell) continue

        const vSpan = Math.min(cell.data.verticalSpan, rowCount)
        if (vSpan > 1) {
          let spanHeight = 0
          for (let k = 0; k < vSpan; k++) {
            spanHeight += heights[i + k]
          }
          spanHeight += this.verticalSpacing * (vSpan - 1)

          if (cell.computedSize.height > spanHeight) {
            const extra = cell.computedSize.height - spanHeight
            const delta = Math.floor(extra / vSpan)
            const remainder = extra % vSpan
            for (let k = 0; k < vSpan; k++) {
              heights[i + k] += delta
            }
            heights[i] += remainder
          }
        }
      }
    }

    return heights
  }

  /**
   * 分配额外空间给可扩展的列/行
   */
  private distributeExtraSpace(
    sizes: number[],
    available: number,
    grid: (CellLayout | null)[][],
    rowCount: number,
    columnCount: number,
    direction: 'horizontal' | 'vertical',
  ): void {
    let total = 0
    for (const size of sizes) {
      total += size
    }

    if (total >= available) return

    const extra = available - total
    const expandable: number[] = []

    // 找出可扩展的列/行
    const count = direction === 'horizontal' ? columnCount : rowCount
    for (let i = 0; i < count; i++) {
      let hasGrab = false
      const innerCount = direction === 'horizontal' ? rowCount : columnCount
      for (let j = 0; j < innerCount; j++) {
        const cell = direction === 'horizontal' ? grid[j][i] : grid[i][j]
        if (cell) {
          if (direction === 'horizontal' && cell.data.horizontalAlignment === 'fill') {
            hasGrab = true
          } else if (direction === 'vertical' && cell.data.verticalAlignment === 'fill') {
            hasGrab = true
          }
        }
      }
      if (hasGrab) {
        expandable.push(i)
      }
    }

    if (expandable.length === 0) return

    // 分配额外空间
    const delta = Math.floor(extra / expandable.length)
    const remainder = extra % expandable.length
    for (let i = 0; i < expandable.length; i++) {
      sizes[expandable[i]] += delta
      if (i === 0) {
        sizes[expandable[i]] += remainder
      }
    }
  }

  /**
   * 定位 children
   */
  private positionChildren(
    grid: (CellLayout | null)[][],
    rowCount: number,
    columnCount: number,
    widths: number[],
    heights: number[],
    bounds: Bounds,
  ): void {
    let gridY = bounds.y + this.margins.top

    for (let i = 0; i < rowCount; i++) {
      let gridX = bounds.x + this.margins.left

      for (let j = 0; j < columnCount; j++) {
        const cell = grid[i][j]
        if (!cell) continue

        // 检查是否是 span 的起始位置
        const hSpan = Math.min(cell.data.horizontalSpan, columnCount)
        const vSpan = Math.min(cell.data.verticalSpan, rowCount)

        // 计算 cell 的可用空间
        let cellWidth = 0
        for (let k = 0; k < hSpan; k++) {
          cellWidth += widths[j + k]
        }
        cellWidth += this.horizontalSpacing * (hSpan - 1)

        let cellHeight = 0
        for (let k = 0; k < vSpan; k++) {
          cellHeight += heights[i + k]
        }
        cellHeight += this.verticalSpacing * (vSpan - 1)

        // 根据 alignment 计算位置
        let childX = gridX
        let childWidth = cell.computedSize.width

        switch (cell.data.horizontalAlignment) {
          case 'center':
            childX += Math.max(0, (cellWidth - childWidth) / 2)
            break
          case 'end':
            childX += Math.max(0, cellWidth - childWidth)
            break
          case 'fill':
            childWidth = cellWidth
            break
        }

        let childY = gridY
        let childHeight = cell.computedSize.height

        switch (cell.data.verticalAlignment) {
          case 'center':
            childY += Math.max(0, (cellHeight - childHeight) / 2)
            break
          case 'end':
            childY += Math.max(0, cellHeight - childHeight)
            break
          case 'fill':
            childHeight = cellHeight
            break
        }

        cell.position = { x: childX, y: childY }
        cell.computedSize = { width: childWidth, height: childHeight }

        // 跳过已经处理过的 span 单元格
        j += hSpan - 1
        gridX += cellWidth + this.horizontalSpacing
      }

      gridY += heights[i] + this.verticalSpacing
    }
  }
}

// ==================== CellLayout ====================

export class CellLayout {
  id: string
  children: CellLayout[]
  layout: CellGridLayout | null
  data: CellLayoutData
  calcSize: () => Size
  computedSize: Size
  position: Position

  constructor(id: string, options?: {
    layout?: CellGridLayout
    data?: Partial<CellLayoutData>
    calcSize?: () => Size
  }) {
    this.id = id
    this.children = []
    this.layout = options?.layout ?? null
    this.data = {
      exclude: options?.data?.exclude ?? false,
      horizontalAlignment: options?.data?.horizontalAlignment ?? 'beginning',
      verticalAlignment: options?.data?.verticalAlignment ?? 'center',
      horizontalSpan: options?.data?.horizontalSpan ?? 1,
      verticalSpan: options?.data?.verticalSpan ?? 1,
      minimumWidth: options?.data?.minimumWidth ?? 0,
      minimumHeight: options?.data?.minimumHeight ?? 0,
    }
    this.calcSize = options?.calcSize ?? (() => ({ width: 0, height: 0 }))
    this.computedSize = { width: -1, height: -1 }
    this.position = { x: 0, y: 0 }
  }

  add(child: CellLayout): void {
    this.children.push(child)
  }

  remove(child: CellLayout): void {
    const index = this.children.indexOf(child)
    if (index >= 0) {
      this.children.splice(index, 1)
    }
  }

  removeAll(): void {
    this.children.length = 0
  }

  getChildren(): CellLayout[] {
    return [...this.children]
  }

  invalidate(): void {
    this.computedSize = { width: -1, height: -1 }
  }

  getPreferredSize(wHint: number, hHint: number): Size {
    if (this.computedSize.width >= 0 && this.computedSize.height >= 0) {
      return this.computedSize
    }

    let size: Size
    if (this.layout) {
      size = this.layout.computeSize(this, wHint, hHint)
    } else {
      size = this.calcSize()
    }

    this.computedSize = size
    return size
  }

  layoutChildren(bounds: Bounds): void {
    if (this.layout) {
      this.layout.layout(this, bounds)
    }
  }
}

export default { CellLayout, CellGridLayout }
