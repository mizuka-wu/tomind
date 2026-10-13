/**
 * 父子连线几何（connection-geometry）回归测试
 *
 * 全部断言值来自 snowbrush 实测 / 源码：
 * - 锚点：figures/renderengine/svg/topicshapes/{utils,abstracttopicshape}.ts
 *   （getStartDirection / getEndDirection / getJointPosition / LINECOLPOS=13 / END_OFFSET=-1）
 * - 线尾回缩：topicshapes/index.ts PositionWrapper.wrapLineEndSpacingPatch
 *   + utils/line.ts getLineEndSpacingPatchPoint（brace 无箭头 = LINE_SPACING 16）
 * - 线型公式：render/brushes.ts + render/topiclinestyle/*
 * - 生效结构类：utils/branch.getViewStructure（含 SIMILAR_STRUCTURE_MAP 镜像回退）
 *
 * 旧实现（node-view-desc.renderConnections 内联）三处系统性错误，本文件的用例都会红：
 * 1) 拐点取「起终点中点」，SB 取 startPt（map 的 diver/order）或 关节点+LINECOLPOS(13)
 * 2) 出线/入线方向用 |dx| vs |dy| 猜，SB 按结构类查表（org-chart 走上下、tree 走下→侧）
 * 3) 端点用主题盒边缘，SB 用 shapeBounds 关节点 + END_OFFSET(-1) + 线尾回缩
 * 实测（render-compare/scripts/conn-parity.mjs，20 个 fixture）：
 * demo 10.11px→0、org-chart 14.95→0、tree 9.37→0、timeline 43.94→0、brace 7.93→0。
 */

import { describe, it, expect } from 'vitest'
import {
  computeConnectionGeometry,
  computeConnectionAnchors,
  resolveChildStructureClass,
  getChildTargetOrientation,
  normalizeStructureClass,
  type ConnBox,
  type ConnectionGeometryInput,
} from '@tomind/view/connection-geometry'

const ROUNDED_RECT = 'org.xmind.topicShape.roundedRect'
const CURVE = 'org.xmind.branchConnection.curve'
const ROUNDED_ELBOW = 'org.xmind.branchConnection.roundedElbow'
const BRACE = 'org.xmind.branchConnection.brace'

function box(x: number, y: number, width: number, height: number): ConnBox {
  return { x, y, width, height }
}

function input(over: Partial<ConnectionGeometryInput> & Pick<ConnectionGeometryInput, 'parentBox' | 'childBox'>): ConnectionGeometryInput {
  return {
    parentStyle: { structureClass: 'org.xmind.ui.logic.right', shapeClass: ROUNDED_RECT, lineClass: ROUNDED_ELBOW, lineWidth: 2 },
    childStyle: { lineCorner: 8 },
    siblingBoxes: [over.childBox],
    childIndex: 0,
    ...over,
  }
}

/** 从 path 里抽出所有数字，便于做近似断言 */
function nums(path: string): number[] {
  return (path.match(/-?\d+\.?\d*/g) ?? []).map(Number)
}

