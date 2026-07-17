/**
 * Decoration 系统（对标 ProseMirror Decoration）
 *
 * Decoration 是对文档的非破坏性装饰 — 不修改 doc 数据，只影响渲染。
 * 三种类型：
 * - Widget Decoration：在指定位置插入额外元素（折叠按钮、编号等）
 * - Node Decoration：装饰整个节点容器（背景色、边框高亮等）
 * - Inline Decoration：装饰文本范围（文本样式标记等）
 *
 * 设计原则：
 * - Decoration 是纯数据，由 state 持有，view 消费
 * - DecorationSet 按 nodeId 索引，O(1) 查询
 * - Decoration 可带 spec（插件自定义数据）
 */

// ==================== Decoration 类型 ====================

/** Widget 位置 */
export type WidgetSide = 'before' | 'after'

/** Decoration 基类 */
export interface Decoration {
  /** 装饰类型 */
  readonly type: 'widget' | 'node' | 'inline'
  /** 装饰的节点 ID */
  readonly nodeId: string
  /** 自定义规格（插件自定义数据） */
  readonly spec?: Record<string, unknown>
}

/** Widget Decoration — 在指定节点位置插入额外元素 */
export interface WidgetDecoration extends Decoration {
  readonly type: 'widget'
  /** 插入位置：before = 节点前，after = 节点后 */
  readonly side: WidgetSide
  /** Widget 标识（用于创建/销毁对应的 ViewDesc） */
  readonly widgetId: string
  /** Widget 类型（折叠按钮、编号、指示器等） */
  readonly widgetType: string
}

/** Node Decoration — 装饰整个节点容器 */
export interface NodeDecoration extends Decoration {
  readonly type: 'node'
  /** 要应用的样式属性（class 或 style） */
  readonly attrs: {
    class?: string
    style?: Record<string, string | number>
  }
}

/** Inline Decoration — 装饰文本范围 */
export interface InlineDecoration extends Decoration {
  readonly type: 'inline'
  /** 起始偏移（相对于节点文本内容） */
  readonly from: number
  /** 结束偏移 */
  readonly to: number
  /** 要应用的样式属性 */
  readonly attrs: {
    class?: string
    style?: Record<string, string | number>
  }
}

// ==================== 工厂函数 ====================

/** 创建 Widget Decoration */
export function widgetDecoration(
  nodeId: string,
  widgetId: string,
  widgetType: string,
  side: WidgetSide = 'after',
  spec?: Record<string, unknown>,
): WidgetDecoration {
  return { type: 'widget', nodeId, widgetId, widgetType, side, spec }
}

/** 创建 Node Decoration */
export function nodeDecoration(
  nodeId: string,
  attrs: { class?: string; style?: Record<string, string | number> },
  spec?: Record<string, unknown>,
): NodeDecoration {
  return { type: 'node', nodeId, attrs, spec }
}

/** 创建 Inline Decoration */
export function inlineDecoration(
  nodeId: string,
  from: number,
  to: number,
  attrs: { class?: string; style?: Record<string, string | number> },
  spec?: Record<string, unknown>,
): InlineDecoration {
  return { type: 'inline', nodeId, from, to, attrs, spec }
}

// ==================== DecorationSet ====================

/**
 * DecorationSet — 管理 Decoration 的集合
 *
 * 按 nodeId 索引，支持按类型/节点查询。
 * 不可变设计：add/remove 返回新集合。
 */
export class DecorationSet {
  /** nodeId → Decoration[] */
  private readonly _map: ReadonlyMap<string, readonly Decoration[]>

  constructor(decorations: Iterable<Decoration> = []) {
    const map = new Map<string, Decoration[]>()
    for (const dec of decorations) {
      const list = map.get(dec.nodeId)
      if (list) {
        list.push(dec)
      } else {
        map.set(dec.nodeId, [dec])
      }
    }
    this._map = map
  }

  /** 空集合 */
  static empty: DecorationSet = new DecorationSet()

  /** 从 Decoration 数组创建 */
  static create(decorations: Decoration[]): DecorationSet {
    return new DecorationSet(decorations)
  }

  /** 合并多个 DecorationSet */
  static merge(sets: DecorationSet[]): DecorationSet {
    const all: Decoration[] = []
    for (const set of sets) {
      all.push(...set.toArray())
    }
    return new DecorationSet(all)
  }

  /** 获取指定节点的所有 Decoration */
  getDecorations(nodeId: string): readonly Decoration[] {
    return this._map.get(nodeId) ?? []
  }

  /** 获取指定节点的 Widget Decoration */
  getWidgets(nodeId: string): readonly WidgetDecoration[] {
    return this.getDecorations(nodeId).filter(
      (d): d is WidgetDecoration => d.type === 'widget'
    )
  }

  /** 获取指定节点的 Node Decoration */
  getNodeDecorations(nodeId: string): readonly NodeDecoration[] {
    return this.getDecorations(nodeId).filter(
      (d): d is NodeDecoration => d.type === 'node'
    )
  }

  /** 获取指定节点的 Inline Decoration */
  getInlineDecorations(nodeId: string): readonly InlineDecoration[] {
    return this.getDecorations(nodeId).filter(
      (d): d is InlineDecoration => d.type === 'inline'
    )
  }

  /** 添加 Decoration（返回新集合） */
  add(decoration: Decoration): DecorationSet {
    return new DecorationSet([...this.toArray(), decoration])
  }

  /** 批量添加（返回新集合） */
  addAll(decorations: Decoration[]): DecorationSet {
    return new DecorationSet([...this.toArray(), ...decorations])
  }

  /** 移除指定节点的所有 Decoration（返回新集合） */
  removeByNode(nodeId: string): DecorationSet {
    return new DecorationSet(
      this.toArray().filter(d => d.nodeId !== nodeId)
    )
  }

  /** 按 spec 字段移除（返回新集合） */
  removeBySpec(key: string, value: unknown): DecorationSet {
    return new DecorationSet(
      this.toArray().filter(d => d.spec?.[key] !== value)
    )
  }

  /** 按插件 ID 移除所有 Decoration（返回新集合） */
  removeByPlugin(pluginId: string): DecorationSet {
    return this.removeBySpec('pluginId', pluginId)
  }

  /** 是否为空 */
  get isEmpty(): boolean {
    return this._map.size === 0
  }

  /** Decoration 总数 */
  get size(): number {
    let count = 0
    for (const list of this._map.values()) {
      count += list.length
    }
    return count
  }

  /** 转为数组 */
  toArray(): Decoration[] {
    const result: Decoration[] = []
    for (const list of this._map.values()) {
      result.push(...list)
    }
    return result
  }

  /** 遍历 */
  forEach(callback: (decoration: Decoration) => void): void {
    for (const list of this._map.values()) {
      for (const dec of list) {
        callback(dec)
      }
    }
  }

  /** 映射（按节点分组） */
  map<T>(callback: (decorations: readonly Decoration[], nodeId: string) => T): Map<string, T> {
    const result = new Map<string, T>()
    for (const [nodeId, list] of this._map) {
      result.set(nodeId, callback(list, nodeId))
    }
    return result
  }
}
