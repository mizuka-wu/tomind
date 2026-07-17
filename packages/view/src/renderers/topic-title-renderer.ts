import { Group, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/** 文本对齐映射 */
const ANCHOR_MAP: Record<string, string> = {
  left: 'left',
  center: 'center',
  right: 'right',
}

/**
 * TopicTitleRenderer — 主题标题渲染器
 *
 * 参考旧系统 TopicTitleRenderWorker：
 * - 继承自 TitleRenderWorker
 * - 显示主题标题文本
 */
export class TopicTitleRenderer implements Renderer {
  private group: Group | null = null
  private text: Text | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group({ name: 'topic-title-text-group' })
    this.text = new Text({ cursor: 'default' })
    this.group.add(this.text)
    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group || !this.text) return

    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    const text = style.text as string | undefined
    const textColor = style.textColor as string | undefined
    const textDecoration = style.textDecoration as string | undefined
    const textAlign = style.textAlign as string | undefined
    const fontSize = style.fontSize as number | undefined
    const fontFamily = style.fontFamily as string | undefined
    const fontWeight = style.fontWeight as string | undefined
    const fontStyle = style.fontStyle as string | undefined
    const textPosition = style.textPosition as { x: number; y: number } | undefined
    const visible = style.visible as boolean | undefined

    if (text !== undefined) {
      this.text.text = text || ''
    }

    if (textColor) this.text.fill = textColor
    if (textDecoration) this.text.textDecoration = textDecoration as any
    if (textAlign) this.text.textAlign = ANCHOR_MAP[textAlign] as any
    if (fontSize) this.text.fontSize = fontSize
    if (fontFamily) this.text.fontFamily = fontFamily
    if (fontWeight) this.text.fontWeight = fontWeight as any
    if (fontStyle) this.text.italic = fontStyle === 'italic'

    if (textPosition) {
      this.text.set({ x: textPosition.x, y: textPosition.y })
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
    this.text = null
  }
}
