import { Group, Rect, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * LabelsRenderer — 标签列表渲染器
 * 
 * 负责渲染多个标签（背景 + 文本）
 */
export class LabelsRenderer implements Renderer {
  private group: Group | null = null
  private labels = new Map<string, { bg: Rect; text: Text }>()

  create(parent: Group): void {
    this.group = new Group()
    parent.add(this.group)
  }

  render(_layout: LayoutResult, _style: Record<string, unknown>): void {
    // LabelsRenderer 的渲染由 updateLabels 驱动
  }

  /**
   * 更新标签列表
   */
  updateLabels(labels: Array<{ id: string; text: string; color?: string }>): void {
    if (!this.group) return

    // 移除不在新列表中的 label
    for (const [id, label] of this.labels) {
      if (!labels.find(l => l.id === id)) {
        label.bg.destroy()
        label.text.destroy()
        this.labels.delete(id)
      }
    }

    // 添加/更新 label
    let offsetX = 0
    for (const labelData of labels) {
      let label = this.labels.get(labelData.id)
      if (!label) {
        // 创建标签背景
        const bg = new Rect({
          fill: labelData.color ?? '#E3F2FD',
          cornerRadius: 8,
          padding: [2, 8],
          x: offsetX,
        })
        this.group.add(bg)

        // 创建标签文本
        const text = new Text({
          text: labelData.text,
          fontSize: 12,
          fill: '#333',
          x: offsetX + 8,
        })
        this.group.add(text)

        label = { bg, text }
        this.labels.set(labelData.id, label)
      } else {
        // 更新现有标签
        label.text.text = labelData.text
        if (labelData.color) {
          label.bg.fill = labelData.color
        }
        label.bg.x = offsetX
        label.text.x = offsetX + 8
      }

      // 计算下一个标签的偏移
      offsetX += (label.text.width ?? 0) + 20
    }
  }

  destroy(): void {
    for (const label of this.labels.values()) {
      label.bg.destroy()
      label.text.destroy()
    }
    this.labels.clear()

    if (this.group) {
      this.group.destroy()
      this.group = null
    }
  }
}
