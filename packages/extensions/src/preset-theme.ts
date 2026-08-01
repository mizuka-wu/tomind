import { createExtension } from '@tomind/core'
import type { ThemeData } from '@tomind/style'

// ==================== XMind 属性名 → camelCase 映射 ====================

const XMIND_PROP_MAP: Record<string, string> = {
  'svg:fill': 'fillColor',
  'fo:font-family': 'fontFamily',
  'fo:font-weight': 'fontWeight',
  'fo:font-size': 'fontSize',
  'fo:font-style': 'fontStyle',
  'fo:color': 'fontColor',
  'fo:text-decoration': 'textDecoration',
  'fo:text-transform': 'textTransform',
  'fo:text-align': 'textAlign',
  'fill-pattern': 'fillPattern',
  'border-line-color': 'borderColor',
  'border-line-width': 'borderWidth',
  'border-line-pattern': 'borderPattern',
  'line-color': 'lineColor',
  'line-width': 'lineWidth',
  'line-class': 'lineClass',
  'line-pattern': 'linePattern',
  'line-corner': 'lineCorner',
  'shape-class': 'shapeClass',
  'shape-corner': 'shapeCorner',
  'arrow-end-class': 'arrowEndClass',
  'multi-line-colors': 'multiLineColors',
  'callout-shape-class': 'calloutShapeClass',
  'opacity': 'opacity',
}

function convertProps(props: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    const camelKey = XMIND_PROP_MAP[key] || key
    result[camelKey] = value
  }
  return result
}

function convertTheme(theme: Record<string, { id?: string; properties: Record<string, unknown> }>): ThemeData {
  const result: ThemeData = {}
  for (const [className, entry] of Object.entries(theme)) {
    if (entry && entry.properties) {
      result[className] = {
        id: entry.id,
        properties: convertProps(entry.properties) as Record<string, import('@tomind/style').StyleValue>,
      }
    }
  }
  return result
}

// ==================== 默认颜色主题 ====================

const DEFAULT_COLOR_THEME: ThemeData = convertTheme({
  map: {
    id: 'snowball-default-map',
    properties: {
      'svg:fill': '#FFFFFF',
      'multi-line-colors': 'none',
    },
  },
  centralTopic: {
    id: 'snowball-default-centralTopic',
    properties: {
      'svg:fill': '#2A7AC2',
      'line-color': '#333333',
      'line-width': '2pt',
      'fo:font-family': '$system$',
      'fo:font-weight': 'normal',
      'fo:font-size': '28pt',
      'fo:color': '#FFFFFF',
    },
  },
  mainTopic: {
    id: 'snowball-default-mainTopic',
    properties: {
      'svg:fill': '#E8E8E8',
      'line-color': '#333333',
      'line-width': '1pt',
      'border-line-color': '#333333',
      'border-line-width': '1pt',
      'fo:font-family': '$system$',
      'fo:font-weight': 'normal',
      'fo:font-size': '16pt',
      'fo:color': '#333333',
    },
  },
  subTopic: {
    id: 'snowball-default-subTopic',
    properties: {
      'svg:fill': 'none',
      'line-color': '#232323',
      'line-width': '1pt',
      'border-line-color': '#232323',
      'border-line-width': '1pt',
      'fo:font-family': '$system$',
      'fo:font-weight': 'normal',
      'fo:font-size': '12pt',
      'fo:color': '#0A0E16',
    },
  },
  floatingTopic: {
    id: 'snowball-default-floatingTopic',
    properties: {
      'svg:fill': '#333333',
      'line-color': '#333333',
      'line-width': '1pt',
      'border-line-color': '#333333',
      'border-line-width': '0pt',
      'fo:font-family': '$system$',
      'fo:font-weight': 'normal',
      'fo:font-size': '14pt',
      'fo:color': '#FFFFFF',
    },
  },
  calloutTopic: {
    id: 'snowball-default-calloutTopic',
    properties: {
      'svg:fill': '#333333',
      'line-color': '#333333',
      'line-width': '1pt',
      'border-line-color': 'none',
      'border-line-width': '1pt',
      'fo:font-family': '$system$',
      'fo:font-weight': 'normal',
      'fo:font-size': '12pt',
      'fo:color': '#FFFFFF',
      'fo:font-style': 'italic',
    },
  },
  summaryTopic: {
    id: 'snowball-default-summaryTopic',
    properties: {
      'svg:fill': '#333333',
      'fo:font-family': '$system$',
      'fo:font-weight': 'normal',
      'fo:font-size': '14pt',
      'fo:color': '#FFFFFF',
      'fo:font-style': 'italic',
    },
  },
  boundary: {
    id: 'snowball-default-boundary',
    properties: {
      'svg:fill': '#D5E9FC',
      'line-color': '#5291E5',
      'line-pattern': 'dash',
      'line-width': '1pt',
      'opacity': 0.2,
      'fo:font-family': '$system$',
      'fo:font-size': '14pt',
    },
  },
  summary: {
    id: 'snowball-default-summary',
    properties: {
      'line-color': '#5291E5',
      'line-width': '1pt',
      'line-pattern': 'solid',
    },
  },
  relationship: {
    id: 'snowball-default-relationship',
    properties: {
      'line-color': '#5291E5',
      'line-pattern': 'dash',
      'line-width': '1pt',
      'arrow-end-class': 'triangle',
      'fo:font-family': '$system$',
      'fo:font-size': '14pt',
    },
  },
})

