/**
 * SheetEditor — 编辑器主类（对标 ProseMirror EditorView）
 *
 * 职责：
 * 1. 基础设施（DOM、App、滚动条、viewport 监听、事务分发）
 * 2. 共享引擎（StyleEngine、LayoutEngine）
 * 3. 事件系统（原生 EventTarget，对外暴露 on/off/emit）
 * 4. ViewDesc 树管理
 * 5. Extension 系统（扩展管理）
 *
 * 设计原则：
 * - 组合优于继承（内部持有一个 EventTarget 实例）
 * - 唯一事务入口（dispatch）
 * - 响应式更新（LeaferJS viewport → state.viewport）
 */

import { App } from 'leafer-ui'
import { ScrollBar } from '@leafer-in/scroll'
import type { IAppConfig } from 'leafer-ui'

import { SheetState, Transaction, PluginKey } from '@tomind/state'
import type { Plugin } from '@tomind/state'
import type { NodeDesc, SelectionState, Viewport } from '@tomind/schema'
import { ViewDesc } from '@tomind/view'
import { analyzeSteps } from '@tomind/view'
import {
  NodeViewDesc,
  TopicNodeViewDesc,
  RootViewDesc,
  RelationshipNodeViewDesc,
  BoundaryNodeViewDesc,
  SummaryNodeViewDesc,
} from '@tomind/view'
import type { StyleEngine } from '@tomind/style'
import type { LayoutEngine } from '@tomind/layout'
import { CommandManager } from '@tomind/commands'
import type { CommandResult } from '@tomind/commands'
import { ExtensionManager } from '@tomind/extension'
import type { Extension, ExtensionContext, CommandFn, EventHandler } from '@tomind/extension'

// ==================== 事件类型 ====================

export interface SheetEditorEvents {
  viewportChange: Viewport
  stateUpdate: SheetState
  layoutUpdated: void
  dispatch: Transaction
}

/** 滚动条配置 */
interface ScrollbarConfig {
  theme?: 'light' | 'dark'
  padding?: number | number[]
  minSize?: number
}

// ==================== 工厂函数 ====================

type ViewDescClass = new (node: NodeDesc, role: string) => ViewDesc

// NodeViewDesc 默认注册表（Tiptap 风格：Extension 注册 NodeView）
function createDefaultNodeViewDescRegistry(): Map<string, ViewDescClass> {
  const registry = new Map<string, ViewDescClass>()
  registry.set('root', RootViewDesc as any)
  registry.set('topic', TopicNodeViewDesc as any)
  registry.set('relationship', RelationshipNodeViewDesc as any)
  registry.set('boundary', BoundaryNodeViewDesc as any)
  registry.set('summary', SummaryNodeViewDesc as any)
  return registry
}

// PartViewDesc 默认注册表
function createDefaultPartViewDescRegistry(): Map<string, ViewDescClass> {
  return new Map<string, ViewDescClass>()
}

// 模块级默认注册表（供独立 SheetEditor 使用）
const nodeViewDescRegistry = createDefaultNodeViewDescRegistry()
const partViewDescRegistry = createDefaultPartViewDescRegistry()

/** 创建带默认值的 NodeViewDesc 注册表（供 WorkbookEditor 使用） */
export function createNodeViewDescRegistry(): Map<string, ViewDescClass> {
  return createDefaultNodeViewDescRegistry()
}

/** 创建带默认值的 PartViewDesc 注册表（供 WorkbookEditor 使用） */
export function createPartViewDescRegistry(): Map<string, ViewDescClass> {
  return createDefaultPartViewDescRegistry()
}

/** 注册 NodeViewDesc（供 Extension 调用） */
export function registerNodeViewDesc(nodeType: string, viewDescClass: new (node: NodeDesc, role: string) => ViewDesc): void {
  nodeViewDescRegistry.set(nodeType, viewDescClass)
}

/** 注销 NodeViewDesc */
export function unregisterNodeViewDesc(nodeType: string): void {
  nodeViewDescRegistry.delete(nodeType)
}

