/**
 * 主题样式渲染 parity 回归测试（对齐 snowbrush 的实测值）
 *
 * 覆盖本轮修的 4 处样式层差异（量尺：render-compare/scripts/style-parity-dump.mjs
 * 与 scripts/conn-parity.mjs 的「形状/文本渲染级 parity」段）：
 *
 * 1. subTopic 的 fontColor：SB smartcolordescriptor 用
 *    hexStringToHSLObject(分支色) → hslObjectToHexString({h, s, l: 20})，全程浮点；
 *    旧实现用 colord().toHsl()（h/s/l 被四舍五入成整数）→ 每个通道差 ±1，
 *    20 个 fixture × 127 个 subTopic 全中（#605205 vs #605305 等 3 组）。
 * 2. treetable 单元格不填充：SB topicview.refreshFillColor 里
 *    isTreeTableCell && !shouldCollapse → figure.fillColor = 'none'（13 个节点）。
 * 3. matrix / treetable 单元格的私有 shape-class：SB privateStyleDescriptor[BEFORE_USER]
 *    → matrixMain / treetable.main，两者都是 NoBorderTopicShape（方角、不画边框）；
 *    旧实现按主题解析成 roundedRect → 76 个节点多画 8px 圆角。
 * 4. 带 labels 的主题：shape 高 = 主题盒高 - labels 行（SB shapeBounds vs bounds）。
 */

import { describe, it, expect } from 'vitest'
import { SheetState } from '@tomind/state'
import { StyleEngine } from '@tomind/style'
import type { NodeDesc } from '@tomind/schema'
import { getShapeHeight, getShapeBox, withShapeHeight } from '@tomind/view/shape-box'
import type { NodeLayout } from '@tomind/layout'

const node = (
  id: string,
  type: string,
  attrs: Record<string, unknown> = {},
  children: Record<string, readonly NodeDesc[]> = {},
): NodeDesc => ({ id, type, attrs, children })

const RAINBOW = '#F9423A #F6A04D #F3D321 #00BC7B #486AFF #4D49BE'

/** 带 multiLineColors 的主题（与 fixture 用的 Rainbow-#000229 同结构） */
function themeWithMultiLineColors() {
  return {
    map: { id: 'map', properties: { multiLineColors: RAINBOW, fillColor: '#FFFFFF' } },
    centralTopic: { id: 'c', properties: { fillColor: '#000229', lineColor: '#000229' } },
    mainTopic: { id: 'm', properties: { fillColor: '#FFFFFF' } },
    subTopic: { id: 's', properties: { fillColor: '#FFFFFF' } },
  }
}

function buildState(doc: NodeDesc): SheetState {
  return SheetState.create({ doc })
}

describe('subTopic fontColor：SB 浮点 HSL（l = 20）', () => {
  // SB 实测值（render-compare 页面里 styleManager.getStyleValue(branch, 'fo:color')）
  const EXPECTED: Record<string, string> = {
    '#F9423A': '#620703',
    '#F6A04D': '#613204',
    '#F3D321': '#605205',
    '#00BC7B': '#006642',
    '#486AFF': '#001266',
    '#4D49BE': '#1c1a4b',
  }

  const doc = node('root', 'root', { title: 'R', theme: themeWithMultiLineColors() }, {
    attached: Object.keys(EXPECTED).map((_, i) =>
      node(`m${i}`, 'topic', { title: `M${i}` }, {
        attached: [node(`s${i}`, 'topic', { title: `S${i}` })],
      })),
  })
  const state = buildState(doc)
  const engine = new StyleEngine()

  it.each(Object.keys(EXPECTED).map((c, i) => [c, i] as const))(
    '分支色 %s → fontColor 与 SB 一致',
    (color, i) => {
      const style = engine.computeStyle(state, `s${i}`)
      expect(style.lineColor).toBe(color)
      expect(style.fontColor).toBe(EXPECTED[color])
    },
  )

  it('mainTopic（实心填充）走 getSmartTextColor：白字', () => {
    const style = engine.computeStyle(state, 'm0')
    expect(style.fontColor).toBe('#ffffff')
  })

  it('不是 colord 的取整结果（旧实现会得到 #605305 / #603105 / #1c1b4a）', () => {
    const style = engine.computeStyle(state, 's2') // #F3D321
    expect(style.fontColor).not.toBe('#605305')
    expect(style.fontColor).toBe('#605205')
  })
})

describe('treetable 单元格不填充（SB topicview.refreshFillColor）', () => {
  const build = (structureClass: string) => {
    const doc = node('root', 'root', { title: 'R', structureClass }, {
      attached: [node('main', 'topic', { title: 'M' }, {
        attached: [node('sub', 'topic', { title: 'S' })],
      })],
    })
    const state = buildState(doc)
    const engine = new StyleEngine()
    return { state, engine }
  }

  it('treetable 的 head 与单元格 fill = null（渲染层不画底）', () => {
    const { state, engine } = build('org.xmind.ui.treetable')
    expect(engine.getLeaferStyle(state, 'root').fill).toBeNull()
    expect(engine.getLeaferStyle(state, 'main').fill).toBeNull()
  })

  it('treetable 里更深的节点不是单元格，照常填充', () => {
    const { state, engine } = build('org.xmind.ui.treetable')
    expect(engine.getLeaferStyle(state, 'sub').fill).not.toBeNull()
  })

  it('非 treetable 结构不受影响', () => {
    const { state, engine } = build('org.xmind.ui.map.clockwise')
    expect(engine.getLeaferStyle(state, 'root').fill).not.toBeNull()
    expect(engine.getLeaferStyle(state, 'main').fill).not.toBeNull()
  })

  it('折叠的 treetable head 仍按样式填充（SB !shouldCollapse 条件）', () => {
    const doc = node('root', 'root', { title: 'R', structureClass: 'org.xmind.ui.treetable', collapsed: true }, {
      attached: [node('main', 'topic', { title: 'M' })],
    })
    const state = buildState(doc)
    const engine = new StyleEngine()
    expect(engine.getLeaferStyle(state, 'root').fill).not.toBeNull()
  })
})

