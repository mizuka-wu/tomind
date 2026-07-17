import { Group, Path } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/** 常量 */
const BOX_STROKE_COLOR = '#2ebdff'
const HOVER_OPACITY = 0.5

/**
 * SelectBoxRenderer — 选择框渲染器
 *
 * 参考旧系统 SelectBoxRenderWorker：
 * - 显示选择框
 * - 支持拖拽手柄
 * - 支持添加标题按钮
 */
export class SelectBoxRenderer implements Renderer {
  private group: Group | null = null
  private selectBox: Path | null = null
  private selectBoxOneG: Group | null = null
  private selectBoxTwoG: Group | null = null
  private selectBoxOne: Path | null = null
  private selectBoxTwo: Path | null = null
  private dragHandlerAreaOne: Path | null = null
  private dragHandlerAreaTwo: Path | null = null
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group({ name: 'select-box-group', visible: false })
    this.selectBox = new Path({ name: 'select-box' })
    this.group.add(this.selectBox)

    this.selectBoxOneG = new Group({ name: 'select-box-one-g' })
    this.selectBoxTwoG = new Group({ name: 'select-box-two-g' })

    this.selectBoxOne = new Path({ name: 'select-box-one' })
    this.selectBoxTwo = new Path({ name: 'select-box-two' })
    this.dragHandlerAreaOne = new Path({ name: 'select-handler-area-one' })
    this.dragHandlerAreaTwo = new Path({ name: 'select-handler-area-two' })

    this.selectBoxOneG.add(this.dragHandlerAreaOne)
    this.selectBoxTwoG.add(this.dragHandlerAreaTwo)
    this.selectBoxOneG.add(this.selectBoxOne)
    this.selectBoxTwoG.add(this.selectBoxTwo)

    this.group.add(this.selectBoxOneG)
    this.group.add(this.selectBoxTwoG)

    parent.add(this.group)
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group || !this.selectBox) return

    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    const selectBoxAttrs = style.selectBoxAttrs as Record<string, unknown> | undefined
    const selectBoxOneAttrs = style.selectBoxOneAttrs as Record<string, unknown> | undefined
    const selectBoxTwoAttrs = style.selectBoxTwoAttrs as Record<string, unknown> | undefined
    const transparent = style.transparent as boolean | undefined
    const visible = style.visible as boolean | undefined

    if (selectBoxAttrs) {
      this.selectBox.set(selectBoxAttrs)
    }

    if (selectBoxOneAttrs && this.selectBoxOne) {
      this.selectBoxOne.set(selectBoxOneAttrs)
    }

    if (selectBoxTwoAttrs && this.selectBoxTwo) {
      this.selectBoxTwo.set(selectBoxTwoAttrs)
    }

    if (transparent !== undefined) {
      const opacity = transparent ? HOVER_OPACITY : 1
      this.group.opacity = opacity
      if (this.selectBox) {
        this.selectBox.stroke = transparent ? `rgba(${BOX_STROKE_COLOR}, ${HOVER_OPACITY})` : undefined
      }
    }

    if (visible !== undefined) {
      this.group.visible = visible
    }
  }

  destroy(): void {
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.selectBox = null
    this.selectBoxOneG = null
    this.selectBoxTwoG = null
    this.selectBoxOne = null
    this.selectBoxTwo = null
    this.dragHandlerAreaOne = null
    this.dragHandlerAreaTwo = null
  }
}
