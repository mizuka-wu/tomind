/**
 * treetable 宿主的**多层递归**回归测试（2026-10-30 第六轮头号差距）
 *
 * SB `structures/treetable.startLayout` 是把整棵树摊成一张表
 * （expandTableRowInfoToRight：每行 = 一条根到叶子的路径；supplyTableRowInfoToRight：
 *  短行用最后一个 item 重复补齐 ⇒ 它成为跨列格），只有
 * `stopFlag = 生效结构 !== treetable || shouldCollapse()` 的分支才是「一格塞一棵子树」。
 *
 * TM 旧实现只有「root 一列 + head 委派 logic」一条路，委派不成立时**只放 head 一个盒、不递归**
 * ⇒ 宿主是 treetable 且 d1+ 继承 treetable 时 235 个节点只布局了 13 个
 * （第五轮量到的头号活差距：n=13/235、avgΔY 1454.5）。
 *
 * 量尺：/tmp/noskel-treetable.xmind（`scripts/make-host-control-xmind.mjs treetable`）
 *   修前 X=37.9 Y=1454.5 n=13/235 → 修后 **X=0 Y=0 W=0 H=0 n=235/235**，
 *   root 对齐后 0/235 个节点 |Δ|>2；test-treetable / -labels 仍然 0/0/0/0。
 */

import { describe, it, expect } from 'vitest'
import { SheetState } from '@tomind/state'
import { treeTableLayoutAlgorithm, DEFAULT_LAYOUT_OPTIONS } from '@tomind/layout'
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

/** 无 skeleton ⇒ d1+ 的 preset 缺失 ⇒ SB getViewStructure 继承父结构（= treetable） */
const noSkeleton = (doc: NodeDesc): SheetState => SheetState.create({ doc })

/** skeleton 让子层级是 logic ⇒ head 变成 stop 格（整棵子树委派 logic） */
const logicSkeleton = (doc: NodeDesc): SheetState => SheetState.create({
  doc: {
    ...doc,
    attrs: {
      ...doc.attrs,
      skeletonStructure: {
        centralTopic: 'org.xmind.ui.treetable',
        mainTopic: 'org.xmind.ui.logic.right',
      },
    },
  },
})

const layout = (doc: NodeDesc, state: SheetState) =>
  treeTableLayoutAlgorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS, null, state).nodes

/** 主题盒原点（SB 的 branch position / realPosition）= 盒顶 + shapeHeight/2；无 labels 时 = y + h/2 */
const originY = (nl: { y: number; height: number }) => nl.y + nl.height / 2

const buildTree = () => node('root', 'ROOT', { structureClass: 'org.xmind.ui.treetable' }, [
  node('a', 'A', {}, [node('a1', 'A1'), node('a2', 'A2')]),
  node('b', 'B', {}, [node('b1', 'B1', {}, [node('b11', 'B11')])]),
])

describe('treetable 宿主：d1+ 继承 treetable 时按 SB 摊成整张表', () => {
  it('**每个节点都被布局**（旧实现只放 head 一个盒 ⇒ 222/235 个节点不存在）', () => {
    const doc = buildTree()
    const nodes = layout(doc, noSkeleton(doc))
    expect([...nodes.keys()].sort()).toEqual(['a', 'a1', 'a2', 'b', 'b1', 'b11', 'root'].sort())
  })

  it('同一列（同深度）的节点左边缘对齐 —— SB calcTableCellPosition 按列累加 cellPosition.x', () => {
    const doc = buildTree()
    const nodes = layout(doc, noSkeleton(doc))
    // 列 1 = a / b，列 2 = a1 / a2 / b1，列 3 = b11
    expect(nodes.get('a')!.x).toBe(nodes.get('b')!.x)
    expect(nodes.get('a1')!.x).toBe(nodes.get('b1')!.x)
    expect(nodes.get('a1')!.x).toBeGreaterThan(nodes.get('a')!.x)
    expect(nodes.get('b11')!.x).toBeGreaterThan(nodes.get('b1')!.x)
  })

  it('行 = 根到叶子的路径，按 DFS 顺序往下排（a1 < a2 < b11）', () => {
    const doc = buildTree()
    const nodes = layout(doc, noSkeleton(doc))
    expect(originY(nodes.get('a1')!)).toBeLessThan(originY(nodes.get('a2')!))
    expect(originY(nodes.get('a2')!)).toBeLessThan(originY(nodes.get('b11')!))
    // 同一条路径上的节点共享行 ⇒ a1/a2 同列不同行，b1 与 b11 同一行
    expect(originY(nodes.get('b1')!)).toBeCloseTo(originY(nodes.get('b11')!), 6)
  })

  it('跨行父格在自己的行区间里垂直居中（SB getItemCellXY: (cellHeight - h)/2 + |topicBounds.y|）', () => {
    const doc = buildTree()
    const nodes = layout(doc, noSkeleton(doc))
    // a 跨 a1 / a2 两行，两行等高 ⇒ a 的原点 = 两子节点原点的中点
    expect(originY(nodes.get('a')!)).toBeCloseTo(
      (originY(nodes.get('a1')!) + originY(nodes.get('a2')!)) / 2, 6)
    // root 跨全部 3 行
    expect(originY(nodes.get('root')!)).toBeCloseTo(
      (originY(nodes.get('a1')!) + originY(nodes.get('b11')!)) / 2, 6)
  })
})

