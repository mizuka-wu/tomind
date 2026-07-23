/**
 * WorkbookEditor — 工作簿编辑器
 *
 * 管理多个 SheetEditor 实例，对标 ProseMirror 的多文档编辑
 *
 * 职责：
 * 1. 管理多个 SheetEditor 实例
 * 2. 全局扩展管理（安装到 Workbook 级别）
 * 3. Sheet 间的协调（如复制粘贴、拖拽）
 *
 * 设计原则：
 * - Workbook 级别的扩展管理
 * - Sheet 级别的状态管理
 * - 共享的 StyleEngine 和 LayoutEngine
 */

import type { SheetState } from '@tomind/state'
import { SheetEditor } from './sheet-editor'
import { ExtensionManager } from '@tomind/extension'
import type { Extension, ExtensionContext, CommandFn, EventHandler, WorkbookEditorInterface } from '@tomind/extension'
import type { StyleEngine } from '@tomind/style'
import type { ResolvedStyle, NodeType } from '@tomind/style'
import type { LayoutEngine } from '@tomind/layout'
import { registerLayout, unregisterLayout } from '@tomind/layout'
import type { CommandManager } from '@tomind/commands'
import type { XAPSystem } from '@tomind/xap'

// ==================== 类型定义 ====================

/** Sheet 配置 */
export interface SheetConfig {
  /** Sheet ID */
  id: string
  /** Sheet 名称 */
  name: string
  /** 初始状态 */
  state: SheetState
  /** DOM 容器 */
  dom: HTMLElement
}

/** OverridedStyle 配置 */
export interface OverridedStyleConfig {
  /** 布局模式样式映射：level → NodeType → 样式覆盖 */
  layoutModes?: Record<string, Record<NodeType, Partial<ResolvedStyle>>>
}

/** 显示配置 */
export interface DisplayConfig {
  /** 主题列表 */
  themes: import('@tomind/style').ThemePackage[]
  /** 默认颜色主题 ID */
  defaultThemeId?: string
  /** 默认骨架主题 ID */
  defaultSkeletonId?: string
}

/** WorkbookEditor 选项 */
export interface WorkbookEditorOptions {
  /** 共享的 StyleEngine */
  styleEngine: StyleEngine
  /** 共享的 LayoutEngine */
  layoutEngine: LayoutEngine
  /** 共享的 CommandManager */
  commandManager?: CommandManager
  /** 扩展列表（参考 Tiptap） */
  extensions?: Extension[]
  /** 是否可编辑（默认 false） */
  editable?: boolean
  /** 样式覆盖配置 */
  overridedStyle?: OverridedStyleConfig
  /** XAP 资源管理器 */
  xap?: XAPSystem
  /** 显示配置 */
  displayConfig?: DisplayConfig
}

// ==================== WorkbookEditor ====================

/**
 * WorkbookEditor — 工作簿编辑器
 *
 * 管理多个 SheetEditor 实例，提供全局扩展管理
 *
 * @example
 * ```typescript
 * const workbook = new WorkbookEditor({
 *   styleEngine,
 *   layoutEngine,
 *   editable: true,
 *   extensions: [
 *     StarterKit,
 *     SelectionExtension.configure({ multiSelect: true }),
 *     DragDropExtension,
 *   ],
 * })
 *
 * // 添加 Sheet
 * const sheet1 = workbook.addSheet({
 *   id: 'sheet-1',
 *   name: 'Main Sheet',
 *   state: initialState,
 *   dom: container1,
 * })
 *
 * // 切换活动 Sheet
 * workbook.setActiveSheet('sheet-1')
 *
 * // 设置只读模式
 * workbook.editable = false
 *
 * // 销毁
 * workbook.destroy()
 * ```
 */
export class WorkbookEditor implements WorkbookEditorInterface {
  readonly styleEngine: StyleEngine
  readonly layoutEngine: LayoutEngine
  readonly commandManager: CommandManager | undefined
  readonly extensionManager: ExtensionManager
  /** XAP 资源管理器 */
  readonly xap: XAPSystem | undefined

