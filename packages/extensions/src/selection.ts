import { createExtension, Transaction, layout, DEFAULT_LAYOUT_OPTIONS } from '@tomind/core'
import type { LayoutResult, ExtensionContext, CommandFn, SheetState, SelectionElement } from '@tomind/core'
/**
 * SelectionExtension — 选择管理扩展
 *
 * 功能：
 * 1. 点击选择
 * 2. 框选（鼠标拖拽）— 连接 MouseBoxSelectExtension 的绘制结果
 * 3. 选择命令
 *
 * 命令：
 * - selection.selectAll: 全选
 * - selection.clear: 清除选择
 * - selection.deleteSelected: 删除选中节点
 * - selection.select: 选择指定节点
 * - selection.toggle: 切换选择
 * - selection.add: 添加到选择
 * - selection.remove: 从选择中移除
 * - selection.focus: 聚焦到指定节点
 * - selection.setMultiSelectMode: 设置多选模式
 * - selection.getSelections: 获取所有选中
 * - selection.getLastSelected: 获取最后选中的
 */


// ==================== 类型定义 ====================

interface SelectionOptions {
  [key: string]: unknown
  enabled?: boolean
  /** 启用多选（默认 true） */
  multiSelect?: boolean
  /** 启用框选（默认 true） */
  boxSelect?: boolean
}

interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

// ==================== SelectionExtension ====================

export const SelectionExtension = createExtension<SelectionOptions>({
  name: 'selection',
  type: 'extension',
  defaultOptions: {
    enabled: true,
    multiSelect: true,
    boxSelect: true,
  },

  onCreate(ctx) {
    const opts = {
      enabled: true,
      multiSelect: true,
      boxSelect: true,
    } as SelectionOptions

    // 注册命令
    const commands = createSelectionCommands()
    for (const [name, command] of Object.entries(commands)) {
      ctx.registerCommand(name, command)
    }

    // 初始化事件处理
    const cleanupEvents = setupEventHandlers(ctx, opts)

    // 返回清理函数
    return () => {
      for (const name of Object.keys(commands)) {
        ctx.unregisterCommand(name)
      }
      cleanupEvents()
    }
  },
})

// ==================== 框选节点查找 ====================

/**
 * 两个矩形是否相交
 */
function rectsIntersect(a: Bounds, b: { x: number; y: number; width: number; height: number }): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

/**
 * 缓存最近一次 LayoutResult，避免每次框选都重新计算
 */
let cachedLayoutResult: LayoutResult | null = null
let cachedLayoutState: SheetState | null = null

/**
 * 获取 LayoutResult（有缓存，状态不变时复用）
 */
