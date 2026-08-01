#!/usr/bin/env node

/**
 * 主题数据转换脚本
 * 将外部主题数据转换为 tomind 格式
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// XMind 属性名 → camelCase 映射
const XMIND_PROP_MAP = {
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
  'line-tapered': 'lineTapered',
  'shape-class': 'shapeClass',
  'shape-corner': 'shapeCorner',
  'arrow-end-class': 'arrowEndClass',
  'arrow-begin-class': 'arrowBeginClass',
  'multi-line-colors': 'multiLineColors',
  'callout-shape-class': 'calloutShapeClass',
  'opacity': 'opacity',
  'alignment-by-level': 'alignmentByLevel',
  'color-list': 'colorList',
}

function convertProps(props) {
  const result = {}
  for (const [key, value] of Object.entries(props)) {
    const camelKey = XMIND_PROP_MAP[key] || key
    result[camelKey] = value
  }
  return result
}

function convertTheme(theme) {
  const result = {}
  for (const [className, entry] of Object.entries(theme)) {
    if (entry && entry.properties) {
      result[className] = {
        id: entry.id,
        properties: convertProps(entry.properties),
      }
    }
  }
  return result
}

// 读取外部主题数据
const snowbrushDir = '/Users/mizuka/Projects/fe/snowbrush-render/src/snowball/lib/data' // 外部主题数据目录

console.log('Reading theme data...')

// 读取 colorthemes.ts
const colorThemesContent = readFileSync(join(snowbrushDir, 'colorthemes.ts'), 'utf-8')
const colorThemesMatch = colorThemesContent.match(/export const colorThemes = (\[[\s\S]*\])/)
if (!colorThemesMatch) {
  console.error('Failed to parse colorthemes.ts')
  process.exit(1)
}

// 读取 skeletonthemes.ts
const skeletonThemesContent = readFileSync(join(snowbrushDir, 'skeletonthemes.ts'), 'utf-8')
const skeletonThemesMatch = skeletonThemesContent.match(/export const skeletonThemes = (\[[\s\S]*\])/)
if (!skeletonThemesMatch) {
  console.error('Failed to parse skeletonthemes.ts')
  process.exit(1)
}

// 解析数据
let colorThemes, skeletonThemes
try {
  // 使用 eval 安全地解析数据（因为是本地脚本）
  colorThemes = eval(colorThemesMatch[1])
  skeletonThemes = eval(skeletonThemesMatch[1])
} catch (e) {
  console.error('Failed to parse theme data:', e.message)
  process.exit(1)
}

console.log(`Found ${colorThemes.length} color themes`)
console.log(`Found ${skeletonThemes.length} skeleton themes`)

// 转换 color themes
const convertedColorThemes = colorThemes
  .filter(theme => !theme.hidden) // 过滤隐藏主题
  .map(theme => ({
    id: theme.id,
    tags: theme.tags,
    colorFieldsMap: theme.colorFieldsMap,
    theme: convertTheme(theme.theme),
  }))

// 转换 skeleton themes
const convertedSkeletonThemes = skeletonThemes.map(theme => ({
  id: theme.id,
  structureStyle: theme.structureStyle,
  theme: convertTheme(theme.theme),
}))

// 生成 TypeScript 代码
const output = `/**
 * 迁移自外部主题数据
 * 自动生成，请勿手动编辑
 */

import type { ThemeData } from '@tomind/style'

/** 颜色主题数据 */
export interface ColorThemeData {
  id: string
  tags: string[]
  /** 颜色变量表（PRIMARY_COLOR_0 等），样式值可用 $变量名$ 引用 */
  colorFieldsMap?: Record<string, string>
  theme: ThemeData
}

/** 骨架主题数据 */
export interface SkeletonThemeData {
  id: string
  structureStyle?: Record<string, string>
  theme: ThemeData
}

/** 颜色主题列表 */
export const COLOR_THEMES: ColorThemeData[] = ${JSON.stringify(convertedColorThemes, null, 2)}

/** 骨架主题列表 */
export const SKELETON_THEMES: SkeletonThemeData[] = ${JSON.stringify(convertedSkeletonThemes, null, 2)}

/** 获取颜色主题 */
export function getColorTheme(id: string): ColorThemeData | undefined {
  return COLOR_THEMES.find(t => t.id === id)
}

/** 获取骨架主题 */
export function getSkeletonTheme(id: string): SkeletonThemeData | undefined {
  return SKELETON_THEMES.find(t => t.id === id)
}

/** 获取所有颜色主题 ID */
export function getColorThemeIds(): string[] {
  return COLOR_THEMES.map(t => t.id)
}

/** 获取所有骨架主题 ID */
export function getSkeletonThemeIds(): string[] {
  return SKELETON_THEMES.map(t => t.id)
}
`

// 写入文件
const outputPath = '/Users/mizuka/Projects/fe/tomind/packages/extensions/src/theme-data.ts'
writeFileSync(outputPath, output)

console.log(`Theme data written to ${outputPath}`)
console.log(`- ${convertedColorThemes.length} color themes`)
console.log(`- ${convertedSkeletonThemes.length} skeleton themes`)
