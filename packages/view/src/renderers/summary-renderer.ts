import { Group, Path, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import { getStringStyle, getNumberStyle } from '../style-accessors'
import type { Renderer } from './renderer'

/** 摘要线连接样式类型 */
type SummaryLineShape =
  | 'curly'
  | 'angle'
  | 'square'
  | 'round'
  | 'bracket'
  | 'sharp'
  | 'fold'
  | 'straight'

const VALID_SHAPES: ReadonlySet<string> = new Set<SummaryLineShape>([
  'curly', 'angle', 'square', 'round', 'bracket', 'sharp', 'fold', 'straight',
])

function isSummaryLineShape(value: string): value is SummaryLineShape {
  return VALID_SHAPES.has(value)
}

/** 摘要线与范围子节点的间距 */
const SUMMARY_PADDING = 10

/** 括号曲线偏移量 */
const BRACKET_OFFSET = 8

/**
 * SummaryRenderer — 摘要线渲染器
 *
 * 负责渲染括号线 + 可选标题
 * 通过 setBounds() 设置摘要范围，render() 渲染
 */
export class SummaryRenderer implements Renderer {
  private group: Group | null = null
  private bracketPath: Path | null = null
  private titleText: Text | null = null

  /** 摘要范围（由 setBounds 设置） */
  private bounds = { x: 0, y: 0, width: 0, height: 0 }
  private title = ''
  private currentShape: SummaryLineShape = 'curly'

  constructor(_nodeId: string) {

  }

  create(parent: Group): void {
    this.group = new Group()

    // 括号线路径
    this.bracketPath = new Path({
      fill: 'transparent',
      stroke: '#9C27B0',
      strokeWidth: 2,
    })
    this.group.add(this.bracketPath)

    // 摘要标题（可选）
    this.titleText = new Text({
      text: '',
      fontSize: 12,
      fill: '#9C27B0',
      visible: false,
    })
    this.group.add(this.titleText)

    parent.add(this.group)
  }

  /**
   * 设置摘要范围
   */
  setBounds(
    bounds: { x: number; y: number; width: number; height: number },
    title?: string,
  ): void {
    this.bounds = bounds
    this.title = title ?? ''
  }

  render(_layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.bracketPath || !this.titleText || !this.group) {
      return
    }

    const { x, y, height } = this.bounds
    if (height === 0) {
      this.group.visible = false
      return
    }

    this.group.visible = true
    this.group.x = x
    this.group.y = y

    // 解析 shapeClass
    const shapeClass = getStringStyle(style, 'shapeClass')
    if (shapeClass && isSummaryLineShape(shapeClass)) {
      this.currentShape = shapeClass
    }

    // 生成括号路径
    const pathData = buildBracketPath(this.currentShape, height)
    this.bracketPath.path = pathData

    // 应用样式
    const _stroke = getStringStyle(style, 'stroke')
    if (_stroke) this.bracketPath.stroke = _stroke
    const _strokeWidth = getNumberStyle(style, 'strokeWidth')
    if (_strokeWidth) this.bracketPath.strokeWidth = _strokeWidth

    // 更新标题
    if (this.title) {
      this.titleText.text = this.title
      this.titleText.visible = true
      this.titleText.x = 8
      this.titleText.y = height / 2 - 6
    } else {
      this.titleText.visible = false
    }
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.bracketPath = null
    this.titleText = null
  }
}

// ==================== Bracket Path Builders ====================

interface Point {
  x: number
  y: number
}

/**
 * 计算括号线的三个关键点（在 group 局部坐标系中）
 *
 * - startPos: 范围顶部边缘
 * - endPos:   范围底部边缘
 * - middlePos: 摘要节点连接点
 */
function computeBracketPoints(height: number): { startPos: Point; middlePos: Point; endPos: Point } {
  return {
    startPos: { x: 0, y: 0 },
    middlePos: { x: SUMMARY_PADDING, y: height / 2 },
    endPos: { x: 0, y: height },
  }
}

/**
 * 根据样式类型生成括号路径
 */
