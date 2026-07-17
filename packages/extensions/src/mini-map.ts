/**
 * MiniMapExtension — 小地图扩展
 *
 * 功能：
 * 1. 显示小地图
 * 2. 显示视口框
 * 3. 点击跳转
 * 4. 拖拽视口框
 *
 * 命令：
 * - miniMap.show: 显示小地图
 * - miniMap.hide: 隐藏小地图
 * - miniMap.toggle: 切换显示
 *
 * 配置：
 * - position: 位置（top-left, top-right, bottom-left, bottom-right）
 * - width: 宽度
 * - height: 高度
 * - padding: 边距
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext, CommandFn } from '@tomind/core'

// ==================== 类型定义 ====================

interface MiniMapOptions {
  [key: string]: unknown
  enabled?: boolean
  /** 位置 */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 边距 */
  padding?: number
}

/** 位置 */
interface Position {
  x: number
  y: number
}

/** 小地图视图 */
interface MiniMapView {
  container: HTMLElement
  canvas: HTMLCanvasElement
  viewBox: HTMLElement | null
  scaleValue: number
  mindMapScaleValue: number
}

// ==================== 常量 ====================

const DEFAULT_OPTIONS: Required<MiniMapOptions> = {
  enabled: true,
  position: 'bottom-right',
  width: 336,
  height: 208,
  padding: 28,
}

// ==================== MiniMapExtension ====================

export const MiniMapExtension = createExtension<MiniMapOptions>({
  name: 'miniMap',
  type: 'extension',
  defaultOptions: {
    enabled: true,
    position: 'bottom-right',
    width: 336,
    height: 208,
    padding: 28,
  },

  onCreate(ctx) {
    const opts = DEFAULT_OPTIONS as Required<MiniMapOptions>

    // 注册命令
    const commands = createCommands(ctx, opts)
    for (const [name, command] of Object.entries(commands)) {
      ctx.registerCommand(name, command)
    }

    // 创建视图
    const miniMapView = createMiniMapView(ctx, opts)

    // 监听事件
    const cleanup = bindEvents(ctx, miniMapView)

    // 返回清理函数
    return () => {
      for (const name of Object.keys(commands)) {
        ctx.unregisterCommand(name)
      }
      cleanup()
      removeMiniMapView(miniMapView)
    }
  },
})

// ==================== 命令工厂 ====================

function createCommands(
  ctx: ExtensionContext,
  options: Required<MiniMapOptions>
): Record<string, CommandFn> {
  let visible = false
  let miniMapView: MiniMapView | null = null

  return {
    /**
     * 显示小地图
     */
    'miniMap.show': (
      _state: unknown,
      _dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      if (visible) return false
      visible = true
      showMiniMap(miniMapView)
      return true
    },

    /**
     * 隐藏小地图
     */
    'miniMap.hide': (
      _state: unknown,
      _dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      if (!visible) return false
      visible = false
      hideMiniMap(miniMapView)
      return true
    },

    /**
     * 切换显示
     */
    'miniMap.toggle': (
      _state: unknown,
      _dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      visible = !visible
      if (visible) {
        showMiniMap(miniMapView)
      } else {
        hideMiniMap(miniMapView)
      }
      return true
    },
  }
}

// ==================== 视图创建 ====================

/**
 * 创建小地图视图
 */
function createMiniMapView(
  ctx: ExtensionContext,
  options: Required<MiniMapOptions>
): MiniMapView {
  // 创建 DOM 容器
  const container = document.createElement('div')
  container.style.cssText = `
    position: absolute;
    ${getPositionStyle(options.position, options.padding)};
    width: ${options.width}px;
    height: ${options.height}px;
    background: #fff;
    border: solid 4px rgba(255, 255, 255, 0.5);
    box-shadow: 0 3px 10px 0 rgba(43, 47, 51, 0.25);
    border-radius: 6px;
    cursor: pointer;
    display: none;
    overflow: hidden;
  `

  // 创建 canvas
  const canvas = document.createElement('canvas')
  canvas.width = options.width
  canvas.height = options.height
  canvas.style.cssText = `
    width: 100%;
    height: 100%;
  `
  container.appendChild(canvas)

  // 创建视口框
  const viewBox = document.createElement('div')
  viewBox.style.cssText = `
    position: absolute;
    border: 2px solid #2ebdff;
    background: rgba(46, 189, 255, 0.1);
    pointer-events: none;
  `
  container.appendChild(viewBox)

  // 添加到 DOM
  // 需要从 ctx 获取编辑器容器
  ctx.emit('miniMap:created', { container })

  return {
    container,
    canvas,
    viewBox,
    scaleValue: 1,
    mindMapScaleValue: 1,
  }
}

/**
 * 获取位置样式
 */
function getPositionStyle(
  position: string,
  padding: number
): string {
  switch (position) {
    case 'top-left':
      return `top: ${padding}px; left: ${padding}px`
    case 'top-right':
      return `top: ${padding}px; right: ${padding}px`
    case 'bottom-left':
      return `bottom: ${padding}px; left: ${padding}px`
    case 'bottom-right':
      return `bottom: ${padding}px; right: ${padding}px`
    default:
      return `bottom: ${padding}px; right: ${padding}px`
  }
}

