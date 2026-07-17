/**
 * 基础功能测试
 */

import { describe, it, expect } from 'vitest'
import { 
  SheetState, 
  InsertNodeStep,
  RemoveNodeStep,
  UpdateNodeStep,
  Transform,
  Transaction
} from '@tomind/state'
import type { NodeDesc } from '@tomind/schema'

// 测试用 NodeDesc
const createTestNode = (
  id: string, 
  type: string, 
  attrs: Record<string, unknown> = {},
  children: Record<string, readonly NodeDesc[]> = {}
): NodeDesc => ({
  id,
  type,
  attrs,
  children
})

describe('SheetState', () => {
  it('should create state with doc', () => {
    const doc = createTestNode('root', 'root', { title: 'Test Sheet' })
    const state = SheetState.create({ doc })
    
    expect(state.doc).toBe(doc)
    expect(state.title).toBe('Test Sheet')
    expect(state.rootTopic).toBeNull()
  })

  it('should get node by id', () => {
    const topic = createTestNode('topic-1', 'topic', { title: 'Topic 1' })
    const doc = createTestNode('root', 'root', { title: 'Test Sheet' }, {
      attached: [topic]
    })
    
    const state = SheetState.create({ doc })
    const node = state.getNode('topic-1')
    
    expect(node).toBeDefined()
    expect(node?.id).toBe('topic-1')
    expect(node?.type).toBe('topic')
    expect(node?.attrs.title).toBe('Topic 1')
    expect(node?.role).toBe('central')
    expect(node?.collapsed).toBe(false)
  })

  it('should resolve node roles', () => {
    const mainTopic = createTestNode('main-1', 'topic', { title: 'Main Topic' })
    const centralTopic = createTestNode('central-1', 'topic', { title: 'Central Topic' }, {
      attached: [mainTopic]
    })
    const doc = createTestNode('root', 'root', { title: 'Test Sheet' }, {
      attached: [centralTopic]
    })
    
    const state = SheetState.create({ doc })
    
    expect(state.resolveRole('root')).toBe('root')
    expect(state.resolveRole('central-1')).toBe('central')
    expect(state.resolveRole('main-1')).toBe('main')
  })
})

describe('Step', () => {
  it('should insert node', () => {
    const doc = createTestNode('root', 'root', { title: 'Test Sheet' })
    const newTopic = createTestNode('topic-1', 'topic', { title: 'New Topic' })
    
    const step = new InsertNodeStep('root', newTopic, 0)
    const newDoc = step.apply(doc)
    
    // 注意：children.attached 可能不存在，需要检查
    expect(newDoc.children.attached).toBeDefined()
    expect(newDoc.children.attached).toHaveLength(1)
    expect(newDoc.children.attached[0].id).toBe('topic-1')
  })

  it('should remove node', () => {
    const topic = createTestNode('topic-1', 'topic', { title: 'Topic to Remove' })
    const doc = createTestNode('root', 'root', { title: 'Test Sheet' }, {
      attached: [topic]
    })
    
    const step = new RemoveNodeStep('topic-1')
    const newDoc = step.apply(doc)
    
    expect(newDoc.children.attached).toHaveLength(0)
  })

  it('should update node attrs', () => {
    const topic = createTestNode('topic-1', 'topic', { title: 'Old Title' })
    const doc = createTestNode('root', 'root', { title: 'Test Sheet' }, {
      attached: [topic]
    })
    
    const step = new UpdateNodeStep('topic-1', { title: 'New Title' }, { title: 'Old Title' })
    const newDoc = step.apply(doc)
    
    expect(newDoc.children.attached[0].attrs.title).toBe('New Title')
  })
})

describe('Transform', () => {
  it('should chain operations', () => {
    const doc = createTestNode('root', 'root', { title: 'Test Sheet' })
    const topic1 = createTestNode('topic-1', 'topic', { title: 'Topic 1' })
    const topic2 = createTestNode('topic-2', 'topic', { title: 'Topic 2' })
    
    const transform = new Transform(doc)
      .insertNode('root', 0, topic1)
      .insertNode('root', 1, topic2)
      .setAttrs('topic-1', { title: 'Updated Topic 1' })
    
    expect(transform.steps).toHaveLength(3)
    expect(transform.doc.children.attached).toHaveLength(2)
    expect(transform.doc.children.attached[0].attrs.title).toBe('Updated Topic 1')
  })
})

describe('Transaction', () => {
  it('should track doc changes', () => {
    const doc = createTestNode('root', 'root', { title: 'Test Sheet' })
    const topic = createTestNode('topic-1', 'topic', { title: 'New Topic' })
    
    const tr = Transaction.empty(doc)
      .insertNode('root', 0, topic)
    
    expect(tr.docChanged).toBe(true)
    expect(tr.steps).toHaveLength(1)
  })

  it('should support metadata', () => {
    const doc = createTestNode('root', 'root', { title: 'Test Sheet' })
    
    const tr = Transaction.empty(doc)
      .setMeta('addToHistory', false)
      .setMeta('source', 'test')
    
    expect(tr.getMeta('addToHistory')).toBe(false)
    expect(tr.getMeta('source')).toBe('test')
  })
})
