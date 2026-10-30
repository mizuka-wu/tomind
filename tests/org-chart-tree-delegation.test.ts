/**
 * 通用子树委派入口回归测试（第五轮，量尺 fixture：test-org-tree-branch）
 *
 * SB `utils/branch.getViewStructure` 对**每个** attached 子分支都要跑一遍
 *   preset = 节点自己的 structure-class || skeleton[getActivedClassName(view)]
 *   preset ∈ parentStruct.getAvailableChildStructure(parent, view) ? preset
 *     : SIMILAR_STRUCTURE_MAP[preset]（若在 available 里）
 *     : getChildStructure(= 父结构)
 * 而 tree.left/right 在几乎所有 available 表里（org-chart.down = ATTACHED_EXPOSED 去掉
 * `org-chart.up*`、logic.left/right、tree.left/right、brace.*、treetable、map 系全都有）
 * ⇒ 任何宿主都可能要把整棵子树交给 tree 布局。
 *
 * TM 此前只有 logic 一个委派入口（org-chart 的 getOrgChildLogicSide 只认 logic.*），
 * org-chart 下显式声明 tree.right 的分支被退回 org 递归：
 *   test-org-tree-branch avgΔX 29.1 / avgΔY 40.9，234/235 个节点错位，单点最大 dx -483。
 * 修法：给 tree-layout 抽 `layoutTreeSubtree` + 按 SB 的表解析生效结构（child-structure.ts）。
 * 修完 0.1 / 0（只剩 org-nested 那条已判不做的 stale-bb 3.5px）。
 *
 * ⚠️ 反过来 org-chart.**up** 下声明 tree.* **不是**差距：
 *   `orgchartup.getAvailableChildStructure = TOP_EXPOSED_STRUCTURE`，
 *   它显式排除 org-chart.down / timeline.vertical / tree.left / tree.right / through.vertical，
 *   且 SIMILAR_STRUCTURE_MAP 没有 tree.* 的镜像 ⇒ 退回父结构（org-chart.up）。
 */

