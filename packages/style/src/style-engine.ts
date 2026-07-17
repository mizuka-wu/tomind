/**
 * StyleEngine — 主题管理 + 样式计算引擎
 *
 * 职责：
 * 1. 管理主题（设置、切换、合成）
 * 2. 基于 Doc 树计算节点样式
 * 3. 提供样式查询 API
 *
 * 主题来源：
 * - Snowball 主题包（skeleton + color）
 * - 用户自定义主题
 * - 默认主题（硬编码）
 *
 * 解析优先级（高→低）：
 * 1. User Style        — topic.style（用户直接设置）
 * 2. User Class        — topic.classList → theme（显式分配的类样式）
 * 3. Sheet Style       — state.style（sheet 级别 user override）
 * 4. Parent Inherit    — 沿 doc 树向上查找（仅限继承属性）
 * 5. Theme Class Style — theme[className]（主题的类默认样式）
 * 6. Default Style     — 硬编码默认值
 *
 * 与旧系统对照：
 * - state.theme ↔ sheetModel.theme()（主题数据）
 * - state.style ↔ sheetModel.style()（sheet 级 user override）
 * - topic.style ↔ topicModel.style()（节点级 user style）
 * - topic.classList ↔ topicModel.classList()（显式类分配）
 *
 * inherit 规则：
 * - 值为 null/undefined 时跳过（不覆盖下层）
 * - 值为 "inherit" 时显式继承父级
 * - 值为 "none" 时表示"无"（不是继承，是显式无值）
 * - 值为 "initial" 时重置为默认值
 */

import type { SheetState } from '@tomind/state'
import type { ResolvedStyle, ThemeData, StyleComputeOptions, NodeType, StyleValue } from './style-types'
import { classifyNode, getParentId, findById } from './classify'
import { DEFAULT_STYLES } from './default-styles'
import { normalizeStyleObject, serializeStyleObject } from './style-converter'
import { parseClassList, getClassStyles } from '@tomind/state'

/**
 * 主题包接口（Snowball 等外部主题来源实现）
 */
export interface ThemePackage {
  /** 主题 ID */
  id: string
  /** 主题名称 */
  name?: string
  /** 骨架主题（形状、间距等） */
  skeleton?: ThemeData
  /** 颜色主题（填充、描边等） */
  color?: ThemeData
}

export class StyleEngine {
  private _themes = new Map<string, ThemeData>()
  private _activeThemeId: string | null = null
  /** 布局模式样式映射：level → NodeType → 样式覆盖 */
  private _layoutModes = new Map<string, Record<NodeType, Partial<ResolvedStyle>>>()
  /** 默认单位（编辑器回写时使用） */
  defaultUnit = 'pt'

  /**
   * 序列化单个样式值
   * 编辑器保存时调用：16 → "16pt", 700 → "bold", null → "none" 等
   */
  serializeValue(key: string, value: unknown): unknown {
    const temp: Record<string, unknown> = { [key]: value }
    const result = serializeStyleObject(temp, this.defaultUnit)
    return result[key]
  }

  /**
   * 序列化整个样式对象为 SVG/HTML 格式
   * 编辑器保存时调用
   */
  serializeStyle(style: ResolvedStyle): ResolvedStyle {
    return serializeStyleObject(style as Record<string, unknown>, this.defaultUnit) as ResolvedStyle
  }

  /**
   * 加载主题包（如 Snowball 主题）
   */
  /**
   * 设置布局模式样式映射
   */
  setLayoutModes(modes: Record<string, Record<NodeType, Partial<ResolvedStyle>>>): void {
    this._layoutModes.clear()
    for (const [key, value] of Object.entries(modes)) {
      this._layoutModes.set(key, value)
    }
  }

  /**
   * 获取布局模式样式映射
   */
  getLayoutModes(): Record<string, Record<NodeType, Partial<ResolvedStyle>>> {
    const result: Record<string, Record<NodeType, Partial<ResolvedStyle>>> = {}
    for (const [key, value] of this._layoutModes) {
      result[key] = value
    }
    return result
  }

