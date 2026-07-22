/**
 * CollapseExtension — 折叠/展开扩展
 *
 * 折叠状态存储在 node.attrs.collapsed。
 * 折叠后子节点不参与布局计算和渲染。
 *
 * 命令：
 * - collapse.toggle: 切换节点折叠状态
 * - collapse.expand: 展开节点
 * - collapse.collapse: 折叠节点
 * - collapse.expandAll: 展开所有
 * - collapse.collapseAll: 折叠所有
 */

import { createExtension, UpdateNodeStep, Transaction } from '@tomind/core'
import type { SheetState, NodeDesc, ExtensionContext } from '@tomind/core'

// ==================== Options ====================

export interface CollapseOptions extends Record<string, unknown> {
  enabled?: boolean
}

// ==================== 工具函数 ====================

function getSelectedNodeId(state: SheetState): string | null {
  const sel = state.selection as any
  return sel?.nodeId ?? sel?.elements?.[0]?.id ?? null
}

/** 深拷贝 doc 并对指定节点执行 mutation */
function cloneAndMutate(doc: NodeDesc, nodeId: string, fn: (node: NodeDesc) => void): NodeDesc {
  const clone = structuredClone(doc) as NodeDesc
  function walk(node: NodeDesc): boolean {
    if (node.id === nodeId) { fn(node); return true }
    for (const children of Object.values(node.children ?? {})) {
      if (!Array.isArray(children)) continue
      for (const child of children) {
        if (walk(child)) return true
      }
    }
    return false
  }
  walk(clone)
  return clone
}

/** 批量设置所有节点的 collapsed */
function setAllCollapsed(node: NodeDesc, collapsed: boolean): NodeDesc {
  const clone = { ...node, attrs: { ...node.attrs, collapsed } }
  if (node.children) {
    const newChildren: Record<string, readonly NodeDesc[]> = {}
    for (const [role, children] of Object.entries(node.children)) {
      if (Array.isArray(children)) {
        newChildren[role] = children.map((c) => setAllCollapsed(c, collapsed))
      }
    }
    clone.children = newChildren
  }
  return clone
}

// ==================== Extension ====================

export const CollapseExtension = createExtension<CollapseOptions>({
  name: 'collapse',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    // collapse.toggle — 切换折叠状态
    ctx.registerCommand('collapse.toggle', (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { nodeId } = (params ?? {}) as { nodeId?: string }
      const targetId = nodeId ?? getSelectedNodeId(sheetState)
      if (!targetId) return false

      const node = sheetState.doc.id === targetId
        ? sheetState.doc
        : findInTree(sheetState.doc, targetId)
      if (!node) return false

      const newCollapsed = !node.attrs?.collapsed
      const tr = new Transaction(sheetState.doc, [
        new UpdateNodeStep(targetId, { collapsed: newCollapsed }),
      ], [sheetState.doc], new Map())

      dispatch(tr)
      return true
    })

    // collapse.expand — 展开节点
    ctx.registerCommand('collapse.expand', (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { nodeId } = (params ?? {}) as { nodeId?: string }
      if (!nodeId) return false

      const tr = new Transaction(sheetState.doc, [
        new UpdateNodeStep(nodeId, { collapsed: false }),
      ], [sheetState.doc], new Map())

      dispatch(tr)
      return true
    })

    // collapse.collapse — 折叠节点
    ctx.registerCommand('collapse.collapse', (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { nodeId } = (params ?? {}) as { nodeId?: string }
      if (!nodeId) return false

      const tr = new Transaction(sheetState.doc, [
        new UpdateNodeStep(nodeId, { collapsed: true }),
      ], [sheetState.doc], new Map())

      dispatch(tr)
      return true
    })

    // collapse.expandAll — 展开所有
    ctx.registerCommand('collapse.expandAll', (state: unknown, dispatch: ((tr: unknown) => void) | null) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const newDoc = setAllCollapsed(sheetState.doc, false)

      const tr = Transaction.empty(sheetState.doc)
      // replaceDoc 不存在，用 UpdateNodeStep 递归不行（太深）
      // 直接构造 tr
      const tr2 = new Transaction(sheetState.doc, [], [sheetState.doc], new Map())
      ;(tr2 as any).doc = newDoc
      dispatch(tr2)
      return true
    })

    // collapse.collapseAll — 折叠所有
    ctx.registerCommand('collapse.collapseAll', (state: unknown, dispatch: ((tr: unknown) => void) | null) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const newDoc = setAllCollapsed(sheetState.doc, true)

      const tr = new Transaction(sheetState.doc, [], [sheetState.doc], new Map())
      ;(tr as any).doc = newDoc
      dispatch(tr)
      return true
    })
  },
})

// ==================== 工具函数（外部用） ====================

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
