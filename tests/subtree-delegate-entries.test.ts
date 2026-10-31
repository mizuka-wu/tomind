/**
 * 第七轮（2026-10-31）：**关掉最后一条 n 造假路径** + 顺带挖出的四条
 *
 * n 造假的通用病灶（第六轮总结）：宿主的 stop 格 / cell / 骨子分支在
 * `delegationOf(eff) === null` 时 fallback **只放一个盒、不递归** ⇒ 整棵子树不存在。
 * 第六轮清掉了 treetable(13/235) / matrix(63/235) / fishbone(63/235)，
 * 但「被委派方 = sided.horizontal / through.vertical / timeline.vertical /
 * spreadsheet(.column) / fishbone」这五个生效结构 TM 根本没有子树入口 ⇒ 换个人声明就照旧丢节点。
 * 本轮把五个入口全补齐，实测（探针 fixture，已进 public/ 与 compare-all-fixtures.sh）：
 *
 * | 探针 | 修前 | 修后 |
 * |---|---|---|
 * | treetable × sided.horizontal   | 0 / 193.7  **n=203/235** | 0 / 0 **n=235/235** |
 * | treetable × through.vertical   | 17.7 / 255.2 **n=203/235** | 0 / 0 |
 * | treetable × timeline.vertical  | 5.5 / 298.8 **n=203/235** | 0 / 0 |
 * | treetable × fishbone.leftHeaded| 0 / 209.5 **n=203/235** | 0 / 0 |
 * | spreadsheet × spreadsheet.column| 0.1 / 185.8 **n=220/235** | 0 / 0 |
 * | spreadsheet × through/sided/vertical/fishbone | 各 **n=220/235** | 0 / 0 |
 * | fishbone × spreadsheet / timeline.* | 135~192 **n=220/235** | 0 / 0 |
 * | fishbone × fishbone.leftHeaded | 192.3 / 8.3 **n=220/235** | 0 / 0 |
 * | treetable × map.clockwise / spreadsheet | 0 / 0 n=235（**声明无效**，对照组） | 不变 |
 *
 * 顺带四条：matrix 转置（spreadsheet.column）、matrix 的空标签行高与 `matrixView.getSize()`
 * 的加号视图、matrix 宿主自己的标题按 1024 折行、fishbone 嵌套同向鱼骨的 baseX 修正、
 * map.unbalanced 的分侧数、`org.xmind.ui.map` 这个算法本身、calSidePos 的单子节点特例。
 */

