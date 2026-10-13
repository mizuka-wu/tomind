/**
 * 带 labels 的主题在布局里的「原点」口径回归测试
 *
 * SB 的主题盒（topicView.bounds）= { x/y: shapeBounds.x/y, ...topicCell.size }，
 * 即盒高含 shape 下方的 labels（+4 spacing +20 单行），但**盒的 y 原点仍是 shape 顶边**，
 * 而 branch position / realPosition（布局里的「原点」）是 **shape 中心**：
 *   topicView.bounds.y = -shapeHeight/2 ≠ -height/2
 * 所有「盒顶 ↔ 原点」的换算都必须用 shapeHeight/2。
 *
 * 旧实现两处错：
 *   1. 主题盒高不含 labels（少 24px）→ 子树高/层间距全错
 *   2. 用 height/2 当原点偏移 → 带 labels 的节点与其兄弟的相对位置偏 (boxH-shapeH)/2
 */

import { describe, it, expect } from 'vitest'
import { logicRightLayoutAlgorithm, DEFAULT_LAYOUT_OPTIONS } from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'

/** SB topicCell.verticalSpacing(4) + LabelsView 单行高(20) */
const LABELS_EXTRA = 24
const SPACING_MINOR = DEFAULT_LAYOUT_OPTIONS.verticalGap

const node = (
  id: string,
  title: string,
  attrs: Record<string, unknown> = {},
  children: readonly NodeDesc[] = [],
): NodeDesc => ({ id, type: id === 'root' ? 'root' : 'topic', attrs: { title, ...attrs }, children: { attached: children } })

const layoutOf = (children: readonly NodeDesc[]) =>
  logicRightLayoutAlgorithm.layout(node('root', 'ROOT', {}, children), DEFAULT_LAYOUT_OPTIONS).nodes

describe('labels 计入主题盒高度', () => {
  it('带 labels 的主题盒 = shape + 4 + 20', () => {
    const plain = layoutOf([node('c', 'CHILD')]).get('c')!
    const withLabels = layoutOf([node('c', 'CHILD', { labels: ['col1'] })]).get('c')!
    expect(plain.height).toBe(plain.titleHeight + 10)
    expect(withLabels.height).toBe(withLabels.titleHeight + 10 + LABELS_EXTRA)
    // labels 不改变主题盒宽度（SB labelsView.setParentWidth(shape 宽)）
    expect(withLabels.width).toBe(plain.width)
  })
})

describe('原点 = shape 中心（不是主题盒中心）', () => {
  it('子节点行按 SB childrenY 公式落位（bb 以各自原点为参考）', () => {
    const nodes = layoutOf([
      node('c1', 'CHILD-ONE', { labels: ['col1'] }),
      node('c2', 'CHILD-TWO'),
    ])
    const root = nodes.get('root')!
    const c1 = nodes.get('c1')!
    const c2 = nodes.get('c2')!

    const shapeH1 = c1.height - LABELS_EXTRA
    const shapeH2 = c2.height
    // leaf 的 boundaryBounds 就是 topicView.bounds：y = -shapeH/2、height = 盒高
    const bb1 = { y: -shapeH1 / 2, h: c1.height }
    const bb2 = { y: -shapeH2 / 2, h: c2.height }
    const totalH = bb1.h + bb2.h + SPACING_MINOR
    // SB logicleftandright: childrenY = (lastBB.y + lastBB.h - firstBB.y - totalH)/2 + firstBB.y
    const childrenY = (bb2.y + bb2.h - bb1.y - totalH) / 2 + bb1.y

    // root 无 labels → 原点 = 盒中心
    const rootOriginY = root.y + root.height / 2
    expect(c1.y - rootOriginY).toBeCloseTo(childrenY, 6)
    // 兄弟盒顶按 bb 连续堆叠（间隔 spacingMinor）
    expect(c2.y - (c1.y + c1.height)).toBeCloseTo(SPACING_MINOR, 6)
  })

  it('单个带 labels 的子节点与父节点原点对齐（SB posY=0）', () => {
    const nodes = layoutOf([node('c', 'CHILD', { labels: ['col1'] })])
    const root = nodes.get('root')!
    const c = nodes.get('c')!
    const rootOriginY = root.y + root.height / 2
    const childOriginY = c.y + (c.height - LABELS_EXTRA) / 2
    expect(childOriginY).toBeCloseTo(rootOriginY, 6)
  })
})
