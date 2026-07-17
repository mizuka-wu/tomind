/**
 * Node Commands — 节点操作命令
 */

import { defineCommand } from './command-def'

// ==================== 添加节点 ====================

export const addNodeCommand = defineCommand<{
  parentId: string
  type: string
  attrs?: Record<string, unknown>
  position?: number
}, { nodeId: string }>({
  name: 'add_node',
  description: '在指定父节点下添加子节点',
  category: 'node',
  tags: ['node', 'add', 'create'],
  inputSchema: {
    type: 'object',
    properties: {
      parentId: { type: 'string', description: '父节点 ID' },
      type: { type: 'string', description: '节点类型', enum: ['topic', 'relationship', 'boundary', 'summary'] },
      attrs: { type: 'object', description: '节点属性' },
      position: { type: 'number', description: '插入位置（可选，默认追加到末尾）' },
    },
    required: ['parentId', 'type'],
  },
  execute: (params, state, dispatch) => {
    // 检查父节点是否存在
    const parent = state.getNode(params.parentId)
    if (!parent) {
      return { success: false, error: `Parent node not found: ${params.parentId}` }
    }

    // 生成节点 ID
    const nodeId = crypto.randomUUID()

    // 创建事务
    if (!dispatch) return { success: true, data: { nodeId } }

    // TODO: 实现实际的节点添加逻辑
    // const tr = state.tr
    // tr.insertNode(params.parentId, nodeId, params.type, params.attrs, params.position)
    // dispatch(tr)

    return { success: true, data: { nodeId } }
  },
})

// ==================== 删除节点 ====================

export const deleteNodeCommand = defineCommand<{
  nodeId: string
}, { deletedId: string }>({
  name: 'delete_node',
  description: '删除指定节点',
  category: 'node',
  tags: ['node', 'delete', 'remove'],
  inputSchema: {
    type: 'object',
    properties: {
      nodeId: { type: 'string', description: '要删除的节点 ID' },
    },
    required: ['nodeId'],
  },
  execute: (params, state, dispatch) => {
    // 检查节点是否存在
    const node = state.getNode(params.nodeId)
    if (!node) {
      return { success: false, error: `Node not found: ${params.nodeId}` }
    }

    // 检查是否是根节点（不能删除）
    if (node.role === 'root') {
      return { success: false, error: 'Cannot delete root node' }
    }

    // 创建事务
    if (!dispatch) return { success: true, data: { deletedId: params.nodeId } }

    // TODO: 实现实际的节点删除逻辑
    // const tr = state.tr
    // tr.deleteNode(params.nodeId)
    // dispatch(tr)

    return { success: true, data: { deletedId: params.nodeId } }
  },
  canExecute: (params, state) => {
    const node = state.getNode(params.nodeId)
    return !!node && node.role !== 'root'
  },
})

// ==================== 更新节点属性 ====================

export const setAttrsCommand = defineCommand<{
  nodeId: string
  attrs: Record<string, unknown>
}, { nodeId: string; previous: Record<string, unknown>; updated: Record<string, unknown> }>({
  name: 'set_attrs',
  description: '更新节点属性',
  category: 'node',
  tags: ['node', 'attrs', 'update'],
  idempotent: true,
  inputSchema: {
    type: 'object',
    properties: {
      nodeId: { type: 'string', description: '节点 ID' },
      attrs: { type: 'object', description: '要更新的属性' },
    },
    required: ['nodeId', 'attrs'],
  },
  execute: (params, state, dispatch) => {
    // 检查节点是否存在
    const node = state.getNode(params.nodeId)
    if (!node) {
      return { success: false, error: `Node not found: ${params.nodeId}` }
    }

    // 记录之前的属性
    const previous: Record<string, unknown> = {}
    for (const key of Object.keys(params.attrs)) {
      previous[key] = node.attrs[key]
    }

    // 创建事务
    if (!dispatch) {
      return { success: true, data: { nodeId: params.nodeId, previous, updated: params.attrs } }
    }

    // TODO: 实现实际的属性更新逻辑
    // const tr = state.tr
    // tr.setAttrs(params.nodeId, params.attrs)
    // dispatch(tr)

    return { success: true, data: { nodeId: params.nodeId, previous, updated: params.attrs } }
  },
  canExecute: (params, state) => !!state.getNode(params.nodeId),
})

// ==================== 移动节点 ====================

export const moveNodeCommand = defineCommand<{
  nodeId: string
  newParentId: string
  position?: number
}, { nodeId: string; oldParentId: string; newParentId: string }>({
  name: 'move_node',
  description: '移动节点到新的父节点下',
  category: 'structure',
  tags: ['node', 'move', 'structure'],
  inputSchema: {
    type: 'object',
    properties: {
      nodeId: { type: 'string', description: '要移动的节点 ID' },
      newParentId: { type: 'string', description: '新的父节点 ID' },
      position: { type: 'number', description: '插入位置（可选）' },
    },
    required: ['nodeId', 'newParentId'],
  },
  execute: (params, state, dispatch) => {
    // 检查节点是否存在
    const node = state.getNode(params.nodeId)
    if (!node) {
      return { success: false, error: `Node not found: ${params.nodeId}` }
    }

    // 检查新父节点是否存在
    const newParent = state.getNode(params.newParentId)
    if (!newParent) {
      return { success: false, error: `New parent not found: ${params.newParentId}` }
    }

    // 检查是否移动到自己或自己的子节点下
    // TODO: 实现循环依赖检查

    // 获取旧父节点 ID
    // TODO: 从 state 获取父节点 ID
    const oldParentId = 'unknown'

    // 创建事务
    if (!dispatch) {
      return { success: true, data: { nodeId: params.nodeId, oldParentId, newParentId: params.newParentId } }
    }

    // TODO: 实现实际的节点移动逻辑
    // const tr = state.tr
    // tr.moveNode(params.nodeId, params.newParentId, params.position)
    // dispatch(tr)

    return { success: true, data: { nodeId: params.nodeId, oldParentId, newParentId: params.newParentId } }
  },
  canExecute: (params, state) => {
    const node = state.getNode(params.nodeId)
    const newParent = state.getNode(params.newParentId)
    return !!node && !!newParent && node.role !== 'root'
  },
})

// ==================== 导出 ====================

export const nodeCommands = [
  addNodeCommand,
  deleteNodeCommand,
  setAttrsCommand,
  moveNodeCommand,
]
