/**
 * Cell Layout 单元测试
 */

import { describe, it, expect } from 'vitest'
import { CellLayout, CellGridLayout } from '@tomind/layout'

describe('CellLayout', () => {
  it('should create cell with default options', () => {
    const cell = new CellLayout('test')
    expect(cell.id).toBe('test')
    expect(cell.children).toEqual([])
    expect(cell.layout).toBeNull()
    expect(cell.data.exclude).toBe(false)
    expect(cell.data.horizontalAlignment).toBe('beginning')
    expect(cell.data.verticalAlignment).toBe('center')
    expect(cell.data.horizontalSpan).toBe(1)
    expect(cell.data.verticalSpan).toBe(1)
  })

  it('should add and remove children', () => {
    const parent = new CellLayout('parent')
    const child1 = new CellLayout('child1')
    const child2 = new CellLayout('child2')

    parent.add(child1)
    parent.add(child2)
    expect(parent.children).toEqual([child1, child2])

    parent.remove(child1)
    expect(parent.children).toEqual([child2])

    parent.removeAll()
    expect(parent.children).toEqual([])
  })

  it('should get preferred size from calcSize', () => {
    const cell = new CellLayout('test', {
      calcSize: () => ({ width: 100, height: 50 }),
    })

    const size = cell.getPreferredSize(-1, -1)
    expect(size).toEqual({ width: 100, height: 50 })
  })

  it('should get preferred size from layout', () => {
    const parent = new CellLayout('parent', {
      layout: new CellGridLayout(1),
    })
    const child = new CellLayout('child', {
      calcSize: () => ({ width: 100, height: 50 }),
    })
    parent.add(child)

    const size = parent.getPreferredSize(-1, -1)
    expect(size.width).toBeGreaterThanOrEqual(100)
    expect(size.height).toBeGreaterThanOrEqual(50)
  })

  it('should invalidate size cache', () => {
    const cell = new CellLayout('test', {
      calcSize: () => ({ width: 100, height: 50 }),
    })

    // First call
    cell.getPreferredSize(-1, -1)
    expect(cell.computedSize).toEqual({ width: 100, height: 50 })

    // Invalidate
    cell.invalidate()
    expect(cell.computedSize).toEqual({ width: -1, height: -1 })
  })
})

