import { Group, Path, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'
import type { ControlPoint } from '@tomind/schema'

const HOVER_COLOR = '#2563eb'
const HOVER_STROKE_WIDTH = 3
const ARROW_SIZE = 8
/** 默认拐点取起止点水平距离的 20%（终点高度） */
const DEFAULT_CTRL_RATIO = 0.2
const DEFAULT_STROKE = '#666'
const DEFAULT_STROKE_WIDTH = 2
const DEFAULT_FONT_SIZE = 12

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => isNumber(item))
}

/**
 * RelationshipRenderer — 关系线渲染器
 *
 * 负责渲染贝塞尔曲线（M→L→Q）+ 可选箭头 + 可选标题
 * 通过 setEndpoints() 设置起止点与控制点，render() 渲染
 */
export class RelationshipRenderer implements Renderer {
  private group: Group | null = null
  private path: Path | null = null
  private arrow: Path | null = null
  private titleText: Text | null = null

  /** 起止点坐标（由 setEndpoints 设置） */
  private from = { x: 0, y: 0 }
  private to = { x: 0, y: 0 }

  /** 贝塞尔控制点（可选） */
  private controlPoints: readonly ControlPoint[] = []

  private title = ''

  /** 二次贝塞尔 Q 控制点（由曲线计算得出，供箭头/标题复用） */
  private qCtrlX = 0
  private qCtrlY = 0

  private isHovered = false
  private baseStroke: string | undefined
  private baseStrokeWidth = DEFAULT_STROKE_WIDTH

  constructor(_nodeId: string) {}

  create(parent: Group): void {
    this.group = new Group({ name: 'relationship-group' })

    // 曲线路径
    this.path = new Path({
      name: 'relationship-path',
      path: '',
      stroke: DEFAULT_STROKE,
      strokeWidth: DEFAULT_STROKE_WIDTH,
      strokeLinecap: 'round',
    })
    this.group.add(this.path)

    // 箭头（可选）
    this.arrow = new Path({
      name: 'relationship-arrow',
      path: '',
      fill: DEFAULT_STROKE,
      visible: false,
    })
    this.group.add(this.arrow)

    // 标题文本（可选）
    this.titleText = new Text({
      name: 'relationship-title',
      text: '',
      fontSize: DEFAULT_FONT_SIZE,
      fill: DEFAULT_STROKE,
      textAlign: 'center',
      visible: false,
    })
    this.group.add(this.titleText)

    parent.add(this.group)
  }

  /**
   * 设置起止点和控制点
   */
  setEndpoints(
    from: { x: number; y: number },
    to: { x: number; y: number },
    controlPoints?: ReadonlyArray<{ x: number; y: number }>,
    title?: string,
  ): void {
    this.from = from
    this.to = to
    this.controlPoints = controlPoints ?? []
    this.title = title ?? ''
  }

  /**
   * 设置悬停高亮状态（由 ViewDesc 的 pointerenter/pointerleave 触发）
   */
  setHovered(hovered: boolean): void {
    this.isHovered = hovered
    if (!this.path) return

    if (hovered) {
      // 首次进入时记录基础样式，用于恢复
      if (this.baseStroke === undefined) {
        this.baseStroke = isString(this.path.stroke) ? this.path.stroke : DEFAULT_STROKE
        this.baseStrokeWidth = isNumber(this.path.strokeWidth) ? this.path.strokeWidth : DEFAULT_STROKE_WIDTH
      }
      this.path.stroke = HOVER_COLOR
      this.path.strokeWidth = HOVER_STROKE_WIDTH
    } else if (this.baseStroke !== undefined) {
      this.path.stroke = this.baseStroke
      this.path.strokeWidth = this.baseStrokeWidth
    }
  }

  render(_layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.path || !this.arrow || !this.titleText || !this.group) {
      return
    }

    const path = this.path
    const arrow = this.arrow
    const titleText = this.titleText
    const group = this.group

    group.visible = true

    const lineColor = isString(style.lineColor) ? style.lineColor : DEFAULT_STROKE
    const strokeWidth = isNumber(style.strokeWidth) ? style.strokeWidth : DEFAULT_STROKE_WIDTH
    path.stroke = lineColor
    path.strokeWidth = strokeWidth

