/**
 * KeymapExtension — 快捷键扩展
 *
 * 参考旧 KeyBind 模块，迁移为 Tiptap 风格 Extension
 *
 * 快捷键映射：
 * - Tab → 添加子主题
 * - Enter → 添加同级主题（Shift+Enter = 前面插入）
 * - Delete/Backspace → 删除选中
 * - Ctrl+Z → 撤销
 * - Ctrl+Shift+Z → 重做
 * - Ctrl+A → 全选
 * - 方向键 → 导航
 * - Space → 编辑选中主题
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'

// ==================== 工具函数 ====================

/**
 * 规范化快捷键字符串
 *
 * 将事件转换为 Tiptap 风格的快捷键字符串
 * 如 'Mod-z', 'Mod-Shift-z', 'Tab', 'Enter'
 */
export function getShortcutFromEvent(event: KeyboardEvent): string | null {
  const parts: string[] = []

  // 修饰键
  if (event.metaKey || event.ctrlKey) {
    parts.push('Mod')
  }
  if (event.shiftKey) {
    parts.push('Shift')
  }
  if (event.altKey) {
    parts.push('Alt')
  }

  // 按键
  const key = event.key
  if (key === ' ') {
    parts.push('Space')
  } else if (key === 'Tab') {
    parts.push('Tab')
  } else if (key === 'Enter') {
    parts.push('Enter')
  } else if (key === 'Escape') {
    parts.push('Escape')
  } else if (key === 'Backspace' || key === 'Delete') {
    parts.push('Delete')
  } else if (key === 'ArrowUp') {
    parts.push('Up')
  } else if (key === 'ArrowDown') {
    parts.push('Down')
  } else if (key === 'ArrowLeft') {
    parts.push('Left')
  } else if (key === 'ArrowRight') {
    parts.push('Right')
  } else if (key.length === 1) {
    // 单个字符
    parts.push(event.shiftKey ? key.toUpperCase() : key.toLowerCase())
  } else {
    return null // 不支持的按键
  }

  return parts.join('-')
}

// ==================== 默认快捷键 ====================

/**
 * 创建默认快捷键映射
 */
export function createDefaultKeymap(): Record<string, (ctx: ExtensionContext) => boolean> {
  return {
    // ==================== 编辑操作 ====================

    // Tab → 添加子主题
    'Tab': (ctx) => {
      const workbook = ctx.getWorkbook()
      if (!workbook.editable) return false
      return ctx.executeCommand('topic.addChild')
    },

    // Enter → 添加同级主题（后面）
    'Enter': (ctx) => {
      const workbook = ctx.getWorkbook()
      if (!workbook.editable) return false
      return ctx.executeCommand('topic.addSibling')
    },

    // Shift+Enter → 添加同级主题（前面）
    'Shift-Enter': (ctx) => {
      const workbook = ctx.getWorkbook()
      if (!workbook.editable) return false
      return ctx.executeCommand('topic.addSiblingBefore')
    },

    // Delete → 删除选中
    'Delete': (ctx) => {
      const workbook = ctx.getWorkbook()
      if (!workbook.editable) return false
      return ctx.executeCommand('topic.delete')
    },

    // Backspace → 删除选中（同 Delete）
    'Backspace': (ctx) => {
      const workbook = ctx.getWorkbook()
      if (!workbook.editable) return false
      return ctx.executeCommand('topic.delete')
    },

    // ==================== 历史操作 ====================

    // Mod-z → 撤销
    'Mod-z': (ctx) => {
      const workbook = ctx.getWorkbook()
      if (!workbook.editable) return false
      return ctx.executeCommand('history.undo')
    },

    // Mod-Shift-z → 重做
    'Mod-Shift-z': (ctx) => {
      const workbook = ctx.getWorkbook()
      if (!workbook.editable) return false
      return ctx.executeCommand('history.redo')
    },

    // ==================== 选择操作 ====================

    // Mod-a → 全选
    'Mod-a': (ctx) => {
      return ctx.executeCommand('selection.selectAll')
    },

    // ==================== 导航操作（只读模式也允许） ====================

    // 上 → 选择上方主题
    'Up': (ctx) => {
      return ctx.executeCommand('navigation.up')
    },

    // 下 → 选择下方主题
    'Down': (ctx) => {
      return ctx.executeCommand('navigation.down')
    },

    // 左 → 选择左侧主题/折叠
    'Left': (ctx) => {
      return ctx.executeCommand('navigation.left')
    },

    // 右 → 选择右侧主题/展开
    'Right': (ctx) => {
      return ctx.executeCommand('navigation.right')
    },

    // Mod+上 → 扩展选择上方
    'Mod-Up': (ctx) => {
      return ctx.executeCommand('selection.extendUp')
    },

    // Mod+下 → 扩展选择下方
    'Mod-Down': (ctx) => {
      return ctx.executeCommand('selection.extendDown')
    },

    // ==================== 其他操作 ====================

    // Space → 编辑选中主题（进入文本编辑模式）
    'Space': (ctx) => {
      const workbook = ctx.getWorkbook()
      if (!workbook.editable) return false
      return ctx.executeCommand('topic.edit')
    },

    // Escape → 取消选择/退出编辑
    'Escape': (ctx) => {
      return ctx.executeCommand('selection.clear')
    },

    // F2 → 编辑选中主题
    'F2': (ctx) => {
      const workbook = ctx.getWorkbook()
      if (!workbook.editable) return false
      return ctx.executeCommand('topic.edit')
    },

    // Mod-Shift-s → 保存
    'Mod-Shift-s': (ctx) => {
      return ctx.executeCommand('file.save')
    },
  }
}

// ==================== KeymapExtension ====================

/**
 * 快捷键扩展
 *
 * @example
 * ```typescript
 * // 使用默认快捷键
 * workbook.installExtension(KeymapExtension)
 *
 * // 自定义快捷键
 * const CustomKeymap = KeymapExtension.configure({
 *   keymap: {
 *     'Mod-z': (ctx) => { ... },
 *   },
 * })
 * workbook.installExtension(CustomKeymap)
 * ```
 */
export const KeymapExtension = createExtension({
  name: 'keymap',
  type: 'extension',
  defaultOptions: {
    enabled: true,
    /** 自定义快捷键映射（会与默认映射合并） */
    keymap: {} as Record<string, (ctx: ExtensionContext) => boolean>,
  },

  addKeyboardShortcuts() {
    // 合并默认快捷键和自定义快捷键
    const defaultKeymap = createDefaultKeymap()
    const opts = (this as unknown as { defaultOptions?: Record<string, unknown> })?.defaultOptions
    const customKeymap = (opts?.keymap as Record<string, (ctx: ExtensionContext) => boolean>) ?? {}

    return {
      ...defaultKeymap,
      ...customKeymap,
    }
  },

  onCreate(ctx) {
    // 监听键盘事件
    const handleKeyDown = (event: KeyboardEvent) => {
      // 忽略输入框内的按键
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const shortcut = getShortcutFromEvent(event)
      if (!shortcut) return

      // 获取 workbook 并处理快捷键
      const workbook = ctx.getWorkbook()
      const handled = workbook.handleKeyboardShortcut?.(shortcut) ?? false

      if (handled) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    // 绑定到 document
    document.addEventListener('keydown', handleKeyDown)

    // 返回清理函数
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  },
})
