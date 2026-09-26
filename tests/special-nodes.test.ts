import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseXMind } from '../packages/formats/src/xmind'
import { modelToNodeDesc } from '../packages/formats/src/model-to-node'

describe('special nodes import', () => {
  it('imports summary/boundary/relationship', async () => {
    const buf = readFileSync('/Users/mizuka/Projects/fe/render-compare/public/test-special.xmind')
    const tree = await parseXMind(new Uint8Array(buf))
    const doc = modelToNodeDesc(tree)

    // find main topics
    const mains = doc.children.attached ?? []
    expect(mains.length).toBeGreaterThan(1)

    const m0 = mains[0]
    const m1 = mains[1]
    console.log('m0 slots', Object.keys(m0.children), 'm1 slots', Object.keys(m1.children))
    console.log('root slots', Object.keys(doc.children))
    console.log('m0 summary', m0.children.summary)
    console.log('m1 boundary', m1.children.boundary)
    console.log('root rel', doc.children.relationship)

    expect(m0.children.summary?.length).toBe(1)
    expect(m1.children.boundary?.length).toBe(1)
    expect(doc.children.relationship?.length).toBe(1)
    const rel = doc.children.relationship![0]
    expect(rel.type).toBe('relationship')
    expect(rel.attrs.sourceId).toBeTruthy()
    expect(rel.attrs.targetId).toBeTruthy()
  }, 10000)
})
