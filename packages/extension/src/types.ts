/**
 * Extension 系统类型定义
 *
 * 参考 Tiptap 设计：
 * - Extension 可以是类或实例
 * - .configure() 配置
 * - 支持 onCreate、addOptions、addStorage 钩子
 */

import type { BaseEventMap } from "./event-map"
export type { BaseEventMap }



/** 如果 T 是 void，则不需要 data 参数 */
type EmitData<T> = T extends void ? [] : [T]

// ==================== 扩展选项 ====================

/** 扩展选项（包含 enabled 标志） */
export type ExtensionOptions<T = {}> = T & {
  enabled?: boolean
}

// ==================== 扩展上下文 ====================

/** 扩展上下文 - 提供给扩展的编辑器接口 */
export interface ExtensionContext<Storage = Record<string, unknown>, Events extends Record<string, any> = {}> {
  /** 当前扩展的存储（由 addStorage 初始化） */
  storage: Storage
  /** 获取 WorkbookEditor 实例 */
  getWorkbook: () => WorkbookEditorInterface
  /** 获取当前状态 */
  getState: <T = unknown>() => T | null
  /** 分发事务 */
  dispatch: (tr: unknown) => void
  /** 获取视图（如果可用） */
  getView: () => unknown | null
  /** 执行命令 */
  executeCommand: (name: string, args?: unknown) => boolean
  /** 注册命令 */
  registerCommand: <S = unknown>(name: string, command: CommandFn<S>) => void
  /** 注销命令 */
  unregisterCommand: (name: string) => void
  /** 注册布局算法 */
  registerLayout: (algorithm: { name: string; layout: (node: any, options: any, styleEngine: any, state: any) => any }) => void
  /** 注销布局算法 */
  unregisterLayout: (name: string) => void
  /** 监听事件 */
  on: <K extends keyof (BaseEventMap & Events)>(event: K, handler: (data: (BaseEventMap & Events)[K]) => void) => void
  /** 注销事件监听 */
  off: <K extends keyof (BaseEventMap & Events)>(event: K, handler: (data: (BaseEventMap & Events)[K]) => void) => void
  /** 触发事件（已注册事件有完整类型，未注册事件用 string fallback） */
  emit: (<K extends keyof (BaseEventMap & Events)>(event: K, ...args: EmitData<(BaseEventMap & Events)[K]>) => void) & ((event: string, ...args: unknown[]) => void)
  /** 请求-响应查询（同步，返回 handler 的返回值；无 handler 返回 undefined） */
  query: <R = unknown>(event: string, ...args: unknown[]) => R | undefined
  /** 注册 query handler（一个 event 只能有一个 handler） */
  registerQueryHandler: (event: string, handler: (...args: unknown[]) => unknown) => void
  /** 注销 query handler */
  unregisterQueryHandler: (event: string) => void
  /** 注册 NodeViewDesc */
  registerNodeView: (nodeType: string, viewDesc: ViewDescConstructor) => void
  /** 注销 NodeViewDesc */
  unregisterNodeView: (nodeType: string) => void
  /** 注册 PartViewDesc */
  registerPartView: (partType: string, viewDesc: ViewDescConstructor) => void
  /** 注销 PartViewDesc */
  unregisterPartView: (partType: string) => void
  /** 注册 Plugin */
  registerPlugin: (plugin: PluginLike) => void
  /** 注销 Plugin */
  unregisterPlugin: (plugin: PluginLike) => void
  /** 注册 ViewPlugin（用于 Widget Decoration） */
  registerWidgetPlugin: (plugin: WidgetPluginLike) => void
  /** 注销 ViewPlugin */
  unregisterWidgetPlugin: (name: string) => void
  /** 获取 sheet DOM 容器 */
  getContainer: () => HTMLElement
}

/** ViewDesc 构造函数类型（跨包使用，避免依赖 @tomind/view） */
export type ViewDescConstructor = new (...args: any[]) => any

/** 主题数据结构（内联定义，避免循环依赖） */
type ThemeDataInline = Record<string, { id?: string; properties: Record<string, string | number | boolean | null | undefined> } | Record<string, string> | undefined>

/** 样式引擎接口（避免循环依赖） */
export interface StyleEngineInterface {
  loadTheme: (pkg: { id: string; name?: string; skeleton?: ThemeDataInline; color?: ThemeDataInline }) => void
  setActiveTheme: (themeId: string) => void
  getActiveThemeId: () => string | null
  getActiveTheme: () => ThemeDataInline | null
  computeStyle: (state: any, topicId: string, options?: any) => any
  getLeaferStyle: (state: any, topicId: string, options?: any) => Record<string, unknown>
}

/** WorkbookEditor 接口（避免循环依赖） */
export interface WorkbookEditorInterface {
  /** 是否可编辑（初始值创建时决定，默认 false） */
  editable: boolean
  /** 样式引擎 */
  styleEngine?: StyleEngineInterface
  /** 布局引擎 */
  layoutEngine?: unknown
  /** 切换编辑模式 */
  toggleEditable: () => boolean
  /** 获取活动 Sheet */
  getActiveSheet: () => unknown | null
  /** 执行命令 */
  executeCommand: (name: string, args?: unknown) => boolean
  /** 监听事件 */
  on: (event: string, handler: (data: unknown) => void) => void
  /** 注销事件监听 */
  off: (event: string, handler: (data: unknown) => void) => void
  /** 触发事件 */
  emit: (event: string, data?: unknown) => void
  /** 处理快捷键 */
  handleKeyboardShortcut?: (shortcut: string) => boolean
  /** XAP 资源管理器 */
  xap?: import('@tomind/xap').XAPSystem
}

