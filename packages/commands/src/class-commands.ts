/**
 * ClassList Commands — 类名操作命令
 */

import { defineCommand } from './command-def'
import { parseClassList, addClass, removeClass } from '@tomind/state'

// ==================== 添加类名 ====================

export const addClassCommand = defineCommand<{
  nodeId: string
  className: string
  index?: number
}, { nodeId: string; className: string; classList: string[] }>({
  name: 'add_class',
  description: '给节点添加类名',
  category: 'style',
  tags: ['class', 'style', 'add'],
  idempotent: true,
  inputSchema: {
    type: 'object',
    properties: {
      nodeId: { type: 'string', description: '节点 ID' },
      className: { type: 'string', description: '类名' },
      index: { type: 'number', description: '插入位置（可选，默认追加到末尾）' },
    },
    required: ['nodeId', 'className'],
  },
  execute: (params, state, dispatch) => {
    // 检查节点是否存在
    const node = state.getNode(params.nodeId)
    if (!node) {
      return { success: false, error: `Node not found: ${params.nodeId}` }
    }

    // 解析当前类名
    const classString = node.attrs.class as string | undefined
    const currentList = parseClassList(classString)

    // 添加类名
    const newList = addClass(currentList, params.className, params.index)

    // 检查是否有变化
    if (newList.length === currentList.length && newList.every((c, i) => c === currentList[i])) {
      return { success: true, data: { nodeId: params.nodeId, className: params.className, classList: currentList } }
    }

    // 创建事务
    if (!dispatch) {
      return { success: true, data: { nodeId: params.nodeId, className: params.className, classList: newList } }
    }

    // TODO: 实现实际的属性更新逻辑
    // const tr = state.tr
    // tr.setAttrs(params.nodeId, { class: serializeClassList(newList) })
    // dispatch(tr)

    return { success: true, data: { nodeId: params.nodeId, className: params.className, classList: newList } }
  },
  canExecute: (params, state) => !!state.getNode(params.nodeId),
})

// ==================== 移除类名 ====================

export const removeClassCommand = defineCommand<{
  nodeId: string
  className: string
}, { nodeId: string; className: string; classList: string[] }>({
  name: 'remove_class',
  description: '移除节点的类名',
  category: 'style',
  tags: ['class', 'style', 'remove'],
  idempotent: true,
  inputSchema: {
    type: 'object',
    properties: {
      nodeId: { type: 'string', description: '节点 ID' },
      className: { type: 'string', description: '类名' },
    },
    required: ['nodeId', 'className'],
  },
  execute: (params, state, dispatch) => {
    // 检查节点是否存在
    const node = state.getNode(params.nodeId)
    if (!node) {
      return { success: false, error: `Node not found: ${params.nodeId}` }
    }

    // 解析当前类名
    const classString = node.attrs.class as string | undefined
    const currentList = parseClassList(classString)

    // 移除类名
    const newList = removeClass(currentList, params.className)

    // 检查是否有变化
    if (newList.length === currentList.length) {
      return { success: true, data: { nodeId: params.nodeId, className: params.className, classList: currentList } }
    }

    // 创建事务
    if (!dispatch) {
      return { success: true, data: { nodeId: params.nodeId, className: params.className, classList: newList } }
    }

    // TODO: 实现实际的属性更新逻辑
    // const tr = state.tr
    // tr.setAttrs(params.nodeId, { class: serializeClassList(newList) })
    // dispatch(tr)

    return { success: true, data: { nodeId: params.nodeId, className: params.className, classList: newList } }
  },
  canExecute: (params, state) => !!state.getNode(params.nodeId),
})

// ==================== 导出 ====================

export const classListCommands = [
  addClassCommand,
  removeClassCommand,
]
