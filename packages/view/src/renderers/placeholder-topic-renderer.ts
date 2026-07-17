import { Group, Path } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * PlaceholderTopicRenderer — 占位主题渲染器
 *
 * 参考旧系统 PlaceHolderTopicRenderWorker：
 * - 继承自 TopicRenderWorker
 * - 使用 Path 而不是 Rect，fillOpacity 为 0.5
 */
export class PlaceholderTopicRenderer implements Renderer {
  private group: Group | null = null
  private path: Path | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group()
    this.path = new Path({ fillOpacity: 0.5 })
    this.group.add(this.path)
    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group || !this.path) return

    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    const fill = style.fill as string | undefined
    const stroke = style.stroke as string | undefined
    const strokeWidth = style.strokeWidth as number | undefined
    const cornerRadius = style.cornerRadius as number | undefined
    const visible = style.visible as boolean | undefined

    // 生成矩形路径
    const { width, height } = nodeLayout
    const r = cornerRadius || 0
    const d = `M ${r} 0 L ${width - r} 0 Q ${width} 0 ${width} ${r} L ${width} ${height - r} Q ${width} ${height} ${width - r} ${height} L ${r} ${height} Q 0 ${height} 0 ${height - r} L 0 ${r} Q 0 0 ${r} 0 Z`
    this.path.path = d

    if (fill) this.path.fill = fill
    if (stroke) this.path.stroke = stroke
    if (strokeWidth) this.path.strokeWidth = strokeWidth

    if (visible !== undefined) {
      this.group.visible = visible
    }
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.path = null
  }
}
