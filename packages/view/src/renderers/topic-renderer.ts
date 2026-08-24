import { Group, Rect, Text, Line, Ellipse, Path } from 'leafer-ui'
import type { IFontWeight, ITextAlign, ITextDecorationType, IImagePaint } from 'leafer-ui'
import type { LayoutResult, NodeLayout } from '@tomind/layout'
import { getStringStyle, getNumberStyle } from '../style-accessors'
import type { Renderer } from './renderer'
import { getTitleText } from '@tomind/schema'

const SYSTEM_FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

/** textDecoration 映射 — 样式值 → LeaferJS 值（LeaferJS 使用 'under'/'delete'） */
const TEXT_DECORATION_MAP: Record<string, ITextDecorationType> = {
  underline: 'under',
  'line-through': 'delete',
}

const PATTERN_TILE_SIZE = 10

type PatternKind = 'hachure' | 'cross-hatch' | 'zigzag'

/** fillPattern 值 → 图案种类；'solid' 及未知值返回 null → 纯色填充（兼容 crossing/crossing-thin/hachure-thin 等主题别名） */
function resolvePatternKind(fillPattern: string): PatternKind | null {
  switch (fillPattern) {
    case 'hachure':
    case 'hachure-thin':
      return 'hachure'
    case 'cross-hatch':
    case 'crossing':
    case 'crossing-thin':
      return 'cross-hatch'
    case 'zigzag':
      return 'zigzag'
    default:
      return null
  }
}

// ─── 形状常量 ─────────────────────────────────────────────────────────────────

const STACK_GAP = 5
const CLOUD_WAVE_LENGTH = 40
const CLOUD_CORNER_LEN = 40


// ─── 形状路径生成工具 ─────────────────────────────────────────────────────────

/** 菱形路径 */
function diamondPath(x: number, y: number, w: number, h: number): string {
  const cx = x + w / 2
  const cy = y + h / 2
  return `M ${cx} ${y} L ${x + w} ${cy} L ${cx} ${y + h} L ${x} ${cy} Z`
}

/** 六边形路径 */
function hexagonPath(x: number, y: number, w: number, h: number): string {
  const x0 = x
  const x1 = x + w / 9
  const x2 = x + (w * 8) / 9
  const x3 = x + w
  const y0 = y
  const y1 = y + h / 2
  const y2 = y + h
  return `M ${x0} ${y1} L ${x1} ${y0} L ${x2} ${y0} L ${x3} ${y1} L ${x2} ${y2} L ${x1} ${y2} Z`
}

/** 圆角六边形（peakrect）— 使用 Q 曲线模拟 flexCorner */
function peakrectPath(bx: number, by: number, bw: number, bh: number): string {
  const x0 = bx
  const x1 = bx + bw / 2
  const x2 = bx + bw
  const peak = Math.min(bh / 6, bw * 0.2)
  const y0 = by + peak
  const y1 = by + bh - peak
  const corner = 4
  // 上边峰值
  const pu = { x: x1, y: y0 - peak }
  // 下边峰值
  const pd = { x: x1, y: y1 + peak }
  // 四角 + 峰值处的圆角过渡
  const lt = flexCorner({ x: x0, y: y1 }, { x: x0, y: y0 }, pu, corner)
  const rt = flexCorner(pu, { x: x2, y: y0 }, { x: x2, y: y1 }, corner)
  const rb = flexCorner({ x: x2, y: y0 }, { x: x2, y: y1 }, pd, corner)
  const lb = flexCorner(pd, { x: x0, y: y1 }, { x: x0, y: y0 }, corner)
  const up = flexCorner({ x: x0, y: y0 }, pu, { x: x2, y: y0 }, corner)
  const dn = flexCorner({ x: x2, y: y1 }, pd, { x: x0, y: y1 }, corner)
  return [
    `M ${lt[0].x} ${lt[0].y}`,
    `Q ${x0} ${y0} ${lt[1].x} ${lt[1].y}`,
    `L ${up[0].x} ${up[0].y}`,
    `Q ${pu.x} ${pu.y} ${up[1].x} ${up[1].y}`,
    `L ${rt[0].x} ${rt[0].y}`,
    `Q ${x2} ${y0} ${rt[1].x} ${rt[1].y}`,
    `L ${rb[0].x} ${rb[0].y}`,
    `Q ${x2} ${y1} ${rb[1].x} ${rb[1].y}`,
    `L ${dn[0].x} ${dn[0].y}`,
    `Q ${pd.x} ${pd.y} ${dn[1].x} ${dn[1].y}`,
    `L ${lb[0].x} ${lb[0].y}`,
    `Q ${x0} ${y1} ${lb[1].x} ${lb[1].y}`,
    `Z`,
  ].join(' ')
}

/** 椭圆矩形路径（ellipserect）— 左右两侧用贝塞尔曲线外凸 */
function ellipseRectPath(x: number, y: number, w: number, h: number): string {
  const radius = h / 2
  const x0 = x + radius
  const x1 = x + w - radius
  const y0 = y
  const y1 = y + h
  const bezierW = radius / 0.75
  const outX0 = x0 - bezierW
  const outX1 = x1 + bezierW
  return `M ${x0} ${y0} C ${outX0} ${y0} ${outX0} ${y1} ${x0} ${y1} L ${x1} ${y1} C ${outX1} ${y1} ${outX1} ${y0} ${x1} ${y0} L ${x0} ${y0} Z`
}

/** 椭圆矩形路径（ellipticrectangle / convexrect）— 上下两侧外凸 */
function convexrectPath(bx: number, by: number, bw: number, bh: number): string {
  const x0 = bx
  const x1 = bx + bw / 2
  const x2 = bx + bw
  const peak = Math.min(bh / 3, bw * 0.2)
  const y0 = by + peak / 2
  const y1 = by + bh - peak / 2
  const corner = 5
  const pu = { x: x1, y: y0 - peak }
  const pd = { x: x1, y: y1 + peak }
  const lt = flexCorner({ x: x0, y: y1 }, { x: x0, y: y0 }, pu, corner)
  const rt = flexCorner(pu, { x: x2, y: y0 }, { x: x2, y: y1 }, corner)
  const rb = flexCorner({ x: x2, y: y0 }, { x: x2, y: y1 }, pd, corner)
  const lb = flexCorner(pd, { x: x0, y: y1 }, { x: x0, y: y0 }, corner)
  return [
    `M ${lt[0].x} ${lt[0].y}`,
    `Q ${x0} ${y0} ${lt[1].x} ${lt[1].y}`,
    `Q ${x1} ${y0 - peak} ${rt[0].x} ${rt[0].y}`,
    `Q ${x2} ${y0} ${rt[1].x} ${rt[1].y}`,
    `L ${rb[0].x} ${rb[0].y}`,
    `Q ${x2} ${y1} ${rb[1].x} ${rb[1].y}`,
    `Q ${x1} ${y1 + peak} ${lb[0].x} ${lb[0].y}`,
    `Q ${x0} ${y1} ${lb[1].x} ${lb[1].y}`,
    `Z`,
  ].join(' ')
}

