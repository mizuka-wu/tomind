import { Group, Path } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * ConnectionRenderer — 连接线渲染器
 * 
 * 负责渲染父子节点之间的连接线
 * 支持直线、曲线、折线等样式
 */
export class ConnectionRenderer implements Renderer {
  private group: Group | null = null
  private path: Path | null = null

  /** 起止点坐标（由外部设置） */
  private start = { x: 0, y: 0 }
  private end = { x: 0, y: 0 }

  create(parent: Group): void {
    this.group = new Group()
    this.path = new Path({
      path: '',
      stroke: '#999',
      strokeWidth: 1,
    })
    this.group.add(this.path)
    parent.add(this.group)
  }

  /**
   * 设置起止点
   */
  setEndpoints(start: { x: number; y: number }, end: { x: number; y: number }): void {
    this.start = start
    this.end = end
  }

  render(_layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.path) return

    // 更新样式
    const lineColor = style.lineColor ?? style.stroke ?? '#999999'
    if (typeof lineColor === 'string') this.path.stroke = lineColor

    const strokeWidth = style.lineStrokeWidth ?? style.strokeWidth
    if (typeof strokeWidth === 'number') this.path.strokeWidth = strokeWidth

    const strokeDash = style.strokeDash ?? style.dashPattern
    if (Array.isArray(strokeDash) && strokeDash.length > 0) {
      this.path.dashPattern = strokeDash
    }

    // 计算连接线路径
    // 默认使用简单直线，后续可以扩展为曲线/折线
    const d = `M ${this.start.x} ${this.start.y} L ${this.end.x} ${this.end.y}`
    this.path.path = d
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.path = null
  }
}
