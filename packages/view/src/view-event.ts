/**
 * ViewEvent — 视图事件类型定义
 *
 * 定义 Renderer 和 NodeViewDesc 可以处理的事件类型
 */

// ==================== 事件类型 ====================

/** 基础指针事件类型 */
export type PointerEventType =
  | 'click'
  | 'dblclick'
  | 'contextmenu'
  | 'pointerdown'
  | 'pointerup'
  | 'pointermove'
  | 'pointerenter'
  | 'pointerleave'
  | 'pointerover'
  | 'pointerout'

/** 拖拽事件类型 */
export type DragEventType =
  | 'dragstart'
  | 'drag'
  | 'dragend'
  | 'dragenter'
  | 'dragleave'
  | 'dragover'
  | 'drop'

/** 键盘事件类型 */
export type KeyboardEventType =
  | 'keydown'
  | 'keyup'
  | 'keypress'

/** 手势事件类型 */
export type GestureEventType =
  | 'pinchstart'    // 双指缩放开始 (zoom.start)
  | 'pinch'         // 双指缩放中 (zoom)
  | 'pinchend'      // 双指缩放结束 (zoom.end)
  | 'rotatestart'   // 旋转开始 (rotate.start)
  | 'rotate'        // 旋转中 (rotate)
  | 'rotateend'     // 旋转结束 (rotate.end)

/** 所有事件类型 */
export type ViewEventType = PointerEventType | DragEventType | KeyboardEventType | GestureEventType

/** 事件处理器 */
export type ViewEventHandler<T = unknown> = (event: ViewEvent<T>) => void

// ==================== 事件数据 ====================

/** 拖拽事件额外数据 */
export interface DragEventData {
  /** 拖拽起始位置 */
  startPosition: { x: number; y: number }
  /** 当前位置 */
  currentPosition: { x: number; y: number }
  /** 拖拽偏移量 */
  delta: { x: number; y: number }
  /** 拖拽目标元素 ID（drop 时） */
  dropTargetId?: string
  /** 拖拽数据 */
  data?: unknown
}

/** 键盘事件额外数据 */
export interface KeyboardEventData {
  /** 按键代码 */
  code: string
  /** 按键值 */
  key: string
  /** 重复次数 */
  repeat: boolean
}

/** 手势事件额外数据 */
export interface GestureEventData {
  /** 缩放比例（增量） */
  scale?: number
  /** 累计缩放比例 */
  totalScale?: number
  /** 旋转角度（增量，度） */
  rotation?: number
  /** 累计旋转角度 */
  totalRotation?: number
  /** 手势中心点 */
  center?: { x: number; y: number }
}

// ==================== 事件对象 ====================

/** 基础事件对象 */
export interface ViewEvent<T = unknown> {
  /** 事件类型 */
  type: ViewEventType
  /** 目标节点 ID */
  targetId: string
  /** 目标 ViewDesc */
  target: unknown
  /** 原始事件（LeaferJS 事件或 DOM 事件） */
  nativeEvent: T
  /** 鼠标/触摸位置 */
  position: { x: number; y: number }
  /** 是否按住 Ctrl/Cmd */
  ctrlKey: boolean
  /** 是否按住 Shift */
  shiftKey: boolean
  /** 是否按住 Alt */
  altKey: boolean
  /** 拖拽事件数据（仅拖拽事件） */
  drag?: DragEventData
  /** 键盘事件数据（仅键盘事件） */
  keyboard?: KeyboardEventData
  /** 手势事件数据（仅手势事件） */
  gesture?: GestureEventData
  /** 阻止默认行为 */
  preventDefault: () => void
  /** 阻止冒泡 */
  stopPropagation: () => void
}

// ==================== 事件注册接口 ====================

/** 事件注册器接口 */
export interface EventEmitter<T = unknown> {
  /** 注册事件处理器 */
  on(type: ViewEventType, handler: ViewEventHandler<T>): void
  /** 注销事件处理器 */
  off(type: ViewEventType, handler: ViewEventHandler<T>): void
  /** 触发事件 */
  emit(event: ViewEvent<T>): void
  /** 清除所有事件处理器 */
  clearEvents(): void
}

// ==================== 默认实现 ====================

/** 默认事件发射器实现 */
export class DefaultEventEmitter<T = unknown> implements EventEmitter<T> {
  private _handlers = new Map<ViewEventType, Set<ViewEventHandler<T>>>()