    // linePattern 经 StyleEngine 转为 strokeDash 数组（null 表示实线）
    const strokeDash = isNumberArray(style.strokeDash) ? style.strokeDash : undefined
    path.dashPattern = strokeDash !== undefined && strokeDash.length > 0 ? strokeDash : undefined

    path.path = this.computeCurvePath()

    if (style.arrowEndClass === 'triangle') {
      arrow.visible = true
      arrow.fill = lineColor
      arrow.path = this.calculateArrowPath()
    } else {
      arrow.visible = false
    }

    if (this.title) {
      titleText.text = this.title
      titleText.visible = true
      const { midX, midY } = this.computeCurveMidPoint()
      titleText.x = midX
      titleText.y = midY - (titleText.fontSize ?? DEFAULT_FONT_SIZE) / 2
    } else {
      titleText.visible = false
    }

    // render 重置基础样式后，若仍处于悬停则恢复高亮
    if (this.isHovered) {
      this.baseStroke = lineColor
      this.baseStrokeWidth = strokeWidth
      this.setHovered(true)
    }
  }

  /**
   * 计算贝塞尔曲线路径
   *
   * M 起点 → L 拐点 → Q 终点（参考 snowbrush curveHorizon）：
   * `M ${sx} ${sy} L ${ctrlX} ${ctrlY} Q ${qCtrlX} ${qCtrlY} ${ex} ${ey}`
   */
  private computeCurvePath(): string {
    const sx = this.from.x
    const sy = this.from.y
    const ex = this.to.x
    const ey = this.to.y

    const { ctrlX, ctrlY } = this.resolveCtrlPoint()

    // Q 控制点位于拐点到终点方向的 1/5 处（终点高度）
    this.qCtrlX = ctrlX + (ex - ctrlX) / 5
    this.qCtrlY = ey

    return `M ${sx} ${sy} L ${ctrlX} ${ctrlY} Q ${this.qCtrlX} ${this.qCtrlY} ${ex} ${ey}`
  }

  /**
   * 计算曲线中点（二次贝塞尔 t=0.5 处）
   * B(0.5) = 0.25·P0 + 0.5·P1 + 0.25·P2
   */
  private computeCurveMidPoint(): { midX: number; midY: number } {
    const sx = this.from.x
    const sy = this.from.y
    const ex = this.to.x
    const ey = this.to.y

    const { ctrlX, ctrlY } = this.resolveCtrlPoint()

    return {
      midX: (sx + 2 * ctrlX + ex) / 4,
      midY: (sy + 2 * ctrlY + ey) / 4,
    }
  }

  /** 优先使用外部传入的控制点，否则取起止点水平方向 20% 处（终点高度） */
  private resolveCtrlPoint(): { ctrlX: number; ctrlY: number } {
    const sx = this.from.x
    const sy = this.from.y
    const ex = this.to.x
    const ey = this.to.y

    if (this.controlPoints.length > 0) {
      return { ctrlX: this.controlPoints[0].x, ctrlY: this.controlPoints[0].y }
    }
    return {
      ctrlX: sx + (ex - sx) * DEFAULT_CTRL_RATIO,
      ctrlY: ey,
    }
  }

  /**
   * 计算三角形箭头路径（尖端位于终点）
   * 方向取曲线末端切线（终点 → Q 控制点的反方向）
   */
  private calculateArrowPath(): string {
    const x = this.to.x
    const y = this.to.y

    const angle = Math.atan2(y - this.qCtrlY, x - this.qCtrlX)
    const p1x = x - ARROW_SIZE * Math.cos(angle - Math.PI / 6)
    const p1y = y - ARROW_SIZE * Math.sin(angle - Math.PI / 6)
    const p2x = x - ARROW_SIZE * Math.cos(angle + Math.PI / 6)
    const p2y = y - ARROW_SIZE * Math.sin(angle + Math.PI / 6)

    return `M ${x} ${y} L ${p1x} ${p1y} L ${p2x} ${p2y} Z`
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.path = null
    this.arrow = null
    this.titleText = null
  }
}