/** 注册 PartViewDesc（供 Extension 调用） */
export function registerPartViewDesc(partType: string, viewDescClass: new (node: NodeDesc, role: string) => ViewDesc): void {
  partViewDescRegistry.set(partType, viewDescClass)
}

/** 注销 PartViewDesc */
export function unregisterPartViewDesc(partType: string): void {
  partViewDescRegistry.delete(partType)
}

function _createViewDesc(node: NodeDesc, registry: Map<string, new (node: NodeDesc, role: string) => ViewDesc>): ViewDesc | null {
  const ViewDescClass = registry.get(node.type)
  if (!ViewDescClass) return null
  return new ViewDescClass(node, node.type)
}

// ==================== SheetEditor ====================

export class SheetEditor {
  readonly dom: HTMLElement
  readonly app: App
  readonly scrollbar: ScrollBar | null
  readonly plugins: readonly Plugin[]
  readonly styleEngine: StyleEngine
  readonly layoutEngine: LayoutEngine
  readonly commands: EditorCommands
  readonly extensionManager: ExtensionManager

  private _state: SheetState
  private _docView: ViewDesc | null = null
  private _emitter = new EventTarget()
  private _handlerMap = new Map<Function, EventListener>()
  private _commandManager: CommandManager
  private _nodeViewDescRegistry: Map<string, new (node: NodeDesc, role: string) => ViewDesc>
  private _partViewDescRegistry: Map<string, new (node: NodeDesc, role: string) => ViewDesc>
  _workbookEditor: any = null

  constructor(options: {
    dom: HTMLElement
    state: SheetState
    plugins?: Plugin[]
    extensions?: Extension[]
    styleEngine: StyleEngine
    layoutEngine: LayoutEngine
    commandManager?: CommandManager
    nodeViewDescRegistry?: Map<string, new (node: NodeDesc, role: string) => ViewDesc>
    partViewDescRegistry?: Map<string, new (node: NodeDesc, role: string) => ViewDesc>
    appConfig?: IAppConfig
    scrollbarConfig?: ScrollbarConfig
  }) {
    this.dom = options.dom
    this._state = options.state
    this.plugins = options.plugins || []
    this.styleEngine = options.styleEngine
    this.layoutEngine = options.layoutEngine
    this._commandManager = options.commandManager || CommandManager.empty()
    this._nodeViewDescRegistry = options.nodeViewDescRegistry || nodeViewDescRegistry
    this._partViewDescRegistry = options.partViewDescRegistry || partViewDescRegistry

    // 创建 LeaferJS App
    this.app = new App({ view: this.dom, tree: {}, ...options.appConfig })

    // 创建滚动条
    this.scrollbar = this.app.tree
      ? new ScrollBar(this.app.tree, options.scrollbarConfig)
      : null

    // 注入静态引用到 NodeViewDesc（父类，updateStyle 从这里读取）
    NodeViewDesc.styleEngine = this.styleEngine
    NodeViewDesc.layoutEngine = this.layoutEngine
    NodeViewDesc.state = this._state
    // 注入事件发射器，让 NodeView 能向扩展系统发事件
    NodeViewDesc._eventEmitter = { emit: (event: string, ...args: unknown[]) => this.emitAny(event, ...args) }

    // 创建 commands 代理
    this.commands = this.createCommandsProxy()

    // 初始化 ExtensionManager
    this.extensionManager = new ExtensionManager()

    // 注册扩展
    if (options.extensions) {
      for (const ext of options.extensions) {
        this.extensionManager.register(ext)
      }
    }

    // 初始化扩展（必须在 createDocView 之前，扩展注册的 NodeView 才能生效）
    this.setupExtensions()

    // 初始化 ViewDesc 树
    this._docView = this.createDocView()

    // standalone 模式：不在构造器中 renderInitial，统一由外部调用
    // （WorkbookEditor.setup() 会为所有 sheet 调用 renderInitial）

    // 监听 viewport 变化
    this.setupViewportSync()
  }

  // ==================== 事件 ====================

