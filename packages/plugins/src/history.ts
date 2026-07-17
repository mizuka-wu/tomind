/**
 * History 插件（对标 ProseMirror history）
 *
 * 管理 undo/redo 栈：
 * - 每次 dispatch 的 Transaction 自动入栈
 * - undo 弹出栈顶 Transaction，压入 redo 栈
 * - redo 弹出栈顶 Transaction，压入 undo 栈
 * - 新操作清空 redo 栈
 *
 * 设计原则：
 * - 不可变：所有操作返回新 HistoryState
 * - 事务合并：连续的小事务可合并为一个 undo 步骤
 * - 可配置：maxDepth（最大历史深度）、preserveItems（是否保留每步细节）
 */

import { Transaction } from '@tomind/state'
import type { SheetState } from '@tomind/state'
import type { PluginKey } from '@tomind/state'
import { PluginState } from './plugin-state'

// ==================== HistoryState ====================

/**
 * History 状态
 */
export class HistoryState extends PluginState<HistoryState> {
  /** undo 栈（最近的在末尾） */
  readonly undoStack: readonly Transaction[]
  /** redo 栈（最近的在末尾） */
  readonly redoStack: readonly Transaction[]
  /** 最大历史深度 */
  readonly maxDepth: number

  constructor(
    undoStack: readonly Transaction[] = [],
    redoStack: readonly Transaction[] = [],
    maxDepth: number = 100
  ) {
    super()
    this.undoStack = undoStack
    this.redoStack = redoStack
    this.maxDepth = maxDepth
  }

  /**
   * 应用事务
   * - 非 undo/redo 事务：压入 undo 栈，清空 redo 栈
   * - undo/redo 事务：不入栈（由 HistoryPlugin 处理）
   */
  apply(tr: Transaction, _state: SheetState): HistoryState {
    // 标记为 undo/redo 的事务不入栈
    if (tr.getMeta('history') === 'undo' || tr.getMeta('history') === 'redo') {
      return this
    }

    // 新操作清空 redo 栈，压入 undo 栈
    const newUndoStack = [...this.undoStack, tr]
    
    // 限制深度
    const trimmedStack = newUndoStack.length > this.maxDepth
      ? newUndoStack.slice(newUndoStack.length - this.maxDepth)
      : newUndoStack

    return new HistoryState(trimmedStack, [], this.maxDepth)
  }

  /**
   * 是否可以 undo
   */
  get canUndo(): boolean {
    return this.undoStack.length > 0
  }

  /**
   * 是否可以 redo
   */
  get canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /**
   * 获取 undo 深度
   */
  get undoDepth(): number {
    return this.undoStack.length
  }

  /**
   * 获取 redo 深度
   */
  get redoDepth(): number {
    return this.redoStack.length
  }
}

// ==================== HistoryPlugin ====================

/**
 * History 插件配置
 */
export interface HistoryConfig {
  /** 最大历史深度 */
  maxDepth?: number
}

/**
 * 创建 History 插件
 *
 * @example
 * ```typescript
 * const historyKey = new PluginKey<HistoryState>('history')
 * const historyPlugin = createHistoryPlugin(historyKey, { maxDepth: 50 })
 *
 * // 在 SheetEditor 中使用
 * const editor = new SheetEditor({ plugins: [historyPlugin], ... })
 *
 * // undo
 * const history = editor.field(historyKey)
 * if (history.canUndo) {
 *   const tr = history.undoStack[history.undoStack.length - 1]
 *   const undoTr = tr.invert(editor.state.doc).setMeta('history', 'undo')
 *   editor.dispatch(undoTr)
 * }
 * ```
 */
export function createHistoryPlugin(
  key: PluginKey<HistoryState>,
  config: HistoryConfig = {}
): { key: PluginKey<HistoryState>; state: { init: (state: SheetState) => HistoryState; apply: (tr: Transaction, value: HistoryState, state: SheetState) => HistoryState } } {
  return {
    key,
    state: {
      init: () => new HistoryState([], [], config.maxDepth),
      apply: (tr, value, state) => value.apply(tr, state),
    },
  }
}

/**
 * 创建 undo Transaction
 *
 * 从 undo 栈顶取出 Transaction，反转后标记为 undo
 */
export function createUndoTransaction(history: HistoryState, doc: import('@tomind/schema').NodeDesc): Transaction | null {
  if (!history.canUndo) return null
  
  const lastTr = history.undoStack[history.undoStack.length - 1]
  const inverted = lastTr.invert(doc)
  return new Transaction(doc, [...inverted.steps], [...inverted.docs], new Map([['history', 'undo']]))
}

/**
 * 创建 redo Transaction
 *
 * 从 redo 栈顶取出 Transaction，重新执行后标记为 redo
 */
export function createRedoTransaction(history: HistoryState): Transaction | null {
  if (!history.canRedo) return null
  
  const lastTr = history.redoStack[history.redoStack.length - 1]
  return lastTr.setMeta('history', 'redo')
}
