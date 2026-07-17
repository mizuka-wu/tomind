/**
 * 插件系统测试
 */
import { describe, it, expect } from 'vitest'
import { PluginKey } from '@tomind/state'
import { SheetState } from '@tomind/state'
import { Transaction } from '@tomind/state'
import {
  HistoryState,
  createHistoryPlugin,
  createUndoTransaction,
} from '@tomind/plugins'
import {
  SelectionPluginState,
  createSelectionPlugin,
} from '@tomind/plugins'
import {
  ViewPluginManager,
  createViewPlugin,
} from '@tomind/plugins'
import { widgetDecoration, nodeDecoration } from '@tomind/state'

// ==================== Helper ====================

function makeTestState(): SheetState {
  const doc = {
    id: 'root',
    type: 'root',
    attrs: {},
    children: {
      attached: [
        { id: 'topic-1', type: 'topic', attrs: { title: 'Topic 1' }, children: {} },
        { id: 'topic-2', type: 'topic', attrs: { title: 'Topic 2' }, children: {} },
      ],
    },
  }
  return SheetState.create({ doc })
}

// ==================== History Tests ====================

describe('History 插件', () => {
  const historyKey = new PluginKey<HistoryState>('history')
  const historyPlugin = createHistoryPlugin(historyKey)

  it('初始状态为空', () => {
    const state = makeTestState()
    const plugin = historyPlugin
    const historyState = plugin.state.init(state)
    
    expect(historyState.canUndo).toBe(false)
    expect(historyState.canRedo).toBe(false)
    expect(historyState.undoDepth).toBe(0)
    expect(historyState.redoDepth).toBe(0)
  })

  it('apply 压入 undo 栈', () => {
    const state = makeTestState()
    const historyState = new HistoryState()
    
    const tr = Transaction.empty(state.doc).setAttrs('topic-1', { title: 'New Title' })
    const newHistory = historyState.apply(tr, state)
    
    expect(newHistory.canUndo).toBe(true)
    expect(newHistory.undoDepth).toBe(1)
  })

  it('新操作清空 redo 栈', () => {
    const state = makeTestState()
    const historyState = new HistoryState([], [
      Transaction.empty(state.doc).setAttrs('topic-1', { title: 'Old' }),
    ])
    
    expect(historyState.canRedo).toBe(true)
    
    const tr = Transaction.empty(state.doc).setAttrs('topic-1', { title: 'New' })
    const newHistory = historyState.apply(tr, state)
    
    expect(newHistory.canRedo).toBe(false)
    expect(newHistory.redoDepth).toBe(0)
  })

  it('maxDepth 限制栈深度', () => {
    const state = makeTestState()
    const historyState = new HistoryState([], [], 2)
    
    let current = historyState
    for (let i = 0; i < 5; i++) {
      const tr = Transaction.empty(state.doc).setAttrs('topic-1', { title: `Title ${i}` })
      current = current.apply(tr, state)
    }
    
    expect(current.undoDepth).toBe(2)
  })

  it('undo/redo 事务不入栈', () => {
    const state = makeTestState()
    const historyState = new HistoryState()
    
    const undoTr = Transaction.empty(state.doc).setMeta('history', 'undo')
    const newHistory = historyState.apply(undoTr, state)
    
    expect(newHistory.undoDepth).toBe(0)
  })

  it('createUndoTransaction', () => {
    const state = makeTestState()
    const tr = Transaction.empty(state.doc).setAttrs('topic-1', { title: 'New' })
    const historyState = new HistoryState([tr])
    
    const undoTr = createUndoTransaction(historyState, state.doc)
    expect(undoTr).not.toBeNull()
  })
})

// ==================== Selection Tests ====================

