/**
 * shape-box — 从布局结果还原「shape 盒」（SB topicView.shapeBounds）
 *
 * SB 的主题盒（topicView.bounds）= shape + 下方 labels：
 *   bounds = { x/y: shapeBounds.x/y, ...topicCell.getSize() }
 * 即盒顶 = shape 顶边，盒高含 labels（verticalSpacing 4 + labels 高）。
 * tomind 的 NodeLayout.height 就是这个「主题盒高」，而**画形状、放标题、算连线锚点**
 * 都必须用 shape 高（SB 分别用 shapeBounds / titleView / getJointPosition(shapeBounds)）。
 *
 * 布局侧已经算出 shapeHeight，但只作为内部量（originY = shapeHeight/2）用于定位，
 * 没有透出到 NodeLayout；labels 的 partBounds 是透出的，所以这里用它反推：
 *   shapeHeight = labels.y - verticalSpacing(4)
 * 没有 labels 时 shapeHeight === height。
 */
import type { NodeLayout } from '@tomind/layout'

/** SB topicCell 里 shape 行与 labels 行之间的 verticalSpacing（packages/layout/src/part-cell-builder.ts） */
const LABELS_VERTICAL_SPACING = 4

export interface ShapeBox {
  x: number
  y: number
  width: number
  height: number
}

/** shape 高度（不含 labels）；拿不到 partBounds 时退回主题盒高 */
export function getShapeHeight(layout: NodeLayout): number {
  const labels = layout.partBounds?.get('labels')
  if (!labels) return layout.height
  const h = labels.y - LABELS_VERTICAL_SPACING
  return h > 0 ? h : layout.height
}

/** 绝对坐标下的 shape 盒（对齐 SB topicView.shapeBounds 的绝对位置） */
export function getShapeBox(layout: NodeLayout): ShapeBox {
  return { x: layout.x, y: layout.y, width: layout.width, height: getShapeHeight(layout) }
}

/** 给渲染器用的「按 shape 高修正过」的布局（标题居中/形状都按 shape 走） */
export function withShapeHeight(layout: NodeLayout): NodeLayout {
  const h = getShapeHeight(layout)
  return h === layout.height ? layout : { ...layout, height: h }
}
