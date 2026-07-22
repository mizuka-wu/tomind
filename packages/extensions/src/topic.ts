/**
 * TopicExtension — 主题节点扩展
 *
 * 注册 topic 节点类型和核心编辑命令：
 * - topic.addChild: 添加子主题（Tab）
 * - topic.addSibling: 添加同级主题（Enter）
 * - topic.addSiblingBefore: 添加同级主题（前）（Shift+Enter）
 * - topic.delete: 删除选中节点（Delete/Backspace）
 *
 * 同时注册导航命令：
 * - navigation.up/down/left/right: 方向键导航
 *
 * 以及选区扩展命令：
 * - selection.extendUp/extendDown: Mod+方向键扩展选择
 *
 * 以及文件操作：
 * - file.save: 保存文件
 */

import { createExtension, InsertNodeStep, RemoveNodeStep, Transaction } from '@tomind/core'
import type { SheetState, NodeDesc, ExtensionContext, SelectionElement, SelectionState } from '@tomind/core'
import { createAttributeTitleFromPlainText } from '@tomind/core'

// ==================== Options ====================

export interface TopicOptions extends Record<string, unknown> {
  enabled?: boolean
}

// ==================== 工具函数 ====================

/** 获取选中节点 ID */
function getSelectedNodeId(state: SheetState): string | null {
  const sel = state.selection
  return sel?.elements?.[0]?.id ?? null
}

/** 获取所有选中节点 ID */
function getSelectedNodeIds(state: SheetState): string[] {
  return state.selection?.elements?.map(el => el.id) ?? []
}

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

/** 获取节点在父节点 attached 子节点中的索引 */
function getAttachedIndex(parent: NodeDesc, childId: string): number {
  const attached = parent.children['attached'] ?? []
  return attached.findIndex(c => c.id === childId)
}

/** 获取节点的 attached 子节点列表 */
function getAttachedChildren(node: NodeDesc): readonly NodeDesc[] {
  return node.children['attached'] ?? []
}

/** 判断节点是否是 topic 类型 */
function isTopicNode(node: NodeDesc | null): boolean {
  return node?.type === 'topic'
}

