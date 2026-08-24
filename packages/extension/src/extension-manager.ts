/**
 * ExtensionManager — 扩展管理器
 *
 * 生命周期：
 *   register(ext) → 存储扩展，若 ctx 已就绪则立即初始化
 *   setup(ctx)    → 设置上下文，批量初始化所有已注册扩展
 *   destroy()     → 清理所有扩展
 *
 * 初始化路径唯一：所有扩展通过 initializeExtension() 完成完整生命周期
 */
import type {
  Extension,
  ExtensionContext,
  ExtensionManager as IExtensionManager,
  EventHandler,
  KeyboardShortcutHandler,
  CommandFn
} from './types'

export class ExtensionManager implements IExtensionManager {
  private _extensions = new Map<string, Extension<any, any>>
  private _initialized = new Set<string>()
  private _cleanupFns = new Map<string, () => void>()
  private _ctx: ExtensionContext | null = null
  private _eventHandlers = new Map<string, Set<EventHandler>>()
  private _commands = new Map<string, CommandFn>()
  private _keyboardShortcuts = new Map<string, KeyboardShortcutHandler>()

  // ==================== 注册 / 注销 ====================

  /**
   * 注册扩展
   * - 若 ctx 未就绪（setup 前）：仅存储，等 setup 批量初始化
   * - 若 ctx 已就绪（setup 后）：存储 + 立即初始化
   */
  register(extension: Extension): void {
    if (this._extensions.has(extension.name)) {
      console.warn(`Extension "${extension.name}" is already registered, replacing...`)
      this.unregister(extension.name)
    }

    this._extensions.set(extension.name, extension)

    // 注册旧式 commands（兼容）
    if (extension.commands) {
      for (const [cmdName, cmdFactory] of Object.entries(extension.commands)) {
        const fullName = `${extension.name}.${cmdName}`
        this._commands.set(fullName, cmdFactory as unknown as CommandFn)
      }
    }

    // ctx 已就绪 → 立即初始化
    if (this._ctx) {
      this.initializeExtension(extension, this._ctx)
      this.rebuildKeyboardShortcuts()
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
    this._initialized.delete(name)

    // 重建快捷键（移除该扩展的快捷键）
    if (this._ctx) {
      this.rebuildKeyboardShortcuts()
    }
  }

  // ==================== 查询 ====================

  getExtension(name: string): Extension | undefined {
    return this._extensions.get(name)
  }

  getExtensions(): Extension[] {
    return Array.from(this._extensions.values())
  }

  isSetup(): boolean {
    return this._ctx !== null
  }

  // ==================== 初始化 ====================

  /**
   * 初始化所有扩展（幂等：已 setup 则跳过）
   */
  setup(ctx: ExtensionContext): void {
    this._ctx = ctx

    for (const [, extension] of this._extensions) {
      if (this._initialized.has(extension.name)) continue
      this.initializeExtension(extension, ctx)
    }

    this.rebuildKeyboardShortcuts()
  }

  /**
   * 单个扩展的完整初始化（唯一初始化路径）
   */
  private initializeExtension(extension: Extension, ctx: ExtensionContext): void {
    if (!extension.isEnabled()) return
    if (this._initialized.has(extension.name)) return

    // 1. addOptions
    if (extension.addOptions) {
      const extraOptions = extension.addOptions()
      extension.defaultOptions = { ...extension.defaultOptions, ...extraOptions }
    }

    // 2. addStorage
    if (extension.addStorage) {
      const storage = extension.addStorage()
      extension.storage = storage
    }

    // 3. addNodeView
    if (extension.type === 'node' && extension.addNodeView) {
      const NodeViewClass = extension.addNodeView()
      ctx.registerNodeView(extension.name, NodeViewClass)
    }

    // 4. addCommands
    if (extension.addCommands) {
      const commands = extension.addCommands()
      for (const [cmdName, cmdFn] of Object.entries(commands)) {
        const fullName = `${extension.name}.${cmdName}`
        ctx.registerCommand(fullName, cmdFn)
      }
    }

    // 5. addLayout
    if (extension.addLayout) {
      const layoutAlgorithm = extension.addLayout()
      ctx.registerLayout(layoutAlgorithm)
    }

    // 6. onCreate
    if (extension.onCreate) {
      const storage = extension.storage ?? {}
      const extensionCtx: ExtensionContext = { ...ctx, storage }
      const cleanup = extension.onCreate(extensionCtx)
      if (cleanup) {
        this._cleanupFns.set(extension.name, cleanup)
      }
    }

    this._initialized.add(extension.name)
  }

  /**
   * 重建所有快捷键（清除 + 从所有已启用扩展重新收集）
   */
  private rebuildKeyboardShortcuts(): void {
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

      // 旧方式：shortcuts（string → command name 映射）
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

  // ==================== 销毁 ====================

  destroy(): void {
    for (const [name, cleanup] of this._cleanupFns) {
      try { cleanup() } catch (e) { console.error(`Cleanup error "${name}":`, e) }
    }
    this._cleanupFns.clear()

    for (const [name, extension] of this._extensions) {
      try { extension.destroy?.() } catch (e) { console.error(`Destroy error "${name}":`, e) }
    }

    this._extensions.clear()
    this._initialized.clear()
    this._commands.clear()
    this._eventHandlers.clear()
    this._keyboardShortcuts.clear()
    this._ctx = null
  }

  // ==================== 事件系统 ====================

  emit(event: string, ...args: unknown[]): void {
    const handlers = this._eventHandlers.get(event)
    if (handlers) {
      for (const handler of handlers) {
        try { handler(...args) } catch (e) { console.error(`Event error "${event}":`, e) }
      }
    }
  }

  on(event: string, handler: EventHandler): void {
    if (!this._eventHandlers.has(event)) {
      this._eventHandlers.set(event, new Set())
    }
    this._eventHandlers.get(event)!.add(handler)
  }

  off(event: string, handler: EventHandler): void {
    this._eventHandlers.get(event)?.delete(handler)
  }

  updateState(state: unknown): void {
    this.emit('stateUpdate', state)
  }

  // ==================== 命令系统 ====================

  executeCommand(name: string, args?: unknown): boolean {
    const command = this._commands.get(name)
    if (!command) { console.warn(`Command "${name}" not found`); return false }
    if (!this._ctx) { console.warn('ExtensionManager not setup'); return false }

    const state = this._ctx.getState()
    const dispatch = this._ctx.dispatch
    return command(state, dispatch, args)
  }

  registerCommand<S = unknown>(name: string, command: CommandFn<S>): void {
    this._commands.set(name, command as CommandFn<unknown>)
  }

  unregisterCommand(name: string): void {
    this._commands.delete(name)
  }

  handleKeyboardShortcut(shortcut: string): boolean {
    const handler = this._keyboardShortcuts.get(shortcut)
    if (!handler || !this._ctx) return false
    try { return handler(this._ctx) } catch (e) {
      console.error(`Shortcut error "${shortcut}":`, e)
      return false
    }
  }

  getKeyboardShortcuts(): Map<string, KeyboardShortcutHandler> {
    return new Map(this._keyboardShortcuts)
  }

  // ==================== 内部工具 ====================

  private cleanupExtension(name: string): void {
    const cleanup = this._cleanupFns.get(name)
    if (cleanup) {
      try { cleanup() } catch (e) { console.error(`Cleanup error "${name}":`, e) }
      this._cleanupFns.delete(name)
    }
  }
}
