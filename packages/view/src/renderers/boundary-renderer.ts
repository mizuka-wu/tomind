import { Group, Path, Text } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import { getStringStyle, getNumberStyle, getObjectStyle } from '../style-accessors'
import type { Renderer } from './renderer'

/** 边界形状类型 */
type BoundaryShapeType =
  | 'rect'
  | 'roundedRect'
  | 'scallops'
  | 'waves'
  | 'tension'
  | 'polygon'
  | 'roundedPolygon'
  | 'newBoundary1'
  | 'newBoundary2'
  | 'newBoundary3'
  | 'focus'
  | 'cross'

/** 圆角半径常量（对齐 snowbrush corner = 14） */
const CORNER_RADIUS = 14

/** 边界间距常量（对齐 snowbrush BOUNDARYGAP） */
const BOUNDARY_GAP = 10

/** cross 形状延伸长度（对齐 snowbrush CROSSBOUNDARYLEN） */
const CROSS_BOUNDARY_LEN = 30

/**
 * BoundaryRenderer — 边界框渲染器
 *
 * 支持 13 种边界形状，对齐 snowbrush：
 * rect, roundedRect, scallops, waves, tension, polygon, roundedPolygon,
 * newBoundary1, newBoundary2, newBoundary3, focus, cross
 *
 * 通过 setBounds() 设置边界范围，render() 渲染
 * shapeClass 由 style 传入，决定使用哪种形状
 */
export class BoundaryRenderer implements Renderer {
  private group: Group | null = null
  private shapePath: Path | null = null
  private titleText: Text | null = null

  /** 获取形状路径（供外部读取样式状态） */
  getShapePath(): Path | null { return this.shapePath }

  /** 边界范围（由 setBounds 设置） */
  private bounds = { x: 0, y: 0, width: 0, height: 0 }
  private title = ''
  private currentShape: BoundaryShapeType = 'roundedRect'

  constructor(_nodeId: string) {}

  create(parent: Group): void {
    this.group = new Group()

    // 边界形状路径
    this.shapePath = new Path({
      fill: 'transparent',
      stroke: '#FF9800',
      strokeWidth: 1,
      dashPattern: [4, 4],
    })
    this.group.add(this.shapePath)

    // 边界标题（可选）
    this.titleText = new Text({
      text: '',
      fontSize: 12,
      fill: '#FF9800',
      visible: false,
    })
    this.group.add(this.titleText)

    parent.add(this.group)
  }

  /**
   * 设置边界范围
   */
  setBounds(
    bounds: { x: number; y: number; width: number; height: number },
    title?: string,
  ): void {
    this.bounds = bounds
    this.title = title ?? ''
  }

  render(_layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.shapePath || !this.titleText || !this.group) {
      return
    }

    const { x, y, width, height } = this.bounds
    if (width === 0 && height === 0) {
      this.group.visible = false
      return
    }

    this.group.visible = true
    this.group.x = x
    this.group.y = y

    // 解析形状类型
    const shapeClass = style.shapeClass
    if (typeof shapeClass === 'string' && this.isBoundaryShape(shapeClass)) {
      this.currentShape = shapeClass
    }

    // 生成路径
    const pathData = this.buildPath(this.currentShape, width, height)
    this.shapePath.path = pathData

    // 对于 focus 和 cross，需要设置裁剪区域作为填充区域
    if (this.currentShape === 'focus' || this.currentShape === 'cross') {
      this.shapePath.windingRule = 'nonzero'
    }

    // 应用样式
    const _lineColor = getStringStyle(style, 'lineColor')
    if (_lineColor) this.shapePath.stroke = _lineColor
    const _stroke = getStringStyle(style, 'stroke')
    if (_stroke) this.shapePath.stroke = _stroke
    const _strokeWidth = getNumberStyle(style, 'strokeWidth')
    if (_strokeWidth) this.shapePath.strokeWidth = _strokeWidth
    const _lineWidth = getNumberStyle(style, 'lineWidth')
    if (_lineWidth) this.shapePath.strokeWidth = _lineWidth
    const _fill = getStringStyle(style, 'fill')
    if (_fill) this.shapePath.fill = _fill
    const _fillColor = getStringStyle(style, 'fillColor')
    if (_fillColor && _fillColor !== 'none') {
      this.shapePath.fill = _fillColor
    }
    const _dashPattern = getObjectStyle<number[]>(style, 'dashPattern')
    if (_dashPattern) this.shapePath.dashPattern = _dashPattern
    const _lineDash = getObjectStyle<number[]>(style, 'lineDash')
    if (_lineDash) this.shapePath.dashPattern = _lineDash
    const _opacity = getNumberStyle(style, 'opacity')
    if (_opacity !== undefined) this.shapePath.opacity = _opacity

