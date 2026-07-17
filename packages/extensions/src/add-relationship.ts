import { createExtension, Transaction } from '@tomind/core'
import type { ExtensionContext, CommandFn, SheetState } from '@tomind/core'
/**
 * AddRelationshipExtension — 添加关系线扩展
 *
 * 功能：
 * 1. 有限状态机管理流程
 * 2. 选择两个节点
 * 3. 创建关系线
 * 4. 支持 Shift 键切换直线/曲线
 *
 * 命令：
 * - relationship.add: 开始添加关系线
 * - relationship.cancel: 取消添加
 *
 * 状态流程：
 * READY → SELECT_ONE → SELECT_ANOTHER → FINISH → READY
 */


// ==================== 类型定义 ====================

interface AddRelationshipOptions {
  [key: string]: unknown
  enabled?: boolean
}

/** 位置 */
interface Position {
  x: number
  y: number
}

/** 状态 */
type State = 'READY' | 'SELECT_ONE' | 'SELECT_ANOTHER' | 'FINISH'

// ==================== 常量 ====================

const LINE_STYLE_STRAIGHT = 'straight'
const LINE_STYLE_CURVE = 'curve'

// ==================== AddRelationshipExtension ====================

export const AddRelationshipExtension = createExtension<AddRelationshipOptions>({
  name: 'addRelationship',
  type: 'extension',
  defaultOptions: {
    enabled: true,
  },

  onCreate(ctx) {
    // 状态
    let state: State = 'READY'
    let end1Id: string | null = null
    let end2Id: string | null = null
    let movingRelationshipId: string | null = null
    let stickyToAngle = false
    let stickyEndPointCache: Position | null = null
    let defaultLineStyle: string | null = null

    // 事件处理器引用（用于解绑）
    let handleClick: ((e: unknown) => void) | null = null
    let handleMouseMove: ((e: unknown) => void) | null = null
    let handleKeyDown: ((e: unknown) => void) | null = null
    let handleKeyUp: ((e: unknown) => void) | null = null

    // 注册命令
    const commands = createCommands(ctx, {
      getState: () => state,
      setState: (s: State) => { state = s },
      getEnd1Id: () => end1Id,
      setEnd1Id: (v: string | null) => { end1Id = v },
      getEnd2Id: () => end2Id,
      setEnd2Id: (v: string | null) => { end2Id = v },
      getMovingRelationshipId: () => movingRelationshipId,
      setMovingRelationshipId: (v: string | null) => { movingRelationshipId = v },
      getStickyToAngle: () => stickyToAngle,
      setStickyToAngle: (v: boolean) => { stickyToAngle = v },
      getStickyEndPointCache: () => stickyEndPointCache,
      setStickyEndPointCache: (v: Position | null) => { stickyEndPointCache = v },
      getDefaultLineStyle: () => defaultLineStyle,
      setDefaultLineStyle: (v: string | null) => { defaultLineStyle = v },
      getEventHandlers: () => ({ handleClick, handleMouseMove, handleKeyDown, handleKeyUp }),
      setEventHandlers: (handlers: { handleClick: ((e: unknown) => void) | null; handleMouseMove: ((e: unknown) => void) | null; handleKeyDown: ((e: unknown) => void) | null; handleKeyUp: ((e: unknown) => void) | null }) => {
        handleClick = handlers.handleClick
        handleMouseMove = handlers.handleMouseMove
        handleKeyDown = handlers.handleKeyDown
        handleKeyUp = handlers.handleKeyUp
      },
    })
    for (const [name, command] of Object.entries(commands)) {
      ctx.registerCommand(name, command)
    }

    // 返回清理函数
    return () => {
      for (const name of Object.keys(commands)) {
        ctx.unregisterCommand(name)
      }
      // 解绑事件
      if (handleClick) ctx.off('click', handleClick)
      if (handleMouseMove) ctx.off('pointermove', handleMouseMove)
      if (handleKeyDown) ctx.off('keydown', handleKeyDown)
      if (handleKeyUp) ctx.off('keyup', handleKeyUp)
    }
  },
})

// ==================== 命令工厂 ====================

