/**
 * Extension 系统
 *
 * 参考 Tiptap 设计：
 * - Extension/Node/Part 三种类型
 * - .configure() 配置
 */

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
} from './types'

// 实现导出
export { createExtension, createNodeExtension, createPartExtension, isExtension } from './create-extension'
export { ExtensionManager } from './extension-manager'

/**
 * 创建扩展上下文
 *
 * 用于将编辑器接口转换为扩展上下文
 */
export function createExtensionContext(editor: {
  getWorkbook: () => import('./types').WorkbookEditorInterface
  getState: () => unknown
  dispatch: (tr: unknown) => void
  getView: () => unknown | null
  executeCommand: (name: string, args?: unknown) => boolean
  registerCommand: (name: string, command: import('./types').CommandFn) => void
  unregisterCommand: (name: string) => void
  on: (event: string, handler: import('./types').EventHandler) => void
  off: (event: string, handler: import('./types').EventHandler) => void
  emit: (event: string, ...args: unknown[]) => void
  registerNodeView: (nodeType: string, viewDesc: unknown) => void
  unregisterNodeView: (nodeType: string) => void
  registerPartView: (partType: string, viewDesc: unknown) => void
  unregisterPartView: (partType: string) => void
  registerLayout?: (algorithm: { name: string; layout: (node: any, options: any, styleEngine: any, state: any) => any }) => void
  unregisterLayout?: (name: string) => void
}): import('./types').ExtensionContext {
  return {
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
    registerNodeView: editor.registerNodeView,
    unregisterNodeView: editor.unregisterNodeView,
    registerPartView: editor.registerPartView,
    unregisterPartView: editor.unregisterPartView,
    registerLayout: editor.registerLayout ?? (() => {}),
    unregisterLayout: editor.unregisterLayout ?? (() => {}),
  }
}
