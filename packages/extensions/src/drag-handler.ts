/**
 * DragHandlerExtension — 内部节点拖拽扩展
 *
 * 处理思维导图内部节点的拖拽移动：
 * - 分支拖拽（attached/detached）
 * - 浮动分支拖拽（free position）
 * - 标注拖拽（callout）
 * - 图片拖拽
 * - 矩阵标签拖拽
 * - MathJax 拖拽
 */

import { createExtension } from '@tomind/core'
import type { CommandFn } from '@tomind/core'

// ==================== 类型定义 ====================

interface DragHandlerOptions {
  enabled?: boolean
  threshold?: number
  draggingOpacity?: number
  moveStep?: number
  [key: string]: unknown
}

interface DragTransferData {
  position: { x: number; y: number }
  draggedView: any
  dropView: any
  selections: any[]
  keyPress: { shiftKey: boolean; altKey: boolean }
  [key: string]: any
}

interface IDragHandler {
  dragStart(data: DragTransferData): Partial<DragTransferData> | void
  dragMoving(data: DragTransferData): void
  dragFinish(data: DragTransferData): void
  dragCancel(): boolean
  getDragOverView(data: DragTransferData): any | null
}

type DragHandlerConstructor = new (context: DragHandlerContext) => IDragHandler

interface DragHandlerContext {
  getWorkbookEditor: () => any
  getSheetEditor: () => any
  getCentralBranch: () => any
  getSelectionManager: () => any
  emit: (event: string, ...args: any[]) => void
}

// ==================== 工具函数 ====================

function filterMultiSelectedBranches(selections: any[]): any[] {
  return selections.filter((view) => {
    if (!view || !view.node) return false
    return view.node.type === 'topic' || view.node.type === 'root'
  })
}

function isFreePositionBranch(view: any): boolean {
  return view?.node?.attrs?.position !== undefined
}

function isCalloutBranch(view: any): boolean {
  return view?.node?.attrs?.type === 'callout'
}

function isDetachedBranch(view: any): boolean {
  return view?.node?.parent === undefined || isFreePositionBranch(view)
}

function relativePositionFor(
  pos: { x: number; y: number },
  base: { x: number; y: number }
): { x: number; y: number } {
  return { x: pos.x - base.x, y: pos.y - base.y }
}

function isPointInPolygon(
  point: { x: number; y: number },
  polygon: { x: number; y: number }[]
): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y
    const intersect = yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function forEachBranch(branch: any, callback: (branch: any) => void): void {
  if (!branch) return
  const traverse = (node: any) => {
    if (!node) return
    const children = node.getChildrenBranches?.() || []
    for (const child of children) traverse(child)
    callback(node)
  }
  traverse(branch)
}

function forEachBranchArray(branches: any[], callback: (branch: any) => boolean): void {
  for (const branch of branches) {
    if (callback(branch)) return
  }
}

// ==================== BaseDragHandler ====================

class BaseDragHandler implements IDragHandler {
  protected context: DragHandlerContext
  protected centralBranch: any

  constructor(context: DragHandlerContext) {
    this.context = context
    this.centralBranch = context.getCentralBranch()
  }

  dragStart(_data: DragTransferData): Partial<DragTransferData> | void {}
  dragMoving(_data: DragTransferData): void {}
  dragFinish(_data: DragTransferData): void {}
  dragCancel(): boolean { return false }
  getDragOverView(_data: DragTransferData): any | null { return null }
}

// ==================== BranchDragHandler ====================

class BranchDragHandler extends BaseDragHandler {
  protected _draggedViews: any[] = []
  protected _draggedViewOldIndex: number | null = null
  protected _draggedViewOldParentView: any = null
  protected _draggedViewNewIndex: number | null = null
  protected _draggedViewNewParentView: any = null
  protected _isFreePositionBranch = false
  protected _isCurrentAddToRight = false
  protected _isDuplicate = false
  protected _noChangeIfDropping = false
  protected _currentPolygon: any = null
  protected _relatedDraggingViewsSet = new Set<any>()
  protected _isSelectionBranchStable = true
  protected _isSelectionBranchStableDirty = false

