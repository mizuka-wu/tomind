/**
 * StyleConverter — SVG/HTML ↔ LeaferJS 样式值双向转换
 *
 * 职责：
 * 1. 解析 SVG/HTML 样式值为 LeaferJS 兼容值（normalize）
 * 2. 序列化 LeaferJS 值回 SVG/HTML 格式（serialize）
 *
 * 支持的转换：
 * - 单位：pt, px, %, em, rem ↔ number
 * - 颜色：rgb(), rgba(), 命名色, #hex ↔ #hex
 * - strokeDash：string ↔ array
 * - textAlign：start/end ↔ left/right
 * - fontWeight：bold/normal ↔ 700/400
 * - opacity：50% ↔ 0.5
 * - transform：translate(x,y) ↔ {x, y}
 */

// ==================== 颜色转换 ====================

/** CSS 命名色 → hex 映射 */
const NAMED_COLORS: Record<string, string> = {
  aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqu: '#00ffff',
  aquamarine: '#7fffd4', azure: '#f0ffff', beige: '#f5f5dc',
  bisque: '#ffe4c4', black: '#000000', blanchedalmond: '#ffebcd',
  blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a',
  burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00',
  chocolate: '#d2691e', coral: '#ff7f50', cornflowerblue: '#6495ed',
  cornsilk: '#fff8dc', crimson: '#dc143c', cyan: '#00ffff',
  darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9', darkgreen: '#006400', darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b', darkolivegreen: '#556b2f', darkorange: '#ff8c00',
  darkorchid: '#9932cc', darkred: '#8b0000', darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f', darkslateblue: '#483d8b', darkslategray: '#2f4f4f',
  darkturquoise: '#00ced1', darkviolet: '#9400d3', deeppink: '#ff1493',
  deepskyblue: '#00bfff', dimgray: '#696969', dodgerblue: '#1e90ff',
  firebrick: '#b22222', floralwhite: '#fffaf0', forestgreen: '#228b22',
  fuchsia: '#ff00ff', gainsboro: '#dcdcdc', ghostwhite: '#f8f8ff',
  gold: '#ffd700', goldenrod: '#daa520', gray: '#808080',
  green: '#008000', greenyellow: '#adff2f', honeydew: '#f0fff0',
  hotpink: '#ff69b4', indianred: '#cd5c5c', indigo: '#4b0082',
  ivory: '#fffff0', khaki: '#f0e68c', lavender: '#e6e6fa',
  lavenderblush: '#fff0f5', lawngreen: '#7cfc00', lemonchiffon: '#fffacd',
  lightblue: '#add8e6', lightcoral: '#f08080', lightcyan: '#e0ffff',
  lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3', lightgreen: '#90ee90',
  lightpink: '#ffb6c1', lightsalmon: '#ffa07a', lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa', lightslategray: '#778899', lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0', lime: '#00ff00', limegreen: '#32cd32',
  linen: '#faf0e6', magenta: '#ff00ff', maroon: '#800000',
  mediumaquamarine: '#66cdaa', mediumblue: '#0000cd', mediumorchid: '#ba55d3',
  mediumpurple: '#9370db', mediumseagreen: '#3cb371', mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a', mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585', midnightblue: '#191970', mintcream: '#f5fffa',
  mistyrose: '#ffe4e1', moccasin: '#ffe4b5', navajowhite: '#ffdead',
  navy: '#000080', oldlace: '#fdf5e6', olive: '#808000',
  olivedrab: '#6b8e23', orange: '#ffa500', orangered: '#ff4500',
  orchid: '#da70d6', palegoldenrod: '#eee8aa', palegreen: '#98fb98',
  paleturquoise: '#afeeee', palevioletred: '#db7093', papayawhip: '#ffefd5',
  peachpuff: '#ffdab9', peru: '#cd853f', pink: '#ffc0cb',
  plum: '#dda0dd', powderblue: '#b0e0e6', purple: '#800080',
  rebeccapurple: '#663399', red: '#ff0000', rosybrown: '#bc8f8f',
  royalblue: '#4169e1', saddlebrown: '#8b4513', salmon: '#fa8072',
  sandybrown: '#f4a460', seagreen: '#2e8b57', seashell: '#fff5ee',
  sienna: '#a0522d', silver: '#c0c0c0', skyblue: '#87ceeb',
  slateblue: '#6a5acd', slategray: '#708090', snow: '#fffafa',
  springgreen: '#00ff7f', steelblue: '#4682b4', tan: '#d2b48c',
  teal: '#008080', thistle: '#d8bfd8', tomato: '#ff6347',
  turquoise: '#40e0d0', violet: '#ee82ee', wheat: '#f5deb3',
  white: '#ffffff', whitesmoke: '#f5f5f5', yellow: '#ffff00',
  yellowgreen: '#9acd32',
}

