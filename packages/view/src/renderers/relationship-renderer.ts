import { Group, Path, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * RelationshipRenderer — 关系线渲染器
 * 
 * 负责渲染贝塞尔曲线 + 可选标题
 */
export class RelationshipRenderer implements Renderer {
  private group: Group | null = null
  private path: Path | null = null
  private titleText: Text | null = null

  /** 起止点坐标（由外部设置） */
  private from = { x: 0, y: 0 }
  private to = { x: 0, y: 0 }
  private controlPoints: ReadonlyArray<{ x: number; y: number }> | null = null
  private title = ''

  create(parent: Group): void {
    this.group = new Group()

    // 关系线路径
    this.path = new Path({
      path: '',
      stroke: '#666',
      strokeWidth: 2,
    })
    this.group.add(this.path)

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
    controlPoints?: ReadonlyArray<{ x: number; y: number }>,
    title?: string,
  ): void {
    this.from = from
    this.to = to
    this.controlPoints = controlPoints ?? null
    this.title = title ?? ''
  }

  render(_layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.path || !this.titleText) {
      return
    }

    // 更新样式
    if (style.stroke) this.path.stroke = style.stroke as string
    if (style.strokeWidth) this.path.strokeWidth = style.strokeWidth as number

    // 计算贝塞尔曲线路径
    let d: string
    if (this.controlPoints && this.controlPoints.length >= 2) {
      const cp1 = this.controlPoints[0]
      const cp2 = this.controlPoints[1]
      d = `M ${this.from.x} ${this.from.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${this.to.x} ${this.to.y}`
    } else {
      // 默认简单贝塞尔曲线
      const midX = (this.from.x + this.to.x) / 2
      d = `M ${this.from.x} ${this.from.y} C ${midX} ${this.from.y} ${midX} ${this.to.y} ${this.to.x} ${this.to.y}`
    }
    this.path.path = d

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
    this.path = null
    this.titleText = null
  }
}