function buildBracketPath(shape: SummaryLineShape, height: number): string {
  const { startPos, middlePos, endPos } = computeBracketPoints(height)

  switch (shape) {
    case 'angle':
      return buildAnglePath(startPos, middlePos, endPos)
    case 'curly':
    case 'sharp':
      return buildCurlyPath(startPos, middlePos, endPos, BRACKET_OFFSET)
    case 'square':
      return buildSquarePath(startPos, middlePos, endPos)
    case 'round':
      return buildRoundPath(startPos, middlePos, endPos)
    case 'bracket':
      return buildBracketStylePath(startPos, middlePos, endPos)
    case 'fold':
      return buildFoldPath(startPos, middlePos, endPos)
    case 'straight':
      return buildStraightPath(startPos, middlePos, endPos)
    default:
      return buildCurlyPath(startPos, middlePos, endPos, BRACKET_OFFSET)
  }
}

/** angle — 简单 V 形 */
function buildAnglePath(startPos: Point, middlePos: Point, endPos: Point): string {
  return `M ${startPos.x} ${startPos.y} L ${middlePos.x} ${middlePos.y} L ${endPos.x} ${endPos.y}`
}

/**
 * curly — 二次贝塞尔曲线括号
 *
 * 参考 snowbrush routeCurlyLine，垂直布局：
 * 从 middlePos 分别向 startPos 和 endPos 绘制带曲率的括号线
 */
function buildCurlyPath(startPos: Point, middlePos: Point, endPos: Point, lineWidth: number): string {
  return routeCurlyLine(middlePos, startPos, lineWidth) + routeCurlyLine(middlePos, endPos, lineWidth)
}

/**
 * curly 单侧曲线（垂直布局）
 *
 * 参考 snowbrush summarylinestyle.ts 中 routeCurlyLine 的 !isHorizontal 分支
 */
function routeCurlyLine(sp: Point, tp: Point, w: number): string {
  const H = 0.3
  // sp = source (middlePos), tp = target (startPos or endPos)
  const sy1 = sp.y < tp.y ? sp.y - H : sp.y + H
  const sy2 = sp.y < tp.y ? sp.y + H : sp.y - H
  const ty1 = tp.y < sp.y ? tp.y + H : tp.y - H
  const ty2 = tp.y < sp.y ? tp.y - H : tp.y + H
  const cx = (sp.x + tp.x) / 2
  const cy = (sp.y + tp.y) / 2
  const cx1 = cx < tp.x ? cx + w / 2 : cx - w / 2
  const cx2 = cx < tp.x ? cx - w / 2 : cx + w / 2
  const scx1 = tp.x
  const scx2 = scx1 < sp.x ? scx1 + w : scx1 - w
  const tcx2 = sp.x
  const tcx1 = tcx2 < tp.x ? tcx2 + w : tcx2 - w

  return (
    `M ${sp.x} ${sy1}` +
    `Q ${scx1} ${sy1}, ${cx1} ${cy}` +
    `Q ${tcx1} ${ty1}, ${tp.x} ${ty1}` +
    `L ${tp.x} ${ty2}` +
    `Q ${tcx2} ${ty2}, ${cx2} ${cy}` +
    `Q ${scx2} ${sy2}, ${sp.x} ${sy2}` +
    `L ${sp.x} ${sy1}`
  )
}

/**
 * square — 直角括号
 *
 * 参考 snowbrush 的 !isHorizontal 分支：
 * startPos → 水平右移到 referenceX/2 → 垂直到 middlePos.y → 水平到 middlePos
 * 中间段 → 垂直到 endPos.y → 水平到 endPos
 */
function buildSquarePath(startPos: Point, middlePos: Point, endPos: Point): string {
  const midX = startPos.x + SUMMARY_PADDING / 2
  return (
    `M ${startPos.x} ${startPos.y}` +
    `L ${midX} ${startPos.y}` +
    `L ${midX} ${middlePos.y}` +
    `L ${middlePos.x} ${middlePos.y}` +
    `M ${midX} ${middlePos.y}` +
    `L ${midX} ${endPos.y}` +
    `L ${endPos.x} ${endPos.y}`
  )
}