  dragStart(data: DragTransferData): Partial<DragTransferData> | void {
    this.context.emit('drag:branch:start')
    this._draggedViews = data.selections ?? []
    this._draggedViewOldIndex = this._getBranchIndex(data.draggedView)
    this._draggedViewOldParentView = isDetachedBranch(data.draggedView)
      ? null : this._getParentView(data.draggedView)
    this._isFreePositionBranch = isFreePositionBranch(data.draggedView)
    this._isDuplicate = data.keyPress.altKey
    this._relatedDraggingViewsSet = this._getRelatedDraggingViewsSet(this._draggedViews)
    this._noChangeIfDropping = false
    this._setIsSelectionBranchStable(false)
    return data
  }

  dragMoving(data: DragTransferData): void {
    const { dropView, position, keyPress } = data
    const disableAttaching = keyPress.shiftKey
      ? !this._isFreePositionBranch : this._isFreePositionBranch
    const noDropView = dropView === null

    if (disableAttaching || noDropView) {
      this._clearDropInfo()
      return
    }

    const newIndex = this._getTargetIndex(dropView, position)
    const structure = dropView.getStructureClass?.() || ''
    const isAnticlockwise = structure.includes('anticlockwise')
    let isAddToRight = this._currentPolygon?.side === 'right'
    if (isAnticlockwise) isAddToRight = !isAddToRight

    this._updatePlaceholder(dropView, newIndex, isAddToRight)
    this._draggedViewNewParentView = dropView
    this._draggedViewNewIndex = newIndex
    this._isCurrentAddToRight = isAddToRight
  }

  dragCancel(): boolean {
    this._setIsSelectionBranchStable(true)
    this._clearDropInfo()
    this.context.emit('drag:branch:end')
    return true
  }

  dragFinish(data: DragTransferData): void {
    this.context.emit('drag:branch:end')
    this._setIsSelectionBranchStable(true)

    if (this._noChangeIfDropping) return

    if (!this._draggedViewNewParentView) {
      if (!this._isDuplicate) this._removeDraggedViews()
      this._mountAsDetached(data.position)
    } else if (this._isFreePositionBranch) {
      if (!this._isDuplicate) this._removeDraggedViews()
      this._mountAsFreePosition(this._draggedViewNewParentView, {
        at: this._draggedViewNewIndex!,
        position: data.position,
        addToRight: this._isCurrentAddToRight,
      })
    } else {
      const newIndex = this._getNewTargetIndex()
      if (!this._isDuplicate) this._removeDraggedViews()
      this._mountAsAttach(this._draggedViewNewParentView, {
        at: newIndex,
        addToRight: this._isCurrentAddToRight,
      })
    }
  }

  getDragOverView(data: DragTransferData): any | null {
    const { position } = data
    const rootView = this.centralBranch
    let targetView: any = null

    const checkIsInBranchPolygonArea = (branchView: any): boolean => {
      if (!branchView) return false
      if (this._relatedDraggingViewsSet.has(branchView)) return false

      const basedPosition = this._getRealPosition(branchView)
      const relativePos = relativePositionFor(position, basedPosition)
      const polygonPointsArray = this._getPolyPointsArr(branchView)

      for (const polygon of polygonPointsArray) {
        if (isPointInPolygon(relativePos, polygon.pointList)) {
          this._currentPolygon = polygon
          targetView = branchView
          return true
        }
      }
      return false
    }

    forEachBranchArray([rootView], checkIsInBranchPolygonArea)
    return targetView
  }

  protected _getBranchIndex(view: any): number {
    if (!view?.node) return -1
    const parent = view.node.parent
    if (!parent) return -1
    const childrenKey = view.node.attrs?.type === 'callout' ? 'callout' : 'main'
    const children = parent.children?.[childrenKey] || []
    return children.indexOf(view.node)
  }

  protected _getParentView(_view: any): any {
    return null
  }

  protected _getRelatedDraggingViewsSet(selections: any[]): Set<any> {
    const result = new Set<any>()
    for (const view of selections) {
      result.add(view)
      forEachBranch(view, (branch) => result.add(branch))
    }
    return result
  }

  protected _setIsSelectionBranchStable(isStable: boolean): void {
    if (this._isSelectionBranchStable !== isStable) {
      this._isSelectionBranchStable = isStable
      this._isSelectionBranchStableDirty = true
    }
    if (this._isSelectionBranchStableDirty) {
      this._updateSelectionBranchOpacity()
      this._isSelectionBranchStableDirty = false
    }
  }

  protected _updateSelectionBranchOpacity(): void {
    const opacity = this._isSelectionBranchStable ? 1 : 0.5
    this._relatedDraggingViewsSet.forEach((view: any) => {
      if (view.opacity !== undefined) view.opacity = opacity
    })
  }

