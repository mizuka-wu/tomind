/**
 * ViewDesc — 视图描述基类（对标 ProseMirror ViewDesc）
 *
 * 职责：
 * 1. 管理 LeaferJS 元素（Group/Rect/Text 等）
 * 2. 管理子 ViewDesc 树
 * 3. 处理脏标记和增量更新
 * 4. 处理 Decoration（非破坏性渲染装饰）
 * 5. 处理事件（可选）
 *
 * 设计原则：
 * - 不可变数据，可变视图
 * - 脏标记驱动增量更新
 * - 事件冒泡机制
 */

import { Group } from 'leafer-ui'
import type { NodeDesc, NodeRole } from '@tomind/schema'
import type { Decoration, WidgetDecoration } from '@tomind/state'
import type { ViewEventType, ViewEventHandler, EventEmitter } from './view-event'
import { DefaultEventEmitter } from './view-event'

// ==================== 脏标记 ====================

/**
 * 脏标记 bitmask（6 级）
 */
export const enum DirtyFlag {
  CLEAN = 0,
  CONTENT = 1 << 0,    // 内容变更
  SIZE = 1 << 1,       // 尺寸变更
  LAYOUT = 1 << 2,     // 布局变更
  STYLE = 1 << 3,      // 样式变更
  CONNECTION = 1 << 4, // 连接线变更
  CHILDREN = 1 << 5,   // 子节点变更
  ALL = CONTENT | SIZE | LAYOUT | STYLE | CONNECTION | CHILDREN
}

// ==================== ViewDesc 基类 ====================

export abstract class ViewDesc {
  /** 所属节点 */
  readonly node: NodeDesc
  /** 节点角色 */
  readonly role: NodeRole
  /** 父 ViewDesc */
  protected _parent: ViewDesc | null = null
  /** 子 ViewDesc 列表 */
  protected _children: ViewDesc[] = []
  /** LeaferJS 元素（Group/Rect/Text 等） */
  protected _element: Group | null = null
  /** 内容容器（用于放置子元素） */
  protected _contentGroup: Group | null = null
  /** 脏标记 */
  protected _dirty: DirtyFlag = DirtyFlag.ALL
  /** 是否已销毁 */
  protected _destroyed: boolean = false
  /** Widget ViewDesc（由 Decoration 驱动） */
  protected _widgetViews: Map<string, ViewDesc> = new Map()
  /** 事件发射器 */
  protected _eventEmitter: EventEmitter | null = null

  constructor(node: NodeDesc, role: NodeRole) {
    this.node = node
    this.role = role
  }

  // ==================== 元素管理 ====================

  /**
   * 获取 LeaferJS 元素（lazy 创建）
   */
  get element(): Group | null {
    if (this._element === null && !this._destroyed) {
      this._element = this.createElement()
      if (this._element) {
        this._contentGroup = this.createContentGroup()
        if (this._contentGroup) {
          this._element.add(this._contentGroup)
        }
      }
    }
    return this._element
  }

  /**
   * 获取内容容器
   */
  get contentGroup(): Group | null {
    // 确保 element 已创建
    if (this._element === null) {
      void this.element
    }
    return this._contentGroup
  }

  /**
   * 创建 LeaferJS 元素（子类实现）
   */
  protected abstract createElement(): Group | null

  /**
   * 创建内容容器（子类实现）
   */
  protected abstract createContentGroup(): Group | null

  // ==================== 脏标记管理 ====================

  /**
   * 标记为脏
   */
  markDirty(flag: DirtyFlag): void {
    if (this._destroyed) return
    
    const wasClean = this._dirty === DirtyFlag.CLEAN
    this._dirty |= flag
    
    // 向上传播：内容变更 → 尺寸变更 → 布局变更
    if (flag & (DirtyFlag.CONTENT | DirtyFlag.SIZE)) {
      this._parent?.markDirty(DirtyFlag.SIZE | DirtyFlag.LAYOUT)
    }
    
    // 如果从 clean 变为 dirty，通知父节点
    if (wasClean && this._parent) {
      this._parent.markDirty(DirtyFlag.CHILDREN)
    }
  }

