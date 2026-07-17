import { Group, Ellipse, Path, Text, Line } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/** 常量 */
const EXT_RADIUS = 7
const COL_RADIUS = 5
const SYMBOLGAP = 2
const RADIUS = Math.max(EXT_RADIUS, COL_RADIUS)
const EXT_STROKE_WIDTH = 1

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

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group) return

    // 从 layout 获取节点位置
    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    // 位置
    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    // 从 style 中提取属性
    const collapsed = style.collapsed as boolean
    const lineColor = style.lineColor as string | undefined
    const lineWidth = style.lineWidth as number | undefined
    const backgroundColor = style.backgroundColor as string | undefined
    const fillColor = style.fillColor as string | undefined
    const fillOpacity = style.fillOpacity as number | undefined
    const visible = style.visible as boolean | undefined
    const text = style.text as string | undefined
    const textPosition = style.textPosition as { x: number; y: number } | undefined

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