/** 手绘椭圆路径（handDrawnEllipse）— 不对称贝塞尔曲线模拟手绘效果 */
function handDrawnEllipsePath(x: number, y: number, w: number, h: number): string {
  const capOffset = h * 0.03
  const capPoint = {
    x: x + w * 0.8,
    y: y + h * 0.05,
  }
  return [
    `M ${capPoint.x} ${capPoint.y + capOffset}`,
    `C ${x - w / 7} ${y - h / 4}, ${x - w / 4} ${y + h}, ${x + w / 2} ${y + h}`,
    `C ${x + w * 1.1} ${y + h}, ${x + w * 1.1} ${y + h / 6}, ${capPoint.x} ${capPoint.y - capOffset}`,
  ].join(' ')
}

/** flexCorner: 在 start→flex→end 路径上，距 flex 点 corner 距离处取两个过渡点 */
function flexCorner(
  start: { x: number; y: number },
  flex: { x: number; y: number },
  end: { x: number; y: number },
  corner: number,
): [{ x: number; y: number }, { x: number; y: number }] {
  const d1x = flex.x - start.x
  const d1y = flex.y - start.y
  const len1 = Math.sqrt(d1x * d1x + d1y * d1y)
  const d2x = end.x - flex.x
  const d2y = end.y - flex.y
  const len2 = Math.sqrt(d2x * d2x + d2y * d2y)
  if (len1 === 0 || len2 === 0) {
    return [flex, flex]
  }
  return [
    { x: flex.x - (d1x / len1) * corner, y: flex.y - (d1y / len1) * corner },
    { x: flex.x + (d2x / len2) * corner, y: flex.y + (d2y / len2) * corner },
  ]
}

/** 动态云形路径（基于 bounds 波浪生成） */
function cloudPath(bx: number, by: number, bw: number, bh: number): string {
  let cornerLen = CLOUD_CORNER_LEN
  const length = CLOUD_WAVE_LENGTH
  if (bw - cornerLen * 2 < length) {
    cornerLen = CLOUD_CORNER_LEN / 1.34
  }
  const offset1 = cornerLen / 5
  const offset2 = (cornerLen / 5) * 4
  const controlDistance = cornerLen / 2
  const width = bw - cornerLen * 2
  const height = bh - cornerLen * 2
  const horizontalNumber = Math.max(1, Math.floor(width / length))
  const verticalNumber = Math.max(1, Math.floor(height / length))
  const hstep = width / horizontalNumber
  const vstep = height / verticalNumber
  const waveHeight = cornerLen / 3

  const parts: string[] = []
  let startX = bx + cornerLen
  let startY = by + offset1

  // 上部波浪
  parts.push(`M ${startX} ${startY}`)
  for (let i = 0; i < horizontalNumber; i++) {
    const endX = startX + hstep
    parts.push(
      `C ${startX + hstep * 0.25} ${startY - waveHeight} ${startX + hstep * 0.75} ${startY - waveHeight} ${endX} ${startY}`,
    )
    startX = endX
  }

  // 右上角
  parts.push(
    `C ${startX + controlDistance} ${by} ${bx + bw} ${startY + offset2 - controlDistance} ${startX + offset2} ${startY + offset2}`,
  )

  // 右部波浪
  startX += offset2
  startY += offset2
  for (let i = 0; i < verticalNumber; i++) {
    const endY = startY + vstep
    parts.push(
      `C ${startX + waveHeight} ${startY + vstep * 0.25} ${startX + waveHeight} ${startY + vstep * 0.75} ${startX} ${endY}`,
    )
    startY = endY
  }

  // 右下角
  parts.push(
    `C ${bx + bw} ${startY + controlDistance} ${startX - offset2 + controlDistance} ${by + bh} ${startX - offset2} ${startY + offset2}`,
  )

  // 下部波浪
  startX -= offset2
  startY += offset2
  for (let i = 0; i < horizontalNumber; i++) {
    const endX = startX - hstep
    parts.push(
      `C ${startX - hstep * 0.25} ${startY + waveHeight} ${startX - hstep * 0.75} ${startY + waveHeight} ${endX} ${startY}`,
    )
    startX = endX
  }

  // 左下角
  parts.push(
    `C ${startX - controlDistance} ${by + bh} ${bx} ${startY - offset2 + controlDistance} ${startX - offset2} ${startY - offset2}`,
  )

  // 左部波浪
  startX -= offset2
  startY -= offset2
  for (let i = 0; i < verticalNumber; i++) {
    const endY = startY - vstep
    parts.push(
      `C ${startX - waveHeight} ${startY - vstep * 0.25} ${startX - waveHeight} ${startY - vstep * 0.75} ${startX} ${endY}`,
    )
    startY = endY
  }

  // 左上角
  parts.push(
    `C ${bx} ${startY - controlDistance} ${startX + offset2 - controlDistance} ${by} ${startX + offset2} ${startY - offset2}`,
  )

  parts.push('Z')
  return parts.join(' ')
}



// ─── 形状内缩 & 边距工具 ─────────────────────────────────────────────────────

/**
 * snowbrush getDrawBounds：所有形状绘制时内缩 strokeWidth / 2，
 * 防止描边溢出 layout 边界。
 */
function computeDrawBounds(
  layout: { width: number; height: number },
  style: Record<string, unknown>,
): { x: number; y: number; w: number; h: number } {
  const sw = typeof style.strokeWidth === 'number' ? style.strokeWidth : 0
  const inset = sw / 2
  return {
    x: inset,
    y: inset,
    w: layout.width - sw,
    h: layout.height - sw,
  }
}

/**
 * 对 Path 形状应用 getDrawBounds 内缩：偏移路径坐标 inset 像素。
 * 在 ensurePath() 之后、applyPathFillAndStroke() 之前调用。
 */
