/**
 * org-chart-up 布局回归测试
 *
 * SB orgChartDownAndUp.calAttachedChildrenPos(isDown=false) 的上侧口径：
 *   childrenY = -h/2 - spacingMajor                        （相对父主题盒中心）
 *   maxOffset = max(child.bb.y + child.bb.height - child.h/2)
 *   posY      = childrenY + child.bounds.y - maxOffset - outwardOffset
 *   → 子主题盒**底边** = childrenY - maxOffset - outwardOffset
 * X 堆叠与 down 侧共用同一份代码：按子分支 boundaryBounds 宽（递归子树宽）排布。
 *
 * 旧实现用 `spacing.verticalGap`（DEFAULT 为 0）当层间距、用 topicW 累加的 subtreeMap 当子树宽，
 * 于是子节点与父节点同一水平线、兄弟子树互相重叠 —— 下面每条断言旧代码都会红。
 *
 * 无 styleEngine 环境下：spacingMajor = options.horizontalGap(22)、
 * childGap = spacingMinor(0) + borderWidth(0) = 0、outward = 0（子节点数 < 7）。
 */

import { describe, it, expect } from 'vitest'
import { orgChartUpLayoutAlgorithm, DEFAULT_LAYOUT_OPTIONS } from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'

const SPACING_MAJOR = DEFAULT_LAYOUT_OPTIONS.horizontalGap
const CHILD_GAP = 0

const node = (
  id: string,
  title: string,
  children: readonly NodeDesc[] = [],
): NodeDesc => ({ id, type: id === 'root' ? 'root' : 'topic', attrs: { title }, children: { attached: children } })

/** root → [A(→a1,a2), B]，A 是嵌套的 org-chart-up 分支，B 是叶子 */
const buildDoc = (): NodeDesc =>
  node('root', 'ROOT', [
    node('a', 'AAA', [node('a1', 'A1'), node('a2', 'A2')]),
    node('b', 'BBBBBB'),
  ])

const layout = () => orgChartUpLayoutAlgorithm.layout(buildDoc(), DEFAULT_LAYOUT_OPTIONS).nodes

interface Box { left: number; right: number; top: number; bottom: number }

const boxOf = (id: string, nodes: ReturnType<typeof layout>): Box => {
  const n = nodes.get(id)!
  return { left: n.x, right: n.x + n.width, top: n.y, bottom: n.y + n.height }
}

/** 一棵子树（含自身）的包围盒 */
const subtreeBox = (id: string, children: Record<string, string[]>, nodes: ReturnType<typeof layout>): Box => {
  const own = boxOf(id, nodes)
  let box = { ...own }
  for (const c of children[id] ?? []) {
    const sub = subtreeBox(c, children, nodes)
    box = {
      left: Math.min(box.left, sub.left),
      right: Math.max(box.right, sub.right),
      top: Math.min(box.top, sub.top),
      bottom: Math.max(box.bottom, sub.bottom),
    }
  }
  return box
}

const TREE: Record<string, string[]> = { root: ['a', 'b'], a: ['a1', 'a2'] }

describe('org-chart-up：层间距 = spacingMajor（子主题盒底边贴父主题盒顶边上方）', () => {
  it('子节点在父节点上方，间距为 spacingMajor + maxOffset + outward', () => {
    const nodes = layout()
    const root = boxOf('root', nodes)
    for (const id of ['a', 'b']) {
      const c = boxOf(id, nodes)
      // 叶子 / 纯垂直子树的 maxOffset = 0，子节点数 < 7 → outward = 0
      expect(root.top - c.bottom).toBeCloseTo(SPACING_MAJOR, 6)
    }
  })

  it('递归每一层都按同一口径往上长', () => {
    const nodes = layout()
    const a = boxOf('a', nodes)
    for (const id of ['a1', 'a2']) {
      const gc = boxOf(id, nodes)
      expect(a.top - gc.bottom).toBeCloseTo(SPACING_MAJOR, 6)
    }
  })

  it('整棵子树都在 root 主题盒上方', () => {
    const nodes = layout()
    const root = boxOf('root', nodes)
    for (const id of ['a', 'b', 'a1', 'a2']) {
      expect(boxOf(id, nodes).bottom).toBeLessThanOrEqual(root.top - SPACING_MAJOR + 1e-6)
    }
  })
})

describe('org-chart-up：X 堆叠按子树包围盒宽（兄弟子树不重叠）', () => {
  it('兄弟子树盒相邻，间隔 = spacingMinor + lineWidth', () => {
    const nodes = layout()
    const boxA = subtreeBox('a', TREE, nodes)
    const boxB = subtreeBox('b', TREE, nodes)
    expect(boxB.left - boxA.right).toBeCloseTo(CHILD_GAP, 6)
  })

  it('同一父节点下的叶子兄弟按主题盒宽相邻排列', () => {
    const nodes = layout()
    const a1 = boxOf('a1', nodes)
    const a2 = boxOf('a2', nodes)
    expect(a2.left - a1.right).toBeCloseTo(CHILD_GAP, 6)
  })

  it('子节点中心按 SB levelWidth 口径落位（叶子行：∓(w1+w2)/4）', () => {
    // SB: levelWidth = csw + firstBBx - lastBBw - lastBBx；叶子 bb = 主题盒
    //   → levelWidth = (w1+w2)/2，minChildX = -(w1+w2)/4 - w1/2
    //   → posX(first) = -(w1+w2)/4、posX(last) = +(w1+w2)/4（相对父主题盒中心）
    const nodes = layout()
    const a = boxOf('a', nodes)
    const a1 = boxOf('a1', nodes)
    const a2 = boxOf('a2', nodes)
    const center = (b: Box) => (b.left + b.right) / 2
    const quarter = (a1.right - a1.left + (a2.right - a2.left)) / 4
    expect(center(a1) - center(a)).toBeCloseTo(-quarter, 6)
    expect(center(a2) - center(a)).toBeCloseTo(quarter, 6)
  })
})