  loadTheme(pkg: ThemePackage): void {
    const composed = this.composeTheme(
      this.buildDefaultTheme(),
      pkg.skeleton,
      pkg.color,
    )
    this._themes.set(pkg.id, composed)
  }

  /**
   * 设置当前活跃主题
   */
  setActiveTheme(themeId: string | null): void {
    if (themeId && !this._themes.has(themeId)) {
      console.warn(`[StyleEngine] Theme "${themeId}" not loaded`)
      return
    }
    this._activeThemeId = themeId
  }

  /**
   * 获取当前活跃主题 ID
   */
  getActiveThemeId(): string | null {
    return this._activeThemeId
  }

  /**
   * 获取当前活跃主题数据
   */
  getActiveTheme(): ThemeData | null {
    if (!this._activeThemeId) return null
    return this._themes.get(this._activeThemeId) || null
  }

  /**
   * 获取已加载的主题列表
   */
  getLoadedThemes(): string[] {
    return Array.from(this._themes.keys())
  }

  // 注意：修改 state.style / state.theme 应通过 Transaction 操作
  // StyleEngine 只负责读取和计算
  /**
   * 计算节点的完整解析样式
   *
   * 解析链：
   * 1. Default（基础）
   * 2. Theme Class（主题的类默认样式）
   * 3. Parent Inherit（继承父级）
   * 4. Sheet Style（sheet 级 override）
   * 5. User Class（显式类分配 → theme）
   * 6. User Style（用户直接设置）
   *
   * 特殊值处理：
   * - "inherit" → 继承父级值
   * - "initial" → 重置为默认值
   * - "none" → 保留为"无"
   */
  computeStyle(
    state: SheetState,
    topicId: string,
    options: StyleComputeOptions = {},
  ): ResolvedStyle {
    const node = findById(state.doc, topicId)
    if (!node) return {}

    const theme = options.themeOverride || this.getActiveTheme() || (state.theme || {}) as ThemeData
    const sheetStyle = (state.style || {}) as ResolvedStyle
    const nodeType = options.className || classifyNode(state.doc, topicId)

    // 层 6: Default
    let result: ResolvedStyle = options.ignoreDefault
      ? {}
      : { ...DEFAULT_STYLES[nodeType] }

    // 层 5: Theme Class（主题的类默认样式）
    if (!options.ignoreTheme) {
      const classStyle = this.getClassStyle(theme, nodeType)
      if (classStyle) {
        result = { ...result, ...classStyle }
      }
      // per-level 主题（level3, level4, ...）
      const depth = getDepthFromDoc(state, topicId)
      if (depth > 2) {
        const levelStyle = this.getClassStyle(theme, `level${depth}` as NodeType)
        if (levelStyle) {
          result = { ...result, ...levelStyle }
        }
      }
    }

    // 层 4.5: Layout Mode（布局模式覆盖，如 compact/loose）
    const compactLevel = (state.doc.attrs['compactLayoutModeLevel'] as string) || 'Third'
    const modeStyles = this._layoutModes.get(compactLevel)
    if (modeStyles) {
      const override = modeStyles[nodeType]
      if (override) {
        result = { ...result, ...filterNullish(override as ResolvedStyle) }
      }
    }

    // 层 4: Parent Inherit（继承父级）
    if (!options.ignoreParent) {
      const parentId = getParentId(state.doc, topicId)
      if (parentId) {
        const parentStyle = this.computeStyle(state, parentId, {
          ...options,
          ignoreParent: false,
        })
        result = { ...parentStyle, ...result }
      }
    }

    // 处理显式 "inherit" 和 "initial" 值
    result = this.resolveSpecialValues(result, state, topicId, options)

    // 层 3: Sheet Style（sheet 级 user override）
    if (!options.ignoreTheme && Object.keys(sheetStyle).length > 0) {
      result = { ...result, ...filterNullish(sheetStyle) }
    }

    // 层 2: User Class（显式类分配 → theme）
    // 从 node.attrs.class 解析类名，查找 theme 样式
    const classString = node.attrs.class as string | undefined
    if (classString) {
      const classList = parseClassList(classString)
      const classStyles = getClassStyles(classList, theme)
      if (Object.keys(classStyles).length > 0) {
        result = { ...result, ...filterNullish(classStyles as ResolvedStyle) }
      }
    }
    // 层 1: User Style（用户直接设置，最高优先级）
    if (!options.ignoreUser && node.attrs.style) {
      result = { ...result, ...filterNullish(node.attrs.style as ResolvedStyle) }
    }

    // 最终清理：处理 User 层可能引入的 inherit/initial 值
    result = this.resolveSpecialValues(result, state, topicId, options)

    // 规范化所有值：解析单位、处理 NaN、过滤无效值
    return normalizeStyleObject(result as Record<string, unknown>, this.defaultUnit) as ResolvedStyle
  }

