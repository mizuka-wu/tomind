import { Group, Rect, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

// ==================== 常量（对齐 snowbrush） ====================

const LABEL_FONT_SIZE = 12
const LABEL_FONT_FAMILY = 'Arial, Helvetica, sans-serif'
const LABEL_UNIT_HEIGHT = 20
const LABEL_UNIT_MIN_WIDTH = 38
const LABEL_UNIT_PADDING_HORIZON = 6
const LABEL_UNIT_MARGIN_HORIZON = 4
const LABEL_UNIT_MARGIN_VERTICAL = 2
const LABEL_UNIT_RADIUS = 8
const LABEL_UNIT_FILL_COLOR = 'rgba(255, 255, 255, 0.7)'
const LABEL_UNIT_BORDER_COLOR = 'rgba(0, 0, 0, 0.1)'
const LABEL_UNIT_TEXT_COLOR = '#434b54'
const LABEL_MAX_ROWS = 3
const LABEL_SPECIAL_UNIT_PREFER_WIDTH = 46

// ==================== 工具函数 ====================

/** 测量文本宽度（使用 canvas 2D） */
function getTextWidth(text: string): number {
  if (typeof document === 'undefined') return text.length * LABEL_FONT_SIZE * 0.6

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return text.length * LABEL_FONT_SIZE * 0.6

  ctx.font = `${LABEL_FONT_SIZE}px ${LABEL_FONT_FAMILY}`
  return ctx.measureText(text).width
}

/** 裁剪文本并添加省略号 */
function wrapTextWithEllipsis(text: string, maxWidth: number): string {
  const padding = LABEL_UNIT_PADDING_HORIZON * 2
  const availableWidth = maxWidth - padding

  if (getTextWidth(text) <= availableWidth) return text

  let truncated = ''
  for (const char of text) {
    const test = truncated + char
    if (getTextWidth(test + '...') > availableWidth) {
      return truncated + '...'
    }
    truncated = test
  }
  return truncated
}

// ==================== LabelUnit 接口 ====================

interface LabelUnit {
  id: string
  originalLabel: string
  displayText: string
  width: number
  bg: Rect
  text: Text
}

// ==================== LabelsRenderer ====================

/**
 * LabelsRenderer — 标签流式布局渲染器
 *
 * 对齐 snowbrush LabelsView：
 * 1. 水平排列，宽度不足时自动换行
 * 2. 最多 3 行，超过 3 行显示 "N+" 特殊单元
 * 3. 宽度继承 parentWidth（与父 topic 一致）
 */
export class LabelsRenderer implements Renderer {
  private group: Group | null = null
  private labelUnits: LabelUnit[] = []
  private parentWidth = 0

  create(parent: Group): void {
    this.group = new Group()
    parent.add(this.group)
  }

  render(_layout: LayoutResult, _style: Record<string, unknown>): void {
    // LabelsRenderer 的渲染由 updateLabels 驱动
  }

  /**
   * 设置父宽度（与 topic 宽度一致）
   */
  setParentWidth(width: number): void {
    this.parentWidth = width
    this.relayout()
  }

  /**
   * 更新标签列表
   */
  updateLabels(labels: Array<{ id: string; text: string; color?: string }>): void {
    if (!this.group) return

    // 清除现有标签
    for (const unit of this.labelUnits) {
      unit.bg.destroy()
      unit.text.destroy()
    }
    this.labelUnits = []

    // 去重
    const uniqueLabels = Array.from(new Set(labels.map(l => l.text.trim())))
      .map((text, index) => ({
        id: labels[index]?.id ?? `label-${index}`,
        text,
        color: labels[index]?.color,
      }))

    if (uniqueLabels.length === 0) return

    const contentWidth = Math.max(this.parentWidth, LABEL_UNIT_MIN_WIDTH)
    let currentLine = 1
    let lineRemainWidth = contentWidth
    let remainLabelsCount = uniqueLabels.length

    for (let i = 0; i < uniqueLabels.length; i++) {
      const labelData = uniqueLabels[i]
      const label = labelData.text.replace(/\n|\r/g, '')

      // 计算 unit 宽度
      let unitWidth = getTextWidth(label) + LABEL_UNIT_PADDING_HORIZON * 2
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

      // 是否是特殊单元（"N+"）
      let isSpecialUnit = false
      let displayText = wrapTextWithEllipsis(label, unitWidth)
      let finalUnitWidth = unitWidth

      // 若已到第 3 行，还有剩余 label 无法放下，显示 "N+" 特殊单元
      if (
        currentLine === LABEL_MAX_ROWS &&
        remainLabelsCount > 1 &&
        LABEL_SPECIAL_UNIT_PREFER_WIDTH + LABEL_UNIT_MARGIN_HORIZON + unitWidth > lineRemainWidth
      ) {
        isSpecialUnit = true
        displayText = `${remainLabelsCount}+`
        finalUnitWidth = getTextWidth(displayText) + LABEL_UNIT_PADDING_HORIZON * 2
        if (finalUnitWidth < LABEL_UNIT_MIN_WIDTH) finalUnitWidth = LABEL_UNIT_MIN_WIDTH
      }

      // 创建背景
      const bg = new Rect({
        width: finalUnitWidth,
        height: LABEL_UNIT_HEIGHT,
        fill: LABEL_UNIT_FILL_COLOR,
        stroke: LABEL_UNIT_BORDER_COLOR,
        cornerRadius: LABEL_UNIT_RADIUS,
        x: contentWidth - lineRemainWidth,
        y: (currentLine - 1) * (LABEL_UNIT_HEIGHT + LABEL_UNIT_MARGIN_VERTICAL),
      })
      this.group!.add(bg)

      // 创建文本
      const text = new Text({
        text: displayText,
        fontSize: LABEL_FONT_SIZE,
        fontFamily: LABEL_FONT_FAMILY,
        fill: LABEL_UNIT_TEXT_COLOR,
        x: contentWidth - lineRemainWidth + LABEL_UNIT_PADDING_HORIZON,
        y: (currentLine - 1) * (LABEL_UNIT_HEIGHT + LABEL_UNIT_MARGIN_VERTICAL) + LABEL_UNIT_HEIGHT / 2,
      })
      this.group!.add(text)

      // 存储 unit
      this.labelUnits.push({
        id: labelData.id,
        originalLabel: label,
        displayText,
        width: finalUnitWidth,
        bg,
        text,
      })

      // 更新行剩余宽度
      lineRemainWidth = lineRemainWidth - finalUnitWidth - LABEL_UNIT_MARGIN_HORIZON
      remainLabelsCount--

      // 如果是特殊单元，结束布局
      if (isSpecialUnit) break
    }
  }

  /**
   * 重新布局（当 parentWidth 变化时）
   */
  private relayout(): void {
    if (this.labelUnits.length === 0) return

    // 保存原始标签数据
    const labelsData = this.labelUnits.map(unit => ({
      id: unit.id,
      text: unit.originalLabel,
    }))

    // 重新渲染
    this.updateLabels(labelsData)
  }

  destroy(): void {
    for (const unit of this.labelUnits) {
      unit.bg.destroy()
      unit.text.destroy()
    }
    this.labelUnits = []

    if (this.group) {
      this.group.destroy()
      this.group = null
    }
  }
}