  /**
   * 清除脏标记
   */
  clearDirty(): void {
    this._dirty = DirtyFlag.CLEAN
  }

  /**
   * 递归标记自身及所有子节点为脏
   * 用于全局样式变化（如 compactLayoutModeLevel 变化）
   */
  markAllDirty(flag: DirtyFlag): void {
    this.markDirty(flag)
    for (const child of this._children) {
      child.markAllDirty(flag)
    }
  }

  /**
   * 检查是否脏
   */
  isDirty(flag?: DirtyFlag): boolean {
    if (flag === undefined) return this._dirty !== DirtyFlag.CLEAN
    return (this._dirty & flag) !== 0
  }

  // ==================== 子节点管理 ====================

  /**
   * 获取父 ViewDesc
   */
  get parent(): ViewDesc | null {
    return this._parent
  }

  /**
   * 设置父 ViewDesc
   */
  setParent(parent: ViewDesc | null): void {
    this._parent = parent
  }

  /**
   * 获取子 ViewDesc 列表
   */
  get children(): readonly ViewDesc[] {
    return this._children
  }

  /**
   * 添加子 ViewDesc
   */
  addChild(child: ViewDesc, index?: number): void {
    if (child._parent) {
      child._parent.removeChild(child)
    }
    
    child._parent = this
    
    if (index !== undefined && index >= 0 && index <= this._children.length) {
      this._children.splice(index, 0, child)
    } else {
      this._children.push(child)
    }
    
    // 添加到内容容器
    if (this._contentGroup && child._element) {
      this._contentGroup.add(child._element)
    }
    
    this.markDirty(DirtyFlag.CHILDREN)
  }

  /**
   * 移除子 ViewDesc
   */
  removeChild(child: ViewDesc): void {
    const index = this._children.indexOf(child)
    if (index === -1) return
    
    this._children.splice(index, 1)
    child._parent = null
    
    // 从内容容器移除
    if (this._contentGroup && child._element) {
      this._contentGroup.remove(child._element)
    }
    
    this.markDirty(DirtyFlag.CHILDREN)
  }

  /**
   * 替换子 ViewDesc
   */
  replaceChild(oldChild: ViewDesc, newChild: ViewDesc): void {
    const index = this._children.indexOf(oldChild)
    if (index === -1) return
    
    oldChild._parent = null
    newChild._parent = this
    this._children[index] = newChild
    
    // 替换内容容器中的元素
    if (this._contentGroup) {
      if (oldChild._element) {
        this._contentGroup.remove(oldChild._element)
      }
      if (newChild._element) {
        this._contentGroup.add(newChild._element)
      }
    }
    
    this.markDirty(DirtyFlag.CHILDREN)
  }

  // ==================== Widget Decoration ====================

  /**
   * 更新 Widget Decoration（子类可覆盖）
   * 
   * 基类实现：根据 widgetViewFactory 创建/销毁 Widget ViewDesc
   */
  updateWidgets(
    decorations: readonly Decoration[],
    widgetViewFactory: (widgetType: string, widgetId: string, node: NodeDesc) => ViewDesc | null
  ): void {
    const widgetDecs = decorations.filter((d): d is WidgetDecoration => d.type === 'widget')
    
    // 收集当前 widgetIds
    const currentIds = new Set(this._widgetViews.keys())
    const newIds = new Set(widgetDecs.map(d => d.widgetId))
    
    // 移除不再存在的 widget
    for (const id of currentIds) {
      if (!newIds.has(id)) {
        const view = this._widgetViews.get(id)
        if (view) {
          view.destroy()
          this._widgetViews.delete(id)
        }
      }
    }
    
    // 添加新的 widget
    for (const dec of widgetDecs) {
      if (!this._widgetViews.has(dec.widgetId)) {
        const view = widgetViewFactory(dec.widgetType, dec.widgetId, this.node)
        if (view) {
          this._widgetViews.set(dec.widgetId, view)
          // widget 作为子 ViewDesc 添加
          if (dec.side === 'before') {
            this.addChild(view, 0)
          } else {
            this.addChild(view)
          }
        }
      }
    }
  }

