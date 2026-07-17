import { Group, Path, Rect } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * TopicSelectBoxRenderer — 主题选择框渲染器
 *
 * 参考旧系统 TopicSelectBoxRenderWorker：
 * - 显示主题选择框
 * - 支持自定义宽度控制条
 */
export class TopicSelectBoxRenderer implements Renderer {
  private group: Group | null = null
  private tsb: Path | null = null
  private leftBar: Rect | null = null
  private rightBar: Rect | null = null
  private cwcb: Group | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group({ name: 'topic-select-box-group', visible: false })
    this.tsb = new Path({ name: 'topic-select-box' })
    this.group.add(this.tsb)

    // 自定义宽度控制条
    this.cwcb = new Group({ name: 'topic-custom-width-control-bar-group' })
    this.leftBar = new Rect({
      name: 'topic-custom-width-control-bar',
      opacity: 0,
      cursor: 'ew-resize',
    })
    this.rightBar = new Rect({
      name: 'topic-custom-width-control-bar',
      opacity: 0,
      cursor: 'ew-resize',
    })
    this.cwcb.add(this.leftBar)
    this.cwcb.add(this.rightBar)
    this.group.add(this.cwcb)

    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group || !this.tsb) return

    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    const topicSelectBoxPath = style.topicSelectBoxPath as string | undefined
    const topicSelectBoxAttr = style.topicSelectBoxAttr as Record<string, unknown> | undefined
    const barDisplayState = style.barDisplayState as boolean | undefined
    const visible = style.visible as boolean | undefined

    if (topicSelectBoxPath) {
      this.tsb.path = topicSelectBoxPath
    }

    if (topicSelectBoxAttr) {
      this.tsb.set(topicSelectBoxAttr)
    }

    if (this.cwcb) {
      this.cwcb.visible = barDisplayState === true
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
    this.tsb = null
    this.leftBar = null
    this.rightBar = null
    this.cwcb = null
  }
}