  protected _clearDropInfo(): void {
    this._draggedViewNewParentView = null
    this._draggedViewNewIndex = null
  }

  protected _updatePlaceholder(dropView: any, index: number, addToRight: boolean): void {
    this._noChangeIfDropping = this._predictIfResultIsStable(dropView, index)
    if (this._noChangeIfDropping) {
      this._setIsSelectionBranchStable(true)
    } else {
      this._setIsSelectionBranchStable(false)
      this.context.emit('drag:branch:placeholder:update', { dropView, index, addToRight })
    }
  }

  protected _predictIfResultIsStable(dropView: any, dropIndex: number): boolean {
    if (this._draggedViews.length > 1) return false
    const dropToSameParent = dropView === this._draggedViewOldParentView
    const dropToSamePosition = dropIndex === this._draggedViewOldIndex ||
      dropIndex === this._draggedViewOldIndex! + 1
    return dropToSameParent && dropToSamePosition
  }

  protected _getTargetIndex(dropView: any, position: { x: number; y: number }): number {
    const children = dropView.getChildrenBranches?.() || []
    if (children.length === 0) return 0
    for (let i = 0; i < children.length; i++) {
      const childPos = this._getRealPosition(children[i])
      if (position.y < childPos.y) return i
    }
    return children.length
  }

  protected _getNewTargetIndex(): number {
    if (this._draggedViews.length > 1) {
      const children = this._draggedViewNewParentView?.getChildrenBranches?.() || []
      const restChildren = children.filter((child: any) => !this._draggedViews.includes(child))
      const sortedIndices = restChildren
        .map((child: any) => this._getBranchIndex(child))
        .sort((a: number, b: number) => a - b)
      for (let i = 0; i < sortedIndices.length; i++) {
        if (sortedIndices[i] >= this._draggedViewNewIndex!) return i
      }
      return sortedIndices.length
    } else if (this._draggedViewNewParentView !== this._draggedViewOldParentView) {
      return this._draggedViewNewIndex!
    } else if (this._draggedViewNewIndex! > this._draggedViewOldIndex!) {
      return this._draggedViewNewIndex! - 1
    } else {
      return this._draggedViewNewIndex!
    }
  }

  protected _getRealPosition(view: any): { x: number; y: number } {
    return view.getRealPosition?.() || { x: 0, y: 0 }
  }

  protected _getPolyPointsArr(view: any): any[] {
    return view.getPolyPointsArr?.() || []
  }

  protected _removeDraggedViews(): void {
    const sheetEditor = this.context.getSheetEditor()
    if (!sheetEditor) return
    for (const view of this._draggedViews) {
      if (view.node) {
        sheetEditor.dispatch({ type: 'removeNode', payload: { id: view.node.id } })
      }
    }
  }

  protected _mountAsDetached(position: { x: number; y: number }): void {
    this.context.emit('drag:branch:mount:detached', {
      views: this._draggedViews, position, isDuplicate: this._isDuplicate,
    })
  }

  protected _mountAsFreePosition(parentView: any, options: { at: number; position: { x: number; y: number }; addToRight: boolean }): void {
    this.context.emit('drag:branch:mount:free', {
      views: this._draggedViews, parentView, ...options, isDuplicate: this._isDuplicate,
    })
  }

  protected _mountAsAttach(parentView: any, options: { at: number; addToRight: boolean }): void {
    this.context.emit('drag:branch:mount:attach', {
      views: this._draggedViews, parentView, ...options, isDuplicate: this._isDuplicate,
    })
  }
}

// ==================== FreeBranchDragHandler ====================

class FreeBranchDragHandler extends BranchDragHandler {
  constructor(context: DragHandlerContext) {
    super(context)
    this._isFreePositionBranch = true
  }

  dragStart(data: DragTransferData): Partial<DragTransferData> | void {
    const result = super.dragStart(data)
    this._setIsSelectionBranchStable(false)
    return result
  }

  dragMoving(data: DragTransferData): void {
    const { dropView, draggedView, position, keyPress } = data
    const index = this._getBranchIndex(draggedView)
    const addToRight = position.x > 0

    if (keyPress.shiftKey) {
      this._draggedViewNewParentView = null
      this._draggedViewNewIndex = -1
      this._isCurrentAddToRight = false
    } else {
      this._draggedViewNewParentView = dropView
      this._draggedViewNewIndex = index
      this._isCurrentAddToRight = addToRight
    }

    this.context.emit('drag:branch:placeholder:update', {
      dropView: this._draggedViewNewParentView,
      index: this._draggedViewNewIndex,
      addToRight: this._isCurrentAddToRight,
      freePosition: keyPress.shiftKey ? null : position,
    })
  }