  /**
   * 获取 Widget ViewDesc
   */
  getWidgetView(widgetId: string): ViewDesc | undefined {
    return this._widgetViews.get(widgetId)
  }

  // ==================== 更新 ====================

  /**
   * 更新节点数据（由子类 update() 调用）
   * 绕过 readonly 约束，因为 ViewDesc 的生命周期由编辑器管理
   */
  protected updateNode(newNode: NodeDesc): void {
    ;(this as { node: NodeDesc }).node = newNode
  }

  /**
   * 更新视图（子类实现）
   * 返回 true 表示更新成功，false 表示需要重建
   */
  update(newNode: NodeDesc): boolean {
    if (this._destroyed) return false
    
    // 更新节点数据
    this.updateNode(newNode)
    
    // 清除脏标记
    this.clearDirty()
    
    return true
  }

  /**
   * 销毁视图
   */
  destroy(): void {
    if (this._destroyed) return
    
    this._destroyed = true
    
    // 销毁 widget views
    for (const view of this._widgetViews.values()) {
      view.destroy()
    }
    this._widgetViews.clear()
    
    // 销毁子视图
    for (const child of this._children) {
      child.destroy()
    }
    this._children = []
    
    // 移除元素
    if (this._element && this._parent?._contentGroup) {
      this._parent._contentGroup.remove(this._element)
    }
    
    this._element = null
    this._contentGroup = null
    this._parent = null
  }

  // ==================== 事件处理 ====================

  /**
   * 是否阻止事件冒泡到 EditorView
   * 子类可覆盖
   */
  get stopEvent(): boolean {
    return false
  }

  // ==================== 工具方法 ====================

  /**
   * 查找指定 ID 的子 ViewDesc
   */
  findById(id: string): ViewDesc | null {
    if (this.node.id === id) return this
    
    for (const child of this._children) {
      const found = child.findById(id)
      if (found) return found
    }
    
    return null
  }

  /**
   * 获取路径（从根到当前节点的 ID 列表）
   */
  getPath(): string[] {
    const path: string[] = []
    let current: ViewDesc | null = this
    while (current) {
      path.unshift(current.node.id)
      current = current._parent
    }
    return path
  }

  /**
   * 获取深度
   */
  getDepth(): number {
    let depth = 0
    let current = this._parent
    while (current) {
      depth++
      current = current._parent
    }
    return depth
  }

  // ==================== 事件处理 ====================

  /**
   * 注册事件处理器
   */
  on(type: ViewEventType, handler: ViewEventHandler): void {
    if (!this._eventEmitter) {
      this._eventEmitter = new DefaultEventEmitter()
    }
    this._eventEmitter.on(type, handler)
  }

  /**
   * 注销事件处理器
   */
  off(type: ViewEventType, handler: ViewEventHandler): void {
    if (this._eventEmitter) {
      this._eventEmitter.off(type, handler)
    }
  }

  /**
   * 触发事件
   */
  emit(event: import('./view-event').ViewEvent): void {
    if (this._eventEmitter) {
      this._eventEmitter.emit(event)
    }
    // 向父节点冒泡
    if (this._parent) {
      this._parent.emit(event)
    }
  }

  /**
   * 清除所有事件处理器
   */
  clearEvents(): void {
    if (this._eventEmitter) {
      this._eventEmitter.clearEvents()
    }
  }

  /**
   * 设置事件发射器（用于共享事件系统）
   */
  setEventEmitter(emitter: EventEmitter): void {
    this._eventEmitter = emitter
  }
}
