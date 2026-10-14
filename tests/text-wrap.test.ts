/**
 * 标题换行宽度决策回归测试（renderers/text-wrap.ts）
 *
 * SB 的 titleView 从不二次换行（自己切行、每行一个 tspan，
 * titleView.bounds.width = ceil(最宽行)）。leafer 的 Text 一旦设了 width
 * 就会用**自己**的文本量测再排一遍，量测宽零点几像素就把最后一个字挤到下一行：
 * 实测矩阵单元格「正温度系数（PTC)」SB 113.96×18（一行）→ TM width=114 时 114×42（两行），
 * 标题溢出 30px 高的单元格。
 *
 * 结论：只有布局侧真的换行了（titleHeight > 一行）才约束 width。
 */

import { describe, it, expect } from 'vitest'
import { computeTitleWrapWidth, LAYOUT_LINE_HEIGHT_RATIO } from '../packages/view/src/renderers/text-wrap'

const lineH = (fontSize: number) => Math.floor(fontSize * LAYOUT_LINE_HEIGHT_RATIO)

describe('computeTitleWrapWidth', () => {
  it('单行标题不约束宽度（返回 undefined）', () => {
    const fs = 14
    expect(computeTitleWrapWidth(
      { width: 68, titleWidth: 56, titleHeight: lineH(fs) },
      { fontSize: fs },
    )).toBeUndefined()
    // 中央主题：208×70 盒、150×40 标题、fontSize 30
    expect(computeTitleWrapWidth(
      { width: 208, titleWidth: 150, titleHeight: lineH(30) },
      { fontSize: 30 },
    )).toBeUndefined()
  })

  it('多行标题仍约束到 titleWidth（否则 leafer 会排成一行溢出主题盒）', () => {
    const fs = 14
    expect(computeTitleWrapWidth(
      { width: 300, titleWidth: 294, titleHeight: lineH(fs) * 2 },
      { fontSize: fs },
    )).toBe(294)
    expect(computeTitleWrapWidth(
      { width: 300, titleWidth: 294, titleHeight: lineH(fs) * 5 },
      { fontSize: fs },
    )).toBe(294)
  })

  it('布局没给 titleWidth 时退回「盒宽 − 16」兜底（旧行为）', () => {
    expect(computeTitleWrapWidth({ width: 68, titleWidth: 0, titleHeight: 0 }, { fontSize: 14 })).toBe(52)
    expect(computeTitleWrapWidth({ width: 68, titleWidth: 0, titleHeight: 18 }, {})).toBe(52)
  })

  it('titleWidth 过小时不低于 20', () => {
    expect(computeTitleWrapWidth(
      { width: 40, titleWidth: 8, titleHeight: lineH(14) * 2 },
      { fontSize: 14 },
    )).toBe(20)
  })
})
