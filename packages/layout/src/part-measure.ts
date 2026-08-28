/**
 * Part Measure — 测量节点内部各 Part 的尺寸
 *
 * Part 包括：title, image, markers, labels, note, link, numbering
 */

import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutOptions } from './layout-engine'
import { measureTextSize } from './layout-engine'
import { getTitle, getFontSize } from './layout-utils'
import { getAttr, getFontFamily, getFontWeight, getFontStyle } from './layout-utils'


// ==================== 类型定义 ====================

export type PartType = 'title' | 'image' | 'markers' | 'labels' | 'note' | 'link' | 'numbering' | 'comments'
export type PartPosition = 'top' | 'bottom' | 'left' | 'right' | 'outside' | 'center'

export interface PartMeasurement {
  partType: PartType
  position: PartPosition
  order: number
  size: { width: number; height: number }
}

// ==================== 默认配置 ====================

const DEFAULT_PART_CONFIG: Record<PartType, { position: PartPosition; order: number }> = {
  title: { position: 'center', order: 0 },
  numbering: { position: 'left', order: -1 },
  markers: { position: 'top', order: 1 },
  image: { position: 'top', order: 10 },
  labels: { position: 'bottom', order: 30 },
  note: { position: 'right', order: 40 },
  link: { position: 'right', order: 5 },
  comments: { position: 'right', order: 45 },
}

const MARKER_SIZE = 16
const INFO_ICON_SIZE = 16

// ==================== 工具函数 ====================
interface MarkerData {
  readonly type: string
  readonly value: unknown
}

interface LabelData {
  readonly text: string
  readonly style?: Record<string, unknown>
}

interface ImageData {
  readonly src: string
  readonly width?: number
  readonly height?: number
  readonly align?: string
  readonly borderWidth?: number
  readonly borderColor?: string
  readonly opacity?: number
  readonly shadowVisible?: boolean
  readonly lockRatio?: boolean
  readonly flipAndRotateRecords?: string
}

interface NoteData {
  readonly content: string
  readonly format?: 'plain' | 'markdown' | 'html'
  readonly htmlContent?: string
}

interface LinkData {
  readonly url: string
  readonly title?: string
}

interface NumberingData {
  readonly numberFormat: string
  readonly prefix?: string
  readonly suffix?: string
  readonly numberSeparator?: string
  readonly prependingNumbers?: string
}

interface CommentData {
  readonly author: string
  readonly content: string
  readonly time?: number
}

// ==================== 测量函数 ====================

/**
 * 测量 title 尺寸
 */
function measureTitle(node: NodeDesc, options: LayoutOptions, styleEngine?: StyleEngine | null, state?: SheetState | null): { width: number; height: number } {
  const title = getTitle(node)
  const fontSize = getFontSize(node, styleEngine, state)
  const fontFamily = getFontFamily(node, styleEngine, state)
  const fontWeight = getFontWeight(node, styleEngine, state)
  const fontStyle = getFontStyle(node, styleEngine, state)
  return measureTextSize(title, fontSize, options, fontFamily, fontWeight, fontStyle)
}

/**
 * 测量 image 尺寸
 */
function measureImage(node: NodeDesc): { width: number; height: number } {
  const image = getAttr<ImageData>(node, 'image')
  if (!image) return { width: 0, height: 0 }

  // 从 attrs.image 读取 width/height（有则用，无则默认 100×100）
  return {
    width: image.width ?? 100,
    height: image.height ?? 100,
  }
}

/**
 * 测量 markers 尺寸
 */
function measureMarkers(node: NodeDesc): { width: number; height: number } {
  const markers = getAttr<MarkerData[]>(node, 'markers')
  if (!markers || markers.length === 0) return { width: 0, height: 0 }

  // 每个 marker 16×16，水平排列
  const width = markers.length * MARKER_SIZE
  const height = MARKER_SIZE
  return { width, height }
}

// ==================== Labels 流式布局常量（对齐 snowbrush） ====================

const LABEL_FONT_SIZE = 12
const LABEL_UNIT_HEIGHT = 20
const LABEL_UNIT_MIN_WIDTH = 38
const LABEL_UNIT_PADDING_HORIZON = 6
const LABEL_UNIT_MARGIN_HORIZON = 4
const LABEL_UNIT_MARGIN_VERTICAL = 2
const LABEL_MAX_ROWS = 3
/** 特殊 "N+" 单元的理想推测宽度 */
const LABEL_SPECIAL_UNIT_PREFER_WIDTH = 46

/**
 * 测量 labels 尺寸
 *
 * 对齐 snowbrush LabelsView 流式布局：
 * 1. 水平排列，宽度不足时自动换行
 * 2. 最多 3 行，超过 3 行显示 "N+" 特殊单元
 * 3. 宽度继承 parentWidth（与父 topic 一致）
 */