import { describe, it, expect } from 'vitest'
import {
  orgChartDownLayoutAlgorithm,
  orgChartUpLayoutAlgorithm,
  logicRightLayoutAlgorithm,
  braceRightLayoutAlgorithm,
  createTreeLayoutAlgorithm,
  layoutTreeSubtree,
  DEFAULT_LAYOUT_OPTIONS,
  SC,
  getAvailableChildStructure,
  resolveChildStructure,
  delegationOf,
  ATTACHED_EXPOSED_STRUCTURE,
  TOP_EXPOSED_STRUCTURE,
  LEFT_EXPOSED_STRUCTURE,
  RIGHT_EXPOSED_STRUCTURE,
  getStartDirectionOf,
  isHorizontalStart,
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

// ─── SB 常量（utils/layoutconstant.ts + structures/treeleftandright.ts）───
const BOUNDARYGAP = 10 // spacingMajor（tree 里写死用 BOUNDARYGAP，不读样式的 spacing-major）
const PADDING = 20 // childrenY = 盒底 + PADDING*2
const CENTER_PADDING = 30 // 只有中央分支加
const END_POINT_LINE_OFFSET = 15 // 非中央分支加

describe('child-structure：SB 的 available 表与 getViewStructure 解析', () => {
  it('org-chart.down = ATTACHED_EXPOSED 去掉 org-chart.up*（前缀匹配），tree.* 在里面', () => {
    const av = getAvailableChildStructure(SC.ORG_CHART_DOWN)
    expect(av).toContain(SC.TREE_RIGHT)
    expect(av).toContain(SC.TREE_LEFT)
    expect(av).toContain(SC.LOGIC_RIGHT)
    expect(av).toContain(SC.LOGIC_LEFT)
    expect(av.some((s) => s.startsWith(SC.ORG_CHART_UP))).toBe(false)
    expect(av.length).toBe(ATTACHED_EXPOSED_STRUCTURE.length - 1)
  })

  it('org-chart.up = TOP_EXPOSED：tree.left/right、org-chart.down、timeline.vertical、through.vertical 都不可用', () => {
    const av = getAvailableChildStructure(SC.ORG_CHART_UP)
    expect(av).toEqual(TOP_EXPOSED_STRUCTURE)
    for (const banned of [SC.ORG_CHART_DOWN, SC.TIMELINE_VERTICAL, SC.TREE_LEFT, SC.TREE_RIGHT, SC.TIMELINE_THROUGH_VERTICAL]) {
      expect(av).not.toContain(banned)
    }
    expect(av).toContain(SC.LOGIC_RIGHT)
  })

  it('timeline.* / spreadsheet 的 available 是空表 ⇒ 任何 preset 都退回父结构', () => {
    for (const parent of [
      SC.TIMELINE_HORIZONTAL,
      SC.TIMELINE_SIDED_HORIZONTAL,
      SC.TIMELINE_THROUGH_VERTICAL,
      SC.SPREADSHEET,
    ]) {
      expect(getAvailableChildStructure(parent)).toEqual([])
      expect(resolveChildStructure(parent, SC.TREE_RIGHT)).toBe(parent)
    }
  })

  it('treetable：同组（treetable / toptitle）里只留自己', () => {
    expect(getAvailableChildStructure(SC.TREE_TABLE)).toContain(SC.TREE_TABLE)
    expect(getAvailableChildStructure(SC.TREE_TABLE)).not.toContain(SC.TOP_TITLE_TREE_TABLE)
    expect(getAvailableChildStructure(SC.TOP_TITLE_TREE_TABLE)).toContain(SC.TOP_TITLE_TREE_TABLE)
    expect(getAvailableChildStructure(SC.TREE_TABLE)).toContain(SC.TREE_RIGHT)
    expect(getAvailableChildStructure(SC.TREE_TABLE)).not.toContain(SC.SPREADSHEET)
  })

  it('brace.left/right 继承 logic 的 available 表（SB `BraceLeft = Object.assign({}, logicLeft, …)`）', () => {
    // 探针实测 test-brace-left（skeleton mainTopic = logic.right）：brace.left 给 d1 的 available
    // 只有 13 项 = LEFT_EXPOSED，preset logic.right 不在里面 → 镜像 ⇒ **eff = logic.left**
    expect(getAvailableChildStructure(SC.BRACE_LEFT)).toEqual(LEFT_EXPOSED_STRUCTURE)
    expect(getAvailableChildStructure(SC.BRACE_RIGHT)).toEqual(RIGHT_EXPOSED_STRUCTURE)
    expect(getAvailableChildStructure(SC.BRACE_LEFT)).not.toContain(SC.LOGIC_RIGHT)
    expect(resolveChildStructure(SC.BRACE_LEFT, SC.LOGIC_RIGHT)).toBe(SC.LOGIC_LEFT)
    expect(resolveChildStructure(SC.BRACE_RIGHT, SC.LOGIC_LEFT)).toBe(SC.LOGIC_RIGHT)
    // 同向的 logic 就在表里，不用镜像
    expect(resolveChildStructure(SC.BRACE_LEFT, SC.LOGIC_LEFT)).toBe(SC.LOGIC_LEFT)
  })

  it('preset 不在 available 里时试 SIMILAR_STRUCTURE_MAP 的镜像（logic.right → logic.left）', () => {
    // tree.left 的 available = LEFT_EXPOSED（不含 logic.right，含 logic.left）
    expect(getAvailableChildStructure(SC.TREE_LEFT)).not.toContain(SC.LOGIC_RIGHT)
    expect(resolveChildStructure(SC.TREE_LEFT, SC.LOGIC_RIGHT)).toBe(SC.LOGIC_LEFT)
    // org-chart.up 下声明 org-chart.down → 镜像 = org-chart.up（在 available 里）
    expect(resolveChildStructure(SC.ORG_CHART_UP, SC.ORG_CHART_DOWN)).toBe(SC.ORG_CHART_UP)
    // tree.* 没有镜像 ⇒ 退回父结构
    expect(resolveChildStructure(SC.ORG_CHART_UP, SC.TREE_RIGHT)).toBe(SC.ORG_CHART_UP)
  })

  it('preset 缺失 → 继承父结构；delegationOf 只认 TM 有子树入口的那几个', () => {
    expect(resolveChildStructure(SC.TREE_RIGHT, null)).toBe(SC.TREE_RIGHT)
    expect(delegationOf(SC.TREE_RIGHT)).toEqual({ kind: 'tree', dir: 'right' })
    expect(delegationOf(SC.LOGIC_LEFT)).toEqual({ kind: 'logic', side: 'left' })
    // brace = logic 的堆叠公式 + LINE_SPACING 补丁（SB BraceLeftAndRight 覆写 calAttachedChildrenPos）
    expect(delegationOf(SC.BRACE_RIGHT)).toEqual({ kind: 'brace', side: 'right' })
    expect(delegationOf(SC.ORG_CHART_DOWN)).toEqual({ kind: 'org', dir: 'down' })
    expect(delegationOf(SC.ORG_CHART_UP)).toEqual({ kind: 'org', dir: 'up' })
    // treetable 也有了（2026-10-30 第六轮：宿主改成 SB 的通用表格算法后抽出 layoutTreetableSubtree）
    expect(delegationOf(SC.TREE_TABLE)).toEqual({ kind: 'treetable' })
    // timeline.horizontal（轴布局）也有入口了；.up/.down 不在 EXPOSED_STRUCTURE 里
    // ⇒ 生效结构不可能是它们（只有轴自己的 getChildStructure 会给）
    expect(delegationOf(SC.TIMELINE_HORIZONTAL)).toEqual({ kind: 'timeline' })
    // TM 没有子树入口的：宿主自己递归（已知差距，量化数字见 skill）
    expect(delegationOf(SC.TIMELINE_SIDED_HORIZONTAL)).toBeNull()
    expect(delegationOf(SC.TIMELINE_THROUGH_VERTICAL)).toBeNull()
    expect(delegationOf(SC.TOP_TITLE_TREE_TABLE)).toBeNull()
    expect(delegationOf(SC.MAP_CLOCKWISE)).toBeNull()
  })

  it('getStartDirectionOf：SB 的调用点是 getStartDirection(**child**, undefined) ⇒ 判子分支自己的结构', () => {
    // tree.left/tree.right 在 SB 这张表里算 **DOWN**（纵向）；brace.* 落 default ⇒ RIGHT（横向）
    expect(getStartDirectionOf(SC.TREE_RIGHT)).toBe('down')
    expect(getStartDirectionOf(SC.TREE_LEFT)).toBe('down')
    expect(getStartDirectionOf(SC.ORG_CHART_DOWN)).toBe('down')
    expect(getStartDirectionOf(SC.ORG_CHART_UP)).toBe('up')
    expect(getStartDirectionOf(SC.LOGIC_RIGHT)).toBe('right')
    expect(getStartDirectionOf(SC.LOGIC_LEFT)).toBe('left')
    expect(getStartDirectionOf(SC.BRACE_RIGHT)).toBe('right')
    expect(isHorizontalStart(SC.TREE_RIGHT)).toBe(false)
    expect(isHorizontalStart(SC.BRACE_LEFT)).toBe(true)
    expect(isHorizontalStart(SC.LOGIC_RIGHT)).toBe(true)
  })
})

describe('layoutTreeSubtree：被委派的子树根不是中央分支', () => {
  const doc = node('b', 'B', {}, [node('b1', 'B1'), node('b2', 'B2')])

  it('childrenX = BOUNDARYGAP + endPointLineOffset(15)，不含 centerPadding(30)', () => {
    const res = layoutTreeSubtree(doc, 0, 0, DEFAULT_LAYOUT_OPTIONS, null, null, 'right', 1)
    const b = res.nodes.get('b')!
    const b1 = res.nodes.get('b1')!
    // SB: posX = childrenX - child.topicView.bounds.x + maxOffset，setPosition 相对**父原点**
    // ⇒ 子盒左边缘 = 父盒中心 + childrenX（与父宽度无关）
    expect(b1.x - (b.x + b.width / 2)).toBe(BOUNDARYGAP + END_POINT_LINE_OFFSET)
    // 对照：同一棵子树当成中央分支时会多 centerPadding（= 40），这条断言锁住 isCentral=false
    expect(b1.x - (b.x + b.width / 2)).not.toBe(BOUNDARYGAP + CENTER_PADDING)
  })

  it('childrenY = 父盒底 + PADDING*2（SB newBounds.y + height + 40，再减 child.bb.y）', () => {
    const res = layoutTreeSubtree(doc, 0, 0, DEFAULT_LAYOUT_OPTIONS, null, null, 'right', 1)
    const b = res.nodes.get('b')!
    const b1 = res.nodes.get('b1')!
    expect(b1.y - (b.y + b.height)).toBe(PADDING * 2)
  })

  it('tree-left 镜像：子盒**右**边缘 = 父盒中心 - childrenX', () => {
    const res = layoutTreeSubtree(doc, 0, 0, DEFAULT_LAYOUT_OPTIONS, null, null, 'left', 1)
    const b = res.nodes.get('b')!
    const b1 = res.nodes.get('b1')!
    expect((b.x + b.width / 2) - (b1.x + b1.width)).toBe(BOUNDARYGAP + END_POINT_LINE_OFFSET)
  })

  it('bb = 全部后代主题盒的真实并集，相对 node 原点（SB getUnionBoundingBox(bounds, getChildrenSize)）', () => {
    const deep = node('b', 'B', {}, [
      node('b1', 'B1', {}, [node('b1a', 'B1A')]),
      node('b2', 'B2'),
    ])
    const res = layoutTreeSubtree(deep, 0, 0, DEFAULT_LAYOUT_OPTIONS, null, null, 'right', 1)
    const own = res.nodes.get('b')!
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const nl of res.nodes.values()) {
      minX = Math.min(minX, nl.x)
      maxX = Math.max(maxX, nl.x + nl.width)
      minY = Math.min(minY, nl.y)
      maxY = Math.max(maxY, nl.y + nl.height)
    }
    const originX = own.x + own.width / 2
    const originYPoint = own.y + res.originY
    expect(res.bb.x).toBe(minX - originX)
    expect(res.bb.width).toBe(maxX - minX)
    expect(res.bb.y).toBe(minY - originYPoint)
    expect(res.bb.height).toBe(maxY - minY)
    // 自己的盒一定被并进去（SB 的 newBounds 初值 = topicView.bounds）
    expect(res.bb.x).toBe(-own.width / 2)
    expect(res.bb.y).toBe(-res.originY)
  })
})

