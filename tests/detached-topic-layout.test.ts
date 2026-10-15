/**
 * 自由主题（children.detached）落位回归测试 — SB abstractstructure.calDetachedChildrenPos
 *
 * SB（只对**中央分支**生效）：
 *   isTopicOverlapping(sheet.topicOverlapping === 'overlap') && model.position
 *     → setPosition(modelPosition)
 *   否则 → HitDetectInstance.calcRealPosition(branch, allBranchViewList)
 * 结构类（utils/branch.getViewStructure）：
 *   presetStructure = 自身 structure-class || skeleton[className=floatingTopic] 有定义就用它，
 *   否则 model.position.x < 0 ? LOGICLEFT : LOGICRIGHT（**严格 <**，x=0 归右，
 *   与 callout 的 `<=` 不同）
 *
 * 探针实测（scripts/sb-detached.mjs，test-detached.xmind；sheet 没有 topicOverlapping →
 * isTopicOverlapping = false → 走 HitDetect，但三个 detached 都放得足够远）：
 *   det-right (1600,-1000)  shiftFromModel (0,0) → logic.right，子 rel (123,∓19)
 *   det-left  (-1600,1000)  shiftFromModel (0,0) → logic.left， 子 rel (-118,∓19)
 *   det-zero  (0,-2000)     shiftFromModel (0,0) → **logic.right**
 * 即「不重叠时 HitDetect 原样返回 model position」。
 * ⚠️ 主题重叠时 SB 会推开（OldHitDetect 577 行，已判搁置）→ TM 不做，那种 fixture 会差位移量。
 *
 * 修复前：解析层不认 `children.detached` → test-detached 四项 Δ 全 0 却是 **235/244**
 * （3 个 detached + 6 个后代根本不存在）。修复后 244/244 全 0、conn-parity 边数 243/243。
 */

import { describe, it, expect } from 'vitest'
import {
  LayoutEngine,
  mapClockwiseLayoutAlgorithm,
  getDetachedChildren,
  detachedSide,
  DEFAULT_LAYOUT_OPTIONS,
} from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'
import { SheetState } from '@tomind/state'
import { StyleEngine, DEFAULT_STYLES } from '@tomind/style'

const node = (
  id: string,
  title: string,
  attrs: Record<string, unknown> = {},
  children: Record<string, readonly NodeDesc[]> = {},
): NodeDesc => ({ id, type: id === 'root' ? 'root' : 'topic', attrs: { title, ...attrs }, children })

const detDoc = (): NodeDesc =>
  node('root', 'ROOT', { structureClass: 'org.xmind.ui.map.clockwise' }, {
    attached: [node('m1', 'M1'), node('m2', 'M2')],
    detached: [
      node('det-right', 'R', { position: { x: 1600, y: -1000 } }, {
        attached: [node('det-right-c1', 'R1'), node('det-right-c2', 'R2')],
      }),
      node('det-left', 'L', { position: { x: -1600, y: 1000 } }, {
        attached: [node('det-left-c1', 'L1'), node('det-left-c2', 'L2')],
      }),
      node('det-zero', 'Z', { position: { x: 0, y: -2000 } }),
    ],
  })

const compute = (doc: NodeDesc) => {
  const state = SheetState.create({ doc })
  const engine = new LayoutEngine()
  engine.register(mapClockwiseLayoutAlgorithm)
  engine.setStyleEngine(new StyleEngine())
  return { nodes: engine.compute(state, DEFAULT_LAYOUT_OPTIONS).nodes, state }
}

/** 主题盒原点（shape 中心）；测试里的节点都没有 labels → originY = height/2 */
const originOf = (nodes: Map<string, { x: number; y: number; width: number; height: number }>, id: string) => {
  const n = nodes.get(id)
  if (!n) throw new Error(`节点 ${id} 没有被布局`)
  return { x: n.x + n.width / 2, y: n.y + n.height / 2 }
}

