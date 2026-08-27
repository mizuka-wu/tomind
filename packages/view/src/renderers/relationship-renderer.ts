import { Group, Path, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'
import type { ControlPoint } from '@tomind/schema'
import { getStringStyle } from '../style-accessors'

const HOVER_COLOR = '#2563eb'
const HOVER_STROKE_WIDTH = 3
const ARROW_SIZE = 8
/** 默认拐点取起止点水平距离的 20%（终点高度） */
const DEFAULT_CTRL_RATIO = 0.2
const DEFAULT_STROKE = '#666'
const DEFAULT_STROKE_WIDTH = 2
const DEFAULT_FONT_SIZE = 12

/** 关系线形状类型（对齐 snowbrush RELATIONSHIPSHAPE 常量） */
type RelationshipShapeType =
  | 'org.xmind.relationshipShape.curved'
  | 'org.xmind.relationshipShape.angled'
  | 'org.xmind.relationshipShape.straight'
  | 'org.xmind.relationshipShape.zigzag'
  | 'org.xmind.relationshipShape.quad'

const VALID_SHAPE_CLASSES: readonly string[] = [
  'org.xmind.relationshipShape.curved',
  'org.xmind.relationshipShape.angled',
  'org.xmind.relationshipShape.straight',
  'org.xmind.relationshipShape.zigzag',
  'org.xmind.relationshipShape.quad',
]

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => isNumber(item))
}

function isRelationshipShapeType(value: string): value is RelationshipShapeType {
  return VALID_SHAPE_CLASSES.includes(value)
}

interface Point {
  x: number
  y: number
}

/** 向量归一化（可选缩放长度） */
function vecNormalize(p: Point, length = 1): Point {
  const mag = Math.sqrt(p.x * p.x + p.y * p.y)
  if (mag === 0) return { x: 0, y: 0 }
  return { x: (p.x / mag) * length, y: (p.y / mag) * length }
}

function vecSub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y }
}

function vecAdd(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y }
}

function vecReverse(p: Point): Point {
  return { x: -p.x, y: -p.y }
}

