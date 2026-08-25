/**
 * IndicatorNodeViewDesc — 指示器 Widget ViewDesc
 *
 * 用于 Widget Decoration 系统，作为 'indicator' 类型的 Widget
 */

import { Group } from 'leafer-ui'
import type { NodeDesc, NodeRole } from '@tomind/schema'
import { NodeViewDesc } from './node-view-desc'
import type { ViewContext } from './node-view-desc'
import { IndicatorRenderer } from './renderers/indicator-renderer'

export class IndicatorNodeViewDesc extends NodeViewDesc {
  private renderer: IndicatorRenderer | null = null

  constructor(node: NodeDesc, role: NodeRole, ctx: ViewContext) {
    super(node, role, ctx)
  }

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new IndicatorRenderer(this.node.id)
    this.renderer.create(group)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = this.ctx.styleEngine.getLeaferStyle(this.ctx.state, this.node.id)
    const layout = this.ctx.layoutEngine?.getLayoutResult() || { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}
