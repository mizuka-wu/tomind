/**
 * Extension 系统
 *
 * 参考 Tiptap 设计：
 * - Extension/Node/Part 三种类型
 * - .configure() 配置
 */

import { buildExtensionContext } from './types'

// 类型导出
export type {
  Extension,
  ExtensionOptions,
  ExtensionType,
  ExtensionContext,
  ExtensionManager as IExtensionManager,
  CommandFn,
  EventHandler,
  KeyboardShortcutHandler,
  WorkbookEditorInterface,
  CleanupFn,
  StarterKitOptions,
  ViewDescConstructor,
  PluginLike,
  WidgetPluginLike,
} from './types'

// 实现导出
export { parseArgs, buildExtensionContext } from './types'
export { createExtension, createNodeExtension, createPartExtension, isExtension } from './create-extension'
export { ExtensionManager } from './extension-manager'

/**
 * 创建扩展上下文
 *
 * 用于将编辑器接口转换为扩展上下文
 */
export function createExtensionContext(editor: {
  getWorkbook: () => import('./types').WorkbookEditorInterface
  getState: <T = unknown>() => T | null
  dispatch: (tr: unknown) => void
  getView: () => unknown | null
  executeCommand: (name: string, args?: unknown) => boolean
  registerCommand: (name: string, command: import('./types').CommandFn) => void
  unregisterCommand: (name: string) => void
  on: (event: string, handler: (data: unknown) => void) => void
  off: (event: string, handler: (data: unknown) => void) => void
  emit: (event: string, ...args: unknown[]) => void,
  registerNodeView: (nodeType: string, viewDesc: unknown) => void
  unregisterNodeView: (nodeType: string) => void
  registerPartView: (partType: string, viewDesc: unknown) => void
  unregisterPartView: (partType: string) => void
  registerLayout?: (algorithm: { name: string; layout: (node: any, options: any, styleEngine: any, state: any) => any }) => void
  unregisterLayout?: (name: string) => void
  registerPlugin?: (plugin: import('./types').PluginLike) => void
  unregisterPlugin?: (plugin: import('./types').PluginLike) => void
  registerWidgetPlugin?: (plugin: import('./types').WidgetPluginLike) => void
  unregisterWidgetPlugin?: (name: string) => void
  getContainer?: () => HTMLElement
  query?: <R = unknown>(event: string, ...args: unknown[]) => R | undefined
  registerQueryHandler?: (event: string, handler: (...args: unknown[]) => unknown) => void
  unregisterQueryHandler?: (event: string) => void
}): import('./types').ExtensionContext {
  return buildExtensionContext({
    storage: {},
    getWorkbook: editor.getWorkbook,
    getState: editor.getState,
    dispatch: editor.dispatch,
    getView: editor.getView,
    executeCommand: editor.executeCommand,
    registerCommand: editor.registerCommand,
    unregisterCommand: editor.unregisterCommand,
    on: editor.on,
    off: editor.off,
    emit: editor.emit,
    registerNodeView: editor.registerNodeView as (nodeType: string, viewDesc: import('./types').ViewDescConstructor) => void,
    unregisterNodeView: editor.unregisterNodeView,
    registerPartView: editor.registerPartView as (partType: string, viewDesc: import('./types').ViewDescConstructor) => void,
    unregisterPartView: editor.unregisterPartView,
    registerLayout: editor.registerLayout ?? (() => {}),
    unregisterLayout: editor.unregisterLayout ?? (() => {}),
    registerPlugin: editor.registerPlugin ?? (() => {}),
    unregisterPlugin: editor.unregisterPlugin ?? (() => {}),
    registerWidgetPlugin: editor.registerWidgetPlugin ?? (() => {}),
    unregisterWidgetPlugin: editor.unregisterWidgetPlugin ?? (() => {}),
    getContainer: editor.getContainer ?? (() => document.body),
    query: editor.query ?? (() => undefined),
    registerQueryHandler: editor.registerQueryHandler ?? (() => {}),
    unregisterQueryHandler: editor.unregisterQueryHandler ?? (() => {}),
  })
}
export { onDocEvent, offDocEvent } from './event-listener-utils'
export type { BaseEventMap, DragViewDesc } from './event-map'