/**
 * 显示小地图
 */
function showMiniMap(miniMapView: MiniMapView | null): void {
  if (!miniMapView) return
  miniMapView.container.style.display = ''
  // 触发更新
  miniMapView.container.dispatchEvent(new CustomEvent('show'))
}

/**
 * 隐藏小地图
 */
function hideMiniMap(miniMapView: MiniMapView | null): void {
  if (!miniMapView) return
  miniMapView.container.style.display = 'none'
}

/**
 * 移除小地图视图
 */
function removeMiniMapView(miniMapView: MiniMapView | null): void {
  if (!miniMapView) return
  miniMapView.container.remove()
}

// ==================== 事件绑定 ====================

/**
 * 绑定事件
 */
function bindEvents(
  ctx: ExtensionContext,
  miniMapView: MiniMapView
): () => void {
  const handleViewportChange = () => {
    updateViewBox(ctx, miniMapView)
  }

  const handleContentChange = () => {
    updateThumbnail(ctx, miniMapView)
  }

  const handleScaleChange = () => {
    updateScale(ctx, miniMapView)
  }

  // 点击跳转
  const handleClick = (e: MouseEvent) => {
    const rect = miniMapView.container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 计算在小地图中的位置比例
    const ratioX = x / rect.width
    const ratioY = y / rect.height

    // 触发跳转事件
    ctx.emit('miniMap:navigate', { ratioX, ratioY })
  }

  // 拖拽视口框
  let isDragging = false
  let startX = 0
  let startY = 0

  const handleMouseDown = (e: MouseEvent) => {
    isDragging = true
    startX = e.clientX
    startY = e.clientY
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const dx = e.clientX - startX
    const dy = e.clientY - startY
    startX = e.clientX
    startY = e.clientY

    // 计算在小地图中的位移比例
    const rect = miniMapView.container.getBoundingClientRect()
    const ratioDx = dx / rect.width
    const ratioDy = dy / rect.height

    // 触发拖拽事件
    ctx.emit('miniMap:drag', { ratioDx, ratioDy })
  }

  const handleMouseUp = () => {
    isDragging = false
  }

  // 注册事件
  ctx.on('viewportChange', handleViewportChange)
  ctx.on('contentChange', handleContentChange)
  ctx.on('scaleChange', handleScaleChange)

  miniMapView.container.addEventListener('click', handleClick)
  miniMapView.container.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  // 返回清理函数
  return () => {
    ctx.off('viewportChange', handleViewportChange)
    ctx.off('contentChange', handleContentChange)
    ctx.off('scaleChange', handleScaleChange)

    miniMapView.container.removeEventListener('click', handleClick)
    miniMapView.container.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
}

// ==================== 更新逻辑 ====================

/**
 * 更新视口框
 */
function updateViewBox(
  ctx: ExtensionContext,
  miniMapView: MiniMapView
): void {
  if (!miniMapView.viewBox) return

  // 请求视口信息
  ctx.emit('miniMap:requestViewport', (viewport: { x: number; y: number; width: number; height: number } | null) => {
    if (!viewport || !miniMapView.viewBox) return

    // 计算视口框在小地图中的位置和大小
    // 需要根据内容边界和缩放比例计算
    ctx.emit('miniMap:requestBounds', (bounds: { x: number; y: number; width: number; height: number } | null) => {
      if (!bounds || !miniMapView.viewBox) return

      const containerRect = miniMapView.container.getBoundingClientRect()
      const scaleX = containerRect.width / bounds.width
      const scaleY = containerRect.height / bounds.height
      const scale = Math.min(scaleX, scaleY)

      const viewX = (viewport.x - bounds.x) * scale
      const viewY = (viewport.y - bounds.y) * scale
      const viewWidth = viewport.width * scale
      const viewHeight = viewport.height * scale

      miniMapView.viewBox.style.left = `${viewX}px`
      miniMapView.viewBox.style.top = `${viewY}px`
      miniMapView.viewBox.style.width = `${viewWidth}px`
      miniMapView.viewBox.style.height = `${viewHeight}px`
    })
  })
}

/**
 * 更新缩略图
 */
function updateThumbnail(
  ctx: ExtensionContext,
  miniMapView: MiniMapView
): void {
  const canvas = miniMapView.canvas
  const ctx2d = canvas.getContext('2d')
  if (!ctx2d) return

  // 清空 canvas
  ctx2d.clearRect(0, 0, canvas.width, canvas.height)

  // 请求内容渲染
  ctx.emit('miniMap:requestRender', canvas)
}

/**
 * 更新缩放
 */
function updateScale(
  ctx: ExtensionContext,
  miniMapView: MiniMapView
): void {
  // 请求缩放信息
  ctx.emit('miniMap:requestScale', (scale: number | null) => {
    if (scale === null) return
    miniMapView.scaleValue = scale
    // 更新视口框
    updateViewBox(ctx, miniMapView)
  })
}
