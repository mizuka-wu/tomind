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
    const doc = createTestNode('topic-root', 'topic', { title: 'Root' }, {
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
    expect(topics.length).toBe(4) // root + 3 children

    // All child topics should have different y positions (stacked vertically)
    const childTopics = topics.filter(([id]) => id !== 'topic-root')
    const yPositions = childTopics.map(([, node]) => node.y)
    const uniqueYPositions = new Set(yPositions)
    expect(uniqueYPositions.size).toBe(3)

    // All child topics should have same x position (aligned horizontally)
    const xPositions = childTopics.map(([, node]) => node.x)
    const uniqueXPositions = new Set(xPositions)
    expect(uniqueXPositions.size).toBe(1)
  })

  it('should layout with spacing from style', () => {
    const algorithm = createTreeLayoutAlgorithm('tree-right', 'right')
    const doc = createTestNode('topic-root', 'topic', { 
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
    const root = result.nodes.get('topic-root')
    const topic1 = result.nodes.get('topic-1')

    expect(root).toBeDefined()
    expect(topic1).toBeDefined()

    // Topic should be to the right of root
    expect(topic1!.x).toBeGreaterThan(root!.x + root!.width)
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

  it('should position summary nodes after attached children (right direction)', () => {
    const algorithm = createTreeLayoutAlgorithm('tree-right', 'right')
    const doc = createTestNode('root', 'root', { title: 'Root' }, {
      attached: [
        createTestNode('topic-1', 'topic', { title: 'Topic 1' }),
        createTestNode('topic-2', 'topic', { title: 'Topic 2' }),
        createTestNode('topic-3', 'topic', { title: 'Topic 3' }),
      ],
      summary: [
        createTestNode('summary-1', 'summary', { title: 'Summary', rangeStart: 0, rangeEnd: 1 }),
      ],
    })

    const result = algorithm.layout(doc)

    // Summary should be in the layout result
    const summaryNode = result.nodes.get('summary-1')
    expect(summaryNode).toBeDefined()

    // Summary should be to the right of the range children (topics 1 and 2)
    const topic1 = result.nodes.get('topic-1')!
    const topic2 = result.nodes.get('topic-2')!
    expect(summaryNode!.x).toBeGreaterThan(topic1.x + topic1.width)
    expect(summaryNode!.x).toBeGreaterThan(topic2.x + topic2.width)

    // Summary y should be between topic-1 and topic-2 (midpoint)
    const midY = (topic1.y + topic2.y + topic2.height) / 2
    expect(summaryNode!.y).toBeCloseTo(midY, 0)
  })

  it('should not include summary nodes in regular child layout', () => {
    const algorithm = createTreeLayoutAlgorithm('tree-right', 'right')
    const doc = createTestNode('root', 'root', { title: 'Root' }, {
      attached: [
        createTestNode('topic-1', 'topic', { title: 'Topic 1' }),
        createTestNode('topic-2', 'topic', { title: 'Topic 2' }),
      ],
      summary: [
        createTestNode('summary-1', 'summary', { title: 'Summary', rangeStart: 0, rangeEnd: 1 }),
      ],
    })

    const result = algorithm.layout(doc)

    // topic-1 and topic-2 should be laid out as regular children
    const topic1 = result.nodes.get('topic-1')
    const topic2 = result.nodes.get('topic-2')
    expect(topic1).toBeDefined()
    expect(topic2).toBeDefined()

    // Summary should be positioned separately
    const summary = result.nodes.get('summary-1')
    expect(summary).toBeDefined()
    // Summary x should be to the right of both topics
    expect(summary!.x).toBeGreaterThan(topic1!.x + topic1!.width)
    expect(summary!.x).toBeGreaterThan(topic2!.x + topic2!.width)
  })

  it('should position summary for left direction', () => {
    const algorithm = createTreeLayoutAlgorithm('tree-left', 'left')
    const doc = createTestNode('root', 'root', { title: 'Root' }, {
      attached: [
        createTestNode('topic-1', 'topic', { title: 'Topic 1' }),
        createTestNode('topic-2', 'topic', { title: 'Topic 2' }),
      ],
      summary: [
        createTestNode('summary-1', 'summary', { title: 'Summary', rangeStart: 0, rangeEnd: 1 }),
      ],
    })

    const result = algorithm.layout(doc)

    const summaryNode = result.nodes.get('summary-1')!
    const topic1 = result.nodes.get('topic-1')!
    const topic2 = result.nodes.get('topic-2')!

    // Summary should be to the left of the range children
    expect(summaryNode.x + summaryNode.width).toBeLessThanOrEqual(topic1.x)
    expect(summaryNode.x + summaryNode.width).toBeLessThanOrEqual(topic2.x)
  })

  it('should position summary for down direction', () => {
    const algorithm = createTreeLayoutAlgorithm('tree-down', 'down')
    const doc = createTestNode('root', 'root', { title: 'Root' }, {
      attached: [
        createTestNode('topic-1', 'topic', { title: 'Topic 1' }),
        createTestNode('topic-2', 'topic', { title: 'Topic 2' }),
      ],
      summary: [
        createTestNode('summary-1', 'summary', { title: 'Summary', rangeStart: 0, rangeEnd: 1 }),
      ],
    })

    const result = algorithm.layout(doc)

    const summaryNode = result.nodes.get('summary-1')!
    const topic1 = result.nodes.get('topic-1')!
    const topic2 = result.nodes.get('topic-2')!

    // Summary should be below the range children
    expect(summaryNode.y).toBeGreaterThan(topic1.y + topic1.height)
    expect(summaryNode.y).toBeGreaterThan(topic2.y + topic2.height)
  })
})
