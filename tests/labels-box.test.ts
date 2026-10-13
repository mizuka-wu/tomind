/**
 * labels 计入主题盒（对齐 SB topicLayoutWorker）
 *
 * SB `figures/layoutengine/topiclayoutworker.work` 最后写：
 *   topicView.bounds = { x: shapeBounds.x, y: shapeBounds.y, ...topicCell.getSize() }
 * 而 topicCell = GridLayout(1, false) { verticalSpacing: 4 } 里装
 * [topicShapePaddingGroupCell, labelsGroupCell] —— 即 labels 在 shape **下方**，
 * 但**计入 topicView.bounds（布局用的主题盒）的高度**，盒子的 y 原点仍是 shape 顶边。
 *
 * 探针实测（test-numbering-parts.xmind「测量方法」，1 个 label + 编号）：
 *   shapeBounds 97.79×30、labelsView.bounds 97.79×20、topicView.bounds 97.79×**54** = 30+4+20。
 */
import { describe, it, expect } from 'vitest'
import { measurePartAwareNode } from '../packages/layout/src/part-node-size'
import { DEFAULT_LAYOUT_OPTIONS } from '../packages/layout/src/layout-engine'
import type { NodeDesc } from '../packages/schema/src'

/** SB topicCell 的 gridLayoutForTopicCell.verticalSpacing */
const TOPIC_CELL_VERTICAL_SPACING = 4
/** SB LabelsView 单行高度（LABEL_UNIT_HEIGHT） */
const LABELS_ONE_ROW_HEIGHT = 20

const build = (attrs: Record<string, unknown>): NodeDesc => ({
  id: 'n1',
  type: 'topic',
  attrs: { title: '传感器表达方法', ...attrs },
  children: {},
})

const VPAD = DEFAULT_LAYOUT_OPTIONS.nodePadding.top + DEFAULT_LAYOUT_OPTIONS.nodePadding.bottom
const HPAD = DEFAULT_LAYOUT_OPTIONS.nodePadding.left + DEFAULT_LAYOUT_OPTIONS.nodePadding.right

describe('labels box', () => {
  it('主题盒高度 = shape + 4 + labels，labels 排在 shape 下方', () => {
    const r = measurePartAwareNode(build({ labels: ['col1'] }), DEFAULT_LAYOUT_OPTIONS, null, null)
    const shapeHeight = r.titleHeight + VPAD
    expect(r.height).toBe(shapeHeight + TOPIC_CELL_VERTICAL_SPACING + LABELS_ONE_ROW_HEIGHT)

    const lb = r.partBounds.get('labels')!
    expect(lb.y).toBe(shapeHeight + TOPIC_CELL_VERTICAL_SPACING)
    expect(lb.height).toBe(LABELS_ONE_ROW_HEIGHT)
    // SB labelsView.setParentWidth(topicShapePaddingGroup 宽度) → labels 宽 = 主题盒宽
    expect(lb.width).toBe(r.width)
    expect(r.width).toBe(r.titleWidth + HPAD)
  })

  it('没有 labels 时不占位（空 cell 不产生 4px 间距）', () => {
    const withLabels = measurePartAwareNode(build({ labels: ['col1'] }), DEFAULT_LAYOUT_OPTIONS, null, null)
    const without = measurePartAwareNode(build({}), DEFAULT_LAYOUT_OPTIONS, null, null)
    expect(without.height).toBe(without.titleHeight + VPAD)
    expect(withLabels.height - without.height).toBe(TOPIC_CELL_VERTICAL_SPACING + LABELS_ONE_ROW_HEIGHT)
    expect(withLabels.width).toBe(without.width)
  })
})