describe('connection-geometry：锚点（SB abstracttopicshape）', () => {
  it('logic-right：出线点 = 父盒右边缘中心，拐点 = 出线点 + LINECOLPOS(13)，入线点 = 子盒左边缘 + END_OFFSET(-1 → +1)', () => {
    const parentBox = box(0, 0, 100, 40)
    const childBox = box(200, 80, 60, 30)
    const a = computeConnectionAnchors(input({ parentBox, childBox }))
    expect(a.startDirection).toBe('right')
    expect(a.endDirection).toBe('left')
    expect(a.startPt).toEqual({ x: 100, y: 20 })
    expect(a.ctrlPt).toEqual({ x: 113, y: 20 })
    // joint(LEFT) = 子盒左边缘 200；addPositionByDirection(LEFT, -1) → x -= (-1) → 201
    expect(a.endPt).toEqual({ x: 201, y: 95 })
  })

  it('org-chart-down：出线点 = 父盒底边中心，入线点 = 子盒顶边 + 1（不是左右边缘）', () => {
    const parentBox = box(0, 0, 100, 40)
    const childBox = box(0, 100, 60, 30)
    const a = computeConnectionAnchors(input({
      parentBox,
      childBox,
      parentStyle: { structureClass: 'org.xmind.ui.org-chart.down', shapeClass: ROUNDED_RECT, lineClass: ROUNDED_ELBOW, lineWidth: 2 },
    }))
    expect(a.startDirection).toBe('down')
    expect(a.endDirection).toBe('up')
    expect(a.startPt).toEqual({ x: 50, y: 40 })
    expect(a.ctrlPt).toEqual({ x: 50, y: 53 })
    expect(a.endPt).toEqual({ x: 30, y: 101 })
  })

  it('map-clockwise + curve：拐点与出线点重合（DIVER_LINE），且出线点按反比例函数向主题内部收拢', () => {
    // demo.xmind 实测：root 盒 208×70，「误差」盒 (258,-1532.5) 72×44（root 局部坐标）
    // SB linePath = "M 2.702… 0L 2.702… 0Q 33.16… -1545.5 155 -1545.5"（以 root 中心为原点）
    // 换算到 root 左上角原点 = (106.702, 35) / ctrl 同点 / end (259, -1510.5)
    const parentBox = box(0, 0, 208, 70)
    const childBox = box(258, -1532.5, 72, 44)
    const geo = computeConnectionGeometry(input({
      parentBox,
      childBox,
      parentStyle: { structureClass: 'org.xmind.ui.map.clockwise', shapeClass: ROUNDED_RECT, lineClass: CURVE, lineWidth: 3 },
    }))
    expect(geo.startPt.x).toBeCloseTo(106.702, 2)
    expect(geo.startPt.y).toBeCloseTo(35, 5)
    expect(geo.ctrlPt).toEqual(geo.startPt) // DIVER_LINE：ctrl = start（旧实现用中点 → 这里必红）
    expect(geo.endPt.x).toBeCloseTo(259, 5)
    expect(geo.endPt.y).toBeCloseTo(-1510.5, 5)
    expect(geo.path).toBe(`M ${geo.startPt.x} ${geo.startPt.y}L ${geo.ctrlPt.x} ${geo.ctrlPt.y}Q 137.1616285980076 -1510.5 259 -1510.5`)
  })
})

describe('connection-geometry：线尾回缩（SB PositionWrapper + getLineEndSpacingPatchPoint）', () => {
  // brace-right 实测：子盒左边缘 170，SB figure.endPoint.x = 154 = 170 - LINE_SPACING(16)
  const parentBox = box(0, 0, 208, 70)
  const childBox = box(170, -3187.5, 72, 44)

  it('brace-right：入线点 = 子盒左边缘 - 16（覆盖 END_OFFSET）', () => {
    const geo = computeConnectionGeometry(input({
      parentBox,
      childBox,
      parentStyle: { structureClass: 'org.xmind.ui.brace.right', shapeClass: ROUNDED_RECT, lineClass: BRACE, lineWidth: 3 },
    }))
    expect(geo.endPt.x).toBe(154)
    expect(geo.endPt.y).toBeCloseTo(-3165.5, 5)
  })

  it('brace-left：入线点 = 子盒右边缘 + 16（getChildTargetOrientation 继承 logicLeft = RIGHT）', () => {
    const leftChild = box(-242, -3187.5, 72, 44) // 右边缘 = -170
    const geo = computeConnectionGeometry(input({
      parentBox,
      childBox: leftChild,
      parentStyle: { structureClass: 'org.xmind.ui.brace.left', shapeClass: ROUNDED_RECT, lineClass: BRACE, lineWidth: 3 },
    }))
    expect(geo.endPt.x).toBe(-154)
    expect(getChildTargetOrientation('brace-left', false)).toBe('right')
    expect(getChildTargetOrientation('brace-right', true)).toBe('left')
  })

  it('有箭头时线尾回缩 lineWidth*arrowSizeRatio(4) + LINE_SPACING(16)', () => {
    const geo = computeConnectionGeometry(input({
      parentBox,
      childBox: box(200, 80, 60, 30),
      parentStyle: {
        structureClass: 'org.xmind.ui.logic.right', shapeClass: ROUNDED_RECT,
        lineClass: ROUNDED_ELBOW, lineWidth: 2, arrowEndClass: 'org.xmind.arrowShape.triangle',
      },
    }))
    // 子盒左边缘 200 + END_OFFSET(+1) - (2*4 + 16) = 177
    expect(geo.endPt.x).toBe(177)
  })
})

