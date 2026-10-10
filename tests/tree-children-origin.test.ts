/**
 * tree-left / tree-right 子节点 X 原点回归测试
 *
 * SB treeleftandright.calAttachedChildrenPos 里
 *   posX = childrenX - childBranch.topicView.bounds.x + maxOffset
 * 而 setPosition 的坐标是相对**父分支原点（= 主题盒中心）**的，
 * 所以子主题盒左边缘 = 父中心 + childrenX，与父主题盒宽度无关。
 *
 * TM 之前按父主题盒右边缘起算，父越宽整棵子树越往右偏（root 208px → 偏 104px）。
 */

import { describe, it, expect } from 'vitest'
import { createTreeLayoutAlgorithm, DEFAULT_LAYOUT_OPTIONS } from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'

const node = (
  id: string,
  type: string,
  attrs: Record<string, unknown> = {},
  children: Record<string, readonly NodeDesc[]> = {},
): NodeDesc => ({ id, type, attrs, children })

const buildDoc = (rootTitle: string): NodeDesc =>
  node('root', 'root', { title: rootTitle }, {
    attached: [
      node('a', 'topic', { title: 'A' }, {
        attached: [node('a1', 'topic', { title: 'A1' })],
      }),
      node('b', 'topic', { title: 'B' }),
    ],
  })

const offsetFromRootCenter = (direction: 'right' | 'left') => {
  const algorithm = createTreeLayoutAlgorithm(`tree-${direction}`, direction)
  const narrow = algorithm.layout(buildDoc('R'), DEFAULT_LAYOUT_OPTIONS).nodes
  const wide = algorithm.layout(buildDoc('ROOT-WIDE-TITLE'), DEFAULT_LAYOUT_OPTIONS).nodes

  const centerOf = (n: { x: number; width: number }) => n.x + n.width / 2
  const rel = (m: typeof narrow, id: string) => {
    const root = m.get('root')!
    const target = m.get(id)!
    return direction === 'right'
      ? target.x - centerOf(root)
      : centerOf(root) - (target.x + target.width)
  }

  return {
    narrowA: rel(narrow, 'a'),
    wideA: rel(wide, 'a'),
    narrowA1: rel(narrow, 'a1'),
    wideA1: rel(wide, 'a1'),
    narrowRoot: narrow.get('root')!,
    wideRoot: wide.get('root')!,
  }
}

describe('tree 布局子节点 X 原点 = 父主题盒中心', () => {
  it('tree-right：子树相对 root 中心的偏移与 root 宽度无关', () => {
    const r = offsetFromRootCenter('right')
    // 前提：两个 root 宽度确实不同，否则测试没有鉴别力
    expect(r.wideRoot.width).toBeGreaterThan(r.narrowRoot.width)
    expect(r.wideA).toBeCloseTo(r.narrowA, 6)
    expect(r.wideA1).toBeCloseTo(r.narrowA1, 6)
  })

  it('tree-left：子树相对 root 中心的偏移与 root 宽度无关', () => {
    const r = offsetFromRootCenter('left')
    expect(r.wideRoot.width).toBeGreaterThan(r.narrowRoot.width)
    expect(r.wideA).toBeCloseTo(r.narrowA, 6)
    expect(r.wideA1).toBeCloseTo(r.narrowA1, 6)
  })
})
