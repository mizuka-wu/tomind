/**
 * SheetState — 不可变 Sheet 状态（对标 ProseMirror EditorState）
 *
 * 极简化设计：
 * - doc: NodeDesc 树（数据源）
 * - _nodeMap: id → NodeDesc（查询优化）
 * - selection: 选区
 * - viewport: 视口
 * - decorations: 装饰集（非破坏性渲染装饰）
 * - plugins: 插件列表
 * - _pluginStates: 插件状态
 *
 * 设计原则：
 * - 不可变：所有修改返回新 State
 * - 单一数据源：doc 是唯一的数据来源
 * - getter 推导：其他数据从 doc 推导
 */

import type { NodeDesc, NodeInfo, NodeRole, SelectionState, Viewport } from '@tomind/schema'
import type { Transaction } from './transaction'
import { DecorationSet } from './decoration'

// ==================== PluginKey ====================

/**
 * PluginKey — 类型安全的插件状态键（对标 ProseMirror PluginKey）
 * T 用于类型推断，运行时不使用
 */
export class PluginKey<T = unknown> {
  constructor(
    public readonly name: string
  ) {}
  
  // 用于类型推断的虚拟属性
  declare readonly _type: T
}

// ==================== Plugin ====================

/**
 * Plugin — 插件定义（对标 ProseMirror Plugin）
 */
export interface Plugin<T = unknown> {
  readonly key: PluginKey<T>
  readonly state?: {
    init: (state: SheetState) => T
    apply: (tr: Transaction, value: T, state: SheetState) => T
  }
  readonly filterTransaction?: (tr: Transaction) => boolean
}

// ==================== SheetState 实现 ====================

export class SheetState {
  readonly doc: NodeDesc
  readonly _nodeMap: ReadonlyMap<string, NodeDesc>
  readonly selection: SelectionState
  readonly viewport: Viewport
  readonly decorations: DecorationSet
  readonly plugins: readonly Plugin[]
  readonly _pluginStates: ReadonlyMap<PluginKey<unknown>, unknown>

  constructor(
    doc: NodeDesc,
    nodeMap: Map<string, NodeDesc>,
    selection: SelectionState,
    viewport: Viewport,
    plugins: readonly Plugin[] = [],
    pluginStates: Map<PluginKey<unknown>, unknown> = new Map(),
    decorations: DecorationSet = DecorationSet.empty
  ) {
    this.doc = doc
    this._nodeMap = nodeMap
    this.selection = selection
    this.viewport = viewport
    this.plugins = plugins
    this._pluginStates = pluginStates
    this.decorations = decorations
  }

  // ==================== 节点查询 ====================

  /**
   * 获取节点详细信息（对标 ProseMirror node.resolve）
   * 返回节点的 id、属性、角色、折叠状态等
   */
  getNode(nodeId: string): NodeInfo | null {
    const node = this._nodeMap.get(nodeId)
    if (!node) return null

    return {
      id: node.id,
      type: node.type,
      attrs: node.attrs as Record<string, unknown>,
      children: node.children as unknown as Record<string, NodeDesc[]>,
      role: this.resolveRole(nodeId),
      collapsed: (node.attrs.collapsed as boolean) ?? false
    }
  }

  /**
   * 解析节点角色
   */
  resolveRole(nodeId: string): NodeRole {
    const node = this._nodeMap.get(nodeId)
    if (!node) return 'unknown'

    // ROOT 节点
    if (node.type === 'root') return 'root'

    // Relationship / Boundary / Summary
    if (node.type === 'relationship') return 'relationship'
    if (node.type === 'boundary') return 'boundary'
    if (node.type === 'summary') return 'summary'

    // TOPIC 节点：根据 parent 和 depth 推断
    const parent = this.findParent(nodeId)
    if (!parent) return 'unknown'

    // 父节点是 ROOT → central
    if (parent.type === 'root') return 'central'

    // 父节点是 TOPIC 且祖父是 ROOT → main
    const grandparent = this.findParent(parent.id)
    if (grandparent?.type === 'root') return 'main'

    // 其他 → sub
    return 'sub'
  }

