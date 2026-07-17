import { Group, Path, Ellipse, Image } from 'leafer-ui'

/**
 * MarkerRenderer — 单个标记渲染器
 * 
 * 负责渲染：选择框 + 图标 + 边框
 */
export class MarkerRenderer {
  private group: Group | null = null
  private selectPath: Path | null = null
  private iconImage: Image | null = null
  private borderEllipse: Ellipse | null = null

  create(parent: Group): void {
    this.group = new Group()

    this.selectPath = new Path()
    this.group.add(this.selectPath)

    this.iconImage = new Image()
    this.group.add(this.iconImage)

    this.borderEllipse = new Ellipse({ fill: 'none', stroke: '#fff' })
    this.group.add(this.borderEllipse)

    parent.add(this.group)
  }

  render(data: { iconUrl?: string; size?: number; selected?: boolean; visible?: boolean }): void {
    if (!this.group || !this.iconImage || !this.borderEllipse || !this.selectPath) return

    const { iconUrl, size = 16, selected = false, visible = true } = data

    // 更新可见性
    this.group.visible = visible

    // 更新图标
    if (iconUrl) {
      this.iconImage.url = iconUrl
    }
    this.iconImage.width = size
    this.iconImage.height = size

    // 更新边框
    this.borderEllipse.set({
      width: size + 1,
      height: size + 1,
      x: size / 2,
      y: size / 2,
      strokeWidth: size / 12,
    })

    // 更新选择状态
    if (selected) {
      this.selectPath.stroke = '#2196F3'
      this.selectPath.strokeWidth = 2
    } else {
      this.selectPath.stroke = 'transparent'
    }
  }

  /**
   * 调整层级
   */
  bringForward(): void {
    if (this.group) {
      this.group.zIndex = (this.group.zIndex ?? 0) + 1
    }
  }

  bringBackward(): void {
    if (this.group) {
      this.group.zIndex = (this.group.zIndex ?? 0) - 1
    }
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.selectPath = null
    this.iconImage = null
    this.borderEllipse = null
  }
}
