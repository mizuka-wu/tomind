import { createExtension } from '@tomind/core'
import type { ThemeData } from '@tomind/style'
import { COLOR_THEMES, SKELETON_THEMES, getColorTheme, getSkeletonTheme } from './theme-data'
import type { ColorThemeData } from './theme-data'

// ==================== 默认主题组合 ====================

/** 将颜色主题转为 ThemeData，并附带 colorFieldsMap（颜色变量表） */
function toColorThemeData(colorTheme: ColorThemeData): ThemeData {
  if (!colorTheme.colorFieldsMap) return colorTheme.theme
  return { ...colorTheme.theme, colorFieldsMap: colorTheme.colorFieldsMap }
}

function createPresetTheme(colorThemeId: string, skeletonThemeId: string) {
  const colorTheme = getColorTheme(colorThemeId)
  const skeletonTheme = getSkeletonTheme(skeletonThemeId)

  if (!colorTheme || !skeletonTheme) {
    console.warn(`[PresetThemeExtension] Theme not found: color=${colorThemeId}, skeleton=${skeletonThemeId}`)
    return null
  }

  return {
    id: `preset-${colorThemeId}-${skeletonThemeId}`,
    name: `Preset (${colorTheme.tags.join(', ')})`,
    color: toColorThemeData(colorTheme),
    skeleton: skeletonTheme.theme,
  }
}

// ==================== 预设主题列表 ====================

export const PRESET_THEMES: Record<string, { id: string; name: string; color: ThemeData; skeleton: ThemeData }> = {}

// 默认主题（使用第一个非隐藏的颜色主题和第一个骨架主题）
const defaultColorTheme = COLOR_THEMES[0]
const defaultSkeletonTheme = SKELETON_THEMES[0]

if (defaultColorTheme && defaultSkeletonTheme) {
  PRESET_THEMES['preset-default'] = {
    id: 'preset-default',
    name: 'Preset Default',
    color: toColorThemeData(defaultColorTheme),
    skeleton: defaultSkeletonTheme.theme,
  }
}

// 深色主题（查找标签包含 "Dark" 的主题）
const darkColorTheme = COLOR_THEMES.find(t => t.tags.some(tag => tag.toLowerCase().includes('dark')))
if (darkColorTheme && defaultSkeletonTheme) {
  PRESET_THEMES['preset-dark'] = {
    id: 'preset-dark',
    name: 'Preset Dark',
    color: toColorThemeData(darkColorTheme),
    skeleton: defaultSkeletonTheme.theme,
  }
}

// 浅色主题（查找标签包含 "Light" 的主题）
const lightColorTheme = COLOR_THEMES.find(t => t.tags.some(tag => tag.toLowerCase().includes('light')))
if (lightColorTheme && defaultSkeletonTheme) {
  PRESET_THEMES['preset-light'] = {
    id: 'preset-light',
    name: 'Preset Light',
    color: toColorThemeData(lightColorTheme),
    skeleton: defaultSkeletonTheme.theme,
  }
}

// ==================== 扩展定义 ====================

interface PresetThemeOptions extends Record<string, unknown> {
  enabled?: boolean
  themeId?: string
}

export const PresetThemeExtension = createExtension({
  name: 'presetTheme',
  type: 'extension',
  defaultOptions: {
    enabled: true,
    themeId: 'preset-default',
  } as PresetThemeOptions,

  onCreate(ctx) {
    const workbook = ctx.getWorkbook()
    const styleEngine = workbook.styleEngine

    if (!styleEngine) return

    const options = ctx.storage as PresetThemeOptions
    const themeId = options.themeId || 'preset-default'
    const theme = PRESET_THEMES[themeId]

    if (!theme) {
      console.warn(`[PresetThemeExtension] Theme "${themeId}" not found`)
      return
    }

    styleEngine.loadTheme(theme)

    if (!styleEngine.getActiveThemeId()) {
      styleEngine.setActiveTheme(themeId)
    }
  },
})

export { COLOR_THEMES, SKELETON_THEMES, getColorTheme, getSkeletonTheme }
