/**
 * Extension 系统类型定义
 *
 * 参考 Tiptap 设计：
 * - Extension 可以是类或实例
 * - .configure() 配置
 * - 支持 onCreate、addOptions、addStorage 钩子
 */

// ==================== 扩展选项 ====================

/** 扩展选项（包含 enabled 标志） */
export type ExtensionOptions<T = {}> = T & {
  enabled?: boolean
}

// ==================== 扩展上下文 ====================

/** 扩展上下文 - 提供给扩展的编辑器接口 */
export interface ExtensionContext {
  /** 当前扩展的存储（由 addStorage 初始化） */
  storage: Record<string, unknown>
  /** 获取 WorkbookEditor 实例 */
  getWorkbook: () => WorkbookEditorInterface
  /** 获取当前状态 */
  getState: () => unknown
  /** 分发事务 */
  dispatch: (tr: unknown) => void
  /** 获取视图（如果可用） */
  getView: () => unknown | null
  /** 执行命令 */
  executeCommand: (name: string, args?: unknown) => boolean
  /** 注册命令 */
  registerCommand: (name: string, command: CommandFn) => void
  /** 注销命令 */
  unregisterCommand: (name: string) => void
  /** 注册布局算法 */
  registerLayout: (algorithm: { name: string; layout: (node: any, options: any, styleEngine: any, state: any) => any }) => void
  /** 注销布局算法 */
  unregisterLayout: (name: string) => void
  /** 监听事件 */
  on: (event: string, handler: EventHandler) => void
  /** 注销事件监听 */
  off: (event: string, handler: EventHandler) => void
  /** 触发事件 */
  emit: (event: string, ...args: unknown[]) => void
  /** 注册 NodeViewDesc */
  registerNodeView: (nodeType: string, viewDesc: unknown) => void
  /** 注销 NodeViewDesc */
  unregisterNodeView: (nodeType: string) => void
  /** 注册 PartViewDesc */
  registerPartView: (partType: string, viewDesc: unknown) => void
  /** 注销 PartViewDesc */
  unregisterPartView: (partType: string) => void
}

/** WorkbookEditor 接口（避免循环依赖） */
export interface WorkbookEditorInterface {
  /** 是否可编辑（初始值创建时决定，默认 false） */
  editable: boolean
  /** 切换编辑模式 */
  toggleEditable: () => boolean
  /** 获取活动 Sheet */
  getActiveSheet: () => unknown | null
  /** 执行命令 */
  executeCommand: (name: string, args?: unknown) => boolean
  /** 监听事件 */
  on: (event: string, handler: EventHandler) => void
  /** 注销事件监听 */
  off: (event: string, handler: EventHandler) => void
  /** 触发事件 */
  emit: (event: string, ...args: unknown[]) => void
  /** 处理快捷键 */
  handleKeyboardShortcut?: (shortcut: string) => boolean
  /** XAP 资源管理器 */
  xap?: import('@tomind/xap').XAPSystem
}

/** 命令函数 */
export type CommandFn = (state: unknown, dispatch: ((tr: unknown) => void) | null, args?: unknown) => boolean

/** 事件处理器 */
export type EventHandler = (...args: unknown[]) => void

/** 快捷键处理器 */
export type KeyboardShortcutHandler = (ctx: ExtensionContext) => boolean

// ==================== 扩展类型 ====================

/** 扩展类型 */
export type ExtensionType = 'extension' | 'node' | 'part'

/** 扩展定义（Tiptap 风格） */
export interface Extension<Options = {}> {
  /** 扩展名称 */
  name: string
  /** 扩展类型 */
  type: ExtensionType
  /** 默认选项 */
  defaultOptions: ExtensionOptions<Options>
  /** 配置选项（返回新实例，不可变） */
  configure: (options: Partial<ExtensionOptions<Options>>) => Extension<Options>
  /** 生命周期：创建（Tiptap 风格） */
  onCreate?: (ctx: ExtensionContext) => CleanupFn | void
  /** 添加选项 */
  addOptions?: () => Partial<Options> | Record<string, unknown>
  /** 添加存储 */
  addStorage?: () => Record<string, unknown>
  /** 生命周期：销毁 */
  destroy?: () => void
  /** 命令定义 */
  commands?: Record<string, (...args: unknown[]) => CommandFn>
  /** 快捷键映射（旧方式） */
  shortcuts?: Record<string, string>
  /** 添加快捷键（Tiptap 风格） */
  addKeyboardShortcuts?: () => Record<string, KeyboardShortcutHandler>
  /** 添加 NodeView（Tiptap 风格，仅 type='node' 时有效） */
  addNodeView?: () => new (...args: any[]) => any
  /** 添加命令（Tiptap 风格） */
  addCommands?: () => Record<string, (...args: any[]) => any>
  /** 添加布局算法（Tiptap 风格） */
  addLayout?: () => { name: string; layout: (node: any, options: any, styleEngine: any, state: any) => any }
  /** 是否启用 */
  isEnabled: () => boolean
}

/** 清理函数 */
export type CleanupFn = () => void

// ==================== StarterKit ====================

/** StarterKit 配置 */
export interface StarterKitOptions {
  /** 启用的扩展（默认全部） */
  extensions?: (Extension | false)[]
  /** 按名称配置扩展 */
  [key: string]: unknown
}

// ==================== 扩展管理器 ====================

/** 扩展管理器接口 */
export interface ExtensionManager {
  /** 注册扩展 */
  register(extension: Extension): void
  /** 注销扩展 */
  unregister(name: string): void
  /** 获取扩展 */
  getExtension(name: string): Extension | undefined
  /** 获取所有扩展 */
  getExtensions(): Extension[]
  /** 初始化所有扩展 */
  setup(ctx: ExtensionContext): void
  /** 销毁所有扩展 */
  destroy(): void
  /** 更新状态 */
  updateState(state: unknown): void
  /** 触发事件 */
  emit(event: string, ...args: unknown[]): void
  /** 监听事件 */
  on(event: string, handler: EventHandler): void
  /** 注销事件监听 */
  off(event: string, handler: EventHandler): void
}
