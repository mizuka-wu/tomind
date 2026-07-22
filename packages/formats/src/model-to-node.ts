/**
 * modelToState — 将解析后的思维导图数据转换为 NodeDesc
 *
 * 统一中间格式：每个格式解析器输出 ModelTree，再由 modelToState 转为 NodeDesc。
 */

// ==================== NodeDesc 类型（避免依赖 @tomind/schema） ====================

interface NodeDesc {
  readonly id: string
  readonly type: string
  readonly attrs: Readonly<Record<string, unknown>>
  readonly children: Readonly<Record<string, readonly NodeDesc[]>>
}

// ==================== 中间格式 ====================

/** 格式解析器输出的节点树 */
export interface ModelNode {
  id: string
  title: string
  children: ModelNode[]
  /** 样式属性 */
  style?: Record<string, unknown>
  /** 标记 */
  markers?: string[]
  /** 标签 */
  labels?: string[]
  /** 图片 */
  image?: { url: string; width: number; height: number }
  /** 备注 */
  note?: string
  /** 超链接 */
  href?: string
  /** 结构类型 */
  structureClass?: string
  /** 折叠状态 */
  collapsed?: boolean
}

/** 格式解析器输出的完整树 */
export interface ModelTree {
  root: ModelNode
  /** 主题名称 */
  title?: string
  /** 主题 ID */
  theme?: string
}

// ==================== 转换器 ====================

let idCounter = 0

/** 生成唯一 ID */
function genId(): string {
  return `node-${Date.now()}-${++idCounter}`
}

/** ModelNode → NodeDesc */
function modelNodeToNodeDesc(node: ModelNode): NodeDesc {
  const children: Record<string, readonly NodeDesc[]> = {}

  if (node.children.length > 0) {
    children.attached = node.children.map((child) => modelNodeToNodeDesc(child))
  }

  return {
    id: node.id || genId(),
    type: 'topic',
    attrs: {
      title: node.title,
      ...node.style,
      ...(node.markers?.length ? { markers: node.markers } : {}),
      ...(node.labels?.length ? { labels: node.labels } : {}),
      ...(node.image ? { image: node.image } : {}),
      ...(node.note ? { note: node.note } : {}),
      ...(node.href ? { href: node.href } : {}),
      ...(node.structureClass ? { structureClass: node.structureClass } : {}),
      ...(node.collapsed ? { collapsed: true } : {}),
    },
    children,
  }
}

/** ModelTree → NodeDesc（根节点） */
export function modelToNodeDesc(tree: ModelTree): NodeDesc {
  return modelNodeToNodeDesc(tree.root)
}