function applyPathInset(
  path: Rect | Line | Ellipse | Path,
  style: Record<string, unknown>,
): void {
  const sw = typeof style.strokeWidth === 'number' ? style.strokeWidth : 0
  if (sw <= 0) return
  const inset = sw / 2
  // 路径坐标偏移 inset，让描边视觉边界与 layout 对齐
  path.x = inset
  path.y = inset
}

/**
 * snowbrush EllipseTopicShape.getTopicMargins：
 * 根据 fontSize 计算椭圆需要的额外边距（对应 snowbrush 的 Newton 法拟合）。
 */
function computeEllipseExtraMargins(
  layout: { width: number; height: number },
  style: Record<string, unknown>,
): { top: number; right: number; bottom: number; left: number } {
  const fontSize = typeof style.fontSize === 'number' ? Math.min(50, style.fontSize) : 14
  const horScale = 1
  const verScale = 0.5
  // snowbrush 用 Newton 法求解椭圆 fit，近似为 half-size + CORNER_GAP(2)
  const w = layout.width * 0.5 + 2
  const h = layout.height * 0.5 + 2
  const prefWidth = Math.round(w)
  const prefHeight = Math.round(h)
  const minWidth = Math.max(1, prefWidth - 10)
  const minHeight = Math.max(1, prefHeight - 5)
  return {
    top: fontSize * verScale + minHeight,
    left: fontSize * horScale + minWidth,
    bottom: fontSize * verScale + minHeight,
    right: fontSize * horScale + minWidth,
  }
}

// ─── 形状路由表 ───────────────────────────────────────────────────────────────

/** 所有支持的 shapeClass 名称 */
type ShapeClass =
  | 'roundedRect' | 'rect' | 'ellipse' | 'underline' | 'doubleunderline'
  | 'ellipserect' | 'ellipticrectangle' | 'circle' | 'roundedhexagon'
  | 'singlebreakangle' | 'squareBracket' | 'stack'
  | 'hexagon' | 'diamond' | 'cutdiamond' | 'parallelogram'
  | 'cloud' | 'simpleCloud' | 'waterdrop' | 'star' | 'shield'
  | 'fatLeftArrow' | 'fatRightArrow' | 'noBorder' | 'label' | 'bookmark'
  | 'heart' | 'leaf' | 'handDrawnEllipse' | 'curlyBracket' | 'squareQuote' | 'singleBookQuote' | 'doubleBookQuote'
  | 'doubleQuote' | 'roundBracket' | 'matrixMainTopicShape' | (string & {})

// ─── TopicRenderer ────────────────────────────────────────────────────────────

/**
 * TopicRenderer — Topic 节点渲染器
 *
 * 支持根据 shapeClass 渲染多种形状（roundedRect, ellipse, underline, rect,
 * doubleunderline, ellipserect, ellipticrectangle, circle, roundedhexagon,
 * singlebreakangle, squareBracket, stack, hexagon, diamond, cutdiamond,
 * parallelogram, cloud, simpleCloud, waterdrop, star, shield, fatLeftArrow,
 * fatRightArrow, noBorder, label, bookmark, heart, leaf 等）。
 *
 * 支持 fillPattern 图案填充（hachure, cross-hatch, zigzag）。
 * style 参数已经是 LeaferJS 格式（由 StyleEngine.getLeaferStyle() 提供）。
 */
export class TopicRenderer implements Renderer {
  private group: Group | null = null
  private shape: Rect | Line | Ellipse | Path | null = null
  private text: Text | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group()

    // 默认形状：roundedRect
    this.shape = new Rect()
    this.text = new Text()

