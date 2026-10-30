/**
 * structuredescriptor[STYLE_LAYER.BEFORE_USER] 的 lineClass 结构覆盖回归测试
 *
 * 对齐 snowbrush modules/overridedstyle/structuredescriptor[STYLE_LAYER.BEFORE_USER]：
 * - brace 结构（brace-left / brace-right）强制 lineClass = branchConnection.brace
 * - 反之 brace 连接线只能出现在 brace 结构里，否则回落 roundedElbow
 * - timeline.through.vertical 结构强制 lineClass = branchConnection.straight
 *   （数组最后一条，命中时覆盖前两条；实测 test-arrow-through-vertical 12 条轴边
 *    SB straight / TM curve）
 * BEFORE_USER 层在 mindmapstyleselector.getStyleValue 里排在 getUserStyleValue **之前**
 * → 优先级高于用户显式样式。
 *
 * 布局侧依赖这条覆盖：logic/brace 的 calcSpacingMajor 只对
 * curve/straight/fold/roundedFold/bight 翻倍，brace 线不翻倍。
 * 缺了它 brace-right 中央分支间距会算成 50*2+16=116 而非 50+16=66，
 * 实测整棵子树右移 110px（avgΔX 10.6）。
 */

import { describe, it, expect } from 'vitest'
import { SheetState } from '@tomind/state'
import { StyleEngine } from '@tomind/style'
import type { NodeDesc } from '@tomind/schema'

const BRACE = 'org.xmind.branchConnection.brace'
const STRAIGHT = 'org.xmind.branchConnection.straight'
const THROUGH_VERTICAL = 'org.xmind.ui.timeline.through.vertical'
const CURVE_SHORT = 'curve'
const ELBOW = 'org.xmind.branchConnection.roundedElbow'

const node = (
  id: string,
  type: string,
  attrs: Record<string, unknown> = {},
  children: Record<string, readonly NodeDesc[]> = {},
): NodeDesc => ({ id, type, attrs, children })

const resolve = (rootAttrs: Record<string, unknown>, childAttrs: Record<string, unknown> = {}) => {
  const doc = node('root', 'root', { title: 'Root', ...rootAttrs }, {
    attached: [node('main', 'topic', { title: 'Main', ...childAttrs })],
  })
  const state = SheetState.create({ doc })
  const engine = new StyleEngine()
  return {
    root: engine.computeStyle(state, 'root'),
    main: engine.computeStyle(state, 'main'),
  }
}

describe('brace lineClass 结构覆盖', () => {
  it('brace-right 结构的中央分支强制 brace 连接线', () => {
    const { root } = resolve({ structureClass: 'org.xmind.ui.brace.right' })
    expect(root.lineClass).toBe(BRACE)
  })

  it('brace-left 结构同样生效', () => {
    const { root } = resolve({ structureClass: 'org.xmind.ui.brace.left' })
    expect(root.lineClass).toBe(BRACE)
  })

  it('skeleton centralTopic 为 brace 时也生效', () => {
    const { root } = resolve({
      skeletonStructure: { centralTopic: 'org.xmind.ui.brace.right', mainTopic: 'org.xmind.ui.logic.right' },
    })
    expect(root.lineClass).toBe(BRACE)
  })

  it('非 brace 结构保留默认连接线（不被改成 brace）', () => {
    const { root } = resolve({ structureClass: 'org.xmind.ui.map.clockwise' })
    // 无主题时取 DEFAULT_STYLES 的短名
    expect(root.lineClass).toBe(CURVE_SHORT)
  })

  it('brace 连接线出现在非 brace 结构时回落 roundedElbow', () => {
    const { main } = resolve(
      { structureClass: 'org.xmind.ui.logic.right' },
      { style: { lineClass: BRACE } },
    )
    expect(main.lineClass).toBe(ELBOW)
  })

  it('brace 结构下用户设的 brace2 连接线不被覆盖', () => {
    const { root } = resolve({
      structureClass: 'org.xmind.ui.brace.right',
      style: { lineClass: 'org.xmind.branchConnection.brace2' },
    })
    expect(root.lineClass).toBe('org.xmind.branchConnection.brace2')
  })
})

