/**
 * ExtensionManager — 扩展管理器
 *
 * 管理扩展的生命周期、命令注册、事件系统、快捷键
 * 支持 Tiptap 风格的 onCreate、addOptions、addStorage 钩子
 */

import type {
  Extension,
  ExtensionContext,
  ExtensionManager as IExtensionManager,
  EventHandler,
  KeyboardShortcutHandler,
  CommandFn
} from './types'

/**
 * 扩展管理器实现
 */
export class ExtensionManager implements IExtensionManager {
  private _extensions = new Map<string, Extension>()
  private _cleanupFns = new Map<string, () => void>()
  private _ctx: ExtensionContext | null = null
  private _eventHandlers = new Map<string, Set<EventHandler>>()
  private _commands = new Map<string, CommandFn>()
  private _keyboardShortcuts = new Map<string, KeyboardShortcutHandler>()

  /**
   * 注册扩展
   */
  register(extension: Extension): void {
    if (this._extensions.has(extension.name)) {
      console.warn(`Extension "${extension.name}" is already registered, replacing...`)
      this.unregister(extension.name)
    }

    this._extensions.set(extension.name, extension)

    // 注册扩展的命令
    if (extension.commands) {
      for (const [cmdName, cmdFactory] of Object.entries(extension.commands)) {
        const fullName = `${extension.name}.${cmdName}`
        this._commands.set(fullName, cmdFactory as unknown as CommandFn)
      }
    }
  }

  /**
   * 注销扩展
   */
  unregister(name: string): void {
    const extension = this._extensions.get(name)
    if (!extension) return

    this.cleanupExtension(name)

    if (extension.commands) {
      for (const cmdName of Object.keys(extension.commands)) {
        const fullName = `${name}.${cmdName}`
        this._commands.delete(fullName)
      }
    }

    this._extensions.delete(name)
  }

  /**
   * 获取扩展
   */
  getExtension(name: string): Extension | undefined {
    return this._extensions.get(name)
  }

  /**
   * 获取所有扩展
   */
  getExtensions(): Extension[] {
    return Array.from(this._extensions.values())
  }

  /**
   * 初始化所有扩展
   */
  setup(ctx: ExtensionContext): void {
    this._ctx = ctx

    for (const [name, extension] of this._extensions) {
      if (!extension.isEnabled()) continue

      // 调用 addOptions 合并选项
      if (extension.addOptions) {
        const extraOptions = extension.addOptions()
        extension.defaultOptions = { ...extension.defaultOptions, ...extraOptions }
      }

      // 调用 addStorage 初始化存储
      if (extension.addStorage) {
        const storage = extension.addStorage()
        ;(extension as any).storage = storage
      }

      // 调用 addNodeView 注册 NodeView（Tiptap 风格）
      if (extension.type === 'node' && extension.addNodeView) {
        const NodeViewClass = extension.addNodeView()
        ctx.registerNodeView(name, NodeViewClass)
      }

      // 调用 addCommands 注册命令（Tiptap 风格）
      if (extension.addCommands) {
        const commands = extension.addCommands()
        for (const [cmdName, cmdFn] of Object.entries(commands)) {
          const fullName = `${name}.${cmdName}`
          ctx.registerCommand(fullName, cmdFn)
        }
      }

      // 调用 addLayout 注册布局算法（Tiptap 风格）
      if (extension.addLayout) {
        const layoutAlgorithm = extension.addLayout()
        ctx.registerLayout(layoutAlgorithm)
      }

      // 调用 onCreate 钩子（Tiptap 风格）
      // 注入 per-extension storage 到 ctx
      if (extension.onCreate) {
        const storage = (extension as any).storage ?? {}
        const extensionCtx: ExtensionContext = { ...ctx, storage }
        const cleanup = extension.onCreate(extensionCtx)
        if (cleanup) {
          this._cleanupFns.set(name, cleanup)
        }
      }
    }

    // 注册快捷键
    this.setupKeyboardShortcuts(ctx)
  }

  /**
   * 销毁所有扩展
   */
  destroy(): void {
    for (const [name, cleanup] of this._cleanupFns) {
      try {
        cleanup()
      } catch (error) {
        console.error(`Error cleaning up extension "${name}":`, error)
      }
    }
    this._cleanupFns.clear()

    for (const [name, extension] of this._extensions) {
      try {
        extension.destroy?.()
      } catch (error) {
        console.error(`Error destroying extension "${name}":`, error)
      }
    }

    this._extensions.clear()
    this._commands.clear()
    this._eventHandlers.clear()
    this._keyboardShortcuts.clear()
    this._ctx = null
  }

  /**
   * 更新状态
   */
  updateState(state: unknown): void {
    this.emit('stateUpdate', state)
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: unknown[]): void {
    const handlers = this._eventHandlers.get(event)
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(...args)
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error)
        }
      }
    }
  }

  /**
   * 监听事件
   */
  on(event: string, handler: EventHandler): void {
    if (!this._eventHandlers.has(event)) {
      this._eventHandlers.set(event, new Set())
    }
    this._eventHandlers.get(event)!.add(handler)
  }

  /**
   * 注销事件监听
   */
  off(event: string, handler: EventHandler): void {
    this._eventHandlers.get(event)?.delete(handler)
  }

  /**
   * 执行命令
   */
  executeCommand(name: string, args?: unknown): boolean {
    const command = this._commands.get(name)
    if (!command) {
      console.warn(`Command "${name}" not found`)
      return false
    }

    if (!this._ctx) {
      console.warn('ExtensionManager not setup')
      return false
    }

    const state = this._ctx.getState()
    const dispatch = this._ctx.dispatch
    return command(state, dispatch, args)
  }

  /**
   * 处理键盘快捷键
   */
  handleKeyboardShortcut(shortcut: string): boolean {
    const handler = this._keyboardShortcuts.get(shortcut)
    if (!handler || !this._ctx) {
      return false
    }

    try {
      return handler(this._ctx)
    } catch (error) {
      console.error(`Error handling keyboard shortcut "${shortcut}":`, error)
      return false
    }
  }

  /**
   * 获取所有注册的快捷键
   */
  getKeyboardShortcuts(): Map<string, KeyboardShortcutHandler> {
    return new Map(this._keyboardShortcuts)
  }

  /**
   * 清理单个扩展
   */
  private cleanupExtension(name: string): void {
    const cleanup = this._cleanupFns.get(name)
    if (cleanup) {
      try {
        cleanup()
      } catch (error) {
        console.error(`Error cleaning up extension "${name}":`, error)
      }
      this._cleanupFns.delete(name)
    }
  }

  /**
   * 设置快捷键（Tiptap 风格）
   */
  private setupKeyboardShortcuts(ctx: ExtensionContext): void {
    this._keyboardShortcuts.clear()

    for (const [, extension] of this._extensions) {
      if (!extension.isEnabled()) continue

      // Tiptap 风格：addKeyboardShortcuts()
      if (extension.addKeyboardShortcuts) {
        const shortcuts = extension.addKeyboardShortcuts()
        for (const [key, handler] of Object.entries(shortcuts)) {
          this._keyboardShortcuts.set(key, handler)
        }
      }

      // 旧方式：shortcuts
      if (extension.shortcuts) {
        for (const [shortcut, commandName] of Object.entries(extension.shortcuts)) {
          this._keyboardShortcuts.set(shortcut, () => {
            this.executeCommand(commandName)
            return true
          })
        }
      }
    }
  }
}