describe('matrix / treetable 私有 shape-class（SB privateStyleDescriptor BEFORE_USER）', () => {
  const build = (structureClass: string, depth: number) => {
    let leaf = node('n3', 'topic', { title: 'D3' })
    let cur = leaf
    for (let d = depth - 1; d >= 0; d--) {
      cur = node(`n${d}`, d === 0 ? 'root' : 'topic', { title: `D${d}`, ...(d === 0 ? { structureClass } : {}) }, { attached: [cur] })
    }
    void leaf
    const state = buildState(cur)
    const engine = new StyleEngine()
    return { state, engine, rootId: 'n0' }
  }

  it('matrix：自己 / 子 / 孙 三层都是 matrixMain（SB isMatrixCell iter(target,2)）', () => {
    const { state, engine } = build('org.xmind.ui.spreadsheet', 3)
    for (const id of ['n0', 'n1', 'n2']) {
      expect(engine.computeStyle(state, id).shapeClass, id).toBe('org.xmind.topicShape.matrixMain')
      expect(engine.getLeaferStyle(state, id).shapeClass).toBe('matrixMain')
    }
  })

  it('treetable：head 与单元格是 treetable.main，渲染层走 NoBorder（方角）', () => {
    const { state, engine } = build('org.xmind.ui.treetable', 2)
    expect(engine.computeStyle(state, 'n0').shapeClass).toBe('org.xmind.topicShape.treetable.main')
    expect(engine.computeStyle(state, 'n1').shapeClass).toBe('org.xmind.topicShape.treetable.main')
    expect(engine.getLeaferStyle(state, 'n0').shapeClass).toBe('treetable.main')
  })

  it('普通结构不被覆盖', () => {
    const { state, engine } = build('org.xmind.ui.map.clockwise', 3)
    for (const id of ['n0', 'n1', 'n2']) {
      expect(engine.computeStyle(state, id).shapeClass, id).not.toBe('org.xmind.topicShape.matrixMain')
    }
  })
})

describe('callout 主题（SB className = calloutTopic + protectedHandleKey）', () => {
  const doc = node('root', 'root', { title: 'R' }, {
    attached: [node('m', 'topic', { title: 'M' })],
    callout: [node('co', 'topic', { title: 'CO' })],
  })
  const state = buildState(doc)
  const engine = new StyleEngine()

  it('children.callout 槽里的节点按 calloutTopic 取样式（不是 subTopic）', () => {
    // SB getSuggestedClassName：isCalloutBranch → CLASS_TYPE.CALLOUT_TOPIC
    const style = engine.computeStyle(state, 'co')
    expect(style.shapeCorner).toBe('5pt')      // SB defaultstyles.CALLOUT_TOPIC
    expect(style.fillColor).toBe('#333333')
    expect(style.marginLeft).toBe(6) // normalizeStyleObject 会把 margin 的 pt 剥成数字
  })

  it('shape-class 被改写成 callout-shape-class（SB protectedHandleKey）', () => {
    const style = engine.computeStyle(state, 'co')
    expect(style.calloutShapeClass).toBe('org.xmind.calloutTopicShape.balloon.roundedRect')
    expect(style.shapeClass).toBe('org.xmind.calloutTopicShape.balloon.roundedRect')
    // 渲染层归一化后落到默认 roundedRect 分支（SB getTopicShape 对未注册的 callout 形状同样回退）
    expect(engine.getLeaferStyle(state, 'co').shapeClass).toBe('balloon.roundedRect')
  })
})

describe('shape 盒（SB topicView.shapeBounds）', () => {
  const base: NodeLayout = {
    x: 10, y: 20, width: 100, height: 54,
    titleWidth: 80, titleHeight: 18, branchHeight: 54,
  }

  it('没有 labels 时 shape 高 = 主题盒高', () => {
    expect(getShapeHeight(base)).toBe(54)
    expect(getShapeBox(base)).toEqual({ x: 10, y: 20, width: 100, height: 54 })
    expect(withShapeHeight(base)).toBe(base) // 同一对象，不额外分配
  })

  it('有 labels 时 shape 高 = labels.y - verticalSpacing(4)（实测 SB 30 vs 主题盒 54）', () => {
    const withLabels: NodeLayout = {
      ...base,
      partBounds: new Map([['labels', { x: 6, y: 34, width: 88, height: 20 }]]),
    }
    expect(getShapeHeight(withLabels)).toBe(30)
    expect(getShapeBox(withLabels)).toEqual({ x: 10, y: 20, width: 100, height: 30 })
    expect(withShapeHeight(withLabels).height).toBe(30)
    // 其余字段保持不变
    expect(withShapeHeight(withLabels).width).toBe(100)
    expect(withShapeHeight(withLabels).titleHeight).toBe(18)
  })

  it('labels 位置异常（y <= spacing）时退回主题盒高，不会画出 0 高形状', () => {
    const broken: NodeLayout = {
      ...base,
      partBounds: new Map([['labels', { x: 0, y: 2, width: 10, height: 10 }]]),
    }
    expect(getShapeHeight(broken)).toBe(54)
  })
})
