/**
 * PartViewDesc — Part 视图描述（对标 ProseMirror MarkViewDesc）
 *
 * Part 是 topic 内部的组级元素（容器），用 Group 渲染
 * Part 的数据来自 Node attrs
 *
 * 职责：
 * 1. 渲染 Part（标题、图片、标记等）
 * 2. 管理 PartItemViewDesc（Part 内部的单个条目）
 * 3. 处理 Part 数据更新
 */

import { Group, Text, Image as LeaferImage, Rect } from 'leafer-ui'
import { HTMLText } from '@leafer-in/html'
import { ViewDesc } from './view-desc'
import type { NodeDesc, NodeRole } from '@tomind/schema'
import { getTitleText } from '@tomind/schema'
import { MarkersRenderer } from './renderers/markers-renderer'
import { LabelsRenderer } from './renderers/labels-renderer'

// ==================== PartViewDesc ====================

export abstract class PartViewDesc extends ViewDesc {
  readonly partType: string
  readonly position: 'top' | 'bottom' | 'left' | 'right' | 'outside' | 'center'
  readonly order: number

  constructor(
    node: NodeDesc,
    role: NodeRole,
    partType: string,
    position: 'top' | 'bottom' | 'left' | 'right' | 'outside' | 'center',
    order: number,
  ) {
    super(node, role)
    this.partType = partType
    this.position = position
    this.order = order
  }

  protected getPartData(): unknown {
    return this.node.attrs[this.partType]
  }

  protected updatePartData(_data: unknown): void {
    // 通过 SheetEditor 的 dispatch 更新
  }

  override update(newNode: NodeDesc): boolean {
    if (this._destroyed) return false

    const oldData = this.getPartData()
    const newData = newNode.attrs[this.partType]

    this.updateNode(newNode)

    if (oldData !== newData) {
      this.updatePart(newData)
    }

    this.clearDirty()
    return true
  }

  protected abstract updatePart(data: unknown): void
}

// ==================== TitlePartViewDesc ====================

export class TitlePartViewDesc extends PartViewDesc {
  private _text: Text | null = null

  constructor(node: NodeDesc, role: NodeRole) {
    super(node, role, 'title', 'center', 0)
  }

  protected createElement(): Group {
    const group = new Group()
    this._text = new Text({
      text: getTitleText(this.node.attrs),
      fontSize: 14,
      fill: '#333',
    })
    group.add(this._text)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updatePart(data: unknown): void {
    if (this._text) {
      this._text.text = (data as string) ?? ''
    }
  }
}

// ==================== ImagePartViewDesc ====================

export class ImagePartViewDesc extends PartViewDesc {
  private _image: LeaferImage | null = null

  constructor(node: NodeDesc, role: NodeRole) {
    super(node, role, 'image', 'center', 10)
  }

  protected createElement(): Group {
    const group = new Group()
    const imageData = this.node.attrs.image as { url?: string } | undefined
    if (imageData?.url) {
      this._image = new LeaferImage({ url: imageData.url, width: 100, height: 100 })
      group.add(this._image)
    }
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updatePart(data: unknown): void {
    const imageData = data as { url?: string } | undefined
    if (this._image && imageData?.url) {
      this._image.url = imageData.url
    }
  }
}

// ==================== MarkersPartViewDesc ====================

export class MarkersPartViewDesc extends PartViewDesc {
  private renderer: MarkersRenderer | null = null

  constructor(node: NodeDesc, role: NodeRole) {
    super(node, role, 'markers', 'top', 20)
  }

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new MarkersRenderer()
    this.renderer.create(group)
    this.syncMarkerIcons()
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updatePart(_data: unknown): void {
    this.syncMarkerIcons()
  }

  private syncMarkerIcons(): void {
    if (!this.renderer) return

    const markers = (this.node.attrs.markers as { id: string; icon?: string; color?: string }[]) ?? []
    this.renderer.updateMarkers(markers)
  }
}

// ==================== LabelsPartViewDesc ====================

export class LabelsPartViewDesc extends PartViewDesc {
  private renderer: LabelsRenderer | null = null

  constructor(node: NodeDesc, role: NodeRole) {
    super(node, role, 'labels', 'bottom', 30)
  }

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new LabelsRenderer()
    this.renderer.create(group)
    this.syncLabelTexts()
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updatePart(_data: unknown): void {
    this.syncLabelTexts()
  }

  private syncLabelTexts(): void {
    if (!this.renderer) return

    const labels = (this.node.attrs.labels as { id: string; text: string; color?: string }[]) ?? []
    this.renderer.updateLabels(labels)
  }
}

// ==================== NotePartViewDesc ====================

/** NoteData 结构（对齐 schema NoteData） */
interface NoteData {
  readonly content: string
  readonly format?: 'plain' | 'markdown' | 'html'
  readonly htmlContent?: string
}

export class NotePartViewDesc extends PartViewDesc {
  private _noteIcon: Rect | null = null
  private _htmlText: HTMLText | null = null
  private _plainText: Text | null = null