  on<K extends keyof SheetEditorEvents>(event: K, callback: (data: SheetEditorEvents[K]) => void): void {
    const handler = (e: Event) => callback((e as CustomEvent<SheetEditorEvents[K]>).detail)
    this._emitter.addEventListener(event, handler)
    this._handlerMap.set(callback, handler)
  }

  off<K extends keyof SheetEditorEvents>(event: K, callback: (data: SheetEditorEvents[K]) => void): void {
    const handler = this._handlerMap.get(callback)
    if (handler) {
      this._emitter.removeEventListener(event, handler)
      this._handlerMap.delete(callback)
    }
  }

  emit<K extends keyof SheetEditorEvents>(event: K, data: SheetEditorEvents[K]): void {
    this._emitter.dispatchEvent(new CustomEvent(event, { detail: data }))
  }

  /** 弱类型事件注册（供 ExtensionContext 桥接用） */
  onAny(event: string, handler: (...args: unknown[]) => void): void {
    const wrapped = (e: Event) => {
      const detail = (e as CustomEvent).detail
      handler(detail)
    }
    this._emitter.addEventListener(event, wrapped)
    this._handlerMap.set(handler, wrapped)
  }

  offAny(event: string, handler: (...args: unknown[]) => void): void {
    const wrapped = this._handlerMap.get(handler)
    if (wrapped) {
      this._emitter.removeEventListener(event, wrapped)
      this._handlerMap.delete(handler)
    }
  }

  emitAny(event: string, ...args: unknown[]): void {
    this._emitter.dispatchEvent(new CustomEvent(event, { detail: args[0] }))
  }

  // ==================== 状态管理 ====================

  get state(): SheetState {
    return this._state
  }

  get docView(): ViewDesc | null {
    return this._docView
  }

  get commandManager(): CommandManager {
    return this._commandManager
  }

  updateState(newState: SheetState, tr?: Transaction): void {
    this._state = newState
    // 更新静态引用
    TopicNodeViewDesc.state = newState
    TopicNodeViewDesc.layoutEngine = this.layoutEngine
    this.updateDocView(newState.doc, tr)
    this.emit('stateUpdate', newState)
  }

  // ==================== 事务分发 ====================

  dispatch(tr: Transaction): void {
    const newState = this._state.apply(tr)
    this.updateState(newState, tr)
    this.emit('dispatch', tr)
  }

  // ==================== Extension 管理 ====================

  /**
   * 注册扩展
   */
  registerExtension(extension: Extension): void {
    // 避免重复注册：如果已注册则跳过
    if (this.extensionManager.getExtension(extension.name)) return

    this.extensionManager.register(extension)

    // 如果已经 setup 过，单独初始化这个扩展（完整流程）
    if (this.extensionManager.isSetup()) {
      this.extensionManager.setupExtension(extension, this.createExtensionContext())
    }
  }

  /**
   * 注销扩展
   */
  unregisterExtension(name: string): void {
    this.extensionManager.unregister(name)
  }

  /**
   * 获取扩展
   */
  getExtension(name: string): Extension | undefined {
    return this.extensionManager.getExtension(name)
  }

  /**
   * 初始化扩展系统（幂等：已 setup 则跳过）
   */
  setupExtensions(): void {
    if (this.extensionManager.isSetup()) return
    const ctx = this.createExtensionContext()
    this.extensionManager.setup(ctx)
  }

  /** 触发初始渲染（需在扩展注册完成后调用） */
  renderInitial(): void {
    if (this._docView) {
      this.initialRender(this._docView)
    }
  }

