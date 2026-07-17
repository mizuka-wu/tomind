/**
 * KeyboardEventManager — 键盘事件管理器
 *
 * 专门管理键盘事件，支持：
 * - 全局键盘事件监听
 * - 快捷键组合
 * - 键盘事件过滤
 */

import type { 
  KeyboardEventType, 
  ViewEventHandler, 
  ViewEvent
} from './view-event'
import { createViewEvent } from './view-event'

/** 快捷键定义 */
export interface KeyBinding {
  /** 按键代码（如 'KeyA', 'Enter', 'Space'） */
  code?: string
  /** 按键值（如 'a', 'Enter', ' '） */
  key?: string
  /** 是否需要 Ctrl/Cmd */
  ctrl?: boolean
  /** 是否需要 Shift */
  shift?: boolean
  /** 是否需要 Alt */
  alt?: boolean
}

/** 快捷键处理器 */
export type KeyBindingHandler = (event: ViewEvent) => void

/**
 * KeyboardEventManager — 键盘事件管理器
 *
 * 使用示例：
 * ```typescript
 * const km = new KeyboardEventManager('editor')
 * 
 * // 监听单个按键
 * km.on('keydown', (e) => {
 *   if (e.keyboard?.key === 'Escape') {
 *     // 处理 ESC
 *   }
 * })
 * 
 * // 注册快捷键
 * km.registerBinding(
 *   { code: 'KeyZ', ctrl: true },
 *   (e) => console.log('Ctrl+Z pressed')
 * )
 * 
 * // 绑定到 canvas 容器
 * km.bind(canvasElement)
 * ```
 */
export class KeyboardEventManager {
  private _targetId: string
  private _element: HTMLElement | null = null
  private _handlers = new Map<KeyboardEventType, Set<ViewEventHandler>>()
  private _bindings = new Map<string, KeyBindingHandler>()
  private _destroyed = false

  constructor(targetId: string) {
    this._targetId = targetId
  }

  /**
   * 绑定到 DOM 元素
   */
  bind(element: HTMLElement): void {
    if (this._destroyed) {
      console.warn('KeyboardEventManager has been destroyed')
      return
    }

    // 解绑旧元素
    this.unbind()

    this._element = element
    element.addEventListener('keydown', this._handleKeyDown)
    element.addEventListener('keyup', this._handleKeyUp)
    element.addEventListener('keypress', this._handleKeyPress)
  }

  /**
   * 解绑 DOM 元素
   */
  unbind(): void {
    if (this._element) {
      this._element.removeEventListener('keydown', this._handleKeyDown)
      this._element.removeEventListener('keyup', this._handleKeyUp)
      this._element.removeEventListener('keypress', this._handleKeyPress)
      this._element = null
    }
  }

  /**
   * 注册键盘事件处理器
   */
  on(type: KeyboardEventType, handler: ViewEventHandler): void {
    if (!this._handlers.has(type)) {
      this._handlers.set(type, new Set())
    }
    this._handlers.get(type)!.add(handler)
  }

  /**
   * 注销键盘事件处理器
   */
  off(type: KeyboardEventType, handler: ViewEventHandler): void {
    this._handlers.get(type)?.delete(handler)
  }

  /**
   * 注册快捷键
   */
  registerBinding(binding: KeyBinding, handler: KeyBindingHandler): string {
    const id = this.bindingToId(binding)
    this._bindings.set(id, handler)
    return id
  }

  /**
   * 注销快捷键
   */
  unregisterBinding(id: string): void {
    this._bindings.delete(id)
  }

  /**
   * 注销快捷键（通过绑定定义）
   */
  unregisterBindingByDef(binding: KeyBinding): void {
    const id = this.bindingToId(binding)
    this._bindings.delete(id)
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.unbind()
    this._handlers.clear()
    this._bindings.clear()
    this._destroyed = true
  }

  /**
   * 处理键盘按下事件
   */
  private _handleKeyDown = (nativeEvent: KeyboardEvent): void => {
    const event = this.createEvent('keydown', nativeEvent)
    this._emit('keydown', event)
    this._checkBindings(nativeEvent, event)
  }

  /**
   * 处理键盘抬起事件
   */
  private _handleKeyUp = (nativeEvent: KeyboardEvent): void => {
    const event = this.createEvent('keyup', nativeEvent)
    this._emit('keyup', event)
  }

  /**
   * 处理键盘按键事件
   */
  private _handleKeyPress = (nativeEvent: KeyboardEvent): void => {
    const event = this.createEvent('keypress', nativeEvent)
    this._emit('keypress', event)
  }

  /**
   * 触发事件处理器
   */
  private _emit(type: KeyboardEventType, event: ViewEvent): void {
    const handlers = this._handlers.get(type)
    if (handlers) {
      for (const handler of handlers) {
        handler(event)
      }
    }
  }

  /**
   * 检查快捷键匹配
   */
  private _checkBindings(nativeEvent: KeyboardEvent, event: ViewEvent): void {
    for (const [id, handler] of this._bindings) {
      const binding = this.idToBinding(id)
      if (this.matchBinding(binding, nativeEvent)) {
        event.preventDefault()
        handler(event)
        break // 只匹配第一个
      }
    }
  }

  /**
   * 检查快捷键是否匹配
   */
  private matchBinding(binding: KeyBinding, event: KeyboardEvent): boolean {
    const ctrlPressed = event.ctrlKey || event.metaKey
    const shiftPressed = event.shiftKey
    const altPressed = event.altKey

    // 检查修饰键
    if (binding.ctrl !== undefined && binding.ctrl !== ctrlPressed) return false
    if (binding.shift !== undefined && binding.shift !== shiftPressed) return false
    if (binding.alt !== undefined && binding.alt !== altPressed) return false

    // 检查按键
    if (binding.code && binding.code !== event.code) return false
    if (binding.key && binding.key !== event.key) return false

    return true
  }

  /**
   * 创建 ViewEvent
   */
  private createEvent(type: KeyboardEventType, nativeEvent: KeyboardEvent): ViewEvent {
    return createViewEvent(
      type,
      this._targetId,
      this,
      nativeEvent,
      { x: 0, y: 0 },
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
   * 快捷键转为唯一 ID
   */
  private bindingToId(binding: KeyBinding): string {
    const parts: string[] = []
    if (binding.ctrl) parts.push('ctrl')
    if (binding.shift) parts.push('shift')
    if (binding.alt) parts.push('alt')
    parts.push(binding.code ?? binding.key ?? 'unknown')
    return parts.join('+')
  }

  /**
   * ID 转为快捷键定义
   */
  private idToBinding(id: string): KeyBinding {
    const parts = id.split('+')
    const binding: KeyBinding = {}
    
    for (const part of parts) {
      switch (part) {
        case 'ctrl':
          binding.ctrl = true
          break
        case 'shift':
          binding.shift = true
          break
        case 'alt':
          binding.alt = true
          break
        default:
          binding.code = part
          break
      }
    }
    
    return binding
  }
}
