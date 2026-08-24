/**
 * 类型安全的 document 事件监听工具
 *
 * 解决 addEventListener/removeEventListener 的类型不兼容问题：
 * handler 的事件类型参数必须与事件名精确匹配。
 */

/** DocumentEventMap 的子集，只保留常用事件 */
type DocEventMap = {
  mousemove: MouseEvent
  mouseup: MouseEvent
  mousedown: MouseEvent
  touchmove: TouchEvent
  touchstart: TouchEvent
  touchend: TouchEvent
  keydown: KeyboardEvent
  keyup: KeyboardEvent
  pointermove: PointerEvent
  pointerup: PointerEvent
  pointerdown: PointerEvent
}

/** 通用 document 事件名 */
type DocEventName = keyof DocEventMap

/**
 * 类型安全地添加 document 事件监听
 *
 * @example
 * onDocEvent('mousemove', (e) => { e.clientX }) // e: MouseEvent
 * onDocEvent('touchmove', (e) => { e.touches }, { passive: false })
 */
export function onDocEvent<K extends DocEventName>(
  type: K,
  handler: (ev: DocEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): void
export function onDocEvent(
  type: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): void
export function onDocEvent(
  type: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): void {
  document.addEventListener(type, handler, options)
}

/**
 * 类型安全地移除 document 事件监听
 *
 * @example
 * offDocEvent('mousemove', handler)
 */
export function offDocEvent<K extends DocEventName>(
  type: K,
  handler: (ev: DocEventMap[K]) => void
): void
export function offDocEvent(
  type: string,
  handler: EventListenerOrEventListenerObject
): void
export function offDocEvent(
  type: string,
  handler: EventListenerOrEventListenerObject
): void {
  document.removeEventListener(type, handler)
}
