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
 * NumberingRenderer — 编号渲染器
 *
 * 参考旧系统 NumberingRenderWorker：
 * - 继承自 TitleRenderWorker
 * - 显示编号文本
 */
export class NumberingRenderer implements Renderer {
  private group: Group | null = null
  private text: Text | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group({ name: 'numbering-class' })
    this.text = new Text({ cursor: 'default' })
    this.group.add(this.text)
    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group || !this.text) return

    // 从 layout 获取节点位置
    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    // 位置
    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    // 从 style 中提取属性
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

    // 更新文本内容
    if (text !== undefined) {
      this.text.text = text || ''
    }

    // 更新样式
    if (textColor) {
      this.text.fill = textColor
    }

    if (textDecoration) {
      this.text.textDecoration = textDecoration as any
    }

    if (textAlign) {
      this.text.textAlign = ANCHOR_MAP[textAlign] as any
    }

    if (fontSize) {
      this.text.fontSize = fontSize
    }

    if (fontFamily) {
      this.text.fontFamily = fontFamily
    }

    if (fontWeight) {
      this.text.fontWeight = fontWeight as any
    }

    if (fontStyle) {
      this.text.italic = fontStyle === 'italic'
    }

    // 文本位置
    if (textPosition) {
      this.text.set({
        x: textPosition.x,
        y: textPosition.y,
      })
    }

    // 可见性
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
