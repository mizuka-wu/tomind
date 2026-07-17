/**
 * Selection 插件（对标 ProseMirror Selection 插件）
 *
 * 管理选区状态：
 * - 跟踪选中的节点
 * - 注入 Node Decoration（选中高亮）
 * - 提供选区查询 API
 *
 * 设计原则：
 * - 选区是 State 的一部分（通过 PluginState 管理）
 * - 选中高亮通过 Decoration 实现（不修改 doc）
 * - 支持多选（Ctrl/Cmd + 点击）
 */

import type { Transaction } from '@tomind/state'
import type { SheetState } from '@tomind/state'
import type { PluginKey } from '@tomind/state'

import type { Decoration } from '@tomind/state'
import { nodeDecoration } from '@tomind/state'
import { PluginState } from './plugin-state'
import { createViewPlugin } from './view-plugin'
import type { ViewPlugin } from './view-plugin'

// ==================== SelectionPluginState ====================

/**
 * Selection 插件状态
 */
export class SelectionPluginState extends PluginState<SelectionPluginState> {
  /** 选中的节点 ID */
  readonly selectedIds: readonly string[]
  /** 最后选中的节点 ID（用于范围选择） */
  readonly anchorId: string | null
  /** 选中高亮样式 */
  readonly highlightStyle: Record<string, string | number>

  constructor(
    selectedIds: readonly string[] = [],
    anchorId: string | null = null,
    highlightStyle: Record<string, string | number> = {
      stroke: '#2196F3',
      strokeWidth: 2,
    }
  ) {
    super()
    this.selectedIds = selectedIds
    this.anchorId = anchorId
    this.highlightStyle = highlightStyle
  }

  /**
   * 应用事务
   */
  apply(tr: Transaction, _state: SheetState): SelectionPluginState {
    // 检查是否有选区变更
    const selectionMeta = tr.getMeta('selection') as { type?: string; selectedIds?: string[]; anchorId?: string } | undefined
    if (!selectionMeta) return this

    // 处理选区变更
    if (selectionMeta.type === 'set') {
      return new SelectionPluginState(
        selectionMeta.selectedIds || [],
        selectionMeta.anchorId || null,
        this.highlightStyle
      )
    }

    if (selectionMeta.type === 'add') {
      const newIds = [...this.selectedIds, ...(selectionMeta.selectedIds || [])]
      return new SelectionPluginState(
        [...new Set(newIds)],
        selectionMeta.anchorId || this.anchorId,
        this.highlightStyle
      )
    }

    if (selectionMeta.type === 'remove') {
      const removeSet = new Set(selectionMeta.selectedIds)
      return new SelectionPluginState(
        this.selectedIds.filter(id => !removeSet.has(id)),
        this.anchorId,
        this.highlightStyle
      )
    }

    if (selectionMeta.type === 'clear') {
      return new SelectionPluginState([], null, this.highlightStyle)
    }

    return this
  }

  /**
   * 是否选中指定节点
   */
  isSelected(nodeId: string): boolean {
    return this.selectedIds.includes(nodeId)
  }

  /**
   * 选中节点数量
   */
  get size(): number {
    return this.selectedIds.length
  }

  /**
   * 是否有选中
   */
  get hasSelection(): boolean {
    return this.selectedIds.length > 0
  }
}

// ==================== SelectionPlugin ====================

/**
 * Selection 插件配置
 */
export interface SelectionPluginConfig {
  /** 选中高亮样式 */
  highlightStyle?: Record<string, string | number>
}

/**
 * 创建 Selection 插件
 *
 * @example
 * ```typescript
 * const selectionKey = new PluginKey<SelectionPluginState>('selection')
 * const selectionPlugin = createSelectionPlugin(selectionKey, {
 *   highlightStyle: { stroke: '#2196F3', strokeWidth: 2 }
 * })
 *
 * // 选中节点
 * const tr = Transaction.empty(state.doc)
 *   .setMeta('selection', { type: 'set', selectedIds: ['node-1'] })
 * editor.dispatch(tr)
 *
 * // 查询选中状态
 * const selectionState = editor.field(selectionKey)
 * console.log(selectionState.isSelected('node-1')) // true
 * ```
 */
export function createSelectionPlugin(
  key: PluginKey<SelectionPluginState>,
  config: SelectionPluginConfig = {}
): {
  plugin: {
    key: PluginKey<SelectionPluginState>
    state: {
      init: (state: SheetState) => SelectionPluginState
      apply: (tr: Transaction, value: SelectionPluginState, state: SheetState) => SelectionPluginState
    }
  }
  viewPlugin: ViewPlugin
} {
  const highlightStyle = config.highlightStyle || {
    stroke: '#2196F3',
    strokeWidth: 2,
  }

  return {
    plugin: {
      key,
      state: {
        init: () => new SelectionPluginState([], null, highlightStyle),
        apply: (tr, value, state) => value.apply(tr, state),
      },
    },
    viewPlugin: createViewPlugin(
      'selection',
      (state) => {
        const selectionState = state.field(key)
        const decorations: Decoration[] = []

        // 为选中的节点注入 Node Decoration
        for (const nodeId of selectionState.selectedIds) {
          decorations.push(
            nodeDecoration(nodeId, {
              style: selectionState.highlightStyle,
            })
          )
        }

        return decorations
      }
    ),
  }
}

/**
 * 创建设置选区的 Transaction
 */
export function createSetSelectionTransaction(
  selectedIds: string[],
  anchorId?: string
): (doc: import('@tomind/schema').NodeDesc) => Transaction {
  return (doc) => {
    const { Transaction } = require('../state/transaction')
    return new Transaction(doc).setMeta('selection', {
      type: 'set',
      selectedIds,
      anchorId: anchorId || selectedIds[selectedIds.length - 1] || null,
    })
  }
}

/**
 * 创建添加到选区的 Transaction
 */
export function createAddToSelectionTransaction(
  selectedIds: string[]
): (doc: import('@tomind/schema').NodeDesc) => Transaction {
  return (doc) => {
    const { Transaction } = require('../state/transaction')
    return new Transaction(doc).setMeta('selection', {
      type: 'add',
      selectedIds,
    })
  }
}

/**
 * 创建清空选区的 Transaction
 */
export function createClearSelectionTransaction(): (doc: import('@tomind/schema').NodeDesc) => Transaction {
  return (doc) => {
    const { Transaction } = require('../state/transaction')
    return new Transaction(doc).setMeta('selection', {
      type: 'clear',
    })
  }
}
