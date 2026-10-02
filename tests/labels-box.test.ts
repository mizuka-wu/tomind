import { describe, it, expect } from 'vitest'
import { measurePartAwareNode } from '../packages/layout/src/part-node-size'
import { DEFAULT_LAYOUT_OPTIONS } from '../packages/layout/src/layout-engine'
import type { NodeDesc } from '../packages/schema/src'

const node: NodeDesc = {
  id: 'n1',
  type: 'topic',
  attrs: { title: '传感器表达方法', labels: ['col1'] },
  children: {},
}

describe('labels box', () => {
  it('prints part-aware size', () => {
    const r = measurePartAwareNode(node, DEFAULT_LAYOUT_OPTIONS, null, null)
    // 主题盒 = title + 2*nodePadding(5) ，labels 在盒外（partBounds y >= 盒高）
    expect(r.height).toBe(r.titleHeight + 10)
    const lb = r.partBounds.get('labels')!
    expect(lb.y).toBeGreaterThanOrEqual(r.height)
  })
})
