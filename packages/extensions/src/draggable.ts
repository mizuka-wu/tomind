/**
 * DraggableExtension — 拖拽扩展
 *
 * 提供通用拖拽功能，支持：
 * - 鼠标/触摸事件
 * - 拖拽阈值
 * - 约束（边界限制或自定义函数）
 * - 回调：beforeDrag, dragStart, dragMove, dragEnd
 * - 拖拽影子（LeaferJS Group）
 */

import { createExtension } from '@tomind/core'
import type { CommandFn } from '@tomind/core'

// ==================== 类型定义 ====================

/** 拖拽约束 */
export type DragConstraint =
  | Partial<{
      minX: number
      minY: number
      maxX: number
      maxY: number
      x: number | boolean
      y: number | boolean
    }>
  | ((x: number, y: number) => { x: number; y: number })

/** 拖拽选项 */
export interface DraggableOptions {
  /** 拖拽阈值（像素） */
  threshold?: number
  /** 是否显示拖拽影子 */
  showShadow?: boolean
  /** 影子透明度 */
  shadowOpacity?: number
  /** 拖拽约束 */
  constraint?: DragConstraint
  /** 是否允许 mousedown 事件冒泡 */
  allowMouseDownPropagation?: boolean
  [key: string]: unknown
}

/** 拖拽位置信息 */
export interface DragPosition {
  /** 实际 x 坐标 */
  x: number
  /** 实际 y 坐标 */
  y: number
  /** 缩放比例 */
  zoom: number
}

/** 拖拽移动信息 */
export interface DragMoveInfo extends DragPosition {
  /** x 增量 */
  deltaX: number
  /** y 增量 */
  deltaY: number
}

/** 拖拽回调 */
export interface DragCallbacks {
  beforeDrag?: (event: MouseEvent | TouchEvent) => void
  dragStart?: (position: DragPosition, event: MouseEvent | TouchEvent) => void
  dragMove?: (info: DragMoveInfo, event: MouseEvent | TouchEvent) => void
  dragEnd?: (position: DragPosition, event: MouseEvent | TouchEvent) => void
}

// ==================== 常量 ====================

const DEFAULT_OPTIONS: Required<DraggableOptions> = {
  threshold: 5,
  showShadow: true,
  shadowOpacity: 0.7,
  constraint: {},
  allowMouseDownPropagation: false,
}

// ==================== 工具函数 ====================

function isTouchEvent(e: MouseEvent | TouchEvent): e is TouchEvent {
  return 'touches' in e
}

function getClientPosition(e: MouseEvent | TouchEvent): { x: number; y: number } {
  if (isTouchEvent(e)) {
    const touch = e.touches[0] || e.changedTouches[0]
    return { x: touch.clientX, y: touch.clientY }
  }
  return { x: e.clientX, y: e.clientY }
}

function isMouseEventFiredByTouch(e: MouseEvent): boolean {
  // 检查是否由触摸事件触发的鼠标事件
  return (e as any).sourceCapabilities?.firesTouchEvents === true
}

// ==================== DraggableRegister ====================

/**
 * 拖拽注册器
 *
 * 绑定到具体元素，处理拖拽逻辑
 */
export class DraggableRegister {
  private _element: any // LeaferJS Node
  private _options: Required<DraggableOptions>
  private _callbacks: DragCallbacks
  private _constraint: DragConstraint

  // 状态
  private _isDragging = false
  private _startPosition: DragPosition | null = null
  private _startClientPos: { x: number; y: number } | null = null
  private _isUseTouch = false

  // 拖拽影子
  private _shadow: any | null = null // LeaferJS Group

  // 事件处理器
  private _boundHandlers: {
    onMouseDown: (e: MouseEvent) => void
    onTouchStart: (e: TouchEvent) => void
    onMouseMove: (e: MouseEvent) => void
    onTouchMove: (e: TouchEvent) => void
    onMouseUp: (e: MouseEvent) => void
    onTouchEnd: (e: TouchEvent) => void
  }

