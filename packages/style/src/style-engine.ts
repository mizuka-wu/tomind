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
import { SKELETON_KEY_SET, COLOR_KEY_SET } from './style-keys'

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
   * - lineStrokeWidth (不是 lineWidth，连线宽度)
   * - strokeWidth (不是 borderWidth，Rect 边框宽度)
   * - lineCornerRadius (不是 lineCorner，连线圆角)
   * - cornerRadius (不是 shapeCorner，Rect 圆角)
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
   *
   * 关键区别：
   * - SVG 用 fillColor/borderColor/lineColor，LeaferJS 用 fill/stroke
   * - SVG 用 "none"/"solid" 字符串，LeaferJS 用 null/undefined
   * - SVG 用 "16pt" 单位，LeaferJS 用数字（px）
   * - SVG 用 linePattern: "dash"，LeaferJS 用 strokeDash: [5, 3]
   * - SVG 用 borderPattern: "dash"，LeaferJS 用 dashPattern: [5, 3]
   * - fontColor 和 fillColor 都映射到 fill，但作用于不同元素：
   *   Rect.fill = 背景色，Text.fill = 字体色
   */
  private toLeaferStyle(style: ResolvedStyle): Record<string, unknown> {
    // ── LeaferJS 属性映射规则 ──
    // 旧映射（存在冲突，后者覆盖前者）：
    //   lineWidth   → strokeWidth    borderWidth  → strokeWidth
    //   lineCorner  → cornerRadius   shapeCorner  → cornerRadius
    // 新映射（分离，避免覆盖）：
    //   lineWidth   → lineStrokeWidth（连线宽度，供 ConnectionRenderer 使用）
    //   borderWidth → strokeWidth（Rect 边框宽度）
    //   lineCorner  → lineCornerRadius（连线圆角）
    //   shapeCorner → cornerRadius（Rect 圆角）
    // 向后兼容：lineWidth 仍同步写 strokeWidth，lineCorner 仍同步写 cornerRadius（已废弃，勿依赖）
    //
    // pt→px：parsePtToPx 基于未规范化的原始值（如 "16pt"）转换；
    // 已被 normalizeStyleObject 剥单位的数字值则原样传递（无法再区分 pt/px）。
    const result: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(style)) {
      if (value === null || value === undefined) continue

      // "none" → null（LeaferJS 不识别 "none" 字符串）
      if (value === 'none') {
        // 保留某些 key 的 "none" 语义（如 linePattern "solid"）
        if (key === 'linePattern' || key === 'borderPattern') continue
        // fillGradient: "none" 表示取消渐变填充 → 覆盖 fill 为 null
        if (key === 'fillGradient') {
          result.fill = null
          continue
        }
        result[key] = null
        continue
      }

      switch (key) {
        // ── 颜色映射 ──
        case 'fillColor':
          result.fill = value  // Rect 背景色
          break
        case 'fillPattern':
          // LeaferJS 不直接支持 fillPattern（hachure/cross-hatch/zigzag 等矢量图案），
          // 暂时保留直通，后续可通过自定义渲染实现
          result.fillPattern = value
          break
        case 'fillGradient':
          // "linear(...)" 字符串 → LeaferJS IGradientPaint 对象（覆盖 fill）
          if (typeof value === 'string') {
            const gradient = parseLinearGradient(value)
            if (gradient) {
              result.fill = gradient
            }
          }
          break
        case 'fontColor':
          // fontColor 不直接设到 result，由 TopicRenderer 从 style.fontColor 读取
          // 避免和 fillColor 的 fill 冲突
          result.fontColor = value
          break
        case 'borderColor':
          result.stroke = value  // Rect 边框色
          break
        case 'borderPattern':
          // "solid" → 无虚线，"dash" → [5, 3]（类似 linePattern，供 Rect 边框使用）
          if (value === 'solid') {
            result.dashPattern = null
          } else if (typeof value === 'string') {
            result.dashPattern = parseLinePattern(value)
          }
          break
        case 'lineColor':
          result.lineColor = value  // 连线颜色，由 ConnectionRenderer 使用
          break

        // ── 线条映射 ──
        case 'lineWidth':
          result.lineStrokeWidth = parsePtToPx(value)  // 连线宽度（新键）
          result.strokeWidth = parsePtToPx(value)       // 向后兼容（已废弃）
          break
        case 'borderWidth':
          result.strokeWidth = parsePtToPx(value)  // Rect 边框宽度
          break
        case 'linePattern':
          // "solid" → 无虚线，"dash" → [5, 3]
          result.strokeDash = value === 'solid' ? null : parseLinePattern(value)
          break
        case 'lineDash':
          result.strokeDash = parseLineDash(value)
          break

        // ── 形状映射 ──
        case 'lineCorner':
          result.lineCornerRadius = parsePtToPx(value)  // 连线圆角（新键）
          result.cornerRadius = parsePtToPx(value)       // 向后兼容（已废弃）
          break
        case 'shapeCorner':
          result.cornerRadius = parsePtToPx(value)  // Rect 圆角
          break

        // ── 字体映射 ──
        case 'fontSize':
          result.fontSize = parsePtToPx(value)
          break
        case 'fontWeight':
          result.fontWeight = parseFontWeight(value)
          break
        case 'fontStyle':
          result.fontStyle = value  // "italic" | "normal"，LeaferJS 直接支持
          break
        case 'textAlign':
          result.textAlign = value  // "left" | "center" | "right"
          break

        // ── 透明度 ──
        case 'opacity':
          result.opacity = parseOpacity(value)
          break

        // ── 间距（布局使用，不直接映射到 LeaferJS 属性） ──
        case 'marginLeft':
        case 'marginRight':
        case 'marginTop':
        case 'marginBottom':
        case 'spacingMajor':
        case 'spacingMinor':
          result[key] = parsePtToPx(value)
          break

        // ── 其他：直接传递 ──
        default:
          result[key] = value
      }
    }

    return result
  }

  /**
   * 获取全局样式（从主题的 global 类读取）
   */
  getGlobalStyle(state: SheetState, key: string): StyleValue {
    const theme = this.getActiveTheme() || (state.theme || {}) as ThemeData
    const globalEntry = theme['global']
    return globalEntry?.properties?.[key as keyof typeof globalEntry.properties]
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
      result = mergeThemeData(result, skeletonTheme, 'skeleton')
    }
    if (colorTheme) {
      result = mergeThemeData(result, colorTheme, 'color')
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
    const result = { ...style } as Record<string, StyleValue>

    for (const { key, type } of specialKeys) {
      if (type === 'inherit') {
        // inherit: 继承父级值
        if (parentId) {
          const parentStyle = this.computeStyle(state, parentId, {
            ...options,
            ignoreParent: false,
          })
          const parentVal = parentStyle[key as keyof ResolvedStyle]
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
        const defaultVal = DEFAULT_STYLES[nodeType]?.[key as keyof ResolvedStyle]
        if (defaultVal !== undefined) {
          result[key] = defaultVal
        } else {
          delete result[key]
        }
      }
    }

    return result as ResolvedStyle
  }
}

