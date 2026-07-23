import { Group, Rect, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * BoundaryRenderer — 边界框渲染器
 * 
 * 负责渲染圆角矩形边界 + 可选标题
 * 通过 setBounds() 设置边界范围，render() 渲染
 */
export class BoundaryRenderer implements Renderer {
  private group: Group | null = null
  private rect: Rect | null = null
  private titleText: Text | null = null


  /** 边界范围（由 setBounds 设置） */
  private bounds = { x: 0, y: 0, width: 0, height: 0 }
  private title = ''

  constructor(_nodeId: string) {

  }

  create(parent: Group): void {
    this.group = new Group()

    // 边界矩形（圆角）
    this.rect = new Rect({
      fill: 'transparent',
      stroke: '#FF9800',
      strokeWidth: 1,
      cornerRadius: 8,
      dashPattern: [4, 4],
    })
    this.group.add(this.rect)

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
    if (!this.rect || !this.titleText || !this.group) {
      return
    }

    const { x, y, width, height } = this.bounds
    if (width === 0 && height === 0) {
      this.group.visible = false
      return
    }

    this.group.visible = true
    this.group.x = x
    this.group.y = y

    // 更新矩形
    this.rect.width = width
    this.rect.height = height

    // 应用样式
    if (style.stroke) this.rect.stroke = style.stroke as string
    if (style.strokeWidth) this.rect.strokeWidth = style.strokeWidth as number
    if (style.fill) this.rect.fill = style.fill as string
    if (style.cornerRadius) this.rect.cornerRadius = style.cornerRadius as number
    if (style.dashPattern) this.rect.dashPattern = style.dashPattern as number[]

    // 更新标题
    if (this.title) {
      this.titleText.text = this.title
      this.titleText.visible = true
      this.titleText.x = 0
      this.titleText.y = -16
    } else {
      this.titleText.visible = false
    }
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.rect = null
    this.titleText = null
  }
}
