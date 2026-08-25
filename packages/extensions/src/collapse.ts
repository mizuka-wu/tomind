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

import { createExtension, parseArgs, UpdateNodeStep, Transaction } from '@tomind/core'
import type { SheetState, NodeDesc, ExtensionContext } from '@tomind/core'

// ==================== Options ====================

export interface CollapseOptions extends Record<string, unknown> {
  enabled?: boolean
}

// ==================== 工具函数 ====================

function getSelectedNodeId(state: SheetState): string | null {
  return state.selection.elements[0]?.id ?? null
}

/** 深拷贝 doc 并对指定节点执行 mutation */
function cloneAndMutate(doc: NodeDesc, nodeId: string, fn: (node: NodeDesc) => void): NodeDesc {
  const clone = structuredClone(doc)
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

/** 收集所有需要更新 collapsed 属性的节点信息 */
function collectCollapsedUpdates(node: NodeDesc, collapsed: boolean): Array<{ nodeId: string; oldCollapsed: unknown }> {
  const updates: Array<{ nodeId: string; oldCollapsed: unknown }> = []
  
  function walk(n: NodeDesc) {
    // 只收集需要变更的节点（当前值与目标值不同）
    if (n.attrs?.collapsed !== collapsed) {
      updates.push({ nodeId: n.id, oldCollapsed: n.attrs?.collapsed })
    }
    if (n.children) {
      for (const children of Object.values(n.children)) {
        if (Array.isArray(children)) {
          for (const child of children) {
            walk(child)
          }
        }
      }
    }
  }
  
  walk(node)
  return updates
}

// ==================== Extension ====================

export const CollapseExtension = createExtension<CollapseOptions>({
  name: 'collapse',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext<any, any>) {
    // collapse.toggle — 切换折叠状态
    ctx.registerCommand<SheetState>('collapse.toggle', (state, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state
      const { nodeId } = parseArgs<{ nodeId?: string }>(params)
      const targetId = nodeId ?? getSelectedNodeId(sheetState)
      if (!targetId) return false

      const node = sheetState.doc.id === targetId
        ? sheetState.doc
        : findInTree(sheetState.doc, targetId)
      if (!node) return false

      const newCollapsed = !node.attrs?.collapsed
      const oldAttrs = { collapsed: node.attrs?.collapsed }
      const tr = new Transaction(sheetState.doc, [
        new UpdateNodeStep(targetId, { collapsed: newCollapsed }, oldAttrs),
      ], [sheetState.doc], new Map())

      dispatch(tr)
      return true
    })

    // collapse.expand — 展开节点
    ctx.registerCommand<SheetState>('collapse.expand', (state, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state
      const { nodeId } = parseArgs<{ nodeId?: string }>(params)
      if (!nodeId) return false

      const node = findInTree(sheetState.doc, nodeId)
      const oldAttrs = { collapsed: node?.attrs?.collapsed }
      const tr = new Transaction(sheetState.doc, [
        new UpdateNodeStep(nodeId, { collapsed: false }, oldAttrs ?? {}),
      ], [sheetState.doc], new Map())

      dispatch(tr)
      return true
    })

    // collapse.collapse — 折叠节点
    ctx.registerCommand<SheetState>('collapse.collapse', (state, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state
      const { nodeId } = parseArgs<{ nodeId?: string }>(params)
      if (!nodeId) return false

      const collapseNode = findInTree(sheetState.doc, nodeId)
      const collapseOldAttrs = { collapsed: collapseNode?.attrs?.collapsed }
      const tr = new Transaction(sheetState.doc, [
        new UpdateNodeStep(nodeId, { collapsed: true }, collapseOldAttrs ?? {}),
      ], [sheetState.doc], new Map())

      dispatch(tr)
      return true
    })

    // collapse.expandAll — 展开所有
    ctx.registerCommand<SheetState>('collapse.expandAll', (state, dispatch: ((tr: unknown) => void) | null) => {
      if (!dispatch) return true
      const sheetState = state
      
      // 收集所有需要展开的节点
      const updates = collectCollapsedUpdates(sheetState.doc, false)
      if (updates.length === 0) return true
      
      // 为每个节点创建 UpdateNodeStep
      const steps = updates.map(({ nodeId, oldCollapsed }) => 
        new UpdateNodeStep(nodeId, { collapsed: false }, { collapsed: oldCollapsed })
      )
      
      // 通过 append 正确追踪变更
      const tr = Transaction.empty(sheetState.doc).append(...steps)
      dispatch(tr)
      return true
    })

    // collapse.collapseAll — 折叠所有
    ctx.registerCommand<SheetState>('collapse.collapseAll', (state, dispatch: ((tr: unknown) => void) | null) => {
      if (!dispatch) return true
      const sheetState = state
      
      // 收集所有需要折叠的节点
      const updates = collectCollapsedUpdates(sheetState.doc, true)
      if (updates.length === 0) return true
      
      // 为每个节点创建 UpdateNodeStep
      const steps = updates.map(({ nodeId, oldCollapsed }) => 
        new UpdateNodeStep(nodeId, { collapsed: true }, { collapsed: oldCollapsed })
      )
      
      // 通过 append 正确追踪变更
      const tr = Transaction.empty(sheetState.doc).append(...steps)
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
