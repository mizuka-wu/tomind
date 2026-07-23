import { Group } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'
import { MarkerRenderer } from './components/marker-renderer'

/**
 * MarkersRenderer — 标记列表渲染器
 * 
 * 负责管理多个 MarkerRenderer
 */
export class MarkersRenderer implements Renderer {
  private group: Group | null = null
  private markers = new Map<string, MarkerRenderer>()

  create(parent: Group): void {
    this.group = new Group()
    parent.add(this.group)
  }

  render(_layout: LayoutResult, _style: Record<string, unknown>): void {
    // MarkersRenderer 的渲染由 updateMarkers 驱动
  }

  /**
   * 更新标记列表
   */
  updateMarkers(markers: Array<{ id: string; icon?: string; color?: string; selected?: boolean }>): void {
    if (!this.group) return

    // 移除不在新列表中的 marker
    for (const [id, marker] of this.markers) {
      if (!markers.find(m => m.id === id)) {
        marker.destroy()
        this.markers.delete(id)
      }
    }

    // 添加/更新 marker
    let offsetX = 0
    for (const markerData of markers) {
      let marker = this.markers.get(markerData.id)
      if (!marker) {
        marker = new MarkerRenderer()
        marker.create(this.group)
        this.markers.set(markerData.id, marker)
      }

      marker.render({
        iconUrl: markerData.icon,
        size: 16,
        selected: markerData.selected,
        visible: true,
      })

      // 设置位置（LeaferJS 坐标系：x 水平，y 垂直）
      marker.setPosition(offsetX, 0)
      offsetX += 20
    }
  }

  destroy(): void {
    for (const marker of this.markers.values()) {
      marker.destroy()
    }
    this.markers.clear()

    if (this.group) {
      this.group.destroy()
      this.group = null
    }
  }
}