  /**
   * 获取单个样式值
   */
  getStyleValue(
    state: SheetState,
    topicId: string,
    key: keyof ResolvedStyle,
  ): StyleValue {
    return this.computeStyle(state, topicId)[key]
  }

  /**
   * 获取节点的 LeaferJS 格式样式
   * 
   * 直接返回可用于 LeaferJS 元素的属性：
   * - fill (不是 fillColor)
   * - stroke (不是 borderColor)
   * - strokeWidth (不是 borderWidth)
   * - cornerRadius (不是 lineCorner)
   */
  getLeaferStyle(
    state: SheetState,
    topicId: string,
    options: StyleComputeOptions = {},
  ): Record<string, unknown> {
    const style = this.computeStyle(state, topicId, options)
    return this.toLeaferStyle(style)
  }

  /**
   * ResolvedStyle → LeaferJS 属性映射
   */
  private toLeaferStyle(style: ResolvedStyle): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    
    // 属性名映射
    const styleMap: Record<string, string> = {
      fillColor: 'fill',
      borderColor: 'stroke',
      borderWidth: 'strokeWidth',
      lineCorner: 'cornerRadius',
      fontColor: 'fill',
      linePattern: 'dashPattern',
    }

    for (const [key, value] of Object.entries(style)) {
      if (value === null || value === undefined) continue
      
      const leaferKey = styleMap[key] || key
      
      // 特殊处理
      switch (key) {
        case 'fontSize':
          // 解析 "16pt" 为数字
          result[leaferKey] = this.parseFontSize(value)
          break
        case 'fontWeight':
          // LeaferJS 支持 "bold" | "normal" | number
          result[leaferKey] = this.parseFontWeight(value)
          break
        case 'opacity':
          // 百分比转小数
          result[leaferKey] = this.parseOpacity(value)
          break
        default:
          result[leaferKey] = value
      }
    }

