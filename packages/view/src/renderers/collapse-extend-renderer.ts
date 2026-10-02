import { Group, Ellipse, Path, Text, Line } from 'leafer-ui'
import { computeCollapseButtonPos, COLLAPSE_CHROME } from './collapse-geometry'

const { EXT_RADIUS, COL_RADIUS } = COLLAPSE_CHROME
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'
import { getStringStyle, getNumberStyle, getBoolStyle, getObjectStyle } from '../style-accessors'

/** 常量 — 对齐 snowbrush layoutConstant */
const SYMBOLGAP = 2
const RADIUS = Math.max(EXT_RADIUS, COL_RADIUS)
const EXT_STROKE_WIDTH = 1
const BIGGEST_NUM = 99

/**
 * CollapseExtendRenderer — 折叠/展开按钮渲染器
 *
 * 参考旧系统 CollapseExtendRenderWorker：
 * - foldG：折叠状态（圆圈 + 横线）
 * - extG：展开状态（连接线 + 圆圈 + 文字）
 * - actionArea：点击区域
 */
export class CollapseExtendRenderer implements Renderer {
  private group: Group | null = null

  /** fold 状态元素 */
  private foldG: Group | null = null
  private circleFill: Ellipse | null = null
  private ecCircle: Ellipse | null = null
  private path: Path | null = null

  /** 获取折叠圆圈填充元素（供外部读取/设置样式状态） */
  getCircleFill(): Ellipse | null { return this.circleFill }

  /** ext 状态元素 */
  private extG: Group | null = null
  private connectPath: Line | null = null
  private ecircleFill: Ellipse | null = null
  private eecCircle: Ellipse | null = null
  private text: Text | null = null

  /** action area */
  private actionArea: Ellipse | null = null

  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    // 主容器
    this.group = new Group()

    // foldG — 折叠状态
    this.foldG = new Group()
    this.group.add(this.foldG)

    this.circleFill = new Ellipse({
      width: COL_RADIUS * 2,
      height: COL_RADIUS * 2,
    })
    this.foldG.add(this.circleFill)

    this.ecCircle = new Ellipse({
      width: COL_RADIUS * 2,
      height: COL_RADIUS * 2,
      fill: 'none',
    })
    this.foldG.add(this.ecCircle)

    const d = `M ${SYMBOLGAP}, ${COL_RADIUS} L ${COL_RADIUS * 2 - SYMBOLGAP}, ${COL_RADIUS}`
    this.path = new Path({ path: d })
    this.foldG.add(this.path)

    // extG — 展开状态
    this.extG = new Group()
    this.group.add(this.extG)

    this.connectPath = new Line({
      points: [0, 0, -6, 9],
      strokeWidth: 0,
    })
    this.extG.add(this.connectPath)

    this.ecircleFill = new Ellipse({
      width: EXT_RADIUS * 2,
      height: EXT_RADIUS * 2,
    })
    this.extG.add(this.ecircleFill)

    this.eecCircle = new Ellipse({
      width: EXT_RADIUS * 2,
      height: EXT_RADIUS * 2,
      fill: 'none',
      strokeWidth: EXT_STROKE_WIDTH,
    })
    this.extG.add(this.eecCircle)

    this.text = new Text()
    this.extG.add(this.text)

    // actionArea — 点击区域
    this.actionArea = new Ellipse({
      width: RADIUS * 3,
      height: RADIUS * 3,
      name: 'action-area',
      fill: 'none',
    })
    this.group.add(this.actionArea)

    parent.add(this.group)
  }

  /**
   * 对齐 snowbrush layoutExtendCollapse：按子节点方向把按钮放在节点外缘
   */
  place(
    bounds: { x: number; y: number; width: number; height: number },
    side: 'right' | 'left' | 'down' | 'up',
    collapsed: boolean,
    descendantCount: number,
  ): void {
    if (!this.group) return
    const { x, y, r, gap } = computeCollapseButtonPos(bounds, side, collapsed)
    this.group.x = x
    this.group.y = y

    // 连接线：按钮圆心 → 节点边缘
    if (this.connectPath) {
      const cx = r
      const cy = r
      let tx: number
      let ty: number
      switch (side) {
        case 'right': tx = -gap + r; ty = cy; break
        case 'left': tx = gap + r * 2 - r; ty = cy; break
        case 'down': tx = cx; ty = -gap + r; break
        case 'up': tx = cx; ty = gap + r * 2 - r; break
      }
      this.connectPath.points = [cx, cy, tx, ty]
      this.connectPath.strokeWidth = EXT_STROKE_WIDTH
    }

    // 折叠时显示后代计数（对齐 snowbrush BIGGEST_NUM=99 → "···"）
    if (this.text) {
      if (collapsed) {
        const label = descendantCount > BIGGEST_NUM ? '···' : String(descendantCount)
        this.text.text = label
        this.text.visible = true
        const tw = label.length * 6
        this.text.x = r - tw / 2
        this.text.y = r - 6
      } else {
        this.text.visible = false
      }
    }
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group) return

    // 从 layout 获取节点位置
    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    // 位置
    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    // 从 style 中提取属性
    const collapsed = getBoolStyle(style, 'collapsed')
    const lineColor = getStringStyle(style, 'lineColor')
    // toLeaferStyle 已将 lineWidth 映射为 lineStrokeWidth（并向后兼容写入 strokeWidth）
    const lineWidth = getNumberStyle(style, 'strokeWidth') ?? getNumberStyle(style, 'lineStrokeWidth') ?? undefined
    const backgroundColor = getStringStyle(style, 'backgroundColor')
    const fillColor = getStringStyle(style, 'fillColor')
    const fillOpacity = getNumberStyle(style, 'fillOpacity')
    const visible = getBoolStyle(style, 'visible')
    const text = getStringStyle(style, 'text')
    const textPosition = getObjectStyle<{ x: number; y: number }>(style, 'textPosition')

    // 折叠状态
    if (collapsed) {
      this.group.set({ name: 'collapse-folded' })
      this.extG!.visible = true
      this.actionArea!.set({
        x: -RADIUS / 2,
        y: -RADIUS / 2 - SYMBOLGAP / 2,
      })

      // 文字
      if (text) {
        this.text!.text = text
      }
      if (textPosition) {
        this.text!.set({
          x: textPosition.x,
          y: textPosition.y,
        })
      }
    } else {
      this.group.set({ name: 'collapse-extended' })
      this.extG!.visible = false
      this.actionArea!.set({
        x: -RADIUS / 2,
        y: -RADIUS / 2,
      })
      this.actionArea!.visible = true
    }

    // 样式
    if (backgroundColor) {
      this.circleFill!.fill = backgroundColor
      this.ecircleFill!.fill = backgroundColor
    }

    if (lineColor) {
      this.ecCircle!.stroke = lineColor
      this.path!.stroke = lineColor
      this.eecCircle!.stroke = lineColor
      this.text!.fill = lineColor
      this.connectPath!.stroke = lineColor
    }

    if (lineWidth) {
      this.connectPath!.strokeWidth = lineWidth
    }

    if (fillColor) {
      this.ecCircle!.fill = fillColor
      this.eecCircle!.fill = fillColor
    }

    if (fillOpacity !== undefined) {
      // LeaferJS 使用 opacity 而不是 fillOpacity
      this.ecCircle!.opacity = fillOpacity
      this.eecCircle!.opacity = fillOpacity
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
    this.foldG = null
    this.circleFill = null
    this.ecCircle = null
    this.path = null
    this.extG = null
    this.connectPath = null
    this.ecircleFill = null
    this.eecCircle = null
    this.text = null
    this.actionArea = null
  }
}
