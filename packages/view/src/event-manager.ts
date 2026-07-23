/**
 * EventManager — 事件管理器
 *
 * 管理 Renderer 和 ViewDesc 的事件绑定
 * 将 LeaferJS/DOM 事件转换为 ViewEvent
 */

import type { Group } from 'leafer-ui'
import type { 
  ViewEventType, 
  ViewEventHandler, 
  ViewEvent,
  PointerEventType,
  DragEventType,
  KeyboardEventType,
  GestureEventType
} from './view-event'
import { 
  createViewEvent, 
  isDragEventType, 
  isKeyboardEventType,
  isGestureEventType
} from './view-event'

// ==================== 类型安全辅助函数 ====================

/** 从 Record<string, unknown> 安全提取数字 */
function safeNum(obj: Record<string, unknown>, key: string, fallback: number): number {
  const val = obj[key]
  return typeof val === 'number' ? val : fallback
}

/** 从 Record<string, unknown> 安全提取字符串 */
function safeStr(obj: Record<string, unknown>, key: string): string | undefined {
  const val = obj[key]
  return typeof val === 'string' ? val : undefined
}

/** 从 Record<string, unknown> 安全提取布尔值 */
function safeBool(obj: Record<string, unknown>, key: string): boolean {
  const val = obj[key]
  return val === true
}

/** 事件绑定记录 */
interface EventBinding {
  element: Group
  leaferType: string
  handler: (nativeEvent: unknown) => void
}

/** 键盘事件绑定记录 */
interface KeyboardBinding {
  element: HTMLElement
  domType: string
  handler: EventListener
}

/**
 * EventManager — 事件管理器
 *
 * 职责：
 * 1. 管理 LeaferJS 指针/拖拽/手势事件绑定
 * 2. 管理 DOM 键盘事件绑定
 * 3. 将事件转换为 ViewEvent
 * 4. 支持事件委托（事件冒泡）
 */
export class EventManager {
  private _pointerBindings = new Map<string, EventBinding[]>()
  private _keyboardBindings = new Map<string, KeyboardBinding[]>()
  private _targetId: string
  private _target: unknown

  constructor(targetId: string, target: unknown) {
    this._targetId = targetId
    this._target = target
  }

  /**
   * 注册指针/拖拽/手势事件处理器
   */
  onPointerEvent(
    type: PointerEventType | DragEventType | GestureEventType,
    handler: ViewEventHandler,
    element: Group,
    leaferType?: string
  ): void {
    const bindingKey = `${type}:${element.id || 'root'}`
    const actualLeaferType = leaferType ?? this.getLeaferType(type)

    // 创建包装处理器
    const wrappedHandler = (nativeEvent: unknown) => {
      const event = this.createPointerEvent(type, nativeEvent)
      handler(event)
    }

    // 绑定到 LeaferJS 元素
    element.on(actualLeaferType, wrappedHandler)

    // 记录绑定
    if (!this._pointerBindings.has(bindingKey)) {
      this._pointerBindings.set(bindingKey, [])
    }
    this._pointerBindings.get(bindingKey)!.push({
      element,
      leaferType: actualLeaferType,
      handler: wrappedHandler,
    })
  }

  /**
   * 注册键盘事件处理器
   * 
   * @param element - 监听键盘事件的 DOM 元素（通常是 canvas 容器或 document）
   */
  onKeyboardEvent(
    type: KeyboardEventType,
    handler: ViewEventHandler,
    element: HTMLElement
  ): void {
    const bindingKey = `${type}:keyboard`

    // 创建包装处理器
    const wrappedHandler: EventListener = (nativeEvent: Event) => {
      const event = this.createKeyboardEvent(type, nativeEvent as KeyboardEvent)
      handler(event)
    }

    // 绑定到 DOM 元素
    element.addEventListener(type, wrappedHandler)

    // 记录绑定
    if (!this._keyboardBindings.has(bindingKey)) {
      this._keyboardBindings.set(bindingKey, [])
    }
    this._keyboardBindings.get(bindingKey)!.push({
      element,
      domType: type,
      handler: wrappedHandler,
    })
  }

  /**
   * 统一事件注册接口
   */
  on(
    type: ViewEventType,
    handler: ViewEventHandler,
    element: Group | HTMLElement
  ): void {
    if (isKeyboardEventType(type)) {
      // 键盘事件需要 HTMLElement
      if (element instanceof HTMLElement) {
        this.onKeyboardEvent(type, handler, element)
      } else {
        console.warn(`Keyboard event '${type}' requires HTMLElement, got Group`)
      }
    } else {
      // 指针/拖拽/手势事件需要 Group
      if ('on' in element && typeof element.on === 'function') {
        this.onPointerEvent(
          type as PointerEventType | DragEventType | GestureEventType, 
          handler, 
          element as Group
        )
      }
    }
  }

