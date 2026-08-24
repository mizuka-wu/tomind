import { Group, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'
import { getStringStyle, getNumberStyle, getBoolStyle } from '../style-accessors'

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

    const text = getStringStyle(style, 'text')
    const textColor = getStringStyle(style, 'textColor')
    const fontSize = getNumberStyle(style, 'fontSize')
    const visible = getBoolStyle(style, 'visible')

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
