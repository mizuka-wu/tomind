import { Group, Path, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * SummaryRenderer — 摘要线渲染器
 * 
 * 负责渲染括号线 + 可选标题
 */
export class SummaryRenderer implements Renderer {
  private group: Group | null = null
  private path: Path | null = null
  private titleText: Text | null = null

  /** 摘要范围（由外部设置） */
  private bounds = { x: 0, y: 0, width: 0, height: 0 }
  private title = ''

  create(parent: Group): void {
    this.group = new Group()

    // 摘要路径（括号线）
    this.path = new Path({
      path: '',
      stroke: '#9C27B0',
      strokeWidth: 2,
      fill: 'transparent',
    })
    this.group.add(this.path)

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
    if (!this.path || !this.titleText) {
      return
    }

    // 更新样式
    if (style.stroke) this.path.stroke = style.stroke as string
    if (style.strokeWidth) this.path.strokeWidth = style.strokeWidth as number

    // 计算括号线路径
    const { x, y, width, height } = this.bounds
    const bracketWidth = 12
    const d = `M ${x + width + bracketWidth} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x + width + bracketWidth} ${y + height}`
    this.path.path = d

    // 更新标题
    if (this.title) {
      this.titleText.text = this.title
      this.titleText.visible = true
      this.titleText.x = x + width + bracketWidth + 4
      this.titleText.y = y + height / 2 - 6
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