import { describe, it, expect } from 'vitest'
import { SheetState } from '@tomind/state'
import { StyleEngine } from '@tomind/style'
import {
  DEFAULT_LAYOUT_OPTIONS,
  SC,
  delegationOf,
  treeTableLayoutAlgorithm,
  matrixLayoutAlgorithm,
  matrixColumnLayoutAlgorithm,
  layoutMatrixSubtree,
  fishboneLeftHeadedLayoutAlgorithm,
  layoutFishboneSubtree,
  timelineSidedHorizontalLayoutAlgorithm,
  timelineVerticalLayoutAlgorithm,
  timelineThroughVerticalLayoutAlgorithm,
  mapClockwiseLayoutAlgorithm,
  mapUnbalancedLayoutAlgorithm,
  mapLayoutAlgorithm,
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

/** 收集整棵文档的 id（含 root） */
const allIds = (n: NodeDesc, out: string[] = []): string[] => {
  out.push(n.id)
  for (const c of n.children?.attached ?? []) allIds(c, out)
  return out
}

/** 被声明的那棵子树：3 层 6 个节点（声明节点自己 + 2 个子 + 各 1 个孙） */
const declaredSubtree = (sc: string) => node('t', 'T', { structureClass: sc }, [
  node('t1', 'T1', {}, [node('t11', 'T11')]),
  node('t2', 'T2', {}, [node('t21', 'T21')]),
])

const stateOf = (doc: NodeDesc) => SheetState.create({ doc })
const layoutNodes = (algo: { layout: Function }, doc: NodeDesc) =>
  (algo as any).layout(doc, DEFAULT_LAYOUT_OPTIONS, null, stateOf(doc)).nodes as Map<string, unknown>
/** 带样式引擎的版本：轴结构的间距全是「样式值 × designPadding ÷ 默认值」，没有 StyleEngine 就恒为 0 */
const styledNodes = (algo: { layout: Function }, doc: NodeDesc) =>
  (algo as any).layout(doc, DEFAULT_LAYOUT_OPTIONS, new StyleEngine(), stateOf(doc)).nodes as Map<string, any>

describe('delegationOf：五个新入口（返回 null 就意味着宿主 fallback 只放一个盒）', () => {
  it('timeline 的三个变体 + spreadsheet 两张表 + fishbone 两个方向都有委派方式', () => {
    expect(delegationOf(SC.TIMELINE_SIDED_HORIZONTAL)).toEqual({ kind: 'sidedHorizontal' })
    expect(delegationOf(SC.TIMELINE_THROUGH_VERTICAL)).toEqual({ kind: 'throughVertical' })
    expect(delegationOf(SC.TIMELINE_VERTICAL)).toEqual({ kind: 'timelineVertical' })
    expect(delegationOf(SC.SPREADSHEET)).toEqual({ kind: 'matrix' })
    expect(delegationOf(SC.COLUMN_SPREADSHEET)).toEqual({ kind: 'matrix', transpose: true })
    expect(delegationOf(SC.FISHBONE_LEFT_HEADED)).toEqual({ kind: 'fishbone', headed: 'left' })
    expect(delegationOf(SC.FISHBONE_RIGHT_HEADED)).toEqual({ kind: 'fishbone', headed: 'right' })
  })

  it('map 系仍然 null —— 但它到不了委派点（MAP_LIKE 被 ATTACHED_EXPOSED 排除）', () => {
    expect(delegationOf(SC.MAP_CLOCKWISE)).toBeNull()
    expect(delegationOf(SC.MAP_UNBALANCED)).toBeNull()
  })
})

describe('treetable 宿主的 stop 格：五种生效结构都要整棵布局出来', () => {
  // TREE_TABLE_EXPOSED 去掉了 spreadsheet / spreadsheet.column ⇒ 那两个在这里声明无效（对照组）
  const cases = [
    SC.TIMELINE_SIDED_HORIZONTAL,
    SC.TIMELINE_THROUGH_VERTICAL,
    SC.TIMELINE_VERTICAL,
    SC.FISHBONE_LEFT_HEADED,
    SC.SPREADSHEET,
  ]
  for (const sc of cases) {
    it(`${sc} 声明在 d1 ⇒ 6 个节点一个都不能少`, () => {
      const doc = node('root', 'ROOT', { structureClass: SC.TREE_TABLE }, [
        node('a', 'A', {}, [node('a1', 'A1')]),
        declaredSubtree(sc),
      ])
      const nodes = layoutNodes(treeTableLayoutAlgorithm, doc)
      for (const id of allIds(doc)) expect(nodes.has(id), `${id} 丢了`).toBe(true)
      expect(nodes.size).toBe(allIds(doc).length)
    })
  }
})

describe('spreadsheet 宿主的 cell：生效结构来自 spreadsheet.row 的 available（ATTACHED_EXPOSED）', () => {
  const cases = [
    SC.SPREADSHEET,
    SC.COLUMN_SPREADSHEET,
    SC.TIMELINE_SIDED_HORIZONTAL,
    SC.TIMELINE_THROUGH_VERTICAL,
    SC.TIMELINE_VERTICAL,
    SC.FISHBONE_LEFT_HEADED,
  ]
  for (const sc of cases) {
    it(`${sc} 声明在 cell（d2）⇒ 整棵子树都在`, () => {
      const doc = node('root', 'ROOT', { structureClass: SC.SPREADSHEET }, [
        node('h1', 'H1', {}, [node('c1', 'C1', {}, [node('c11', 'C11')]), declaredSubtree(sc)]),
      ])
      const nodes = layoutNodes(matrixLayoutAlgorithm, doc)
      for (const id of allIds(doc)) expect(nodes.has(id), `${id} 丢了`).toBe(true)
    })
  }
})

describe('fishbone 宿主的骨子分支：同上', () => {
  const cases = [
    SC.SPREADSHEET,
    SC.TIMELINE_SIDED_HORIZONTAL,
    SC.TIMELINE_THROUGH_VERTICAL,
    SC.TIMELINE_VERTICAL,
    SC.FISHBONE_LEFT_HEADED,
  ]
  for (const sc of cases) {
    it(`${sc} 声明在骨的子分支（d2）⇒ 整棵子树都在`, () => {
      const doc = node('root', 'ROOT', { structureClass: SC.FISHBONE_LEFT_HEADED }, [
        node('bone1', 'B1', {}, [node('b1a', 'B1A'), declaredSubtree(sc)]),
        node('bone2', 'B2', {}, [node('b2a', 'B2A')]),
      ])
      const nodes = layoutNodes(fishboneLeftHeadedLayoutAlgorithm, doc)
      for (const id of allIds(doc)) expect(nodes.has(id), `${id} 丢了`).toBe(true)
    })
  }
})

describe('timeline.vertical / sided.horizontal / through.vertical 三个轴宿主的子树入口', () => {
  it('timeline.vertical：第 0 个子分支在右、之后交替（SB getRightSide），子树按 tree 委派', () => {
    const doc = node('root', 'ROOT', { structureClass: SC.TIMELINE_VERTICAL }, [
      node('a', 'A', {}, [node('a1', 'A1'), node('a2', 'A2')]),
      node('b', 'B', {}, [node('b1', 'B1')]),
      node('c', 'C', {}, [node('c1', 'C1')]),
    ])
    const n = layoutNodes(timelineVerticalLayoutAlgorithm, doc)
    expect(n.size).toBe(allIds(doc).length)
    const root = n.get('root') as any
    const rootCX = root.x + root.width / 2
    // 0/2 在右、1 在左
    expect((n.get('a') as any).x).toBeGreaterThan(rootCX)
    expect((n.get('c') as any).x).toBeGreaterThan(rootCX)
    expect((n.get('b') as any).x + (n.get('b') as any).width).toBeLessThan(rootCX)
    // 竖轴：三个子分支自上而下堆叠
    expect((n.get('a') as any).y).toBeLessThan((n.get('b') as any).y)
    expect((n.get('b') as any).y).toBeLessThan((n.get('c') as any).y)
  })

  it('timeline.sided.horizontal：子分支上下分侧，各让出 3 × MAIN_LINE_PADDING', () => {
    const doc = node('root', 'ROOT', { structureClass: SC.TIMELINE_SIDED_HORIZONTAL }, [
      node('a', 'A', {}, [node('a1', 'A1'), node('a2', 'A2')]),
      node('b', 'B', {}, [node('b1', 'B1')]),
    ])
    const n = layoutNodes(timelineSidedHorizontalLayoutAlgorithm, doc)
    expect(n.size).toBe(allIds(doc).length)
    // 轴向右生长、第二个子分支在第一个右边
    const root = n.get('root') as any
    expect((n.get('a') as any).x).toBeGreaterThan(root.x)
    expect((n.get('b') as any).x).toBeGreaterThan((n.get('a') as any).x)

    // 有样式时 MAIN_LINE_PADDING = parseInt(spacingMajor) × 18(中央主题) ÷ 默认 + 线尾补丁 > 0
    const sn = styledNodes(timelineSidedHorizontalLayoutAlgorithm, doc)
    const r = sn.get('root')
    const rootCY = r.y + r.height / 2
    const a = sn.get('a')
    const b = sn.get('b')
    const gapUp = rootCY - (a.y + a.height)      // 上侧盒底到轴
    const gapDown = b.y - rootCY                 // 轴到下侧盒顶
    expect(gapUp).toBeGreaterThan(0)
    expect(gapDown).toBeGreaterThan(0)
    // SB: y = ±(MAIN_LINE_PADDING × 3) - currShapeOffsetY + maxBoundaryOffsetY ⇒ 两侧同为 3 × MLP
    // （maxBoundaryOffsetY 在无 labels / 纯 logic 子树时两项都是 0）
    expect(gapUp).toBeCloseTo(gapDown, 6)
  })

  it('timeline.through.vertical：轴是一条竖线（所有轴节点 x 相同），子树左右交替', () => {
    const doc = node('root', 'ROOT', { structureClass: SC.TIMELINE_THROUGH_VERTICAL }, [
      node('a', 'A', {}, [node('a1', 'A1')]),
      node('b', 'B', {}, [node('b1', 'B1')]),
    ])
    const n = layoutNodes(timelineThroughVerticalLayoutAlgorithm, doc)
    expect(n.size).toBe(allIds(doc).length)
    const cx = (id: string) => (n.get(id) as any).x + (n.get(id) as any).width / 2
    // SB: x = prevPosX + getBasePoint(prev, DOWN).x - getBasePoint(prev, UP).x = prevPosX ⇒ 全在同一条竖线
    expect(Math.abs(cx('a') - cx('root'))).toBeLessThan(0.01)
    expect(Math.abs(cx('b') - cx('root'))).toBeLessThan(0.01)
    // 子树从 LEFT 起交替
    expect(cx('a1')).toBeLessThan(cx('a'))
    expect(cx('b1')).toBeGreaterThan(cx('b'))
  })
})

describe('spreadsheet.column = 同一套表格机器的**转置**版（SB columnSpreadsheet._needTranspose）', () => {
  const doc = () => node('root', 'ROOT', { structureClass: SC.SPREADSHEET }, [
    node('h1', 'H1', {}, [node('c1', 'C1'), node('c2', 'C2')]),
    node('h2', 'H2', {}, [node('c3', 'C3')]),
  ])

  it('不转置：主分支在**第 0 列**（x 相同、y 递增）', () => {
    const n = layoutNodes(matrixLayoutAlgorithm, doc())
    expect((n.get('h1') as any).x).toBe((n.get('h2') as any).x)
    expect((n.get('h1') as any).y).toBeLessThan((n.get('h2') as any).y)
  })

  it('转置：主分支在**第 0 行**（y 相同、x 递增）', () => {
    const n = layoutNodes(matrixColumnLayoutAlgorithm, doc())
    expect((n.get('h1') as any).y).toBe((n.get('h2') as any).y)
    expect((n.get('h1') as any).x).toBeLessThan((n.get('h2') as any).x)
  })

  it('空标签（所有 cell 都没 labels ⇒ 列 key = ""）时标签行/列仍有高度', () => {
    // SB MatrixLabelView 空文本 ⇒ bounds = {mL+mR, mT+mB}（实测嵌套 matrix：6pt ⇒ 12×12、minSize 22×22）。
    // 旧实现空 key 退回 CELL_DEFAULT_WIDTH 的 0 高 ⇒ 标签行只有 10（= 空格子），整张表矮一截：
    // test-matrix-inherit 那个「avgΔY 0.4 判不做」的真身就是它（234 个节点齐刷 -12 被质心对齐吃掉）。
    const st = stateOf(doc())
    const sub = layoutMatrixSubtree(doc(), DEFAULT_LAYOUT_OPTIONS, null, st, 1, false)
    const withLabels = layoutMatrixSubtree(
      node('root', 'ROOT', { structureClass: SC.SPREADSHEET }, [
        node('h1', 'H1', {}, [node('c1', 'C1', { labels: ['L'] }), node('c2', 'C2', { labels: ['L'] })]),
        node('h2', 'H2', {}, [node('c3', 'C3', { labels: ['L'] })]),
      ]),
      DEFAULT_LAYOUT_OPTIONS, null, st, 1, false,
    )
    // 空标签也占一格：两种情况的 bb 高度差只来自标签**文本**，不是「有没有标签行」
    expect(sub.bb.height).toBeGreaterThan(0)
    expect(withLabels.bb.height).toBeGreaterThan(sub.bb.height)
  })

  it('子树入口的 bb = SB `matrixView.getSize()`（网格 + 加号视图 18 + MATRIX_PLUS_RADIUS 9）', () => {
    const d = doc()
    const st = stateOf(d)
    const row = layoutMatrixSubtree(d, DEFAULT_LAYOUT_OPTIONS, null, st, 1, false)
    const col = layoutMatrixSubtree(d, DEFAULT_LAYOUT_OPTIONS, null, st, 1, true)
    // bb 的原点口径：x = -(itemPos.x + w/2)、y = -(itemPos.y + originY)（SB sub(newBounds, mainCell.itemPos)）
    expect(row.bb.x).toBeLessThan(0)
    expect(row.bb.y).toBeLessThan(0)
    // 转置后网格形状不同（同一份 totalRows 被当成列）
    expect(Math.abs(row.bb.width - col.bb.width)).toBeGreaterThan(0.01)
    expect(Math.abs(row.bb.height - col.bb.height)).toBeGreaterThan(0.01)
    // SB `matrixView.getSize()`：height = 网格高 + 加号视图(18) + MATRIX_PLUS_RADIUS(9)
    // ⇒ bb 的底边一定比「最低的那个节点盒」再低 ≥ 27（旧实现正好少这 27）
    for (const res of [row, col]) {
      let maxBottom = -Infinity
      for (const nl of res.nodes.values()) maxBottom = Math.max(maxBottom, nl.y + nl.height)
      expect(res.bb.y + res.bb.height - maxBottom).toBeGreaterThanOrEqual(27)
    }
  })
})

describe('fishbone 子树入口：bb = SB `fishbonebasehead._calcBounds`', () => {
  it('没有骨 ⇒ bounds 就是主题盒（width = topicW、x = -w/2、y = -h/2）', () => {
    const d = node('root', 'ROOT', { structureClass: SC.FISHBONE_LEFT_HEADED })
    const res = layoutFishboneSubtree(d, DEFAULT_LAYOUT_OPTIONS, null, stateOf(d), 1, 'left')
    const own = res.nodes.get('root') as any
    expect(res.bb.width).toBe(own.width)
    expect(res.bb.height).toBe(own.height)
    expect(res.bb.x).toBe(-own.width / 2)
    expect(res.bb.y).toBe(-own.height / 2)
  })

  it('有骨 ⇒ 宽度按 HEAD_BONE_LINE_EXTEND_BODY_WIDTH(60) 外扩、高度含上下两侧', () => {
    const d = node('root', 'ROOT', { structureClass: SC.FISHBONE_LEFT_HEADED }, [
      node('bone1', 'B1', {}, [node('b1a', 'B1A'), node('b1b', 'B1B')]),
      node('bone2', 'B2', {}, [node('b2a', 'B2A')]),
    ])
    const res = layoutFishboneSubtree(d, DEFAULT_LAYOUT_OPTIONS, null, stateOf(d), 1, 'left')
    const own = res.nodes.get('root') as any
    // SB: maxSideWidth !== 0 ⇒ width = topicW + max(sideWidth + 60, 0)
    expect(res.bb.width).toBeGreaterThan(own.width + 60)
    // SB: height = max(halfH, topSide.height) + max(halfH, bottomSide.height) ≥ topicH
    expect(res.bb.height).toBeGreaterThan(own.height)
    // leftHeaded（direction RIGHT）⇒ x = topicBounds.x = -w/2；rightHeaded 才是 -(width - w/2)
    expect(res.bb.x).toBe(-own.width / 2)
    const right = layoutFishboneSubtree(d, DEFAULT_LAYOUT_OPTIONS, null, stateOf(d), 1, 'right')
    const ownR = right.nodes.get('root') as any
    expect(right.bb.x).toBe(-(right.bb.width - ownR.width / 2))
  })

  it('整棵子树都在（宿主拿不到 bb 时旧实现只放一个盒）', () => {
    const d = node('root', 'ROOT', { structureClass: SC.FISHBONE_LEFT_HEADED }, [
      node('bone1', 'B1', {}, [node('b1a', 'B1A', {}, [node('x', 'X')])]),
      node('bone2', 'B2', {}, [node('b2a', 'B2A')]),
    ])
    const res = layoutFishboneSubtree(d, DEFAULT_LAYOUT_OPTIONS, null, stateOf(d), 1, 'left')
    expect(res.nodes.size).toBe(allIds(d).length)
  })
})

describe('matrix 宿主自己的标题按 TOPIC_MAX_CUSTOM_WIDTH(1024) 折行', () => {
  it('长标题在根上 ⇒ 1 行（旧实现按 300 折成多行，实测单点 ΔW 690 / ΔH 120）', () => {
    const long = '这'.repeat(40)
    const d = node('root', long, { structureClass: SC.SPREADSHEET }, [
      node('h1', 'H1', {}, [node('c1', 'C1')]),
    ])
    const n = layoutNodes(matrixLayoutAlgorithm, d)
    const root = n.get('root') as any
    // 40 个字 × 默认字号 ≫ 300，但 < 1024 ⇒ SB 不折行
    expect(root.titleHeight).toBeLessThanOrEqual(root.height)
    expect(root.width).toBeGreaterThan(300)
    // 主题盒宽 ≈ 标题宽 + 左右 margin（1 行）
    expect(root.titleWidth).toBeGreaterThan(300)
  })

  it('同样的长标题放在**主分支**上仍按 300 折行（isMatrixMainBranch 判的是节点自己）', () => {
    const long = '这'.repeat(40)
    const d = node('root', 'ROOT', { structureClass: SC.SPREADSHEET }, [
      node('h1', long, {}, [node('c1', 'C1')]),
    ])
    const n = layoutNodes(matrixLayoutAlgorithm, d)
    const head = n.get('h1') as any
    expect(head.titleWidth).toBeLessThanOrEqual(300 + 12)
  })
})

describe('map.unbalanced 的分侧数（SB MapUnbalanced.calcNumRight）', () => {
  const fourKids = (attrs: Record<string, unknown> = {}) => node('root', 'ROOT',
    { structureClass: SC.MAP_UNBALANCED, ...attrs },
    [node('a', 'A'), node('b', 'B'), node('c', 'C'), node('d', 'D')])

  it('没有 right-number 扩展 ⇒ 恒为 1（SB 构造期兜底，与权重无关）', () => {
    const n = layoutNodes(mapUnbalancedLayoutAlgorithm, fourKids())
    const rootCX = (n.get('root') as any).x + (n.get('root') as any).width / 2
    const sideOf = (id: string) => ((n.get(id) as any).x > rootCX ? 'R' : 'L')
    expect([sideOf('a'), sideOf('b'), sideOf('c'), sideOf('d')]).toEqual(['R', 'L', 'L', 'L'])
  })

  it('attrs.numRight（= 解析 extensions 的 right-number）优先', () => {
    const n = layoutNodes(mapUnbalancedLayoutAlgorithm, fourKids({ numRight: 2 }))
    const rootCX = (n.get('root') as any).x + (n.get('root') as any).width / 2
    const sideOf = (id: string) => ((n.get(id) as any).x > rootCX ? 'R' : 'L')
    expect([sideOf('a'), sideOf('b'), sideOf('c'), sideOf('d')]).toEqual(['R', 'R', 'L', 'L'])
  })
})

describe('org.xmind.ui.map（SB structures/map.ts）：左侧不 reverse、两侧 isUpToDown', () => {
  const fourKids = (sc: string) => node('root', 'ROOT', { structureClass: sc },
    [node('a', 'A'), node('b', 'B'), node('c', 'C'), node('d', 'D')])

  /** 左侧子分支自上而下的顺序 */
  const leftTopDown = (n: Map<string, any>) => {
    const rootX = n.get('root').x
    return ['a', 'b', 'c', 'd']
      .filter((id) => n.get(id).x < rootX)
      .sort((p, q) => n.get(p).y - n.get(q).y)
  }

  it('map.clockwise 的左侧是 slice(numRight).reverse() ⇒ 文档里靠后的在上面', () => {
    const n = layoutNodes(mapClockwiseLayoutAlgorithm, fourKids(SC.MAP_CLOCKWISE))
    const left = leftTopDown(n)
    expect(left.length).toBeGreaterThan(1)
    expect(left).toEqual([...left].reverse().sort((p, q) => left.indexOf(q) - left.indexOf(p)).reverse())
    // numRight 按 SB basemap.calcNumRight 的公式（structures/basemap.ts:83-139）：
    // 4 个等权分支 totalWeight=4w、half=2w；index=1 时 newRightWeight=2w >= half，
    // 两个特殊 return 2 分支（isInSameRange / isWithinThreshold）均不命中 ⇒ return num=2
    // ⇒ 前 2 个（a, b）在右、左侧 = slice(2).reverse() = d, c
    expect(left).toEqual(['d', 'c'])
  })

  it('map：左侧**不** reverse（numRight=2 ⇒ 左侧自上而下是 c, d）', () => {
    const nm = layoutNodes(mapLayoutAlgorithm, fourKids(SC.MAP))
    expect(leftTopDown(nm)).toEqual(['c', 'd'])
  })
})

describe('SB basemap.calSidePos 的「only one child, treat special」', () => {
  it('某一侧只有 1 个子分支时不与父同轴，而是整盒推到轴外 minSumTopicSpacing/2', () => {
    const one = node('root', 'ROOT', { structureClass: SC.MAP_CLOCKWISE }, [node('a', 'A')])
    const n = layoutNodes(mapClockwiseLayoutAlgorithm, one)
    const root = n.get('root') as any
    const a = n.get('a') as any
    const rootCY = root.y + root.height / 2
    const aCY = a.y + a.height / 2
    // 旧实现（通用路径 n=1 ⇒ centers[0] = 0）会让两者同轴
    expect(Math.abs(aCY - rootCY)).toBeGreaterThan(1)
    // SB: firstChildY = (-1 × minSumTopicSpacing)/2 - tb.y - tb.height
    //   minSumTopicSpacing = minTopBottomSpacing(80)（父盒高 ≤ parentTopicThreshold 230）
    //   tb.y = -h/2、tb.height = h ⇒ 原点差 = -40 - h/2
    expect(aCY - rootCY).toBeCloseTo(-80 / 2 - a.height / 2, 6)
  })
})