function createCommands(
  ctx: ExtensionContext,
  stateManager: {
    getState: () => State
    setState: (s: State) => void
    getEnd1Id: () => string | null
    setEnd1Id: (v: string | null) => void
    getEnd2Id: () => string | null
    setEnd2Id: (v: string | null) => void
    getMovingRelationshipId: () => string | null
    setMovingRelationshipId: (v: string | null) => void
    getStickyToAngle: () => boolean
    setStickyToAngle: (v: boolean) => void
    getStickyEndPointCache: () => Position | null
    setStickyEndPointCache: (v: Position | null) => void
    getDefaultLineStyle: () => string | null
    setDefaultLineStyle: (v: string | null) => void
    getEventHandlers: () => { handleClick: ((e: unknown) => void) | null; handleMouseMove: ((e: unknown) => void) | null; handleKeyDown: ((e: unknown) => void) | null; handleKeyUp: ((e: unknown) => void) | null }
    setEventHandlers: (handlers: { handleClick: ((e: unknown) => void) | null; handleMouseMove: ((e: unknown) => void) | null; handleKeyDown: ((e: unknown) => void) | null; handleKeyUp: ((e: unknown) => void) | null }) => void
  }
): Record<string, CommandFn> {
  return {
    /**
     * 开始添加关系线
     */
    'relationship.add': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      // 检查状态
      if (stateManager.getState() !== 'READY') {
        return false
      }

      // 获取当前选择
      const sheetState = state as SheetState
      const selections = sheetState?.selection?.elements || []

      if (selections.length > 2) {
        return false
      }

      // 进入 SELECT_ONE
      stateManager.setState('SELECT_ONE')

      // 如果已有选择，直接使用
      selections.forEach(element => {
        selectNode(ctx, stateManager, element.id)
      })

      // 绑定事件
      bindEvents(ctx, stateManager)

      return true
    },

    /**
     * 取消添加
     */
    'relationship.cancel': (
      _state: unknown,
      _dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      cancel(ctx, stateManager)
      return true
    },
  }
}

// ==================== 核心逻辑 ====================

/**
 * 选择节点
 */
function selectNode(
  ctx: ExtensionContext,
  stateManager: any,
  nodeId: string
): void {
  const state = stateManager.getState()

  if (state === 'SELECT_ONE') {
    // 选择第一个节点
    stateManager.setEnd1Id(nodeId)
    stateManager.setState('SELECT_ANOTHER')

    // 创建移动中的关系线
    const movingRelId = createMovingRelationship(ctx, nodeId)
    stateManager.setMovingRelationshipId(movingRelId)
    stateManager.setDefaultLineStyle(LINE_STYLE_CURVE)

  } else if (state === 'SELECT_ANOTHER') {
    // 选择第二个节点
    if (nodeId === stateManager.getEnd1Id()) {
      return
    }

    stateManager.setEnd2Id(nodeId)
    stateManager.setState('FINISH')

    // 完成
    finish(ctx, stateManager)
  }
}

/**
 * 完成
 */
function finish(ctx: ExtensionContext, stateManager: any): void {
  const end1Id = stateManager.getEnd1Id()
  const end2Id = stateManager.getEnd2Id()
  const movingRelId = stateManager.getMovingRelationshipId()

  // 移除移动中的关系线
  if (movingRelId) {
    removeMovingRelationship(ctx, movingRelId)
    stateManager.setMovingRelationshipId(null)
  }

  // 创建真正的关系线
  const relationshipId = createRelationship(ctx, end1Id, end2Id)

  // 从 layout 获取端点位置
  const view = ctx.getView() as any
  const layoutEngine = view?.layoutEngine
  const layoutResult = layoutEngine?.getLayoutResult()
  const end1Layout = layoutResult?.nodes?.get(end1Id)
  const end2Layout = layoutResult?.nodes?.get(end2Id)
  const end1Pos = end1Layout ? {
    x: (end1Layout.x ?? 0) + (end1Layout.width ?? 0) / 2,
    y: (end1Layout.y ?? 0) + (end1Layout.height ?? 0) / 2,
  } : undefined
  const end2Pos = end2Layout ? {
    x: (end2Layout.x ?? 0) + (end2Layout.width ?? 0) / 2,
    y: (end2Layout.y ?? 0) + (end2Layout.height ?? 0) / 2,
  } : undefined

  // 计算控制点
  const controlPoints = calculateControlPoints(
    end1Id,
    end2Id,
    stateManager.getStickyEndPointCache(),
    end1Pos,
    end2Pos,
  )
  setRelationshipControlPoints(ctx, relationshipId, controlPoints)

  // 设置样式
  const lineStyle = stateManager.getStickyToAngle()
    ? LINE_STYLE_STRAIGHT
    : stateManager.getDefaultLineStyle()
  setRelationshipStyle(ctx, relationshipId, lineStyle)

  // 选择新创建的关系线
  ctx.executeCommand('selection.select', { nodeId: relationshipId })

  // 重置
  reset(ctx, stateManager)
}

