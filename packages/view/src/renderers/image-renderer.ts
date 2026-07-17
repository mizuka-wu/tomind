import { Group, Rect, Path, Image } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * ImageRenderer — 图片渲染器
 *
 * 参考旧系统 ImageRenderWorker：
 * - 显示图片
 * - 支持边框、阴影、加载状态
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

    // 从 style 中提取属性
    const imageUrl = style.imageUrl as string | undefined
    const borderWidth = (style.borderWidth as number) || 0
    const borderColor = style.borderColor as string | undefined
    const borderPath = style.borderPath as string | undefined
    const staticBackgroundFillColor = style.staticBackgroundFillColor as string | undefined
    const visible = style.visible as boolean | undefined

    // 位置（考虑边框宽度）
    this.group.x = nodeLayout.x + borderWidth / 2
    this.group.y = nodeLayout.y + borderWidth / 2

    // 大小
    const { width, height } = nodeLayout
    this.image.set({ width, height })
    this.imageStaticBackground.set({ width, height })

    // 边框
    if (borderPath) {
      this.imageBorderPath.path = borderPath
    }
    if (borderWidth > 0) {
      this.imageBorderPath.strokeWidth = borderWidth
    }
    if (borderColor) {
      this.imageBorderPath.stroke = borderColor
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
