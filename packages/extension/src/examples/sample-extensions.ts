/**
 * 示例扩展 — 展示如何使用 extension 系统
 */

import { createExtension, createNodeExtension, createPartExtension } from '../create-extension'
import type { ExtensionContext } from '../types'

/**
 * 选择扩展（纯行为）
 *
 * 提供节点选择功能
 */
export const SelectionExtension = createExtension<{
  multiSelect: boolean
}>({
  name: 'selection',
  type: 'extension',
  defaultOptions: {
    multiSelect: true,
    enabled: true,
  },
  onCreate(ctx: ExtensionContext) {
    console.log('Selection extension setup')

    // 监听点击事件
    const handleClick = (event: unknown) => {
      const e = event as { targetId?: string; ctrlKey?: boolean }
      if (e.targetId) {
        if (e.ctrlKey) {
          // 多选模式
          ctx.emit('selection:toggle', e.targetId)
        } else {
          // 单选模式
          ctx.emit('selection:select', e.targetId)
        }
      }
    }

    ctx.on('click', handleClick)

    // 返回清理函数
    return () => {
      ctx.off('click', handleClick)
    }
  },
  commands: {
    select: (...args: unknown[]) => (_state, _dispatch) => {
      const targetId = args[0] as string
      console.log('Select command:', targetId)
      return true
    },
    clearSelection: () => (_state, _dispatch) => {
      console.log('Clear selection command')
      return true
    },
  },
})

/**
 * 拖拽扩展（纯行为）
 *
 * 提供节点拖拽功能
 */
export const DragDropExtension = createExtension<{
  threshold: number
}>({
  name: 'dragDrop',
  type: 'extension',
  defaultOptions: {
    enabled: true,
    threshold: 5,
  },
  onCreate(ctx: ExtensionContext) {
    console.log('DragDrop extension setup')

    let dragSource: string | null = null

    const handleDragStart = (event: unknown) => {
      const e = event as { targetId?: string }
      dragSource = e.targetId ?? null
      ctx.emit('drag:start', { sourceId: dragSource })
    }

    const handleDragEnd = () => {
      if (dragSource) {
        ctx.emit('drag:end', { sourceId: dragSource })
        dragSource = null
      }
    }

    const handleDrop = (event: unknown) => {
      const e = event as { targetId?: string; drag?: { data?: unknown } }
      if (dragSource && e.targetId && dragSource !== e.targetId) {
        ctx.emit('drag:drop', {
          sourceId: dragSource,
          targetId: e.targetId,
          data: e.drag?.data,
        })
      }
      dragSource = null
    }

    ctx.on('dragstart', handleDragStart)
    ctx.on('dragend', handleDragEnd)
    ctx.on('drop', handleDrop)

    return () => {
      ctx.off('dragstart', handleDragStart)
      ctx.off('dragend', handleDragEnd)
      ctx.off('drop', handleDrop)
    }
  },
  commands: {
    moveNode: (...args: unknown[]) => (_state, _dispatch) => {
      const sourceId = args[0] as string
      const targetId = args[1] as string
      console.log('Move node command:', sourceId, '->', targetId)
      return true
    },
  },
})

/**
 * 键盘导航扩展（纯行为）
 *
 * 提供键盘导航功能
 */
export const KeyboardNavigationExtension = createExtension<{
  wrapAround: boolean
}>({
  name: 'keyboardNavigation',
  type: 'extension',
  defaultOptions: {
    enabled: true,
    wrapAround: true,
  },
  onCreate(ctx: ExtensionContext) {
    console.log('KeyboardNavigation extension setup')

    const handleKeyDown = (event: unknown) => {
      const e = event as { keyboard?: { key?: string }; ctrlKey?: boolean }
      const key = e.keyboard?.key

      switch (key) {
        case 'ArrowUp':
          ctx.emit('navigation:up')
          break
        case 'ArrowDown':
          ctx.emit('navigation:down')
          break
        case 'ArrowLeft':
          ctx.emit('navigation:left')
          break
        case 'ArrowRight':
          ctx.emit('navigation:right')
          break
        case 'Enter':
          ctx.emit('navigation:enter')
          break
        case 'Tab':
          if (e.ctrlKey) {
            ctx.emit('navigation:tab:child')
          } else {
            ctx.emit('navigation:tab:sibling')
          }
          break
      }
    }

    ctx.on('keydown', handleKeyDown)

    return () => {
      ctx.off('keydown', handleKeyDown)
    }
  },
  commands: {
    navigateUp: () => (_state, _dispatch) => {
      console.log('Navigate up command')
      return true
    },
    navigateDown: () => (_state, _dispatch) => {
      console.log('Navigate down command')
      return true
    },
    navigateLeft: () => (_state, _dispatch) => {
      console.log('Navigate left command')
      return true
    },
    navigateRight: () => (_state, _dispatch) => {
      console.log('Navigate right command')
      return true
    },
  },
  shortcuts: {
    'ArrowUp': 'keyboardNavigation.navigateUp',
    'ArrowDown': 'keyboardNavigation.navigateDown',
    'ArrowLeft': 'keyboardNavigation.navigateLeft',
    'ArrowRight': 'keyboardNavigation.navigateRight',
  },
})

/**
 * Topic Node 扩展
 *
 * 注册 Topic NodeViewDesc
 */
export const TopicNodeExtension = createNodeExtension({
  name: 'topic',
  defaultOptions: {
    enabled: true,
  },
  onCreate(_ctx: ExtensionContext) {
    console.log('Topic node extension setup')

    // 注册 NodeViewDesc
    // ctx.registerNodeView('topic', TopicNodeViewDesc)

    return () => {
      // ctx.unregisterNodeView('topic')
    }
  },
})

/**
 * Markers Part 扩展
 *
 * 注册 Markers PartViewDesc
 */
export const MarkersPartExtension = createPartExtension({
  name: 'markers',
  defaultOptions: {
    enabled: true,
  },
  onCreate(_ctx: ExtensionContext) {
    console.log('Markers part extension setup')

    // 注册 PartViewDesc
    // ctx.registerPartView('markers', MarkersPartViewDesc)

    return () => {
      // ctx.unregisterPartView('markers')
    }
  },
})