  constructor(element: any, options: DraggableOptions = {}) {
    this._element = element
    this._options = { ...DEFAULT_OPTIONS, ...options }
    this._callbacks = {}
    this._constraint = this._options.constraint

    // 绑定事件处理器
    this._boundHandlers = {
      onMouseDown: this._onMouseDown.bind(this),
      onTouchStart: this._onTouchStart.bind(this),
      onMouseMove: this._onMouseMove.bind(this),
      onTouchMove: this._onTouchMove.bind(this),
      onMouseUp: this._onMouseUp.bind(this),
      onTouchEnd: this._onTouchEnd.bind(this),
    }

    // 初始化事件监听
    this._initEventListeners()
  }

  // ==================== 公共方法 ====================

  /** 设置 beforeDrag 回调 */
  beforeDrag(func: (event: MouseEvent | TouchEvent) => void): this {
    this._callbacks.beforeDrag = func
    return this
  }

  /** 设置 dragStart 回调 */
  dragStart(func: (position: DragPosition, event: MouseEvent | TouchEvent) => void): this {
    this._callbacks.dragStart = func
    return this
  }

  /** 设置 dragMove 回调 */
  dragMove(func: (info: DragMoveInfo, event: MouseEvent | TouchEvent) => void): this {
    this._callbacks.dragMove = func
    return this
  }

  /** 设置 dragEnd 回调 */
  dragEnd(func: (position: DragPosition, event: MouseEvent | TouchEvent) => void): this {
    this._callbacks.dragEnd = func
    return this
  }

  /** 更新约束 */
  updateConstraint(constraint: DragConstraint): this {
    this._constraint = constraint
    return this
  }

  /** 销毁拖拽注册器 */
  destroy(): void {
    this._removeEventListeners()
    this._removeShadow()
  }

  // ==================== 事件监听 ====================

  private _initEventListeners(): void {
    const el = this._element.node || this._element
    el.addEventListener('mousedown', this._boundHandlers.onMouseDown)
    el.addEventListener('touchstart', this._boundHandlers.onTouchStart)
  }

  private _removeEventListeners(): void {
    const el = this._element.node || this._element
    el.removeEventListener('mousedown', this._boundHandlers.onMouseDown)
    el.removeEventListener('touchstart', this._boundHandlers.onTouchStart)

    document.removeEventListener('mousemove', this._boundHandlers.onMouseMove)
    document.removeEventListener('touchmove', this._boundHandlers.onTouchMove)
    document.removeEventListener('mouseup', this._boundHandlers.onMouseUp)
    document.removeEventListener('touchend', this._boundHandlers.onTouchEnd)
  }

  // ==================== 事件处理 ====================

  private _onMouseDown(e: MouseEvent): void {
    if (isMouseEventFiredByTouch(e)) return
    this._isUseTouch = false
    this._handleDragStart(e)
  }

  private _onTouchStart(e: TouchEvent): void {
    this._isUseTouch = true
    this._handleDragStart(e)
  }

  private _onMouseMove(e: MouseEvent): void {
    if (this._isDragging) {
      this._handleDragMove(e)
    }
  }

  private _onTouchMove(e: TouchEvent): void {
    if (this._isDragging) {
      e.preventDefault() // 阻止滚动
      this._handleDragMove(e)
    }
  }

  private _onMouseUp(e: MouseEvent): void {
    if (this._isDragging) {
      this._handleDragEnd(e)
    }
  }

  private _onTouchEnd(e: TouchEvent): void {
    if (this._isDragging) {
      this._handleDragEnd(e)
    }
  }

  // ==================== 拖拽逻辑 ====================

