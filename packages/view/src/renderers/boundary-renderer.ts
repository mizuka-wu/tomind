import { Group, Path, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * BoundaryRenderer — 边界框渲染器
 * 
 * 负责渲染圆角矩形边界 + 可选标题
 */
export class BoundaryRenderer implements Renderer {
  private group: Group | null = null
  private path: Path | null = null
  private titleText: Text | null = null

  /** 边界范围（由外部设置） */
  private bounds = { x: 0, y: 0, width: 0, height: 0 }
  private title = ''

  create(parent: Group): void {
    this.group = new Group()

    // 边界路径（圆角矩形）
    this.path = new Path({
      path: '',
      stroke: '#FF9800',
      strokeWidth: 1,
      fill: 'transparent',
      dashPattern: [4, 4],
    })
    this.group.add(this.path)

    // 边界标题（可选）
    this.titleText = new Text({
      text: '',
      fontSize: 12,
      fill: '#FF9800',
      visible: false,
    })
    this.group.add(this.titleText)

    parent.add(this.group)
  }

  /**
   * 设置边界范围
   */
  setBounds(
    bounds: { x: number; y: number; width: number; height: number },
    title?: string,
  ): void {
    this.bounds = bounds
    this.title = title ?? ''
  }

  render(_layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.path || !this.titleText) {
      return
    }

    // 更新样式
    if (style.stroke) this.path.stroke = style.stroke as string
    if (style.strokeWidth) this.path.strokeWidth = style.strokeWidth as number
    if (style.fill) this.path.fill = style.fill as string
    if (style.dashPattern) this.path.dashPattern = style.dashPattern as number[]

    // 计算圆角矩形路径
    const { x, y, width, height } = this.bounds
    const r = (style.cornerRadius as number) ?? 8
    const d = `M ${x + r} ${y} L ${x + width - r} ${y} Q ${x + width} ${y} ${x + width} ${y + r} L ${x + width} ${y + height - r} Q ${x + width} ${y + height} ${x + width - r} ${y + height} L ${x + r} ${y + height} Q ${x} ${y + height} ${x} ${y + height - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`
    this.path.path = d

    // 更新标题
    if (this.title) {
      this.titleText.text = this.title
      this.titleText.visible = true
      this.titleText.x = x
      this.titleText.y = y - 16
    } else {
      this.titleText.visible = false
    }
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.path = null
    this.titleText = null
  }
}