describe('treetable 结构的标题折行宽度 = SB TOPIC_MAX_CUSTOM_WIDTH(1024)', () => {
  // SB figures/layoutengine/titlelayoutworker.getResolvedText：
  //   isMatrixMainBranch || isTreeTableStructure ⇒ resolveString(text, fontInfo, 1024)，
  //   其余分支才是默认 TITLE_MAX_WIDTH(300)
  const long = '长'.repeat(40)

  it('treetable 宿主下的节点按 1024 折行 ⇒ 长标题单行、盒宽 > 300', () => {
    const doc = node('root', 'ROOT', { structureClass: 'org.xmind.ui.treetable' }, [
      node('a', long),
      node('s', '短'),
    ])
    const nodes = layout(doc, noSkeleton(doc))
    const a = nodes.get('a')!
    expect(a.width).toBeGreaterThan(300)
    // 单行 ⇒ 标题高与短标题（必然单行）相同
    expect(a.titleHeight).toBe(nodes.get('s')!.titleHeight)
  })

  it('同一棵树里被委派出去的 logic 子树仍按 300 折行（生效结构不是 treetable）', () => {
    const doc = node('root', 'ROOT', { structureClass: 'org.xmind.ui.treetable' }, [
      node('a', long, {}, [node('a1', 'A1')]),
      node('s', '短'),
    ])
    const nodes = layout(doc, logicSkeleton(doc))
    // head 是 stop 格（eff = logic.right）⇒ 它按 300 折行：盒宽被夹住、标题变成多行
    const a = nodes.get('a')!
    expect(a.width).toBeLessThanOrEqual(300 + 12)
    expect(a.titleHeight).toBeGreaterThan(nodes.get('s')!.titleHeight)
  })
})

describe('treetable 宿主：stop 格（生效结构变了的分支）整棵子树塞进一格', () => {
  it('skeleton 是 logic 时 head 的子树全部落位（委派路径不回归）', () => {
    const doc = buildTree()
    const nodes = layout(doc, logicSkeleton(doc))
    expect([...nodes.keys()].sort()).toEqual(['a', 'a1', 'a2', 'b', 'b1', 'b11', 'root'].sort())
  })

  it('stop 格的格高用**子树 bb**而不是主题盒 ⇒ 行高随子树高度增长', () => {
    const shallow = node('root', 'ROOT', { structureClass: 'org.xmind.ui.treetable' }, [
      node('a', 'A'),
      node('b', 'B'),
    ])
    const deep = node('root', 'ROOT', { structureClass: 'org.xmind.ui.treetable' }, [
      node('a', 'A', {}, [node('a1', 'A1'), node('a2', 'A2')]),
      node('b', 'B'),
    ])
    const s = layout(shallow, logicSkeleton(shallow))
    const d = layout(deep, logicSkeleton(deep))
    // 深的那份里 a 的子树占两行 ⇒ b 被推得更下
    expect(originY(d.get('b')!) - originY(d.get('a')!)).toBeGreaterThan(
      originY(s.get('b')!) - originY(s.get('a')!))
  })
})
