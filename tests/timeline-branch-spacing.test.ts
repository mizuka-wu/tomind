/**
 * timeline-horizontal 上/下分支「父盒 → 子列」间距口径回归测试
 *
 * SB 两个方向用的常量不同：
 *   timelinehorizontalup.calAttachedChildrenPos
 *     childrenY = newBounds.y - LINECOLPOS - lineCorner - childrenSize.height - ext
 *   timelinehorizontaldown.calAttachedChildrenPos
 *     childrenY = newBounds.y + newBounds.height + PADDING + ext
 *     PADDING = getTopicSpacing = spacingMajor * layoutConstant.PADDING(20) / defaultSpacingMajor
 *
 * TM 之前两个方向都用 LINECOLPOS(13) + lineCorner，下侧多出 1px
 * （21 vs 20），下侧分支整棵子树低 1px（timeline-horizontal avgΔY 0.5）。
 *
 * 无 styleEngine 时 PADDING = 0、lineCorner = 0，两条路径的差别最容易断言。
 */

import { describe, it, expect } from 'vitest'
import { timelineHorizontalLayoutAlgorithm, DEFAULT_LAYOUT_OPTIONS } from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'

const LINECOLPOS = 13

const node = (
  id: string,
  type: string,
  attrs: Record<string, unknown> = {},
  children: Record<string, readonly NodeDesc[]> = {},
): NodeDesc => ({ id, type, attrs, children })

const buildDoc = (): NodeDesc => {
  const branch = (id: string) =>
    node(id, 'topic', { title: id }, {
      attached: [node(`${id}-1`, 'topic', { title: `${id}-1` }), node(`${id}-2`, 'topic', { title: `${id}-2` })],
    })
  // i=0 → up，i=1 → down（对齐 SB getFinalTimelineChildDirection）
  return node('root', 'root', { title: 'Root' }, { attached: [branch('up'), branch('down')] })
}

describe('timeline-horizontal 上下分支间距', () => {
  const nodes = timelineHorizontalLayoutAlgorithm.layout(buildDoc(), DEFAULT_LAYOUT_OPTIONS).nodes
  const box = (id: string) => nodes.get(id)!

  it('down 分支：子列顶边 = 父盒底边 + PADDING（无样式时 PADDING=0）', () => {
    const parent = box('down')
    const childTops = ['down-1', 'down-2'].map((id) => box(id).y)
    expect(Math.min(...childTops)).toBeCloseTo(parent.y + parent.height, 6)
  })

  it('up 分支：子列底边 = 父盒顶边 - LINECOLPOS', () => {
    const parent = box('up')
    const kids = ['up-1', 'up-2'].map((id) => box(id))
    const bottom = Math.max(...kids.map((k) => k.y + k.height))
    expect(bottom).toBeCloseTo(parent.y - LINECOLPOS, 6)
  })

  it('两个方向的间距口径不同（不能被同一个常量替代）', () => {
    const up = box('up')
    const down = box('down')
    const upGap = up.y - LINECOLPOS - Math.max(...['up-1', 'up-2'].map((id) => box(id).y + box(id).height))
    const downGap = Math.min(...['down-1', 'down-2'].map((id) => box(id).y)) - (down.y + down.height)
    // up 侧已经把 LINECOLPOS 减掉 → 0；down 侧是 PADDING(=0)，两者都不含 LINECOLPOS
    expect(upGap).toBeCloseTo(0, 6)
    expect(downGap).toBeCloseTo(0, 6)
  })
})
