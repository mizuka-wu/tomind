import { describe, it, expect } from 'vitest'
import { modelToNodeDesc } from '../packages/formats/src/model-to-node'
import type { ModelTree } from '../packages/formats/src/model-to-node'

function buildSpecialTree(): ModelTree {
  return {
    root: {
      id: 'root',
      title: 'Root',
      children: [
        {
          id: 'm0',
          title: 'Main A',
          children: [
            { id: 'c0', title: 'C0', children: [] },
            { id: 'c1', title: 'C1', children: [] },
          ],
          summaries: [
            { id: 'sum-1', title: 'Sum', children: [], rangeStart: 0, rangeEnd: 1 },
          ],
          relationships: [
            { id: 'rel-1', title: 'Rel', children: [], sourceId: 'm0', targetId: 'm1' },
          ],
        },
        {
          id: 'm1',
          title: 'Main B',
          children: [{ id: 'c2', title: 'C2', children: [] }],
          boundaries: [
            { id: 'bnd-1', title: 'Bnd', children: [], rangeStart: 0, rangeEnd: 0 },
          ],
        },
      ],
    },
    relationships: [
      { id: 'rel-2', title: 'Rel2', children: [], sourceId: 'm0', targetId: 'c2' },
    ],
  }
}

describe('special nodes import', () => {
  it('maps summary/boundary/relationship into children slots', () => {
    const doc = modelToNodeDesc(buildSpecialTree())
    const mains = doc.children.attached ?? []
    expect(mains.length).toBe(2)

    const m0 = mains[0]
    const m1 = mains[1]
    expect(m0.children.summary?.length).toBe(1)
    expect(m1.children.boundary?.length).toBe(1)
    // node-level relationship stays on its parent
    expect(m0.children.relationship?.length).toBe(1)
    // tree-level relationship attaches to root
    expect(doc.children.relationship?.length).toBe(1)

    const summary = m0.children.summary![0]
    expect(summary.type).toBe('summary')
    expect(summary.attrs.rangeStart).toBe(0)
    expect(summary.attrs.rangeEnd).toBe(1)
    expect(summary.attrs.title).toBe('Sum')

    const boundary = m1.children.boundary![0]
    expect(boundary.type).toBe('boundary')
    expect(boundary.attrs.rangeStart).toBe(0)
    expect(boundary.attrs.rangeEnd).toBe(0)

    const nodeRel = m0.children.relationship![0]
    expect(nodeRel.type).toBe('relationship')
    expect(nodeRel.attrs.sourceId).toBe('m0')
    expect(nodeRel.attrs.targetId).toBe('m1')

    const treeRel = doc.children.relationship![0]
    expect(treeRel.type).toBe('relationship')
    expect(treeRel.attrs.sourceId).toBe('m0')
    expect(treeRel.attrs.targetId).toBe('c2')
  })
})