  /** 是否可编辑（初始值创建时决定，默认 false） */
  editable: boolean

  private _sheets = new Map<string, SheetEditor>()
  private _activeSheetId: string | null = null
  private _extensionContext: ExtensionContext | null = null

  constructor(options: WorkbookEditorOptions) {
    this.styleEngine = options.styleEngine
    this.layoutEngine = options.layoutEngine
    this.commandManager = options.commandManager
    this.editable = options.editable ?? false
    this.xap = options.xap

    // 加载主题
    if (options.displayConfig) {
      const { themes, defaultThemeId, defaultSkeletonId } = options.displayConfig
      if (themes && themes.length > 0) {
        for (const theme of themes) {
          this.styleEngine.loadTheme(theme)
        }
        // 设置默认主题
        if (defaultThemeId) {
          this.styleEngine.setActiveTheme(defaultThemeId)
        } else {
          this.styleEngine.setActiveTheme(themes[0].id)
        }
      }
    }

    // 初始化布局模式样式
    if (options.overridedStyle?.layoutModes) {
      this.styleEngine.setLayoutModes(options.overridedStyle.layoutModes)
    }

    // 注入 StyleEngine 到 LayoutEngine
    this.layoutEngine.setStyleEngine(this.styleEngine)

    // 初始化扩展管理器
    this.extensionManager = new ExtensionManager()

    // 注册扩展（参考 Tiptap）
    if (options.extensions) {
      for (const ext of options.extensions) {
        this.extensionManager.register(ext)
      }
    }
  }

  // ==================== Sheet 管理 ====================

  /**
   * 添加 Sheet
   */
  addSheet(config: SheetConfig): SheetEditor {
    if (this._sheets.has(config.id)) {
      throw new Error(`Sheet "${config.id}" already exists`)
    }

    // 创建 SheetEditor
    const sheet = new SheetEditor({
      dom: config.dom,
      state: config.state,
      styleEngine: this.styleEngine,
      layoutEngine: this.layoutEngine,
      commandManager: this.commandManager,
    })

    // 注入 WorkbookEditor 引用
    sheet._workbookEditor = this

    this._sheets.set(config.id, sheet)

    // 如果是第一个 Sheet，设为活动 Sheet
    if (this._activeSheetId === null) {
      this._activeSheetId = config.id
    }

    // 注册 Workbook 级别的扩展到 Sheet
    this.registerExtensionsToSheet(sheet)

    return sheet
  }

  /**
   * 移除 Sheet
   */
  removeSheet(id: string): void {
    const sheet = this._sheets.get(id)
    if (!sheet) return

    // 销毁 Sheet
    sheet.destroy()
    this._sheets.delete(id)

    // 如果移除的是活动 Sheet，切换到其他 Sheet
    if (this._activeSheetId === id) {
      const remaining = Array.from(this._sheets.keys())
      this._activeSheetId = remaining.length > 0 ? remaining[0] : null
    }
  }

  /**
   * 获取 Sheet
   */
  getSheet(id: string): SheetEditor | undefined {
    return this._sheets.get(id)
  }

  /**
   * 获取所有 Sheet ID
   */
  getSheetIds(): string[] {
    return Array.from(this._sheets.keys())
  }

  /**
   * 获取活动 Sheet
   */
  getActiveSheet(): SheetEditor | null {
    if (!this._activeSheetId) return null
    return this._sheets.get(this._activeSheetId) ?? null
  }

  /**
   * 设置活动 Sheet
   */
  setActiveSheet(id: string): void {
    if (!this._sheets.has(id)) {
      throw new Error(`Sheet "${id}" not found`)
    }
    this._activeSheetId = id
  }

  /**
   * 获取活动 Sheet ID
   */
  get activeSheetId(): string | null {
    return this._activeSheetId
  }

  /**
   * 将 Workbook 级别的扩展注册到 Sheet
   */
  private registerExtensionsToSheet(sheet: SheetEditor): void {
    const extensions = this.extensionManager.getExtensions()
    for (const ext of extensions) {
      sheet.registerExtension(ext)
    }
  }

  // ==================== 事件系统 ====================

