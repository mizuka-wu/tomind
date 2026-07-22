/**
 * Lighten 格式解析器
 *
 * Lighten 是 iOS/macOS 思维导图应用。
 * 导出格式为 JSON (.lighten)：
 * {
 *   "version": "2.0",
 *   "topicTree": {
 *     "id": "...",
 *     "title": "...",
 *     "children": [...]
 *   }
 * }
 */

import type { ModelTree, ModelNode } from './model-to-node'

// ==================== Lighten JSON 类型 ====================

interface LightenNode {
  id: string
  title: string
  children?: LightenNode[]
  note?: string
  url?: string
  isCollapsed?: boolean
  labels?: string[]
}

interface LightenDocument {
  version?: string
  topicTree: LightenNode
}

// ==================== 解析 ====================

function convertNode(node: LightenNode): ModelNode {
  const children: ModelNode[] = []

  if (node.children) {
    for (const child of node.children) {
      children.push(convertNode(child))
    }
  }

  return {
    id: node.id || `lighten-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: node.title || '',
    children,
    ...(node.note ? { note: node.note } : {}),
    ...(node.url ? { href: node.url } : {}),
    ...(node.isCollapsed ? { collapsed: true } : {}),
    ...(node.labels?.length ? { labels: node.labels } : {}),
  }
}

/**
 * 从 Lighten JSON 字符串解析
 */
export function parseLighten(json: string): ModelTree {
  const doc: LightenDocument = JSON.parse(json)

  if (!doc.topicTree) {
    throw new Error('Invalid Lighten file: no topicTree')
  }

  return {
    root: convertNode(doc.topicTree),
    title: doc.topicTree.title,
  }
}

// ==================== 导出 ====================

function modelToLighten(node: ModelNode): LightenNode {
  const result: LightenNode = {
    id: node.id,
    title: node.title,
  }

  if (node.note) result.note = node.note
  if (node.href) result.url = node.href
  if (node.collapsed) result.isCollapsed = true
  if (node.labels?.length) result.labels = node.labels

  if (node.children.length > 0) {
    result.children = node.children.map((child) => modelToLighten(child))
  }

  return result
}

/**
 * 将 ModelTree 导出为 Lighten JSON
 */
export function exportLighten(tree: ModelTree): string {
  const doc: LightenDocument = {
    version: '2.0',
    topicTree: modelToLighten(tree.root),
  }

  return JSON.stringify(doc, null, 2)
}