describe('CellGridLayout', () => {
  it('should create grid layout with default options', () => {
    const layout = new CellGridLayout(2)
    expect(layout.numColumns).toBe(2)
    expect(layout.horizontalSpacing).toBe(0)
    expect(layout.verticalSpacing).toBe(0)
    expect(layout.margins).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
  })

  it('should create grid layout with custom options', () => {
    const layout = new CellGridLayout(3, {
      horizontalSpacing: 10,
      verticalSpacing: 5,
      margins: { top: 10, right: 20, bottom: 10, left: 20 },
    })
    expect(layout.numColumns).toBe(3)
    expect(layout.horizontalSpacing).toBe(10)
    expect(layout.verticalSpacing).toBe(5)
    expect(layout.margins).toEqual({ top: 10, right: 20, bottom: 10, left: 20 })
  })

  it('should compute size for empty parent', () => {
    const layout = new CellGridLayout(1)
    const parent = new CellLayout('parent', { layout })

    const size = layout.computeSize(parent, -1, -1)
    expect(size).toEqual({ width: 0, height: 0 })
  })

  it('should compute size with margins', () => {
    const layout = new CellGridLayout(1, {
      margins: { top: 10, right: 20, bottom: 10, left: 20 },
    })
    const parent = new CellLayout('parent', { layout })

    const size = layout.computeSize(parent, -1, -1)
    expect(size).toEqual({ width: 40, height: 20 })
  })

  it('should compute size for single child', () => {
    const layout = new CellGridLayout(1)
    const parent = new CellLayout('parent', { layout })
    const child = new CellLayout('child', {
      calcSize: () => ({ width: 100, height: 50 }),
    })
    parent.add(child)

    const size = layout.computeSize(parent, -1, -1)
    expect(size).toEqual({ width: 100, height: 50 })
  })

  it('should compute size for multiple children in single column', () => {
    const layout = new CellGridLayout(1, { verticalSpacing: 10 })
    const parent = new CellLayout('parent', { layout })
    const child1 = new CellLayout('child1', {
      calcSize: () => ({ width: 100, height: 50 }),
    })
    const child2 = new CellLayout('child2', {
      calcSize: () => ({ width: 80, height: 30 }),
    })
    parent.add(child1)
    parent.add(child2)

    const size = layout.computeSize(parent, -1, -1)
    expect(size).toEqual({ width: 100, height: 90 }) // 50 + 10 + 30
  })

  it('should compute size for multiple children in multiple columns', () => {
    const layout = new CellGridLayout(2, { horizontalSpacing: 10 })
    const parent = new CellLayout('parent', { layout })
    const child1 = new CellLayout('child1', {
      calcSize: () => ({ width: 100, height: 50 }),
    })
    const child2 = new CellLayout('child2', {
      calcSize: () => ({ width: 80, height: 30 }),
    })
    parent.add(child1)
    parent.add(child2)

    const size = layout.computeSize(parent, -1, -1)
    expect(size).toEqual({ width: 190, height: 50 }) // 100 + 10 + 80
  })

  it('should compute size with horizontal span', () => {
    const layout = new CellGridLayout(2, { horizontalSpacing: 10 })
    const parent = new CellLayout('parent', { layout })
    const child1 = new CellLayout('child1', {
      data: { horizontalSpan: 2 },
      calcSize: () => ({ width: 200, height: 50 }),
    })
    const child2 = new CellLayout('child2', {
      calcSize: () => ({ width: 80, height: 30 }),
    })
    parent.add(child1)
    parent.add(child2)

    const size = layout.computeSize(parent, -1, -1)
    expect(size.width).toBe(200)
    expect(size.height).toBe(80) // 50 + 30 (verticalSpacing defaults to 0)
  })

  it('should exclude children with exclude=true', () => {
    const layout = new CellGridLayout(1)
    const parent = new CellLayout('parent', { layout })
    const child1 = new CellLayout('child1', {
      data: { exclude: true },
      calcSize: () => ({ width: 100, height: 50 }),
    })
    const child2 = new CellLayout('child2', {
      calcSize: () => ({ width: 80, height: 30 }),
    })
    parent.add(child1)
    parent.add(child2)

    const size = layout.computeSize(parent, -1, -1)
    expect(size).toEqual({ width: 80, height: 30 })
  })

  it('should layout children with beginning alignment', () => {
    const layout = new CellGridLayout(1)
    const parent = new CellLayout('parent', { layout })
    const child = new CellLayout('child', {
      data: { horizontalAlignment: 'beginning', verticalAlignment: 'beginning' },
      calcSize: () => ({ width: 100, height: 50 }),
    })
    parent.add(child)

    layout.layout(parent, { x: 0, y: 0, width: 200, height: 100 })
    // With beginning alignment, child stays at grid origin
    expect(child.position.x).toBe(0)
    expect(child.position.y).toBe(0)
    expect(child.computedSize.width).toBe(100)
    expect(child.computedSize.height).toBe(50)
  })

  it('should layout children with fill alignment to expand', () => {
    const layout = new CellGridLayout(1)
    const parent = new CellLayout('parent', { layout })
    const child = new CellLayout('child', {
      data: { horizontalAlignment: 'fill', verticalAlignment: 'fill' },
      calcSize: () => ({ width: 100, height: 50 }),
    })
    parent.add(child)

    layout.layout(parent, { x: 0, y: 0, width: 200, height: 100 })
    expect(child.position.x).toBe(0)
    expect(child.position.y).toBe(0)
    expect(child.computedSize.width).toBe(200)
    expect(child.computedSize.height).toBe(100)
  })

  it('should layout children with center alignment within column', () => {
    // center/end alignment positions within the column width, not the bounds width
    // Two children in 2 columns: the smaller child is centered in its column
    const layout = new CellGridLayout(2, { horizontalSpacing: 0 })
    const parent = new CellLayout('parent', { layout })
    const child1 = new CellLayout('child1', {
      data: { horizontalAlignment: 'fill', verticalAlignment: 'fill' },
      calcSize: () => ({ width: 100, height: 80 }),
    })
    const child2 = new CellLayout('child2', {
      data: { horizontalAlignment: 'center', verticalAlignment: 'center' },
      calcSize: () => ({ width: 60, height: 40 }),
    })
    parent.add(child1)
    parent.add(child2)

    layout.layout(parent, { x: 0, y: 0, width: 200, height: 100 })
    // child1 fill → takes 100px (column width based on max preferred width)
    // column widths = [100, 60] (each column sized to its child)
    // But with fill on child1, the grid distributes to make column fill
    // child2 centered in its column (60px wide): center offset = (60-60)/2 = 0
    expect(child1.position.x).toBe(0)
    expect(child1.computedSize.width).toBeGreaterThanOrEqual(100)
    // child2 is in column 1, x = child1 column width
    expect(child2.position.x).toBeGreaterThanOrEqual(100)
    expect(child2.computedSize.width).toBe(60)
    expect(child2.computedSize.height).toBe(40)
  })

  it('should layout children with margins', () => {
    const layout = new CellGridLayout(1, {
      margins: { top: 10, right: 20, bottom: 10, left: 20 },
    })
    const parent = new CellLayout('parent', { layout })
    const child = new CellLayout('child', {
      calcSize: () => ({ width: 100, height: 50 }),
    })
    parent.add(child)

    layout.layout(parent, { x: 0, y: 0, width: 200, height: 100 })
    expect(child.position.x).toBe(20)
    expect(child.position.y).toBe(10)
    expect(child.computedSize.width).toBe(100)
    expect(child.computedSize.height).toBe(50)
  })

  it('should layout children with spacing', () => {
    const layout = new CellGridLayout(2, {
      horizontalSpacing: 10,
      verticalSpacing: 5,
    })
    const parent = new CellLayout('parent', { layout })
    const child1 = new CellLayout('child1', {
      calcSize: () => ({ width: 100, height: 50 }),
    })
    const child2 = new CellLayout('child2', {
      calcSize: () => ({ width: 80, height: 30 }),
    })
    const child3 = new CellLayout('child3', {
      calcSize: () => ({ width: 60, height: 40 }),
    })
    parent.add(child1)
    parent.add(child2)
    parent.add(child3)

    layout.layout(parent, { x: 0, y: 0, width: 300, height: 200 })
    // child1 at (0, 0), child2 at (110, 0) — column 0 is 100px, column 1 is 80px, 10px spacing
    expect(child1.position.x).toBe(0)
    expect(child2.position.x).toBe(110) // 100 + 10 spacing
    // child3 on row 2, y = 50 + 5 spacing = 55
    expect(child3.position.y).toBe(55)
  })
})