  private _handleDragStart(e: MouseEvent | TouchEvent): void {
    e.stopPropagation()

    const clientPos = getClientPosition(e)
    const threshold = this._options.threshold

    // 如果阈值为 0，直接开始拖拽
    if (threshold === 0) {
      this._startDrag(e, clientPos)
      return
    }

    // 记录起始位置，等待阈值判断
    this._startClientPos = clientPos

    // 添加临时事件监听
    const moveEvent = this._isUseTouch ? 'touchmove' : 'mousemove'
    const endEvent = this._isUseTouch ? 'touchend' : 'mouseup'

    const thresholdHandler = (moveE: MouseEvent | TouchEvent) => {
      const currentPos = getClientPosition(moveE)
      const deltaX = currentPos.x - clientPos.x
      const deltaY = currentPos.y - clientPos.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (distance >= threshold) {
        // 达到阈值，开始拖拽
        document.removeEventListener(moveEvent, thresholdHandler as any)
        document.removeEventListener(endEvent, thresholdEndHandler as any)
        this._startDrag(e, clientPos)
      }
    }

    const thresholdEndHandler = () => {
      document.removeEventListener(moveEvent, thresholdHandler as any)
      document.removeEventListener(endEvent, thresholdEndHandler as any)
    }

    document.addEventListener(moveEvent, thresholdHandler as any, { passive: false })
    document.addEventListener(endEvent, thresholdEndHandler as any)
  }

  private _startDrag(e: MouseEvent | TouchEvent, clientPos: { x: number; y: number }): void {
    this._isDragging = true

    // 调用 beforeDrag 回调
    if (this._callbacks.beforeDrag) {
      this._callbacks.beforeDrag(e)
    }

    // 计算元素的起始位置
    const element = this._element
    const bbox = element.bbox ? element.bbox() : { x: element.x(), y: element.y() }

    this._startPosition = {
      x: bbox.x,
      y: bbox.y,
      zoom: this._calculateZoom(),
    }

    this._startClientPos = clientPos

    // 创建拖拽影子
    if (this._options.showShadow) {
      this._createShadow()
    }

    // 添加文档级事件监听
    const moveEvent = this._isUseTouch ? 'touchmove' : 'mousemove'
    const endEvent = this._isUseTouch ? 'touchend' : 'mouseup'

    document.addEventListener(moveEvent, this._isUseTouch
      ? this._boundHandlers.onTouchMove as any
      : this._boundHandlers.onMouseMove as any,
      { passive: false }
    )
    document.addEventListener(endEvent, this._isUseTouch
      ? this._boundHandlers.onTouchEnd as any
      : this._boundHandlers.onMouseUp as any
    )

    // 调用 dragStart 回调
    if (this._callbacks.dragStart) {
      this._callbacks.dragStart(this._startPosition, e)
    }
  }

  private _handleDragMove(e: MouseEvent | TouchEvent): void {
    e.preventDefault()

    if (!this._startPosition || !this._startClientPos) return

    const clientPos = getClientPosition(e)
    const deltaX = clientPos.x - this._startClientPos.x
    const deltaY = clientPos.y - this._startClientPos.y

    // 计算新位置
    let newX = this._startPosition.x + deltaX / this._startPosition.zoom
    let newY = this._startPosition.y + deltaY / this._startPosition.zoom

    // 应用约束
    const constrained = this._applyConstraint(newX, newY)
    newX = constrained.x
    newY = constrained.y

    // 更新影子位置
    if (this._shadow) {
      this._shadow.x(newX)
      this._shadow.y(newY)
    }

    // 调用 dragMove 回调
    if (this._callbacks.dragMove) {
      this._callbacks.dragMove({
        x: newX,
        y: newY,
        deltaX: deltaX / this._startPosition.zoom,
        deltaY: deltaY / this._startPosition.zoom,
        zoom: this._startPosition.zoom,
      }, e)
    }
  }