  /**
   * 创建扩展上下文
   */
  private createExtensionContext(): ExtensionContext {
    const editor = this
    return {
      storage: {},
      getWorkbook: () => editor._workbookEditor as any,
      getState: () => editor._state,
      dispatch: (tr: unknown) => editor.dispatch(tr as Transaction),
      getView: () => editor._docView,
      executeCommand: (name: string, args?: unknown) => {
        const result = editor.executeCommand(name, args)
        return result.success
      },
      registerCommand: (name: string, command: CommandFn) => {
        editor.registerCommand(name, command)
      },
      unregisterCommand: (name: string) => {
        editor.unregisterCommand(name)
      },
      on: (event: string, handler: EventHandler) => {
        editor.onAny(event, handler)
      },
      off: (event: string, handler: EventHandler) => {
        editor.offAny(event, handler)
      },
      emit: (event: string, ...args: unknown[]) => {
        editor.emitAny(event, ...args)
      },
      registerNodeView: (nodeType: string, viewDesc: unknown) => {
        // Extension 注册 NodeViewDesc
        if (typeof viewDesc === 'function' && viewDesc.length <= 2) {
          editor.registerNodeView(nodeType, viewDesc as new (node: NodeDesc, role: string) => ViewDesc)
        }
      },
      unregisterNodeView: (nodeType: string) => {
        editor.unregisterNodeView(nodeType)
      },
      registerLayout: (algorithm: { name: string; layout: (node: any, options: any, styleEngine: any, state: any) => any }) => {
        editor.layoutEngine.register?.(algorithm)
      },
      unregisterLayout: (name: string) => {
        editor.layoutEngine.unregister?.(name)
      },
      registerPartView: (partType: string, viewDesc: unknown) => {
        if (typeof viewDesc === 'function' && viewDesc.length <= 2) {
          editor.registerPartView(partType, viewDesc as new (node: NodeDesc, role: string) => ViewDesc)
        }
      },
      unregisterPartView: (partType: string) => {
        editor.unregisterPartView(partType)
      },
    }
  }

  // ==================== ViewDesc 管理 ====================

  private createViewDesc(node: NodeDesc): ViewDesc | null {
    const vd = _createViewDesc(node, this._nodeViewDescRegistry)
    if (!vd) console.warn(`[createViewDesc] no ViewDesc for type="${node.type}" id="${node.id}"`)
    return vd
  }

  private createDocView(): ViewDesc | null {
    const doc = this._state.doc
    if (!doc) { console.warn('[createDocView] no doc'); return null }

    // 创建根 ViewDesc
    const rootView = this.createViewDesc(doc)
    if (!rootView) { console.warn('[createDocView] rootView is null, doc.type=' + doc.type); return null }

    // 递归创建子 ViewDesc
    this.buildChildrenViews(rootView, doc)

    // 添加到 LeaferJS 根
    if (rootView.element && this.app.tree) {
      this.app.tree.add(rootView.element)
    }

    return rootView
  }

  /** 初始渲染：递归调用 update() 让所有节点填充 LeaferJS 元素 */
  private initialRender(view: ViewDesc): void {
    // 触发 lazy element 创建（createElement 里创建 renderer）
    void view.element

    // 对当前节点调用 update（触发 updateStyle/updateContent）
    if (view instanceof NodeViewDesc) {
      try {
        view.update(view.node)
      } catch (e) {
        console.error(`[initialRender] error on ${view.node.type}#${view.node.id}:`, e)
      }
    }
    // 递归子节点
    for (const child of view.children) {
      this.initialRender(child)
    }
  }

  private buildChildrenViews(parentView: ViewDesc, parentNode: NodeDesc): void {
    const children = parentNode.children
    if (!children) return

    // children 是 Record<string, NodeDesc[]>
    for (const [slot, childNodes] of Object.entries(children)) {
      if (!Array.isArray(childNodes)) continue
      for (const childNode of childNodes) {
        const childView = this.createViewDesc(childNode)
        if (!childView) continue
        parentView.addChild(childView)
        this.buildChildrenViews(childView, childNode)
      }
    }
  }

  private updateDocView(newDoc: NodeDesc, tr?: Transaction): void {
    if (!this._docView) {
      this._docView = this.createDocView()
      return
    }

    // 分析 Transaction steps，推理标脏
    if (tr) {
      const analysis = analyzeSteps(tr.steps)
      if (analysis.globalDirty) {
        // 全局变化，标记所有节点
        this._docView.markAllDirty(analysis.globalFlag)
      } else {
        // 按节点标记
        for (const [nodeId, flag] of analysis.nodeFlags) {
          const view = this._docView.findById(nodeId)
          if (view) {
            view.markDirty(flag)
          }
        }
      }
    }

    // 递归更新 ViewDesc 树
    this.updateChildrenViews(this._docView, newDoc)
  }