  getDragOverView(data: DragTransferData): any | null {
    const { position } = data
    const dropView = this.centralBranch
    const basedPosition = this._getRealPosition(dropView)
    const relativePos = relativePositionFor(position, basedPosition)
    const cloneViewSide = relativePos.x < 0 ? 'left' : 'right'
    const polygonPointsArray = this._getPolyPointsArr(dropView)
    this._currentPolygon = polygonPointsArray.find((polygon: any) => polygon.side === cloneViewSide)
    return dropView
  }
}

// ==================== CalloutDragHandler ====================

class CalloutDragHandler extends BaseDragHandler {
  dragFinish(data: DragTransferData): void {
    const { draggedView, position } = data
    if (!draggedView?.node) return
    const parentPos = { x: 0, y: 0 }
    const newPosition = relativePositionFor(position, parentPos)
    const sheetEditor = this.context.getSheetEditor()
    if (sheetEditor) {
      sheetEditor.dispatch({
        type: 'updateNode',
        payload: { id: draggedView.node.id, attrs: { ...draggedView.node.attrs, position: newPosition } },
      })
    }
  }
}

// ==================== 其他处理器 ====================

class ImageDragHandler extends BaseDragHandler {
  dragFinish(data: DragTransferData): void {
    if (!data.draggedView || !data.dropView) return
    this.context.emit('drag:image:move', data)
  }
}

class MatrixLabelDragHandler extends BaseDragHandler {
  dragFinish(data: DragTransferData): void {
    if (!data.draggedView || !data.dropView) return
    this.context.emit('drag:matrix-label:move', data)
  }
}

class MathJaxDragHandler extends BaseDragHandler {
  dragFinish(data: DragTransferData): void {
    if (!data.draggedView || !data.dropView) return
    this.context.emit('drag:mathjax:move', data)
  }
}

// ==================== DragHandlerManager ====================

class DragHandlerManager {
  private _context: DragHandlerContext
  private _options: Required<DragHandlerOptions>
  private _handler: IDragHandler | null = null
  private _transferData: Partial<DragTransferData> = {}
  private _prePosition = { x: 0, y: 0 }
  private _keyPress = { shiftKey: false, altKey: false }
  private _dragSelections: any[] = []
  private _originalDragSelections: any[] = []
  private _handlerMap = new Map<string, DragHandlerConstructor>()

  constructor(context: DragHandlerContext, options: DragHandlerOptions = {}) {
    this._context = context
    this._options = { enabled: true, threshold: 5, draggingOpacity: 0.5, moveStep: 10, ...options }
    this._registerDefaultHandlers()
  }

  registerHandler(type: string, handler: DragHandlerConstructor): void {
    this._handlerMap.set(type, handler)
  }