// ==================== 默认骨架主题 ====================

const DEFAULT_SKELETON_THEME: ThemeData = {
  centralTopic: {
    id: 'snowball-default-skeleton-centralTopic',
    properties: {
      shapeClass: 'roundedRect',
      lineClass: 'curve',
      lineCorner: '16pt',
      marginLeft: '29pt',
      marginRight: '29pt',
      marginTop: '15pt',
      marginBottom: '15pt',
      spacingMajor: '50pt',
      spacingMinor: '35pt',
    },
  },
  mainTopic: {
    id: 'snowball-default-skeleton-mainTopic',
    properties: {
      shapeClass: 'roundedRect',
      lineClass: 'roundedElbow',
      shapeCorner: '5pt',
      lineCorner: '8pt',
      marginLeft: '18pt',
      marginRight: '18pt',
      marginTop: '10pt',
      marginBottom: '10pt',
      spacingMajor: '26pt',
      spacingMinor: '6pt',
    },
  },
  subTopic: {
    id: 'snowball-default-skeleton-subTopic',
    properties: {
      shapeClass: 'underline',
      lineClass: 'roundedElbow',
      shapeCorner: '3pt',
      lineCorner: '8pt',
      marginLeft: '6pt',
      marginRight: '6pt',
      marginTop: '6pt',
      marginBottom: '6pt',
      spacingMajor: '26pt',
      spacingMinor: '8pt',
    },
  },
  floatingTopic: {
    id: 'snowball-default-skeleton-floatingTopic',
    properties: {
      shapeClass: 'roundedRect',
      shapeCorner: '8pt',
      lineClass: 'roundedElbow',
      lineCorner: '8pt',
      marginLeft: '11pt',
      marginRight: '11pt',
      marginTop: '11pt',
      marginBottom: '11pt',
      spacingMajor: '26pt',
      spacingMinor: '8pt',
    },
  },
  calloutTopic: {
    id: 'snowball-default-skeleton-calloutTopic',
    properties: {
      calloutShapeClass: 'roundedRect',
      lineClass: 'curve',
      shapeCorner: '5pt',
      lineCorner: '8pt',
      marginLeft: '6pt',
      marginRight: '6pt',
      marginTop: '6pt',
      marginBottom: '6pt',
      spacingMajor: '26pt',
      spacingMinor: '8pt',
    },
  },
  summaryTopic: {
    id: 'snowball-default-skeleton-summaryTopic',
    properties: {
      shapeClass: 'roundedRect',
      shapeCorner: '5pt',
      marginLeft: '12pt',
      marginRight: '12pt',
    },
  },
  boundary: {
    id: 'snowball-default-skeleton-boundary',
    properties: {
      shapeClass: 'roundedRect',
      shapeCorner: '5pt',
    },
  },
  summary: {
    id: 'snowball-default-skeleton-summary',
    properties: {
      shapeClass: 'square',
      lineCorner: '8pt',
    },
  },
  relationship: {
    id: 'snowball-default-skeleton-relationship',
    properties: {
      lineClass: 'curve',
      lineCorner: '8pt',
    },
  },
  map: {
    id: 'snowball-default-skeleton-map',
    properties: {
      lineTapered: 'none',
    },
  },
}