/**
 * 规范化颜色值为 #hex 格式
 * 支持：#rgb, #rrggbb, #rrggbbaa, rgb(), rgba(), 命名色
 * 返回 null 表示无效颜色
 *
 * 注意：保留原始格式，不展开短 hex，保留大小写
 */
export function normalizeColor(value: string | null | undefined): string | null {
  if (!value || value === 'none' || value === 'transparent') return null
  const v = value.trim()

  // 已经是 #hex
  if (v.startsWith('#')) {
    const hex = v.slice(1)
    // 检查是否是合法的 hex 字符（0-9, a-f, A-F）
    const isValidHex = /^[0-9a-fA-F]+$/.test(hex)

    if (isValidHex) {
      // #rgb
      if (v.length === 4) return v
      // #rrggbb
      if (v.length === 7) return v
      // #rrggbbaa — 去掉 alpha
      if (v.length === 9) return v.slice(0, 7)
    }

    // 非标准 hex（如 #no-theme）— 按原样返回
    return v
  }

  const lower = v.toLowerCase()

  // rgb() / rgba()
  const rgbMatch = lower.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10)
    const g = parseInt(rgbMatch[2], 10)
    const b = parseInt(rgbMatch[3], 10)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  // hsl() / hsla() — 简化处理，返回 null
  if (lower.startsWith('hsl')) return null

  // 命名色
  const named = NAMED_COLORS[lower]
  if (named) return named

  // 无法识别 — 返回原值
  return v
}

/**
 * 序列化颜色值为原始格式
 * 当前统一返回 #hex，因为这是最通用的格式
 */
export function serializeColor(value: string | null | undefined): string {
  if (!value || value === 'none') return 'none'
  const hex = normalizeColor(value)
  return hex || value
}

// ==================== 单位转换 ====================

/** 可识别的单位后缀 */
const UNIT_PATTERN = /^(-?\d*\.?\d+)\s*(pt|px|%|em|rem|cm|mm|in|pc)?$/i

/**
 * 解析带单位的数值
 * "30pt" → 30, "50%" → 50, "16" → 16
 * 返回 null 表示无法解析
 */
export function parseUnit(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return isFinite(value) ? value : null
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  const match = trimmed.match(UNIT_PATTERN)
  if (match) {
    const num = parseFloat(match[1])
    return isNaN(num) ? null : num
  }

  // 纯数字字符串
  const num = parseFloat(trimmed)
  return isNaN(num) ? null : num
}

/**
 * 序列化数值为带单位的字符串
 * 30, 'pt' → "30pt"
 */
export function serializeUnit(value: number | string | null | undefined, unit: string): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (!isFinite(value)) return ''
  return `${value}${unit}`
}

// ==================== strokeDash 转换 ====================

/**
 * 解析 strokeDash 字符串为数组
 * "5,3" → [5, 3], "5 3" → [5, 3], "none" → null
 */
export function parseStrokeDash(value: string | number[] | null | undefined): number[] | null {
  if (!value || value === 'none') return null
  if (Array.isArray(value)) return value

  const str = String(value).trim()
  if (!str || str === 'none') return null

  return str.split(/[\s,]+/).map(Number).filter(n => !isNaN(n))
}

/**
 * 序列化 strokeDash 数组为字符串
 * [5, 3] → "5,3"
 */
export function serializeStrokeDash(value: number[] | string | null | undefined): string {
  if (!value || value === 'none') return 'none'
  if (typeof value === 'string') return value
  return value.join(',')
}

// ==================== textAlign 转换 ====================

/** SVG text-anchor → LeaferJS textAlign */
const TEXT_ALIGN_MAP: Record<string, string> = {
  start: 'left',
  middle: 'center',
  end: 'right',
}

/** LeaferJS textAlign → SVG text-anchor */
const TEXT_ALIGN_REVERSE: Record<string, string> = {
  left: 'start',
  center: 'middle',
  right: 'end',
}

/**
 * 规范化 textAlign
 * "start" → "left", "end" → "right"
 */