  prepareStartDrag(event: MouseEvent | TouchEvent, view: any): void {
    const sheetEditor = this._context.getSheetEditor()
    if (sheetEditor?.isReadOnly?.()) return

    const selectionManager = this._context.getSelectionManager()
    this._originalDragSelections = selectionManager?.getSelections?.() || []
    this._dragSelections = filterMultiSelectedBranches(this._originalDragSelections)

    const clientPos = this._getClientPosition(event)

    this._waitDragThreshold(event, clientPos, (startPosition) => {
      const isUseTouch = 'touches' in event
      const mouseRealPosition = startPosition
      this._startDrag(view, mouseRealPosition, event)

      const moveEvent = isUseTouch ? 'touchmove' : 'mousemove'
      const endEvent = isUseTouch ? 'touchend' : 'mouseup'

      const onMove = (e: MouseEvent | TouchEvent) => {
        this._onDragViewMoving(this._getClientPosition(e))
      }

      const onEnd = (e: MouseEvent | TouchEvent) => {
        this._onDragViewFinish(this._getClientPosition(e))
        document.removeEventListener(moveEvent, onMove as any)
        document.removeEventListener(endEvent, onEnd as any)
      }

      document.addEventListener(moveEvent, onMove as any, { passive: false })
      document.addEventListener(endEvent, onEnd as any)

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          this.dragCancel()
          document.removeEventListener('keydown', onKeyDown)
          document.removeEventListener('keyup', onKeyUp)
        }
        this._keyPress = { shiftKey: e.shiftKey, altKey: e.altKey }
        this._transferData.keyPress = { ...this._keyPress }
        this._triggerDragMoving()
      }

      const onKeyUp = (e: KeyboardEvent) => {
        this._keyPress = { shiftKey: e.shiftKey, altKey: e.altKey }
        this._transferData.keyPress = { ...this._keyPress }
        this._triggerDragMoving()
      }

      document.addEventListener('keydown', onKeyDown)
      document.addEventListener('keyup', onKeyUp)
    })
  }

  dragCancel(): void {
    if (!this._handler) return
    if (this._handler.dragCancel()) {
      this._reset()
    }
  }

  private _registerDefaultHandlers(): void {
    this._handlerMap.set('branch.attached', BranchDragHandler)
    this._handlerMap.set('branch.detached', BranchDragHandler)
    this._handlerMap.set('branch.free', FreeBranchDragHandler)
    this._handlerMap.set('branch.callout', CalloutDragHandler)
    this._handlerMap.set('image', ImageDragHandler)
    this._handlerMap.set('matrix-label', MatrixLabelDragHandler)
    this._handlerMap.set('mathjax', MathJaxDragHandler)
  }

  private _getHandlerKey(view: any): string {
    if (!view?.node) return 'unknown'
    const nodeType = view.node.type
    if (nodeType === 'topic') {
      if (isFreePositionBranch(view)) return 'branch.free'
      if (isCalloutBranch(view)) return 'branch.callout'
      if (isDetachedBranch(view)) return 'branch.detached'
      return 'branch.attached'
    }
    return nodeType
  }

  private _waitDragThreshold(
    event: MouseEvent | TouchEvent,
    clientPos: { x: number; y: number },
    callback: (startPosition: { x: number; y: number }) => void
  ): void {
    const threshold = this._options.threshold
    if (threshold === 0) { callback(clientPos); return }

    const isTouch = 'touches' in event
    const moveEvent = isTouch ? 'touchmove' : 'mousemove'
    const endEvent = isTouch ? 'touchend' : 'mouseup'

    const onMove = (e: MouseEvent | TouchEvent) => {
      const currentPos = this._getClientPosition(e)
      const deltaX = currentPos.x - clientPos.x
      const deltaY = currentPos.y - clientPos.y
      if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) >= threshold) {
        document.removeEventListener(moveEvent, onMove as any)
        document.removeEventListener(endEvent, onEnd as any)
        callback(clientPos)
      }
    }

    const onEnd = () => {
      document.removeEventListener(moveEvent, onMove as any)
      document.removeEventListener(endEvent, onEnd as any)
    }

    document.addEventListener(moveEvent, onMove as any, { passive: false })
    document.addEventListener(endEvent, onEnd as any)
  }

  private _startDrag(view: any, mouseRealPosition: { x: number; y: number }, event: MouseEvent | TouchEvent): void {
    const HandlerClass = this._handlerMap.get(this._getHandlerKey(view))
    if (!HandlerClass) return

    this._handler = new HandlerClass(this._context)
    this._transferData = {
      event,
      position: mouseRealPosition,
      draggedView: view,
      dropView: null,
      selections: this._getFinalDragSelections(view),
      keyPress: { ...this._keyPress },
    }

    const startData = this._handler.dragStart(this._transferData as DragTransferData)
    if (startData) Object.assign(this._transferData, startData)
  }

  private _onDragViewMoving(mouseRealPosition: { x: number; y: number }): void {
    if (
      Math.abs(this._prePosition.x - mouseRealPosition.x) < this._options.moveStep &&
      Math.abs(this._prePosition.y - mouseRealPosition.y) < this._options.moveStep
    ) return

    this._prePosition = { ...mouseRealPosition }
    this._transferData.position = { ...mouseRealPosition }
    this._transferData.dropView = this._handler?.getDragOverView(this._transferData as DragTransferData)
    this._transferData.keyPress = { ...this._keyPress }
    this._triggerDragMoving()
  }

  private _onDragViewFinish(mouseRealPosition: { x: number; y: number }): void {
    this._transferData.position = mouseRealPosition
    this._handler?.dragFinish(this._transferData as DragTransferData)
    this._reset()
  }

  private _triggerDragMoving(): void {
    this._handler?.dragMoving(this._transferData as DragTransferData)
  }

  private _reset(): void {
    this._handler = null
    this._transferData = {}
    this._keyPress = { shiftKey: false, altKey: false }
    this._originalDragSelections = []
    this._dragSelections = []
  }

  private _getFinalDragSelections(view: any): any[] {
    let selections = [...this._dragSelections]
    if (!view?.node) selections = []
    else if (isCalloutBranch(view)) selections = []
    else if (!selections.includes(view)) selections = [view]
    return selections
  }

  private _getClientPosition(e: MouseEvent | TouchEvent): { x: number; y: number } {
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0]
      return { x: touch.clientX, y: touch.clientY }
    }
    return { x: e.clientX, y: e.clientY }
  }
}

