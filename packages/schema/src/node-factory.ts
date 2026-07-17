/**
 * NodeDesc 工厂函数
 *
 * 提供类型安全的节点创建方法
 */

import type {
  NodeDesc,
  RelationshipNodeDesc,
  BoundaryNodeDesc,
  SummaryNodeDesc,
  ControlPoint,
} from './types'
import { createAttributeTitleFromPlainText } from './attribute-title'

// ==================== 通用 NodeDesc ====================

/**
 * 创建通用 NodeDesc
 */
export function createNodeDesc(
  id: string,
  type: string,
  attrs: Record<string, unknown> = {},
  children: Record<string, readonly NodeDesc[]> = {}
): NodeDesc {
  return { id, type, attrs, children }
}

// ==================== Relationship ====================

/**
 * 创建 RelationshipNodeDesc
 */
export function createRelationshipNode(
  id: string,
  sourceId: string,
  targetId: string,
  options: {
    title?: string
    controlPoints?: readonly ControlPoint[]
    children?: Record<string, readonly NodeDesc[]>
  } = {}
): RelationshipNodeDesc {
  return {
    id,
    type: 'relationship',
    attrs: {
      sourceId,
      targetId,
      attributeTitle: createAttributeTitleFromPlainText(options.title ?? ''),
      ...(options.title !== undefined && { title: options.title }),
      ...(options.controlPoints !== undefined && { controlPoints: options.controlPoints }),
    },
    children: options.children ?? {},
  }
}

// ==================== Boundary ====================

/**
 * 创建 BoundaryNodeDesc
 */
export function createBoundaryNode(
  id: string,
  topicIds: readonly string[],
  options: {
    title?: string
    children?: Record<string, readonly NodeDesc[]>
  } = {}
): BoundaryNodeDesc {
  return {
    id,
    type: 'boundary',
    attrs: {
      topicIds,
      attributeTitle: createAttributeTitleFromPlainText(options.title ?? ''),
      ...(options.title !== undefined && { title: options.title }),
    },
    children: options.children ?? {},
  }
}

// ==================== Summary ====================

/**
 * 创建 SummaryNodeDesc
 */
export function createSummaryNode(
  id: string,
  topicIds: readonly string[],
  options: {
    children?: Record<string, readonly NodeDesc[]>
  } = {}
): SummaryNodeDesc {
  return {
    id,
    type: 'summary',
    attrs: {
      topicIds,
      attributeTitle: createAttributeTitleFromPlainText(''),
    },
    children: options.children ?? {},
  }
}

// ==================== 类型守卫 ====================

/**
 * 判断是否为 RelationshipNodeDesc
 */
export function isRelationshipNode(node: NodeDesc): node is RelationshipNodeDesc {
  return node.type === 'relationship'
}

/**
 * 判断是否为 BoundaryNodeDesc
 */
export function isBoundaryNode(node: NodeDesc): node is BoundaryNodeDesc {
  return node.type === 'boundary'
}

/**
 * 判断是否为 SummaryNodeDesc
 */
export function isSummaryNode(node: NodeDesc): node is SummaryNodeDesc {
  return node.type === 'summary'
}
