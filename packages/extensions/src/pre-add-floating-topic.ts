/**
 * PreAddFloatingTopicExtension — 预添加浮动主题扩展
 *
 * 功能：
 * 1. 开始预添加流程
 * 2. 显示假视图跟随鼠标
 * 3. 点击完成添加
 * 4. ESC 取消
 *
 * 命令：
 * - topic.addFloating: 添加浮动主题
 *
 * 生命周期：
 * startProcess → 监听事件 → finish/reset
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext, CommandFn } from '@tomind/core'
import { Group, Rect, Text } from 'leafer-ui'

// ==================== 类型定义 ====================

interface PreAddFloatingTopicOptions {
  [key: string]: unknown
  enabled?: boolean
}

/** 位置 */
interface Position {
  x: number
  y: number
}

/** 流程状态 */
interface ProcessState {
  active: boolean
  fakeView: Group | null
  cleanup: (() => void) | null
}

// ==================== 常量 ====================

const FAKE_VIEW_WIDTH = 104
const FAKE_VIEW_HEIGHT = 36
const FAKE_VIEW_RADIUS = 5
const DEFAULT_TITLE = '浮动主题'

// ==================== PreAddFloatingTopicExtension ====================

export const PreAddFloatingTopicExtension = createExtension<PreAddFloatingTopicOptions>({
  name: 'preAddFloatingTopic',
  type: 'extension',
  defaultOptions: {
    enabled: true,
  },

  onCreate(ctx) {
    // 注册命令
    const commands = createCommands(ctx)
    for (const [name, command] of Object.entries(commands)) {
      ctx.registerCommand(name, command)
    }

    // 返回清理函数
    return () => {
      for (const name of Object.keys(commands)) {
        ctx.unregisterCommand(name)
      }
    }
  },
})

// ==================== 命令工厂 ====================

function createCommands(ctx: ExtensionContext): Record<string, CommandFn> {
  return {
    /**
     * 添加浮动主题
     */
    'topic.addFloating': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null,
      args?: unknown
    ): boolean => {
      const params = args as { x: number; y: number } | undefined
      if (!params) return false

      // 开始预添加流程
      startProcess(ctx, { x: params.x, y: params.y })

      return true
    },
  }
}

// ==================== 流程控制 ====================

/**
 * 开始预添加流程
 */
function startProcess(ctx: ExtensionContext, position: Position): void {
  // 创建假视图
  const fakeView = createFakeView(ctx, position)

  // 监听事件
  const onPointerMove = (e: unknown) => {
    const event = e as MouseEvent
    updateFakeViewPosition(fakeView, { x: event.clientX, y: event.clientY })
  }

  const onPointerDown = (e: unknown) => {
    const event = e as MouseEvent
    finish(ctx, event, fakeView)
  }

  const onKeyDown = (e: unknown) => {
    const event = e as KeyboardEvent
    if (event.key === 'Escape') {
      reset(fakeView, cleanup)
    }
  }

  // 注册事件
  ctx.on('pointermove', onPointerMove)
  ctx.on('pointerdown', onPointerDown)
  ctx.on('keydown', onKeyDown)

  // 清理函数
  const cleanup = () => {
    ctx.off('pointermove', onPointerMove)
    ctx.off('pointerdown', onPointerDown)
    ctx.off('keydown', onKeyDown)
    removeFakeView(fakeView)
  }
}

/**
 * 完成添加
 */
function finish(ctx: ExtensionContext, e: MouseEvent, fakeView: Group): void {
  // 获取鼠标位置
  const position = getPositionFromEvent(e)

  // 创建浮动主题
  ctx.executeCommand('add_floating_topic', { x: position.x, y: position.y })

  // 重置
  reset(fakeView, () => {})
}

/**
 * 重置状态
 */
function reset(fakeView: Group, cleanup: () => void): void {
  // 移除假视图
  removeFakeView(fakeView)

  // 清理事件监听
  cleanup()
}

// ==================== 假视图 ====================

/**
 * 创建假视图
 */
function createFakeView(ctx: ExtensionContext, position: Position): Group {
  // 创建 Group
  const group = new Group()
  group.set({
    x: position.x,
    y: position.y,
    cursor: 'pointer',
  })

  // 创建矩形
  const rect = new Rect()
  rect.set({
    width: FAKE_VIEW_WIDTH,
    height: FAKE_VIEW_HEIGHT,
    cornerRadius: FAKE_VIEW_RADIUS,
    fill: '#cacaca',
    stroke: 'none',
    x: -FAKE_VIEW_WIDTH / 2,
    y: -FAKE_VIEW_HEIGHT / 2,
  })

  // 创建文本
  const text = new Text()
  text.set({
    text: DEFAULT_TITLE,
    y: -16,
    stroke: '#fff',
    fill: '#fff',
    textAlign: 'center',
  })

  // 添加到 Group
  group.add(rect)
  group.add(text)

  // 添加到视图
  ctx.emit("getLeaferView", (leaferView: any) => {
    if (leaferView) {
      leaferView.add(group)
    }
  })

  return group
}

/**
 * 更新假视图位置
 */
function updateFakeViewPosition(fakeView: Group, position: Position): void {
  fakeView.set({ x: position.x, y: position.y })
}

/**
 * 移除假视图
 */
function removeFakeView(fakeView: Group): void {
  fakeView.remove()
}

// ==================== 工具函数 ====================

/**
 * 从事件获取位置
 */
function getPositionFromEvent(e: MouseEvent): Position {
  return { x: e.clientX, y: e.clientY }
}
