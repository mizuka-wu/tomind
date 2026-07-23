import { Group, Rect, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * SummaryRenderer — 摘要线渲染器
 * 
 * 负责渲染括号线 + 可选标题
 * 通过 setBounds() 设置摘要范围，render() 渲染
 */
export class SummaryRenderer implements Renderer {
  private group: Group | null = null
  private bracketRect: Rect | null = null
  private titleText: Text | null = null
  private nodeId: string

  /** 摘要范围（由 setBounds 设置） */
  private bounds = { x: 0, y: 0, width: 0, height: 0 }
  private title = ''

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group()

    // 括号竖线
    this.bracketRect = new Rect({
      fill: 'transparent',
      stroke: '#9C27B0',
      strokeWidth: 2,
      cornerRadius: 1,
    })
    this.group.add(this.bracketRect)

    // 摘要标题（可选）
    this.titleText = new Text({
      text: '',
      fontSize: 12,
      fill: '#9C27B0',
      visible: false,
    })
    this.group.add(this.titleText)

    parent.add(this.group)
  }

  /**
   * 设置摘要范围
   */
  setBounds(
    bounds: { x: number; y: number; width: number; height: number },
    title?: string,
  ): void {
    this.bounds = bounds
    this.title = title ?? ''
  }

  render(_layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.bracketRect || !this.titleText || !this.group) {
      return
    }

    const { x, y, height } = this.bounds
    if (height === 0) {
      this.group.visible = false
      return
    }

    this.group.visible = true
    this.group.x = x
    this.group.y = y

    // 括号竖线
    this.bracketRect.width = 3
    this.bracketRect.height = height

    // 应用样式
    if (style.stroke) this.bracketRect.stroke = style.stroke as string
    if (style.strokeWidth) this.bracketRect.strokeWidth = style.strokeWidth as number

    // 更新标题
    if (this.title) {
      this.titleText.text = this.title
      this.titleText.visible = true
      this.titleText.x = 8
      this.titleText.y = height / 2 - 6
    } else {
      this.titleText.visible = false
    }
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.bracketRect = null
    this.titleText = null
  }
}
