import { Group, Path, Rect } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/** 常量 */
const BOX_WIDTH = 40
const BOX_HEIGHT = 15
const TREE_LIKE_BOX_ATTRS = {
  fill: '#2ebdff',
  rx: 3,
  width: BOX_WIDTH,
  height: BOX_HEIGHT,
}

/**
 * IndicatorRenderer — 指示器渲染器
 *
 * 参考旧系统 IndicatorRenderWorker：
 * - 显示连接线和指示框
 * - 支持遮罩效果
 */
export class IndicatorRenderer implements Renderer {
  private group: Group | null = null
  private line: Path | null = null
  private box: Rect | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group({ name: 'indicator' })
    this.line = new Path({ name: 'indicator-line', fill: 'none' })
    this.group.add(this.line)
    this.box = new Rect({ name: 'indicator-box' })
    this.group.add(this.box)
    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group || !this.line || !this.box) return

    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    const lineAttrs = style.lineAttrs as Record<string, unknown> | undefined
    const boxAttrs = style.boxAttrs as Record<string, unknown> | undefined
    const visible = style.visible as boolean | undefined

    if (lineAttrs) {
      this.line.set(lineAttrs)
    }

    if (boxAttrs) {
      this.box.set({ ...TREE_LIKE_BOX_ATTRS, ...boxAttrs })
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
    this.line = null
    this.box = null
  }
}
