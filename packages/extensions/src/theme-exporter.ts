import { createExtension } from '@tomind/core'
import type { ExtensionContext, CommandFn, ThemeData, NodeType, ResolvedStyle, StyleValue } from '@tomind/core'
/**
 * ThemeExporterExtension — 主题导出扩展
 *
 * 功能：
 * 1. 从当前文档收集各节点类型的样式
 * 2. 导出为 ThemeData 格式（可被 StyleEngine.loadTheme 加载）
 * 3. 支持导出颜色主题或骨架主题
 *
 * 命令：
 * - theme.export: 导出当前主题
 * - theme.exportColor: 仅导出颜色主题
 * - theme.exportSkeleton: 仅导出骨架主题
 */


// ==================== 类型定义 ====================

interface ThemeExporterOptions extends Record<string, unknown> {
  enabled?: boolean
}

/** 主题导出结果 */
export interface ThemeExportResult {
  id: string
  theme: ThemeData
  type: 'color' | 'skeleton' | 'full'
}

/** 节点类型 → 主题类名映射 */
const NODE_TYPE_TO_CLASS: Record<string, string> = {
  centralTopic: 'centralTopic',
  mainTopic: 'mainTopic',
  subTopic: 'subTopic',
  floatingTopic: 'floatingTopic',
  calloutTopic: 'calloutTopic',
  summaryTopic: 'summaryTopic',
  boundary: 'boundary',
  summary: 'summary',
  relationship: 'relationship',
  map: 'map',
}

/** 颜色相关样式键 */
const COLOR_KEYS = [
  'fillColor', 'fillPattern', 'fillGradient',
  'borderColor', 'borderWidth', 'borderPattern',
  'lineColor', 'lineWidth', 'linePattern',
  'fontColor', 'fontFamily', 'fontSize', 'fontStyle', 'fontWeight',
  'textTransform', 'textDecoration', 'textAlign', 'textBackgroundColor',
  'opacity', 'multiLineColors',
  'calloutFillColor', 'calloutLineColor', 'calloutLineClass',
  'calloutLineCorner', 'calloutLinePattern', 'calloutLineWidth', 'calloutShapeClass',
]

/** 骨架相关样式键 */
const SKELETON_KEYS = [
  'shapeClass', 'shapeCorner',
  'lineClass', 'lineTapered', 'lineCorner',
  'structureClass',
  'marginLeft', 'marginRight', 'marginTop', 'marginBottom',
  'spacingMajor', 'spacingMinor',
  'arrowEndClass', 'arrowBeginClass',
]

// ==================== 工具函数 ====================