  /**
   * 注销指针/拖拽/手势事件处理器
   */
  offPointerEvent(
    type: PointerEventType | DragEventType | GestureEventType,
    _handler: ViewEventHandler,
    element: Group
  ): void {
    const bindingKey = `${type}:${element.id || 'root'}`
    const bindings = this._pointerBindings.get(bindingKey)

    if (bindings) {
      // 查找并移除绑定
      const index = bindings.findIndex((b) => b.element === element)
      if (index !== -1) {
        const binding = bindings[index]
        element.off(binding.leaferType, binding.handler)
        bindings.splice(index, 1)
      }

      // 清理空列表
      if (bindings.length === 0) {
        this._pointerBindings.delete(bindingKey)
      }
    }
  }

  /**
   * 注销键盘事件处理器
   */
  offKeyboardEvent(
    type: KeyboardEventType,
    _handler: ViewEventHandler,
    element: HTMLElement
  ): void {
    const bindingKey = `${type}:keyboard`
    const bindings = this._keyboardBindings.get(bindingKey)

    if (bindings) {
      // 查找并移除绑定
      const index = bindings.findIndex((b) => b.element === element)
      if (index !== -1) {
        const binding = bindings[index]
        element.removeEventListener(binding.domType, binding.handler)
        bindings.splice(index, 1)
      }

      // 清理空列表
      if (bindings.length === 0) {
        this._keyboardBindings.delete(bindingKey)
      }
    }
  }

  /**
   * 统一事件注销接口
   */
  off(
    type: ViewEventType,
    handler: ViewEventHandler,
    element: Group | HTMLElement
  ): void {
    if (isKeyboardEventType(type)) {
      if (element instanceof HTMLElement) {
        this.offKeyboardEvent(type, handler, element)
      }
    } else {
      if ('on' in element && typeof element.on === 'function') {
        this.offPointerEvent(
          type as PointerEventType | DragEventType | GestureEventType, 
          handler, 
          element as Group
        )
      }
    }
  }

  /**
   * 清除所有事件绑定
   */
  clearEvents(): void {
    // 清理指针/拖拽/手势事件
    for (const [, bindings] of this._pointerBindings) {
      for (const binding of bindings) {
        binding.element.off(binding.leaferType, binding.handler)
      }
    }
    this._pointerBindings.clear()

    // 清理键盘事件
    for (const [, bindings] of this._keyboardBindings) {
      for (const binding of bindings) {
        binding.element.removeEventListener(binding.domType, binding.handler)
      }
    }
    this._keyboardBindings.clear()
  }

  /**
   * 创建指针/拖拽/手势 ViewEvent
   */
  private createPointerEvent(
    type: PointerEventType | DragEventType | GestureEventType,
    nativeEvent: unknown
  ): ViewEvent {
    const ne = nativeEvent as Record<string, unknown>
    const position = {
      x: safeNum(ne, 'x', safeNum(ne, 'clientX', 0)),
      y: safeNum(ne, 'y', safeNum(ne, 'clientY', 0)),
    }

    // 构建拖拽数据
    const dragData = isDragEventType(type) ? {
      startPosition: {
        x: safeNum(ne, 'startX', position.x),
        y: safeNum(ne, 'startY', position.y),
      },
      currentPosition: position,
      delta: {
        x: safeNum(ne, 'moveX', 0),
        y: safeNum(ne, 'moveY', 0),
      },
      dropTargetId: safeStr(ne, 'dropTargetId'),
      data: ne.dragData,
    } : undefined

    // 构建手势数据
    const gestureData = isGestureEventType(type) ? {
      scale: typeof ne.scale === 'number' ? ne.scale : undefined,
      totalScale: typeof ne.totalScale === 'number' ? ne.totalScale : undefined,
      rotation: typeof ne.rotation === 'number' ? ne.rotation : undefined,
      totalRotation: typeof ne.totalRotation === 'number' ? ne.totalRotation : undefined,
      center: position,
    } : undefined

    return createViewEvent(
      type,
      this._targetId,
      this._target,
      nativeEvent,
      position,
      {
        ctrlKey: safeBool(ne, 'ctrlKey'),
        shiftKey: safeBool(ne, 'shiftKey'),
        altKey: safeBool(ne, 'altKey'),
      },
      { drag: dragData, gesture: gestureData }
    )
  }

  /**
   * 创建键盘 ViewEvent
   */
  private createKeyboardEvent(
    type: KeyboardEventType,
    nativeEvent: KeyboardEvent
  ): ViewEvent {
    return createViewEvent(
      type,
      this._targetId,
      this._target,
      nativeEvent,
      { x: 0, y: 0 }, // 键盘事件没有位置
      {
        ctrlKey: nativeEvent.ctrlKey || nativeEvent.metaKey,
        shiftKey: nativeEvent.shiftKey,
        altKey: nativeEvent.altKey,
      },
      {
        keyboard: {
          code: nativeEvent.code,
          key: nativeEvent.key,
          repeat: nativeEvent.repeat,
        },
      }
    )
  }

  /**
   * 获取 LeaferJS 指针/拖拽/手势事件类型
   */
  private getLeaferType(type: PointerEventType | DragEventType | GestureEventType): string {
    const allMap: Partial<Record<PointerEventType | DragEventType | GestureEventType, string>> = {
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

    return allMap[type] ?? type
  }
}