/** 按类型合并主题数据：skeleton 只合并结构键，color 只合并颜色键，通用键两类都合并 */
function mergeThemeData(
  base: ThemeData,
  override: ThemeData,
  type: 'skeleton' | 'color',
): ThemeData {
  const result: ThemeData = { ...base }
  for (const [className, entry] of Object.entries(override)) {
    if (!entry?.properties) continue
    const filtered: Record<string, StyleValue> = {}
    for (const [key, value] of Object.entries(entry.properties)) {
      if (type === 'skeleton' && SKELETON_KEY_SET.has(key)) {
        filtered[key] = value
      } else if (type === 'color' && COLOR_KEY_SET.has(key)) {
        filtered[key] = value
      } else if (!SKELETON_KEY_SET.has(key) && !COLOR_KEY_SET.has(key)) {
        filtered[key] = value
      }
    }
    result[className] = {
      ...result[className],
      ...entry,
      properties: {
        ...(result[className]?.properties || {}),
        ...filtered,
      },
    }
  }
  return result
}

/** 过滤 null/undefined（保留 "none" 和 falsy 值如 0） */
function filterNullish(style: ResolvedStyle): ResolvedStyle {
  const result: Record<string, StyleValue> = {}
  for (const [key, value] of Object.entries(style)) {
    if (value !== null && value !== undefined) {
      result[key] = value
    }
  }
  return result as ResolvedStyle
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

// ==================== LeaferJS 样式转换辅助函数 ====================

/** 渐变停靠点（对应 LeaferJS IColorStop） */
interface GradientStop {
  offset: number
  color: string
}

/** 线性渐变填充（对应 LeaferJS IGradientPaint 子集） */
interface LinearGradientPaint {
  type: 'linear'
  from?: { type: 'percent'; x: number; y: number }
  to?: { type: 'percent'; x: number; y: number }
  stops: GradientStop[]
  /** 渐变角度（度数，用于调试/序列化） */
  angle?: number
}

/**
 * 解析 linear(...) 渐变字符串为 LeaferJS 渐变对象
 *
 * 语法：linear(45deg, #ff0000, #00ff00)
 * 角度遵循 CSS 约定：0deg 自下而上，90deg 自左而右（顺时针）
 * 转换为 from/to 百分比点，使 LeaferJS 线性渐变按角度渲染
 */
function parseLinearGradient(value: string): LinearGradientPaint | null {
  const match = value.match(/^linear\(\s*(-?\d+(?:\.\d+)?)\s*(?:deg)?\s*,\s*(.+)\)$/i)
  if (!match) return null

  const angle = parseFloat(match[1])
  if (isNaN(angle)) return null

  const colorStrings = splitGradientStops(match[2])
  if (colorStrings.length < 2) return null

  const stops: GradientStop[] = colorStrings.map((color, i, arr) => ({
    offset: i / (arr.length - 1),
    color,
  }))

  const { from, to } = angleToFromTo(angle)
  return { type: 'linear', from, to, stops, angle }
}

/** 按逗号分割颜色列表，忽略括号内的逗号（支持 rgba() 等） */
function splitGradientStops(str: string): string[] {
  const result: string[] = []
  let depth = 0
  let current = ''
  for (const ch of str) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      if (current.trim()) result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) result.push(current.trim())
  return result
}

