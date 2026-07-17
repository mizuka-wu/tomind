import { createExtension, SetViewportStep, Transaction } from '@tomind/core'
import type { SheetState, CommandFn, KeyboardShortcutHandler, ExtensionContext } from '@tomind/core'
/**
 * ViewportExtension — 视口操作扩展
 *
 * 功能：
 * 1. 注册视口命令
 * 2. 注册视口快捷键
 * 3. 鼠标滚轮控制视口
 * 4. 拖拽移动视口
 * 5. 自动移动（分支超出视口时）
 *
 * 命令：
 * - viewport.zoom: 缩放
 * - viewport.zoomIn: 放大
 * - viewport.zoomOut: 缩小
 * - viewport.move: 移动
 * - viewport.moveDelta: 移动增量
 * - viewport.fitMap: 适应地图
 * - viewport.zoomToFit: 缩放适应区域
 * - viewport.focusCenter: 聚焦中心
 * - viewport.reset: 重置视口
 *
 * 快捷键：
 * - Mod-=: 放大
 * - Mod--: 缩小
 * - Mod-0: 重置缩放
 * - Mod-9: 适应地图
 */


// ==================== 类型定义 ====================

interface ViewportOptions {
  [key: string]: unknown
  enabled?: boolean
  defaultZoom?: number
  minZoom?: number
  maxZoom?: number
  zoomStep?: number
  /** 是否启用滚轮缩放 */
  enableWheelZoom?: boolean
  /** 是否启用拖拽移动 */
  enableDragMove?: boolean
  /** 是否启用自动移动 */
  enableAutoMove?: boolean
  /** 触发拖拽的最小移动距离 */
  minDragDistance?: number
  /** 边缘检测距离 */
  edgeThreshold?: number
}

/** 鼠标位置 */
interface Point {
  x: number
  y: number
}

/** 边界信息 */
interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

// ==================== ViewportExtension ====================

export const ViewportExtension = createExtension<ViewportOptions>({
  name: 'viewport',
  type: 'extension',
  defaultOptions: {
    enabled: true,
    defaultZoom: 1.0,
    minZoom: 0.1,
    maxZoom: 5.0,
    zoomStep: 0.1,
    enableWheelZoom: true,
    enableDragMove: true,
    enableAutoMove: true,
    minDragDistance: 3,
    edgeThreshold: 20,
  },

  onCreate(ctx) {
    const opts = {
      enabled: true,
      defaultZoom: 1.0,
      minZoom: 0.1,
      maxZoom: 5.0,
      zoomStep: 0.1,
      enableWheelZoom: true,
      enableDragMove: true,
      enableAutoMove: true,
      minDragDistance: 3,
      edgeThreshold: 20,
    } as Required<ViewportOptions>

    // 注册命令
    const commands = createViewportCommands(opts)
    for (const [name, command] of Object.entries(commands)) {
      ctx.registerCommand(name, command)
    }

    // 初始化鼠标滚轮和拖拽
    const cleanupFns: (() => void)[] = []

    if (opts.enableWheelZoom || opts.enableDragMove) {
      const cleanup = setupViewportInteractions(ctx, opts)
      cleanupFns.push(cleanup)
    }

    // 返回清理函数
    return () => {
      for (const name of Object.keys(commands)) {
        ctx.unregisterCommand(name)
      }
      for (const cleanup of cleanupFns) {
        cleanup()
      }
    }
  },

  addKeyboardShortcuts() {
    return createViewportShortcuts()
  },
})

// ==================== 快捷键工厂 ====================

function createViewportShortcuts(): Record<string, KeyboardShortcutHandler> {
  return {
    // Mod-=: 放大
    'Mod-=': (ctx) => {
      return ctx.executeCommand('viewport.zoomIn')
    },

    // Mod--: 缩小
    'Mod--': (ctx) => {
      return ctx.executeCommand('viewport.zoomOut')
    },

    // Mod-0: 重置缩放
    'Mod-0': (ctx) => {
      return ctx.executeCommand('viewport.reset')
    },

    // Mod-9: 适应地图
    'Mod-9': (ctx) => {
      return ctx.executeCommand('viewport.fitMap')
    },
  }
}

