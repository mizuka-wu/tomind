/**
 * ContextMenuExtension — 右键菜单扩展
 *
 * 功能：
 * 1. 右键菜单触发
 * 2. 长按菜单触发
 * 3. 菜单项注册
 * 4. 菜单事件分发
 */

import { createExtension, parseArgs } from '@tomind/core'
import type { ExtensionContext, CommandFn, EventHandler } from '@tomind/core'
// ==================== 类型定义 ====================

interface ContextMenuOptions {
  [key: string]: unknown
  /** 是否启用右键菜单（默认 true） */
  enableContextMenu?: boolean
  /** 是否启用长按菜单（默认 true） */
  enableLongPress?: boolean
  /** 长按触发时间（毫秒，默认 500） */
  longPressDuration?: number
}

/** 菜单项 */
export interface ContextMenuItem {
  /** 菜单项 ID */
  id: string
  /** 显示名称 */
  label: string
  /** 图标 */
  icon?: string
  /** 快捷键 */
  shortcut?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否分割线 */
  separator?: boolean
  /** 子菜单 */
  children?: ContextMenuItem[]
  /** 点击回调 */
  action?: (args: ContextMenuActionArgs) => void
}

/** 菜单动作参数 */
export interface ContextMenuActionArgs {
  /** 菜单项 ID */
  itemId: string
  /** 触发事件 */
  event: Event
  /** 目标节点 ID（如果有） */
  targetId?: string
  /** 扩展上下文 */
  ctx: ExtensionContext
}

/** 菜单配置 */
export interface ContextMenuConfig {
  /** 菜单项列表 */
  items: ContextMenuItem[]
  /** 菜单标题 */
  title?: string
}

// ==================== Storage 类型 ====================

interface ContextMenuStorage extends Record<string, unknown> {
  menuItems: Map<string, ContextMenuItem>
  opts: Required<ContextMenuOptions>
}

// ==================== ContextMenuExtension ====================

export const ContextMenuExtension = createExtension<ContextMenuOptions, ContextMenuStorage>({
  name: 'contextMenu',
  type: 'extension',
  defaultOptions: {
    enabled: true,
    enableContextMenu: true,
    enableLongPress: true,
    longPressDuration: 500,
  },

  addStorage(): ContextMenuStorage {
    return {
      menuItems: new Map<string, ContextMenuItem>(),
      opts: {
        enabled: true,
        enableContextMenu: true,
        enableLongPress: true,
        longPressDuration: 500,
      },
    } as ContextMenuStorage
  },

  onCreate(ctx) {
    const storage = ctx.storage
    const opts = storage.opts

    // 注册命令
    const commands = createContextMenuCommands(ctx, storage.menuItems)
    for (const [name, command] of Object.entries(commands)) {
      ctx.registerCommand(name, command)
    }

    // 初始化事件处理
    const cleanupEvents = setupEventHandlers(ctx, opts, storage.menuItems)

    // 返回清理函数
    return () => {
      for (const name of Object.keys(commands)) {
        ctx.unregisterCommand(name)
      }
      cleanupEvents()
    }
  },
})

// ==================== 事件处理 ====================

function setupEventHandlers(
  ctx: ExtensionContext,
  options: Required<ContextMenuOptions>,
  menuItems: Map<string, ContextMenuItem>
): () => void {
  // 长按计时器
  let longPressTimer: ReturnType<typeof setTimeout> | null = null
  let longPressTarget: EventTarget | null = null

  // 右键菜单处理
  const handleContextMenu = (event: unknown) => {
    const e = event as MouseEvent
    if (!options.enableContextMenu) return

    e.preventDefault?.()
    e.stopPropagation?.()

    // 获取目标节点 ID
    const targetId = getTargetNodeId(e.target)

    // 显示菜单
    showContextMenu(e, targetId, ctx, menuItems)
  }

  // 长按开始
  const handlePointerDown = (event: unknown) => {
    const e = event as PointerEvent
    if (!options.enableLongPress) return

    longPressTarget = e.target
    longPressTimer = setTimeout(() => {
      // 长按触发
      const targetId = getTargetNodeId(longPressTarget)
      showContextMenu(e, targetId, ctx, menuItems)
    }, options.longPressDuration)
  }

  // 长按取消
  const handlePointerUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
    longPressTarget = null
  }

  // 长按移动取消
  const handlePointerMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  // 注册事件监听（通过扩展事件系统）
  // 右键菜单：由 ViewDesc 的 contextmenu 事件转发
  ctx.on('contextmenu', handleContextMenu)
  // 长按：由 ViewDesc 的 pointerdown/pointerup/pointermove 转发
  ctx.on('pointerdown', handlePointerDown)
  ctx.on('pointerup', handlePointerUp)
  ctx.on('pointermove', handlePointerMove)

  // 返回清理函数
  return () => {
    ctx.off('contextmenu', handleContextMenu)
    ctx.off('pointerdown', handlePointerDown)
    ctx.off('pointerup', handlePointerUp)
    ctx.off('pointermove', handlePointerMove)
    if (longPressTimer) {
      clearTimeout(longPressTimer)
    }
  }
}

// ==================== 菜单显示 ====================

function showContextMenu(
  event: MouseEvent | PointerEvent,
  targetId: string | null,
  ctx: ExtensionContext,
  menuItems: Map<string, ContextMenuItem>
): void {
  // 构建菜单配置
  const config: ContextMenuConfig = {
    items: Array.from(menuItems.values()),
    title: targetId ? `Node: ${targetId}` : undefined,
  }

  // 触发菜单显示事件
  ctx.emit('contextMenu:show', {
    event,
    targetId,
    config,
  })
}

// ==================== 目标节点 ID 提取 ====================

/** LeaferJS 元素上 userData 的最小接口 */
interface LeaferElementWithUserData {
  userData?: { nodeId?: string }
}

function getTargetNodeId(target: EventTarget | null): string | null {
  if (!target) return null

  // 从 DOM 元素提取节点 ID
  const element = target as HTMLElement
  if (element.dataset?.nodeId) {
    return element.dataset.nodeId
  }

  // 从 LeaferJS 元素提取
  const leaferElement = target as unknown as LeaferElementWithUserData
  if (leaferElement.userData?.nodeId) {
    return leaferElement.userData.nodeId
  }

  return null
}

// ==================== 命令工厂 ====================

function createContextMenuCommands(
  ctx: ExtensionContext,
  menuItems: Map<string, ContextMenuItem>
): Record<string, CommandFn> {
  return {
    /**
     * 注册菜单项
     */
    'contextMenu.registerItem': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = parseArgs<{ item: ContextMenuItem }>(args)
      if (!params?.item) return false

      menuItems.set(params.item.id, params.item)
      return true
    },

    /**
     * 注销菜单项
     */
    'contextMenu.unregisterItem': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = parseArgs<{ itemId: string }>(args)
      if (!params?.itemId) return false

      menuItems.delete(params.itemId)
      return true
    },

    /**
     * 获取所有菜单项
     */
    'contextMenu.getItems': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      // 返回菜单项列表
      return true
    },

    /**
     * 触发菜单动作
     */
    'contextMenu.triggerAction': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = parseArgs<{ itemId: string; event: Event; targetId?: string }>(args)
      if (!params?.itemId) return false

      const item = menuItems.get(params.itemId)
      if (item?.action) {
        item.action({
          itemId: params.itemId,
          event: params.event,
          targetId: params.targetId,
          ctx,
        })
      }

      // 触发动作事件
      ctx.emit('contextMenu:action', {
        itemId: params.itemId,
        targetId: params.targetId,
      })

      return true
    },
  }
}
