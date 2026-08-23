/**
 * Part Measure — 测量节点内部各 Part 的尺寸
 *
 * Part 包括：title, image, markers, labels, note, link, numbering
 */

import type { NodeDesc } from '@tomind/schema'
import type { LayoutOptions } from './layout-engine'
import { measureTextSize } from './layout-engine'

// ==================== 类型定义 ====================

export type PartType = 'title' | 'image' | 'markers' | 'labels' | 'note' | 'link' | 'numbering'
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
}

const MARKER_SIZE = 16
const INFO_ICON_SIZE = 16

// ==================== 工具函数 ====================

function getTitle(node: NodeDesc): string {
  const title = node.attrs.title
  if (typeof title === 'string') return title
  if (Array.isArray(title)) {
    return title.map((u: { text?: string }) => u.text ?? '').join('')
  }
  return ''
}

function getFontSize(node: NodeDesc): number {
  const style = node.attrs.style as Record<string, unknown> | undefined
  return (style?.fontSize as number) ?? 14
}

function getFontFamily(node: NodeDesc): string {
  const style = node.attrs.style as Record<string, unknown> | undefined
  return (style?.fontFamily as string) || 'NeverMind, Microsoft YaHei, PingFang SC, Microsoft JhengHei'
}

function getFontWeight(node: NodeDesc): string | number {
  const style = node.attrs.style as Record<string, unknown> | undefined
  return (style?.fontWeight as string | number) || 'normal'
}

function getFontStyle(node: NodeDesc): string {
  const style = node.attrs.style as Record<string, unknown> | undefined
  return (style?.fontStyle as string) || 'normal'
}

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
  readonly format?: 'plain' | 'markdown'
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

// ==================== 测量函数 ====================

/**
 * 测量 title 尺寸
 */
function measureTitle(node: NodeDesc, options: LayoutOptions): { width: number; height: number } {
  const title = getTitle(node)
  const fontSize = getFontSize(node)
  const fontFamily = getFontFamily(node)
  const fontWeight = getFontWeight(node)
  const fontStyle = getFontStyle(node)
  return measureTextSize(title, fontSize, options, fontFamily, fontWeight, fontStyle)
}

/**
 * 测量 image 尺寸
 */
function measureImage(node: NodeDesc): { width: number; height: number } {
  const image = node.attrs.image as ImageData | undefined
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
  const markers = node.attrs.markers as MarkerData[] | undefined
  if (!markers || markers.length === 0) return { width: 0, height: 0 }

  // 每个 marker 16×16，水平排列
  const width = markers.length * MARKER_SIZE
  const height = MARKER_SIZE
  return { width, height }
}

/**
 * 测量 labels 尺寸
 */
function measureLabels(node: NodeDesc, options: LayoutOptions): { width: number; height: number } {
  const labels = node.attrs.labels as LabelData[] | undefined
  if (!labels || labels.length === 0) return { width: 0, height: 0 }

  // 每个 label 文本宽度，垂直排列
  let maxWidth = 0
  let totalHeight = 0

  for (const label of labels) {
    const { width, height } = measureTextSize(label.text, 12, options)
    maxWidth = Math.max(maxWidth, width)
    totalHeight += height
  }

  return { width: maxWidth, height: totalHeight }
}

/**
 * 测量 note 尺寸
 */
function measureNote(node: NodeDesc): { width: number; height: number } {
  const note = node.attrs.note as NoteData | undefined
  if (!note) return { width: 0, height: 0 }

  // 固定 16×16
  return { width: INFO_ICON_SIZE, height: INFO_ICON_SIZE }
}

/**
 * 测量 link 尺寸
 */
function measureLink(node: NodeDesc): { width: number; height: number } {
  const link = node.attrs.link as LinkData | undefined
  if (!link) return { width: 0, height: 0 }

  // 固定 16×16
  return { width: INFO_ICON_SIZE, height: INFO_ICON_SIZE }
}

/**
 * 测量 numbering 尺寸
 */
function measureNumbering(node: NodeDesc, options: LayoutOptions): { width: number; height: number } {
  const numbering = node.attrs.numbering as NumberingData | undefined
  if (!numbering) return { width: 0, height: 0 }

  // 从 attrs.numbering 计算文本宽度
  const prefix = numbering.prefix ?? ''
  const suffix = numbering.suffix ?? '.'
  const numberingText = `${prefix}1${suffix}` // 用 "1" 作为示例数字
  return measureTextSize(numberingText, getFontSize(node), options)
}

// ==================== 主函数 ====================

/**
 * 测量节点的所有 parts
 */
export function measureNodeParts(
  node: NodeDesc,
  options: LayoutOptions,
): PartMeasurement[] {
  const parts: PartMeasurement[] = []

  // 测量 title
  const titleSize = measureTitle(node, options)
  if (titleSize.width > 0 || titleSize.height > 0) {
    parts.push({
      partType: 'title',
      position: DEFAULT_PART_CONFIG.title.position,
      order: DEFAULT_PART_CONFIG.title.order,
      size: titleSize,
    })
  }

  // 测量 numbering
  const numberingSize = measureNumbering(node, options)
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
    const image = node.attrs.image as ImageData | undefined
    const rawAlign = image?.align as string | undefined
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

  return parts
}

/**
 * 检查节点是否有非 title 的 part
 */
export function hasNonTitleParts(node: NodeDesc): boolean {
  return !!(
    node.attrs.image ||
    (node.attrs.markers && (node.attrs.markers as MarkerData[]).length > 0) ||
    (node.attrs.labels && (node.attrs.labels as LabelData[]).length > 0) ||
    node.attrs.note ||
    node.attrs.link ||
    node.attrs.numbering
  )
}

export default { measureNodeParts, hasNonTitleParts }
