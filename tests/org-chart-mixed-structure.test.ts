/**
 * org-chart 混合结构 / 嵌套递归回归测试（fixture：test-org-mixed / test-org-nested）
 *
 * 三条 SB 口径，此前 TM 都不对：
 *
 * 1. **子结构逐节点判定**（SB utils/branch.getViewStructure）：
 *      preset = 节点自己的 structure-class || skeleton[getActivedClassName(view)]
 *      preset ∈ parentStruct.getAvailableChildStructure(...) → 用 preset
 *    orgchartupanddown **没有**覆写 getAvailableChildStructure / getChildStructure，
 *    继承 AbstractStructure：available = ATTACHED_EXPOSED_STRUCTURE（含 logic.left/right）、
 *    getChildStructure = parentStructure ⇒ org-chart 下单个分支显式声明 logic.right
 *    就整棵横向长。旧实现只读 skeleton、还按层取**一个**值套给全部子节点。
 *    （探针实测：SB 给该分支 eff=logic.right、4 个后代跟着 logic.right；
 *      TM 全按 org-chart.down 递归 → avgΔX 188.4 / avgΔY 84.3）
 *
 * 2. **outward 的 elbow 排除是精确相等**（SB layoutstyleoptimization：
 *    `lineStyle !== BRANCHCONNECTION.ROUNDEDELBOW && lineStyle !== BRANCHCONNECTION.ELBOW`）。
 *    旧实现三处都写 `lineClass.includes('elbow')`，而主题给的是
 *    `org.xmind.branchConnection.roundedElbow`（大写 E）→ 判不出来，
 *    7 子分支 ΣbbW=1489 多算 0.09*(1489-1000) = 44.01px。
 *
 * 3. **重对齐阈值用循环之后的 childrenWidth**（= minChildX + childrenSize.width），
 *    不是 childrenSize.width。见 orgRealignOffset 的注释。
 */

import { describe, it, expect } from 'vitest'
import {
  orgChartDownLayoutAlgorithm,
  orgRealignOffset,
  isElbowLineClass,
  DEFAULT_LAYOUT_OPTIONS,
} from '@tomind/layout'
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

const lay = (doc: NodeDesc) => orgChartDownLayoutAlgorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS).nodes

describe('org-chart：子节点自身显式声明的 structure-class 要生效', () => {
  it('显式 logic.right 的分支整棵横向长（旧实现按 org 递归、子节点长在正下方）', () => {
    const doc = node('root', 'ROOT', { structureClass: 'org.xmind.ui.org-chart.down' }, [
      node('a', 'A'),
      node('b', 'B', { structureClass: 'org.xmind.ui.logic.right' }, [
        node('b1', 'B1', {}, [node('b1a', 'B1A')]),
        node('b2', 'B2'),
      ]),
      node('c', 'C'),
    ])
    const n = lay(doc)
    const b = n.get('b')!
    const b1 = n.get('b1')!
    const b1a = n.get('b1a')!
    // logic.right：子节点在父节点**右侧**、垂直方向以父原点为中心分布
    expect(b1.x).toBeGreaterThan(b.x + b.width)
    expect(b1a.x).toBeGreaterThan(b1.x + b1.width)
    // 而 org-chart.down 的兄弟分支 a/c 仍然长在 root 下方
    const a = n.get('a')!
    const root = n.get('root')!
    expect(a.y).toBeGreaterThan(root.y + root.height)
  })

  it('没有显式 structure-class 时仍按父结构递归 org（子节点长在正下方）', () => {
    const doc = node('root', 'ROOT', { structureClass: 'org.xmind.ui.org-chart.down' }, [
      node('a', 'A', {}, [node('a1', 'A1'), node('a2', 'A2')]),
      node('b', 'B'),
      node('c', 'C'),
    ])
    const n = lay(doc)
    const a = n.get('a')!
    const a1 = n.get('a1')!
    expect(a1.y).toBeGreaterThan(a.y + a.height)
  })
})

describe('isElbowLineClass：SB 是精确相等，不是子串匹配', () => {
  it('roundedElbow 的 URI 与短名都要认出来（旧实现 includes("elbow") 漏掉大写 E）', () => {
    expect(isElbowLineClass('org.xmind.branchConnection.roundedElbow')).toBe(true)
    expect(isElbowLineClass('roundedElbow')).toBe(true)
    expect(isElbowLineClass('org.xmind.branchConnection.elbow')).toBe(true)
    expect(isElbowLineClass('elbow')).toBe(true)
  })

  it('其它线型不算 elbow；SB 的 BRANCHCONNECTION 里没有 skewElbow（被注释掉了）', () => {
    expect(isElbowLineClass('org.xmind.branchConnection.curve')).toBe(false)
    expect(isElbowLineClass('curve')).toBe(false)
    expect(isElbowLineClass('org.xmind.branchConnection.straight')).toBe(false)
    expect(isElbowLineClass('org.xmind.branchConnection.roundedfold')).toBe(false)
    expect(isElbowLineClass('org.xmind.branchConnection.skewElbow')).toBe(false)
    expect(isElbowLineClass('')).toBe(false)
    expect(isElbowLineClass(undefined)).toBe(false)
  })
})

describe('orgRealignOffset：阈值口径 = 循环之后的 childrenWidth', () => {
  // SB: isNeedRedolayout = count>=3 && |offset| < min(30, childrenSize * 0.15)
  // 其中 childrenSize = currentChildX - spacingMinor - lineWidth = minChildX + Σ(bbW+gap)
  it('子节点少于 3 个不重对齐', () => {
    expect(orgRealignOffset([0, 10], 1000, 2)).toBe(0)
  })

  it('|最近子节点| 在阈值内 → 返回它（把该子节点吸到父正下方）', () => {
    expect(orgRealignOffset([-40, 3, 60], 1000, 3)).toBe(3)
  })

  it('超过 30 的硬上限不重对齐', () => {
    expect(orgRealignOffset([-40, 29.5, 60], 100, 3)).toBe(0)
  })

  it('childrenWidth 比 childrenW 小 → 阈值更严（这正是旧实现用错的地方）', () => {
    // childrenW = 200，minChildX = -120 → childrenWidth = 80
    // |best| = 15：15 < 200*0.15=30（旧口径会重对齐），但 15 >= 80*0.15=12？ 不，15 >= 12 → 不重对齐
    expect(orgRealignOffset([-100, 15, 105], 80, 3)).toBe(0)
    // 同一个 best 在旧口径（childrenW=200）下会被误判成需要重对齐
    expect(orgRealignOffset([-100, 15, 105], 200, 3)).toBe(15)
  })
})
