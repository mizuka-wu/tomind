/**
 * Decoration 系统测试
 */
import { describe, it, expect } from 'vitest'
import {
  DecorationSet,
  widgetDecoration,
  nodeDecoration,
  inlineDecoration,
} from '@tomind/state'
// import type { WidgetDecoration, NodeDecoration, InlineDecoration } from '@tomind/state'

describe('DecorationSet', () => {
  it('空集合', () => {
    const set = DecorationSet.empty
    expect(set.isEmpty).toBe(true)
    expect(set.size).toBe(0)
    expect(set.toArray()).toEqual([])
  })

  it('创建集合', () => {
    const dec1 = widgetDecoration('node-1', 'w1', 'collapse', 'after')
    const dec2 = nodeDecoration('node-1', { class: 'highlight' })
    const set = DecorationSet.create([dec1, dec2])

    expect(set.isEmpty).toBe(false)
    expect(set.size).toBe(2)
  })

  it('按节点查询', () => {
    const dec1 = widgetDecoration('node-1', 'w1', 'collapse', 'after')
    const dec2 = widgetDecoration('node-2', 'w2', 'numbering', 'before')
    const dec3 = nodeDecoration('node-1', { class: 'highlight' })
    const set = DecorationSet.create([dec1, dec2, dec3])

    const node1Decs = set.getDecorations('node-1')
    expect(node1Decs).toHaveLength(2)

    const node2Decs = set.getDecorations('node-2')
    expect(node2Decs).toHaveLength(1)

    const node3Decs = set.getDecorations('node-3')
    expect(node3Decs).toHaveLength(0)
  })

  it('按类型查询', () => {
    const widget = widgetDecoration('node-1', 'w1', 'collapse', 'after')
    const node = nodeDecoration('node-1', { class: 'highlight' })
    const inline = inlineDecoration('node-1', 0, 5, { style: { color: 'red' } })
    const set = DecorationSet.create([widget, node, inline])

    expect(set.getWidgets('node-1')).toHaveLength(1)
    expect(set.getNodeDecorations('node-1')).toHaveLength(1)
    expect(set.getInlineDecorations('node-1')).toHaveLength(1)
  })

  it('add 返回新集合', () => {
    const set1 = DecorationSet.empty
    const dec = widgetDecoration('node-1', 'w1', 'collapse')
    const set2 = set1.add(dec)

    expect(set1.isEmpty).toBe(true)
    expect(set2.size).toBe(1)
  })

  it('addAll 批量添加', () => {
    const decs = [
      widgetDecoration('node-1', 'w1', 'collapse'),
      widgetDecoration('node-2', 'w2', 'numbering'),
    ]
    const set = DecorationSet.empty.addAll(decs)
    expect(set.size).toBe(2)
  })

  it('removeByNode 移除节点装饰', () => {
    const decs = [
      widgetDecoration('node-1', 'w1', 'collapse'),
      widgetDecoration('node-2', 'w2', 'numbering'),
      nodeDecoration('node-1', { class: 'highlight' }),
    ]
    const set = DecorationSet.create(decs).removeByNode('node-1')
    expect(set.size).toBe(1)
    expect(set.getDecorations('node-1')).toHaveLength(0)
  })

  it('removeBySpec 按 spec 移除', () => {
    const decs = [
      widgetDecoration('node-1', 'w1', 'collapse', 'after', { pluginId: 'p1' }),
      widgetDecoration('node-2', 'w2', 'numbering', 'before', { pluginId: 'p2' }),
      widgetDecoration('node-3', 'w3', 'collapse', 'after', { pluginId: 'p1' }),
    ]
    const set = DecorationSet.create(decs).removeByPlugin('p1')
    expect(set.size).toBe(1)
    expect(set.toArray()[0].nodeId).toBe('node-2')
  })

  it('merge 合并多个集合', () => {
    const set1 = DecorationSet.create([widgetDecoration('node-1', 'w1', 'collapse')])
    const set2 = DecorationSet.create([widgetDecoration('node-2', 'w2', 'numbering')])
    const merged = DecorationSet.merge([set1, set2])

    expect(merged.size).toBe(2)
  })

  it('forEach 遍历', () => {
    const decs = [
      widgetDecoration('node-1', 'w1', 'collapse'),
      widgetDecoration('node-2', 'w2', 'numbering'),
    ]
    const set = DecorationSet.create(decs)
    const visited: string[] = []
    set.forEach(d => visited.push(d.nodeId))
    expect(visited).toEqual(['node-1', 'node-2'])
  })
})

describe('Decoration 工厂函数', () => {
  it('widgetDecoration', () => {
    const dec = widgetDecoration('node-1', 'w1', 'collapse', 'before', { key: 'value' })
    expect(dec.type).toBe('widget')
    expect(dec.nodeId).toBe('node-1')
    expect(dec.widgetId).toBe('w1')
    expect(dec.widgetType).toBe('collapse')
    expect(dec.side).toBe('before')
    expect(dec.spec).toEqual({ key: 'value' })
  })

  it('nodeDecoration', () => {
    const dec = nodeDecoration('node-1', { class: 'highlight', style: { color: 'red' } })
    expect(dec.type).toBe('node')
    expect(dec.nodeId).toBe('node-1')
    expect(dec.attrs.class).toBe('highlight')
    expect(dec.attrs.style?.color).toBe('red')
  })

  it('inlineDecoration', () => {
    const dec = inlineDecoration('node-1', 0, 10, { style: { fontWeight: 'bold' } })
    expect(dec.type).toBe('inline')
    expect(dec.nodeId).toBe('node-1')
    expect(dec.from).toBe(0)
    expect(dec.to).toBe(10)
    expect(dec.attrs.style?.fontWeight).toBe('bold')
  })
})