describe('detached 子树要真的被布局出来', () => {
  it('3 个 detached + 4 个后代全部出现在布局结果里（旧代码整棵不存在）', () => {
    const { nodes } = compute(detDoc())
    for (const id of ['det-right', 'det-right-c1', 'det-right-c2', 'det-left', 'det-left-c1', 'det-left-c2', 'det-zero']) {
      expect(nodes.has(id), id).toBe(true)
    }
  })

  it('落位 = 中央主题原点 + model.position（SB setPosition(modelPosition)）', () => {
    const { nodes } = compute(detDoc())
    const root = originOf(nodes, 'root')
    const cases: Array<[string, number, number]> = [
      ['det-right', 1600, -1000],
      ['det-left', -1600, 1000],
      ['det-zero', 0, -2000],
    ]
    for (const [id, px, py] of cases) {
      const o = originOf(nodes, id)
      expect(o.x - root.x).toBeCloseTo(px, 6)
      expect(o.y - root.y).toBeCloseTo(py, 6)
    }
  })

  it('attached 分支的落位不受 detached 影响（SB 只把 detached 并进 newBounds，不改子节点位置）', () => {
    const withDet = compute(detDoc()).nodes
    const without = compute(node('root', 'ROOT', { structureClass: 'org.xmind.ui.map.clockwise' }, {
      attached: [node('m1', 'M1'), node('m2', 'M2')],
    })).nodes
    for (const id of ['m1', 'm2']) {
      expect(withDet.get(id)!.x - withDet.get('root')!.x).toBeCloseTo(without.get(id)!.x - without.get('root')!.x, 6)
      expect(withDet.get(id)!.y - withDet.get('root')!.y).toBeCloseTo(without.get(id)!.y - without.get('root')!.y, 6)
    }
  })
})

describe('detached 的子树按 logic 长，侧向 = position.x < 0（严格 <）', () => {
  it('x>0 → logic.right：子节点在父盒右侧', () => {
    const { nodes } = compute(detDoc())
    const p = nodes.get('det-right')!
    expect(nodes.get('det-right-c1')!.x).toBeGreaterThanOrEqual(p.x + p.width)
  })

  it('x<0 → logic.left：子节点在父盒左侧', () => {
    const { nodes } = compute(detDoc())
    const p = nodes.get('det-left')!
    const c = nodes.get('det-left-c1')!
    expect(c.x + c.width).toBeLessThanOrEqual(p.x)
  })

  it('x=0 → logic.right（严格 <，与 callout 的 <= 不同）', () => {
    const doc = detDoc()
    const det = getDetachedChildren(doc).find((d) => d.id === 'det-zero')!
    expect(detachedSide(doc, det, 0)).toBe('right')
    expect(detachedSide(doc, det, -0.5)).toBe('left')
  })

  it('自身显式 structure-class 优先于 position 符号', () => {
    const doc = node('root', 'ROOT', {}, {
      detached: [node('d', 'D', { position: { x: 900, y: 0 }, structureClass: 'org.xmind.ui.logic.left' })],
    })
    const det = getDetachedChildren(doc)[0]
    expect(detachedSide(doc, det, 900)).toBe('left')
  })

  it('子节点纵向堆叠在同一侧（logic），不是各自交替', () => {
    const { nodes } = compute(detDoc())
    expect(nodes.get('det-right-c2')!.x).toBeCloseTo(nodes.get('det-right-c1')!.x, 6)
    expect(nodes.get('det-right-c2')!.y).not.toBeCloseTo(nodes.get('det-right-c1')!.y, 6)
  })
})

describe('floatingTopic 的默认样式 = SB stableStyles（不是 COMPACT_LAYOUT_PARAMS）', () => {
  // 旧值 9pt/9pt/9pt/9pt/24pt/5pt 是从 COMPACT_LAYOUT_PARAMS.floatingTopic 抄来的。
  // 实测 test-detached：主题盒窄 4px（92 vs 88）、detached 的子节点层间距少 2px、
  // 兄弟间距少 3px（SB 38 vs TM 35）→ 9 个节点全错。
  it('margin 11pt / spacingMajor 26pt / spacingMinor 8pt', () => {
    const f = DEFAULT_STYLES.floatingTopic
    expect(f.marginLeft).toBe('11pt')
    expect(f.marginRight).toBe('11pt')
    expect(f.marginTop).toBe('11pt')
    expect(f.marginBottom).toBe('11pt')
    expect(f.spacingMajor).toBe('26pt')
    expect(f.spacingMinor).toBe('8pt')
  })

  it('borderColor = #333333（SB BORDER_LINE_COLOR；BORDER_LINE_WIDTH 0pt → 不画）', () => {
    expect(DEFAULT_STYLES.floatingTopic.borderColor).toBe('#333333')
    expect(DEFAULT_STYLES.floatingTopic.borderWidth).toBe('0pt')
  })

  it('detached 节点解析成 floatingTopic 类（槽位判定），主题盒比 subTopic 宽', () => {
    const { nodes, state } = compute(detDoc())
    const engine = new StyleEngine()
    // 11pt margin × 2 → 主题盒 = 标题宽 + 22；同标题的 subTopic 是 +12（6pt × 2）
    const detBox = nodes.get('det-zero')!
    const style = engine.computeStyle(state, 'det-zero')
    expect(style.marginLeft).toBe(11)
    expect(detBox.width).toBeGreaterThan(detBox.titleWidth + 20)
  })
})