// ==================== 视口交互设置 ====================

function setupViewportInteractions(ctx: ExtensionContext, opts: Required<ViewportOptions>): () => void {
  const cleanupFns: (() => void)[] = []

  // 等待 DOM 就绪
  // 注意：这里需要访问 DOM 容器，但 ExtensionContext 不直接暴露 DOM
  // 实际实现需要通过事件或配置获取 DOM 容器

  // 暂时返回空清理函数，实际实现需要集成 DOM 事件
  return () => {
    for (const cleanup of cleanupFns) {
      cleanup()
    }
  }
}

// ==================== 鼠标滚轮处理 ====================

/**
 * 设置鼠标滚轮缩放
 */
export function setupWheelZoom(
  dom: HTMLElement,
  ctx: ExtensionContext,
  opts: Required<ViewportOptions>
): () => void {
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()

    // 使用 Ctrl/Meta 键 + 滚轮进行缩放
    if (e.ctrlKey || e.metaKey) {
      const delta = -e.deltaY > 0 ? opts.zoomStep : -opts.zoomStep
      ctx.executeCommand('viewport.zoomIn', { step: delta })
    } else {
      // 普通滚轮移动视口
      ctx.executeCommand('viewport.moveDelta', {
        deltaX: -e.deltaX,
        deltaY: -e.deltaY,
      })
    }
  }

  dom.addEventListener('wheel', handleWheel, { passive: false })

  return () => {
    dom.removeEventListener('wheel', handleWheel)
  }
}

// ==================== 拖拽移动处理 ====================

/**
 * 设置拖拽移动视口
 */
export function setupDragMove(
  dom: HTMLElement,
  ctx: ExtensionContext,
  opts: Required<ViewportOptions>
): () => void {
  let isDragging = false
  let startPoint: Point | null = null
  let lastPoint: Point | null = null

  const handleMouseDown = (e: MouseEvent) => {
    // 只响应右键或中键拖拽
    if (e.button === 1 || e.button === 2) {
      isDragging = false
      startPoint = { x: e.clientX, y: e.clientY }
      lastPoint = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!startPoint) return

    const currentPoint = { x: e.clientX, y: e.clientY }
    const distance = getDistance(startPoint, currentPoint)

    if (distance >= opts.minDragDistance) {
      isDragging = true
    }

    if (isDragging && lastPoint) {
      const deltaX = currentPoint.x - lastPoint.x
      const deltaY = currentPoint.y - lastPoint.y

      ctx.executeCommand('viewport.moveDelta', { deltaX, deltaY })
    }

    lastPoint = currentPoint
  }

  const handleMouseUp = () => {
    isDragging = false
    startPoint = null
    lastPoint = null
  }

  dom.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  return () => {
    dom.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
}

// ==================== 自动移动处理 ====================

/**
 * 设置自动移动（分支超出视口时自动滚动）
 */
export function setupAutoMove(
  dom: HTMLElement,
  ctx: ExtensionContext,
  opts: Required<ViewportOptions>
): () => void {
  // 自动移动逻辑需要集成视口边界检测
  // 当分支超出可见区域时，自动移动视口

  // 暂时返回空清理函数，实际实现需要集成布局系统
  return () => {}
}

// ==================== 工具函数 ====================

function getDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

function isPointInBounds(point: Point, bounds: Bounds): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  )
}

// ==================== 命令工厂 ====================

