/**
 * 「没有 mainTopic 祖先」的分支的 smart color 派生 — SB smartcolordescriptor[BEFORE_THEME]
 *
 * 旧实现：`resolveMultiLineColors` 在 `getMainTopicAncestor` 返回 null 时**整个早退** →
 * 挂在中央主题上的 callout 子树、detached（自由主题）自己及其子树拿不到任何派生色。
 * 但 SB 的派生是**按 `branchView.figure.lineColor`** 做的（getSmartFillColorByLineColor /
 * smartcolordescriptor 的 rule 2·3·4），跟有没有 mainTopic 祖先无关 —— 那条 lineColor
 * 是级联（含 protectedParentStyleValue 的父继承）之后的值。
 *
 * SB 实测值（scripts/sb-color-chain.mjs + style-parity-dump.mjs）：
 *   test-callout-children（3 个 callout 挂在中央主题上，各 6 个后代 = 18 个节点）：
 *     line-color #000229（继承中央主题） → fill **#ccccd4** = blendAlpha(#000229, 0.2, #FFFFFF)
 *     border-line-color **#000229**、fo:color **#000466** = hsl(#000229 的 h/s, l=20)（rule 4：
 *     callout 子树的 isAncestorFloating = false，因为 calloutTopic 不是 subTopic）
 *     TM 旧值：fill **null**（形状画成透明，肉眼最明显）、border #232323、fontColor #0A0E16
 *   test-detached（detached 子树）：fo:color **#000229** —— 走 rule 2（isAncestorFloating = true
 *     → 候选色表 = 主题 map 的 color-list "#000229 #1F2766 #52CC83 #4D86DB #99142F #245570"）
 *   test-callout-branch（callout 挂在主分支上，**有** mainTopic 祖先）：主题给了
 *     calloutTopic svg:fill #000229 → SB fill/border 都是 #000229，而 TM 旧实现无条件用
 *     分支色覆盖 → #F9423A / #F6A04D / #4D49BE（3 个节点两个键全错）
 *   calloutShapeClass 泄漏：SB 对 callout 的后代是 null，TM 从父节点透传成 balloon.roundedRect
 *     （test-callout-children 18 个 / test-callout-branch 6 个）
 *
 * 修完 style-parity-dump 在这三个 fixture 上**零差异**（只剩 multiLineColors 这个键语义差异）。
 */

import { describe, it, expect } from 'vitest'
import { SheetState } from '@tomind/state'
import { StyleEngine } from '@tomind/style'
import type { NodeDesc } from '@tomind/schema'

const node = (
  id: string,
  type: string,
  attrs: Record<string, unknown> = {},
  children: Record<string, readonly NodeDesc[]> = {},
): NodeDesc => ({ id, type, attrs, children })

const RAINBOW = '#F9423A #F6A04D #F3D321 #00BC7B #486AFF #4D49BE'
/** demo.xmind 主题的 color-list（sb-color-chain.mjs 实测 sheetColorList） */
const COLOR_LIST = '#000229 #1F2766 #52CC83 #4D86DB #99142F #245570'

/** 与 demo.xmind 同结构：mainTopic / subTopic 都**不给** svg:fill（smart fill 才会触发） */
const theme = () => ({
  map: { id: 'map', properties: { multiLineColors: RAINBOW, fillColor: '#FFFFFF', colorList: COLOR_LIST } },
  centralTopic: { id: 'c', properties: { fillColor: '#000229', lineColor: '#000229' } },
  mainTopic: { id: 'm', properties: { lineWidth: '2pt' } },
  subTopic: { id: 's', properties: { lineWidth: '2pt' } },
  calloutTopic: { id: 'co', properties: { calloutShapeClass: 'org.xmind.calloutTopicShape.balloon.roundedRect' } },
  // demo.xmind 的 colorTheme 给 floatingTopic 的 svg:fill（sb-color-chain.mjs 实测 themeFillColor）
  floatingTopic: { id: 'f', properties: { fillColor: '#EEEBEE', borderColor: '#EEEBEE' } },
})