describe('connection-geometry：线型与 brush 选择', () => {
  it('lineWidth = 0 → 不画线（SB drawAttachedConnectLine）', () => {
    const geo = computeConnectionGeometry(input({
      parentBox: box(0, 0, 100, 40),
      childBox: box(200, 80, 60, 30),
      parentStyle: { structureClass: 'org.xmind.ui.logic.right', shapeClass: ROUNDED_RECT, lineClass: ROUNDED_ELBOW, lineWidth: 0 },
    }))
    expect(geo.path).toBe('')
    expect(geo.lineShape).toBe('none')
  })

  it('matrix / treetable：单元格之间不画连线（SB spreadsheet*/treetable.drawAttachedConnectLine → NONE）', () => {
    for (const sc of ['org.xmind.ui.spreadsheet', 'org.xmind.ui.structure.spreadsheet.row', 'org.xmind.ui.treetable']) {
      const geo = computeConnectionGeometry(input({
        parentBox: box(0, 0, 100, 40),
        childBox: box(200, 80, 60, 30),
        parentStyle: { structureClass: sc, shapeClass: ROUNDED_RECT, lineClass: ROUNDED_ELBOW, lineWidth: 2 },
      }))
      expect(geo.path, sc).toBe('')
    }
  })

  it('roundedElbow：圆角取子节点 line-corner，拐点走 ctrl（不是中点）', () => {
    const geo = computeConnectionGeometry(input({
      parentBox: box(0, 0, 100, 40),
      childBox: box(200, 80, 60, 30),
    }))
    // roundedElbowHorizon: M start L ctrl L bflex Q flex aflex L end
    expect(geo.path).toBe('M 100 20L 113 20L 113 87Q 113 95 121 95L 201 95')
  })

  it('非「同方向最后一个兄弟」的线从拐点起（SB topiclinestyle/utils.horizon 共享干线）', () => {
    const parentBox = box(0, 0, 100, 40)
    const c0 = box(200, -60, 60, 30)
    const c1 = box(200, 80, 60, 30)
    const first = computeConnectionGeometry(input({
      parentBox, childBox: c0, siblingBoxes: [c0, c1], childIndex: 0,
    }))
    const last = computeConnectionGeometry(input({
      parentBox, childBox: c1, siblingBoxes: [c0, c1], childIndex: 1,
    }))
    expect(nums(first.path).slice(0, 2)).toEqual([113, 20]) // 从 ctrl 起
    expect(nums(last.path).slice(0, 2)).toEqual([100, 20])  // 最后一个从 start 起
  })

  it('brace：只有首/末子节点画线，中间子节点为空', () => {
    const parentBox = box(0, 0, 208, 70)
    const sibs = [0, 1, 2, 3].map((i) => box(170, -300 + i * 60, 72, 44))
    const style = { structureClass: 'org.xmind.ui.brace.right', shapeClass: ROUNDED_RECT, lineClass: BRACE, lineWidth: 3 }
    const paths = sibs.map((childBox, childIndex) =>
      computeConnectionGeometry(input({ parentBox, childBox, parentStyle: style, siblingBoxes: sibs, childIndex })).path)
    expect(paths[0]).not.toBe('')
    expect(paths[1]).toBe('')
    expect(paths[2]).toBe('')
    expect(paths[3]).not.toBe('')
  })

  it('brace 单子节点：画完整括号（上下两半，端点 ± 子盒高/2）', () => {
    const parentBox = box(0, 0, 208, 70)
    const childBox = box(170, -100, 72, 44)
    const geo = computeConnectionGeometry(input({
      parentBox, childBox,
      parentStyle: { structureClass: 'org.xmind.ui.brace.right', shapeClass: ROUNDED_RECT, lineClass: BRACE, lineWidth: 3 },
      siblingBoxes: [childBox], childIndex: 0,
    }))
    // fullBraceVertical = 两段 braceVertical，出现 4 个 Q
    expect((geo.path.match(/Q/g) ?? []).length).toBe(4)
    expect(geo.path).toContain(`${geo.endPt.y - 22}`)
    expect(geo.path).toContain(`${geo.endPt.y + 22}`)
  })

  it('timeline-horizontal：干线从前一个兄弟的右边缘出发（首个子节点用父盒）', () => {
    const parentBox = box(0, 0, 126, 44)
    const c0 = box(200, -300, 60, 30)
    const c1 = box(400, -300, 60, 30)
    const first = computeConnectionGeometry(input({
      parentBox, childBox: c0, siblingBoxes: [c0, c1], childIndex: 0,
      parentStyle: { structureClass: 'org.xmind.ui.timeline.horizontal', shapeClass: ROUNDED_RECT, lineClass: ROUNDED_ELBOW, lineWidth: 2 },
    }))
    const second = computeConnectionGeometry(input({
      parentBox, childBox: c1, siblingBoxes: [c0, c1], childIndex: 1,
      parentStyle: { structureClass: 'org.xmind.ui.timeline.horizontal', shapeClass: ROUNDED_RECT, lineClass: ROUNDED_ELBOW, lineWidth: 2 },
    }))
    expect(first.startPt).toEqual({ x: 126, y: 22 })   // 父盒右边缘中心
    expect(second.startPt).toEqual({ x: 260, y: -285 }) // 前一个兄弟右边缘中心
    expect(second.ctrlPt).toEqual(second.startPt)
  })

  it('timeline-horizontal-up 拐点用加法、-down 用减法（SB 两份 drawAttachedConnectLine 符号相反）', () => {
    const parentBox = box(0, 0, 126, 44)
    const childBox = box(200, -400, 60, 30)
    const mk = (sc: string) => computeConnectionGeometry(input({
      parentBox, childBox,
      parentStyle: { structureClass: sc, shapeClass: ROUNDED_RECT, lineClass: ROUNDED_ELBOW, lineWidth: 2 },
    }))
    const up = mk('org.xmind.ui.timeline.horizontal.up')
    const down = mk('org.xmind.ui.timeline.horizontal.down')
    const dx = Math.abs(up.endPt.x - up.startPt.x)
    const tan30 = Math.tan((Math.PI * 30) / 180)
    // ctrl.x 与 start.x 相同（UP 方向），|endPt.x - ctrlPt.x| 决定 30° 偏移
    const off = Math.abs(up.endPt.x - up.ctrlPt.x) * tan30
    expect(up.ctrlPt.y).toBeCloseTo(up.endPt.y + off, 6)
    expect(down.ctrlPt.y).toBeCloseTo(down.endPt.y - Math.abs(down.endPt.x - down.ctrlPt.x) * tan30, 6)
    expect(dx).toBeGreaterThan(0)
  })

  it('tree-right + roundedElbow：ctrl.y = start.y（SB treeleftandright.drawAttachedConnectLine）', () => {
    const parentBox = box(0, 0, 100, 40)
    const childBox = box(200, 120, 60, 30)
    const geo = computeConnectionGeometry(input({
      parentBox, childBox,
      parentStyle: { structureClass: 'org.xmind.ui.tree.right', shapeClass: ROUNDED_RECT, lineClass: ROUNDED_ELBOW, lineWidth: 2 },
    }))
    expect(geo.ctrlPt.y).toBe(geo.startPt.y)
    expect(geo.startPt).toEqual({ x: 50, y: 40 }) // tree 出线点在底边
  })
})

