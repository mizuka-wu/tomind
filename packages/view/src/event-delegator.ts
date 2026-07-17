/**
 * EventDelegator — 事件委托器
 *
 * 通过在父元素上统一监听事件，减少事件监听器数量。
 * 利用 LeaferJS 的事件冒泡机制，将子元素的事件路由到正确的处理器。
 *
 * 优势：
 * 1. 减少事件监听器数量（从 O(n) 降到 O(1)）
 * 2. 动态添加的子元素自动获得事件处理
 * 3. 内存占用更少
 *
 * 使用示例：
 * ```typescript
 * const delegator = new EventDelegator(rootGroup)
 *
 * // 注册委托事件
 * delegator.delegate('click', 'topic-1', (event) => {
 *   console.log('Topic 1 clicked')
 * })
 *
 * // 批量注册
 * delegator.delegateMany(['topic-1', 'topic-2', 'topic-3'], {
 *   click: (event) => console.log('Clicked:', event.targetId),
 *   dblclick: (event) => console.log('Double-clicked:', event.targetId),
 * })
 * ```
 */

import type { Group } from 'leafer-ui'
import type { 
  ViewEventType, 
  ViewEventHandler, 
  ViewEvent
} from './view-event'
import { createViewEvent, isKeyboardEventType } from './view-event'

/** 委托事件处理器 */
interface DelegatedHandler {
  /** 目标元素 ID */
  targetId: string
  /** 事件处理器 */
  handler: ViewEventHandler
}

/**
 * EventDelegator — 事件委托器
 *
 * 职责：
 * 1. 在根元素上统一监听事件
 * 2. 根据事件目标（target）路由到正确的处理器
 * 3. 支持动态添加/移除委托
 */
export class EventDelegator {
  private _root: Group
  private _handlers = new Map<ViewEventType, Map<string, DelegatedHandler[]>>()
  private _nativeHandlers = new Map<ViewEventType, (nativeEvent: unknown) => void>()
  private _destroyed = false

  constructor(root: Group) {
    this._root = root
  }

  /**
   * 注册委托事件
   * 
   * @param type - 事件类型
   * @param targetId - 目标元素 ID
   * @param handler - 事件处理器
   */
  delegate(
    type: ViewEventType,
    targetId: string,
    handler: ViewEventHandler
  ): void {
    if (this._destroyed) {
      console.warn('EventDelegator has been destroyed')
      return
    }

    // 获取或创建事件类型映射
    if (!this._handlers.has(type)) {
      this._handlers.set(type, new Map())
      this.setupNativeListener(type)
    }
    
    const typeHandlers = this._handlers.get(type)!
    
    // 获取或创建目标 ID 的处理器列表
    if (!typeHandlers.has(targetId)) {
      typeHandlers.set(targetId, [])
    }
    
    typeHandlers.get(targetId)!.push({ targetId, handler })
  }

  /**
   * 批量注册委托事件
   * 
   * @param targetIds - 目标元素 ID 列表
   * @param handlers - 事件处理器映射
   */
  delegateMany(
    targetIds: string[],
    handlers: Partial<Record<ViewEventType, ViewEventHandler>>
  ): void {
    for (const targetId of targetIds) {
      for (const [type, handler] of Object.entries(handlers)) {
        if (handler) {
          this.delegate(type as ViewEventType, targetId, handler)
        }
      }
    }
  }

  /**
   * 注销委托事件
   * 
   * @param type - 事件类型
   * @param targetId - 目标元素 ID
   * @param handler - 可选，指定要移除的处理器
   */
  undelegate(
    type: ViewEventType,
    targetId: string,
    handler?: ViewEventHandler
  ): void {
    const typeHandlers = this._handlers.get(type)
    if (!typeHandlers) return

    const handlers = typeHandlers.get(targetId)
    if (!handlers) return

    if (handler) {
      // 移除特定处理器
      const index = handlers.findIndex(h => h.handler === handler)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    } else {
      // 移除所有处理器
      typeHandlers.delete(targetId)
    }

    // 清理空映射
    if (typeHandlers.size === 0) {
      this._handlers.delete(type)
      this.removeNativeListener(type)
    }
  }

  /**
   * 注销目标元素的所有委托事件
   * 
   * @param targetId - 目标元素 ID
   */
  undelegateAll(targetId: string): void {
    for (const [type, typeHandlers] of this._handlers) {
      typeHandlers.delete(targetId)
      
      if (typeHandlers.size === 0) {
        this._handlers.delete(type)
        this.removeNativeListener(type)
      }
    }
  }