/** 生成唯一 ID */
function generateId(): string {
  return `topic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** 创建空主题节点 */
function createEmptyTopic(id: string): NodeDesc {
  return {
    id,
    type: 'topic',
    attrs: {
      title: '',
      attributeTitle: createAttributeTitleFromPlainText(''),
    },
    children: {},
  }
}

// ==================== Extension ====================

export const TopicExtension = createExtension<TopicOptions>({
  name: 'topic',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    // ==================== topic.addChild ====================
    ctx.registerCommand('topic.addChild', (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      params?: unknown,
    ): boolean => {
      const sheetState = state as SheetState
      const { nodeId, title } = (params ?? {}) as { nodeId?: string; title?: string }
      const targetId = nodeId ?? getSelectedNodeId(sheetState)
      if (!targetId) return false

      const targetNode = findInTree(sheetState.doc, targetId)
      if (!targetNode || !isTopicNode(targetNode)) return false

      if (!dispatch) return true

      const newId = generateId()
      const newNode = title
        ? { ...createEmptyTopic(newId), attrs: { title, attributeTitle: createAttributeTitleFromPlainText(title) } }
        : createEmptyTopic(newId)

      const tr = new Transaction(sheetState.doc, [
        new InsertNodeStep(targetId, newNode),
      ], [sheetState.doc], new Map())

      // 自动选中新节点
      const newDoc = tr.doc
      const newSel: SelectionState = { elements: [{ id: newId, type: 'topic' }] }
      tr.setSelection(newSel)

      dispatch(tr)
      return true
    })

    // ==================== topic.addSibling ====================
    ctx.registerCommand('topic.addSibling', (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      params?: unknown,
    ): boolean => {
      const sheetState = state as SheetState
      const { nodeId, title } = (params ?? {}) as { nodeId?: string; title?: string }
      const targetId = nodeId ?? getSelectedNodeId(sheetState)
      if (!targetId) return false

      const targetNode = findInTree(sheetState.doc, targetId)
      if (!targetNode || !isTopicNode(targetNode)) return false

      // 根节点不能添加同级
      const parent = findParent(sheetState.doc, targetId)
      if (!parent) return false

      if (!dispatch) return true

      const newId = generateId()
      const newNode = title
        ? { ...createEmptyTopic(newId), attrs: { title, attributeTitle: createAttributeTitleFromPlainText(title) } }
        : createEmptyTopic(newId)

      // 在父节点的 attached 中，插入到目标节点之后
      const index = getAttachedIndex(parent, targetId)
      const tr = new Transaction(sheetState.doc, [
        new InsertNodeStep(parent.id, newNode, index + 1),
      ], [sheetState.doc], new Map())

      // 自动选中新节点
      tr.setSelection({ elements: [{ id: newId, type: 'topic' }] })

      dispatch(tr)
      return true
    })

    // ==================== topic.addSiblingBefore ====================
    ctx.registerCommand('topic.addSiblingBefore', (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      params?: unknown,
    ): boolean => {
      const sheetState = state as SheetState
      const { nodeId, title } = (params ?? {}) as { nodeId?: string; title?: string }
      const targetId = nodeId ?? getSelectedNodeId(sheetState)
      if (!targetId) return false

      const targetNode = findInTree(sheetState.doc, targetId)
      if (!targetNode || !isTopicNode(targetNode)) return false

      const parent = findParent(sheetState.doc, targetId)
      if (!parent) return false

      if (!dispatch) return true

      const newId = generateId()
      const newNode = title
        ? { ...createEmptyTopic(newId), attrs: { title, attributeTitle: createAttributeTitleFromPlainText(title) } }
        : createEmptyTopic(newId)

      // 在父节点的 attached 中，插入到目标节点之前
      const index = getAttachedIndex(parent, targetId)
      const tr = new Transaction(sheetState.doc, [
        new InsertNodeStep(parent.id, newNode, Math.max(0, index)),
      ], [sheetState.doc], new Map())

      tr.setSelection({ elements: [{ id: newId, type: 'topic' }] })

      dispatch(tr)
      return true
    })

    // ==================== topic.delete ====================
    ctx.registerCommand('topic.delete', (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      params?: unknown,
    ): boolean => {
      const sheetState = state as SheetState
      const { nodeId } = (params ?? {}) as { nodeId?: string }
      const targetId = nodeId ?? getSelectedNodeId(sheetState)
      if (!targetId) return false

      const targetNode = findInTree(sheetState.doc, targetId)
      if (!targetNode || !isTopicNode(targetNode)) return false

      // 根节点不能删除
      const parent = findParent(sheetState.doc, targetId)
      if (!parent) return false

      if (!dispatch) return true

      const tr = new Transaction(sheetState.doc, [
        new RemoveNodeStep(targetId),
      ], [sheetState.doc], new Map())

      // 选中父节点
      tr.setSelection({ elements: [{ id: parent.id, type: 'topic' }] })

      dispatch(tr)
      return true
    })

    // ==================== navigation.up ====================
    ctx.registerCommand('navigation.up', (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
    ): boolean => {
      const sheetState = state as SheetState
      const targetId = getSelectedNodeId(sheetState)
      if (!targetId) return false

      const parent = findParent(sheetState.doc, targetId)
      if (!parent) return false

      const attached = getAttachedChildren(parent)
      const index = attached.findIndex(c => c.id === targetId)
      if (index <= 0) {
        // 已经是第一个或不存在，尝试选中父节点
        if (dispatch && parent.id !== sheetState.doc.id) {
          const tr = new Transaction(sheetState.doc, [], [sheetState.doc], new Map())
          tr.setSelection({ elements: [{ id: parent.id, type: 'topic' }] })
          dispatch(tr)
        }
        return true
      }

      if (dispatch) {
        const prevId = attached[index - 1].id
        const tr = new Transaction(sheetState.doc, [], [sheetState.doc], new Map())
        tr.setSelection({ elements: [{ id: prevId, type: 'topic' }] })
        dispatch(tr)
      }
      return true
    })

    // ==================== navigation.down ====================
    ctx.registerCommand('navigation.down', (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
    ): boolean => {
      const sheetState = state as SheetState
      const targetId = getSelectedNodeId(sheetState)
      if (!targetId) return false

      const parent = findParent(sheetState.doc, targetId)
      if (!parent) return false

      const attached = getAttachedChildren(parent)
      const index = attached.findIndex(c => c.id === targetId)
      if (index < 0 || index >= attached.length - 1) {
        // 已经是最后一个，尝试选中父节点
        if (dispatch && parent.id !== sheetState.doc.id) {
          const tr = new Transaction(sheetState.doc, [], [sheetState.doc], new Map())
          tr.setSelection({ elements: [{ id: parent.id, type: 'topic' }] })
          dispatch(tr)
        }
        return true
      }

      if (dispatch) {
        const nextId = attached[index + 1].id
        const tr = new Transaction(sheetState.doc, [], [sheetState.doc], new Map())
        tr.setSelection({ elements: [{ id: nextId, type: 'topic' }] })
        dispatch(tr)
      }
      return true
    })

    // ==================== navigation.left ====================
    ctx.registerCommand('navigation.left', (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
    ): boolean => {
      const sheetState = state as SheetState
      const targetId = getSelectedNodeId(sheetState)
      if (!targetId) return false

      const targetNode = findInTree(sheetState.doc, targetId)
      if (!targetNode) return false

      const attached = getAttachedChildren(targetNode)
      if (attached.length > 0 && !targetNode.attrs?.collapsed) {
        // 有子节点且未折叠 → 选中第一个子节点
        if (dispatch) {
          const tr = new Transaction(sheetState.doc, [], [sheetState.doc], new Map())
          tr.setSelection({ elements: [{ id: attached[0].id, type: 'topic' }] })
          dispatch(tr)
        }
      } else {
        // 无子节点或已折叠 → 选中父节点
        const parent = findParent(sheetState.doc, targetId)
        if (parent && dispatch) {
          const tr = new Transaction(sheetState.doc, [], [sheetState.doc], new Map())
          tr.setSelection({ elements: [{ id: parent.id, type: 'topic' }] })
          dispatch(tr)
        }
      }
      return true
    })

    // ==================== navigation.right ====================
    ctx.registerCommand('navigation.right', (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
    ): boolean => {
      const sheetState = state as SheetState
      const targetId = getSelectedNodeId(sheetState)
      if (!targetId) return false

      const targetNode = findInTree(sheetState.doc, targetId)
      if (!targetNode) return false

      const attached = getAttachedChildren(targetNode)
      if (attached.length > 0 && !targetNode.attrs?.collapsed) {
        // 有子节点且未折叠 → 选中第一个子节点
        if (dispatch) {
          const tr = new Transaction(sheetState.doc, [], [sheetState.doc], new Map())
          tr.setSelection({ elements: [{ id: attached[0].id, type: 'topic' }] })
          dispatch(tr)
        }
      } else if (attached.length > 0 && targetNode.attrs?.collapsed) {
        // 有子节点但已折叠 → 展开
        ctx.executeCommand('collapse.expand', { nodeId: targetId })
      }
      return true
    })

    // ==================== selection.extendUp ====================
    ctx.registerCommand('selection.extendUp', (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
    ): boolean => {
      const sheetState = state as SheetState
      const currentIds = getSelectedNodeIds(sheetState)
      if (currentIds.length === 0) return false

      const lastId = currentIds[currentIds.length - 1]
      const parent = findParent(sheetState.doc, lastId)
      if (!parent) return false

      const attached = getAttachedChildren(parent)
      const index = attached.findIndex(c => c.id === lastId)
      if (index <= 0) return false

      const prevId = attached[index - 1].id
      if (currentIds.includes(prevId)) return false

      if (dispatch) {
        const elements: SelectionElement[] = [...currentIds, prevId].map(id => ({ id, type: 'topic' as const }))
        const tr = new Transaction(sheetState.doc, [], [sheetState.doc], new Map())
        tr.setSelection({ elements })
        dispatch(tr)
      }
      return true
    })

    // ==================== selection.extendDown ====================
    ctx.registerCommand('selection.extendDown', (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
    ): boolean => {
      const sheetState = state as SheetState
      const currentIds = getSelectedNodeIds(sheetState)
      if (currentIds.length === 0) return false

      const lastId = currentIds[currentIds.length - 1]
      const parent = findParent(sheetState.doc, lastId)
      if (!parent) return false

      const attached = getAttachedChildren(parent)
      const index = attached.findIndex(c => c.id === lastId)
      if (index < 0 || index >= attached.length - 1) return false

      const nextId = attached[index + 1].id
      if (currentIds.includes(nextId)) return false

      if (dispatch) {
        const elements: SelectionElement[] = [...currentIds, nextId].map(id => ({ id, type: 'topic' as const }))
        const tr = new Transaction(sheetState.doc, [], [sheetState.doc], new Map())
        tr.setSelection({ elements })
        dispatch(tr)
      }
      return true
    })

    // ==================== file.save ====================
    ctx.registerCommand('file.save', (
      _state: unknown,
      _dispatch: ((tr: unknown) => void) | null,
    ): boolean => {
      // 发出保存事件（由应用层处理）
      ctx.emit('file:save')
      return true
    })
  },
})
