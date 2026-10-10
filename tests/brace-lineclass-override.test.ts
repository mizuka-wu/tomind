/**
 * brace 连接线结构覆盖回归测试
 *
 * 对齐 snowbrush modules/overridedstyle/structuredescriptor[STYLE_LAYER.BEFORE_USER]：
 * - brace 结构（brace-left / brace-right）强制 lineClass = branchConnection.brace
 * - 反之 brace 连接线只能出现在 brace 结构里，否则回落 roundedElbow
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
