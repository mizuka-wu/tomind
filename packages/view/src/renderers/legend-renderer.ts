/**
 * LegendRenderer — 图例渲染器
 *
 * 对齐 snowbrush LegendView：
 * - 浮动面板：半透明白色背景 + 圆角 + 边框
 * - 标题："Legend" 居中
 * - 分割线
 * - Marker 列表：图标 + 描述文本
 * - 空状态提示
 */

import { Group, Rect, Text, Line } from 'leafer-ui'

// ==================== 常量（对齐 snowbrush） ====================

const FILL_COLOR = 'rgba(255, 255, 255, 0.5)'
const BORDER_COLOR = '#d1d1d1'
const RADIUS = 6
const BORDER_WIDTH = 1
const TITLE_SIZE = 16
const LEGEND_MIN_WIDTH = 160
const LEGEND_MIN_HEIGHT = 80
const LEGEND_TITLE_HEIGHT = 30
const LEGEND_HR_HEIGHT = 2
const TEXT_COLOR = '#2b2f33'
const MARKER_IMAGE_WIDTH = 20
const MARKER_IMAGE_HEIGHT = 20
const MARKER_IMAGE_RIGHT_MARGIN = 14
const MARKER_DESC_FONT_SIZE = 14
const MARKER_DESC_TEXT_MAX_WIDTH = 200
const MARKER_LIST_TO_HR_DISTANCE = 9
const MARKER_LIST_HEIGHT = MARKER_IMAGE_HEIGHT
const MARKER_LIST_VERTICAL_MARGIN = 14
const MARKER_LIST_TO_LEGEND_TOP_DISTANCE = LEGEND_TITLE_HEIGHT + LEGEND_HR_HEIGHT + MARKER_LIST_TO_HR_DISTANCE
const MARKER_LIST_TO_LEGEND_BOTTOM_DISTANCE = 18
const MARKER_LIST_HORIZON_MARGIN = 15
const EMPTY_STATE_TEXT_HEIGHT = 16
const EMPTY_STATE_TO_LEGEND_BOTTOM_DISTANCE = 16

// ==================== 类型定义 ====================

export interface LegendMarkerItem {
  id: string
  name: string
  resource?: string
}

// ==================== LegendRenderer ====================

export class LegendRenderer {
  private group: Group | null = null
  private bgRect: Rect | null = null
  private titleText: Text | null = null
  private hrLine: Line | null = null
  private markerContainer: Group | null = null
  private emptyText: Text | null = null
  private markers: LegendMarkerItem[] = []

  create(parent: Group): void {
    this.group = new Group()

    // 背景
    this.bgRect = new Rect({
      width: LEGEND_MIN_WIDTH,
      height: LEGEND_MIN_HEIGHT,
      fill: FILL_COLOR,
      stroke: BORDER_COLOR,
      strokeWidth: BORDER_WIDTH,
      cornerRadius: RADIUS,
    })
    this.group.add(this.bgRect)

    // 标题
    this.titleText = new Text({
      text: 'Legend',
      fontSize: TITLE_SIZE,
      fontWeight: 500,
      fill: TEXT_COLOR,
      x: 0,
      y: 7,
    })
    this.group.add(this.titleText)

    // 分割线
    this.hrLine = new Line({
      x: 0,
      y: LEGEND_TITLE_HEIGHT,
      width: LEGEND_MIN_WIDTH,
      height: 0,
      stroke: BORDER_COLOR,
    })
    this.group.add(this.hrLine)

    // Marker 列表容器
    this.markerContainer = new Group({
      x: MARKER_LIST_HORIZON_MARGIN,
      y: MARKER_LIST_TO_LEGEND_TOP_DISTANCE,
    })
    this.group.add(this.markerContainer)

    // 空状态文本
    this.emptyText = new Text({
      text: 'Insert a marker into a topic',
      fontSize: 12,
      fill: 'rgb(173, 185, 185)',
      visible: false,
    })
    this.group.add(this.emptyText)

    parent.add(this.group)
  }

  /**
   * 更新 marker 列表
   */
  updateMarkers(markers: LegendMarkerItem[]): void {
    this.markers = markers
    this.renderMarkers()
  }

  /**
   * 设置可见性
   */
  setVisible(visible: boolean): void {
    if (this.group) {
      this.group.visible = visible
    }
  }

  /**
   * 设置位置
   */
  setPosition(x: number, y: number): void {
    if (this.group) {
      this.group.x = x
      this.group.y = y
    }
  }

  /**
   * 渲染 marker 列表
   */
  private renderMarkers(): void {
    if (!this.markerContainer || !this.bgRect || !this.titleText || !this.hrLine || !this.emptyText) return

    // 清空
    this.markerContainer.removeAll()

    if (this.markers.length === 0) {
      // 空状态
      this.emptyText.visible = true
      this.emptyText.x = MARKER_LIST_HORIZON_MARGIN
      this.emptyText.y = MARKER_LIST_TO_LEGEND_TOP_DISTANCE + 20

      // 调整尺寸
      const width = LEGEND_MIN_WIDTH
      const height = MARKER_LIST_TO_LEGEND_TOP_DISTANCE + EMPTY_STATE_TEXT_HEIGHT + EMPTY_STATE_TO_LEGEND_BOTTOM_DISTANCE
      this.bgRect.width = width
      this.bgRect.height = height
      this.hrLine.width = width
      this.titleText.x = (width - this.titleText.width!) / 2
      return
    }

    this.emptyText.visible = false

    // 渲染每个 marker
    let maxWidth = 0
    for (let i = 0; i < this.markers.length; i++) {
      const marker = this.markers[i]
      const itemGroup = new Group({
        y: (MARKER_LIST_HEIGHT + MARKER_LIST_VERTICAL_MARGIN) * i,
      })

      // Marker 图标（占位矩形）
      const icon = new Rect({
        width: MARKER_IMAGE_WIDTH,
        height: MARKER_IMAGE_HEIGHT,
        fill: '#E0E0E0',
        cornerRadius: 4,
      })
      itemGroup.add(icon)

      // 描述文本
      const desc = new Text({
        text: marker.name,
        fontSize: MARKER_DESC_FONT_SIZE,
        fill: TEXT_COLOR,
        x: MARKER_IMAGE_WIDTH + MARKER_IMAGE_RIGHT_MARGIN,
        y: 2,
      })
      itemGroup.add(desc)

      this.markerContainer.add(itemGroup)

      const itemWidth = MARKER_IMAGE_WIDTH + MARKER_IMAGE_RIGHT_MARGIN + Math.min(desc.width ?? 0, MARKER_DESC_TEXT_MAX_WIDTH)
      maxWidth = Math.max(maxWidth, itemWidth)
    }

    // 调整 legend 尺寸
    const width = Math.max(maxWidth + MARKER_LIST_HORIZON_MARGIN * 2, LEGEND_MIN_WIDTH)
    const listHeight = this.markers.length * MARKER_LIST_HEIGHT + (this.markers.length - 1) * MARKER_LIST_VERTICAL_MARGIN
    const height = Math.max(listHeight + MARKER_LIST_TO_LEGEND_TOP_DISTANCE + MARKER_LIST_TO_LEGEND_BOTTOM_DISTANCE, LEGEND_MIN_HEIGHT)

    this.bgRect.width = width
    this.bgRect.height = height
    this.hrLine.width = width
    this.titleText.x = (width - this.titleText.width!) / 2
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.bgRect = null
    this.titleText = null
    this.hrLine = null
    this.markerContainer = null
    this.emptyText = null
  }
}
