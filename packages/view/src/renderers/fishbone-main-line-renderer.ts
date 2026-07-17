import { Group, Path } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * FishboneMainLineRenderer — 鱼骨图主线渲染器
 *
 * 参考旧系统 FishboneMainLineRenderWorker：
 * - 显示鱼骨图的主线
 */
export class FishboneMainLineRenderer implements Renderer {
  private group: Group | null = null
  private line: Path | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group({ name: 'fishbone-main-line-group' })
    this.line = new Path({ name: 'fishbone-main-line', fill: 'none' })
    this.group.add(this.line)
    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group || !this.line) return

    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    const linePath = style.linePath as string | undefined
    const stroke = style.stroke as string | undefined
    const strokeWidth = style.strokeWidth as number | undefined
    const visible = style.visible as boolean | undefined

    if (linePath) {
      this.line.path = linePath
    }

    if (stroke) this.line.stroke = stroke
    if (strokeWidth) this.line.strokeWidth = strokeWidth

    if (visible !== undefined) {
      this.group.visible = visible
    }
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.line = null
  }
}