  constructor(node: NodeDesc, role: NodeRole) {
    super(node, role, 'note', 'right', 40)
  }

  protected createElement(): Group {
    const group = new Group()
    this._noteIcon = new Rect({
      width: 16,
      height: 16,
      fill: '#FFC107',
      cornerRadius: 2,
    })
    group.add(this._noteIcon)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updatePart(data: unknown): void {
    const note = data as NoteData | undefined
    const hasNote = !!note && (!!(note as NoteData).content || !!(note as NoteData).htmlContent)

    // 图标可见性
    if (this._noteIcon) {
      this._noteIcon.visible = hasNote
    }

    if (!hasNote || !note) {
      // 清除内容
      this._clearContent()
      return
    }

    const noteData = note as NoteData
    // 优先使用 HTML 内容（对齐 snowbrush realHTML）
    if (noteData.htmlContent) {
      this._renderHtml(noteData.htmlContent)
    } else if (noteData.content) {
      this._renderPlain(noteData.content)
    }
  }

  private _renderHtml(html: string): void {
    // 清除纯文本
    if (this._plainText) {
      this.element?.remove(this._plainText)
      this._plainText = null
    }

    if (!this._htmlText) {
      this._htmlText = new HTMLText({
        text: html,
        width: 280,
        fill: '#333',
        fontSize: 13,
        fontFamily: 'Microsoft YaHei, PingFang SC, sans-serif',
        y: 20, // 图标下方
      })
      this.element?.add(this._htmlText)
    } else {
      this._htmlText.text = html
    }
  }

  private _renderPlain(text: string): void {
    // 清除 HTML
    if (this._htmlText) {
      this.element?.remove(this._htmlText)
      this._htmlText = null
    }

    if (!this._plainText) {
      this._plainText = new Text({
        text,
        width: 280,
        fill: '#333',
        fontSize: 13,
        fontFamily: 'Microsoft YaHei, PingFang SC, sans-serif',
        y: 20, // 图标下方
      })
      this.element?.add(this._plainText)
    } else {
      this._plainText.text = text
    }
  }

  private _clearContent(): void {
    if (this._htmlText) {
      this.element?.remove(this._htmlText)
      this._htmlText = null
    }
    if (this._plainText) {
      this.element?.remove(this._plainText)
      this._plainText = null
    }
  }

  override destroy(): void {
    this._htmlText = null
    this._plainText = null
    this._noteIcon = null
    super.destroy()
  }
}

// ==================== LinkPartViewDesc ====================

export class LinkPartViewDesc extends PartViewDesc {
  private _linkIcon: Rect | null = null

  constructor(node: NodeDesc, role: NodeRole) {
    super(node, role, 'link', 'right', 5)
  }

  protected createElement(): Group {
    const group = new Group()
    this._linkIcon = new Rect({
      width: 16,
      height: 16,
      fill: '#2196F3',
      cornerRadius: 2,
    })
    group.add(this._linkIcon)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updatePart(data: unknown): void {
    if (this._linkIcon) {
      this._linkIcon.visible = !!data
    }
  }
}

// ==================== CommentsPartViewDesc ====================

/** CommentData 结构（对齐 schema CommentData） */
interface CommentItemData {
  readonly author: string
  readonly content: string
  readonly time?: number
}

export class CommentsPartViewDesc extends PartViewDesc {
  private _icon: Rect | null = null
  private _badge: Text | null = null

  constructor(node: NodeDesc, role: NodeRole) {
    super(node, role, 'comments', 'right', 45)
  }

  protected createElement(): Group {
    const group = new Group()
    // 评论图标（绿色方块）
    this._icon = new Rect({
      width: 16,
      height: 16,
      fill: '#4CAF50',
      cornerRadius: 2,
    })
    group.add(this._icon)
    // 评论数量角标
    this._badge = new Text({
      text: '',
      fontSize: 10,
      fill: '#fff',
      x: 10,
      y: -2,
    })
    group.add(this._badge)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updatePart(data: unknown): void {
    const comments = data as CommentItemData[] | undefined
    const hasComments = !!comments && comments.length > 0

    if (this._icon) {
      this._icon.visible = hasComments
    }
    if (this._badge) {
      if (hasComments && comments) {
        this._badge.text = String(comments.length)
        this._badge.visible = comments.length > 1
      } else {
        this._badge.visible = false
      }
    }
  }

  override destroy(): void {
    this._icon = null
    this._badge = null
    super.destroy()
  }
}
