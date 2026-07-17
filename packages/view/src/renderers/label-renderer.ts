import { Group, Rect, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/** 常量 */
const COMMON_FONT_FAMILY = 'Arial, Helvetica, sans-serif'
const LABEL_FONT_SIZE = 12
const LABEL_UNIT_MIN_WIDTH = 38
const LABEL_UNIT_RADIUS = 8
const LABEL_UNIT_FILL_COLOR = 'rgba(255, 255, 255, 0.7)'
const LABEL_UNIT_BORDER_COLOR = 'rgba(0, 0, 0, 0.1)'
const LABEL_UNIT_TEXT_COLOR = '#434b54'

/**
 * LabelRenderer — 标签渲染器
 *
 * 参考旧系统 LabelRenderWorker：
 * - 显示单个标签
 * - 圆角矩形背景 + 文本
 */
export class LabelRenderer implements Renderer {
  private group: Group | null = null
  private background: Rect | null = null
  private text: Text | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group({ name: 'label-unit' })
    this.background = new Rect({
      cornerRadius: LABEL_UNIT_RADIUS,
      fill: LABEL_UNIT_FILL_COLOR,
      stroke: LABEL_UNIT_BORDER_COLOR,
    })
    this.text = new Text()
    this.group.add(this.background)
    this.group.add(this.text)
    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group || !this.background || !this.text) return

    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    const text = style.text as string | undefined
    const size = style.size as { width: number; height: number } | undefined
    const visible = style.visible as boolean | undefined

    if (text) {
      this.text.text = text
      this.text.set({
        fontSize: LABEL_FONT_SIZE,
        fontFamily: COMMON_FONT_FAMILY,
        fill: LABEL_UNIT_TEXT_COLOR,
      })
    }

    if (size) {
      this.background.set({
        width: Math.max(size.width, LABEL_UNIT_MIN_WIDTH),
        height: size.height,
      })
    }

    if (visible !== undefined) {
      this.group.visible = visible
    }
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.background = null
    this.text = null
  }
}