    this.group.add(this.shape)
    this.group.add(this.text)

    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>, nodeAttrs?: Record<string, unknown>): void {
    if (!this.group || !this.text || !this.shape) {
      console.warn(`[TopicRenderer] SKIP ${this.nodeId} — group=${!!this.group} text=${!!this.text} shape=${!!this.shape}`)
      return
    }

    // 从 LayoutResult Map 中获取节点布局
    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) {
      console.warn(`[TopicRenderer] SKIP ${this.nodeId} — no nodeLayout in result (nodes=${layout.nodes.size})`)
      return
    }

    // 坐标由 TopicNodeViewDesc.updateStyle() 设到 element 上
    // renderer.group 保持 (0,0)，只负责 shape+text 的相对布局

    // 根据 shapeClass 选择形状
    const shapeClass: ShapeClass = typeof style.shapeClass === 'string' ? style.shapeClass : 'roundedRect'
    this.renderShape(shapeClass, nodeLayout, style)

    // opacity 应用到整个 group
    if (typeof style.opacity === 'number') {
      this.group.opacity = style.opacity
    }

    // 文本渲染
    this.renderText(nodeLayout, style, nodeAttrs)
  }

  // ─── 形状路由 ─────────────────────────────────────────────────────────────

  private renderShape(shapeClass: ShapeClass, layout: NodeLayout, style: Record<string, unknown>): void {
    switch (shapeClass) {
      case 'underline':
        this.renderUnderline(layout, style)
        break
      case 'doubleunderline':
        this.renderDoubleUnderline(layout, style)
        break
      case 'ellipse':
        this.renderEllipse(layout, style)
        break
      case 'rect':
        this.renderRect(layout, style)
        break
      case 'ellipserect':
        this.renderEllipseRect(layout, style)
        break
      case 'ellipticrectangle':
        this.renderEllipticRectangle(layout, style)
        break
      case 'circle':
        this.renderCircle(layout, style)
        break
      case 'roundedhexagon':
        this.renderRoundedHexagon(layout, style)
        break
      case 'singlebreakangle':
        this.renderSingleBreakAngle(layout, style)
        break
      case 'squareBracket':
        this.renderSquareBracket(layout, style)
        break
      case 'stack':
        this.renderStack(layout, style)
        break
      case 'hexagon':
        this.renderHexagon(layout, style)
        break
      case 'diamond':
        this.renderDiamond(layout, style)
        break
      case 'cutdiamond':
        this.renderCutDiamond(layout, style)
        break
      case 'parallelogram':
        this.renderParallelogram(layout, style)
        break
      case 'cloud':
        this.renderCloud(layout, style)
        break
      case 'simpleCloud':
        this.renderSimpleCloud(layout, style)
        break
      case 'waterdrop':
        this.renderWaterdrop(layout, style)
        break
      case 'star':
        this.renderStar(layout, style)
        break
      case 'shield':
        this.renderShield(layout, style)
        break
      case 'fatLeftArrow':
        this.renderFatLeftArrow(layout, style)
        break
      case 'fatRightArrow':
        this.renderFatRightArrow(layout, style)
        break
      case 'noBorder':
        this.renderNoBorder(layout, style)
        break
      case 'label':
        this.renderLabel(layout, style)
        break
      case 'bookmark':
        this.renderBookmark(layout, style)
        break
      case 'heart':
        this.renderHeart(layout, style)
        break
      case 'leaf':
        this.renderLeaf(layout, style)
        break
      case 'handDrawnEllipse':
        this.renderHandDrawnEllipse(layout, style)
        break
      case 'squareQuote':
        this.renderSquareQuote(layout, style)
        break
      case 'singleBookQuote':
        this.renderSingleBookQuote(layout, style)
        break
      case 'doubleBookQuote':
        this.renderDoubleBookQuote(layout, style)
        break
      case 'doubleQuote':
        this.renderDoubleQuote(layout, style)
        break
      case 'roundBracket':
        this.renderRoundBracket(layout, style)
        break
      case 'curlyBracket':
        this.renderCurlyBracket(layout, style)
        break
      case 'matrixMainTopicShape':
        this.renderMatrixMainTopicShape(layout, style)
        break
      default:
        this.renderRoundedRect(layout, style)
        break
    }
  }

  // ─── 基础形状 ─────────────────────────────────────────────────────────────

  /** roundedRect：矩形 + cornerRadius（默认） */
  private renderRoundedRect(layout: NodeLayout, style: Record<string, unknown>): void {
    if (!(this.shape instanceof Rect)) {
      this.replaceShape(new Rect())
    }
    const rect = this.shape
    if (!(rect instanceof Rect)) return

    const { x, y, w, h } = computeDrawBounds(layout, style)
    rect.x = x
    rect.y = y
    rect.width = w
    rect.height = h

    this.applyFill(rect, style)
    this.applyStroke(rect, style)
    if (typeof style.cornerRadius === 'number') rect.cornerRadius = style.cornerRadius
  }

  /** rect：无圆角矩形 */
  private renderRect(layout: NodeLayout, style: Record<string, unknown>): void {
    if (!(this.shape instanceof Rect)) {
      this.replaceShape(new Rect())
    }
    const rect = this.shape
    if (!(rect instanceof Rect)) return

    const { x, y, w, h } = computeDrawBounds(layout, style)
    rect.x = x
    rect.y = y
    rect.width = w
    rect.height = h
    rect.cornerRadius = 0

    this.applyFill(rect, style)
    this.applyStroke(rect, style)
  }

  /** ellipse：椭圆 */
  private renderEllipse(layout: NodeLayout, style: Record<string, unknown>): void {
    if (!(this.shape instanceof Ellipse)) {
      this.replaceShape(new Ellipse())
    }
    const ellipse = this.shape
    if (!(ellipse instanceof Ellipse)) return

    // snowbrush: drawBounds 内缩 strokeWidth/2 + ellipse 额外边距
    const sw = typeof style.strokeWidth === 'number' ? style.strokeWidth : 0
    const margins = computeEllipseExtraMargins(layout, style)
    ellipse.width = layout.width - sw - (margins.left + margins.right)
    ellipse.height = layout.height - sw - (margins.top + margins.bottom)
    // 椭圆中心与 layout 中心对齐（Ellipse 以左上角定位）
    ellipse.x = (layout.width - ellipse.width) / 2
    ellipse.y = (layout.height - ellipse.height) / 2

    this.applyFill(ellipse, style)
    this.applyStroke(ellipse, style)
  }

  /** circle：正圆 */
  private renderCircle(layout: NodeLayout, style: Record<string, unknown>): void {
    if (!(this.shape instanceof Ellipse)) {
      this.replaceShape(new Ellipse())
    }
    const ellipse = this.shape
    if (!(ellipse instanceof Ellipse)) return

    // snowbrush: containerWidthContentWidthRatio = 1.6, getDrawBounds 内缩 strokeWidth/2
    const { x, y, w, h } = computeDrawBounds(layout, style)
    const circleSize = Math.max(w, h) * 1.6
    ellipse.width = circleSize
    ellipse.height = circleSize
    // 圆心与 drawBounds 中心对齐
    ellipse.x = x + (w - circleSize) / 2
    ellipse.y = y + (h - circleSize) / 2

    this.applyFill(ellipse, style)
    this.applyStroke(ellipse, style)
  }

  /** underline：只画底部下划线，无填充矩形 */
  private renderUnderline(layout: NodeLayout, style: Record<string, unknown>): void {
    if (!(this.shape instanceof Line)) {
      this.replaceShape(new Line())
    }
    const line = this.shape
    if (!(line instanceof Line)) return

    const inset = (typeof style.strokeWidth === 'number' ? style.strokeWidth : 0) / 2
    const y = layout.height - inset
    line.points = [0, y, layout.width, y]

    if (typeof style.stroke === 'string') line.stroke = style.stroke
    if (typeof style.strokeWidth === 'number') line.strokeWidth = style.strokeWidth
  }

  /** doubleunderline：双下划线 */
  private renderDoubleUnderline(layout: NodeLayout, style: Record<string, unknown>): void {
    const inset = (typeof style.strokeWidth === 'number' ? style.strokeWidth : 0) / 2
    const padding = 5
    const pathData = [
      `M 0 ${layout.height - padding - inset} L ${layout.width} ${layout.height - padding - inset}`,
      `M 0 ${layout.height - inset} L ${layout.width} ${layout.height - inset}`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathStroke(style)
  }

  // ─── 第一批形状 ───────────────────────────────────────────────────────────

  /** ellipserect：椭圆矩形（左右贝塞尔外凸） */
  private renderEllipseRect(layout: NodeLayout, style: Record<string, unknown>): void {
    const pathData = ellipseRectPath(0, 0, layout.width, layout.height)
    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** ellipticrectangle：椭圆矩形（上下外凸，convexrect） */
  private renderEllipticRectangle(layout: NodeLayout, style: Record<string, unknown>): void {
    const pathData = convexrectPath(0, 0, layout.width, layout.height)
    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** roundedhexagon：圆角六边形（peakrect） */
  private renderRoundedHexagon(layout: NodeLayout, style: Record<string, unknown>): void {
    const pathData = peakrectPath(0, 0, layout.width, layout.height)
    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** singlebreakangle：折角形 */
  private renderSingleBreakAngle(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const length = Math.min(20, Math.min(h / 5, w / 5))
    const pathData = [
      `M 0 0`,
      `L ${w - length} 0`,
      `L ${w} ${length}`,
      `L ${w} ${h}`,
      `L 0 ${h}`,
      `Z`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** squareBracket：方括号形 */
  private renderSquareBracket(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const bracketWidth = 10 + h / 25

    const leftBracket = `M ${bracketWidth} 0 L 0 0 L 0 ${h} L ${bracketWidth} ${h}`
    const rightBracket = `M ${w - bracketWidth} 0 L ${w} 0 L ${w} ${h} L ${w - bracketWidth} ${h}`

    this.ensurePath(`${leftBracket} ${rightBracket}`)
    applyPathInset(this.shape!, style)
    this.applyPathStroke(style)
  }

  /** stack：堆叠形 */
  private renderStack(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const g = STACK_GAP

    const pathData = [
      `M 0 0 L ${w - g} 0 L ${w - g} ${h - g} L 0 ${h - g} Z`,
      `M ${w - g} ${g} L ${w} ${g} L ${w} ${h} L ${g} ${h} L ${g} ${h - g}`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  // ─── 第二批形状 ───────────────────────────────────────────────────────────

  /** hexagon：六边形 */
  private renderHexagon(layout: NodeLayout, style: Record<string, unknown>): void {
    // snowbrush: horizonPadding = width / 7
    const sw = typeof style.strokeWidth === 'number' ? style.strokeWidth : 0
    const inset = sw / 2
    const hm = Math.round(layout.width / 7)
    const pathData = hexagonPath(hm + inset, inset, layout.width - 2 * hm - sw, layout.height - sw)
    this.ensurePath(pathData)
    this.applyPathFillAndStroke(style)
  }

  /** diamond：菱形 */
  private renderDiamond(layout: NodeLayout, style: Record<string, unknown>): void {
    const { x, y, w, h } = computeDrawBounds(layout, style)
    const pathData = diamondPath(x, y, w, h)
    this.ensurePath(pathData)
    this.applyPathFillAndStroke(style)
  }

  /** cutdiamond：切角菱形 */
  private renderCutDiamond(layout: NodeLayout, style: Record<string, unknown>): void {
    const { x, y, w, h } = computeDrawBounds(layout, style)
    const pathData = [
      `M ${x + w * 0.137} ${y}`,
      `L ${x + w * 0.863} ${y}`,
      `L ${x + w} ${y + h * 0.267}`,
      `L ${x + w * 0.5} ${y + h}`,
      `L ${x} ${y + h * 0.267}`,
      `Z`,
    ].join(' ')

    this.ensurePath(pathData)
    this.applyPathFillAndStroke(style)
  }

  /** parallelogram：平行四边形 */
  private renderParallelogram(layout: NodeLayout, style: Record<string, unknown>): void {
    const { x, y, w, h } = computeDrawBounds(layout, style)
    const offset = h / 4
    const pathData = `M ${x + offset} ${y} L ${x + w} ${y} L ${x + w - offset} ${y + h} L ${x} ${y + h} Z`

    this.ensurePath(pathData)
    this.applyPathFillAndStroke(style)
  }

  /** cloud：云形（动态波浪） */
  private renderCloud(layout: NodeLayout, style: Record<string, unknown>): void {
    const pathData = cloudPath(0, 0, layout.width, layout.height)
    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** simpleCloud：简单云形（贝塞尔曲线） */
  private renderSimpleCloud(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const pathData = [
      `M ${w * 0.196} ${h}`,
      `C ${w * 0.088} ${h}, 0 ${h * 0.857}, 0 ${h * 0.681}`,
      `C 0 ${h * 0.505}, ${w * 0.090} ${h * 0.353}, ${w * 0.207} ${h * 0.363}`,
      `C ${w * 0.243} ${h * 0.153}, ${w * 0.364} 0, ${w * 0.504} 0`,
      `C ${w * 0.662} 0, ${w * 0.791} ${h * 0.193}, ${w * 0.809} ${h * 0.441}`,
      `C ${w * 0.920} ${h * 0.423}, ${w} ${h * 0.570}, ${w} ${h * 0.720}`,
      `C ${w} ${h * 0.870}, ${w * 0.922} ${h}, ${w * 0.827} ${h}`,
      `Z`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** waterdrop：水滴形 */
  private renderWaterdrop(layout: NodeLayout, style: Record<string, unknown>): void {
    const r = Math.max(layout.width, layout.height) / 2
    const cx = layout.width / 2
    const cy = layout.height / 2
    const pathData = [
      `M ${cx} ${cy - r}`,
      `A ${r} ${r} 0 1 0 ${cx + r} ${cy}`,
      `L ${cx + r} ${cy - r}`,
      `Z`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** star：星形 */
  private renderStar(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const pathData = [
      `M ${w * 0.489} ${h * 0.016}`,
      `Q ${w * 0.5} 0 ${w * 0.511} ${h * 0.016}`,
      `L ${w * 0.666} ${h * 0.314}`,
      `L ${w * 0.978} ${h * 0.377}`,
      `Q ${w * 0.9998} ${h * 0.3804} ${w * 0.988} ${h * 0.393}`,
      `L ${w * 0.761} ${h * 0.64}`,
      `L ${w * 0.803} ${h * 0.977}`,
      `Q ${w * 0.805} ${h} ${w * 0.781} ${h * 0.986}`,
      `L ${w * 0.5} ${h * 0.84}`,
      `L ${w * 0.219} ${h * 0.986}`,
      `Q ${w * 0.195} ${h} ${w * 0.197} ${h * 0.977}`,
      `L ${w * 0.239} ${h * 0.64}`,
      `L ${w * 0.011} ${h * 0.393}`,
      `Q ${w * 0.0002} ${h * 0.3804} ${w * 0.022} ${h * 0.377}`,
      `L ${w * 0.333} ${h * 0.314}`,
      `Z`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** shield：盾形 */
  private renderShield(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const pathData = [
      `M ${w / 2} 0`,
      `C ${w * 0.497} 0, ${w * 0.349} ${h * 0.074}, ${w * 0.494} ${h * 0.0015}`,
      `C ${w * 0.349} ${h * 0.075}, ${w * 0.14} ${h * 0.128}, 0 ${h * 0.149}`,
      `C 0 ${h * 0.795}, ${w * 0.25} ${h * 0.914}, ${w * 0.376} ${h * 0.956}`,
      `L ${w / 2} ${h}`,
      `L ${w * 0.624} ${h * 0.956}`,
      `C ${w * 0.75} ${h * 0.914}, ${w} ${h * 0.795}, ${w} ${h * 0.149}`,
      `C ${w * 0.86} ${h * 0.128}, ${w * 0.651} ${h * 0.075}, ${w * 0.506} ${h * 0.0015}`,
      `C ${w * 0.651} ${h * 0.074}, ${w * 0.503} 0, ${w / 2} 0`,
      `Z`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** fatLeftArrow：胖左箭头 */
  private renderFatLeftArrow(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const bodyLen = 0.57
    const arrowIndent = 0.15
    const pathData = [
      `M ${w} ${h * arrowIndent}`,
      `L ${w * bodyLen} ${h * arrowIndent}`,
      `L ${w * bodyLen} 0`,
      `L 0 ${h * 0.5}`,
      `L ${w * bodyLen} ${h}`,
      `L ${w * bodyLen} ${h * (1 - arrowIndent)}`,
      `L ${w} ${h * (1 - arrowIndent)}`,
      `Z`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** fatRightArrow：胖右箭头 */
  private renderFatRightArrow(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const bodyLen = 0.57
    const arrowIndent = 0.15
    const pathData = [
      `M 0 ${h * arrowIndent}`,
      `L ${w * bodyLen} ${h * arrowIndent}`,
      `L ${w * bodyLen} 0`,
      `L ${w} ${h * 0.5}`,
      `L ${w * bodyLen} ${h}`,
      `L ${w * bodyLen} ${h * (1 - arrowIndent)}`,
      `L 0 ${h * (1 - arrowIndent)}`,
      `Z`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** noBorder：无边框（只有填充，无描边） */
  private renderNoBorder(layout: NodeLayout, style: Record<string, unknown>): void {
    if (!(this.shape instanceof Rect)) {
      this.replaceShape(new Rect())
    }
    const rect = this.shape
    if (!(rect instanceof Rect)) return

    // noBorder 无描边，不需 getDrawBounds 内缩
    rect.width = layout.width
    rect.height = layout.height
    rect.cornerRadius = 0
    rect.stroke = 'none'
    rect.strokeWidth = 0

    this.applyFill(rect, style)
  }

  /** label：标签形（右侧尖角） */
  private renderLabel(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const bodyLen = 0.77
    const pathData = [
      `M 0 0`,
      `L 0 ${h}`,
      `L ${w * bodyLen} ${h}`,
      `L ${w} ${h * 0.5}`,
      `L ${w * bodyLen} 0`,
      `Z`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** bookmark：书签形（左侧内凹） */
  private renderBookmark(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const indent = 0.233
    const pathData = [
      `M 0 0`,
      `L ${w * indent} ${h * 0.5}`,
      `L 0 ${h}`,
      `L ${w} ${h}`,
      `L ${w} 0`,
      `Z`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** heart：心形 */
  private renderHeart(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const pathData = [
      `M ${w * 0.5} ${h * 0.151}`,
      `C ${w * 0.449} ${h * 0.06}, ${w * 0.372} 0, ${w * 0.272} 0`,
      `C ${w * 0.111} 0, 0 ${h * 0.142}, 0 ${h * 0.3264}`,
      `C 0 ${h * 0.623}, ${w * 0.4206} ${h * 0.946}, ${w * 0.491} ${h * 0.994}`,
      `Q ${w * 0.5} ${h}, ${w * 0.509} ${h * 0.994}`,
      `C ${w * 0.5794} ${h * 0.946}, ${w} ${h * 0.623}, ${w} ${h * 0.3264}`,
      `C ${w} ${h * 0.142}, ${w * 0.889} 0, ${w * 0.728} 0`,
      `C ${w * 0.628} 0, ${w * 0.551} ${h * 0.06}, ${w * 0.5} ${h * 0.151}`,
      `Z`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** leaf：叶子形 */
  private renderLeaf(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const hh = h / 2
    const pathData = [
      `M 0 ${hh}`,
      `Q ${w / 2} ${-hh} ${w} ${hh}`,
      `Q ${w / 2} ${h + hh} 0 ${hh}`,
      `Z`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** handDrawnEllipse：手绘椭圆（不对称贝塞尔曲线） */
  private renderHandDrawnEllipse(layout: NodeLayout, style: Record<string, unknown>): void {
    const { x, y, w, h } = computeDrawBounds(layout, style)
    const pathData = handDrawnEllipsePath(x, y, w, h)
    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathFillAndStroke(style)
  }

  /** squareQuote：方引号形（左上和右下角的 L 形括号） */
  private renderSquareQuote(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const VERTICAL_LENGTH = 28.85
    const HORIZONTAL_LENGTH = 15.11

    const pathData = [
      `M ${HORIZONTAL_LENGTH} 0 L 0 0 L 0 ${VERTICAL_LENGTH}`,
      `M ${w - HORIZONTAL_LENGTH} ${h} L ${w} ${h} L ${w} ${h - VERTICAL_LENGTH}`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathStroke(style)
  }

  /** singleBookQuote：单书名号形（尖角 < > 形装饰） */
  private renderSingleBookQuote(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const OFFSET_X = 19.04
    const MIN_HEIGHT = 30
    const MAX_HEIGHT = 90

    const drawHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, h))
    const midY = h * 0.5
    const topY = midY - drawHeight * 0.5
    const botY = midY + drawHeight * 0.5

    const pathData = [
      `M ${OFFSET_X} ${topY} L 0 ${midY} L ${OFFSET_X} ${botY}`,
      `M ${w - OFFSET_X} ${topY} L ${w} ${midY} L ${w - OFFSET_X} ${botY}`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathStroke(style)
  }

  /** doubleBookQuote：双书名号形（双尖角 << >> 形装饰） */
  private renderDoubleBookQuote(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const OFFSET_X = 9.04
    const GAP = 10
    const MIN_HEIGHT = 50
    const MAX_HEIGHT = 95

    const drawHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, h))
    const midY = h * 0.5
    const topY = midY - drawHeight * 0.5
    const botY = midY + drawHeight * 0.5

    const pathData = [
      // 左侧双书名号
      `M ${OFFSET_X} ${topY} L 0 ${midY} L ${OFFSET_X} ${botY}`,
      `M ${OFFSET_X + GAP} ${topY} L ${GAP} ${midY} L ${OFFSET_X + GAP} ${botY}`,
      // 右侧双书名号
      `M ${w - OFFSET_X} ${topY} L ${w} ${midY} L ${w - OFFSET_X} ${botY}`,
      `M ${w - OFFSET_X - GAP} ${topY} L ${w - GAP} ${midY} L ${w - OFFSET_X - GAP} ${botY}`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathStroke(style)
  }

  /** doubleQuote：双引号形（装饰性花式引号） */
  private renderDoubleQuote(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const sw = typeof style.strokeWidth === 'number' ? style.strokeWidth : 2
    const bw = Math.max(sw, 2)
    const VERTICAL_OFFSET_SCALE = 1

    const genQuotePath = (outterX: number, outterY: number, isOpen: boolean): string => {
      const circleScale = 0.8
      const innerX = outterX + (1 - circleScale) * (isOpen ? bw : -bw)
      const outterRadius = circleScale * bw
      const innerRadius = bw / 2
      const tailEndX = outterX + (isOpen ? bw : -bw) * 2
      const tailEndY = outterY + (isOpen ? -bw : bw) * 3.4
      const tailCtrlX = outterX + (isOpen ? -bw : bw) * 0.2
      const tailCtrlY = tailEndY + (isOpen ? bw : -bw)

      const outterCircle = `M ${outterX} ${outterY} a ${outterRadius} ${outterRadius} 0 1 1 0 ${isOpen ? '0.001' : '-0.001'} Z`
      const innerCircle = `M ${innerX} ${outterY} a ${innerRadius} ${innerRadius} 0 1 1 0 ${isOpen ? '0.001' : '-0.001'} Z`
      const tail = `M ${outterX} ${outterY} Q ${tailCtrlX} ${tailCtrlY} ${tailEndX} ${tailEndY}`

      return `${outterCircle} ${innerCircle} ${tail}`
    }

    const gap = bw
    const midY = h * 0.5

    // 左侧双引号
    const l1x = 0
    const l1y = midY + VERTICAL_OFFSET_SCALE * bw
    const l2x = bw * 2 + gap
    const l2y = l1y

    // 右侧双引号
    const r1x = w
    const r1y = midY - VERTICAL_OFFSET_SCALE * bw
    const r2x = w - bw * 2 - gap
    const r2y = r1y

    const pathData = [
      genQuotePath(l1x, l1y, true),
      genQuotePath(l2x, l2y, true),
      genQuotePath(r1x, r1y, false),
      genQuotePath(r2x, r2y, false),
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathStroke(style)
  }

  /** roundBracket：圆括号形（弧形括号） */
  private renderRoundBracket(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const MIN_HEIGHT = 50
    const MAX_HEIGHT = 150
    const indentX = 8
    const outdentY = 12
    const xRadius = indentX * 9

    const drawHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, h))
    const midY = h * 0.5
    const topY = midY - drawHeight * 0.5
    const botY = midY + drawHeight * 0.5

    const pathData = [
      `M ${indentX} ${topY} A ${xRadius} ${drawHeight + outdentY} 0 0 0 ${indentX} ${botY}`,
      `M ${w - indentX} ${topY} A ${xRadius} ${drawHeight + outdentY} 0 0 1 ${w - indentX} ${botY}`,
    ].join(' ')

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathStroke(style)
  }

  /** curlyBracket：花括号形（波浪括号） */
  private renderCurlyBracket(layout: NodeLayout, style: Record<string, unknown>): void {
    const w = layout.width
    const h = layout.height
    const ARC_RADIUS = 4
    const EXTEND_WIDTH = 2.4
    const keyPointOffsetX = ARC_RADIUS + EXTEND_WIDTH

    const genHalfBracket = (
      startX: number, startY: number,
      endX: number, endY: number,
      reverseX: boolean, reverseY: boolean,
    ): string => {
      const arcPoint1X = startX + (reverseX ? keyPointOffsetX : -keyPointOffsetX)
      const arcPoint1Y = startY + (reverseY ? -ARC_RADIUS : ARC_RADIUS)
      const arcPoint2X = endX + (reverseX ? -keyPointOffsetX : keyPointOffsetX)
      const arcPoint2Y = endY + (reverseY ? ARC_RADIUS : -ARC_RADIUS)

      return [
        `M ${startX} ${startY}`,
        `L ${startX + (reverseX ? EXTEND_WIDTH : -EXTEND_WIDTH)} ${startY}`,
        `A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 ${reverseX === reverseY ? '0' : '1'} ${arcPoint1X} ${arcPoint1Y}`,
        `L ${arcPoint2X} ${arcPoint2Y}`,
        `A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 ${reverseX !== reverseY ? '0' : '1'} ${endX + (reverseX ? -EXTEND_WIDTH : EXTEND_WIDTH)} ${endY}`,
        `L ${endX + (reverseX ? -EXTEND_WIDTH : EXTEND_WIDTH) * 0.7} ${endY}`,
      ].join(' ')
    }

    const leftInset = keyPointOffsetX * 2
    const rightInset = w - keyPointOffsetX * 2
    const midY = h * 0.5

    const leftBracket = [
      genHalfBracket(leftInset, 0, 0, midY, false, false),
      genHalfBracket(leftInset, h, 0, midY, false, true),
    ].join(' ')

    const rightBracket = [
      genHalfBracket(rightInset, 0, w, midY, true, false),
      genHalfBracket(rightInset, h, w, midY, true, true),
    ].join(' ')

    const pathData = `${leftBracket} ${rightBracket}`

    this.ensurePath(pathData)
    applyPathInset(this.shape!, style)
    this.applyPathStroke(style)
  }

  /** matrixMainTopicShape：矩阵主节点专用形状（无边框） */
  private renderMatrixMainTopicShape(layout: NodeLayout, style: Record<string, unknown>): void {
    // matrixMainTopicShape 在 snowbrush 中继承 NoBorderTopicShape，
    // 不添加自己的渲染路径，仅调整锚点位置。
    // 在 tomind 中简化为无边框渲染。
    this.renderNoBorder(layout, style)
  }

  // ─── 通用工具方法 ─────────────────────────────────────────────────────────

  /** 确保当前 shape 是 Path 类型，并设置 path 数据 */
  private ensurePath(pathData: string): void {
    if (!(this.shape instanceof Path)) {
      this.replaceShape(new Path())
    }
    const p = this.shape
    if (p instanceof Path) {
      p.path = pathData
    }
  }

  /** 对 Path 形状应用 fill（支持 fillPattern）+ stroke */
  private applyPathFillAndStroke(style: Record<string, unknown>): void {
    const p = this.shape
    if (!(p instanceof Path)) return
    this.applyFill(p, style)
    this.applyStroke(p, style)
  }

  /** 对 Path 形状仅应用 stroke（如 underline、bracket 等线条形） */
  private applyPathStroke(style: Record<string, unknown>): void {
    const p = this.shape
    if (!(p instanceof Path)) return
    // 线条形状默认 fill = none
    p.fill = 'none'
    if (typeof style.stroke === 'string') p.stroke = style.stroke
    if (typeof style.strokeWidth === 'number') p.strokeWidth = style.strokeWidth
  }

  /** 通用描边应用 */
  private applyStroke(target: Rect | Ellipse | Path, style: Record<string, unknown>): void {
    if (typeof style.stroke === 'string') target.stroke = style.stroke
    if (typeof style.strokeWidth === 'number') target.strokeWidth = style.strokeWidth
  }

  /** 替换形状元素 */
  private replaceShape(newShape: Rect | Line | Ellipse | Path): void {
    if (this.shape) {
      this.group?.remove(this.shape)
      this.shape.destroy()
    }
    this.shape = newShape
    this.group?.addAt(newShape, 0)
  }

  /**
   * 根据 style.fillPattern 选择填充方式：
   * - 'solid'（默认）/ 未知值 → 纯色填充
   * - 'hachure' → 斜线图案填充
   * - 'cross-hatch' → 交叉线图案填充
   * - 'zigzag' → 锯齿图案填充
   */
  private applyFill(shape: Rect | Ellipse | Path, style: Record<string, unknown>): void {
    const fillColor = typeof style.fill === 'string' ? style.fill : undefined
    if (!fillColor) return

    const fillPattern = typeof style.fillPattern === 'string' ? style.fillPattern : 'solid'
    const kind = resolvePatternKind(fillPattern)
    if (!kind) {
      shape.fill = fillColor
      return
    }

    const thin = fillPattern.endsWith('-thin')
    const paint = this.createPatternPaint(fillColor, kind, thin)
    shape.fill = paint ?? fillColor
  }

  /** 用 Canvas 绘制图案瓦片并转为 LeaferJS IImagePaint（repeat 模式），失败返回 null */
  private createPatternPaint(color: string, kind: PatternKind, thin: boolean): IImagePaint | null {
    if (typeof document === 'undefined') {
      return null
    }

    const canvas = document.createElement('canvas')
    canvas.width = PATTERN_TILE_SIZE
    canvas.height = PATTERN_TILE_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return null
    }

    ctx.strokeStyle = color
    ctx.lineWidth = thin ? 0.5 : 1
    ctx.beginPath()

    if (kind === 'hachure') {
      this.traceAntiDiagonal(ctx)
    } else if (kind === 'cross-hatch') {
      this.traceAntiDiagonal(ctx)
      this.traceMainDiagonal(ctx)
    } else {
      this.traceZigzag(ctx)
    }

    ctx.stroke()

    return { type: 'image', url: canvas.toDataURL(), mode: 'repeat' }
  }

  private traceAntiDiagonal(ctx: CanvasRenderingContext2D): void {
    ctx.moveTo(0, PATTERN_TILE_SIZE)
    ctx.lineTo(PATTERN_TILE_SIZE, 0)
  }

  private traceMainDiagonal(ctx: CanvasRenderingContext2D): void {
    ctx.moveTo(0, 0)
    ctx.lineTo(PATTERN_TILE_SIZE, PATTERN_TILE_SIZE)
  }

  private traceZigzag(ctx: CanvasRenderingContext2D): void {
    const size = PATTERN_TILE_SIZE
    ctx.moveTo(0, size * 0.6)
    ctx.lineTo(size * 0.25, 0)
    ctx.lineTo(size * 0.5, size * 0.6)
    ctx.lineTo(size * 0.75, 0)
    ctx.lineTo(size, size * 0.6)
  }

  /**
   * 渲染文本
   */
  private renderText(layout: NodeLayout, style: Record<string, unknown>, nodeAttrs?: Record<string, unknown>): void {
    if (!this.text) return

    // 从 node.attrs 取 title（style 不含 title）
    const titleStyle = nodeAttrs ?? style

    // 文本内容 + textTransform 转换
    let text = getTitleText(titleStyle)
    const textTransform = style.textTransform
    if (textTransform === 'uppercase') {
      text = text.toUpperCase()
    } else if (textTransform === 'lowercase') {
      text = text.toLowerCase()
    } else if (textTransform === 'capitalize') {
      text = text.replace(/\b\w/g, (c) => c.toUpperCase())
    }
    this.text.text = text

    // 字体颜色：优先用 fontColor，fallback 到 color
    const fontColor = style.fontColor ?? style.color ?? '#333'
    if (typeof fontColor === 'string') this.text.fill = fontColor

    // fontFamily：'$system$' 解析为系统字体栈
    if (typeof style.fontFamily === 'string') {
      this.text.fontFamily = style.fontFamily === '$system$' ? SYSTEM_FONT_STACK : style.fontFamily
    }
    if (typeof style.fontSize === 'number') this.text.fontSize = style.fontSize
    if (typeof style.fontWeight === 'string' || typeof style.fontWeight === 'number') {
      this.text.fontWeight = style.fontWeight as IFontWeight
    }
    if (typeof style.textAlign === 'string') {
      this.text.textAlign = style.textAlign as ITextAlign
    }

    // textDecoration：映射为 LeaferJS 的 'under'/'delete'
    if (typeof style.textDecoration === 'string') {
      const decoration = TEXT_DECORATION_MAP[style.textDecoration]
      if (decoration !== undefined) {
        this.text.textDecoration = decoration
      }
    }

    // 文本居中（对齐 getDrawBounds 内缩后的形状区域）
    const textAlign = getStringStyle(style, 'textAlign') ?? 'center'
    const fontSize = getNumberStyle(style, 'fontSize') ?? 14
    const { x: drawX, y: drawY, w: drawW, h: drawH } = computeDrawBounds(layout, style)
    const textWidth = this.text.width || layout.titleWidth || drawW
    const textHeight = this.text.height || layout.titleHeight || fontSize

    // 水平居中
    if (textAlign === 'center' || textAlign === undefined) {
      this.text.x = drawX + (drawW - textWidth) / 2
    } else if (textAlign === 'right') {
      this.text.x = drawX + drawW - textWidth - 8
    } else {
      this.text.x = drawX + 8
    }

    // 垂直居中
    this.text.y = drawY + (drawH - textHeight) / 2
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.shape = null
    this.text = null
  }
}
