/**
 * BoundaryExtension — 边界框扩展
 *
 * Boundary 是 topic 的附属子节点，存在 parent.children.boundary[]。
 * 视觉上包裹一组子节点，带标签和样式。
 *
 * 命令：
 * - boundary.add: 在选中节点的父节点下添加 boundary
 * - boundary.remove: 移除 boundary 节点
 * - boundary.updateLabel: 更新 boundary 标签
 */

import { createExtension, InsertNodeStep, RemoveNodeStep, Transaction } from '@tomind/core'
import type { SheetState, NodeDesc, ExtensionContext } from '@tomind/core'

// ==================== Options ====================

export interface BoundaryOptions extends Record<string, unknown> {
  enabled?: boolean
}

// ==================== 工具函数 ====================

/** 在 doc 树中查找节点 */
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

/** 查找节点的父节点 */
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

/** 获取选中节点 ID */
function getSelectedNodeId(state: SheetState): string | null {
  const sel = state.selection as any
  return sel?.nodeId ?? sel?.elements?.[0]?.id ?? null
}

// ==================== Extension ====================

export const BoundaryExtension = createExtension<BoundaryOptions>({
  name: 'boundary',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    // boundary.add — 在选中节点的父节点下添加 boundary
    ctx.registerCommand('boundary.add', (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { nodeId, label, style } = (params ?? {}) as {
        nodeId?: string; label?: string; style?: Record<string, unknown>
      }

      const targetId = nodeId ?? getSelectedNodeId(sheetState)
      if (!targetId) return false

      // 找到目标节点的父节点
      const parentNode = findParent(sheetState.doc, targetId)
      if (!parentNode) return false

      // boundary 作为 parent 的 attached 子节点
      const boundaryNode: NodeDesc = {
        id: `boundary-${Date.now()}`,
        type: 'boundary',
        attrs: { label: label ?? '', ...style },
        children: {},
      }

      const tr = new Transaction(sheetState.doc, [
        new InsertNodeStep(parentNode.id, boundaryNode),
      ], [sheetState.doc], new Map())

      dispatch(tr)
      return true
    })

    // boundary.remove — 移除 boundary 节点
    ctx.registerCommand('boundary.remove', (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { nodeId } = (params ?? {}) as { nodeId?: string }
      if (!nodeId) return false

      const node = findInTree(sheetState.doc, nodeId)
      if (!node || node.type !== 'boundary') return false

      const tr = new Transaction(sheetState.doc, [
        new RemoveNodeStep(nodeId),
      ], [sheetState.doc], new Map())

      dispatch(tr)
      return true
    })

    // boundary.updateLabel — 更新 boundary 标签
    ctx.registerCommand('boundary.updateLabel', (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { nodeId, label } = (params ?? {}) as { nodeId?: string; label?: string }
      if (!nodeId || label === undefined) return false

      const node = findInTree(sheetState.doc, nodeId)
      if (!node || node.type !== 'boundary') return false

      // 用 InsertNodeStep 替换整个节点（新 attrs）
      const updated: NodeDesc = {
        ...node,
        attrs: { ...node.attrs, label },
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
