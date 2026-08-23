/**
 * NoteRenderer — 使用 @leafer-in/html 的 HTMLText 渲染富文本备注
 *
 * 对齐 snowbrush realHTML：优先使用 htmlContent（原始 HTML），
 * 降级到 plain content。
 */

import { Group, Text } from 'leafer-ui'
import { HTMLText } from '@leafer-in/html'

export class NoteRenderer {
  private _group: Group | null = null
  private _htmlText: HTMLText | null = null
  private _plainText: Text | null = null

  /** 当前渲染的内容格式 */
  private _isHtml = false

  get element(): Group | null {
    return this._group
  }

  /** 创建初始元素 */
  create(): Group {
    this._group = new Group()
    return this._group
  }

  /**
   * 渲染备注内容
   * @param content 纯文本内容
   * @param htmlContent HTML 内容（realHTML）
   * @param maxWidth 最大宽度
   */
  render(content: string, htmlContent?: string, maxWidth = 300): void {
    if (!this._group) return

    // 有 HTML 内容时使用 HTMLText
    if (htmlContent) {
      this._renderHtml(htmlContent, maxWidth)
    } else if (content) {
      this._renderPlain(content, maxWidth)
    }
  }

  private _renderHtml(html: string, maxWidth: number): void {
    // 清除旧的纯文本
    if (this._plainText) {
      this._group!.remove(this._plainText)
      this._plainText = null
    }

    if (!this._htmlText) {
      this._htmlText = new HTMLText({
        text: html,
        width: maxWidth,
        fill: '#333',
        fontSize: 13,
        fontFamily: 'Microsoft YaHei, PingFang SC, sans-serif',
      })
      this._group!.add(this._htmlText)
    } else {
      this._htmlText.text = html
      this._htmlText.width = maxWidth
    }
    this._isHtml = true
  }

  private _renderPlain(text: string, maxWidth: number): void {
    // 清除旧的 HTML
    if (this._htmlText) {
      this._group!.remove(this._htmlText)
      this._htmlText = null
    }

    if (!this._plainText) {
      this._plainText = new Text({
        text,
        width: maxWidth,
        fill: '#333',
        fontSize: 13,
        fontFamily: 'Microsoft YaHei, PingFang SC, sans-serif',
      })
      this._group!.add(this._plainText)
    } else {
      this._plainText.text = text
      this._plainText.width = maxWidth
    }
    this._isHtml = false
  }

  /** 销毁渲染器 */
  destroy(): void {
    if (this._htmlText) {
      this._htmlText = null
    }
    if (this._plainText) {
      this._plainText = null
    }
    this._group = null
  }
}
