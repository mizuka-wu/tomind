/**
 * MindNode 格式解析器
 *
 * MindNode 是 macOS/iOS 思维导图应用。
 * 导出格式为 JSON (.mindnode)：
 * {
 *   "metadata": { "name": "..." },
 *   "nodeTree": {
 *     "id": "...",
 *     "text": "...",
 *     "children": [...]
 *   }
 * }
 */

import type { ModelTree, ModelNode } from './model-to-node'

// ==================== MindNode JSON 类型 ====================

interface MindNodeItem {
  id: string
  text: string
  children?: MindNodeItem[]
  note?: string
  url?: string
  collapsed?: boolean
  label?: string
}

interface MindNodeDocument {
  metadata?: { name?: string }
  nodeTree: MindNodeItem
}

// ==================== 解析 ====================

function convertNode(node: MindNodeItem): ModelNode {
  const children: ModelNode[] = []

  if (node.children) {
    for (const child of node.children) {
      children.push(convertNode(child))
    }
  }

  return {
    id: node.id || `mindnode-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: node.text || '',
    children,
    ...(node.note ? { note: node.note } : {}),
    ...(node.url ? { href: node.url } : {}),
    ...(node.collapsed ? { collapsed: true } : {}),
    ...(node.label ? { labels: [node.label] } : {}),
  }
}

/**
 * 从 MindNode JSON 字符串解析
 */
export function parseMindNode(json: string): ModelTree {
  const doc: MindNodeDocument = JSON.parse(json)

  if (!doc.nodeTree) {
    throw new Error('Invalid MindNode file: no nodeTree')
  }

  return {
    root: convertNode(doc.nodeTree),
    title: doc.metadata?.name,
  }
}

// ==================== 导出 ====================

function modelToMindNode(node: ModelNode): MindNodeItem {
  const result: MindNodeItem = {
    id: node.id,
    text: node.title,
  }

  if (node.note) result.note = node.note
  if (node.href) result.url = node.href
  if (node.collapsed) result.collapsed = true
  if (node.labels?.length) result.label = node.labels[0]

  if (node.children.length > 0) {
    result.children = node.children.map((child) => modelToMindNode(child))
  }

  return result
}

/**
 * 将 ModelTree 导出为 MindNode JSON
 */
export function exportMindNode(tree: ModelTree): string {
  const doc: MindNodeDocument = {
    metadata: { name: tree.title },
    nodeTree: modelToMindNode(tree.root),
  }

  return JSON.stringify(doc, null, 2)
}