/** callout 挂在中央主题上（→ 它的子树没有 mainTopic 祖先）；detached 带一个子节点 */
const doc = node('root', 'root', { title: 'R', theme: theme() }, {
  attached: [node('m0', 'topic', { title: 'M0' }, { attached: [node('s0', 'topic', { title: 'S0' })] })],
  callout: [node('co0', 'callout', { title: 'CO0', position: { x: 800, y: -800 } }, {
    attached: [node('co0-1', 'topic', { title: 'CO0-1' })],
  })],
  detached: [node('det0', 'detached', { title: 'D0', position: { x: 1600, y: -1000 } }, {
    attached: [node('det0-1', 'topic', { title: 'D0-1' })],
  })],
})

const state = SheetState.create({ doc })
const engine = new StyleEngine()
const styleOf = (id: string) => engine.computeStyle(state, id)

describe('callout 子树（无 mainTopic 祖先）：用继承到的 lineColor 当分支色', () => {
  it('lineColor 从中央主题继承下来（#000229）', () => {
    expect(styleOf('co0-1').lineColor).toBe('#000229')
  })

  it('fillColor = blendAlpha(#000229, 0.2, map.fillColor #FFFFFF) = #ccccd4（旧值 null = 透明）', () => {
    expect(styleOf('co0-1').fillColor).toBe('#ccccd4')
  })

  it('borderColor = 分支色 #000229（旧值 = subTopic 默认 #232323）', () => {
    expect(styleOf('co0-1').borderColor).toBe('#000229')
  })

  it('fontColor = hsl(分支色 h/s, l=20) = #000466（rule 4：callout 后代 isAncestorFloating = false）', () => {
    expect(styleOf('co0-1').fontColor).toBe('#000466')
  })

  it('callout 自己：主题给了 calloutTopic fill 就用主题的，不被分支色覆盖', () => {
    const st = SheetState.create({
      doc: node('root', 'root', {
        title: 'R',
        theme: { ...theme(), calloutTopic: { id: 'co', properties: { fillColor: '#000229' } } },
      }, {
        attached: [node('m0', 'topic', { title: 'M0' })],
        callout: [node('co0', 'callout', { title: 'CO0', position: { x: 800, y: -800 } })],
      }),
    })
    // 挂在 #F9423A 的主分支上（有 mainTopic 祖先 → 走层 4.6），SB 仍是主题的 #000229
    const coStyle = engine.computeStyle(st, 'co0')
    expect(coStyle.fillColor).toBe('#000229')
    expect(coStyle.borderColor).toBe('#000229')
  })
})

describe('detached 子树：isAncestorFloating = true → 走主题的 color-list（rule 2）', () => {
  it('detached 自己：fill 用主题的 #EEEBEE，fontColor 从 color-list 里挑 #000229（旧值 = 默认 #FFFFFF）', () => {
    expect(styleOf('det0').fillColor).toBe('#EEEBEE')
    expect(styleOf('det0').fontColor).toBe('#000229')
  })

  it('detached 的子节点同样是 #000229，而不是 rule 4 的 #000466', () => {
    expect(styleOf('det0-1').fontColor).toBe('#000229')
    expect(styleOf('det0-1').fillColor).toBe('#ccccd4')
    expect(styleOf('det0-1').borderColor).toBe('#000229')
  })
})

describe('calloutShapeClass 不从父节点泄漏给后代', () => {
  it('callout 自己有（主题/默认），后代是 undefined（SB 实测 null）', () => {
    expect(styleOf('co0').calloutShapeClass).toBeTruthy()
    expect(styleOf('co0-1').calloutShapeClass).toBeUndefined()
    expect(styleOf('det0-1').calloutShapeClass).toBeUndefined()
  })
})

describe('有 mainTopic 祖先的分支不受影响（回归护栏）', () => {
  it('mainTopic 用分支色实心填充、subTopic 用 20% 混合', () => {
    expect(styleOf('m0').lineColor).toBe('#F9423A')
    expect(styleOf('m0').fillColor).toBe('#F9423A')
    expect(styleOf('s0').fillColor).toBe('#fed9d8')  // blendAlpha(#F9423A, 0.2, #FFFFFF)
    expect(styleOf('s0').fontColor).toBe('#620703')
  })
})
