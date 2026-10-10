/**
 * treetable 结构样式覆盖回归测试
 *
 * 对齐 snowbrush modules/overridedstyle/structuredescriptor.beforeTheme：
 * treetable 单元格里的 mainTopic，margin-left/right 改用 subTopic 的值
 * （主题优先，回退 default 6pt），margin-top/bottom 保持 mainTopic 的 10pt。
 *
 * 这条覆盖同时决定 treetable 的两处几何量：
 * - 主题盒宽度 topicBounds.width = titleWidth + 2 * margin
 * - 单元格扩展宽 getExtendWidth = borderWidth + (margin * 10) / defaultMargin
 * 缺了它，mainTopic 列会用 18pt 而非 6pt，实测整表右侧偏移 30.7px。
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

const buildDoc = (structureClass: string): NodeDesc =>
  node(
    'root',
    'root',
    { title: 'Root', structureClass },
    {
      attached: [
        node('main', 'topic', { title: 'Main' }, {
          attached: [node('sub', 'topic', { title: 'Sub' })],
        }),
      ],
    },
  )

const computeAll = (structureClass: string) => {
  const doc = buildDoc(structureClass)
  const state = SheetState.create({ doc })
  const engine = new StyleEngine()
  return {
    main: engine.computeStyle(state, 'main'),
    sub: engine.computeStyle(state, 'sub'),
    root: engine.computeStyle(state, 'root'),
  }
}

describe('treetable mainTopic margin 覆盖', () => {
  it('treetable 下 mainTopic 的 margin-left/right 取 subTopic 值（6pt）', () => {
    const { main } = computeAll('org.xmind.ui.treetable')
    expect(parseFloat(String(main.marginLeft))).toBe(6)
    expect(parseFloat(String(main.marginRight))).toBe(6)
  })

  it('margin-top/bottom 不被覆盖（仍为 mainTopic 的 10pt）', () => {
    const { main } = computeAll('org.xmind.ui.treetable')
    expect(parseFloat(String(main.marginTop))).toBe(10)
    expect(parseFloat(String(main.marginBottom))).toBe(10)
  })

  it('非 treetable 结构下 mainTopic 仍为 18pt', () => {
    const { main } = computeAll('org.xmind.ui.map.clockwise')
    expect(parseFloat(String(main.marginLeft))).toBe(18)
    expect(parseFloat(String(main.marginRight))).toBe(18)
  })

  it('toptitle 变体同样生效，centralTopic / subTopic 不受影响', () => {
    const { main, sub, root } = computeAll('org.xmind.ui.treetable.toptitle')
    expect(parseFloat(String(main.marginLeft))).toBe(6)
    expect(parseFloat(String(sub.marginLeft))).toBe(6)
    expect(parseFloat(String(root.marginLeft))).toBe(29)
  })

  it('用户显式 style.marginLeft 优先级高于结构覆盖', () => {
    const doc = buildDoc('org.xmind.ui.treetable')
    const main = doc.children.attached[0]
    const withUserStyle: NodeDesc = {
      ...main,
      attrs: { ...main.attrs, style: { marginLeft: '24pt' } },
    }
    const patched: NodeDesc = { ...doc, children: { attached: [withUserStyle] } }
    const state = SheetState.create({ doc: patched })
    const engine = new StyleEngine()
    const resolved = engine.computeStyle(state, 'main')
    expect(parseFloat(String(resolved.marginLeft))).toBe(24)
  })
})