describe('Selection 插件', () => {
  const selectionKey = new PluginKey<SelectionPluginState>('selection')
  const { plugin: selectionPlugin } = createSelectionPlugin(selectionKey)

  it('初始状态为空', () => {
    const state = makeTestState()
    const selectionState = selectionPlugin.state.init(state)
    
    expect(selectionState.hasSelection).toBe(false)
    expect(selectionState.size).toBe(0)
  })

  it('set 选区', () => {
    const state = makeTestState()
    const selectionState = selectionPlugin.state.init(state)
    
    const tr = Transaction.empty(state.doc).setMeta('selection', {
      type: 'set',
      selectedIds: ['topic-1', 'topic-2'],
    })
    const newState = selectionState.apply(tr, state)
    
    expect(newState.hasSelection).toBe(true)
    expect(newState.size).toBe(2)
    expect(newState.isSelected('topic-1')).toBe(true)
    expect(newState.isSelected('topic-2')).toBe(true)
  })

  it('add 到选区', () => {
    const state = makeTestState()
    const selectionState = new SelectionPluginState(['topic-1'])
    
    const tr = Transaction.empty(state.doc).setMeta('selection', {
      type: 'add',
      selectedIds: ['topic-2'],
    })
    const newState = selectionState.apply(tr, state)
    
    expect(newState.size).toBe(2)
    expect(newState.isSelected('topic-1')).toBe(true)
    expect(newState.isSelected('topic-2')).toBe(true)
  })

  it('remove 从选区', () => {
    const state = makeTestState()
    const selectionState = new SelectionPluginState(['topic-1', 'topic-2'])
    
    const tr = Transaction.empty(state.doc).setMeta('selection', {
      type: 'remove',
      selectedIds: ['topic-1'],
    })
    const newState = selectionState.apply(tr, state)
    
    expect(newState.size).toBe(1)
    expect(newState.isSelected('topic-1')).toBe(false)
    expect(newState.isSelected('topic-2')).toBe(true)
  })

  it('clear 清空选区', () => {
    const state = makeTestState()
    const selectionState = new SelectionPluginState(['topic-1', 'topic-2'])
    
    const tr = Transaction.empty(state.doc).setMeta('selection', {
      type: 'clear',
    })
    const newState = selectionState.apply(tr, state)
    
    expect(newState.hasSelection).toBe(false)
    expect(newState.size).toBe(0)
  })

  it('非选区事务不影响状态', () => {
    const state = makeTestState()
    const selectionState = new SelectionPluginState(['topic-1'])
    
    const tr = Transaction.empty(state.doc).setAttrs('topic-2', { title: 'New' })
    const newState = selectionState.apply(tr, state)
    
    expect(newState.isSelected('topic-1')).toBe(true)
    expect(newState.size).toBe(1)
  })
})

// ==================== ViewPlugin Tests ====================

describe('ViewPlugin', () => {
  it('ViewPluginManager 管理插件', () => {
    const plugin1 = createViewPlugin('p1', () => [
      widgetDecoration('node-1', 'w1', 'collapse'),
    ])
    const plugin2 = createViewPlugin('p2', () => [
      nodeDecoration('node-1', { class: 'highlight' }),
    ])

    const manager = new ViewPluginManager([plugin1, plugin2])
    expect(manager.size).toBe(2)
    expect(manager.has('p1')).toBe(true)
    expect(manager.has('p2')).toBe(true)
    expect(manager.has('p3')).toBe(false)
  })

  it('collectDecorations 合并所有插件的 Decoration', () => {
    const plugin1 = createViewPlugin('p1', () => [
      widgetDecoration('node-1', 'w1', 'collapse'),
    ])
    const plugin2 = createViewPlugin('p2', () => [
      widgetDecoration('node-2', 'w2', 'numbering'),
      nodeDecoration('node-1', { class: 'highlight' }),
    ])

    const manager = new ViewPluginManager([plugin1, plugin2])
    const state = makeTestState()
    const decorations = manager.collectDecorations(state)

    expect(decorations).toHaveLength(3)
  })

  it('add/remove 插件', () => {
    const plugin = createViewPlugin('p1', () => [])
    let manager = new ViewPluginManager()
    
    manager = manager.add(plugin)
    expect(manager.size).toBe(1)
    
    manager = manager.remove('p1')
    expect(manager.size).toBe(0)
  })
})