describe('org-chart.down：子分支显式声明 tree.right 就整棵按 tree 长', () => {
  const build = () =>
    node('root', 'ROOT', { structureClass: SC.ORG_CHART_DOWN }, [
      node('a', 'A'),
      node('b', 'B', { structureClass: SC.TREE_RIGHT }, [
        node('b1', 'B1', {}, [node('b1a', 'B1A')]),
        node('b2', 'B2'),
      ]),
      node('c', 'C'),
    ])

  it('tree 分支的子节点纵向堆叠在父盒**下方**（旧实现按 org 递归会横排）', () => {
    const n = orgChartDownLayoutAlgorithm.layout(build(), DEFAULT_LAYOUT_OPTIONS).nodes
    const b = n.get('b')!
    const b1 = n.get('b1')!
    const b2 = n.get('b2')!
    const b1a = n.get('b1a')!
    // tree.right：b1/b2 都在 b 的下方，且左边缘对齐到 b 的中心 + 25
    expect(b1.y).toBeGreaterThan(b.y + b.height)
    expect(b2.y).toBeGreaterThan(b1.y + b1.height)
    expect(b1.x - (b.x + b.width / 2)).toBe(BOUNDARYGAP + END_POINT_LINE_OFFSET)
    expect(b2.x - (b.x + b.width / 2)).toBe(BOUNDARYGAP + END_POINT_LINE_OFFSET)
    // 孙节点继续按 tree 长（继承父结构），不是横排在 b1 右侧的 org 兄弟
    expect(b1a.y).toBeGreaterThan(b1.y + b1.height)
    expect(b1a.x - (b1.x + b1.width / 2)).toBe(BOUNDARYGAP + END_POINT_LINE_OFFSET)
    // 兄弟分支 a/c 仍然按 org-chart.down 长在 root 正下方（同一水平线）
    const a = n.get('a')!
    const c = n.get('c')!
    expect(a.y).toBe(c.y)
  })

  it('tree 分支的 bb 变窄 ⇒ 兄弟分支的 X 堆叠跟着变（旧实现整张图两侧各偏 103px）', () => {
    // 三个叶子兄弟：org 递归会**横排**（bb 宽 = 三盒 + 间距），tree 是**纵排**（bb 宽 ≈ 一个盒 + 25）
    const kids = [node('b1', 'B1'), node('b2', 'B2'), node('b3', 'B3')]
    const withTree = orgChartDownLayoutAlgorithm.layout(
      node('root', 'ROOT', { structureClass: SC.ORG_CHART_DOWN }, [
        node('a', 'A'),
        node('b', 'B', { structureClass: SC.TREE_RIGHT }, kids),
        node('c', 'C'),
      ]),
      DEFAULT_LAYOUT_OPTIONS,
    ).nodes
    const withoutTree = orgChartDownLayoutAlgorithm.layout(
      node('root', 'ROOT', { structureClass: SC.ORG_CHART_DOWN }, [
        node('a', 'A'),
        node('b', 'B', {}, kids),
        node('c', 'C'),
      ]),
      DEFAULT_LAYOUT_OPTIONS,
    ).nodes
    const bWith = withTree.get('b')!
    const bWithout = withoutTree.get('b')!
    // tree 分支的子孙全部落在 b 中心右侧 25px 处 ⇒ 横向跨度只有一个盒
    const spanOf = (m: typeof withTree, ids: string[]) => {
      let minX = Infinity, maxX = -Infinity
      for (const id of ids) {
        const nl = m.get(id)!
        minX = Math.min(minX, nl.x)
        maxX = Math.max(maxX, nl.x + nl.width)
      }
      return maxX - minX
    }
    const ids = ['b', 'b1', 'b2', 'b3']
    expect(spanOf(withTree, ids)).toBeLessThan(spanOf(withoutTree, ids))
    // bb 宽变了 ⇒ 兄弟分支 a/c 的 X 也跟着变（量尺里 avgΔX 29.1 就是这一条 + tree 分支自身几何）
    expect(withTree.get('a')!.x).not.toBe(withoutTree.get('a')!.x)
    expect(withTree.get('c')!.x).not.toBe(withoutTree.get('c')!.x)
    void bWith; void bWithout
  })
})