// ==================== DragHandlerExtension ====================

export const DragHandlerExtension = createExtension<DragHandlerOptions>({
  name: 'drag-handler',
  type: 'extension',
  defaultOptions: {
    enabled: true,
    threshold: 5,
    draggingOpacity: 0.5,
    moveStep: 10,
  },

  onCreate(ctx) {
    // 创建拖拽处理器上下文
    const handlerContext: DragHandlerContext = {
      getWorkbookEditor: () => ctx.getWorkbook(),
      getSheetEditor: () => (ctx.getWorkbook() as any).currentSheetEditor,
      getCentralBranch: () => null,
      getSelectionManager: () => null,
      emit: (event, ...args) => ctx.emit(event, ...args),
    }

    // 创建管理器
    const manager = new DragHandlerManager(handlerContext)

    // 注册命令
    const commands: Record<string, CommandFn> = {
      'dragHandler.bind': (_state, _dispatch, args) => {
        const payload = args as { element: any }
        if (!payload?.element) return false
        const onPointerDown = (e: PointerEvent) => {
          manager.prepareStartDrag(e, payload.element)
        }
        payload.element.on?.('pointerdown', onPointerDown)
        return true
      },
      'dragHandler.cancel': () => {
        manager.dragCancel()
        return true
      },
    }

    for (const [name, command] of Object.entries(commands)) {
      ctx.registerCommand(name, command)
    }

    // 监听事件
    const handlePlaceholderUpdate = (data: unknown) => ctx.emit('indicator:update', data)

    const handleMountDetached = (data: unknown) => {
      const payload = data as { views: any[]; position: { x: number; y: number } }
      const sheetEditor = (ctx.getWorkbook() as any).currentSheetEditor
      if (!sheetEditor) return
      for (const view of payload.views) {
        sheetEditor.dispatch({
          type: 'insertNode',
          payload: {
            node: {
              type: 'topic',
              attrs: { ...view.node.attrs, position: payload.position },
              children: view.node.children,
            },
          },
        })
      }
    }

    const handleMountAttach = (data: unknown) => {
      const payload = data as { views: any[]; parentView: any; at: number }
      const sheetEditor = (ctx.getWorkbook() as any).currentSheetEditor
      if (!sheetEditor || !payload.parentView?.node) return
      for (const view of payload.views) {
        sheetEditor.dispatch({
          type: 'insertNode',
          payload: {
            parentId: payload.parentView.node.id,
            at: payload.at,
            node: { type: 'topic', attrs: view.node.attrs, children: view.node.children },
          },
        })
      }
    }

    const handleMountFree = (data: unknown) => {
      const payload = data as { views: any[]; parentView: any; at: number; position: { x: number; y: number } }
      const sheetEditor = (ctx.getWorkbook() as any).currentSheetEditor
      if (!sheetEditor || !payload.parentView?.node) return
      for (const view of payload.views) {
        sheetEditor.dispatch({
          type: 'insertNode',
          payload: {
            parentId: payload.parentView.node.id,
            at: payload.at,
            node: {
              type: 'topic',
              attrs: { ...view.node.attrs, position: payload.position },
              children: view.node.children,
            },
          },
        })
      }
    }

    ctx.on('drag:branch:placeholder:update', handlePlaceholderUpdate)
    ctx.on('drag:branch:mount:detached', handleMountDetached)
    ctx.on('drag:branch:mount:attach', handleMountAttach)
    ctx.on('drag:branch:mount:free', handleMountFree)

    return () => {
      for (const name of Object.keys(commands)) {
        ctx.unregisterCommand(name)
      }
      ctx.off('drag:branch:placeholder:update', handlePlaceholderUpdate)
      ctx.off('drag:branch:mount:detached', handleMountDetached)
      ctx.off('drag:branch:mount:attach', handleMountAttach)
      ctx.off('drag:branch:mount:free', handleMountFree)
    }
  },
})

export default DragHandlerExtension