    // 更新标题
    if (this.title) {
      this.titleText.text = this.title
      this.titleText.visible = true
      this.titleText.x = 0
      this.titleText.y = -16
    } else {
      this.titleText.visible = false
    }
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.shapePath = null
    this.titleText = null
  }

  // ==================== 内部方法 ====================

  private isBoundaryShape(value: string): value is BoundaryShapeType {
    return [
      'rect', 'roundedRect', 'scallops', 'waves', 'tension',
      'polygon', 'roundedPolygon', 'newBoundary1', 'newBoundary2',
      'newBoundary3', 'focus', 'cross',
    ].includes(value)
  }

  private buildPath(shape: BoundaryShapeType, width: number, height: number): string {
    switch (shape) {
      case 'rect':
        return this.buildRect(width, height)
      case 'roundedRect':
        return this.buildRoundedRect(width, height)
      case 'scallops':
        return this.buildScallops(width, height)
      case 'waves':
        return this.buildWaves(width, height)
      case 'tension':
        return this.buildTension(width, height)
      case 'polygon':
        return this.buildPolygon(width, height)
      case 'roundedPolygon':
        return this.buildRoundedPolygon(width, height)
      case 'newBoundary1':
        return this.buildNewBoundary1(width, height)
      case 'newBoundary2':
        return this.buildNewBoundary2(width, height)
      case 'newBoundary3':
        return this.buildNewBoundary3(width, height)
      case 'focus':
        return this.buildFocus(width, height)
      case 'cross':
        return this.buildCross(width, height)
    }
  }

  // ── 1. rect — 矩形 ──
  private buildRect(width: number, height: number): string {
    return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`
  }

  // ── 2. roundedRect — 圆角矩形（原有逻辑，对齐 snowbrush corner=14） ──
  private buildRoundedRect(width: number, height: number): string {
    const c = CORNER_RADIUS
    return [
      `M ${c} 0`,
      `L ${width - c} 0`,
      `Q ${width} 0 ${width} ${c}`,
      `L ${width} ${height - c}`,
      `Q ${width} ${height} ${width - c} ${height}`,
      `L ${c} ${height}`,
      `Q 0 ${height} 0 ${height - c}`,
      `L 0 ${c}`,
      `Q 0 0 ${c} 0`,
      'Z',
    ].join(' ')
  }

  // ── 3. scallops — 扇形边 ──
  private buildScallops(width: number, height: number): string {
    const offset = BOUNDARY_GAP / 2
    const w = width - BOUNDARY_GAP
    const h = height - BOUNDARY_GAP
    const horizontalNumber = Math.max(1, Math.floor(w / 40))
    const verticalNumber = Math.max(1, Math.floor(h / 40))
    const hstep = w / horizontalNumber
    const vstep = h / verticalNumber

    let startPosX = offset
    let startPosY = offset
    let endPosX = hstep + offset
    let endPosY = offset

    let d = `M ${startPosX} ${startPosY}`

    // 上部
    const hReal = w / hstep
    for (let i = 0; i < hReal; i++) {
      d += ` C ${startPosX + (endPosX - startPosX) * 0.25} ${endPosY - offset} ${startPosX + (endPosX - startPosX) * 0.75} ${endPosY - offset} ${endPosX} ${endPosY}`
      startPosX = endPosX
      endPosX = startPosX + hstep
    }

    // 右部
    endPosX = startPosX
    endPosY = endPosY + vstep
    const vReal = h / vstep
    for (let i = 0; i < vReal; i++) {
      d += ` C ${startPosX + offset} ${startPosY + (endPosY - startPosY) * 0.25} ${startPosX + offset} ${startPosY + (endPosY - startPosY) * 0.75} ${startPosX} ${endPosY}`
      startPosY = endPosY
      endPosY = startPosY + vstep
    }

    // 下部
    endPosY = startPosY
    endPosX = startPosX - hstep
    for (let i = 0; i < hReal; i++) {
      d += ` C ${startPosX - Math.abs(endPosX - startPosX) * 0.25} ${endPosY + offset} ${startPosX - Math.abs(endPosX - startPosX) * 0.75} ${endPosY + offset} ${endPosX} ${endPosY}`
      startPosX = endPosX
      endPosX = startPosX - hstep
    }

    // 左部
    endPosX = startPosX
    endPosY = endPosY - vstep
    for (let i = 0; i < vReal; i++) {
      d += ` C ${startPosX - offset} ${startPosY - Math.abs(endPosY - startPosY) * 0.25} ${startPosX - offset} ${startPosY - Math.abs(endPosY - startPosY) * 0.75} ${startPosX} ${endPosY}`
      startPosY = endPosY
      endPosY = startPosY - vstep
    }

    d += ' Z'
    return d
  }

  // ── 4. waves — 波浪边 ──
  private buildWaves(width: number, height: number): string {
    const offset = BOUNDARY_GAP / 2
    const w = width - BOUNDARY_GAP
    const h = height - BOUNDARY_GAP
    const horizontalNumber = Math.max(1, Math.floor(w / 40))
    const verticalNumber = Math.max(1, Math.floor(h / 40))
    const hstep = w / horizontalNumber
    const vstep = h / verticalNumber

    let startPosX = offset
    let startPosY = offset
    let endPosX = hstep + offset
    let endPosY = offset

    let d = `M ${startPosX} ${startPosY}`

    // 上部
    const hReal = w / hstep
    for (let i = 0; i < hReal; i++) {
      d += ` Q ${startPosX + (endPosX - startPosX) * 0.25} ${endPosY - offset / 2} ${startPosX + (endPosX - startPosX) * 0.5} ${endPosY} T ${endPosX} ${endPosY}`
      startPosX = endPosX
      endPosX = startPosX + hstep
    }

    // 右部
    endPosX = startPosX
    endPosY = endPosY + vstep
    const vReal = h / vstep
    for (let i = 0; i < vReal; i++) {
      d += ` Q ${startPosX + offset / 2} ${startPosY + (endPosY - startPosY) * 0.25} ${startPosX} ${startPosY + (endPosY - startPosY) * 0.5} T ${startPosX} ${endPosY}`
      startPosY = endPosY
      endPosY = startPosY + vstep
    }

    // 下部
    endPosY = startPosY
    endPosX = startPosX - hstep
    for (let i = 0; i < hReal; i++) {
      d += ` Q ${startPosX - Math.abs(endPosX - startPosX) * 0.25} ${endPosY + offset / 2} ${startPosX - Math.abs(endPosX - startPosX) * 0.5} ${endPosY} T ${endPosX} ${endPosY}`
      startPosX = endPosX
      endPosX = startPosX - hstep
    }

    // 左部
    endPosX = startPosX
    endPosY = endPosY - vstep
    for (let i = 0; i < vReal; i++) {
      d += ` Q ${startPosX - offset / 2} ${startPosY - Math.abs(endPosY - startPosY) * 0.25} ${startPosX} ${startPosY - Math.abs(endPosY - startPosY) * 0.5} T ${startPosX} ${endPosY}`
      startPosY = endPosY
      endPosY = startPosY - vstep
    }

    d += ' Z'
    return d
  }

  // ── 5. tension — 张力曲线 ──
  private buildTension(width: number, height: number): string {
    const offset = BOUNDARY_GAP / 2
    const w = width - BOUNDARY_GAP
    const h = height - BOUNDARY_GAP
    const horizontalNumber = Math.max(1, Math.floor(w / 40))
    const verticalNumber = Math.max(1, Math.floor(h / 40))
    const hstep = w / horizontalNumber
    const vstep = h / verticalNumber

    let startPosX = offset
    let startPosY = offset
    let endPosX = hstep + offset
    let endPosY = offset

    let d = `M ${startPosX} ${startPosY}`

    // 上部
    const hReal = w / hstep
    for (let i = 0; i < hReal; i++) {
      d += ` Q ${startPosX + (endPosX - startPosX) * 0.5} ${endPosY + offset} ${endPosX} ${endPosY}`
      startPosX = endPosX
      endPosX = startPosX + hstep
    }

    // 右部
    endPosX = startPosX
    endPosY = endPosY + vstep
    const vReal = h / vstep
    for (let i = 0; i < vReal; i++) {
      d += ` Q ${startPosX - offset} ${startPosY + (endPosY - startPosY) * 0.5} ${startPosX} ${endPosY}`
      startPosY = endPosY
      endPosY = startPosY + vstep
    }

    // 下部
    endPosY = startPosY
    endPosX = startPosX - hstep
    for (let i = 0; i < hReal; i++) {
      d += ` Q ${startPosX - Math.abs(endPosX - startPosX) * 0.5} ${endPosY - offset} ${endPosX} ${endPosY}`
      startPosX = endPosX
      endPosX = startPosX - hstep
    }

    // 左部
    endPosX = startPosX
    endPosY = endPosY - vstep
    for (let i = 0; i < vReal; i++) {
      d += ` Q ${startPosX + offset} ${startPosY - Math.abs(endPosY - startPosY) * 0.5} ${startPosX} ${endPosY}`
      startPosY = endPosY
      endPosY = startPosY - vstep
    }

    d += ' Z'
    return d
  }

  // ── 6. polygon — 多边形（基于 bounds 的简化四边形） ──
  private buildPolygon(width: number, height: number): string {
    // 使用四角点的简单多边形
    const points = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ]
    return this.polygonPath(points)
  }

  // ── 7. roundedPolygon — 圆角多边形 ──
  private buildRoundedPolygon(width: number, height: number): string {
    const points = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ]
    return this.roundedPolygonPath(points)
  }

  // ── 8. newBoundary1 — 不对称圆角 ──
  private buildNewBoundary1(width: number, height: number): string {
    const largeCorner = 50
    const smallCorner = 5
    return [
      `M ${largeCorner} 0`,
      `L ${width - smallCorner} 0`,
      `Q ${width} 0 ${width} ${smallCorner}`,
      `L ${width} ${height - largeCorner}`,
      `Q ${width} ${height} ${width - largeCorner} ${height}`,
      `L ${smallCorner} ${height}`,
      `Q 0 ${height} 0 ${height - smallCorner}`,
      `L 0 ${largeCorner}`,
      `Q 0 0 ${largeCorner} 0`,
      'Z',
    ].join(' ')
  }

  // ── 9. newBoundary2 — 倾斜形 ──
  private buildNewBoundary2(width: number, height: number): string {
    const skewOffset = 50
    const points = [
      { x: skewOffset, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: width - skewOffset, y: height },
      { x: 0, y: height },
      { x: 0, y: 0 },
    ]
    return this.roundedPolygonPath(points)
  }

  // ── 10. newBoundary3 — 箭头峰 ──
  private buildNewBoundary3(width: number, height: number): string {
    const peak = 50
    const points = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width + peak, y: height / 2 },
      { x: width, y: height },
      { x: 0, y: height },
    ]
    return this.polygonPath(points)
  }

  // ── 11. focus — 焦点括号 ──
  private buildFocus(width: number, height: number): string {
    const length = Math.min(60, Math.min(height, width) / 8)
    return [
      `M 0 ${length}`,
      `L 0 0`,
      `L ${length} 0`,
      `M ${width - length} 0`,
      `L ${width} 0`,
      `L ${width} ${length}`,
      `M ${width} ${height - length}`,
      `L ${width} ${height}`,
      `L ${width - length} ${height}`,
      `M 0 ${height - length}`,
      `L 0 ${height}`,
      `L ${length} ${height}`,
    ].join(' ')
  }

  // ── 12. cross — 十字延伸线 ──
  private buildCross(width: number, height: number): string {
    const len = CROSS_BOUNDARY_LEN
    return [
      `M ${-len} 0`,
      `L ${width + len} 0`,
      `M ${width} ${-len}`,
      `L ${width} ${height + len}`,
      `M ${-len} ${height}`,
      `L ${width + len} ${height}`,
      `M 0 ${-len}`,
      `L 0 ${height + len}`,
    ].join(' ')
  }

  // ==================== 辅助路径生成 ====================

  /** 多边形路径 */
  private polygonPath(points: Array<{ x: number; y: number }>): string {
    if (points.length < 3) return ''
    const first = points[0]
    let d = `M ${first.x} ${first.y}`
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`
    }
    d += ' Z'
    return d
  }

  /** 圆角多边形路径（对齐 snowbrush drawRoundPolygon） */
  private roundedPolygonPath(points: Array<{ x: number; y: number }>): string {
    if (points.length < 3) return ''

    const corner = CORNER_RADIUS
    const tmpArr = [...points, points[0]] // 闭合循环
    let d = ''
    let firstPoint: { x: number; y: number } | null = null

    for (let i = 1; i < tmpArr.length; i++) {
      const p1 = tmpArr[i - 1]
      const p2 = tmpArr[i]
      const dis = this.calculateDistance(p1, p2)

      let rp1: { x: number; y: number }
      let rp2: { x: number; y: number }

      if (dis > corner) {
        rp1 = {
          x: (corner * (p2.x - p1.x)) / dis + p1.x,
          y: (corner * (p2.y - p1.y)) / dis + p1.y,
        }
        rp2 = {
          x: ((dis - corner) * (p2.x - p1.x)) / dis + p1.x,
          y: ((dis - corner) * (p2.y - p1.y)) / dis + p1.y,
        }
      } else {
        rp1 = {
          x: ((dis / 2) * (p2.x - p1.x)) / dis + p1.x,
          y: ((dis / 2) * (p2.y - p1.y)) / dis + p1.y,
        }
        rp2 = { x: rp1.x, y: rp1.y }
      }

      if (d === '') {
        d += `M ${rp1.x} ${rp1.y}`
        firstPoint = rp1
      } else {
        d += ` Q ${p1.x} ${p1.y} ${rp1.x} ${rp1.y}`
      }
      d += ` L ${rp2.x} ${rp2.y}`
    }

    if (firstPoint) {
      d += ` Q ${tmpArr[0].x} ${tmpArr[0].y} ${firstPoint.x} ${firstPoint.y}`
      d += ' Z'
    }

    return d
  }

  /** 计算两点距离 */
  private calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return Math.sqrt(dx * dx + dy * dy)
  }
}