  /**
   * 检查是否有委托事件
   * 
   * @param type - 可选，事件类型
   * @param targetId - 可选，目标元素 ID
   */
  hasDelegation(type?: ViewEventType, targetId?: string): boolean {
    if (!type) {
      return this._handlers.size > 0
    }
    
    const typeHandlers = this._handlers.get(type)
    if (!typeHandlers) return false
    
    if (!targetId) {
      return typeHandlers.size > 0
    }
    
    return typeHandlers.has(targetId)
  }

  /**
   * 获取委托事件数量
   */
  get delegationCount(): number {
    let count = 0
    for (const typeHandlers of this._handlers.values()) {
      for (const handlers of typeHandlers.values()) {
        count += handlers.length
      }
    }
    return count
  }

  /**
   * 销毁委托器
   */
  destroy(): void {
    // 移除所有原生监听器
    for (const [type] of this._nativeHandlers) {
      this.removeNativeListener(type)
    }
    
    this._handlers.clear()
    this._nativeHandlers.clear()
    this._destroyed = true
  }

  /**
   * 设置原生事件监听器
   */
  private setupNativeListener(type: ViewEventType): void {
    if (isKeyboardEventType(type)) {
      // 键盘事件不支持委托
      return
    }

    const nativeHandler = (nativeEvent: unknown) => {
      this.handleEvent(type, nativeEvent)
    }

    // 映射到 LeaferJS 事件类型
    const leaferType = this.getLeaferType(type)
    this._root.on(leaferType, nativeHandler)
    this._nativeHandlers.set(type, nativeHandler)
  }

  /**
   * 移除原生事件监听器
   */
  private removeNativeListener(type: ViewEventType): void {
    const nativeHandler = this._nativeHandlers.get(type)
    if (!nativeHandler) return

    const leaferType = this.getLeaferType(type)
    this._root.off(leaferType, nativeHandler)
    this._nativeHandlers.delete(type)
  }

  /**
   * 处理事件
   */
  private handleEvent(type: ViewEventType, nativeEvent: unknown): void {
    const ne = nativeEvent as Record<string, unknown>
    const target = ne.target as Record<string, unknown> | undefined
    const targetId = target?.id as string | undefined

    if (!targetId) return

    // 查找匹配的处理器
    const typeHandlers = this._handlers.get(type)
    if (!typeHandlers) return

    const handlers = typeHandlers.get(targetId)
    if (!handlers || handlers.length === 0) return

    // 创建 ViewEvent
    const event = this.createEvent(type, targetId, nativeEvent)

    // 触发处理器
    for (const { handler } of handlers) {
      handler(event)
    }
  }

  /**
   * 创建 ViewEvent
   */
  private createEvent(
    type: ViewEventType,
    targetId: string,
    nativeEvent: unknown
  ): ViewEvent {
    const ne = nativeEvent as Record<string, unknown>
    const position = {
      x: (ne.x as number) ?? 0,
      y: (ne.y as number) ?? 0,
    }

    return createViewEvent(
      type,
      targetId,
      this._root,
      nativeEvent,
      position,
      {
        ctrlKey: (ne.ctrlKey as boolean) ?? false,
        shiftKey: (ne.shiftKey as boolean) ?? false,
        altKey: (ne.altKey as boolean) ?? false,
      }
    )
  }

  /**
   * 获取 LeaferJS 事件类型
   */
  private getLeaferType(type: ViewEventType): string {
    const map: Partial<Record<ViewEventType, string>> = {
      // 指针事件
      click: 'tap',
      dblclick: 'doubletap',
      contextmenu: 'righttap',
      pointerdown: 'pointerdown',
      pointerup: 'pointerup',
      pointermove: 'pointermove',
      pointerenter: 'pointerenter',
      pointerleave: 'pointerleave',
      pointerover: 'pointerover',
      pointerout: 'pointerout',
      // 拖拽事件
      dragstart: 'drag.start',
      drag: 'drag',
      dragend: 'drag.end',
      dragenter: 'drag.enter',
      dragleave: 'drag.leave',
      dragover: 'drag.over',
      drop: 'drop',
      // 手势事件
      pinchstart: 'zoom.start',
      pinch: 'zoom',
      pinchend: 'zoom.end',
      rotatestart: 'rotate.start',
      rotate: 'rotate',
      rotateend: 'rotate.end',
    }

    return map[type] ?? type
  }
}
