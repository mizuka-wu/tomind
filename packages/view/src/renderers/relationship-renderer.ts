import { Group, Rect, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * RelationshipRenderer — 关系线渲染器
 * 
 * 负责渲染贝塞尔曲线 + 可选标题
 * 通过 setEndpoints() 设置起止点，render() 渲染
 */
export class RelationshipRenderer implements Renderer {
  private group: Group | null = null
  private pathRect: Rect | null = null
  private titleText: Text | null = null


  /** 起止点坐标（由 setEndpoints 设置） */
  private from = { x: 0, y: 0 }
  private to = { x: 0, y: 0 }

  private title = ''

  constructor(_nodeId: string) {

  }

  create(parent: Group): void {
    this.group = new Group()

    // 关系线占位（实际曲线通过 LeaferJS Path 渲染）
    this.pathRect = new Rect({
      fill: 'transparent',
      stroke: '#666',
      strokeWidth: 2,
      visible: false,
    })
    this.group.add(this.pathRect)

    // 关系标题（可选）
    this.titleText = new Text({
      text: '',
      fontSize: 12,
      fill: '#666',
      visible: false,
    })
    this.group.add(this.titleText)

    parent.add(this.group)
  }

  /**
   * 设置起止点和控制点
   */
  setEndpoints(
    from: { x: number; y: number },
    to: { x: number; y: number },
    _controlPoints?: ReadonlyArray<{ x: number; y: number }>,
    title?: string,
  ): void {
    this.from = from
    this.to = to

    this.title = title ?? ''
  }

  render(_layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group || !this.titleText) {
      return
    }

    this.group.visible = true

    // 应用样式到标题
    if (style.stroke) {
      // 更新关系线颜色（如果有 path 的话）
    }
    if (style.strokeWidth) {
      // 更新关系线宽度
    }

    // 更新标题
    if (this.title) {
      this.titleText.text = this.title
      this.titleText.visible = true
      // 标题位置在曲线中点
      const midX = (this.from.x + this.to.x) / 2
      const midY = (this.from.y + this.to.y) / 2
      this.titleText.x = midX
      this.titleText.y = midY - 10
    } else {
      this.titleText.visible = false
    }
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.pathRect = null
    this.titleText = null
  }
}
