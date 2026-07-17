import { Group, Path, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/** 常量 */
const ICON_FONT_FAMILY = 'information-iconfont'

/**
 * InformationRenderer — 信息图标渲染器
 *
 * 参考旧系统 InformationRenderWorker：
 * - 显示信息图标
 * - 支持选中状态
 */
export class InformationRenderer implements Renderer {
  private group: Group | null = null
  private selectPath: Path | null = null
  private icon: Text | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group({ name: 'information-group' })
    this.selectPath = new Path()
    this.icon = new Text()
    this.group.add(this.selectPath)
    this.group.add(this.icon)
    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group || !this.selectPath || !this.icon) return

    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    const textContent = style.textContent as string | undefined
    const size = style.size as { width: number; height: number } | undefined
    const visible = style.visible as boolean | undefined

    if (textContent) {
      this.icon.text = textContent
    }

    if (size) {
      const iconSize = size.width
      this.icon.set({
        text: textContent || '',
        fontSize: iconSize,
        fontFamily: ICON_FONT_FAMILY,
        y: (-iconSize / 12) * 5,
      })
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
    this.selectPath = null
    this.icon = null
  }
}