export function measureLabels(node: NodeDesc, options: LayoutOptions, parentWidth?: number): { width: number; height: number } {
  const labels = getAttr<LabelData[]>(node, 'labels')
  if (!labels || labels.length === 0) return { width: 0, height: 0 }

  // 去重（对齐 snowbrush：Array.from(new Set(labels.map(l => l.trim())))）
  const uniqueTexts = Array.from(new Set(labels.map(l => l.text.trim())))
  if (uniqueTexts.length === 0) return { width: 0, height: 0 }

  const contentWidth = Math.max(parentWidth ?? 0, LABEL_UNIT_MIN_WIDTH)

  let currentLine = 1
  let lineRemainWidth = contentWidth
  let remainLabelsCount = uniqueTexts.length
  let stopLayout = false

  for (let i = 0; i < uniqueTexts.length; i++) {
    if (stopLayout) break

    const text = uniqueTexts[i].replace(/\n|\r/g, '')
    const { width: textWidth } = measureTextSize(text, LABEL_FONT_SIZE, options)

    let unitWidth = textWidth + LABEL_UNIT_PADDING_HORIZON * 2
    if (unitWidth > contentWidth) unitWidth = contentWidth
    if (unitWidth < LABEL_UNIT_MIN_WIDTH) unitWidth = LABEL_UNIT_MIN_WIDTH

    // 若剩下的宽度不支持再放一个 unit，换行
    if (
      lineRemainWidth - LABEL_UNIT_MARGIN_HORIZON < unitWidth &&
      lineRemainWidth !== unitWidth &&
      lineRemainWidth !== contentWidth
    ) {
      currentLine++
      lineRemainWidth = contentWidth
    }

    // 若已到第 3 行，还有剩余 label 无法放下，显示 "N+" 特殊单元
    if (
      currentLine === LABEL_MAX_ROWS &&
      remainLabelsCount > 1 &&
      LABEL_SPECIAL_UNIT_PREFER_WIDTH + LABEL_UNIT_MARGIN_HORIZON + unitWidth > lineRemainWidth
    ) {
      stopLayout = true
      // "N+" 单元宽度
      const specialText = `${remainLabelsCount}+`
      const { width: specialWidth } = measureTextSize(specialText, LABEL_FONT_SIZE, options)
      unitWidth = specialWidth + LABEL_UNIT_PADDING_HORIZON * 2
    }

    lineRemainWidth = lineRemainWidth - unitWidth - LABEL_UNIT_MARGIN_HORIZON
    remainLabelsCount--
  }

  // bounds 宽度 = max(parentWidth, UNIT_MIN_WIDTH)
  const width = contentWidth
  const height = currentLine * LABEL_UNIT_HEIGHT + (currentLine - 1) * LABEL_UNIT_MARGIN_VERTICAL

  return { width, height }
}

/**
 * 测量 note 尺寸
 */
function measureNote(node: NodeDesc): { width: number; height: number } {
  const note = getAttr<NoteData>(node, 'note')
  if (!note) return { width: 0, height: 0 }

  // 图标 + 内容区域
  const hasContent = !!note.htmlContent || !!note.content
  if (!hasContent) return { width: INFO_ICON_SIZE, height: INFO_ICON_SIZE }

  // 估算内容高度：每行约 20px，每行约 40 字符
  const content = note.htmlContent || note.content || ''
  const maxWidth = 280
  const charsPerLine = 40
  const lineHeight = 20
  const estimatedLines = Math.max(1, Math.ceil(content.length / charsPerLine))
  const contentHeight = Math.min(estimatedLines * lineHeight, 400) // 最大 400px

  return {
    width: Math.max(INFO_ICON_SIZE, maxWidth),
    height: INFO_ICON_SIZE + 4 + contentHeight, // 图标 + 间距 + 内容
  }
}

/**
 * 测量 link 尺寸
 */
function measureLink(node: NodeDesc): { width: number; height: number } {
  const link = getAttr<LinkData>(node, 'link')
  if (!link) return { width: 0, height: 0 }

  // 固定 16×16
  return { width: INFO_ICON_SIZE, height: INFO_ICON_SIZE }
}

/**
 * 测量 numbering 尺寸
 */
function measureNumbering(node: NodeDesc, options: LayoutOptions, styleEngine?: StyleEngine | null, state?: SheetState | null): { width: number; height: number } {
  const numbering = getAttr<NumberingData>(node, 'numbering')
  if (!numbering) return { width: 0, height: 0 }

  // 从 attrs.numbering 计算文本宽度
  const prefix = numbering.prefix ?? ''
  const suffix = numbering.suffix ?? '.'
  const numberingText = `${prefix}1${suffix}` // 用 "1" 作为示例数字
  return measureTextSize(numberingText, getFontSize(node, styleEngine, state), options)
}

