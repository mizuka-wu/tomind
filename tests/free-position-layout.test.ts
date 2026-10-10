/**
 * 自由定位（topicPositioning=free）回归测试
 *
 * 守护的根因：map 布局 Step g 的 X offset 对齐曾经用「上一趟布局的绝对
 * boundaryBounds」减「当前趟的绝对 x」。自由定位分支要到 Step f 才整体平移，
 * 两趟绝对坐标不一致，于是每层递归都叠加一份虚假偏移（实测每层 635px，
 * 逐层累加到第 4 层 1905px）。
 *
 * SB 的 xOffset 是纯局部量（topicView.bounds 与 boundaryBounds 同帧相减），
 * 与绝对坐标无关，因此整棵子树必须随自由定位分支刚性平移。
 */

import { describe, it, expect } from 'vitest'
import { SheetState } from '@tomind/state'
import { mapClockwiseLayoutAlgorithm, DEFAULT_LAYOUT_OPTIONS } from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'

const node = (
  id: string,
  type: string,
  attrs: Record<string, unknown> = {},
  children: Record<string, readonly NodeDesc[]> = {},
): NodeDesc => ({ id, type, attrs, children })

/** A 分支带 4 层子树，用于观察偏移是否逐层累加 */
const buildDoc = (freePosition: boolean): NodeDesc => {
  const a111 = node('a111', 'topic', { title: 'A111' })
  const a11 = node('a11', 'topic', { title: 'A11' }, { attached: [a111] })
  const a1 = node('a1', 'topic', { title: 'A1' }, { attached: [a11] })
  const a = node(
    'a',
    'topic',
    freePosition ? { title: 'A', position: { x: -400, y: 600 } } : { title: 'A' },
    { attached: [a1] },
  )
  const b = node('b', 'topic', { title: 'B' })
  const c = node('c', 'topic', { title: 'C' })
  const d = node('d', 'topic', { title: 'D' })

  return node(
    'root',
    'root',
    freePosition ? { title: 'Root', topicPositioning: 'free' } : { title: 'Root' },
    { attached: [a, b, c, d] },
  )
}

const layoutWith = (doc: NodeDesc) => {
  const state = SheetState.create({ doc })
  return mapClockwiseLayoutAlgorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS, null, state).nodes
}

describe('map-clockwise 自由定位', () => {
  it('自由定位分支的子树随分支刚性平移（相对位置不变）', () => {
    const fixed = layoutWith(buildDoc(false))
    const free = layoutWith(buildDoc(true))

    const ids = ['a', 'a1', 'a11', 'a111']
    const relFixed = ids.slice(1).map(id => fixed.get(id)!.x - fixed.get('a')!.x)
    const relFree = ids.slice(1).map(id => free.get(id)!.x - free.get('a')!.x)

    // 旧实现下 relFree 会逐层多出 635/1270/1905 的虚假偏移
    expect(relFree).toEqual(relFixed)

    const relFixedY = ids.slice(1).map(id => fixed.get(id)!.y - fixed.get('a')!.y)
    const relFreeY = ids.slice(1).map(id => free.get(id)!.y - free.get('a')!.y)
    expect(relFreeY).toEqual(relFixedY)
  })

  it('自由定位分支的中心落在 root 中心 + position 处', () => {
    const free = layoutWith(buildDoc(true))
    const root = free.get('root')!
    const a = free.get('a')!
    const rootCenterX = root.x + root.width / 2
    const aCenterX = a.x + a.width / 2
    expect(aCenterX - rootCenterX).toBeCloseTo(-400, 5)

    const rootCenterY = root.y + root.height / 2
    const aCenterY = a.y + a.height / 2
    expect(aCenterY - rootCenterY).toBeCloseTo(600, 5)
  })

  it('未开启 topicPositioning 时忽略 position', () => {
    // attrs 里带 position 但 doc.attrs.topicPositioning 不为 free → 走常规顺时针布局
    const doc = buildDoc(true)
    const rootAttrs = { ...doc.attrs }
    delete rootAttrs.topicPositioning
    const plain: NodeDesc = { ...doc, attrs: rootAttrs }
    const nodes = layoutWith(plain)
    const fixed = layoutWith(buildDoc(false))
    for (const id of ['a', 'a1', 'a11', 'a111']) {
      expect(nodes.get(id)!.x).toBeCloseTo(fixed.get(id)!.x, 5)
      expect(nodes.get(id)!.y).toBeCloseTo(fixed.get(id)!.y, 5)
    }
  })
})
