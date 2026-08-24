/**
 * StyleEngine 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StyleEngine, resolveColorVariables } from '@tomind/style'
import type { ThemeData, ResolvedStyle } from '@tomind/style'

describe('StyleEngine', () => {
  let engine: StyleEngine

  beforeEach(() => {
    engine = new StyleEngine()
  })

  describe('toLeaferStyle', () => {
    it('should map fillColor to fill', () => {
      const style: ResolvedStyle = { fillColor: '#ff0000' }
      const result = engine.toLeaferStyle(style)
      expect(result.fill).toBe('#ff0000')
    })

    it('should map borderColor to stroke', () => {
      const style: ResolvedStyle = { borderColor: '#00ff00' }
      const result = engine.toLeaferStyle(style)
      expect(result.stroke).toBe('#00ff00')
    })

    it('should map lineColor to lineColor', () => {
      const style: ResolvedStyle = { lineColor: '#0000ff' }
      const result = engine.toLeaferStyle(style)
      expect(result.lineColor).toBe('#0000ff')
    })

    it('should map lineWidth to lineStrokeWidth (new key)', () => {
      const style: ResolvedStyle = { lineWidth: '2pt' }
      const result = engine.toLeaferStyle(style)
      expect(result.lineStrokeWidth).toBeDefined()
    })

    it('should map borderWidth to strokeWidth', () => {
      const style: ResolvedStyle = { borderWidth: '1pt' }
      const result = engine.toLeaferStyle(style)
      expect(result.strokeWidth).toBeDefined()
    })

    it('should map lineCorner to lineCornerRadius (new key)', () => {
      const style: ResolvedStyle = { lineCorner: '8pt' }
      const result = engine.toLeaferStyle(style)
      expect(result.lineCornerRadius).toBeDefined()
    })

    it('should map shapeCorner to cornerRadius', () => {
      const style: ResolvedStyle = { shapeCorner: '5pt' }
      const result = engine.toLeaferStyle(style)
      expect(result.cornerRadius).toBeDefined()
    })

    it('should map linePattern to strokeDash', () => {
      const style: ResolvedStyle = { linePattern: 'dash' }
      const result = engine.toLeaferStyle(style)
      expect(result.strokeDash).toEqual([5, 3])
    })

    it('should map linePattern solid to null', () => {
      const style: ResolvedStyle = { linePattern: 'solid' }
      const result = engine.toLeaferStyle(style)
      expect(result.strokeDash).toBeNull()
    })

    it('should map borderPattern to dashPattern', () => {
      const style: ResolvedStyle = { borderPattern: 'dash' }
      const result = engine.toLeaferStyle(style)
      expect(result.dashPattern).toEqual([5, 3])
    })

    it('should map fontColor to fontColor', () => {
      const style: ResolvedStyle = { fontColor: '#333333' }
      const result = engine.toLeaferStyle(style)
      expect(result.fontColor).toBe('#333333')
    })

    it('should map opacity correctly', () => {
      const style: ResolvedStyle = { opacity: 0.5 }
      const result = engine.toLeaferStyle(style)
      expect(result.opacity).toBe(0.5)
    })

    it('should handle none values', () => {
      const style: ResolvedStyle = { fillColor: 'none' }
      const result = engine.toLeaferStyle(style)
      // fillColor 'none' should be converted to null and skipped
      expect(result.fill).toBeUndefined()
    })

    it('should parse linear gradient', () => {
      const style: ResolvedStyle = { fillGradient: 'linear(45deg, #ff0000, #00ff00)' }
      const result = engine.toLeaferStyle(style)
      expect(result.fill).toBeDefined()
      expect(typeof result.fill).toBe('object')
    })
  })

  describe('composeTheme', () => {
    it('should compose skeleton theme', () => {
      const base: ThemeData = {
        centralTopic: {
          id: 'base',
          properties: { fillColor: '#ffffff', shapeClass: 'roundedRect' },
        },
      }
      const skeleton: ThemeData = {
        centralTopic: {
          id: 'skeleton',
          properties: { shapeClass: 'ellipse', lineClass: 'curve' },
        },
      }
      const result = engine.composeTheme(base, skeleton)
      expect(result.centralTopic.properties.shapeClass).toBe('ellipse')
      expect(result.centralTopic.properties.lineClass).toBe('curve')
      // fillColor should not be overridden by skeleton
      expect(result.centralTopic.properties.fillColor).toBe('#ffffff')
    })

    it('should compose color theme', () => {
      const base: ThemeData = {
        centralTopic: {
          id: 'base',
          properties: { fillColor: '#ffffff', shapeClass: 'roundedRect' },
        },
      }
      const color: ThemeData = {
        centralTopic: {
          id: 'color',
          properties: { fillColor: '#ff0000', fontColor: '#000000' },
        },
      }
      const result = engine.composeTheme(base, undefined, color)
      expect(result.centralTopic.properties.fillColor).toBe('#ff0000')
      expect(result.centralTopic.properties.fontColor).toBe('#000000')
      // shapeClass should not be overridden by color
      expect(result.centralTopic.properties.shapeClass).toBe('roundedRect')
    })

    it('should compose both skeleton and color themes', () => {
      const base: ThemeData = {
        centralTopic: {
          id: 'base',
          properties: { fillColor: '#ffffff' },
        },
      }
      const skeleton: ThemeData = {
        centralTopic: {
          id: 'skeleton',
          properties: { shapeClass: 'ellipse' },
        },
      }
      const color: ThemeData = {
        centralTopic: {
          id: 'color',
          properties: { fillColor: '#ff0000' },
        },
      }
      const result = engine.composeTheme(base, skeleton, color)
      expect(result.centralTopic.properties.shapeClass).toBe('ellipse')
      expect(result.centralTopic.properties.fillColor).toBe('#ff0000')
    })

    it('should handle per-level themes', () => {
      const base: ThemeData = {
        centralTopic: {
          id: 'base',
          properties: { fontSize: '28pt' },
        },
      }
      const skeleton: ThemeData = {
        level3: {
          id: 'level3',
          properties: { fontSize: '12pt' },
        },
      }
      const result = engine.composeTheme(base, skeleton)
      // Per-level themes should be merged into result
      expect(result.level3).toBeDefined()
      expect(result.level3!.properties.fontSize).toBe('12pt')
    })

    it('should keep skeleton fillColor "none" when color theme omits it', () => {
      const base: ThemeData = {
        subTopic: {
          id: 'base',
          properties: { fillColor: '#ffffff' },
        },
      }
      const skeleton: ThemeData = {
        subTopic: {
          id: 'skeleton',
          properties: { fillColor: 'none', shapeClass: 'underline' },
        },
      }
      const result = engine.composeTheme(base, skeleton)
      expect(result.subTopic.properties.fillColor).toBe('none')
      expect(result.subTopic.properties.shapeClass).toBe('underline')
    })

    it('should let skeleton fillColor "none" override color theme fill', () => {
      const base: ThemeData = {
        subTopic: {
          id: 'base',
          properties: { fillColor: '#ffffff' },
        },
      }
      const skeleton: ThemeData = {
        subTopic: {
          id: 'skeleton',
          properties: { fillColor: 'none' },
        },
      }
      const color: ThemeData = {
        subTopic: {
          id: 'color',
          properties: { fillColor: '#edf2f7' },
        },
      }
      const result = engine.composeTheme(base, skeleton, color)
      expect(result.subTopic.properties.fillColor).toBe('none')
    })

    it('should let color theme override fillColor when skeleton did not declare "none"', () => {
      const base: ThemeData = {
        subTopic: {
          id: 'base',
          properties: { fillColor: '#ffffff' },
        },
      }
      const skeleton: ThemeData = {
        subTopic: {
          id: 'skeleton',
          properties: { shapeClass: 'underline' },
        },
      }
      const color: ThemeData = {
        subTopic: {
          id: 'color',
          properties: { fillColor: '#ff0000' },
        },
      }
      const result = engine.composeTheme(base, skeleton, color)
      expect(result.subTopic.properties.fillColor).toBe('#ff0000')
    })

    it('should preserve colorFieldsMap from color theme', () => {
      const base: ThemeData = {
        centralTopic: {
          id: 'base',
          properties: { fillColor: '#ffffff' },
        },
      }
      const color: ThemeData = {
        centralTopic: {
          id: 'color',
          properties: { fillColor: '#c1aba5' },
        },
        colorFieldsMap: {
          PRIMARY_COLOR_0: '#c1aba5',
          DARK_COLOR: '#2d221f',
        },
      }
      const result = engine.composeTheme(base, undefined, color)
      expect(result.colorFieldsMap).toEqual({
        PRIMARY_COLOR_0: '#c1aba5',
        DARK_COLOR: '#2d221f',
      })
    })
  })

  describe('loadTheme', () => {
    it('should load theme package', () => {
      const theme = {
        id: 'test-theme',
        name: 'Test Theme',
        color: {
          centralTopic: {
            id: 'test',
            properties: { fillColor: '#ff0000' },
          },
        },
      }
      engine.loadTheme(theme)
      expect(engine.getLoadedThemes()).toContain('test-theme')
    })

    it('should set active theme', () => {
      const theme = {
        id: 'test-theme',
        color: {
          centralTopic: {
            id: 'test',
            properties: { fillColor: '#ff0000' },
          },
        },
      }
      engine.loadTheme(theme)
      engine.setActiveTheme('test-theme')
      expect(engine.getActiveThemeId()).toBe('test-theme')
    })

    it('should warn for unknown theme', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      engine.setActiveTheme('unknown-theme')
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('resolveColorVariables', () => {
    it('should resolve known color variables', () => {
      const map = { PRIMARY_COLOR_0: '#c1aba5', DARK_COLOR: '#2d221f' }
      expect(resolveColorVariables('$PRIMARY_COLOR_0$', map)).toBe('#c1aba5')
      expect(resolveColorVariables('$DARK_COLOR$', map)).toBe('#2d221f')
    })

    it('should keep unknown variables unchanged', () => {
      const map = { PRIMARY_COLOR_0: '#c1aba5' }
      expect(resolveColorVariables('$UNKNOWN_VAR$', map)).toBe('$UNKNOWN_VAR$')
    })

    it('should pass through non-string values and no-map cases', () => {
      expect(resolveColorVariables('16pt', undefined)).toBe('16pt')
      expect(resolveColorVariables(null, { PRIMARY_COLOR_0: '#c1aba5' })).toBeNull()
      expect(resolveColorVariables(16, { PRIMARY_COLOR_0: '#c1aba5' })).toBe(16)
    })
  })
})
