/**
 * SummaryExtension — 摘要扩展
 *
 * Summary 是 topic 的附属子节点，存在 parent.children.summary[]。
 * 用花括号连接一组兄弟节点，显示范围摘要。
 *
 * 命令：
 * - summary.add: 在父节点下添加 summary
 * - summary.remove: 移除 summary 节点
 * - summary.updateRange: 更新摘要覆盖的兄弟节点范围
 */

import { createExtension, InsertNodeStep, RemoveNodeStep, Transaction } from '@tomind/core'
import type { SheetState, NodeDesc, ExtensionContext } from '@tomind/core'

// ==================== Options ====================

export interface SummaryOptions extends Record<string, unknown> {
  enabled?: boolean
}

// ==================== 工具函数 ====================

function findInTree(doc: NodeDesc, id: string): NodeDesc | null {
  if (doc.id === id) return doc
  for (const children of Object.values(doc.children ?? {})) {
    if (!Array.isArray(children)) continue
    for (const child of children) {
      const found = findInTree(child, id)
      if (found) return found
    }
  }
  return null
}

function findParent(doc: NodeDesc, childId: string): NodeDesc | null {
  for (const children of Object.values(doc.children ?? {})) {
    if (!Array.isArray(children)) continue
    for (const child of children) {
      if (child.id === childId) return doc
      const found = findParent(child, childId)
      if (found) return found
    }
  }
  return null
}

function getSelectedNodeId(state: SheetState): string | null {
  const sel = state.selection as any
  return sel?.nodeId ?? sel?.elements?.[0]?.id ?? null
}

// ==================== Extension ====================

export const SummaryExtension = createExtension<SummaryOptions>({
  name: 'summary',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    // summary.add — 在父节点下添加 summary
    ctx.registerCommand('summary.add', (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { nodeId, rangeStart, rangeEnd, label } = (params ?? {}) as {
        nodeId?: string; rangeStart?: number; rangeEnd?: number; label?: string
      }

      const targetId = nodeId ?? getSelectedNodeId(sheetState)
      if (!targetId) return false

      const parentNode = findParent(sheetState.doc, targetId)
      if (!parentNode) return false

      const summaryNode: NodeDesc = {
        id: `summary-${Date.now()}`,
        type: 'summary',
        attrs: {
          rangeStart: rangeStart ?? 0,
          rangeEnd: rangeEnd ?? 0,
          label: label ?? '',
        },
        children: {},
      }

      const tr = new Transaction(sheetState.doc, [
        new InsertNodeStep(parentNode.id, summaryNode),
      ], [sheetState.doc], new Map())

      dispatch(tr)
      return true
    })

    // summary.remove — 移除 summary 节点
    ctx.registerCommand('summary.remove', (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { nodeId } = (params ?? {}) as { nodeId?: string }
      if (!nodeId) return false

      const node = findInTree(sheetState.doc, nodeId)
      if (!node || node.type !== 'summary') return false

      const tr = new Transaction(sheetState.doc, [
        new RemoveNodeStep(nodeId),
      ], [sheetState.doc], new Map())

      dispatch(tr)
      return true
    })

    // summary.updateRange — 更新摘要覆盖范围
    ctx.registerCommand('summary.updateRange', (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { nodeId, rangeStart, rangeEnd } = (params ?? {}) as {
        nodeId?: string; rangeStart?: number; rangeEnd?: number
      }
      if (!nodeId) return false

      const node = findInTree(sheetState.doc, nodeId)
      if (!node || node.type !== 'summary') return false

      const updated: NodeDesc = {
        ...node,
        attrs: { ...node.attrs, rangeStart, rangeEnd },
      }
      const tr = new Transaction(sheetState.doc, [
        new RemoveNodeStep(nodeId),
        new InsertNodeStep(updated.id, updated),
      ], [sheetState.doc], new Map())

      dispatch(tr)
      return true
    })
  },
})