describe('brace 的 lineClass 覆盖按**继承下来的生效结构**逐层生效', () => {
  /**
   * SB `structuredescriptor[BEFORE_USER]` 的判据是 `isBraceStructure(branchView)` =
   * **这个分支自己的 getStructureClass()**，而生效结构在 preset 缺失时**继承父结构**
   * （AbstractStructure.getChildStructure = `return parentStructure`）。
   *
   * TM 旧的 resolveStructureClass 只有「自己的 structureClass || skeleton[role] ?? sk.mainTopic」，
   * 没有继承 ⇒ 深层节点判不出 brace：
   *   - test-brace-inherit（root=brace.right、**没有 skeleton**）：222 条边 SB brace / TM roundedElbow，
   *     连线几何 mean 6.40 / max 60.00
   *   - test-org-brace-branch（skeleton 两层都写 org-chart.down、某个 d1 显式声明 brace.right）：
   *     它的后代被 skeleton.mainTopic 挡住 ⇒ 28 条边错、几何 0.38 / 13.00
   */
  const deep = (rootAttrs: Record<string, unknown>, branchAttrs: Record<string, unknown> = {}) => {
    const doc = node('root', 'root', { title: 'Root', ...rootAttrs }, {
      attached: [
        node('d1', 'topic', { title: 'D1', ...branchAttrs }, {
          attached: [node('d2', 'topic', { title: 'D2' }, {
            attached: [node('d3', 'topic', { title: 'D3' })],
          })],
        }),
      ],
    })
    const state = SheetState.create({ doc })
    const engine = new StyleEngine()
    return {
      root: engine.computeStyle(state, 'root'),
      d1: engine.computeStyle(state, 'd1'),
      d2: engine.computeStyle(state, 'd2'),
      d3: engine.computeStyle(state, 'd3'),
    }
  }

  it('没有 skeleton 时，brace.right 一直继承到 d3（每一层的连接线都是 brace）', () => {
    const r = deep({ structureClass: 'org.xmind.ui.brace.right' })
    expect(r.root.lineClass).toBe(BRACE)
    expect(r.d1.lineClass).toBe(BRACE)
    expect(r.d2.lineClass).toBe(BRACE)
    expect(r.d3.lineClass).toBe(BRACE)
  })

  it('skeleton 写了别的结构时，**显式声明**的那一支及其后代仍是 brace（精确 preset + 继承）', () => {
    const r = deep(
      {
        structureClass: 'org.xmind.ui.org-chart.down',
        skeletonStructure: { centralTopic: 'org.xmind.ui.org-chart.down', mainTopic: 'org.xmind.ui.org-chart.down' },
      },
      { structureClass: 'org.xmind.ui.brace.right' },
    )
    expect(r.root.lineClass).not.toBe(BRACE)
    expect(r.d1.lineClass).toBe(BRACE)
    expect(r.d2.lineClass).toBe(BRACE)
    expect(r.d3.lineClass).toBe(BRACE)
  })

  it('skeleton 的 mainTopic 命中时不继承父结构（d1 起是 logic.right，不是 brace）', () => {
    const r = deep({
      structureClass: 'org.xmind.ui.brace.right',
      skeletonStructure: { centralTopic: 'org.xmind.ui.brace.right', mainTopic: 'org.xmind.ui.logic.right' },
    })
    expect(r.root.lineClass).toBe(BRACE)
    expect(r.d1.lineClass).not.toBe(BRACE)
    expect(r.d2.lineClass).not.toBe(BRACE)
  })

  it('through.vertical 的子分支**不**继承轴结构（SB getChildStructure 给的是 logic.left/right）', () => {
    const r = deep({ structureClass: THROUGH_VERTICAL })
    expect(r.root.lineClass).toBe(STRAIGHT)
    expect(r.d1.lineClass).not.toBe(STRAIGHT)
    expect(r.d3.lineClass).not.toBe(STRAIGHT)
  })

  /**
   * SB `getViewStructure` 的第一关：preset 还得过父结构的 `getAvailableChildStructure`。
   * through.vertical / timeline.horizontal / sided.horizontal / spreadsheet 的 available = **[]**
   * ⇒ skeleton 写的宿主结构对子分支**一律无效**，生效结构走宿主的 getChildStructure
   * （through.vertical → logic.left/right 交替）。
   * 漏了这条 ⇒ d1 被判成 through.vertical ⇒ lineClass 强制 straight ⇒
   * 布局侧 calcSpacingMajor 把 spacingMajor 翻倍（26 → 52），
   * 实测对照组 noskel-timeline.through.vertical：avgΔX 24.4（222/235 个节点 dx = ±26）。
   */
  it('skeleton 把宿主结构写给子分支时也要过 available 表（available = [] ⇒ preset 作废）', () => {
    const r = deep({
      structureClass: THROUGH_VERTICAL,
      skeletonStructure: { centralTopic: THROUGH_VERTICAL, mainTopic: THROUGH_VERTICAL },
    })
    expect(r.root.lineClass).toBe(STRAIGHT) // 中央分支自己就是轴 ⇒ 仍然 straight
    expect(r.d1.lineClass).not.toBe(STRAIGHT)
    expect(r.d2.lineClass).not.toBe(STRAIGHT)
    expect(r.d3.lineClass).not.toBe(STRAIGHT)
  })

  it('treetable 宿主下 skeleton 写 treetable 是**可用**的（同组只排除另一张表）⇒ 不影响 brace 判定', () => {
    const r = deep({
      structureClass: 'org.xmind.ui.treetable',
      skeletonStructure: { centralTopic: 'org.xmind.ui.treetable', mainTopic: 'org.xmind.ui.treetable' },
    })
    // treetable 不是 brace ⇒ 主题里那条 brace 线要被回落成 roundedElbow（BEFORE_USER 第二条）
    expect(r.d1.lineClass).not.toBe(BRACE)
  })
})

describe('timeline.through.vertical 强制 straight 连接线', () => {
  it('轴头（生效结构类 = through.vertical）的 lineClass 被改成 straight', () => {
    const { root } = resolve({ structureClass: THROUGH_VERTICAL })
    expect(root.lineClass).toBe(STRAIGHT)
  })

  it('skeleton centralTopic 为 through.vertical 时同样生效', () => {
    const { root } = resolve({
      skeletonStructure: { centralTopic: THROUGH_VERTICAL, mainTopic: 'org.xmind.ui.logic.right' },
    })
    expect(root.lineClass).toBe(STRAIGHT)
  })

  it('BEFORE_USER 优先级高于用户显式样式（用户设 curve 仍被改成 straight）', () => {
    const { root } = resolve({
      structureClass: THROUGH_VERTICAL,
      style: { lineClass: 'org.xmind.branchConnection.curve' },
    })
    expect(root.lineClass).toBe(STRAIGHT)
  })

  it('轴子节点（生效结构类 logic.left/right）不受影响', () => {
    const { main } = resolve({ structureClass: THROUGH_VERTICAL })
    expect(main.lineClass).not.toBe(STRAIGHT)
  })

  it('timeline.horizontal 不命中这条规则（SB 只写了 TIMELINETHROUGHVERTICAL）', () => {
    const { root } = resolve({ structureClass: 'org.xmind.ui.timeline.horizontal' })
    expect(root.lineClass).toBe(CURVE_SHORT)
  })
})
