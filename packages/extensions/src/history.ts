/**
 * HistoryExtension — Undo/Redo 扩展
 *
 * 包装 @tomind/plugins 的 HistoryState + HistoryPlugin：
 * - 注册 history.undo / history.redo / history.canUndo / history.canRedo 命令
 * - 注册 Mod-z / Mod-Shift-z 快捷键
 * - 自动将 dispatch 的 Transaction 入栈
 *
 * 依赖 @tomind/plugins 的 createHistoryPlugin / HistoryState / createUndoTransaction / createRedoTransaction
 */

import { createExtension, Transaction, PluginKey } from '@tomind/core'
import type { SheetState, ExtensionContext, Plugin } from '@tomind/core'
import {
  HistoryState,
  createHistoryPlugin,
  createUndoTransaction,
  createRedoTransaction,
} from '@tomind/core'

// ==================== 类型 ====================

export interface HistoryOptions extends Record<string, unknown> {
  enabled?: boolean
  maxDepth?: number
}

// ==================== PluginKey ====================

/** History 插件键（全局唯一） */
export const historyPluginKey = new PluginKey<HistoryState>('history')

// ==================== Extension ====================

export const HistoryExtension = createExtension<HistoryOptions>({
  name: 'history',
  type: 'extension',
  defaultOptions: {
    enabled: true,
    maxDepth: 100,
  },

  onCreate(ctx: ExtensionContext) {
    // 注册 undo 命令
    ctx.registerCommand('history.undo', (state: unknown, dispatch: ((tr: unknown) => void) | null) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const history = sheetState.field(historyPluginKey) as HistoryState | undefined
      if (!history || !history.canUndo) return false

      const doc = sheetState.doc
      const undoTr = createUndoTransaction(history, doc)
      if (!undoTr) return false

      dispatch(undoTr)
      return true
    })

    // 注册 redo 命令
    ctx.registerCommand('history.redo', (state: unknown, dispatch: ((tr: unknown) => void) | null) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const history = sheetState.field(historyPluginKey) as HistoryState | undefined
      if (!history || !history.canRedo) return false

      const redoTr = createRedoTransaction(history)
      if (!redoTr) return false

      dispatch(redoTr)
      return true
    })

    // 注册 canUndo 检查命令
    ctx.registerCommand('history.canUndo', (state: unknown) => {
      const sheetState = state as SheetState
      const history = sheetState.field(historyPluginKey) as HistoryState | undefined
      return history?.canUndo ?? false
    })

    // 注册 canRedo 检查命令
    ctx.registerCommand('history.canRedo', (state: unknown) => {
      const sheetState = state as SheetState
      const history = sheetState.field(historyPluginKey) as HistoryState | undefined
      return history?.canRedo ?? false
    })
  },

  destroy() {
    // 清理（HistoryState 由 Plugin 管理，无需手动清理）
  },
})

// ==================== Plugin 工厂 ====================

/**
 * 创建 History Plugin（传给 SheetEditor 的 plugins 选项）
 *
 * @example
 * ```ts
 * const editor = new SheetEditor({
 *   plugins: [createHistoryPluginWithKey()],
 *   extensions: [HistoryExtension, ...],
 * })
 * ```
 */
export function createHistoryPluginWithKey(maxDepth = 100): Plugin {
  return createHistoryPlugin(historyPluginKey, { maxDepth }) as Plugin
}