/** 角度 → LeaferJS from/to 百分比点 */
function angleToFromTo(
  angle: number,
): { from: { type: 'percent'; x: number; y: number }; to: { type: 'percent'; x: number; y: number } } {
  const rad = (angle * Math.PI) / 180
  const dx = Math.sin(rad)
  const dy = -Math.cos(rad)
  return {
    from: { type: 'percent', x: 0.5 - 0.5 * dx, y: 0.5 - 0.5 * dy },
    to: { type: 'percent', x: 0.5 + 0.5 * dx, y: 0.5 + 0.5 * dy },
  }
}

/**
 * pt → px 转换（1pt = 96/72 px ≈ 1.333px）
 * 支持："16pt"、"16"、16
 */
function parsePtToPx(value: unknown): number {
  if (typeof value === 'number') return isFinite(value) ? value : 0
  if (typeof value !== 'string') return 0
  const trimmed = value.trim()
  if (trimmed.endsWith('pt')) {
    const num = parseFloat(trimmed)
    return isNaN(num) ? 0 : Math.round(num * 96 / 72)
  }
  const num = parseFloat(trimmed)
  return isNaN(num) ? 0 : num
}

/**
 * linePattern → strokeDash 数组
 * "dash" → [5, 3], "dot" → [2, 2], "dashDot" → [5, 3, 2, 3]
 */
function parseLinePattern(value: unknown): number[] | null {
  if (typeof value !== 'string') return null
  switch (value) {
    case 'dash': return [5, 3]
    case 'dot': return [2, 2]
    case 'dashDot': return [5, 3, 2, 3]
    case 'dashDotDot': return [5, 3, 2, 3, 2, 3]
    case 'solid': return null
    default: return null
  }
}

/**
 * lineDash → strokeDash 数组
 * [5, 3] → [5, 3], "5,3" → [5, 3]
 */
function parseLineDash(value: unknown): number[] | null {
  if (Array.isArray(value)) return value.length > 0 ? value : null
  if (typeof value === 'string') {
    const arr = value.split(/[\s,]+/).map(Number).filter(n => !isNaN(n))
    return arr.length > 0 ? arr : null
  }
  return null
}

/**
 * fontWeight 规范化
 * "bold" → "bold", "700" → 700, 400 → 400
 */
function parseFontWeight(value: unknown): string | number {
  if (typeof value === 'number') return isFinite(value) ? value : 'normal'
  if (typeof value === 'string') {
    const num = parseInt(value, 10)
    if (!isNaN(num)) return num
    return value  // "bold", "normal" 等
  }
  return 'normal'
}

/**
 * opacity 规范化
 * "50%" → 0.5, "0.5" → 0.5, 50 → 0.5 (>1 视为百分比)
 */
function parseOpacity(value: unknown): number {
  if (typeof value === 'number') {
    if (!isFinite(value)) return 1
    return value > 1 ? value / 100 : value
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.endsWith('%')) {
      const num = parseFloat(trimmed)
      return isNaN(num) ? 1 : num / 100
    }
    const num = parseFloat(trimmed)
    if (isNaN(num)) return 1
    return num > 1 ? num / 100 : num
  }
  return 1
}