/** Plugin 最小接口（避免依赖 @tomind/state） */
/** ViewPlugin 最小接口（避免依赖 @tomind/plugins） */
export interface WidgetPluginLike {
  readonly name: string
  decorations(state: unknown): unknown[]
  widgetViewFactory?: (widgetType: string, widgetId: string, node: unknown) => { element: unknown } | null
}

export interface PluginLike {
  readonly key: { readonly name: string }
}

/** 命令函数 */
export type CommandFn<S = unknown> = (state: S, dispatch: ((tr: unknown) => void) | null, args?: unknown) => boolean

/** 事件处理器 */
export type EventHandler = (data: unknown) => void

/** 快捷键处理器 */
export type KeyboardShortcutHandler = (ctx: ExtensionContext<any>) => boolean

// ==================== 扩展类型 ====================

/** 扩展类型 */
export type ExtensionType = 'extension' | 'node' | 'part'

/** 扩展定义（Tiptap 风格） */
export interface Extension<Options = {}, Storage = Record<string, unknown>, Events extends Record<string, any> = {}> {
  /** 扩展名称 */
  name: string
  /** 扩展类型 */
  type: ExtensionType
  /** 默认选项 */
  defaultOptions: ExtensionOptions<Options>
  /** 配置选项（返回新实例，不可变） */
  configure: (options: Partial<ExtensionOptions<Options>>) => Extension<Options, Storage, Events>
  /** 生命周期：创建（Tiptap 风格） */
  onCreate?: (ctx: ExtensionContext<Storage, Events>) => CleanupFn | void
  /** 生命周期：DOM 挂载（sheet 容器就绪后调用，适合 DOM overlay 插件） */
  onDOMMount?: (ctx: ExtensionContext<Storage, Events>, container: HTMLElement) => CleanupFn | void
  /** 添加选项 */
  addOptions?: () => Partial<Options> | Record<string, unknown>
  /** 添加存储 */
  addStorage?: () => Storage
  /** 运行时存储（由 ExtensionManager 在初始化时注入） */
  storage?: Storage
  /** 生命周期：销毁 */
  destroy?: () => void
  /** 命令定义 */
  commands?: Record<string, CommandFn>
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
  emit(event: string, data?: unknown): void
  /** 监听事件 */
  on(event: string, handler: (data: unknown) => void): void
  /** 注销事件监听 */
  off(event: string, handler: (data: unknown) => void): void
}

/**
 * 命令参数类型断言辅助
 *
 * CommandFn 的 args 参数类型为 unknown，
 * 调用方必须确认参数结构。parseArgs 集中这一断言。
 *
 * @example
 * const { nodeId } = parseArgs<{ nodeId: string }>(args)
 * const { x, y } = parseArgs<{ x: number; y: number }>(args, { x: 0, y: 0 })
 */
export function parseArgs<T>(args: unknown, fallback?: T): T {
  if (args != null && typeof args === 'object') return args as T
  return (fallback ?? {}) as T
}

/**
 * ExtensionContext 桥接构建器
 *
 * 接受松散签名的实现对象，返回类型安全的 ExtensionContext。
 * 桥接层只需调用此函数，无需 as 断言。
 */
export function buildExtensionContext(impl: {
  storage: Record<string, unknown>
  getWorkbook: () => WorkbookEditorInterface
  getState: <T = unknown>() => T | null
  dispatch: (tr: unknown) => void
  getView: () => unknown | null
  executeCommand: (name: string, args?: unknown) => boolean
  registerCommand: (name: string, command: CommandFn) => void
  unregisterCommand: (name: string) => void
  registerLayout: (algorithm: { name: string; layout: (node: any, options: any, styleEngine: any, state: any) => any }) => void
  unregisterLayout: (name: string) => void
  on: (event: string, handler: EventHandler) => void
  off: (event: string, handler: EventHandler) => void
  emit: (event: string, data?: unknown) => void
  registerNodeView: (nodeType: string, viewDesc: ViewDescConstructor) => void
  unregisterNodeView: (nodeType: string) => void
  registerPartView: (partType: string, viewDesc: ViewDescConstructor) => void
  unregisterPartView: (partType: string) => void
  registerPlugin: (plugin: PluginLike) => void
  unregisterPlugin: (plugin: PluginLike) => void
  registerWidgetPlugin: (plugin: WidgetPluginLike) => void
  unregisterWidgetPlugin: (name: string) => void
  getContainer: () => HTMLElement
  query: <R = unknown>(event: string, ...args: unknown[]) => R | undefined
  registerQueryHandler: (event: string, handler: (...args: unknown[]) => unknown) => void
  unregisterQueryHandler: (event: string) => void
}): ExtensionContext {
  return impl as ExtensionContext
}
