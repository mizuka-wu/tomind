import { describe, it, expect } from 'vitest'
import { createHeadlessSheetState, numberingKey } from '@tomind/state'
import { StyleEngine } from '@tomind/style'
import type { NodeDesc } from '@tomind/schema'

const mk = (id: string, title: string, attrs: Record<string, unknown> = {}, children: NodeDesc[] = []): NodeDesc => ({
  id, type: 'topic', attrs: { title, ...attrs }, children: children.length ? { attached: children } : {},
})

describe('headless numbering plugin', () => {
  it('exposes numberingText via style engine', () => {
    const doc = mk('r', 'root', { numbering: { numberFormat: 'org.xmind.numbering.arabic' } }, [
      mk('a', 'A'), mk('b', 'B'),
    ])
    ;(doc as any).type = 'root'
    const state = createHeadlessSheetState({ doc })
    const field = (state as any).field(numberingKey)
    console.log('plugins', state.plugins.length, 'field', field ? Array.from((field as any).texts.entries()) : field)
    const se = new StyleEngine()
    const ls = se.getLeaferStyle(state, 'a') as any
    console.log('numberingText a =', ls.numberingText)
    expect(ls.numberingText).toBeTruthy()
  })
})
