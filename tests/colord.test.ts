import { describe, it, expect } from 'vitest'
import { colord, extend } from 'colord'
import a11yPlugin from 'colord/plugins/a11y'

extend([a11yPlugin])

describe('colord 替代 tinycolor2 验证', () => {
  describe('基本解析', () => {
    it('解析 hex 颜色', () => {
      const c = colord('#ff0000')
      expect(c.isValid()).toBe(true)
      expect(c.toHex()).toBe('#ff0000')
    })

    it('无效颜色返回 isValid=false', () => {
      expect(colord('notacolor').isValid()).toBe(false)
    })

    it('解析 rgb 对象', () => {
      const c = colord({ r: 255, g: 0, b: 0 })
      expect(c.toHex()).toBe('#ff0000')
    })
  })

  describe('toRgb', () => {
    it('返回正确的 RGB 分量', () => {
      const rgb = colord('#808080').toRgb()
      expect(rgb.r).toBe(128)
      expect(rgb.g).toBe(128)
      expect(rgb.b).toBe(128)
    })
  })

  describe('toHsl', () => {
    it('红色 HSL', () => {
      const hsl = colord('#ff0000').toHsl()
      expect(hsl.h).toBe(0)
      expect(hsl.s).toBe(100)
      expect(hsl.l).toBe(50)
    })

    it('绿色 HSL', () => {
      const hsl = colord('#00ff00').toHsl()
      expect(hsl.h).toBe(120)
      expect(hsl.s).toBe(100)
      expect(hsl.l).toBe(50)
    })
  })

  describe('contrast (替代 tinycolor.readability)', () => {
    it('黑白对比度 = 21', () => {
      const ratio = colord('#000000').contrast(colord('#ffffff'))
      expect(ratio).toBeCloseTo(21, 0)
    })

    it('红白对比度 < 5', () => {
      const ratio = colord('#ff0000').contrast(colord('#ffffff'))
      expect(ratio).toBeLessThan(5)
      expect(ratio).toBeGreaterThan(1)
    })

    it('深色背景对比白色 >= 3 时应选白色字体', () => {
      // 模拟 style-engine 逻辑: 深色 fill 应选白色 fontColor
      const bg = colord('#1a1a1a')
      const ratio = bg.contrast(colord('#ffffff'))
      expect(ratio).toBeGreaterThanOrEqual(3)
    })

    it('浅色背景对比白色 < 3 时应选黑色字体', () => {
      const bg = colord('#f0f0f0')
      const ratio = bg.contrast(colord('#ffffff'))
      expect(ratio).toBeLessThan(3)
    })
  })

  describe('blendAlpha (替代 tinycolor blend)', () => {
    it('alpha=1 返回前景色', () => {
      const fg = colord('#ff0000').toRgb()
      const bg = colord('#0000ff').toRgb()
      const alpha = 1
      const r = Math.round(alpha * fg.r + (1 - alpha) * bg.r)
      const g = Math.round(alpha * fg.g + (1 - alpha) * bg.g)
      const b = Math.round(alpha * fg.b + (1 - alpha) * bg.b)
      expect(colord({ r, g, b }).toHex()).toBe('#ff0000')
    })

    it('alpha=0 返回背景色', () => {
      const fg = colord('#ff0000').toRgb()
      const bg = colord('#0000ff').toRgb()
      const alpha = 0
      const r = Math.round(alpha * fg.r + (1 - alpha) * bg.r)
      const g = Math.round(alpha * fg.g + (1 - alpha) * bg.g)
      const b = Math.round(alpha * fg.b + (1 - alpha) * bg.b)
      expect(colord({ r, g, b }).toHex()).toBe('#0000ff')
    })

    it('alpha=0.5 混合', () => {
      const fg = colord('#ffffff').toRgb()
      const bg = colord('#000000').toRgb()
      const alpha = 0.5
      const r = Math.round(alpha * fg.r + (1 - alpha) * bg.r)
      const g = Math.round(alpha * fg.g + (1 - alpha) * bg.g)
      const b = Math.round(alpha * fg.b + (1 - alpha) * bg.b)
      // 50% white + 50% black = gray #808080
      expect(r).toBe(128)
      expect(g).toBe(128)
      expect(b).toBe(128)
    })
  })
})
