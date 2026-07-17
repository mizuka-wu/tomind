import { Group, Path, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/** 文本对齐映射 */
const ANCHOR_MAP: Record<string, string> = {
  left: 'left',
  center: 'center',
  right: 'right',
}

/** 边界标题布局常量 */
const BOUNDARY_TITLE_LAYOUT = {
  TOP_LEFT_RADIUS: 8,
  TOP_RIGHT_RADIUS: 8,
  BOTTOM_LEFT_RADIUS: 8,
  BOTTOM_RIGHT_RADIUS: 8,
}

/**
 * BoundaryTitleRenderer — 边界标题渲染器
 *
 * 参考旧系统 BoundaryTitleRenderWorker：
 * - 继承自 TitleRenderWorker
 * - 显示边界标题
 * - 带背景路径
 */
export class BoundaryTitleRenderer implements Renderer {
  private group: Group | null = null
  private background: Path | null = null
  private text: Text | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group({ name: 'boundary-title-group' })
    this.background = new Path({ name: 'boundary-title-bg' })
    this.text = new Text({ name: 'boundary-title', cursor: 'default' })
    this.group.add(this.background)
    this.group.add(this.text)
    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group || !this.background || !this.text) return

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
    const bgFillColor = style.bgFillColor as string | undefined
    const visible = style.visible as boolean | undefined

    // 生成背景路径
    const { width, height } = nodeLayout
    const tl = BOUNDARY_TITLE_LAYOUT.TOP_LEFT_RADIUS
    const tr = BOUNDARY_TITLE_LAYOUT.TOP_RIGHT_RADIUS
    const bl = BOUNDARY_TITLE_LAYOUT.BOTTOM_LEFT_RADIUS
    const br = BOUNDARY_TITLE_LAYOUT.BOTTOM_RIGHT_RADIUS
    const bgPath = `M ${tl} 0 L ${width - tr} 0 Q ${width} 0 ${width} ${tr} L ${width} ${height - br} Q ${width} ${height} ${width - br} ${height} L ${bl} ${height} Q 0 ${height} 0 ${height - bl} L 0 ${tl} Q 0 0 ${tl} 0 Z`
    this.background.path = bgPath

    if (bgFillColor) {
      this.background.fill = bgFillColor
    }

    // 文本
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
    this.background = null
    this.text = null
  }
}