    return result
  }

  private parseFontSize(value: unknown): number {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const num = parseFloat(value)
      return isNaN(num) ? 14 : num
    }
    return 14
  }

  private parseFontWeight(value: unknown): string | number {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const num = parseInt(value)
      if (!isNaN(num)) return num
      return value // "bold", "normal" 等
    }
    return 'normal'
  }

  private parseOpacity(value: unknown): number {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      if (value.endsWith('%')) {
        return parseFloat(value) / 100
      }
      return parseFloat(value)
    }
    return 1
  }

  /**
   * 获取全局样式（从主题的 global 类读取）
   */
  getGlobalStyle(state: SheetState, key: string): StyleValue {
    const theme = this.getActiveTheme() || (state.theme || {}) as ThemeData
    const globalEntry = theme['global']
    return globalEntry?.properties?.[key]
  }

  /**
   * 获取主题类样式值（不经过继承计算）
   */
  getThemeStyleValue(
    state: SheetState,
    topicId: string,
    key: keyof ResolvedStyle,
  ): StyleValue {
    const theme = this.getActiveTheme() || (state.theme || {}) as ThemeData
    const nodeType = classifyNode(state.doc, topicId)
    const classStyle = this.getClassStyle(theme, nodeType)
    return classStyle?.[key]
  }

  /**
   * 合成主题数据
   */
  composeTheme(
    base: ThemeData,
    skeletonTheme?: ThemeData,
    colorTheme?: ThemeData,
  ): ThemeData {
    let result = { ...base }
    if (skeletonTheme) {
      result = mergeThemeData(result, skeletonTheme)
    }
    if (colorTheme) {
      result = mergeThemeData(result, colorTheme)
    }
    return result
  }

  /**
   * 从 DEFAULT_STYLES 构建默认主题数据
   */
  private buildDefaultTheme(): ThemeData {
    const theme: ThemeData = {}
    for (const [nodeType, styles] of Object.entries(DEFAULT_STYLES)) {
      theme[nodeType] = {
        id: `default-${nodeType}`,
        properties: { ...styles },
      }
    }
    return theme
  }

  /** 从主题获取类样式（过滤 nullish） */
  private getClassStyle(theme: ThemeData, className: NodeType): ResolvedStyle | null {
    const entry = theme[className]
    if (!entry?.properties) return null
    return filterNullish(entry.properties as ResolvedStyle)
  }

  /** 处理 "inherit" 和 "initial" 特殊值 */
  private resolveSpecialValues(
    style: ResolvedStyle,
    state: SheetState,
    topicId: string,
    options: StyleComputeOptions,
  ): ResolvedStyle {
    const entries = Object.entries(style)
    if (entries.length === 0) return style

    const specialKeys: Array<{ key: string; type: 'inherit' | 'initial' }> = []
    for (const [key, value] of entries) {
      if (value === 'inherit') {
        specialKeys.push({ key, type: 'inherit' })
      } else if (value === 'initial') {
        specialKeys.push({ key, type: 'initial' })
      }
    }

    if (specialKeys.length === 0) return style

    const parentId = getParentId(state.doc, topicId)
    const nodeType = classifyNode(state.doc, topicId)
    const result = { ...style }

    for (const { key, type } of specialKeys) {
      if (type === 'inherit') {
        // inherit: 继承父级值
        if (parentId) {
          const parentStyle = this.computeStyle(state, parentId, {
            ...options,
            ignoreParent: false,
          })
          const parentVal = parentStyle[key]
          if (parentVal !== undefined && parentVal !== null) {
            result[key] = parentVal
          } else {
            delete result[key]
          }
        } else {
          delete result[key]
        }
      } else if (type === 'initial') {
        // initial: 重置为默认值
        const defaultVal = DEFAULT_STYLES[nodeType]?.[key]
        if (defaultVal !== undefined) {
          result[key] = defaultVal
        } else {
          delete result[key]
        }
      }
    }

    return result
  }
}

/** 深合并主题数据 */
function mergeThemeData(base: ThemeData, override: ThemeData): ThemeData {
  const result: ThemeData = { ...base }
  for (const [className, entry] of Object.entries(override)) {
    if (entry?.properties) {
      result[className] = {
        ...result[className],
        ...entry,
        properties: {
          ...(result[className]?.properties || {}),
          ...entry.properties,
        },
      }
    }
  }
  return result
}

/** 过滤 null/undefined（保留 "none" 和 falsy 值如 0） */
function filterNullish(style: ResolvedStyle): ResolvedStyle {
  const result: ResolvedStyle = {}
  for (const [key, value] of Object.entries(style)) {
    if (value !== null && value !== undefined) {
      result[key] = value
    }
  }
  return result
}

/** 从 doc 树获取深度 */
function getDepthFromDoc(state: SheetState, topicId: string): number {
  let depth = 0
  let currentId = topicId
  while (currentId) {
    const parentId = getParentId(state.doc, currentId)
    if (!parentId) break
    depth++
    currentId = parentId
  }
  return depth
}