  /**
   * 查找父节点
   */
  findParent(nodeId: string): NodeDesc | null {
    for (const [, node] of this._nodeMap) {
      for (const children of Object.values(node.children)) {
        if (Array.isArray(children)) {
          for (const child of children) {
            if (child.id === nodeId) return node
          }
        }
      }
    }
    return null
  }

  /**
   * 获取所有 topic 类型节点的 ID
   */
  getTopicIds(): string[] {
    const ids: string[] = []
    for (const [id, node] of this._nodeMap) {
      if (node.type === 'topic') ids.push(id)
    }
    return ids
  }

  /**
   * 获取标题
   */
  get title(): string | undefined {
    return this.doc.attrs['title'] as string | undefined
  }

  /**
   * 主题
   */
  get theme(): unknown {
    return this.doc.attrs['theme']
  }

  /**
   * 样式
   */
  get style(): unknown {
    return this.doc.attrs['style']
  }

  /**
   * 获取 rootTopic（doc 的第一个 TOPIC 子节点）
   */
  get rootTopic(): NodeDesc | null {
    const children = this.doc.children['attached'] ?? []
    return (Array.isArray(children) ? children[0] : null) ?? null
  }

  /**
   * 获取插件状态（对标 ProseMirror EditorState.field）
   */
  field<T>(key: PluginKey<T>): T {
    const value = this._pluginStates.get(key)
    if (value === undefined) {
      throw new Error(`Plugin state not found for key: ${key.name}`)
    }
    return value as T
  }

  // ==================== 状态更新 ====================

  /**
   * 应用 Transaction，返回新 State
   */
  apply(tr: Transaction): SheetState {
    // 检查插件是否允许此事务
    for (const plugin of this.plugins) {
      if (plugin.filterTransaction && !plugin.filterTransaction(tr)) {
        return this
      }
    }

    // 更新插件状态
    const newPluginStates = new Map<PluginKey<unknown>, unknown>()
    for (const plugin of this.plugins) {
      if (plugin.state) {
        const oldValue = this._pluginStates.get(plugin.key)
        const newValue = plugin.state.apply(
          tr,
          oldValue !== undefined ? oldValue : plugin.state.init(this),
          this
        )
        newPluginStates.set(plugin.key, newValue)
      }
    }

    // 构建新的 _nodeMap
    const newNodeMap = buildNodeMap(tr.doc)

    return new SheetState(
      tr.doc,
      newNodeMap,
      this.selection, // 选区通过 SetSelectionStep 更新
      this.viewport,  // 视口通过 SetViewportStep 更新
      [...this.plugins],
      newPluginStates,
      this.decorations  // Decoration 由插件通过 setDecorations 更新
    )
  }

  /**
   * 更新 DecorationSet（返回新 State）
   */
  setDecorations(decorations: DecorationSet): SheetState {
    return new SheetState(
      this.doc,
      new Map(this._nodeMap),
      this.selection,
      this.viewport,
      [...this.plugins],
      new Map(this._pluginStates),
      decorations
    )
  }

  // ==================== 静态工厂方法 ====================

  /**
   * 创建初始 State
   */
  static create(options: {
    doc: NodeDesc
    selection?: SelectionState
    viewport?: Viewport
    plugins?: readonly Plugin[]
    decorations?: DecorationSet
  }): SheetState {
    const nodeMap = buildNodeMap(options.doc)
    return new SheetState(
      options.doc,
      nodeMap,
      options.selection || { elements: [] },
      options.viewport || { x: 0, y: 0, zoom: 1 },
      options.plugins || [],
      new Map(),
      options.decorations || DecorationSet.empty
    )
  }
}

// ==================== 工具函数 ====================

/**
 * 构建 nodeId → NodeDesc 映射
 */
function buildNodeMap(doc: NodeDesc): Map<string, NodeDesc> {
  const map = new Map<string, NodeDesc>()
  function walk(node: NodeDesc) {
    map.set(node.id, node)
    for (const children of Object.values(node.children)) {
      if (Array.isArray(children)) {
        for (const child of children) {
          walk(child)
        }
      }
    }
  }
  walk(doc)
  return map
}
