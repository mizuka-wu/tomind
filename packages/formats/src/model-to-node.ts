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
  image?: {
    url: string
    width: number
    height: number
    align?: string
    borderWidth?: number
    borderColor?: string
    opacity?: number
    shadowVisible?: boolean
    lockRatio?: boolean
    flipAndRotateRecords?: string
  }
  /** 备注 */
  note?: string
  /** 备注 HTML 内容（对齐 snowbrush realHTML） */
  noteHtml?: string
  /** 超链接 */
  href?: string
  /** 结构类型 */
  structureClass?: string
  /** 折叠状态 */
  collapsed?: boolean
  /** 编号配置 */
  numbering?: {
    numberFormat: string
    prefix?: string
    suffix?: string
    numberSeparator?: string
    prependingNumbers?: string
  }
  /** 评论列表 */
  comments?: Array<{
    author: string
    content: string
    time?: number
  }>
  /** 摘要子节点（children.summary） */
  summaries?: ModelNode[]
  /** 边界子节点（children.boundary） */
  boundaries?: ModelNode[]
  /** 摘要/边界覆盖的子节点下标范围 */
  rangeStart?: number
  rangeEnd?: number
  /** 关联连线端点（relationship） */
  sourceId?: string
  targetId?: string
  /** 关联连线列表（挂到根节点 children.relationship） */
  relationships?: ModelNode[]
}

/** 格式解析器输出的完整树 */
export interface ModelTree {
  root: ModelNode
  /** 主题名称 */
  title?: string
  /** 主题数据（className → { id, properties }），保留 XMind 原始属性名 */
  themeData?: Record<string, { id?: string; properties: Record<string, string> }>
  /** 关联连线（挂在根节点 children.relationship） */
  relationships?: ModelNode[]
  /** skeleton 结构样式（role → structureClass），来自 xmind extensions */
  skeletonStructure?: Record<string, string>
}

// ==================== 转换器 ====================

let idCounter = 0

/** 生成唯一 ID */
function genId(): string {
  return `node-${Date.now()}-${++idCounter}`
}

/** 构建 NoteData（对齐 snowbrush realHTML） */
function buildNoteData(note?: string, noteHtml?: string): Record<string, unknown> {
  const content = note ?? ''
  const hasHtml = !!noteHtml
  return {
    content,
    ...(hasHtml ? { format: 'html' as const, htmlContent: noteHtml } : {}),
  }
}

/** ModelNode → NodeDesc */
function modelNodeToNodeDesc(node: ModelNode): NodeDesc {
  const children: Record<string, readonly NodeDesc[]> = {}

  if (node.children.length > 0) {
    children.attached = node.children.map((child) => modelNodeToNodeDesc(child))
  }
  if (node.summaries?.length) {
    children.summary = node.summaries.map((s) => modelSpecialToNodeDesc(s, 'summary'))
  }
  if (node.boundaries?.length) {
    children.boundary = node.boundaries.map((b) => modelSpecialToNodeDesc(b, 'boundary'))
  }
  if (node.relationships?.length) {
    children.relationship = node.relationships.map((r) => modelRelToNodeDesc(r))
  }

  return {
    id: node.id || genId(),
    type: 'topic',
    attrs: {
      title: node.title,
      ...(node.style ? { style: node.style } : {}),
      ...(node.markers?.length ? { markers: node.markers } : {}),
      ...(node.labels?.length ? { labels: node.labels } : {}),
      ...(node.image ? { image: node.image } : {}),
      ...(node.note || node.noteHtml ? { note: buildNoteData(node.note, node.noteHtml) } : {}),
      ...(node.href ? { href: node.href } : {}),
      ...(node.structureClass ? { structureClass: node.structureClass } : {}),
      ...(node.collapsed ? { collapsed: true } : {}),
      ...(node.numbering ? { numbering: node.numbering } : {}),
      ...(node.comments?.length ? { comments: node.comments } : {}),
    },
    children,
  }
}

/** summary / boundary ModelNode → NodeDesc（带 range） */
function modelSpecialToNodeDesc(node: ModelNode, type: 'summary' | 'boundary'): NodeDesc {
  return {
    id: node.id || genId(),
    type,
    attrs: {
      title: node.title,
      rangeStart: node.rangeStart ?? 0,
      rangeEnd: node.rangeEnd ?? 0,
      ...(node.style ? { style: node.style } : {}),
    },
    children: {},
  }
}

/** relationship ModelNode → NodeDesc */
function modelRelToNodeDesc(node: ModelNode): NodeDesc {
  return {
    id: node.id || genId(),
    type: 'relationship',
    attrs: {
      title: node.title,
      sourceId: node.sourceId,
      targetId: node.targetId,
    },
    children: {},
  }
}

/** ModelTree → NodeDesc（根节点） */
export function modelToNodeDesc(tree: ModelTree): NodeDesc {
  let root = modelNodeToNodeDesc(tree.root)
  // skeleton 结构样式挂到根节点 attrs，供布局按层级选择子结构（对齐 snowbrush skeleton）
  if (tree.skeletonStructure) {
    root = { ...root, attrs: { ...(root.attrs ?? {}), skeletonStructure: tree.skeletonStructure } }
  }
  const nodeRels = tree.root.relationships
  const treeRels = tree.relationships
  const allRels = [...(nodeRels ?? []), ...(treeRels ?? [])]
  if (allRels.length > 0) {
    const children: Record<string, readonly NodeDesc[]> = { ...root.children }
    const existing = children.relationship ?? []
    children.relationship = [...existing, ...allRels.map((r) => modelRelToNodeDesc(r))]
    return { ...root, children }
  }
  return root
}