// ==================== 深色颜色主题 ====================

const DARK_COLOR_THEME: ThemeData = convertTheme({
  map: {
    id: 'snowball-dark-map',
    properties: {
      'svg:fill': '#1E1E1E',
      'multi-line-colors': 'none',
    },
  },
  centralTopic: {
    id: 'snowball-dark-centralTopic',
    properties: {
      'svg:fill': '#4A90D9',
      'line-color': '#666666',
      'line-width': '2pt',
      'fo:font-family': '$system$',
      'fo:font-weight': 'normal',
      'fo:font-size': '28pt',
      'fo:color': '#FFFFFF',
    },
  },
  mainTopic: {
    id: 'snowball-dark-mainTopic',
    properties: {
      'svg:fill': '#333333',
      'line-color': '#666666',
      'line-width': '1pt',
      'border-line-color': '#666666',
      'border-line-width': '1pt',
      'fo:font-family': '$system$',
      'fo:font-weight': 'normal',
      'fo:font-size': '16pt',
      'fo:color': '#E0E0E0',
    },
  },
  subTopic: {
    id: 'snowball-dark-subTopic',
    properties: {
      'svg:fill': 'none',
      'line-color': '#555555',
      'line-width': '1pt',
      'border-line-color': '#555555',
      'border-line-width': '1pt',
      'fo:font-family': '$system$',
      'fo:font-weight': 'normal',
      'fo:font-size': '12pt',
      'fo:color': '#CCCCCC',
    },
  },
  floatingTopic: {
    id: 'snowball-dark-floatingTopic',
    properties: {
      'svg:fill': '#444444',
      'line-color': '#666666',
      'line-width': '1pt',
      'border-line-color': '#666666',
      'border-line-width': '0pt',
      'fo:font-family': '$system$',
      'fo:font-weight': 'normal',
      'fo:font-size': '14pt',
      'fo:color': '#FFFFFF',
    },
  },
  calloutTopic: {
    id: 'snowball-dark-calloutTopic',
    properties: {
      'svg:fill': '#444444',
      'line-color': '#666666',
      'line-width': '1pt',
      'border-line-color': 'none',
      'border-line-width': '1pt',
      'fo:font-family': '$system$',
      'fo:font-weight': 'normal',
      'fo:font-size': '12pt',
      'fo:color': '#FFFFFF',
      'fo:font-style': 'italic',
    },
  },
  summaryTopic: {
    id: 'snowball-dark-summaryTopic',
    properties: {
      'svg:fill': '#444444',
      'fo:font-family': '$system$',
      'fo:font-weight': 'normal',
      'fo:font-size': '14pt',
      'fo:color': '#FFFFFF',
      'fo:font-style': 'italic',
    },
  },
  boundary: {
    id: 'snowball-dark-boundary',
    properties: {
      'svg:fill': '#2A3A4A',
      'line-color': '#4A90D9',
      'line-pattern': 'dash',
      'line-width': '1pt',
      'opacity': 0.3,
      'fo:font-family': '$system$',
      'fo:font-size': '14pt',
    },
  },
  summary: {
    id: 'snowball-dark-summary',
    properties: {
      'line-color': '#4A90D9',
      'line-width': '1pt',
      'line-pattern': 'solid',
    },
  },
  relationship: {
    id: 'snowball-dark-relationship',
    properties: {
      'line-color': '#4A90D9',
      'line-pattern': 'dash',
      'line-width': '1pt',
      'arrow-end-class': 'triangle',
      'fo:font-family': '$system$',
      'fo:font-size': '14pt',
    },
  },
})

// ==================== 主题注册表 ====================

export const PRESET_THEMES = {
  'preset-default': {
    id: 'preset-default',
    name: 'Preset Default',
    color: DEFAULT_COLOR_THEME,
    skeleton: DEFAULT_SKELETON_THEME,
  },
  'preset-dark': {
    id: 'preset-dark',
    name: 'Preset Dark',
    color: DARK_COLOR_THEME,
    skeleton: DEFAULT_SKELETON_THEME,
  },
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
    const theme = PRESET_THEMES[themeId as keyof typeof PRESET_THEMES]

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

export { DEFAULT_COLOR_THEME, DEFAULT_SKELETON_THEME, DARK_COLOR_THEME }
