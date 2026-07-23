/**
 * 从 doc 树推断节点的样式类名
 * 等效旧系统的 getClassName() + getSuggestedClassName()
 */

import type { NodeDesc } from '@tomind/schema'
import type { NodeType } from './style-types'

// ==================== 节点类型常量 ====================

const NODE_TYPES = {
  ROOT: 'ROOT',
  TOPIC: 'TOPIC',
  RELATIONSHIP: 'RELATIONSHIP',
  BOUNDARY: 'BOUNDARY',
  SUMMARY: 'SUMMARY',
} as const

// ==================== 核心函数 ====================

/**
 * 推断节点的样式类名
 */
export function classifyNode(
  doc: NodeDesc,
  nodeId: string,
): NodeType {
  const node = findById(doc, nodeId)
  if (!node) return 'subTopic'

  // 非 topic 类型
  if (node.type === NODE_TYPES.ROOT) return 'centralTopic'
  if (node.type === NODE_TYPES.BOUNDARY) return 'boundary'
  if (node.type === NODE_TYPES.SUMMARY) return 'summary'
  if (node.type === NODE_TYPES.RELATIONSHIP) return 'relationship'

  // Topic 类型：根据层级和 topicType 推断
  const topicType = typeof node.attrs.topicType === 'string' ? node.attrs.topicType : undefined
  if (topicType === 'detached') return 'floatingTopic'
  if (topicType === 'callout') return 'calloutTopic'
  if (topicType === 'summary') return 'summaryTopic'

  const depth = getDepth(doc, nodeId)
  if (depth <= 0) return 'centralTopic'
  if (depth === 1) return 'mainTopic'
  return 'subTopic'
}

// ==================== 树遍历 ====================

/** 在 doc 树中查找节点 */
export function findById(node: NodeDesc, id: string): NodeDesc | null {
  if (node.id === id) return node
  for (const children of Object.values(node.children)) {
    for (const child of children) {
      const found = findById(child, id)
      if (found) return found
    }
  }
  return null
}

/** 获取节点深度（root = 0） */
export function getDepth(node: NodeDesc, targetId: string, depth = 0): number {
  if (node.id === targetId) return depth
  for (const children of Object.values(node.children)) {
    for (const child of children) {
      const d = getDepth(child, targetId, depth + 1)
      if (d >= 0) return d
    }
  }
  return -1
}

/** 获取节点的父节点 ID */
export function getParentId(doc: NodeDesc, nodeId: string): string | null {
  function walk(node: NodeDesc, parent: NodeDesc | null): string | null {
    if (node.id === nodeId) return parent?.id ?? null
    for (const children of Object.values(node.children)) {
      for (const child of children) {
        const found = walk(child, node)
        if (found !== null) return found
      }
    }
    return null
  }
  return walk(doc, null)
}