export function normalizeTextAlign(value: string | null | undefined): string | null {
  if (!value) return null
  return TEXT_ALIGN_MAP[value] || value
}

/**
 * 序列化 textAlign
 * "left" → "start", "right" → "end"
 */
export function serializeTextAlign(value: string | null | undefined): string {
  if (!value) return 'start'
  return TEXT_ALIGN_REVERSE[value] || value
}

// ==================== fontWeight 转换 ====================

/** CSS fontWeight → 数值 */
const FONT_WEIGHT_MAP: Record<string, number> = {
  normal: 400,
  bold: 700,
  lighter: 300,
  bolder: 800,
}

/** 数值 → CSS fontWeight */
function fontWeightToKeyword(value: number): string {
  if (value <= 100) return '100'
  if (value <= 200) return '200'
  if (value <= 300) return '300'
  if (value <= 400) return 'normal'
  if (value <= 500) return '500'
  if (value <= 600) return '600'
  if (value <= 700) return 'bold'
  if (value <= 800) return '800'
  if (value <= 900) return '900'
  return 'bold'
}

/**
 * 规范化 fontWeight
 * "bold" → 700, "normal" → 400, "700" → 700
 */
export function normalizeFontWeight(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return isFinite(value) ? value : null
  if (typeof value === 'string') {
    const keyword = FONT_WEIGHT_MAP[value.toLowerCase()]
    if (keyword !== undefined) return keyword
    const num = parseInt(value, 10)
    return isNaN(num) ? null : num
  }
  return null
}

/**
 * 序列化 fontWeight
 * 700 → "bold", 400 → "normal"
 */
export function serializeFontWeight(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return 'normal'
  if (typeof value === 'string') return value
  return fontWeightToKeyword(value)
}

// ==================== opacity 转换 ====================

/**
 * 规范化 opacity
 * "50%" → 0.5, "0.5" → 0.5, 50 → 0.5 (>1 时视为百分比)
 */
export function normalizeOpacity(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') {
    if (!isFinite(value)) return null
    return value > 1 ? value / 100 : value
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.endsWith('%')) {
      const num = parseFloat(trimmed)
      return isNaN(num) ? null : num / 100
    }
    const num = parseFloat(trimmed)
    if (isNaN(num)) return null
    return num > 1 ? num / 100 : num
  }
  return null
}

/**
 * 序列化 opacity
 * 0.5 → 0.5（LeaferJS 使用 0-1 范围）
 */
export function serializeOpacity(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 1
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return isNaN(num) ? 1 : (num > 1 ? num / 100 : num)
  }
  if (typeof value === 'number') {
    return isFinite(value) ? (value > 1 ? value / 100 : value) : 1
  }
  return 1
}

// ==================== transform 转换 ====================

export interface TransformValues {
  x?: number
  y?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
}

/**
 * 解析 transform 字符串
 * "translate(10,20) rotate(45) scale(2)" → { x: 10, y: 20, rotation: 45, scaleX: 2, scaleY: 2 }
 */
export function parseTransform(value: string | TransformValues | null | undefined): TransformValues | null {
  if (!value) return null
  if (typeof value === 'object') return value

  const result: TransformValues = {}
  const str = String(value)

  // translate(x, y) 或 translate(x y)
  const translateMatch = str.match(/translate\(\s*(-?\d*\.?\d+)\s*[,\s]\s*(-?\d*\.?\d+)\s*\)/)
  if (translateMatch) {
    result.x = parseFloat(translateMatch[1])
    result.y = parseFloat(translateMatch[2])
  }

  // rotate(angle)
  const rotateMatch = str.match(/rotate\(\s*(-?\d*\.?\d+)\s*\)/)
  if (rotateMatch) {
    result.rotation = parseFloat(rotateMatch[1])
  }

  // scale(sx, sy) 或 scale(s)
  const scaleMatch = str.match(/scale\(\s*(-?\d*\.?\d+)\s*(?:[,\s]\s*(-?\d*\.?\d+))?\s*\)/)
  if (scaleMatch) {
    result.scaleX = parseFloat(scaleMatch[1])
    result.scaleY = scaleMatch[2] ? parseFloat(scaleMatch[2]) : result.scaleX
  }

  return Object.keys(result).length > 0 ? result : null
}

/**
 * 序列化 transform 值为字符串
 * { x: 10, y: 20, rotation: 45 } → "translate(10,20) rotate(45)"
 */
