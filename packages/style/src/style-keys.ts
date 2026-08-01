/**
 * 样式属性键常量
 * 
 * 统一定义所有样式属性键，确保 DEFAULT_STYLES、ResolvedStyle、theme-exporter 等地方使用一致的键名。
 * 通过 TypeScript 类型约束防止属性漂移。
 */

// ==================== 颜色相关属性键 ====================

export const COLOR_KEYS = [
  'fillColor',
  'fillPattern',
  'fillGradient',
  'borderColor',
  'borderWidth',
  'borderPattern',
  'lineColor',
  'lineWidth',
  'linePattern',
  'fontColor',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'textTransform',
  'textDecoration',
  'textAlign',
  'textBackgroundColor',
  'opacity',
  'multiLineColors',
  'calloutFillColor',
  'calloutLineColor',
  'calloutLineClass',
  'calloutLineCorner',
  'calloutLinePattern',
  'calloutLineWidth',
  'calloutShapeClass',
  'colorList',
] as const

// ==================== 骨架相关属性键 ====================

export const SKELETON_KEYS = [
  'shapeClass',
  'shapeCorner',
  'lineClass',
  'lineTapered',
  'lineCorner',
  'structureClass',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginBottom',
  'spacingMajor',
  'spacingMinor',
  'arrowEndClass',
  'arrowBeginClass',
  'alignmentByLevel',
] as const

// ==================== 所有样式属性键 ====================

export const ALL_STYLE_KEYS = [
  ...COLOR_KEYS,
  ...SKELETON_KEYS,
] as const

// ==================== 类型定义 ====================

/** 颜色属性键类型 */
export type ColorKey = typeof COLOR_KEYS[number]

/** 骨架属性键类型 */
export type SkeletonKey = typeof SKELETON_KEYS[number]

/** 所有样式属性键类型 */
export type StyleKey = typeof ALL_STYLE_KEYS[number]

/** 样式属性键集合（用于快速查找） */
export const COLOR_KEY_SET = new Set<string>(COLOR_KEYS)
export const SKELETON_KEY_SET = new Set<string>(SKELETON_KEYS)
export const ALL_STYLE_KEY_SET = new Set<string>(ALL_STYLE_KEYS)

// ==================== 工具函数 ====================

/** 判断是否为颜色属性 */
export function isColorKey(key: string): key is ColorKey {
  return COLOR_KEY_SET.has(key)
}

/** 判断是否为骨架属性 */
export function isSkeletonKey(key: string): key is SkeletonKey {
  return SKELETON_KEY_SET.has(key)
}

/** 判断是否为样式属性 */
export function isStyleKey(key: string): key is StyleKey {
  return ALL_STYLE_KEY_SET.has(key)
}

/** 获取属性分类 */
export function getKeyCategory(key: string): 'color' | 'skeleton' | 'unknown' {
  if (isColorKey(key)) return 'color'
  if (isSkeletonKey(key)) return 'skeleton'
  return 'unknown'
}