function getLayoutResult(state: SheetState): LayoutResult {
  if (cachedLayoutResult && cachedLayoutState === state) {
    return cachedLayoutResult
  }
  const doc = state.doc
  if (!doc) {
    return { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
  }
  // 计算布局（不传 StyleEngine，使用默认参数 — 框选用足够精确）
  cachedLayoutResult = layout(doc, DEFAULT_LAYOUT_OPTIONS)
  cachedLayoutState = state
  return cachedLayoutResult
}

/**
 * 在 LayoutResult 中找到与选框相交的节点 ID 列表
 */
function findNodesInBounds(
  layoutResult: LayoutResult,
  bounds: Bounds,
  isSegmentMultiSelect: boolean,
  currentSelection: string[],
): string[] {
  const found: string[] = []
  const boundsNormalized: Bounds = {
    x: Math.min(bounds.x, bounds.x + bounds.width),
    y: Math.min(bounds.y, bounds.y + bounds.height),
    width: Math.abs(bounds.width),
    height: Math.abs(bounds.height),
  }

  for (const [nodeId, nodeLayout] of layoutResult.nodes) {
    const nodeBounds: Bounds = {
      x: nodeLayout.x,
      y: nodeLayout.y,
      width: nodeLayout.width,
      height: nodeLayout.height,
    }

    if (rectsIntersect(boundsNormalized, nodeBounds)) {
      found.push(nodeId)
    }
  }

  // 片段多选：在现有选择基础上累加
  if (isSegmentMultiSelect) {
    const set = new Set(currentSelection)
    for (const id of found) {
      set.add(id)
    }
    return Array.from(set)
  }

  return found
}

// ==================== 事件处理 ====================

function setupEventHandlers(
  ctx: ExtensionContext,
  options: SelectionOptions,
): () => void {
  const boxSelect = options.boxSelect ?? true

  // 监听点击事件
  const handleClick = (event: unknown) => {
    const e = event as { targetId?: string; ctrlKey?: boolean; metaKey?: boolean }
    if (!e.targetId) return

    const isMultiSelect = (e.ctrlKey || e.metaKey)

    if (isMultiSelect) {
      // 多选模式：切换选择
      ctx.executeCommand('selection.toggle', { nodeId: e.targetId })
    } else {
      // 单选模式：选择指定节点
      ctx.executeCommand('selection.select', { nodeId: e.targetId })
    }
  }

  // 监听键盘事件（Shift+Click 范围选择）
  const handleKeyDown = (event: unknown) => {
    const e = event as { key?: string; ctrlKey?: boolean; metaKey?: boolean; preventDefault?: () => void }
    if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
      // Ctrl+A 全选
      e.preventDefault?.()
      ctx.executeCommand('selection.selectAll')
    }
  }

  // ==================== Hover 预选框 ====================

  const getLeaferView = (): any => {
    let leaferView: any = null
    ctx.emit('getLeaferView', (view: any) => { leaferView = view })
    return leaferView
  }

  // hover 预选框元素（全局复用一个）
  let hoverRect: any = null

  const ensureHoverRect = (): any => {
    if (hoverRect) return hoverRect
    const leaferView = getLeaferView()
    if (!leaferView) return null
    const { Rect } = require('leafer-ui')
    hoverRect = new Rect({
      name: 'hover-border',
      fill: 'rgba(46, 189, 255, 0.08)',
      stroke: '#2ebdff',
      strokeWidth: 1,
      strokeOpacity: 0.6,
      cornerRadius: 4,
      visible: false,
      pointerEvents: 'none',
    })
    leaferView.add(hoverRect)
    return hoverRect
  }

  const handleHoverEnter = (...args: unknown[]) => {
    const nodeId = args[0] as string | undefined
    if (!nodeId) return

    const state = ctx.getState() as SheetState
    if (!state) return

    // 已选中的节点不显示 hover
    const isSelected = state.selection?.elements?.some(el => el.id === nodeId)
    if (isSelected) return

    const rect = ensureHoverRect()
    if (!rect) return

    // 从 layout 获取节点位置和尺寸
    const layoutResult = getLayoutResult(state)
    const nodeLayout = layoutResult.nodes.get(nodeId)
    if (!nodeLayout) return

    rect.set({
      x: nodeLayout.x - 2,
      y: nodeLayout.y - 2,
      width: nodeLayout.width + 4,
      height: nodeLayout.height + 4,
      visible: true,
    })
  }

  const handleHoverLeave = () => {
    if (hoverRect) {
      hoverRect.visible = false
    }
  }

  // ==================== 框选事件 ====================

  /**
   * MouseBoxSelectExtension 在框选过程中持续触发
   * bounds 是 LeaferJS 画布坐标（与 LayoutResult 同一坐标系）
   */
  const handleBoxSelecting = (...args: unknown[]) => {
    if (!boxSelect) return

    const bounds = args[0] as Bounds | undefined
    const isSegmentMultiSelect = args[1] as boolean | undefined
    if (!bounds) return

    const state = ctx.getState() as SheetState
    if (!state) return

    // 获取布局结果并查找节点
    const layoutResult = getLayoutResult(state)
    const currentSelection = state.selection?.elements?.map(el => el.id) || []
    const nodeIds = findNodesInBounds(layoutResult, bounds, isSegmentMultiSelect || false, currentSelection)

    // 实时预览：发出预选事件（不直接修改 selection）
    ctx.emit('selection:boxSelectPreview', nodeIds, bounds)
  }

  /**
   * MouseBoxSelectExtension 在框选结束时触发
   * 最终确定选中的节点并更新 selection
   */
  const handleBoxSelectEnd = (...args: unknown[]) => {
    if (!boxSelect) return

    const state = ctx.getState() as SheetState
    if (!state) return

    // 找到最后一次 selecting 事件缓存的预选节点
    // 用 selection:boxSelectPreview 存储的预选结果来设置最终选择
    // 这里我们重新计算一次（开销很小，因为 layout 有缓存）
    // 实际的最终选择由 preview 事件的最后结果决定
    // 但由于 ended 事件没有 bounds 参数，我们依赖 preview 的最后一次结果

    // 通知框选结束
    ctx.emit('selection:boxSelectComplete')
  }

  /**
   * 处理框选完成后的最终选择设置
   * 由 boxSelectComplete 事件触发，接收最终的节点 ID 列表
   */
  const handleBoxSelectComplete = (...args: unknown[]) => {
    const nodeIds = args[0] as string[] | undefined
    if (!nodeIds || nodeIds.length === 0) {
      // 空选框：清除选择（除非按住 Shift）
      const isShift = args[1] as boolean | undefined
      if (!isShift) {
        ctx.executeCommand('selection.clear')
      }
      return
    }

    const elements: SelectionElement[] = nodeIds.map(id => ({
      id,
      type: 'topic' as const,
    }))

    // 设置选择（通过事务）
    const state = ctx.getState() as SheetState
    if (state) {
      const tr = new Transaction(state.doc)
      tr.setSelection({ elements })
      ctx.dispatch(tr)
    }
  }

  // 注册事件监听
  ctx.on('click', handleClick)
  ctx.on('keydown', handleKeyDown)
  ctx.on('selection:hoverEnter', handleHoverEnter)
  ctx.on('selection:hoverLeave', handleHoverLeave)
  if (boxSelect) {
    ctx.on('mouseBoxSelect:selecting', handleBoxSelecting)
    ctx.on('mouseBoxSelect:ended', handleBoxSelectEnd)
    ctx.on('selection:boxSelectComplete', handleBoxSelectComplete)
  }

  // 返回清理函数
  return () => {
    ctx.off('click', handleClick)
    ctx.off('keydown', handleKeyDown)
    ctx.off('selection:hoverEnter', handleHoverEnter)
    ctx.off('selection:hoverLeave', handleHoverLeave)
    if (boxSelect) {
      ctx.off('mouseBoxSelect:selecting', handleBoxSelecting)
      ctx.off('mouseBoxSelect:ended', handleBoxSelectEnd)
      ctx.off('selection:boxSelectComplete', handleBoxSelectComplete)
    }
    // 清理 hover 元素
    if (hoverRect) {
      hoverRect.destroy()
      hoverRect = null
    }
  }
}