/**
 * round — SVG 弧形括号
 *
 * 参考 snowbrush 的 !isHorizontal 分支：
 * 用圆弧连接 startPos 和 endPos，然后从弧中点向 middlePos 画水平连接线
 */
function buildRoundPath(startPos: Point, middlePos: Point, endPos: Point): string {
  const rx = (SUMMARY_PADDING / 3) * 2
  const ry = (endPos.y - startPos.y) / 2
  const arcMidX = startPos.x + (SUMMARY_PADDING / 3) * 2
  return (
    `M ${startPos.x} ${startPos.y}` +
    `A ${rx} ${ry} 0 1 1 ${endPos.x} ${endPos.y}` +
    `M ${arcMidX} ${middlePos.y}` +
    `L ${middlePos.x} ${middlePos.y}`
  )
}

/**
 * bracket — 圆角括号
 *
 * 参考 snowbrush createCurveVer：
 * 从 begin 到 end 画带圆角的 U 形路径
 */
function buildBracketStylePath(startPos: Point, middlePos: Point, endPos: Point): string {
  return createCurveVer(middlePos, startPos) + createCurveVer(middlePos, endPos)
}

/**
 * 垂直方向的圆角曲线（参考 snowbrush bracket 的 createCurveVer）
 *
 * 从 begin 到 end，沿中轴线走圆角路径
 */
function createCurveVer(begin: Point, end: Point): string {
  const hor = end.x > begin.x ? 1 : -1
  const ver = end.y > begin.y ? 1 : -1
  const cx = (begin.x + end.x) / 2
  const dx = end.x - begin.x
  const dy = end.y - begin.y
  const corner = Math.min(Math.abs(dx) / 2, Math.abs(dy) / 4)

  return (
    `M ${begin.x} ${begin.y}` +
    `L ${cx - hor * corner} ${begin.y}` +
    `Q ${cx} ${begin.y}, ${cx} ${begin.y + ver * corner}` +
    `L ${cx} ${end.y - ver * corner}` +
    `Q ${cx} ${end.y}, ${cx + hor * corner} ${end.y}` +
    `L ${end.x} ${end.y}`
  )
}

/**
 * fold — 折线括号
 *
 * 参考 snowbrush createCurveVer（fold 版本）：
 * 从 begin 到 end，先走折角再走竖线
 */
function buildFoldPath(startPos: Point, middlePos: Point, endPos: Point): string {
  const partsStart = createFoldVer(middlePos, startPos, true)
  const partsEnd = createFoldVer(middlePos, endPos, false)
  return partsStart.concat(partsEnd).join('')
}

/**
 * 垂直方向的折线（参考 snowbrush fold 的 createCurveVer）
 */
function createFoldVer(begin: Point, end: Point, reverse: boolean): string[] {
  const ver = end.y > begin.y ? 1 : -1
  const dx = end.x - begin.x
  const dy = end.y - begin.y
  const cx = dx / 1.8 + begin.x
  const corner = Math.min(Math.abs(dx) / 2, Math.abs(dy) / 4)

  const ret = [
    `L ${begin.x} ${begin.y}`,
    `L ${cx} ${begin.y + (ver * corner) / 1.5}`,
    `L ${cx} ${end.y - (ver * corner) / 2}`,
    `${reverse ? 'M' : 'L'} ${end.x} ${end.y}`,
  ]

  if (reverse) {
    return ret.reverse()
  }
  return ret
}

/**
 * straight — 直线括号
 *
 * 参考 snowbrush 的 !isHorizontal 分支：
 * 垂直线位于参考偏移的一半处 + 从该线向 middlePos 的水平连接线
 */
function buildStraightPath(startPos: Point, middlePos: Point, endPos: Point): string {
  const lineX = startPos.x + SUMMARY_PADDING / 2
  return (
    `M ${lineX} ${startPos.y}` +
    `L ${lineX} ${endPos.y}` +
    `M ${lineX} ${middlePos.y}` +
    `L ${middlePos.x} ${middlePos.y}`
  )
}
