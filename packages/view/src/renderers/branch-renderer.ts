import { Group } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * BranchRenderer — 分支节点容器
 * 
 * 管理位置、大小、透明度
 * 路由子元素到 SheetRenderer 的对应容器
 */
export class BranchRenderer implements Renderer {
  private group: Group | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group({ name: 'branch' })
    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group) return

    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    // 更新位置
    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    // 更新透明度
    if (style.opacity !== undefined) {
      this.group.opacity = style.opacity as number
    }
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
  }
}