/**
 * 取消
 */
function cancel(ctx: ExtensionContext, stateManager: any): void {
  const movingRelId = stateManager.getMovingRelationshipId()

  // 移除移动中的关系线
  if (movingRelId) {
    removeMovingRelationship(ctx, movingRelId)
    stateManager.setMovingRelationshipId(null)
  }

  // 重置
  reset(ctx, stateManager)
}

/**
 * 重置
 */
function reset(ctx: ExtensionContext, stateManager: any): void {
  stateManager.setState('READY')
  stateManager.setEnd1Id(null)
  stateManager.setEnd2Id(null)
  stateManager.setMovingRelationshipId(null)
  stateManager.setStickyToAngle(false)
  stateManager.setStickyEndPointCache(null)
  stateManager.setDefaultLineStyle(null)

  // 解绑事件
  unbindEvents(ctx, stateManager)
}

// ==================== 事件处理 ====================

/**
 * 绑定事件
 */
function bindEvents(ctx: ExtensionContext, stateManager: any): void {
  const handleClick = (e: unknown) => {
    const event = e as { targetId?: string; x?: number; y?: number }
    if (event.targetId) {
      selectNode(ctx, stateManager, event.targetId)
    } else if (stateManager.getState() === 'SELECT_ANOTHER') {
      // 点击空白处，创建浮动主题
      const floatingTopicId = createFloatingTopic(ctx, event.x || 0, event.y || 0)
      selectNode(ctx, stateManager, floatingTopicId)
    }
  }

  const handleMouseMove = (e: unknown) => {
    if (stateManager.getState() !== 'SELECT_ANOTHER') return
    if (!stateManager.getMovingRelationshipId()) return

    const event = e as { x?: number; y?: number }
    const position: Position = { x: event.x || 0, y: event.y || 0 }

    // 更新移动中的关系线
    updateMovingRelationship(
      ctx,
      stateManager.getMovingRelationshipId(),
      stateManager.getEnd1Id(),
      position,
      stateManager.getStickyToAngle()
    )

    // 缓存鼠标位置
    stateManager.setStickyEndPointCache(position)
  }

  const handleKeyDown = (e: unknown) => {
    const event = e as { key?: string }
    if (event.key === 'Escape') {
      cancel(ctx, stateManager)
    } else if (event.key === 'Shift') {
      stateManager.setStickyToAngle(true)
      // 更新关系线样式
      const movingRelId = stateManager.getMovingRelationshipId()
      if (movingRelId) {
        updateRelationshipStyle(ctx, movingRelId, LINE_STYLE_STRAIGHT)
      }
    }
  }

  const handleKeyUp = (e: unknown) => {
    const event = e as { key?: string }
    if (event.key === 'Shift') {
      stateManager.setStickyToAngle(false)
      // 更新关系线样式
      const movingRelId = stateManager.getMovingRelationshipId()
      if (movingRelId) {
        updateRelationshipStyle(ctx, movingRelId, LINE_STYLE_CURVE)
      }
    }
  }

  // 保存事件处理器引用
  stateManager.setEventHandlers({ handleClick, handleMouseMove, handleKeyDown, handleKeyUp })

  // 注册事件
  ctx.on('click', handleClick)
  ctx.on('pointermove', handleMouseMove)
  ctx.on('keydown', handleKeyDown)
  ctx.on('keyup', handleKeyUp)
}

/**
 * 解绑事件
 */
function unbindEvents(ctx: ExtensionContext, stateManager: any): void {
  const handlers = stateManager.getEventHandlers()
  if (handlers.handleClick) ctx.off('click', handlers.handleClick)
  if (handlers.handleMouseMove) ctx.off('pointermove', handlers.handleMouseMove)
  if (handlers.handleKeyDown) ctx.off('keydown', handlers.handleKeyDown)
  if (handlers.handleKeyUp) ctx.off('keyup', handlers.handleKeyUp)
  stateManager.setEventHandlers({ handleClick: null, handleMouseMove: null, handleKeyDown: null, handleKeyUp: null })
}

