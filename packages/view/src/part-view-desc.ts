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

    if (oldData === newData) return true

    ;(this as unknown as { node: NodeDesc }).node = newNode
    this.updatePart(newData)
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

export class NotePartViewDesc extends PartViewDesc {
  private _noteIcon: Rect | null = null

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
    if (this._noteIcon) {
      this._noteIcon.visible = !!data
    }
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
