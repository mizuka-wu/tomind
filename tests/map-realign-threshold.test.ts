/**
 * map 布局非中央层级 posYoffsetToClosestChild 重对齐阈值回归测试
 *
 * SB isNeedRedolayout(children, offset, childrenSize) 的 childrenSize 两套结构口径不同：
 *   basemap.calSidePos（中央分支）    → Σ(bbH + spacingMinor) - spacingMinor
 *   logicleftandright（非中央层级）   → 循环后的 currentChildY - spacingMinor - lineWidth
 *                                     = childrenY + totalH（含起点，约为 totalH 的一半）
 * TM 的 map 布局之前对两种层级都用中央分支那套（纯高度和），阈值偏大约一倍，
 * 本该「不重对齐」的节点被重对齐，父主题相对自己的子树整体偏移
 * （demo.xmind 实测 9 个节点偏 -19px、其余 6 个偏 -9.5~+23.5px，avgΔY 1.6）。
 *
 * 6 个等高叶子子节点时：offset = 0.5*(H+minor)，childrenHeight = 2.5*(H+minor)，
 * 阈值 = min(30, 0.375*(H+minor)) 恒小于 offset → 永不应重对齐，
 * 即父主题中心必须与子节点中心均值重合。
 */

import { describe, it, expect } from 'vitest'
import { mapClockwiseLayoutAlgorithm, DEFAULT_LAYOUT_OPTIONS } from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'

const node = (
  id: string,
  type: string,
  attrs: Record<string, unknown> = {},
  children: Record<string, readonly NodeDesc[]> = {},
): NodeDesc => ({ id, type, attrs, children })

describe('map 布局非中央层级重对齐阈值', () => {
  it('6 个等高叶子子节点时不重对齐（父中心 = 子中心均值）', () => {
    const leaves = Array.from({ length: 6 }, (_, i) => node(`c${i}`, 'topic', { title: `Child ${i}` }))
    const a = node('a', 'topic', { title: 'A' }, { attached: leaves })
    const doc = node('root', 'root', { title: 'Root' }, { attached: [a] })

    const nodes = mapClockwiseLayoutAlgorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS).nodes
    const centerOf = (id: string) => {
      const nl = nodes.get(id)!
      return nl.y + nl.height / 2
    }
    const childCenters = leaves.map((c) => centerOf(c.id))
    const mean = childCenters.reduce((s, v) => s + v, 0) / childCenters.length

    expect(centerOf('a')).toBeCloseTo(mean, 6)
  })

  it('子节点等高时相邻间距一致（未被重对齐打乱）', () => {
    const leaves = Array.from({ length: 6 }, (_, i) => node(`c${i}`, 'topic', { title: `Child ${i}` }))
    const a = node('a', 'topic', { title: 'A' }, { attached: leaves })
    const doc = node('root', 'root', { title: 'Root' }, { attached: [a] })

    const nodes = mapClockwiseLayoutAlgorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS).nodes
    const tops = leaves.map((c) => nodes.get(c.id)!.y)
    const gaps = tops.slice(1).map((v, i) => v - tops[i])
    for (const g of gaps) expect(g).toBeCloseTo(gaps[0], 6)
  })
})