  on(type: ViewEventType, handler: ViewEventHandler<T>): void {
    if (!this._handlers.has(type)) {
      this._handlers.set(type, new Set())
    }
    this._handlers.get(type)!.add(handler)
  }

  off(type: ViewEventType, handler: ViewEventHandler<T>): void {
    const handlers = this._handlers.get(type)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  emit(event: ViewEvent<T>): void {
    const handlers = this._handlers.get(event.type)
    if (handlers) {
      for (const handler of handlers) {
        handler(event)
      }
    }
  }

  clearEvents(): void {
    this._handlers.clear()
  }
}

// ==================== 工具函数 ====================

/** 创建事件对象 */
export function createViewEvent<T>(
  type: ViewEventType,
  targetId: string,
  target: unknown,
  nativeEvent: T,
  position: { x: number; y: number },
  modifiers: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
  extra?: { drag?: DragEventData; keyboard?: KeyboardEventData; gesture?: GestureEventData }
): ViewEvent<T> {
  return {
    type,
    targetId,
    target,
    nativeEvent,
    position,
    ctrlKey: modifiers.ctrlKey ?? false,
    shiftKey: modifiers.shiftKey ?? false,
    altKey: modifiers.altKey ?? false,
    drag: extra?.drag,
    keyboard: extra?.keyboard,
    gesture: extra?.gesture,
    preventDefault: () => { /* 默认行为控制 */ },
    stopPropagation: () => { /* 冒泡控制 */ },
  }
}

/** LeaferJS 指针事件类型映射 */
const LEAFER_POINTER_EVENT_MAP: Record<string, PointerEventType> = {
  'tap': 'click',
  'doubletap': 'dblclick',
  'righttap': 'contextmenu',
  'pointerdown': 'pointerdown',
  'pointerup': 'pointerup',
  'pointermove': 'pointermove',
  'pointerenter': 'pointerenter',
  'pointerleave': 'pointerleave',
  'pointerover': 'pointerover',
  'pointerout': 'pointerout',
}

/** LeaferJS 拖拽事件类型映射 */
const LEAFER_DRAG_EVENT_MAP: Record<string, DragEventType> = {
  'drag.start': 'dragstart',
  'drag': 'drag',
  'drag.end': 'dragend',
  'drag.enter': 'dragenter',
  'drag.leave': 'dragleave',
  'drag.over': 'dragover',
  'drop': 'drop',
}

/** LeaferJS 手势事件类型映射 */
const LEAFER_GESTURE_EVENT_MAP: Record<string, GestureEventType> = {
  'zoom.start': 'pinchstart',
  'zoom': 'pinch',
  'zoom.end': 'pinchend',
  'rotate.start': 'rotatestart',
  'rotate': 'rotate',
  'rotate.end': 'rotateend',
}

/** DOM 键盘事件类型映射 */
const DOM_KEYBOARD_EVENT_MAP: Record<string, KeyboardEventType> = {
  'keydown': 'keydown',
  'keyup': 'keyup',
  'keypress': 'keypress',
}

/** 从 LeaferJS 事件类型转换 */
export function fromLeaferEventType(leaferType: string): ViewEventType | null {
  return LEAFER_POINTER_EVENT_MAP[leaferType] ?? 
         LEAFER_DRAG_EVENT_MAP[leaferType] ?? 
         LEAFER_GESTURE_EVENT_MAP[leaferType] ??
         null
}

/** 从 DOM 事件类型转换 */
export function fromDomEventType(domType: string): ViewEventType | null {
  return DOM_KEYBOARD_EVENT_MAP[domType] ?? null
}

/** 检查是否为拖拽事件 */
export function isDragEventType(type: ViewEventType): type is DragEventType {
  return ['dragstart', 'drag', 'dragend', 'dragenter', 'dragleave', 'dragover', 'drop'].includes(type as DragEventType)
}

/** 检查是否为键盘事件 */
export function isKeyboardEventType(type: ViewEventType): type is KeyboardEventType {
  return ['keydown', 'keyup', 'keypress'].includes(type as KeyboardEventType)
}

/** 检查是否为手势事件 */
export function isGestureEventType(type: ViewEventType): type is GestureEventType {
  return ['pinchstart', 'pinch', 'pinchend', 'rotatestart', 'rotate', 'rotateend'].includes(type as GestureEventType)
}
