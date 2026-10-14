/**
 * skeleton 结构样式「按 className 精确取」回归测试
 *
 * SB utils/branch.getViewStructure（branchview.updateStructure 调的就是它，
 * 所以 branchView.getStructureClass() 也是这套语义）：
 *   presetStructure = modelStructure || skeletonStructureStyle[getActivedClassName(view)]
 * 取不到 preset → `getChildStructure(parentStructure, index, parent)`（= 继承父结构）。
 * **没有「subTopic 缺失就退回 mainTopic」这回事。**
 *
 * TM 旧实现的 `sk[role] ?? sk.mainTopic` 兜底会在「父分支被显式改成别的结构」时污染后代：
 * test-org-mixed（skeleton 两层都写 org-chart.down、mains[1] 显式 logic.right）里
 * SB 给 mains[1] 的 26 个后代 eff = logic.right，TM 兜底拿到 org-chart.down
 * （而它恰好在 RIGHT_EXPOSED 里）→ conn-parity 结构类 26 个节点不一致、
 * 连线几何 mean 3.32 / max 71.47。
 */

import { describe, it, expect } from 'vitest'
import { getStructurePreset, getEffectiveStructureClass } from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'

const ORG_DOWN = 'org.xmind.ui.org-chart.down'
const LOGIC_RIGHT = 'org.xmind.ui.logic.right'

const doc: NodeDesc = {
  id: 'root',
  type: 'root',
  // skeleton 只声明了 centralTopic / mainTopic（demo 系 fixture 就是这样，没有 subTopic）
  attrs: { title: 'R', structureClass: ORG_DOWN, skeletonStructure: { centralTopic: ORG_DOWN, mainTopic: ORG_DOWN } },
  children: {
    attached: [
      {
        id: 'm1', type: 'topic', attrs: { title: 'M1', structureClass: LOGIC_RIGHT },
        children: { attached: [{ id: 's1', type: 'topic', attrs: { title: 'S1' }, children: {} }] },
      },
      {
        id: 'm2', type: 'topic', attrs: { title: 'M2' },
        children: { attached: [{ id: 's2', type: 'topic', attrs: { title: 'S2' }, children: {} }] },
      },
    ],
  },
}

const byId = (id: string): NodeDesc => {
  const walk = (n: NodeDesc): NodeDesc | null => {
    if (n.id === id) return n
    for (const g of Object.values(n.children ?? {})) {
      for (const c of g) { const r = walk(c); if (r) return r }
    }
    return null
  }
  return walk(doc)!
}

describe('getStructurePreset（SB getViewStructure 的 presetStructure）', () => {
  it('节点自己声明的 structure-class 优先', () => {
    expect(getStructurePreset(doc, byId('m1'))).toBe(LOGIC_RIGHT)
  })

  it('skeleton 按 className 精确取：mainTopic 命中', () => {
    expect(getStructurePreset(doc, byId('m2'))).toBe(ORG_DOWN)
  })

  it('skeleton 没声明 subTopic → 返回 null（不退回 mainTopic），交给「继承父结构」', () => {
    // 旧实现这里会返回 sk.mainTopic = org-chart.down，把 logic.right 分支的后代判成 org-chart
    expect(getStructurePreset(doc, byId('s1'))).toBeNull()
    expect(getStructurePreset(doc, byId('s2'))).toBeNull()
  })

  it('中央主题取 skeleton.centralTopic', () => {
    expect(getStructurePreset(doc, doc)).toBe(ORG_DOWN)
  })

  it('没有 skeleton 时只看节点自身声明', () => {
    const bare: NodeDesc = {
      id: 'root', type: 'root', attrs: { title: 'R' },
      children: { attached: [{ id: 'a', type: 'topic', attrs: { title: 'A', structureClass: LOGIC_RIGHT }, children: {} }] },
    }
    expect(getStructurePreset(bare, bare)).toBeNull()
    expect(getStructurePreset(bare, bare.children.attached[0])).toBe(LOGIC_RIGHT)
  })

  it('对照：getEffectiveStructureClass 仍保留 mainTopic 兜底（布局的结构族判定在用）', () => {
    expect(getEffectiveStructureClass(doc, byId('s1'))).toBe(ORG_DOWN)
  })
})
