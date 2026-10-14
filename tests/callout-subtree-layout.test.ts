/**
 * callout 子树布局回归测试
 *
 * SB 的 callout 是一条**正常 branchView**（utils/branch.getViewStructure）：
 * - 位置 = 父主题盒原点（shape 中心）+ model.position
 * - attached 子树按 parentStruct.getCalloutStructure(parent, callout) 布局：
 *     · basemap 系（map / map.clockwise / …）→ position.x <= 0 ? LOGICLEFT : LOGICRIGHT（**<=**）
 *     · 其余（AbstractStructure 默认 getChildStructure(STRUCTURECLASS, 0, parent)）
 *       → logic.left/right 返回自身 = **继承父分支的侧**，与 position 符号无关
 * - abstractstructure.calCalloutChildrenPos 还会把 callout 的 boundaryBounds 并进
 *   父分支的 newBounds（→ branch.bounds），父层级再拿它做 X 对齐（Step g）
 *
 * 探针实测（test-callout-branch.xmind）：
 *   callout-on-main-1     父 logic.right  pos(260,-120)  → callout logic.right，子 rel x=+175
 *   callout-neg-x-on-right 父 logic.right pos(-300,180) → callout **logic.right**，子 rel x=+215.5
 *   callout-on-main-2     父 logic.left   pos(-260,120) → callout logic.left，子 rel x=-182
 *   加了这个 x<0 的 callout 后，SB 把**整个右侧 130 个节点**平移了 +286px（bb.x 变了）
 *
 * 旧实现三处错：
 *   1. 解析层 modelSpecialToNodeDesc 把 callout 当 summary/boundary 处理（children: {}）
 *      → 子树在解析阶段就被丢掉
 *   2. placeCallouts 在 layoutNode 内联调用，非中央分支那时还是 layoutSide Step b 的
 *      临时 y=0，而 Step f 的 shiftSubtree 只走 attached → callout 留在临时帧（dy 差 1532px）
 *   3. callout 的 boundaryBounds 不参与父分支 bb
 */

import { describe, it, expect } from 'vitest'
import { mapClockwiseLayoutAlgorithm, DEFAULT_LAYOUT_OPTIONS } from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'

const node = (
  id: string,
  title: string,
  attrs: Record<string, unknown> = {},
  children: Record<string, readonly NodeDesc[]> = {},
): NodeDesc => ({ id, type: id === 'root' ? 'root' : 'topic', attrs: { title, ...attrs }, children })

const lay = (doc: NodeDesc) => mapClockwiseLayoutAlgorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS).nodes

const centerX = (nodes: Map<string, { x: number; width: number }>, id: string) => {
  const n = nodes.get(id)
  if (!n) throw new Error(`节点 ${id} 没有被布局`)
  return n.x + n.width / 2
}

const rootCalloutDoc = (x: number) => node('root', 'ROOT', {}, {
  attached: [node('a', 'AAA'), node('b', 'BBB'), node('c', 'CCC')],
  callout: [node('co', 'CO', { position: { x, y: -400 } }, { attached: [node('co-1', 'CO1')] })],
})

/** callout 挂在右侧主分支 m1 上、position.x = -300（判别「继承父侧」还是「按符号判侧」） */
const branchCalloutDoc = (withCallout: boolean) => node('root', 'ROOT', {}, {
  attached: [
    withCallout
      ? node('m1', 'M1', {}, {
        callout: [node('co', 'CO', { position: { x: -300, y: 100 } }, { attached: [node('co-1', 'CO1')] })],
      })
      : node('m1', 'M1'),
    node('m2', 'M2'), node('m3', 'M3'), node('m4', 'M4'),
  ],
})

describe('callout 的 attached 子树要参与布局', () => {
  it('callout 的子节点出现在布局结果里（旧代码整棵子树丢失）', () => {
    const nodes = lay(rootCalloutDoc(400))
    expect(nodes.has('co')).toBe(true)
    expect(nodes.has('co-1')).toBe(true)
  })

  it('callout 的 branchHeight = 子树包围盒高（SB callout.boundaryBounds.height）', () => {
    // 两个子节点上下堆叠 → 包围盒高于 callout 自己的主题盒
    const doc = node('root', 'ROOT', {}, {
      attached: [node('a', 'AAA'), node('b', 'BBB'), node('c', 'CCC')],
      callout: [node('co', 'CO', { position: { x: 400, y: -400 } }, {
        attached: [node('co-1', 'CO1'), node('co-2', 'CO2')],
      })],
    })
    const nodes = lay(doc)
    const co = nodes.get('co')!
    const c1 = nodes.get('co-1')!
    const c2 = nodes.get('co-2')!
    const top = Math.min(co.y, c1.y, c2.y)
    const bottom = Math.max(co.y + co.height, c1.y + c1.height, c2.y + c2.height)
    expect(co.branchHeight).toBeGreaterThan(co.height)
    expect(co.branchHeight).toBeCloseTo(bottom - top, 6)
  })
})

describe('SB getCalloutStructure 的定侧规则', () => {
  it('中央主题的 callout：position.x > 0 → 子树朝右', () => {
    const nodes = lay(rootCalloutDoc(400))
    expect(centerX(nodes, 'co-1')).toBeGreaterThan(centerX(nodes, 'co'))
  })

  it('中央主题的 callout：position.x < 0 → 子树朝左', () => {
    const nodes = lay(rootCalloutDoc(-400))
    expect(centerX(nodes, 'co-1')).toBeLessThan(centerX(nodes, 'co'))
  })

  it('中央主题的 callout：position.x === 0 → 子树朝左（SB 是 <=，不是 <）', () => {
    const nodes = lay(rootCalloutDoc(0))
    expect(centerX(nodes, 'co-1')).toBeLessThan(centerX(nodes, 'co'))
  })

  it('非中央分支的 callout：继承父分支的侧，position.x 为负也朝右', () => {
    const nodes = lay(branchCalloutDoc(true))
    expect(centerX(nodes, 'co-1')).toBeGreaterThan(centerX(nodes, 'co'))
  })
})

describe('callout 的 boundaryBounds 并进父分支 bounds', () => {
  it('朝父分支反方向伸出的 callout 会把同侧分支整体推出去', () => {
    const a = lay(branchCalloutDoc(true))
    const b = lay(branchCalloutDoc(false))
    // SB：m1 的 bb.x 因为 callout 变负 → Step g 的 X 对齐偏移变化 → 同侧的 m2 也跟着平移
    // （探针实测 demo 内容整侧平移 286px；这里的合成 doc 是 299.5px）
    expect(a.get('m2')!.x).toBeGreaterThan(b.get('m2')!.x + 100)
    // 左侧分支不受影响
    expect(a.get('m3')!.x).toBe(b.get('m3')!.x)
  })
})