/** 生成 UUID */
function generateId(): string {
  return `theme-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** 从样式中提取指定键 */
function extractStyleKeys(style: ResolvedStyle, keys: string[]): Record<string, StyleValue> {
  const result: Record<string, StyleValue> = {}
  for (const key of keys) {
    const value = style[key]
    if (value !== undefined && value !== null) {
      result[key] = value
    }
  }
  return result
}

/** 过滤空值 */
function filterEmpty(obj: Record<string, StyleValue>): Record<string, StyleValue> {
  const result: Record<string, StyleValue> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value
    }
  }
  return result
}

/** 类型守卫：判断是否为 ResolvedStyle */
function isResolvedStyle(obj: unknown): obj is ResolvedStyle {
  return obj != null && typeof obj === 'object' && !Array.isArray(obj)
}

// ==================== 主题收集器 ====================

/**
 * 从文档中收集各节点类型的样式
 */
function collectThemeFromDoc(
  state: any,
  styleEngine: any,
  filter?: 'color' | 'skeleton',
): ThemeData {
  const theme: ThemeData = {}
  const doc = state?.doc
  if (!doc) return theme

  // 收集每种节点类型的第一个代表
  const collected = new Set<string>()

  // 遍历文档树
  function walk(node: any, depth: number = 0): void {
    if (!node || collected.size >= Object.keys(NODE_TYPE_TO_CLASS).length) return

    const nodeId = node.id
    if (!nodeId) return

    // 计算节点样式
    try {
      const style = styleEngine.computeStyle(state, nodeId)
      if (!style || Object.keys(style).length === 0) return

      // 确定节点类型
      let nodeType: string
      if (depth === 0) {
        nodeType = 'centralTopic'
      } else if (depth === 1) {
        nodeType = 'mainTopic'
      } else {
        nodeType = 'subTopic'
      }

      // 检查特殊类型
      const attrs = node.attrs || {}
      if (attrs.topicType === 'detached') {
        nodeType = 'floatingTopic'
      } else if (attrs.topicType === 'callout') {
        nodeType = 'calloutTopic'
      } else if (attrs.topicType === 'summary') {
        nodeType = 'summaryTopic'
      }

      // 如果还没收集过这种类型
      const className = NODE_TYPE_TO_CLASS[nodeType]
      if (className && !collected.has(className)) {
        collected.add(className)

        // 根据 filter 提取样式
        let properties: Record<string, StyleValue>
        if (filter === 'color') {
          properties = extractStyleKeys(style, COLOR_KEYS)
        } else if (filter === 'skeleton') {
          properties = extractStyleKeys(style, SKELETON_KEYS)
        } else {
          properties = filterEmpty(style)
        }

        if (Object.keys(properties).length > 0) {
          theme[className] = {
            id: generateId(),
            properties,
          }
        }
      }
    } catch (e) {
      // 忽略计算错误
    }

    // 递归子节点
    const children = node.children
    if (Array.isArray(children)) {
      for (const child of children) {
        walk(child, depth + 1)
      }
    } else if (children && typeof children === 'object') {
      // Record<string, Node[]> 格式
      for (const childList of Object.values(children)) {
        if (Array.isArray(childList)) {
          for (const child of childList) {
            walk(child, depth + 1)
          }
        }
      }
    }
  }

  walk(doc)

  // 补充 map 类型（使用 sheet 级样式）
  if (!collected.has('map')) {
    const sheetStyle = state?.style
    if (sheetStyle && Object.keys(sheetStyle).length > 0 && isResolvedStyle(sheetStyle)) {
      let properties: Record<string, StyleValue>
      if (filter === 'color') {
        properties = extractStyleKeys(sheetStyle, COLOR_KEYS)
      } else if (filter === 'skeleton') {
        properties = extractStyleKeys(sheetStyle, SKELETON_KEYS)
      } else {
        properties = filterEmpty(sheetStyle)
      }

      if (Object.keys(properties).length > 0) {
        theme.map = {
          id: generateId(),
          properties,
        }
      }
    }
  }

  return theme
}

// ==================== Extension ====================

export const ThemeExporterExtension = createExtension<ThemeExporterOptions>({
  name: 'theme-exporter',
  type: 'extension',
  defaultOptions: {
    enabled: true,
  },

  onCreate(ctx: ExtensionContext) {
    // 注册导出命令
    ctx.registerCommand('theme.export', (state, dispatch, args) => {
      const styleEngine = (ctx.getWorkbook() as any)?.styleEngine
      if (!styleEngine) return false

      const filter = (args as any)?.filter as 'color' | 'skeleton' | undefined
      const theme = collectThemeFromDoc(state, styleEngine, filter)

      const result: ThemeExportResult = {
        id: generateId(),
        theme,
        type: filter || 'full',
      }

      // 如果有回调，调用回调
      const callback = (args as any)?.callback
      if (typeof callback === 'function') {
        callback(result)
      }

      return true
    })

    ctx.registerCommand('theme.exportColor', (state, dispatch, args) => {
      return ctx.executeCommand('theme.export', { ...args as any, filter: 'color' })
    })

    ctx.registerCommand('theme.exportSkeleton', (state, dispatch, args) => {
      return ctx.executeCommand('theme.export', { ...args as any, filter: 'skeleton' })
    })
  },
})
