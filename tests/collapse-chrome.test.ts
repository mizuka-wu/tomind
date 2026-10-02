/**
 * 折叠按钮几何 parity — 锁定与 snowbrush layoutExtendCollapse 一致的常量与公式
 * （SB utils/layoutconstant: COL_GAP 13 / EXT_GAP 14 / COL_RADIUS 6 / EXT_RADIUS 8）
 */
import { describe, it, expect } from 'vitest'
import { computeCollapseButtonPos } from '../packages/view/src/renderers/collapse-geometry'

const bounds = { x: 100, y: 200, width: 80, height: 40 }

describe('collapse button geometry (SB parity)', () => {
  it('expanded uses COL_GAP=13 / COL_RADIUS=6', () => {
    const r = computeCollapseButtonPos(bounds, 'right', false)
    expect(r.gap).toBe(13)
    expect(r.r).toBe(6)
    expect(r.x).toBe(100 + 80 + 13 - 6)
    expect(r.y).toBe(200 + 20 - 6)
  })
  it('collapsed uses EXT_GAP=14 / EXT_RADIUS=8', () => {
    const r = computeCollapseButtonPos(bounds, 'right', true)
    expect(r.gap).toBe(14)
    expect(r.r).toBe(8)
    expect(r.x).toBe(100 + 80 + 14 - 8)
    expect(r.y).toBe(200 + 20 - 8)
  })
  it('left/down/up sides mirror SB formula', () => {
    expect(computeCollapseButtonPos(bounds, 'left', false)).toMatchObject({ x: 100 - 13 - 6, y: 214 })
    expect(computeCollapseButtonPos(bounds, 'down', false)).toMatchObject({ x: 134, y: 200 + 40 + 13 - 6 })
    expect(computeCollapseButtonPos(bounds, 'up', false)).toMatchObject({ x: 134, y: 200 - 13 - 6 })
  })
})