/**
 * 测量 comments 尺寸
 */
function measureComments(node: NodeDesc): { width: number; height: number } {
  const comments = getAttr<CommentData[]>(node, 'comments')
  if (!comments || comments.length === 0) return { width: 0, height: 0 }

  // 图标 16×16 + 角标数字占位
  return { width: INFO_ICON_SIZE, height: INFO_ICON_SIZE }
}

// ==================== 主函数 ====================

/**
 * 测量节点的所有 parts
 */
export function measureNodeParts(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): PartMeasurement[] {
  const parts: PartMeasurement[] = []

  // 测量 title
  const titleSize = measureTitle(node, options, styleEngine, state)
  if (titleSize.width > 0 || titleSize.height > 0) {
    parts.push({
      partType: 'title',
      position: DEFAULT_PART_CONFIG.title.position,
      order: DEFAULT_PART_CONFIG.title.order,
      size: titleSize,
    })
  }

  // 测量 numbering
  const numberingSize = measureNumbering(node, options, styleEngine, state)
  if (numberingSize.width > 0 || numberingSize.height > 0) {
    parts.push({
      partType: 'numbering',
      position: DEFAULT_PART_CONFIG.numbering.position,
      order: DEFAULT_PART_CONFIG.numbering.order,
      size: numberingSize,
    })
  }

  // 测量 markers
  const markersSize = measureMarkers(node)
  if (markersSize.width > 0 || markersSize.height > 0) {
    parts.push({
      partType: 'markers',
      position: DEFAULT_PART_CONFIG.markers.position,
      order: DEFAULT_PART_CONFIG.markers.order,
      size: markersSize,
    })
  }

  // 测量 image
  const imageSize = measureImage(node)
  if (imageSize.width > 0 || imageSize.height > 0) {
    const image = getAttr<ImageData>(node, 'image')
    const rawAlign = image?.align
    // snowbrush: 'up' 和 undefined 都映射到 'top'
    let position: PartPosition = DEFAULT_PART_CONFIG.image.position
    if (rawAlign === 'up' || rawAlign === 'top') {
      position = 'top'
    } else if (rawAlign === 'bottom' || rawAlign === 'left' || rawAlign === 'right' || rawAlign === 'outside') {
      position = rawAlign
    }
    parts.push({
      partType: 'image',
      position,
      order: DEFAULT_PART_CONFIG.image.order,
      size: imageSize,
    })
  }

  // 测量 labels
  const labelsSize = measureLabels(node, options)
  if (labelsSize.width > 0 || labelsSize.height > 0) {
    parts.push({
      partType: 'labels',
      position: DEFAULT_PART_CONFIG.labels.position,
      order: DEFAULT_PART_CONFIG.labels.order,
      size: labelsSize,
    })
  }

  // 测量 note
  const noteSize = measureNote(node)
  if (noteSize.width > 0 || noteSize.height > 0) {
    parts.push({
      partType: 'note',
      position: DEFAULT_PART_CONFIG.note.position,
      order: DEFAULT_PART_CONFIG.note.order,
      size: noteSize,
    })
  }

  // 测量 link
  const linkSize = measureLink(node)
  if (linkSize.width > 0 || linkSize.height > 0) {
    parts.push({
      partType: 'link',
      position: DEFAULT_PART_CONFIG.link.position,
      order: DEFAULT_PART_CONFIG.link.order,
      size: linkSize,
    })
  }

  // 测量 comments
  const commentsSize = measureComments(node)
  if (commentsSize.width > 0 || commentsSize.height > 0) {
    parts.push({
      partType: 'comments',
      position: DEFAULT_PART_CONFIG.comments.position,
      order: DEFAULT_PART_CONFIG.comments.order,
      size: commentsSize,
    })
  }

  return parts
}

/**
 * 检查节点是否有非 title 的 part
 */
export function hasNonTitleParts(node: NodeDesc): boolean {
  const markers = getAttr<MarkerData[]>(node, 'markers')
  const labels = getAttr<LabelData[]>(node, 'labels')
  const comments = getAttr<CommentData[]>(node, 'comments')
  return !!(
    node.attrs.image ||
    (markers && markers.length > 0) ||
    (labels && labels.length > 0) ||
    node.attrs.note ||
    node.attrs.link ||
    node.attrs.numbering ||
    (comments && comments.length > 0)
  )
}

export default { measureNodeParts, hasNonTitleParts }