  /**
   * 监听事件
   */
  on(event: string, handler: EventHandler): void {
    this.extensionManager.on(event, handler)
  }

  /**
   * 注销事件监听
   */
  off(event: string, handler: EventHandler): void {
    this.extensionManager.off(event, handler)
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: unknown[]): void {
    this.extensionManager.emit(event, ...args)
  }

  // ==================== 命令系统 ====================

  /**
   * 执行命令
   */
  executeCommand(name: string, args?: unknown): boolean {
    // 先在 Workbook 级别执行
    const result = this.extensionManager.executeCommand(name, args)
    if (result) return true

    // 如果 Workbook 级别没有，在活动 Sheet 执行
    const activeSheet = this.getActiveSheet()
    if (activeSheet) {
      const sheetResult = activeSheet.executeCommand(name, args)
      return sheetResult.success
    }

    return false
  }

  // ==================== 快捷键系统 ====================

  /**
   * 切换编辑模式
   */
  toggleEditable(): boolean {
    this.editable = !this.editable
    return this.editable
  }

  /**
   * 处理键盘快捷键
   *
   * @param shortcut - 快捷键字符串（如 'Mod-z'）
   * @returns 是否处理了该快捷键
   */
  handleKeyboardShortcut(shortcut: string): boolean {
    // 只读模式下只允许特定快捷键（如导航）
    if (!this.editable) {
      // TODO: 允许只读模式下的快捷键（如方向键导航）
      return false
    }

    return this.extensionManager.handleKeyboardShortcut(shortcut)
  }

  // ==================== 生命周期 ====================

  /**
   * 初始化扩展系统
   *
   * 在所有 Sheet 添加后调用
   */
  setup(): void {
    // 创建扩展上下文
    this._extensionContext = this.createExtensionContext()

    // 初始化 Workbook 级别的扩展
    this.extensionManager.setup(this._extensionContext)
  }

  /**
   * 创建扩展上下文
   */
  private createExtensionContext(): ExtensionContext {
    const workbook = this
    return {
      storage: {},
      getWorkbook: () => workbook,
      getState: () => {
        const activeSheet = workbook.getActiveSheet()
        return activeSheet?.state ?? null
      },
      dispatch: (tr: unknown) => {
        const activeSheet = workbook.getActiveSheet()
        activeSheet?.dispatch(tr as import('@tomind/state').Transaction)
      },
      getView: () => {
        const activeSheet = workbook.getActiveSheet()
        return activeSheet?.docView ?? null
      },
      executeCommand: (name: string, args?: unknown) => {
        return workbook.executeCommand(name, args)
      },
      registerCommand: (_name: string, _command: CommandFn) => {
        // TODO: 注册到全局命令管理器
      },
      unregisterCommand: (_name: string) => {
        // TODO: 注销全局命令
      },
      on: (event: string, handler: EventHandler) => {
        workbook.on(event, handler)
      },
      off: (event: string, handler: EventHandler) => {
        workbook.off(event, handler)
      },
      emit: (event: string, ...args: unknown[]) => {
        workbook.emit(event, ...args)
      },
      registerNodeView: (_nodeType: string, _viewDesc: unknown) => {
        // TODO: 注册到所有 Sheet
      },
      unregisterNodeView: (_nodeType: string) => {
        // TODO: 注销从所有 Sheet
      },
      registerPartView: (_partType: string, _viewDesc: unknown) => {
        // TODO: 注册到所有 Sheet
      },
      unregisterPartView: (_partType: string) => {
        // TODO: 注销从所有 Sheet
      },
      registerLayout: (algorithm: { name: string; layout: (node: any, options: any, styleEngine: any, state: any) => any }) => {
        registerLayout(algorithm)
      },
      unregisterLayout: (name: string) => {
        unregisterLayout(name)
      },
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    // 销毁所有 Sheet
    for (const sheet of this._sheets.values()) {
      sheet.destroy()
    }
    this._sheets.clear()

    // 销毁扩展管理器
    this.extensionManager.destroy()

    this._activeSheetId = null
    this._extensionContext = null
  }
}
