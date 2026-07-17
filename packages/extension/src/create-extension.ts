/**
 * createExtension — 扩展工厂函数
 *
 * Tiptap 风格，支持：
 * - onCreate 生命周期钩子
 * - addOptions 选项工厂
 * - addStorage 存储工厂
 */

import type {
  Extension,
  ExtensionOptions,
  ExtensionType,
  CommandFn,
  KeyboardShortcutHandler,
  CleanupFn,
  ExtensionContext
} from './types'

/**
 * 创建扩展
 */
export function createExtension<Options extends Record<string, unknown> = {}>(definition: {
  name: string
  type: ExtensionType
  defaultOptions?: ExtensionOptions<Options>
  onCreate?: (ctx: import('./types').ExtensionContext) => CleanupFn | void
  addOptions?: () => Partial<Options> | Record<string, unknown>
  addStorage?: () => Record<string, unknown>
  destroy?: () => void
  commands?: Record<string, (...args: unknown[]) => CommandFn>
  shortcuts?: Record<string, string>
  addKeyboardShortcuts?: () => Record<string, KeyboardShortcutHandler>
}): Extension<Options> {
  // 合并默认选项
  const defaultOptions: ExtensionOptions<Options> = {
    ...(definition.defaultOptions || {} as ExtensionOptions<Options>),
    enabled: true,
  }

  // 当前选项（初始为默认选项）
  let currentOptions: ExtensionOptions<Options> = { ...defaultOptions }
  let cleanupFn: CleanupFn | null = null

  const extension: Extension<Options> = {
    name: definition.name,
    type: definition.type,
    defaultOptions,

    configure(options: Partial<ExtensionOptions<Options>>): Extension<Options> {
      const mergedOptions: ExtensionOptions<Options> = {
        ...currentOptions,
        ...options,
      }
      return createExtension({
        ...definition,
        defaultOptions: mergedOptions,
      })
    },

    onCreate: definition.onCreate,

    destroy() {
      if (cleanupFn) {
        cleanupFn()
        cleanupFn = null
      }
      definition.destroy?.()
    },

    commands: definition.commands,
    shortcuts: definition.shortcuts,
    addKeyboardShortcuts: definition.addKeyboardShortcuts,
    addOptions: definition.addOptions,
    addStorage: definition.addStorage,

    isEnabled(): boolean {
      return currentOptions.enabled !== false
    },
  }

  return extension
}

/**
 * 创建节点扩展（type='node'）
 */
export function createNodeExtension<Options extends Record<string, unknown> = {}>(definition: {
  name: string
  defaultOptions?: ExtensionOptions<Options>
  onCreate?: (ctx: ExtensionContext) => CleanupFn | void
  addNodeView?: () => new (...args: any[]) => any
  addOptions?: () => Partial<Options> | Record<string, unknown>
  addStorage?: () => Record<string, unknown>
  destroy?: () => void
  commands?: Record<string, (...args: unknown[]) => CommandFn>
  addKeyboardShortcuts?: () => Record<string, KeyboardShortcutHandler>
  addLayout?: () => { name: string; layout: (node: any, options: any, styleEngine: any, state: any) => any }
}): Extension<Options> {
  return createExtension({
    ...definition,
    type: 'node',
  })
}

/**
 * 创建 Part 扩展（type='part'）
 */
export function createPartExtension<Options extends Record<string, unknown> = {}>(definition: {
  name: string
  defaultOptions?: ExtensionOptions<Options>
  onCreate?: (ctx: ExtensionContext) => CleanupFn | void
  addOptions?: () => Partial<Options> | Record<string, unknown>
  addStorage?: () => Record<string, unknown>
  destroy?: () => void
  commands?: Record<string, (...args: unknown[]) => CommandFn>
  addKeyboardShortcuts?: () => Record<string, KeyboardShortcutHandler>
}): Extension<Options> {
  return createExtension({
    ...definition,
    type: 'part',
  })
}

/**
 * 判断是否为扩展对象
 */
export function isExtension(obj: unknown): obj is Extension {
  return obj != null && typeof obj === 'object' && 'name' in obj && 'type' in obj && 'isEnabled' in obj
}
