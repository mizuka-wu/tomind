import { Group, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * MathjaxRenderer — MathJax 公式渲染器
 *
 * 参考旧系统 MathjaxRenderWorker：
 * - 显示 MathJax 公式
 * - 使用 Text 元素显示公式文本
 */
export class MathjaxRenderer implements Renderer {
  private group: Group | null = null
  private text: Text | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group({ name: 'mathjax-group' })
    this.text = new Text({ name: 'mathjax-text' })
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
    const fontSize = style.fontSize as number | undefined
    const visible = style.visible as boolean | undefined

    if (text !== undefined) {
      this.text.text = text || ''
    }

    if (textColor) this.text.fill = textColor
    if (fontSize) this.text.fontSize = fontSize

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
