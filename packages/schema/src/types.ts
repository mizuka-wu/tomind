/**
 * Schema 类型定义 — 对标 ProseMirror model 层
 *
 * 设计原则：
 * - NodeDesc 是运行时数据（内部使用）
 * - Node 是对外 API（JSON 格式，序列化/反序列化用）
 * - 无 depth（通过 pos 系统计算）
 * - 无 marks（Part 不是 Mark，是独立概念）
 * - 无 parent（用 pos 系统定位 parent）
 */

import type { AttributeTitle } from './attribute-title'

// ==================== NodeDesc（运行时） ====================

/**
 * NodeDesc — 运行时节点描述（内部使用）
 *
 * children 是嵌套结构，值是完整的 NodeDesc 对象
 * 例：{ attached: [NodeDesc, NodeDesc], callout: [NodeDesc] }
 */
export interface NodeDesc {
  readonly id: string
  readonly type: string                          // ROOT / TOPIC / RELATIONSHIP / BOUNDARY / SUMMARY
  readonly attrs: Readonly<Record<string, unknown>>
  readonly children: Readonly<Record<string, readonly NodeDesc[]>>
}

// ==================== Node（对外 API） ====================

/**
 * Node — 对外 API（JSON 格式，序列化/反序列化用）
 */
export interface Node {
  readonly id: string
  readonly type: string
  readonly attrs: Record<string, unknown>
  readonly children: Record<string, NodeDesc[]>
}

// ==================== 选区 ====================

/**
 * 选区元素
 */
export interface SelectionElement {
  readonly id: string
  readonly type: 'topic' | 'relationship' | 'boundary' | 'summary'
}

/**
 * 选区选项
 */
export interface SetSelectionOptions {
  readonly append?: boolean
  readonly range?: boolean
}

/**
 * 选区状态
 */
export interface SelectionState {
  readonly elements: readonly SelectionElement[]
  readonly options?: SetSelectionOptions
}

// ==================== 视口 ====================

/**
 * 视口状态
 */
export interface Viewport {
  readonly x: number
  readonly y: number
  readonly zoom: number
}

// ==================== 样式 ====================

/**
 * 样式数据
 */
export interface StyleData {
  readonly [key: string]: unknown
}

// ==================== NodeRole ====================

/**
 * 节点角色（由位置/parent 链推理）
 */
export type NodeRole =
  | 'root'       // ROOT 节点
  | 'central'    // 中心主题（ROOT 的直属子 topic）
  | 'main'       // 主分支（central 的 attached 子节点）
  | 'sub'        // 子分支（非 ROOT 直属 topic 的 attached 子节点）
  | 'floating'   // 浮动节点（detached 类型）
  | 'callout'    // 标注（callout 类型）
  | 'summary'    // 摘要
  | 'boundary'   // 边界
  | 'relationship' // 关联关系
  | 'unknown'    // 未知

// ==================== Typed NodeDesc（带类型约束） ====================

/**
 * TopicNodeDesc — 主题节点
 *
 * 思维导图的核心节点，包含标题和子节点
 */
export interface TopicNodeDesc extends NodeDesc {
  readonly type: 'topic'
  readonly attrs: Readonly<{
    title: string                    // 纯文本标题（序列化用）
    attributeTitle: AttributeTitle   // 富文本标题（必填，始终存在）
    style?: StyleData
    [key: string]: unknown
  }>
}

/**
 * RelationshipNodeDesc — 关联关系节点
 *
 * 连接两个 Topic 节点的贝塞尔曲线
 */
export interface RelationshipNodeDesc extends NodeDesc {
  readonly type: 'relationship'
  readonly attrs: Readonly<{
    sourceId: string          // 起点 Topic ID
    targetId: string          // 终点 Topic ID
    title?: string            // 关系标题
    attributeTitle: AttributeTitle  // 富文本标题（必填）
    controlPoints?: readonly ControlPoint[]  // 贝塞尔控制点
    [key: string]: unknown
  }>
}

/**
 * ControlPoint — 贝塞尔曲线控制点
 */
export interface ControlPoint {
  readonly x: number
  readonly y: number
}

/**
 * BoundaryNodeDesc — 边界节点
 *
 * 包围一组 Topic 节点的虚线边界
 */
export interface BoundaryNodeDesc extends NodeDesc {
  readonly type: 'boundary'
  readonly attrs: Readonly<{
    topicIds: readonly string[]  // 包围的 Topic ID 列表
    title?: string               // 边界标题
    attributeTitle: AttributeTitle  // 富文本标题（必填）
    [key: string]: unknown
  }>
}

/**
 * SummaryNodeDesc — 摘要节点
 *
 * 对一组 Topic 节点的摘要说明
 */
export interface SummaryNodeDesc extends NodeDesc {
  readonly type: 'summary'
  readonly attrs: Readonly<{
    topicIds: readonly string[]  // 摘要的 Topic ID 列表
    attributeTitle: AttributeTitle  // 富文本标题（必填）
    [key: string]: unknown
  }>
}

// ==================== NodeInfo ====================

/**
 * 节点详细信息（getNode 返回值）
 */
export interface NodeInfo {
  readonly id: string
  readonly type: string
  readonly attrs: Readonly<Record<string, unknown>>
  readonly children: Readonly<Record<string, readonly NodeDesc[]>>
  readonly role: NodeRole
  readonly collapsed: boolean
}

// ==================== TopicData ====================

/**
 * TopicData — 旧版兼容（目标设计中已删除，保留用于迁移）
 */
export interface TopicData {
  readonly id: string
  readonly title: string
  readonly style: StyleData
  readonly children: Record<string, string[]>
  readonly markers: readonly MarkerData[]
  readonly labels: readonly LabelData[]
  readonly image?: ImageData
  readonly mathJax?: MathJaxData
  readonly note?: NoteData
  readonly link?: LinkData
  readonly numbering?: NumberingData
  readonly collapsed?: boolean
  readonly extensions: Record<string, unknown>
  readonly position?: Position
  readonly width?: number
  readonly height?: number
  readonly timestamp?: number
}

export interface MarkerData {
  readonly type: string
  readonly value: unknown
}

export interface LabelData {
  readonly text: string
  readonly style?: StyleData
}

export interface ImageData {
  readonly src: string
  readonly width?: number
  readonly height?: number
}

export interface MathJaxData {
  readonly formula: string
  readonly display?: boolean
}

export interface NoteData {
  readonly content: string
  readonly format?: 'plain' | 'markdown'
}

export interface LinkData {
  readonly url: string
  readonly title?: string
}

export interface NumberingData {
  readonly type: string
  readonly value: string
}

export interface Position {
  readonly x: number
  readonly y: number
}