  private updateChildrenViews(parentView: ViewDesc, newParentNode: NodeDesc): void {
    const children = newParentNode.children
    if (!children) return

    // 收集所有新子节点（按 id 索引）
    const newChildren: NodeDesc[] = []
    const newChildMap = new Map<string, NodeDesc>()
    for (const [, childNodes] of Object.entries(children)) {
      if (Array.isArray(childNodes)) {
        for (const child of childNodes) {
          newChildren.push(child)
          newChildMap.set(child.id, child)
        }
      }
    }

    // 构建旧子节点 id → view 映射
    const oldViewMap = new Map<string, ViewDesc>()
    for (const oldView of parentView.children) {
      oldViewMap.set(oldView.node.id, oldView)
    }

    // 按新顺序重建子节点列表
    const newViewList: ViewDesc[] = []
    for (const newChild of newChildren) {
      const oldView = oldViewMap.get(newChild.id)

      if (oldView && oldView.node.type === newChild.type) {
        // 同类型同 id → 尝试更新
        if (oldView.update(newChild)) {
          this.updateChildrenViews(oldView, newChild)
          newViewList.push(oldView)
          continue
        }
      }

      // 需要重建
      if (oldView) {
        parentView.removeChild(oldView)
        oldView.destroy()
      }

      const newView = this.createViewDesc(newChild)
      if (newView) {
        this.buildChildrenViews(newView, newChild)
        newViewList.push(newView)
      }
    }

    // 移除不再存在的旧子节点
    for (const [id, oldView] of oldViewMap) {
      if (!newChildMap.has(id)) {
        parentView.removeChild(oldView)
        oldView.destroy()
      }
    }

    // 按新顺序添加子节点
    for (const view of newViewList) {
      if (view.parent !== parentView) {
        parentView.addChild(view)
      }
    }

    // 调整顺序：如果子节点已存在但顺序不对
    const currentChildren = [...parentView.children]
    for (let i = 0; i < newViewList.length; i++) {
      const targetView = newViewList[i]
      const currentIndex = currentChildren.indexOf(targetView)
      if (currentIndex !== -1 && currentIndex !== i) {
        // 需要移动
        parentView.removeChild(targetView)
        parentView.addChild(targetView, i)
        // 更新 currentChildren
        currentChildren.splice(currentIndex, 1)
        currentChildren.splice(i, 0, targetView)
      }
    }
  }

  // ==================== Viewport 同步 ====================

  private setupViewportSync(): void {
    if (!this.app.tree) return

    // 监听 LeaferJS 的 viewport 变化事件
    this.app.tree.on_('viewport', (e: { x: number; y: number; zoom: number }) => {
      const viewport: Viewport = {
        x: e.x,
        y: e.y,
        zoom: e.zoom,
      }
      // 更新 state 但不触发重新渲染（避免循环）
      const tr = Transaction.empty(this._state.doc).setViewport(viewport)
      const newState = this._state.apply(tr)
      this._state = newState
      TopicNodeViewDesc.state = newState
      this.emit('viewportChange', viewport)
    })
  }

  get viewport(): Viewport {
    return this._state.viewport
  }

  setViewport(viewport: Viewport): void {
    const tr = Transaction.empty(this._state.doc).setViewport(viewport)
    this.dispatch(tr)
  }

  // ==================== 选区管理 ====================

  get selection(): SelectionState {
    return this._state.selection
  }

  setSelection(selection: SelectionState): void {
    const tr = Transaction.empty(this._state.doc).setSelection(selection)
    this.dispatch(tr)
  }

  // ==================== 插件状态 ====================

  field<T>(key: PluginKey<T>): T {
    return this._state.field(key)
  }

  // ==================== 生命周期 ====================

  destroy(): void {
    // 销毁扩展
    this.extensionManager.destroy()

    this._docView?.destroy()
    this._docView = null
    this._emitter = new EventTarget()
    this._handlerMap.clear()
  }