export function serializeTransform(value: TransformValues | string | null | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') return value

  const parts: string[] = []
  if (value.x !== undefined || value.y !== undefined) {
    parts.push(`translate(${value.x || 0},${value.y || 0})`)
  }
  if (value.rotation !== undefined) {
    parts.push(`rotate(${value.rotation})`)
  }
  if (value.scaleX !== undefined) {
    if (value.scaleX === value.scaleY || value.scaleY === undefined) {
      parts.push(`scale(${value.scaleX})`)
    } else {
      parts.push(`scale(${value.scaleX},${value.scaleY})`)
    }
  }
  return parts.join(' ')
}

// ==================== 综合转换器 ====================

/** 需要颜色转换的属性 */
const COLOR_KEYS = new Set(['fillColor', 'stroke', 'borderColor', 'lineColor', 'fontColor', 'fill', 'color'])

/** 需要单位转换的属性（数值类型，带单位字符串） */
const UNIT_KEYS = new Set([
  'fontSize', 'strokeWidth', 'borderWidth', 'lineWidth',
  'cornerRadius', 'lineCorner',
  'width', 'height',
  'marginLeft', 'marginRight', 'marginTop', 'marginBottom',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
])

/** opacity 类属性 */
const OPACITY_KEYS = new Set(['opacity', 'fillOpacity', 'strokeOpacity'])

/**
 * 从 SVG/HTML 样式对象解析为 LeaferJS 兼容对象
 */
export function normalizeStyleObject(
  style: Record<string, unknown>,
  _defaultUnit: string = 'pt',
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(style)) {
    if (value === null || value === undefined) continue

    // 颜色
    if (COLOR_KEYS.has(key)) {
      if (value === 'none') {
        result[key] = null
      } else {
        const color = normalizeColor(String(value))
        result[key] = color || value
      }
      continue
    }

    // 单位
    if (UNIT_KEYS.has(key)) {
      const num = parseUnit(value as string | number)
      if (num !== null) {
        result[key] = num
        continue
      }
    }

    // strokeDash
    if (key === 'strokeDash' || key === 'lineDash') {
      // 保留 'none' 为字符串（表示无虚线，区别于 null 表示未设置）
      if (value === 'none') {
        result[key] = 'none'
      } else {
        result[key] = parseStrokeDash(value as string | number[])
      }
      continue
    }

    // textAlign
    if (key === 'textAlign' || key === 'textAnchor') {
      result[key] = normalizeTextAlign(String(value))
      continue
    }

    // fontWeight
    if (key === 'fontWeight') {
      result[key] = normalizeFontWeight(value as string | number)
      continue
    }

    // opacity
    if (OPACITY_KEYS.has(key)) {
      result[key] = normalizeOpacity(value as string | number)
      continue
    }

    // transform
    if (key === 'transform') {
      result[key] = parseTransform(value as string)
      continue
    }

    // NaN/Infinity 过滤
    if (typeof value === 'number' && (!isFinite(value) || isNaN(value))) {
      continue
    }

    result[key] = value
  }

  return result
}

/**
 * 将 LeaferJS 样式对象序列化为 SVG/HTML 格式
 */
export function serializeStyleObject(
  style: Record<string, unknown>,
  defaultUnit: string = 'pt',
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(style)) {
    if (value === null || value === undefined) {
      if (COLOR_KEYS.has(key)) {
        result[key] = 'none'
      }
      continue
    }

    // 颜色
    if (COLOR_KEYS.has(key)) {
      result[key] = serializeColor(String(value))
      continue
    }

    // 单位
    if (UNIT_KEYS.has(key)) {
      result[key] = serializeUnit(value as number, defaultUnit)
      continue
    }

    // strokeDash
    if (key === 'strokeDash' || key === 'lineDash') {
      result[key] = serializeStrokeDash(value as number[])
      continue
    }

    // textAlign
    if (key === 'textAlign' || key === 'textAnchor') {
      result[key] = serializeTextAlign(String(value))
      continue
    }

    // fontWeight
    if (key === 'fontWeight') {
      result[key] = serializeFontWeight(value as number | string)
      continue
    }

    // opacity
    if (OPACITY_KEYS.has(key)) {
      result[key] = serializeOpacity(value as number | string)
      continue
    }

    // transform
    if (key === 'transform') {
      result[key] = serializeTransform(value as TransformValues)
      continue
    }

    result[key] = value
  }

  return result
}