// ==================== 命令工厂 ====================

function createSelectionCommands(): Record<string, CommandFn> {
  return {
    /**
     * 全选
     */
    'selection.selectAll': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      const sheetState = state as SheetState
      if (!sheetState?.doc) return false

      // 获取所有可见节点
      const allNodes = getAllVisibleNodes(sheetState)
      if (allNodes.length === 0) return false

      const elements: SelectionElement[] = allNodes.map(id => ({
        id,
        type: 'topic' as const,
      }))

      if (dispatch) {
        const tr = new Transaction(sheetState.doc)
        tr.setSelection({ elements })
        dispatch(tr)
      }

      return true
    },

    /**
     * 清除选择
     */
    'selection.clear': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      const sheetState = state as SheetState
      if (!sheetState?.doc) return false

      if (dispatch) {
        const tr = new Transaction(sheetState.doc)
        tr.setSelection({ elements: [] })
        dispatch(tr)
      }

      return true
    },

    /**
     * 删除选中节点
     */
    'selection.deleteSelected': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      const sheetState = state as SheetState
      if (!sheetState?.doc || !sheetState.selection) return false

      const { elements } = sheetState.selection
      if (elements.length === 0) return false

      if (dispatch) {
        const tr = new Transaction(sheetState.doc)

        // 删除所有选中的节点
        for (const element of elements) {
          tr.deleteNode(element.id)
        }

        // 清除选择
        tr.setSelection({ elements: [] })

        dispatch(tr)
      }

      return true
    },

    /**
     * 选择指定节点
     */
    'selection.select': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = args as { nodeId: string; addToSelection?: boolean } | undefined
      if (!params) return false

      const sheetState = state as SheetState
      if (!sheetState?.doc) return false

      const newElement: SelectionElement = {
        id: params.nodeId,
        type: 'topic',
      }

      if (dispatch) {
        const tr = new Transaction(sheetState.doc)

        if (params.addToSelection) {
          // 添加到现有选择
          const current = sheetState.selection?.elements || []
          const exists = current.some(el => el.id === params.nodeId)
          if (!exists) {
            tr.setSelection({
              elements: [...current, newElement],
            })
          }
        } else {
          // 替换选择
          tr.setSelection({ elements: [newElement] })
        }

        dispatch(tr)
      }

      return true
    },

    /**
     * 切换选择
     */
    'selection.toggle': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = args as { nodeId: string } | undefined
      if (!params) return false

      const sheetState = state as SheetState
      if (!sheetState?.doc) return false

      const current = sheetState.selection?.elements || []
      const index = current.findIndex(el => el.id === params.nodeId)

      if (dispatch) {
        const tr = new Transaction(sheetState.doc)

        if (index >= 0) {
          // 已选中，移除
          tr.setSelection({
            elements: current.filter(el => el.id !== params.nodeId),
          })
        } else {
          // 未选中，添加
          tr.setSelection({
            elements: [...current, { id: params.nodeId, type: 'topic' }],
          })
        }

        dispatch(tr)
      }

      return true
    },

    /**
     * 添加到选择
     */
    'selection.add': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = args as { nodeId: string } | undefined
      if (!params) return false

      const sheetState = state as SheetState
      if (!sheetState?.doc) return false

      const current = sheetState.selection?.elements || []
      const exists = current.some(el => el.id === params.nodeId)
      if (exists) return false

      if (dispatch) {
        const tr = new Transaction(sheetState.doc)
        tr.setSelection({
          elements: [...current, { id: params.nodeId, type: 'topic' }],
        })
        dispatch(tr)
      }

      return true
    },

    /**
     * 从选择中移除
     */
    'selection.remove': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = args as { nodeId: string } | undefined
      if (!params) return false

      const sheetState = state as SheetState
      if (!sheetState?.doc || !sheetState.selection) return false

      const { elements } = sheetState.selection
      const index = elements.findIndex(el => el.id === params.nodeId)
      if (index < 0) return false

      if (dispatch) {
        const tr = new Transaction(sheetState.doc)
        tr.setSelection({
          elements: elements.filter(el => el.id !== params.nodeId),
        })
        dispatch(tr)
      }

      return true
    },

    /**
     * 聚焦到指定节点
     */
    'selection.focus': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = args as { nodeId: string } | undefined
      if (!params) return false

      const sheetState = state as SheetState
      if (!sheetState?.doc) return false

      // 聚焦节点同时选中它
      if (dispatch) {
        const tr = new Transaction(sheetState.doc)
        tr.setSelection({
          elements: [{ id: params.nodeId, type: 'topic' }],
        })
        dispatch(tr)
      }

      return true
    },

    /**
     * 设置多选模式
     */
    'selection.setMultiSelectMode': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = args as { enabled: boolean } | undefined
      if (!params) return false

      // 多选模式是 UI 状态，通过事件通知
      // 不存储在 State 中
      return true
    },

    /**
     * 获取所有选中节点
     */
    'selection.getSelections': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      const sheetState = state as SheetState
      if (!sheetState?.selection) return false

      // 返回当前选择（通过返回值）
      return sheetState.selection.elements.length > 0
    },

    /**
     * 获取最后选中的节点
     */
    'selection.getLastSelected': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      const sheetState = state as SheetState
      if (!sheetState?.selection) return false

      const { elements } = sheetState.selection
      return elements.length > 0
    },
  }
}

// ==================== 工具函数 ====================

/**
 * 获取所有可见节点 ID
 */
function getAllVisibleNodes(sheetState: SheetState): string[] {
  const ids: string[] = []
  const doc = sheetState.doc

  if (!doc) return ids

  // 遍历所有节点
  const walk = (nodeId: string) => {
    const node = sheetState.getNode(nodeId)
    if (!node) return

    // 检查是否折叠
    if (node.attrs?.collapsed) {
      // 折叠的节点只添加自身，不添加子节点
      ids.push(nodeId)
      return
    }

    ids.push(nodeId)

    // 遍历子节点
    if (node.children) {
      for (const children of Object.values(node.children)) {
        if (Array.isArray(children)) {
          for (const child of children) {
            if (typeof child === 'string') {
              walk(child)
            }
          }
        }
      }
    }
  }

  // 从根节点开始遍历
  if (doc?.id) {
    walk(doc.id)
  }

  return ids
}
