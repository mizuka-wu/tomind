/**
 * measureTextSize 宽度取整口径回归测试
 *
 * SB 的主题盒宽度组成（探针实测 test-numbering.xmind 的 "直线位移改变面积型"）：
 *   topicBounds.width 199.16015625
 *     = titleView.bounds.width 126（整数：9 个 14px 中日韩字）
 *     + numberingView.bounds.width 51.16015625（"10.1.1.1"，**小数**）
 *     + innerGroup horizontalSpacing 10
 *     + marginLeft 6 + marginRight 6
 *
 * 即标题宽取整、编号宽不取整。TM 之前对编号也取整（51.16 → 52），
 * 每个带编号的主题宽 1px，在左向分支上逐层放大成 2px 位移
 * （numbering fixture avgΔX 0.9 / avgΔW 0.4）。
 */

import { describe, it, expect } from 'vitest'
import { measureTextSize, DEFAULT_LAYOUT_OPTIONS } from '@tomind/layout'

const TEXT = 'ab'
const FONT_SIZE = 15

const measure = (ceilWidth?: boolean) =>
  ceilWidth === undefined
    ? measureTextSize(TEXT, FONT_SIZE, DEFAULT_LAYOUT_OPTIONS)
    : measureTextSize(TEXT, FONT_SIZE, DEFAULT_LAYOUT_OPTIONS, undefined, undefined, 'normal', ceilWidth)

describe('measureTextSize ceilWidth 参数', () => {
  it('默认取整、ceilWidth=false 保留小数，且二者确实不同', () => {
    const raw = measure(false)
    const ceiled = measure()

    // 前置：原始宽度确实是小数，否则本用例没有鉴别力
    expect(Number.isInteger(raw.width)).toBe(false)
    expect(ceiled.width).toBe(Math.ceil(raw.width))
    expect(ceiled.width).toBeGreaterThan(raw.width)
  })

  it('高度不受 ceilWidth 影响（本身已是整数）', () => {
    expect(measure(false).height).toBe(measure(true).height)
    expect(Number.isInteger(measure(false).height)).toBe(true)
  })

  it('换行判定用原始宽度，与 ceilWidth 无关', () => {
    // maxWidth 卡在原始宽度和取整宽度之间：两种模式都应换行到同一结果
    const narrow = { ...DEFAULT_LAYOUT_OPTIONS, maxTitleWidth: measure(false).width + 0.2 }
    const a = measureTextSize('ab\ncd', FONT_SIZE, narrow, undefined, undefined, 'normal', false)
    const b = measureTextSize('ab\ncd', FONT_SIZE, narrow, undefined, undefined, 'normal', true)
    expect(a.height).toBe(b.height)
  })
})