function createViewportCommands(
  options: ViewportOptions
): Record<string, CommandFn> {
  const defaultZoom = options.defaultZoom ?? 1.0
  const minZoom = options.minZoom ?? 0.1
  const maxZoom = options.maxZoom ?? 5.0
  const zoomStep = options.zoomStep ?? 0.1

  return {
    /**
     * 缩放到指定比例
     */
    'viewport.zoom': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = args as { scale: number } | undefined
      if (!params) return false
      const sheetState = state as SheetState
      const scale = Math.max(minZoom, Math.min(maxZoom, params.scale))

      if (!dispatch) return true

      const tr = new Transaction(sheetState.doc)
      tr.append(new SetViewportStep(
        { x: sheetState.viewport.x, y: sheetState.viewport.y, zoom: scale },
        sheetState.viewport
      ))
      dispatch(tr)
      return true
    },

    /**
     * 放大
     */
    'viewport.zoomIn': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = args as { step?: number } | undefined
      const step = params?.step ?? zoomStep
      const sheetState = state as SheetState
      const newZoom = Math.min(maxZoom, sheetState.viewport.zoom + step)

      if (!dispatch) return true

      const tr = new Transaction(sheetState.doc)
      tr.append(new SetViewportStep(
        { x: sheetState.viewport.x, y: sheetState.viewport.y, zoom: newZoom },
        sheetState.viewport
      ))
      dispatch(tr)
      return true
    },

    /**
     * 缩小
     */
    'viewport.zoomOut': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = args as { step?: number } | undefined
      const step = params?.step ?? zoomStep
      const sheetState = state as SheetState
      const newZoom = Math.max(minZoom, sheetState.viewport.zoom - step)

      if (!dispatch) return true

      const tr = new Transaction(sheetState.doc)
      tr.append(new SetViewportStep(
        { x: sheetState.viewport.x, y: sheetState.viewport.y, zoom: newZoom },
        sheetState.viewport
      ))
      dispatch(tr)
      return true
    },

    /**
     * 移动到指定位置
     */
    'viewport.move': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = args as { x: number; y: number } | undefined
      if (!params) return false
      const sheetState = state as SheetState

      if (!dispatch) return true

      const tr = new Transaction(sheetState.doc)
      tr.append(new SetViewportStep(
        { x: params.x, y: params.y, zoom: sheetState.viewport.zoom },
        sheetState.viewport
      ))
      dispatch(tr)
      return true
    },

    /**
     * 移动增量
     */
    'viewport.moveDelta': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = args as { deltaX: number; deltaY: number } | undefined
      if (!params) return false
      const sheetState = state as SheetState

      if (!dispatch) return true

      const tr = new Transaction(sheetState.doc)
      tr.append(new SetViewportStep(
        {
          x: sheetState.viewport.x + params.deltaX,
          y: sheetState.viewport.y + params.deltaY,
          zoom: sheetState.viewport.zoom
        },
        sheetState.viewport
      ))
      dispatch(tr)
      return true
    },

    /**
     * 适应整个地图
     */
    'viewport.fitMap': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      if (!dispatch) return true

      const sheetState = state as SheetState
      const tr = new Transaction(sheetState.doc)
      tr.append(new SetViewportStep(
        { x: 0, y: 0, zoom: defaultZoom },
        sheetState.viewport
      ))
      dispatch(tr)
      return true
    },

    /**
     * 缩放适应指定区域
     */
    'viewport.zoomToFit': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = args as { bounds: { x: number; y: number; width: number; height: number } } | undefined
      if (!params) return false
      const sheetState = state as SheetState

      if (!dispatch) return true

      const zoom = Math.min(1, 800 / params.bounds.width, 600 / params.bounds.height)
      const offset = { x: -params.bounds.x * zoom, y: -params.bounds.y * zoom }

      const tr = new Transaction(sheetState.doc)
      tr.append(new SetViewportStep(
        { ...offset, zoom },
        sheetState.viewport
      ))
      dispatch(tr)
      return true
    },

    /**
     * 聚焦到中心
     */
    'viewport.focusCenter': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      if (!dispatch) return true

      const sheetState = state as SheetState
      const tr = new Transaction(sheetState.doc)
      tr.append(new SetViewportStep(
        { x: 0, y: 0, zoom: sheetState.viewport.zoom },
        sheetState.viewport
      ))
      dispatch(tr)
      return true
    },

    /**
     * 重置视口
     */
    'viewport.reset': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      if (!dispatch) return true

      const sheetState = state as SheetState
      const tr = new Transaction(sheetState.doc)
      tr.append(new SetViewportStep(
        { x: 0, y: 0, zoom: defaultZoom },
        sheetState.viewport
      ))
      dispatch(tr)
      return true
    },
  }
}
