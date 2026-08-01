/**
 * PresetThemeExtension 测试
 */

import { describe, it, expect } from 'vitest'

describe('Theme Data', () => {
  it('should have color themes', async () => {
    const { COLOR_THEMES } = await import('@tomind/extensions')
    expect(COLOR_THEMES.length).toBeGreaterThan(0)
    expect(COLOR_THEMES[0].id).toBeDefined()
    expect(COLOR_THEMES[0].theme).toBeDefined()
  })

  it('should have skeleton themes', async () => {
    const { SKELETON_THEMES } = await import('@tomind/extensions')
    expect(SKELETON_THEMES.length).toBeGreaterThan(0)
    expect(SKELETON_THEMES[0].id).toBeDefined()
    expect(SKELETON_THEMES[0].theme).toBeDefined()
  })

  it('should get color theme by id', async () => {
    const { COLOR_THEMES, getColorTheme } = await import('@tomind/extensions')
    const themeId = COLOR_THEMES[0].id
    const theme = getColorTheme(themeId)
    expect(theme).toBeDefined()
    expect(theme!.id).toBe(themeId)
  })

  it('should get skeleton theme by id', async () => {
    const { SKELETON_THEMES, getSkeletonTheme } = await import('@tomind/extensions')
    const themeId = SKELETON_THEMES[0].id
    const theme = getSkeletonTheme(themeId)
    expect(theme).toBeDefined()
    expect(theme!.id).toBe(themeId)
  })

  it('should return undefined for unknown theme', async () => {
    const { getColorTheme, getSkeletonTheme } = await import('@tomind/extensions')
    expect(getColorTheme('unknown')).toBeUndefined()
    expect(getSkeletonTheme('unknown')).toBeUndefined()
  })

  it('should have valid theme structure', async () => {
    const { COLOR_THEMES } = await import('@tomind/extensions')
    const colorTheme = COLOR_THEMES[0]
    expect(colorTheme.theme).toBeDefined()
    
    const classes = Object.keys(colorTheme.theme)
    expect(classes.length).toBeGreaterThan(0)
    
    for (const className of classes) {
      const entry = colorTheme.theme[className]
      expect(entry).toBeDefined()
      expect(entry.properties).toBeDefined()
    }
  })

  it('should have camelCase property keys', async () => {
    const { COLOR_THEMES } = await import('@tomind/extensions')
    const colorTheme = COLOR_THEMES[0]
    
    for (const [className, entry] of Object.entries(colorTheme.theme)) {
      for (const key of Object.keys(entry.properties)) {
        expect(key).not.toContain('-')
      }
    }
  })
})
