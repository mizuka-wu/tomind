/**
 * map（basemap）宿主的两条 SB 公式回归 —— 2026-10-30 第六轮
 *
 * 1) `abstractstructure.getOffsetForChildBranchView`：X 对齐偏移**逐子节点**取
 *    - `isSpecialOffSetBranchView` = matrix 主分支 / **treetable 头分支**
 *      （生效结构 ∈ TABLE_LIKE_STRUCTURE_LIST）→ 用**自己的** xOffset，且不参与整层的 max
 *    - 普通分支 → 同侧所有普通分支 xOffset 的 max
 *    treetable 子树的 bb.x 比主题盒左边缘多出 extendW/2（格子 padding）⇒ xOffset 恒为正，
 *    一刀切算进整层 max 会把同层其它分支多推一份
 *    （实测 probe-map.clockwise+treetable：avgΔX 277.7 → 0）。
 *
 * 2) `basemap.getWeight(branch) = branch.boundaryBounds.height + (PADDING/2)*3`
 *    ⇒ calcNumRight 的权重必须是**子树布局完之后的 bb 高**，不是「Σ 子节点盒高」的近似值。
 *    近似值对纯 logic 子树凑巧给出同样的分侧点，但被委派出去的子树形状完全不同
 *    （tree 更高、org-chart 更矮）⇒ 分侧点会错
 *    （实测 probe-map.clockwise+org-chart.down：329.1 / 317.5 → 0 / 0）。
 */

import { describe, it, expect } from 'vitest'
import { mapClockwiseLayoutAlgorithm, DEFAULT_LAYOUT_OPTIONS } from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'

const node = (
  id: string,
  title: string,
  attrs: Record<string, unknown> = {},
  children: readonly NodeDesc[] = [],
): NodeDesc => ({
  id,
  type: id === 'root' ? 'root' : 'topic',
  attrs: { title, ...attrs },
  children: { attached: children },
})

/** 每个主分支 3 个子分支、每个子分支 2 个叶子 ⇒ 子树够大，bb 与近似值的差才量得出来 */
const branch = (tag: string, structureClass?: string) => node(`m${tag}`, `M${tag}`, structureClass ? { structureClass } : {}, [
  node(`m${tag}a`, 'A', {}, [node(`m${tag}a1`, 'A1'), node(`m${tag}a2`, 'A2')]),
  node(`m${tag}b`, 'B', {}, [node(`m${tag}b1`, 'B1'), node(`m${tag}b2`, 'B2')]),
  node(`m${tag}c`, 'C', {}, [node(`m${tag}c1`, 'C1'), node(`m${tag}c2`, 'C2')]),
])

const lay = (firstBranchStructure?: string) => {
  const doc = node('root', 'ROOT', { structureClass: 'org.xmind.ui.map.clockwise' }, [
    branch('0', firstBranchStructure), branch('1'), branch('2'), branch('3'),
  ])
  return mapClockwiseLayoutAlgorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS).nodes
}

const x = (nodes: Map<string, { x: number }>, id: string) => nodes.get(id)!.x

describe('map 宿主的 X 对齐偏移按 SB getOffsetForChildBranchView 分流', () => {
  it('treetable 头分支是 special：只推自己，不推同层的普通分支', () => {
    const base = lay()
    const tt = lay('org.xmind.ui.treetable')
    // 自己被推出去（xOffset = extendW/2 > 0）
    expect(x(tt, 'm0')).toBeGreaterThan(x(base, 'm0'))
    // 同侧的 m1 不受影响（旧实现会跟着一起被推）
    expect(x(tt, 'm1')).toBe(x(base, 'm1'))
  })

  it('org-chart 是普通分支：它的 xOffset 变成整层的 max ⇒ 同侧分支一起被推', () => {
    const base = lay()
    const org = lay('org.xmind.ui.org-chart.down')
    expect(x(org, 'm0')).toBeGreaterThan(x(base, 'm0'))
    expect(x(org, 'm1')).toBe(x(org, 'm0'))
  })
})

describe('map 宿主 calcNumRight 的权重 = SB boundaryBounds.height + 30', () => {
  it('被委派子树的 bb 高改变分侧点（tree.right 更高 ⇒ 少分一个到右侧）', () => {
    const base = lay()
    const tree = lay('org.xmind.ui.tree.right')
    // 基线：m0/m1 在右，m2/m3 在左（numRight = 2）
    expect(x(base, 'm1')).toBeGreaterThan(x(base, 'root'))
    // m0 换成 tree.right 后子树 bb 高一倍多 ⇒ 权重过半 ⇒ numRight = 1，m1 被分到左侧
    expect(x(tree, 'm1')).toBeLessThan(x(tree, 'root'))
  })

  it('org-chart 子树更矮 ⇒ 权重变小，但同侧其余分支的相对顺序不变', () => {
    const base = lay()
    const org = lay('org.xmind.ui.org-chart.down')
    expect(org.get('m0')!.branchHeight).toBeLessThan(base.get('m0')!.branchHeight)
    expect(x(org, 'm2')).toBe(x(base, 'm2'))
  })
})