  // ==================== Commands 代理 ====================

  /**
   * 创建 commands 代理
   *
   * 使用 Proxy 动态生成命令方法，支持：
   * - editor.commands.addNode(params)
   * - editor.commands.addClass(params)
   */
  private createCommandsProxy(): EditorCommands {
    const editor = this
    const handler: ProxyHandler<Record<string, unknown>> = {
      get(_target, prop: string) {
        // 返回一个函数，执行对应的命令
        return (params: unknown): CommandResult => {
          return editor._commandManager.execute(prop, params, editor._state, (tr) => editor.dispatch(tr))
        }
      },
    }
    return new Proxy({}, handler) as EditorCommands
  }

  /**
   * 创建链式调用上下文
   *
   * 支持：
   * - editor.chain().addNode(params).addClass(params).run()
   */
  chain(): CommandChain {
    return new CommandChain(this)
  }

  /**
   * 执行命令
   */
  executeCommand(name: string, params: unknown): CommandResult {
    return this._commandManager.execute(name, params, this._state, (tr) => this.dispatch(tr))
  }

  /**
   * 注册命令到 CommandManager
   */
  registerCommand(name: string, command: CommandFn): void {
    this._commandManager.add({
      name,
      description: `Extension command: ${name}`,
      inputSchema: { type: 'object' },
      execute: (params: unknown, state: SheetState, dispatch?: (tr: Transaction) => void) => {
        const wrappedDispatch = dispatch ? (tr: unknown) => dispatch(tr as Transaction) : null
        const success = command(state, wrappedDispatch, params)
        return { success }
      },
    })
  }

  /**
   * 从 CommandManager 注销命令
   */
  unregisterCommand(name: string): void {
    this._commandManager.remove(name)
  }

  /**
   * 注册 NodeViewDesc
   */
  registerNodeView(nodeType: string, viewDescClass: new (node: NodeDesc, role: string) => ViewDesc): void {
    this._nodeViewDescRegistry.set(nodeType, viewDescClass)
  }

  /**
   * 注销 NodeViewDesc
   */
  unregisterNodeView(nodeType: string): void {
    this._nodeViewDescRegistry.delete(nodeType)
  }

  /**
   * 注册 PartViewDesc
   */
  registerPartView(partType: string, viewDescClass: new (node: NodeDesc, role: string) => ViewDesc): void {
    this._partViewDescRegistry.set(partType, viewDescClass)
  }

  /**
   * 注销 PartViewDesc
   */
  unregisterPartView(partType: string): void {
    this._partViewDescRegistry.delete(partType)
  }
}

// ==================== EditorCommands ====================

/**
 * EditorCommands 接口
 *
 * 动态类型，所有命令都可以通过 editor.commands.xxx(params) 调用
 */
export interface EditorCommands {
  [commandName: string]: (params: unknown) => CommandResult
}

// ==================== CommandChain ====================

/**
 * 命令链式调用上下文
 *
 * 支持：
 * editor.chain()
 *   .addNode({ parentId: 'root', type: 'topic' })
 *   .addClass({ nodeId: 'n1', className: 'highlight' })
 *   .run()
 */
export class CommandChain {
  private _editor: SheetEditor
  private _commands: Array<{ name: string; params: unknown }> = []

  constructor(editor: SheetEditor) {
    this._editor = editor

    // 使用 Proxy 动态生成命令方法
    return new Proxy(this, {
      get(target, prop: string) {
        // 如果是已有的方法，返回它
        if (prop in target) {
          return target[prop as keyof CommandChain]
        }

        // 否则返回一个函数，将命令添加到链中
        return (params: unknown): CommandChain => {
          target._commands.push({ name: prop, params })
          return target
        }
      },
    }) as CommandChain
  }

  /**
   * 执行链中的所有命令
   */
  run(): CommandResult {
    let lastResult: CommandResult = { success: true }

    for (const { name, params } of this._commands) {
      lastResult = this._editor.executeCommand(name, params)
      if (!lastResult.success) {
        return lastResult
      }
    }

    return lastResult
  }
}