  private _handleDragEnd(e: MouseEvent | TouchEvent): void {
    this._isDragging = false

    const clientPos = getClientPosition(e)
    const deltaX = clientPos.x - this._startClientPos!.x
    const deltaY = clientPos.y - this._startClientPos!.y

    // 计算最终位置
    let finalX = this._startPosition!.x + deltaX / this._startPosition!.zoom
    let finalY = this._startPosition!.y + deltaY / this._startPosition!.zoom

    // 应用约束
    const constrained = this._applyConstraint(finalX, finalY)
    finalX = constrained.x
    finalY = constrained.y

    // 移除影子
    this._removeShadow()

    // 移除文档级事件监听
    document.removeEventListener('mousemove', this._boundHandlers.onMouseMove as any)
    document.removeEventListener('touchmove', this._boundHandlers.onTouchMove as any)
    document.removeEventListener('mouseup', this._boundHandlers.onMouseUp as any)
    document.removeEventListener('touchend', this._boundHandlers.onTouchEnd as any)

    // 调用 dragEnd 回调
    if (this._callbacks.dragEnd) {
      this._callbacks.dragEnd({
        x: finalX,
        y: finalY,
        zoom: this._startPosition!.zoom,
      }, e)
    }

    // 重置状态
    this._startPosition = null
    this._startClientPos = null
  }

  // ==================== 约束 ====================

  private _applyConstraint(x: number, y: number): { x: number; y: number } {
    const constraint = this._constraint

    if (typeof constraint === 'function') {
      return constraint(x, y)
    }

    if (typeof constraint === 'object') {
      let resultX = x
      let resultY = y

      if (constraint.minX !== undefined && resultX < constraint.minX) {
        resultX = constraint.minX
      }
      if (constraint.maxX !== undefined && resultX > constraint.maxX) {
        resultX = constraint.maxX
      }
      if (constraint.minY !== undefined && resultY < constraint.minY) {
        resultY = constraint.minY
      }
      if (constraint.maxY !== undefined && resultY > constraint.maxY) {
        resultY = constraint.maxY
      }

      if (constraint.x === false) {
        return { x: this._startPosition!.x, y: resultY }
      }
      if (constraint.y === false) {
        return { x: resultX, y: this._startPosition!.y }
      }

      return { x: resultX, y: resultY }
    }

    return { x, y }
  }

  // ==================== 缩放计算 ====================

  private _calculateZoom(): number {
    // 计算元素的缩放比例
    // 遍历父元素的 transform 来计算累积缩放
    let zoom = 1
    const element = this._element

    // LeaferJS 的缩放计算：沿 parent 链向上累乘 scaleX
    let current: any = element
    while (current) {
      if (current.scaleX !== undefined && current.scaleX !== 1) {
        zoom *= current.scaleX
      }
      current = current.parent
    }

    return zoom
  }

  // ==================== 拖拽影子 ====================

  private _createShadow(): void {
    // LeaferJS 实现：克隆元素作为影子
    // 需要访问 LeaferJS API
    const element = this._element

    // 克隆元素
    if (element.clone) {
      this._shadow = element.clone()
      this._shadow.opacity = this._options.shadowOpacity

      // 添加到父容器
      if (element.parent) {
        element.parent.add(this._shadow)
      }
    }
  }

  private _removeShadow(): void {
    if (this._shadow) {
      this._shadow.destroy()
      this._shadow = null
    }
  }
}

// ==================== DraggableExtension ====================

export const DraggableExtension = createExtension<DraggableOptions>({
  name: 'draggable',
  type: 'extension',
  defaultOptions: { ...DEFAULT_OPTIONS },

  addOptions() {
    return { ...DEFAULT_OPTIONS }
  },

  onCreate(ctx) {
    // 注册命令
    const commands: Record<string, CommandFn> = {
      'draggable.bind': (_state, _dispatch, args) => {
        const { element, options } = args as { element: any; options?: DraggableOptions }
        const register = new DraggableRegister(element, options)
        // 返回 register 实例供调用者使用
        return register as any
      },
    }

    for (const [name, command] of Object.entries(commands)) {
      ctx.registerCommand(name, command)
    }

    return () => {
      for (const name of Object.keys(commands)) {
        ctx.unregisterCommand(name)
      }
    }
  },
})
