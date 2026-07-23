import { Group, Rect, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'
import { getTitleText } from '@tomind/schema'

/**
 * TopicRenderer — Topic 节点渲染器
 * 
 * 负责渲染矩形 + 文本的组合
 * style 参数已经是 LeaferJS 格式（由 StyleEngine.getLeaferStyle() 提供）
 */
export class TopicRenderer implements Renderer {
  private group: Group | null = null
  private rect: Rect | null = null
  private text: Text | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group()
    
    this.rect = new Rect()
    this.text = new Text()
    
    this.group.add(this.rect)
    this.group.add(this.text)
    
    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.rect || !this.text || !this.group) {
      return
    }

    // 从 LayoutResult Map 中获取节点布局
    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) {
      return
    }

    // 使用绝对坐标（相对于根 Group）
    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    // 更新 Rect — 直接用 LeaferJS 属性
    this.rect.width = nodeLayout.width
    this.rect.height = nodeLayout.height
    
    // fill, stroke, strokeWidth, cornerRadius 等
    if (style.fill !== undefined) this.rect.fill = style.fill as string
    if (style.stroke !== undefined) this.rect.stroke = style.stroke as string
    if (style.strokeWidth !== undefined) this.rect.strokeWidth = style.strokeWidth as number
    if (style.cornerRadius !== undefined) this.rect.cornerRadius = style.cornerRadius as number

    // 更新 Text — 直接用 LeaferJS 属性
    this.text.text = getTitleText(style)
    
    // 字体颜色：优先用 fontColor，fallback 到 color
    const fontColor = style.fontColor ?? style.color ?? '#333'
    this.text.fill = fontColor as string

    if (style.fontFamily !== undefined) this.text.fontFamily = style.fontFamily as string
    if (style.fontSize !== undefined) this.text.fontSize = style.fontSize as number
    if (style.fontWeight !== undefined) this.text.fontWeight = style.fontWeight as any
    if (style.textAlign !== undefined) this.text.textAlign = style.textAlign as any

    // 文本居中
    const textAlign = (style.textAlign as string) ?? 'center'
    const fontSize = (style.fontSize as number) ?? 14
    const textWidth = this.text.width || nodeLayout.titleWidth || nodeLayout.width
    const textHeight = this.text.height || nodeLayout.titleHeight || fontSize

    // 水平居中
    if (textAlign === 'center' || textAlign === undefined) {
      this.text.x = (nodeLayout.width - textWidth) / 2
    } else if (textAlign === 'right') {
      this.text.x = nodeLayout.width - textWidth - 8
    } else {
      this.text.x = 8
    }

    // 垂直居中
    this.text.y = (nodeLayout.height - textHeight) / 2
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.rect = null
    this.text = null
  }
}
