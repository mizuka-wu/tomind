import { Group, Rect, Path, Image } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'
import { getStringStyle, getNumberStyle, getBoolStyle } from '../style-accessors'

/**
 * ImageRenderer — 图片渲染器
 *
 * 参考旧系统 ImageRenderWorker：
 * - 显示图片
 * - 支持边框、阴影、加载状态
 * - 支持 opacity、align、shadowVisible
 */
export class ImageRenderer implements Renderer {
  private group: Group | null = null
  private imageContainer: Group | null = null
  private imageStaticBackground: Rect | null = null
  private imageBorderPath: Path | null = null
  private image: Image | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group({ name: 'image-group' })
    this.imageContainer = new Group({ name: 'image-container' })
    this.group.add(this.imageContainer)

    this.imageStaticBackground = new Rect({
      name: 'image-static-bg',
      fill: 'none',
      visible: false,
    })
    this.imageContainer.add(this.imageStaticBackground)

    this.imageBorderPath = new Path({ name: 'image-border-path', fill: 'none' })
    this.imageContainer.add(this.imageBorderPath)

    this.image = new Image({
      name: 'topic-img',
      preserveAspectRatio: 'none',
      visible: false,
    })
    this.imageContainer.add(this.image)

    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group || !this.image || !this.imageBorderPath || !this.imageStaticBackground) return

    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    // 从 style 中提取图片专属属性（image 前缀）
    const imageUrl = getStringStyle(style, 'imageUrl')
    const imageWidth = getNumberStyle(style, 'imageWidth')
    const imageHeight = getNumberStyle(style, 'imageHeight')
    const imageBorderWidth = getNumberStyle(style, 'imageBorderWidth') ?? 0
    const imageBorderColor = getStringStyle(style, 'imageBorderColor')
    const imageOpacity = getNumberStyle(style, 'imageOpacity')
    const imageShadowVisible = getBoolStyle(style, 'imageShadowVisible')

    // 通用属性
    const borderPath = getStringStyle(style, 'borderPath')
    const staticBackgroundFillColor = getStringStyle(style, 'staticBackgroundFillColor')
    const visible = getBoolStyle(style, 'visible')

    // 位置（考虑边框宽度）
    this.group.x = nodeLayout.x + imageBorderWidth / 2
    this.group.y = nodeLayout.y + imageBorderWidth / 2

    // 大小
    const width = imageWidth ?? nodeLayout.width
    const height = imageHeight ?? nodeLayout.height
    this.image.set({ width, height })
    this.imageStaticBackground.set({ width, height })

    // 边框
    if (borderPath) {
      this.imageBorderPath.path = borderPath
    }
    if (imageBorderWidth > 0) {
      this.imageBorderPath.strokeWidth = imageBorderWidth
    }
    if (imageBorderColor) {
      this.imageBorderPath.stroke = imageBorderColor
    }

    // 背景
    if (staticBackgroundFillColor) {
      this.imageStaticBackground.fill = staticBackgroundFillColor
    }

    // 图片 URL
    if (imageUrl) {
      this.image.url = imageUrl
      this.image.visible = true
    }

    // 可见性
    if (visible !== undefined) {
      this.group.visible = visible
    }

    // opacity
    if (imageOpacity !== undefined) {
      this.image.opacity = imageOpacity
      this.imageBorderPath.opacity = imageOpacity
    }

    // shadowVisible — 使用 LeaferJS shadow 属性
    if (imageShadowVisible && this.imageContainer) {
      const shadowOffset = (width + height) / 175
      const maxStdDeviation = imageBorderWidth > 0 ? imageBorderWidth * 0.7 : Infinity
      const shadowBlur = Math.min(shadowOffset * 3, maxStdDeviation)
      this.imageContainer.shadow = {
        x: 0,
        y: shadowOffset,
        blur: shadowBlur,
        color: 'rgba(0,0,0,0.3)',
      }
    } else if (this.imageContainer) {
      this.imageContainer.shadow = undefined
    }
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.imageContainer = null
    this.imageStaticBackground = null
    this.imageBorderPath = null
    this.image = null
  }
}