// ==================== 关系线操作 ====================

/**
 * 创建移动中的关系线
 */
function createMovingRelationship(
  ctx: ExtensionContext,
  startNodeId: string
): string {
  // 生成临时 ID
  const tempId = `temp-relationship-${Date.now()}`

  // 通过事件通知视图层创建临时关系线
  ctx.emit('relationship:createMoving', {
    id: tempId,
    startNodeId,
  })

  return tempId
}

/**
 * 更新移动中的关系线
 */
function updateMovingRelationship(
  ctx: ExtensionContext,
  relationshipId: string,
  startNodeId: string,
  endPosition: Position,
  stickyToAngle: boolean
): void {
  // 通过事件通知视图层更新临时关系线
  ctx.emit('relationship:updateMoving', {
    id: relationshipId,
    startNodeId,
    endPosition,
    stickyToAngle,
  })
}

/**
 * 移除移动中的关系线
 */
function removeMovingRelationship(ctx: ExtensionContext, relationshipId: string): void {
  // 通过事件通知视图层移除临时关系线
  ctx.emit('relationship:removeMoving', { id: relationshipId })
}

/**
 * 创建真正的关系线
 */
function createRelationship(
  ctx: ExtensionContext,
  end1Id: string,
  end2Id: string
): string {
  // 生成 ID
  const relationshipId = `relationship-${Date.now()}`

  // 通过事件通知模型层创建关系线
  ctx.emit('relationship:create', {
    id: relationshipId,
    end1Id,
    end2Id,
  })

  return relationshipId
}

/**
 * 设置关系线控制点
 */
function setRelationshipControlPoints(
  ctx: ExtensionContext,
  relationshipId: string,
  controlPoints: unknown
): void {
  ctx.emit('relationship:setControlPoints', {
    id: relationshipId,
    controlPoints,
  })
}

/**
 * 设置关系线样式
 */
function setRelationshipStyle(
  ctx: ExtensionContext,
  relationshipId: string,
  lineStyle: string | null
): void {
  ctx.emit('relationship:setStyle', {
    id: relationshipId,
    lineStyle,
  })
}

/**
 * 更新关系线样式
 */
function updateRelationshipStyle(
  ctx: ExtensionContext,
  relationshipId: string,
  lineStyle: string
): void {
  ctx.emit('relationship:updateStyle', {
    id: relationshipId,
    lineStyle,
  })
}

/**
 * 计算控制点
 * 根据两个端点的位置和可选的鼠标位置，计算贝塞尔曲线的两个控制点
 */
function calculateControlPoints(
  _end1Id: string,
  _end2Id: string,
  endPoint: Position | null,
  end1Pos?: Position,
  end2Pos?: Position,
): { cp1: Position; cp2: Position } {
  // 如果没有提供端点位置，返回默认偏移控制点
  const p1 = end1Pos ?? { x: 0, y: 0 }
  const p2 = end2Pos ?? { x: 100, y: 0 }

  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  // 默认控制点：沿端点连线方向偏移 30%
  const offset = Math.max(dist * 0.3, 30)

  // 基础控制点（水平偏移）
  let cp1: Position = { x: p1.x + (dx >= 0 ? offset : -offset), y: p1.y }
  let cp2: Position = { x: p2.x - (dx >= 0 ? offset : -offset), y: p2.y }

  // 如果有鼠标位置，让控制点向鼠标方向弯曲
  if (endPoint) {
    const midX = (p1.x + p2.x) / 2
    const midY = (p1.y + p2.y) / 2
    const pullX = (endPoint.x - midX) * 0.3
    const pullY = (endPoint.y - midY) * 0.3
    cp1 = { x: cp1.x + pullX, y: cp1.y + pullY }
    cp2 = { x: cp2.x + pullX, y: cp2.y + pullY }
  }

  return { cp1, cp2 }
}

/**
 * 创建浮动主题
 */
function createFloatingTopic(ctx: ExtensionContext, x: number, y: number): string {
  // 生成 ID
  const topicId = `floating-topic-${Date.now()}`

  // 通过事件通知模型层创建浮动主题
  ctx.emit('topic:createFloating', {
    id: topicId,
    x,
    y,
  })

  return topicId
}
