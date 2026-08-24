import { Group, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import { mapTextDecoration, mapTextAlign, mapFontWeight } from '../text-style-helpers'
import type { Renderer } from './renderer'
import { getStringStyle, getNumberStyle, getBoolStyle, getObjectStyle } from '../style-accessors'
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

    // 从 style 中提取属性（优先使用 numberingText，其次 text）
    const text = getStringStyle(style, 'numberingText') ?? getStringStyle(style, 'text')
    const textColor = getStringStyle(style, 'textColor')
    const textDecoration = getStringStyle(style, 'textDecoration')
    const textAlign = getStringStyle(style, 'textAlign')
    const fontSize = getNumberStyle(style, 'fontSize')
    const fontFamily = getStringStyle(style, 'fontFamily')
    const fontWeight = getStringStyle(style, 'fontWeight')
    const fontStyle = getStringStyle(style, 'fontStyle')
    const textPosition = getObjectStyle<{ x: number; y: number }>(style, 'textPosition')
    const visible = getBoolStyle(style, 'visible')

    // 更新文本内容
    if (text !== undefined) {
      this.text.text = text || ''
    }

    // 更新样式
    if (textColor) {
      this.text.fill = textColor
    }

    if (textDecoration) {
      this.text.textDecoration = mapTextDecoration(textDecoration)
    }

    if (textAlign) {
      this.text.textAlign = mapTextAlign(textAlign)
    }

    if (fontSize) {
      this.text.fontSize = fontSize
    }

    if (fontFamily) {
      this.text.fontFamily = fontFamily
    }

    if (fontWeight) {
      this.text.fontWeight = mapFontWeight(fontWeight)
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

    // 可见性（优先使用 numberingVisible）
    const numberingVisible = getBoolStyle(style, 'numberingVisible')
    if (numberingVisible !== undefined) {
      this.group.visible = numberingVisible && !!text
    } else if (visible !== undefined) {
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
