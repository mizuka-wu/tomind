import { Group, Rect } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/** 常量 */
const ANCHOR_SIZE = 16
const ANCHOR_BTN_SIZE = 7
const ANCHOR_BTN_MARGIN = (ANCHOR_SIZE - ANCHOR_BTN_SIZE) / 2

/**
 * ResizeBoxRenderer — 调整大小框渲染器
 *
 * 参考旧系统 ResizeBoxRenderWorker：
 * - 显示调整大小的锚点
 * - 支持锁定比例
 */
export class ResizeBoxRenderer implements Renderer {
  private group: Group | null = null
  private box: Rect | null = null
  private anchors: Record<string, Group> = {}
  private anchorBtns: Record<string, Rect> = {}
  private nodeId: string

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group({ name: 'resize-box', visible: false })
    this.box = new Rect({ name: 'fullBox' })
    this.group.add(this.box)

    // 创建锚点
    const anchorKeys = ['lt', 'lm', 'lb', 'ct', 'cb', 'rt', 'rm', 'rb']
    for (const key of anchorKeys) {
      const cursor = this.getCursor(key)
      const anchorGroup = new Group({ cursor })
      this.group.add(anchorGroup)
      this.anchors[key] = anchorGroup

      // 动作区域
      const actionArea = new Rect({
        width: ANCHOR_SIZE,
        height: ANCHOR_SIZE,
        opacity: 0,
      })
      anchorGroup.add(actionArea)

      // 按钮
      const btn = new Rect({
        width: ANCHOR_BTN_SIZE,
        height: ANCHOR_BTN_SIZE,
        x: ANCHOR_BTN_MARGIN,
        y: ANCHOR_BTN_MARGIN,
      })
      anchorGroup.add(btn)
      this.anchorBtns[key] = btn
    }

    parent.add(this.group)
  }

  private getCursor(key: string): string {
    const cursors: Record<string, string> = {
      lt: 'nwse-resize',
      lm: 'ew-resize',
      lb: 'nesw-resize',
      ct: 'ns-resize',
      cb: 'ns-resize',
      rt: 'nesw-resize',
      rm: 'ew-resize',
      rb: 'nwse-resize',
    }
    return cursors[key] || 'default'
  }

  render(layout: LayoutResult, style: Record<string, unknown>): void {
    if (!this.group || !this.box) return

    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    this.group.x = nodeLayout.x
    this.group.y = nodeLayout.y

    const lockRatio = style.lockRatio as boolean | undefined
    const displayState = style.displayState as string | undefined
    const visible = style.visible as boolean | undefined

    // 大小
    const { width, height } = nodeLayout
    this.box.set({ width, height, x: 0, y: 0 })

    // 锚点位置
    const pos = { l: 0, m: height / 2, r: width, t: 0, c: width / 2, b: height }
    for (const k in this.anchors) {
      this.anchors[k].set({
        x: -ANCHOR_SIZE / 2 + pos[k[0] as keyof typeof pos],
        y: -ANCHOR_SIZE / 2 + pos[k[1] as keyof typeof pos],
      })
    }

    // 锁定比例
    if (lockRatio !== undefined) {
      for (const key of ['lm', 'ct', 'cb', 'rm']) {
        if (this.anchors[key]) {
          this.anchors[key].visible = !lockRatio
        }
      }
    }

    // 显示状态
    if (displayState) {
      this.group.visible = displayState !== 'hide'
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
    this.box = null
    this.anchors = {}
    this.anchorBtns = {}
  }
}