describe('org-chart.up：声明 tree.* 不生效（TOP_EXPOSED 排除 tree.left/right）', () => {
  it('退回 org-chart.up 递归 —— 子节点长在父上方，不是 tree 的纵向堆叠', () => {
    const doc = node('root', 'ROOT', { structureClass: SC.ORG_CHART_UP }, [
      node('a', 'A'),
      node('b', 'B', { structureClass: SC.TREE_RIGHT }, [node('b1', 'B1'), node('b2', 'B2')]),
      node('c', 'C'),
    ])
    const n = orgChartUpLayoutAlgorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS).nodes
    const b = n.get('b')!
    const b1 = n.get('b1')!
    const b2 = n.get('b2')!
    // org-chart.up：b1/b2 横排在 b 的**上方**（同一 y），不是 tree 的纵向堆叠
    expect(b1.y).toBeLessThan(b.y)
    expect(b1.y).toBe(b2.y)
  })
})

describe('brace 分支：SB BraceLeftAndRight 覆写了 calAttachedChildrenPos', () => {
  /**
   * SB `braceleftandright.ts` 只有 81 行，是 logic 那份的**整段覆写**：
   * 没有 posYoffsetToClosestChild / isNeedRedolayout（重对齐）、没有
   * calcOutwardDistanceByAttachedChildren（外扩）、也没有 logic 的 X 侧 maxOffset。
   * TM 的 brace = logic 算法 + LINE_SPACING 补丁，所以这三项都要按生效结构关掉。
   *
   * 实测 probe-org-chart.down+brace.right 的 d3「变换力的弹性敏感元件」（5 个子节点，
   * bb 高 [68,30,68,30,30]、minor 8）：childrenY = -138.5、posY = [-104.5,-47.5,9.5,66.5,104.5]、
   * childrenHeight = 119.5 ⇒ logic 的判据 |9.5| < min(30, 17.925) 会重对齐，
   * 而 SB 实测 kid0.pos.y = -104.5（**原值**）⇒ TM 多减 9.5，逐层放大成 2.375 / 4.75 / 9.5。
   */
  const buildDoc = () => {
    // 5 个子分支，孙节点数 [2,1,2,1,1] ⇒ bb 高不对称 ⇒ 最靠近父中心线的那个不在 0 上
    const kidCounts = [2, 1, 2, 1, 1]
    return node('root', 'ROOT', {}, kidCounts.map((k, i) => node(
      `c${i}`,
      `C${i}`,
      {},
      Array.from({ length: k }, (_, j) => node(`c${i}-${j}`, `C${i}-${j}`)),
    )))
  }

  const centersOf = (m: Map<string, { x: number; y: number; width: number; height: number }>) => {
    const root = m.get('root')!
    const rc = root.y + root.height / 2
    return [0, 1, 2, 3, 4].map((i) => {
      const n = m.get(`c${i}`)!
      return n.y + n.height / 2 - rc
    })
  }

  it('logic 会把最靠近的子节点吸到父中心线，brace 不吸（保持 SB 的原值）', () => {
    const doc = buildDoc()
    const logic = centersOf(logicRightLayoutAlgorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS).nodes)
    const brace = centersOf(braceRightLayoutAlgorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS).nodes)
    const minAbs = (v: number[]) => Math.min(...v.map(Math.abs))
    // 前提：这一层确实满足 logic 的重对齐条件（n>=3 且 |最近| < min(30, 0.15*childrenHeight)）
    expect(minAbs(brace)).toBeGreaterThan(0)
    expect(minAbs(brace)).toBeLessThan(30)
    // logic 重对齐后最近的那个子节点正好落在父中心线上
    expect(minAbs(logic)).toBe(0)
    // 两者的差 = 被吸过去的那个偏移量（brace 保持原样）
    expect(logic.map((v) => v - brace[0] + brace[0])).not.toEqual(brace)
  })
})

describe('tree 布局自身：中央分支与子层级的 childrenX 差 centerPadding', () => {
  const algorithm = createTreeLayoutAlgorithm('tree-right', 'right')

  it('根（中央分支）用 BOUNDARYGAP+centerPadding，子层级用 BOUNDARYGAP+endPointLineOffset', () => {
    const doc = node('root', 'ROOT', { structureClass: SC.TREE_RIGHT }, [
      node('a', 'A', {}, [node('a1', 'A1')]),
    ])
    // skeleton 缺省 ⇒ tree-layout 不委派 logic，纯 tree 递归
    const n = algorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS).nodes
    const root = n.get('root')!
    const a = n.get('a')!
    const a1 = n.get('a1')!
    expect(a.x - (root.x + root.width / 2)).toBe(BOUNDARYGAP + CENTER_PADDING)
    expect(a1.x - (a.x + a.width / 2)).toBe(BOUNDARYGAP + END_POINT_LINE_OFFSET)
  })
})