describe('connection-geometry：生效结构类（SB getViewStructure）', () => {
  const parentBox = box(0, 0, 100, 40)
  const right = box(300, 0, 60, 30)
  const left = box(-200, 0, 60, 30)
  const SKEL_LOGIC_RIGHT = 'org.xmind.ui.logic.right'

  it('map 右侧子节点：skeleton 的 logic.right 直接生效', () => {
    expect(resolveChildStructureClass('map-clockwise', SKEL_LOGIC_RIGHT, parentBox, right, 0)).toBe('logic-right')
  })

  it('map 左侧子节点：logic.right 不在 LEFT_EXPOSED → 镜像回退 logic-left（SIMILAR_STRUCTURE_MAP）', () => {
    expect(resolveChildStructureClass('map-clockwise', SKEL_LOGIC_RIGHT, parentBox, left, 0)).toBe('logic-left')
  })

  it('tree-left / brace-left 同样镜像成 logic-left（实测 SB 两侧 fixture 的 depth≥1 全是 logic.left）', () => {
    expect(resolveChildStructureClass('tree-left', SKEL_LOGIC_RIGHT, parentBox, left, 0)).toBe('logic-left')
    expect(resolveChildStructureClass('brace-left', SKEL_LOGIC_RIGHT, parentBox, left, 0)).toBe('logic-left')
  })

  it('org-chart-down：logic.right 在可用列表里 → 直接生效（不是继承 org-chart-down）', () => {
    expect(resolveChildStructureClass('org-chart-down', SKEL_LOGIC_RIGHT, parentBox, right, 0)).toBe('logic-right')
  })

  it('timeline 系：可用列表为空 → 按下标奇偶（与 tomind timeline 布局同口径）', () => {
    expect(resolveChildStructureClass('timeline-horizontal', SKEL_LOGIC_RIGHT, parentBox, right, 0)).toBe('timeline-horizontal-up')
    expect(resolveChildStructureClass('timeline-horizontal', SKEL_LOGIC_RIGHT, parentBox, right, 1)).toBe('timeline-horizontal-down')
    expect(resolveChildStructureClass('timeline-horizontal-up', SKEL_LOGIC_RIGHT, parentBox, right, 0)).toBe('logic-right')
    expect(resolveChildStructureClass('timeline-through-vertical', null, parentBox, left, 0)).toBe('logic-left')
    expect(resolveChildStructureClass('timeline-through-vertical', null, parentBox, right, 1)).toBe('logic-right')
  })

  it('matrix / fishbone：row、上下骨交替', () => {
    expect(resolveChildStructureClass('spreadsheet', SKEL_LOGIC_RIGHT, parentBox, right, 0)).toBe('spreadsheet-row')
    expect(resolveChildStructureClass('spreadsheet-row', SKEL_LOGIC_RIGHT, parentBox, right, 0)).toBe('logic-right')
    expect(resolveChildStructureClass('fishbone-left-headed', null, parentBox, right, 0)).toBe('left-head-top-bone')
    expect(resolveChildStructureClass('fishbone-left-headed', null, parentBox, right, 1)).toBe('left-head-bottom-bone')
  })

  it('其余结构继承父结构；结构类 URI 与短名都能归一化', () => {
    expect(resolveChildStructureClass('logic-right', null, parentBox, right, 0)).toBe('logic-right')
    expect(resolveChildStructureClass('treetable', null, parentBox, right, 0)).toBe('treetable')
    expect(normalizeStructureClass('org.xmind.ui.map.clockwise')).toBe('map-clockwise')
    expect(normalizeStructureClass('map-clockwise')).toBe('map-clockwise')
    expect(normalizeStructureClass('org.xmind.ui.fishbone.left')).toBe('org.xmind.ui.fishbone.left')
  })
})
