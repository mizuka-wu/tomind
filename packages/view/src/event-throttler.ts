/**
 * EventThrottler — 事件节流/防抖工具
 *
 * 提供事件处理器的节流和防抖功能，优化高频事件的性能。
 *
 * 使用场景：
 * - pointermove：鼠标移动事件（节流）
 * - wheel：滚轮事件（防抖）
 * - resize：窗口大小变化（防抖）
 *
 * 使用示例：
 * ```typescript
 * import { throttle, debounce } from './event-throttler'
 *
 * // 节流：每 16ms 最多执行一次
 * const throttledHandler = throttle((event) => {
 *   console.log('Mouse move:', event.position)
 * }, 16)
 *
 * // 防抖：停止触发 100ms 后执行
 * const debouncedHandler = debounce((event) => {
 *   console.log('Resize complete')
 * }, 100)
 * ```
 */

import type { ViewEventHandler, ViewEvent } from './view-event'

/**
 * 节流函数
 * 
 * 在指定时间间隔内最多执行一次。
 * 适用于高频事件如 pointermove、wheel 等。
 * 
 * @param handler - 原始事件处理器
 * @param interval - 时间间隔（毫秒）
 * @returns 节流后的处理器
 */
export function throttle<T = unknown>(
  handler: ViewEventHandler<T>,
  interval: number
): ViewEventHandler<T> {
  let lastTime = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  return (event: ViewEvent<T>) => {
    const now = Date.now()
    const remaining = interval - (now - lastTime)

    if (remaining <= 0) {
      // 立即执行
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = now
      handler(event)
    } else if (!timer) {
      // 延迟执行
      timer = setTimeout(() => {
        lastTime = Date.now()
        timer = null
        handler(event)
      }, remaining)
    }
  }
}

/**
 * 防抖函数
 * 
 * 在停止触发指定时间后执行。
 * 适用于需要等待用户操作完成的事件如 resize、search 等。
 * 
 * @param handler - 原始事件处理器
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的处理器
 */
export function debounce<T = unknown>(
  handler: ViewEventHandler<T>,
  delay: number
): ViewEventHandler<T> {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (event: ViewEvent<T>) => {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      timer = null
      handler(event)
    }, delay)
  }
}

/**
 * RAF 节流函数
 * 
 * 使用 requestAnimationFrame 进行节流。
 * 适用于需要与浏览器渲染同步的事件。
 * 
 * @param handler - 原始事件处理器
 * @returns RAF 节流后的处理器
 */
export function rafThrottle<T = unknown>(
  handler: ViewEventHandler<T>
): ViewEventHandler<T> {
  let rafId: number | null = null

  return (event: ViewEvent<T>) => {
    if (rafId !== null) {
      return
    }

    rafId = requestAnimationFrame(() => {
      rafId = null
      handler(event)
    })
  }
}

/**
 * 创建带选项的节流函数
 * 
 * @param handler - 原始事件处理器
 * @param options - 节流选项
 * @returns 节流后的处理器
 */
export function createThrottledHandler<T = unknown>(
  handler: ViewEventHandler<T>,
  options: {
    interval?: number
    leading?: boolean   // 是否在开始时执行
    trailing?: boolean  // 是否在结束时执行
  } = {}
): ViewEventHandler<T> {
  const { interval = 16, leading = true, trailing = true } = options
  let lastTime = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastArgs: ViewEvent<T> | null = null

  return (event: ViewEvent<T>) => {
    const now = Date.now()
    const remaining = interval - (now - lastTime)

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = now
      if (leading) {
        handler(event)
      }
    } else if (trailing) {
      lastArgs = event
      if (!timer) {
        timer = setTimeout(() => {
          lastTime = Date.now()
          timer = null
          if (lastArgs) {
            handler(lastArgs)
            lastArgs = null
          }
        }, remaining)
      }
    }
  }
}

/**
 * 创建带选项的防抖函数
 * 
 * @param handler - 原始事件处理器
 * @param options - 防抖选项
 * @returns 防抖后的处理器
 */
export function createDebouncedHandler<T = unknown>(
  handler: ViewEventHandler<T>,
  options: {
    delay?: number
    leading?: boolean   // 是否在开始时执行
    maxWait?: number    // 最大等待时间
  } = {}
): ViewEventHandler<T> {
  const { delay = 100, leading = false, maxWait } = options
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastTime = 0
  let lastArgs: ViewEvent<T> | null = null

  return (event: ViewEvent<T>) => {
    const now = Date.now()

    if (leading && !timer) {
      handler(event)
    }

    lastArgs = event
    lastTime = now

    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      timer = null
      if (!leading && lastArgs) {
        handler(lastArgs)
      }
      lastArgs = null
    }, maxWait ? Math.min(delay, maxWait - (Date.now() - lastTime)) : delay)
  }
}
