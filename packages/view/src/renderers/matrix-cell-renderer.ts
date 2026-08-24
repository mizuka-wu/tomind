import { Group, Rect, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'
import { getStringStyle, getNumberStyle, getBoolStyle } from '../style-accessors'

/**
 * MatrixCellRenderer — 矩阵单元格渲染器
 *
 * 参考旧系统 MatrixCellRenderWorker：
 * - 显示矩阵单元格
 * - 矩形 + 文本
 */
export class MatrixCellRenderer implements Renderer {
  private group: Group | null = null
  private rect: Rect | null = null
  private text: Text | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group({ name: 'matrix-cell-group' })
    this.rect = new Rect({ name: 'matrix-cell-rect' })
    this.text = new Text({ name: 'matrix-cell-text' })
    this.group.add(this.rect)
    this.group.add(this.text)
    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group || !this.rect || !this.text) return

    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    const { width, height } = nodeLayout
    this.rect.set({ width, height })

    const fill = getStringStyle(style, 'fill')
    const stroke = getStringStyle(style, 'stroke')
    const strokeWidth = getNumberStyle(style, 'strokeWidth')
    const text = getStringStyle(style, 'text')
    const textColor = getStringStyle(style, 'textColor')
    const fontSize = getNumberStyle(style, 'fontSize')
    const visible = getBoolStyle(style, 'visible')

    if (fill) this.rect.fill = fill
    if (stroke) this.rect.stroke = stroke
    if (strokeWidth) this.rect.strokeWidth = strokeWidth

    if (text) {
      this.text.text = text
      this.text.set({
        x: width / 2,
        y: height / 2,
        textAlign: 'center',
        verticalAlign: 'middle',
      })
    }

    if (textColor) this.text.fill = textColor
    if (fontSize) this.text.fontSize = fontSize

    if (visible !== undefined) {
      this.group.visible = visible
    }
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.rect = null
    this.text = null
  }
}