function pointDistance(a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * zigzag 形状的控制点归一化（对齐 snowbrush calcPathParams）
 * 将控制点对齐到轴方向，使路径呈直角转弯
 */
function normalizeZigzagControlPoints(
  sp: Point,
  tp: Point,
  scp: Point,
  tcp: Point,
): { scp: Point; tcp: Point } {
  const tcp1: Point = { x: tcp.x, y: tcp.y }
  const scp1: Point = { x: scp.x, y: scp.y }

  if (Math.abs(tcp1.x - tp.x) <= Math.abs(tcp1.y - tp.y)) {
    tcp1.x = tp.x
  } else {
    tcp1.y = tp.y
  }
  if (Math.abs(scp1.x - sp.x) <= Math.abs(scp1.y - sp.y)) {
    scp1.x = sp.x
  } else {
    scp1.y = sp.y
  }

  if (tcp1.x === tp.x) {
    if (scp1.x === sp.x) {
      tcp1.y = scp1.y = (scp1.y + tcp1.y) / 2
    } else if (scp1.y === sp.y) {
      tcp1.y = scp1.y = sp.y
      scp1.x = tp.x
    }
  } else if (tcp1.y === tp.y) {
    if (scp1.y === sp.y) {
      tcp1.x = scp1.x = (tcp1.x + scp1.x) / 2
    } else if (scp1.x === sp.x) {
      tcp1.x = scp1.x = sp.x
      scp1.y = tp.y
    }
  }

  return { scp: scp1, tcp: tcp1 }
}

/**
 * quad 形状的辅助控制点（对齐 snowbrush getQuadCurvedPoint）
 * 沿 sp→tp 方向在 scp 两侧偏移 distance/3
 */
function getQuadCurvedPoints(
  sp: Point,
  tp: Point,
  scp: Point,
): { c1: Point; c2: Point } {
  const direction = vecNormalize(vecSub(tp, sp))
  const directionR = vecReverse(direction)
  const distance = pointDistance(sp, tp)
  const c1 = vecAdd(scp, vecNormalize(directionR, distance / 3))
  const c2 = vecAdd(scp, vecNormalize(direction, distance / 3))
  return { c1, c2 }
}

/**
 * RelationshipRenderer — 关系线渲染器
 *
 * 支持 5 种关系线形状，对齐 snowbrush：
 * curved, angled, straight, zigzag, quad
 *
 * 通过 setEndpoints() 设置起止点与控制点，render() 渲染
 * shapeClass 由 style 传入，决定使用哪种形状
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

  /** 当前形状类型 */
  private currentShape: RelationshipShapeType = 'org.xmind.relationshipShape.curved'

  /** 终点切线方向（供箭头计算复用） */
  private endTangentX = 0
  private endTangentY = 0

  /** 曲线中点（供标题定位复用） */
  private midX = 0
  private midY = 0

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

    // 解析形状类型
    const shapeClass = getStringStyle(style, 'shapeClass')
    if (shapeClass !== undefined && isRelationshipShapeType(shapeClass)) {
      this.currentShape = shapeClass
    }

    // 根据形状类型计算路径、中点、终点切线
    const { pathData, midPoint, endTangent } = this.computeShapePath(this.currentShape)
    path.path = pathData
    this.midX = midPoint.x
    this.midY = midPoint.y
    this.endTangentX = endTangent.x
    this.endTangentY = endTangent.y

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
      titleText.x = this.midX
      titleText.y = this.midY - (titleText.fontSize ?? DEFAULT_FONT_SIZE) / 2
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

  // ==================== 形状路径分发 ====================

  /**
   * 根据形状类型计算路径数据、中点和终点切线方向
   */
  private computeShapePath(shape: RelationshipShapeType): {
    pathData: string
    midPoint: Point
    endTangent: Point
  } {
    switch (shape) {
      case 'org.xmind.relationshipShape.curved':
        return this.computeCurvedPath()
      case 'org.xmind.relationshipShape.angled':
        return this.computeAngledPath()
      case 'org.xmind.relationshipShape.straight':
        return this.computeStraightPath()
      case 'org.xmind.relationshipShape.zigzag':
        return this.computeZigzagPath()
      case 'org.xmind.relationshipShape.quad':
        return this.computeQuadPath()
    }
  }

  // ── 1. curved — 三次贝塞尔 ──
  private computeCurvedPath(): {
    pathData: string
    midPoint: Point
    endTangent: Point
  } {
    const sp = this.from
    const tp = this.to
    const { scp, tcp } = this.resolveTwoControlPoints()

    // M sp C scp tcp tp
    const pathData = `M ${sp.x} ${sp.y} C ${scp.x} ${scp.y} ${tcp.x} ${tcp.y} ${tp.x} ${tp.y}`

    // 三次贝塞尔 t=0.5 处的中点
    // B(t) = (1-t)^3·P0 + 3(1-t)^2·t·P1 + 3(1-t)·t^2·P2 + t^3·P3
    const t = 0.5
    const mt = 1 - t
    const midPoint: Point = {
      x: mt * mt * mt * sp.x + 3 * mt * mt * t * scp.x + 3 * mt * t * t * tcp.x + t * t * t * tp.x,
      y: mt * mt * mt * sp.y + 3 * mt * mt * t * scp.y + 3 * mt * t * t * tcp.y + t * t * t * tp.y,
    }

    // 终点切线方向：tcp → tp
    const endTangent: Point = { x: tp.x - tcp.x, y: tp.y - tcp.y }

    return { pathData, midPoint, endTangent }
  }

  // ── 2. angled — 折线 ──
  private computeAngledPath(): {
    pathData: string
    midPoint: Point
    endTangent: Point
  } {
    const sp = this.from
    const tp = this.to
    const { scp, tcp } = this.resolveTwoControlPoints()

    // M sp L scp L tcp L tp
    const pathData = `M ${sp.x} ${sp.y} L ${scp.x} ${scp.y} L ${tcp.x} ${tcp.y} L ${tp.x} ${tp.y}`

    // 中点取 tcp→tp 段的中点
    const midPoint: Point = {
      x: (tcp.x + tp.x) / 2,
      y: (tcp.y + tp.y) / 2,
    }

    // 终点切线方向：tcp → tp
    const endTangent: Point = { x: tp.x - tcp.x, y: tp.y - tcp.y }

    return { pathData, midPoint, endTangent }
  }

  // ── 3. straight — 直线 ──
  private computeStraightPath(): {
    pathData: string
    midPoint: Point
    endTangent: Point
  } {
    const sp = this.from
    const tp = this.to

    // M sp L tp
    const pathData = `M ${sp.x} ${sp.y} L ${tp.x} ${tp.y}`

    const midPoint: Point = {
      x: (sp.x + tp.x) / 2,
      y: (sp.y + tp.y) / 2,
    }

    // 终点切线方向：sp → tp
    const endTangent: Point = { x: tp.x - sp.x, y: tp.y - sp.y }

    return { pathData, midPoint, endTangent }
  }

  // ── 4. zigzag — 直角折线 ──
  private computeZigzagPath(): {
    pathData: string
    midPoint: Point
    endTangent: Point
  } {
    const sp = this.from
    const tp = this.to
    const { scp: rawScp, tcp: rawTcp } = this.resolveTwoControlPoints()

    // 归一化控制点为轴对齐（对齐 snowbrush calcPathParams）
    const { scp, tcp } = normalizeZigzagControlPoints(sp, tp, rawScp, rawTcp)

    // M sp L scp L tcp L tp
    const pathData = `M ${sp.x} ${sp.y} L ${scp.x} ${scp.y} L ${tcp.x} ${tcp.y} L ${tp.x} ${tp.y}`

    // 中点取 scp→tcp 段的中点（路径中间的直角转弯处附近）
    const midPoint: Point = {
      x: (scp.x + tcp.x) / 2,
      y: (scp.y + tcp.y) / 2,
    }

    // 终点切线方向：tcp → tp
    const endTangent: Point = { x: tp.x - tcp.x, y: tp.y - tcp.y }

    return { pathData, midPoint, endTangent }
  }

  // ── 5. quad — 双三次贝塞尔（对齐 snowbrush getQuadCurvedPoint） ──
  private computeQuadPath(): {
    pathData: string
    midPoint: Point
    endTangent: Point
  } {
    const sp = this.from
    const tp = this.to
    const { scp } = this.resolveTwoControlPoints()

    const { c1, c2 } = getQuadCurvedPoints(sp, tp, scp)

    // 对齐 snowbrush：两段三次贝塞尔在 scp 处汇合
    // M sp C sp c1 scp   （从 sp 到 scp，控制点 sp 和 c1）
    // C c2 tp tp          （从 scp 到 tp，控制点 c2 和 tp）
    const pathData = `M ${sp.x} ${sp.y} C ${sp.x} ${sp.y} ${c1.x} ${c1.y} ${scp.x} ${scp.y} C ${c2.x} ${c2.y} ${tp.x} ${tp.y} ${tp.x} ${tp.y}`

    // 中点取 scp（两段曲线的汇合点）
    const midPoint: Point = { x: scp.x, y: scp.y }

    // 终点切线方向：c2 → tp（第二段曲线末端切线近似方向）
    const endTangent: Point = { x: tp.x - c2.x, y: tp.y - c2.y }

    return { pathData, midPoint, endTangent }
  }

  // ==================== 控制点解析 ====================

  /**
   * 解析两个控制点（scp, tcp）
   * 优先使用外部传入的控制点，否则生成默认值
   */
  private resolveTwoControlPoints(): { scp: Point; tcp: Point } {
    const sp = this.from
    const tp = this.to

    let scp: Point
    let tcp: Point

    if (this.controlPoints.length >= 2) {
      scp = this.controlPoints[0]
      tcp = this.controlPoints[1]
    } else if (this.controlPoints.length === 1) {
      scp = this.controlPoints[0]
      // 默认 tcp 在 scp 和 tp 的中间
      tcp = {
        x: (scp.x + tp.x) / 2,
        y: (scp.y + tp.y) / 2,
      }
    } else {
      // 默认 scp：起止点水平方向 20% 处
      scp = {
        x: sp.x + (tp.x - sp.x) * DEFAULT_CTRL_RATIO,
        y: tp.y,
      }
      // 默认 tcp：起止点水平方向 80% 处
      tcp = {
        x: sp.x + (tp.x - sp.x) * (1 - DEFAULT_CTRL_RATIO),
        y: tp.y,
      }
    }

    return { scp, tcp }
  }

  /**
   * 计算三角形箭头路径（尖端位于终点）
   * 方向取曲线末端切线
   */
  private calculateArrowPath(): string {
    const x = this.to.x
    const y = this.to.y

    const angle = Math.atan2(this.endTangentY, this.endTangentX)
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
