/**
 * 布局算法测试
 */

import { describe, it, expect } from 'vitest'
import { createTreeLayoutAlgorithm } from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'

const createTestNode = (
  id: string,
  type: string,
  attrs: Record<string, unknown> = {},
  children: Record<string, readonly NodeDesc[]> = {}
): NodeDesc => ({
  id,
  type,
  attrs,
  children,
})

describe('Tree Layout', () => {
  it('should layout single node', () => {
    const algorithm = createTreeLayoutAlgorithm('tree-right', 'right')
    const doc = createTestNode('root', 'root', { title: 'Root' }, {
      attached: [createTestNode('topic-1', 'topic', { title: 'Topic 1' })],
    })

    const result = algorithm.layout(doc)

    expect(result.nodes.size).toBeGreaterThan(0)
    expect(result.nodes.get('topic-1')).toBeDefined()
    expect(result.nodes.get('topic-1')!.x).toBeDefined()
    expect(result.nodes.get('topic-1')!.y).toBeDefined()
  })

  it('should layout multiple nodes horizontally', () => {
    const algorithm = createTreeLayoutAlgorithm('tree-right', 'right')
    const doc = createTestNode('root', 'root', { title: 'Root' }, {
      attached: [
        createTestNode('topic-1', 'topic', { title: 'Topic 1' }),
        createTestNode('topic-2', 'topic', { title: 'Topic 2' }),
        createTestNode('topic-3', 'topic', { title: 'Topic 3' }),
      ],
    })

    const result = algorithm.layout(doc)

    // Should have nodes in layout
    expect(result.nodes.size).toBeGreaterThan(0)

    // Get all topic nodes
    const topics = Array.from(result.nodes.entries()).filter(([id]) => id.startsWith('topic-'))
    expect(topics.length).toBe(3)

    // All topics should have different y positions (stacked vertically)
    const yPositions = topics.map(([, node]) => node.y)
    const uniqueYPositions = new Set(yPositions)
    expect(uniqueYPositions.size).toBe(3)

    // All topics should have same x position (aligned horizontally)
    const xPositions = topics.map(([, node]) => node.x)
    const uniqueXPositions = new Set(xPositions)
    expect(uniqueXPositions.size).toBe(1)
  })

  it('should layout with spacing from style', () => {
    const algorithm = createTreeLayoutAlgorithm('tree-right', 'right')
    const doc = createTestNode('root', 'root', { 
      title: 'Root',
      style: { spacingMajor: '50pt', spacingMinor: '35pt' },
    }, {
      attached: [
        createTestNode('topic-1', 'topic', { title: 'Topic 1' }),
      ],
    })

    const result = algorithm.layout(doc)

    // Should have nodes in layout
    expect(result.nodes.size).toBeGreaterThan(0)

    // Get root and topic nodes
    const root = result.nodes.get('root')
    const topics = Array.from(result.nodes.entries()).filter(([id]) => id.startsWith('topic-'))
    expect(topics.length).toBe(1)

    const topic1 = topics[0][1]

    // Topic should be to the right of root
    expect(topic1.x).toBeGreaterThan(root!.x + root!.width)
  })

  it('should handle collapsed nodes', () => {
    const algorithm = createTreeLayoutAlgorithm('tree-right', 'right')
    const doc = createTestNode('root', 'root', { title: 'Root' }, {
      attached: [
        createTestNode('topic-1', 'topic', { 
          title: 'Topic 1',
          collapsed: true,
        }, {
          attached: [
            createTestNode('sub-1', 'topic', { title: 'Sub 1' }),
          ],
        }),
      ],
    })

    const result = algorithm.layout(doc)

    // Collapsed node should not have children in layout
    expect(result.nodes.get('sub-1')).toBeUndefined()
  })

  it('should layout in different directions', () => {
    const directions = ['right', 'left', 'down', 'up'] as const

    for (const direction of directions) {
      const algorithm = createTreeLayoutAlgorithm(`tree-${direction}`, direction)
      const doc = createTestNode('root', 'root', { title: 'Root' }, {
        attached: [
          createTestNode('topic-1', 'topic', { title: 'Topic 1' }),
        ],
      })

      const result = algorithm.layout(doc)

      expect(result.nodes.size).toBeGreaterThan(0)
      expect(result.nodes.get('topic-1')).toBeDefined()
    }
  })

  it('should fill titleWidth and titleHeight', () => {
    const algorithm = createTreeLayoutAlgorithm('tree-right', 'right')
    const doc = createTestNode('root', 'root', { title: 'Root' }, {
      attached: [
        createTestNode('topic-1', 'topic', { title: 'Topic 1' }),
      ],
    })

    const result = algorithm.layout(doc)

    const topic1 = result.nodes.get('topic-1')!
    expect(topic1.titleWidth).toBeGreaterThan(0)
    expect(topic1.titleHeight).toBeGreaterThan(0)
  })

  it('should fill branchHeight', () => {
    const algorithm = createTreeLayoutAlgorithm('tree-right', 'right')
    const doc = createTestNode('root', 'root', { title: 'Root' }, {
      attached: [
        createTestNode('topic-1', 'topic', { title: 'Topic 1' }, {
          attached: [
            createTestNode('sub-1', 'topic', { title: 'Sub 1' }),
          ],
        }),
      ],
    })

    const result = algorithm.layout(doc)

    const topic1 = result.nodes.get('topic-1')!
    expect(topic1.branchHeight).toBeGreaterThan(0)
  })
})
