import { createExtension } from '@tomind/core'
import type { ThemeData } from '@tomind/core'

// ==================== 默认 Skeleton 主题 ====================

const DEFAULT_SKELETON_THEME: ThemeData = {
  centralTopic: {
    id: 'default-skeleton-centralTopic',
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
    id: 'default-skeleton-mainTopic',
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
    id: 'default-skeleton-subTopic',
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
    id: 'default-skeleton-floatingTopic',
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
    id: 'default-skeleton-calloutTopic',
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
    id: 'default-skeleton-summaryTopic',
    properties: {
      shapeClass: 'roundedRect',
      shapeCorner: '5pt',
      marginLeft: '12pt',
      marginRight: '12pt',
    },
  },
  boundary: {
    id: 'default-skeleton-boundary',
    properties: {
      shapeClass: 'roundedRect',
      shapeCorner: '5pt',
    },
  },
  summary: {
    id: 'default-skeleton-summary',
    properties: {
      shapeClass: 'square',
      lineCorner: '8pt',
    },
  },
  relationship: {
    id: 'default-skeleton-relationship',
    properties: {
      lineClass: 'curve',
      lineCorner: '8pt',
    },
  },
  map: {
    id: 'default-skeleton-map',
    properties: {
      lineTapered: 'none',
    },
  },
}

// ==================== 默认 Color 主题 ====================

const DEFAULT_COLOR_THEME: ThemeData = {
  centralTopic: {
    id: 'default-color-centralTopic',
    properties: {
      fontWeight: 'normal',
      fontColor: '#FFFFFF',
      fontFamily: '$system$',
      fontStyle: 'normal',
      fontSize: '28pt',
      textDecoration: 'none',
      textTransform: 'manual',
      fillColor: '#2A7AC2',
      fillPattern: 'solid',
      lineColor: '#333333',
      lineWidth: '2pt',
      borderColor: 'none',
      borderWidth: '0pt',
      borderPattern: 'solid',
      linePattern: 'solid',
      arrowEndClass: 'none',
    },
  },
  mainTopic: {
    id: 'default-color-mainTopic',
    properties: {
      fontWeight: 'normal',
      fontColor: '#333333',
      fontFamily: '$system$',
      fontStyle: 'normal',
      fontSize: '16pt',
      textDecoration: 'none',
      textTransform: 'manual',
      fillColor: '#E8E8E8',
      fillPattern: 'solid',
      lineColor: '#333333',
      lineWidth: '1pt',
      borderColor: '#333333',
      borderWidth: '1pt',
      borderPattern: 'solid',
      linePattern: 'solid',
      arrowEndClass: 'none',
    },
  },
  subTopic: {
    id: 'default-color-subTopic',
    properties: {
      fontWeight: 'normal',
      fontColor: '#0A0E16',
      fontFamily: '$system$',
      fontStyle: 'normal',
      fontSize: '12pt',
      textDecoration: 'none',
      textTransform: 'manual',
      fillColor: 'none',
      fillPattern: 'solid',
      lineColor: '#232323',
      lineWidth: '1pt',
      borderColor: '#232323',
      borderWidth: '1pt',
      borderPattern: 'solid',
      linePattern: 'solid',
      arrowEndClass: 'none',
    },
  },
  floatingTopic: {
    id: 'default-color-floatingTopic',
    properties: {
      fontWeight: 'normal',
      fontColor: '#FFFFFF',
      fontFamily: '$system$',
      fontStyle: 'normal',
      fontSize: '14pt',
      textDecoration: 'none',
      textTransform: 'manual',
      fillColor: '#333333',
      fillPattern: 'solid',
      lineColor: '#333333',
      lineWidth: '1pt',
      linePattern: 'solid',
      borderColor: '#333333',
      borderWidth: '0pt',
      borderPattern: 'solid',
      arrowEndClass: 'none',
    },
  },
  calloutTopic: {
    id: 'default-color-calloutTopic',
    properties: {
      fontWeight: 'normal',
      fontColor: '#FFFFFF',
      fontFamily: '$system$',
      fontStyle: 'italic',
      fontSize: '12pt',
      textDecoration: 'none',
      textTransform: 'manual',
      fillColor: '#333333',
      fillPattern: 'solid',
      lineColor: '#333333',
      lineWidth: '1pt',
      borderColor: 'none',
      borderWidth: '1pt',
      borderPattern: 'solid',
      linePattern: 'solid',
      arrowEndClass: 'none',
    },
  },
  summaryTopic: {
    id: 'default-color-summaryTopic',
    properties: {
      fontWeight: 'normal',
      fontColor: '#FFFFFF',
      fontFamily: '$system$',
      fontStyle: 'italic',
      fontSize: '14pt',
      textDecoration: 'none',
      fillColor: '#333333',
      fillPattern: 'solid',
    },
  },
  boundary: {
    id: 'default-color-boundary',
    properties: {
      fillColor: '#D5E9FC',
      lineColor: '#5291E5',
      linePattern: 'dash',
      lineWidth: '1pt',
      opacity: 0.2,
      fontFamily: '$system$',
      fontSize: '14pt',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textTransform: 'manual',
      textDecoration: 'none',
      fillPattern: 'solid',
    },
  },
  summary: {
    id: 'default-color-summary',
    properties: {
      lineColor: '#5291E5',
      lineWidth: '1pt',
      linePattern: 'solid',
    },
  },
  relationship: {
    id: 'default-color-relationship',
    properties: {
      lineColor: '#5291E5',
      linePattern: 'dash',
      lineWidth: '1pt',
      arrowEndClass: 'triangle',
      fontFamily: '$system$',
      fontSize: '14pt',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textTransform: 'manual',
      textDecoration: 'none',
    },
  },
  map: {
    id: 'default-color-map',
    properties: {
      multiLineColors: 'none',
    },
  },
}

interface ThemeDefaultOptions extends Record<string, unknown> {
  enabled?: boolean
  autoLoad?: boolean
}

export const ThemeDefaultExtension = createExtension({
  name: 'themeDefault',
  type: 'extension',
  defaultOptions: {
    enabled: true,
    autoLoad: true,
  } as ThemeDefaultOptions,

  onCreate(ctx) {
    const workbook = ctx.getWorkbook()
    const styleEngine = workbook.styleEngine as any

    if (!styleEngine) {
      console.warn('[ThemeDefaultExtension] StyleEngine not available')
      return
    }

    styleEngine.loadTheme({
      id: 'default-skeleton',
      name: 'Default Skeleton',
      skeleton: DEFAULT_SKELETON_THEME,
    })

    styleEngine.loadTheme({
      id: 'default-color',
      name: 'Default Color',
      color: DEFAULT_COLOR_THEME,
    })

    if (!styleEngine.getActiveThemeId()) {
      styleEngine.setActiveTheme('default-color')
    }

    console.log('[ThemeDefaultExtension] Default themes loaded')
  },
})

export { DEFAULT_SKELETON_THEME, DEFAULT_COLOR_THEME }
export type { ThemeDefaultOptions }
