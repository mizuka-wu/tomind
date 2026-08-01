import { Group, Rect, Text, Line, Ellipse } from 'leafer-ui'
import type { IFontWeight, ITextAlign } from 'leafer-ui'
import type { LayoutResult, NodeLayout } from '@tomind/layout'
import type { Renderer } from './renderer'
import { getTitleText } from '@tomind/schema'

/**
 * TopicRenderer — Topic 节点渲染器
 * 
 * 支持根据 shapeClass 渲染不同形状：
 * - 'roundedRect'（默认）：矩形 + cornerRadius
 * - 'underline'：只画下划线（无填充矩形）
 * - 'ellipse'：椭圆
 * 
 * style 参数已经是 LeaferJS 格式（由 StyleEngine.getLeaferStyle() 提供）
 * opacity 应用到整个 group（形状 + 文本）
 */
export class TopicRenderer implements Renderer {
  private group: Group | null = null
  private shape: Rect | Line | Ellipse | null = null
  private text: Text | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group()

    // 默认形状：roundedRect
    this.shape = new Rect()
    this.text = new Text()

    this.group.add(this.shape)
    this.group.add(this.text)

    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>, nodeAttrs?: Record<string, unknown>): void {
    if (!this.group || !this.text || !this.shape) {
      return
    }

    // 从 LayoutResult Map 中获取节点布局
    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) {
      return
    }

    // 坐标由 TopicNodeViewDesc.updateStyle() 设到 element 上
    // renderer.group 保持 (0,0)，只负责 shape+text 的相对布局

    // 根据 shapeClass 选择形状
    const shapeClass = typeof style.shapeClass === 'string' ? style.shapeClass : 'roundedRect'
    if (shapeClass === 'underline') {
      this.renderUnderline(nodeLayout, style)
    } else if (shapeClass === 'ellipse') {
      this.renderEllipse(nodeLayout, style)
    } else {
      this.renderRoundedRect(nodeLayout, style)
    }

    // opacity 应用到整个 group
    if (typeof style.opacity === 'number') {
      this.group.opacity = style.opacity
    }

    // 文本渲染
    this.renderText(nodeLayout, style, nodeAttrs)
  }

  /**
   * roundedRect：矩形 + cornerRadius
   */
  private renderRoundedRect(layout: NodeLayout, style: Record<string, unknown>): void {
    if (!(this.shape instanceof Rect)) {
      this.replaceShape(new Rect())
    }
    const rect = this.shape
    if (!(rect instanceof Rect)) return

    rect.width = layout.width
    rect.height = layout.height

    // fill, stroke, strokeWidth, cornerRadius 等
    if (typeof style.fill === 'string') rect.fill = style.fill
    if (typeof style.stroke === 'string') rect.stroke = style.stroke
    if (typeof style.strokeWidth === 'number') rect.strokeWidth = style.strokeWidth
    if (typeof style.cornerRadius === 'number') rect.cornerRadius = style.cornerRadius
  }

  /**
   * underline：只画底部下划线，无填充矩形
   */
  private renderUnderline(layout: NodeLayout, style: Record<string, unknown>): void {
    if (!(this.shape instanceof Line)) {
      this.replaceShape(new Line())
    }
    const line = this.shape
    if (!(line instanceof Line)) return

    line.points = [0, layout.height, layout.width, layout.height]

    if (typeof style.stroke === 'string') line.stroke = style.stroke
    if (typeof style.strokeWidth === 'number') line.strokeWidth = style.strokeWidth
  }

  /**
   * ellipse：椭圆替代矩形
   */
  private renderEllipse(layout: NodeLayout, style: Record<string, unknown>): void {
    if (!(this.shape instanceof Ellipse)) {
      this.replaceShape(new Ellipse())
    }
    const ellipse = this.shape
    if (!(ellipse instanceof Ellipse)) return

    ellipse.width = layout.width
    ellipse.height = layout.height

    if (typeof style.fill === 'string') ellipse.fill = style.fill
    if (typeof style.stroke === 'string') ellipse.stroke = style.stroke
    if (typeof style.strokeWidth === 'number') ellipse.strokeWidth = style.strokeWidth
  }

  /**
   * 替换形状元素（保持形状在文本下方）
   */
  private replaceShape(newShape: Rect | Line | Ellipse): void {
    if (this.shape && this.group) {
      this.group.remove(this.shape)
      this.shape.destroy()
    }
    this.shape = newShape
    this.group?.addAt(newShape, 0)
  }

  /**
   * 渲染文本（复用原有逻辑）
   */
  private renderText(layout: NodeLayout, style: Record<string, unknown>, nodeAttrs?: Record<string, unknown>): void {
    if (!this.text) return

    // 从 node.attrs 取 title（style 不含 title）
    const titleStyle = nodeAttrs ?? style
    this.text.text = getTitleText(titleStyle)

    // 字体颜色：优先用 fontColor，fallback 到 color
    const fontColor = style.fontColor ?? style.color ?? '#333'
    if (typeof fontColor === 'string') this.text.fill = fontColor

    if (typeof style.fontFamily === 'string') this.text.fontFamily = style.fontFamily
    if (typeof style.fontSize === 'number') this.text.fontSize = style.fontSize
    if (typeof style.fontWeight === 'string' || typeof style.fontWeight === 'number') {
      this.text.fontWeight = style.fontWeight as IFontWeight
    }
    if (typeof style.textAlign === 'string') {
      this.text.textAlign = style.textAlign as ITextAlign
    }

    // 文本居中
    const textAlign = (style.textAlign as string) ?? 'center'
    const fontSize = (style.fontSize as number) ?? 14
    const textWidth = this.text.width || layout.titleWidth || layout.width
    const textHeight = this.text.height || layout.titleHeight || fontSize

    // 水平居中
    if (textAlign === 'center' || textAlign === undefined) {
      this.text.x = (layout.width - textWidth) / 2
    } else if (textAlign === 'right') {
      this.text.x = layout.width - textWidth - 8
    } else {
      this.text.x = 8
    }

    // 垂直居中
    this.text.y = (layout.height - textHeight) / 2
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.shape = null
    this.text = null
  }
}
