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
import type { NodeDesc, NodeRole, SelectionState, Viewport } from '@tomind/schema'
import { isNodeRole } from '@tomind/schema'
import { ViewDesc } from '@tomind/view'
import { analyzeSteps, DirtyFlag } from '@tomind/view'
import {
  NodeViewDesc,
  TopicNodeViewDesc,
  RootViewDesc,
  RelationshipNodeViewDesc,
  BoundaryNodeViewDesc,
  SummaryNodeViewDesc,
} from '@tomind/view'
import type { ViewContext } from '@tomind/view'
import type { StyleEngine } from '@tomind/style'
import type { LayoutEngine } from '@tomind/layout'
import { CommandManager } from '@tomind/commands'
import type { CommandResult } from '@tomind/commands'
import { ExtensionManager } from '@tomind/extension'
import type { Extension, ExtensionContext, CommandFn, ViewDescConstructor, PluginLike, ViewPluginLike } from '@tomind/extension'
import { buildExtensionContext } from '@tomind/extension'
import { ViewPluginManager } from '@tomind/plugins'
import type { ViewPlugin, WidgetViewFactory } from '@tomind/plugins'
import type { WorkbookEditor } from './workbook-editor'

// ==================== 事件类型 ====================

export interface SheetEditorEvents {
  viewportChange: Viewport
  stateUpdate: SheetState
  layoutUpdated: void
  layoutChange: string
  dispatch: Transaction
}

/** 滚动条配置 */
interface ScrollbarConfig {
  theme?: 'light' | 'dark'
  padding?: number | number[]
  minSize?: number
}

// ==================== 工厂函数 ====================

type ViewDescClass = new (node: NodeDesc, role: NodeRole, ctx: ViewContext) => ViewDesc

/** 从 CustomEvent 安全提取 detail */
/** 从 CustomEvent 安全提取 detail */
function getEventDetail<T>(e: Event): T {
  return (e as CustomEvent<T>).detail
}

// NodeViewDesc 默认注册表（Tiptap 风格：Extension 注册 NodeView）
function createDefaultNodeViewDescRegistry(): Map<string, ViewDescClass> {
  const registry = new Map<string, ViewDescClass>()
  registry.set('root', RootViewDesc)
  registry.set('topic', TopicNodeViewDesc)
  registry.set('relationship', RelationshipNodeViewDesc)
  registry.set('boundary', BoundaryNodeViewDesc)
  registry.set('summary', SummaryNodeViewDesc)
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
export function registerNodeViewDesc(nodeType: string, viewDescClass: ViewDescClass): void {
  nodeViewDescRegistry.set(nodeType, viewDescClass)
}

/** 注销 NodeViewDesc */
export function unregisterNodeViewDesc(nodeType: string): void {
  nodeViewDescRegistry.delete(nodeType)
}

/** 注册 PartViewDesc（供 Extension 调用） */
export function registerPartViewDesc(partType: string, viewDescClass: ViewDescClass): void {
  partViewDescRegistry.set(partType, viewDescClass)
}

/** 注销 PartViewDesc */
export function unregisterPartViewDesc(partType: string): void {
  partViewDescRegistry.delete(partType)
}

function _createViewDesc(node: NodeDesc, registry: Map<string, ViewDescClass>, ctx: ViewContext): ViewDesc | null {
  const ViewDescClass = registry.get(node.type)
  if (!ViewDescClass) return null
  return isNodeRole(node.type) ? new ViewDescClass(node, node.type, ctx) : null
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
  private _viewPluginManager: ViewPluginManager

  /** ViewPluginManager（只读访问） */
  get viewPluginManager(): ViewPluginManager {
    return this._viewPluginManager
  }
  private _state: SheetState
  private _docView: ViewDesc | null = null
  private _emitter = new EventTarget()
  private _handlerMap = new Map<Function, EventListener>()
  private _commandManager: CommandManager
  private _nodeViewDescRegistry: Map<string, ViewDescClass>
  private _partViewDescRegistry: Map<string, ViewDescClass>
  private _ctx: ViewContext
  _workbookEditor: WorkbookEditor | null = null

  constructor(options: {
    dom: HTMLElement
    state: SheetState
    plugins?: Plugin[]
    extensions?: Extension[]
    styleEngine: StyleEngine
    layoutEngine: LayoutEngine
    commandManager?: CommandManager
    nodeViewDescRegistry?: Map<string, ViewDescClass>
    partViewDescRegistry?: Map<string, ViewDescClass>
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

    // 创建 ViewContext 对象（可变引用，state 会随事务更新）
    this._ctx = {
      styleEngine: this.styleEngine,
      layoutEngine: this.layoutEngine,
      state: this._state,
      eventEmitter: { emit: (event: string, ...args: unknown[]) => this.emitAny(event, ...args) },
      widgetViewFactory: (widgetType: string, widgetId: string, node: NodeDesc) => {
        return this.createWidgetView(widgetType, widgetId, node)
      },
    }

    // 创建 commands 代理
    this.commands = this.createCommandsProxy()

    // 初始化 ExtensionManager
    this.extensionManager = new ExtensionManager()

    // 初始化 ViewPluginManager
    this._viewPluginManager = new ViewPluginManager()

    // 注册扩展
    if (options.extensions) {
      for (const ext of options.extensions) {
        this.extensionManager.register(ext)
      }
    }

    // 响应扩展的 'getContainer' 事件，回调传入 DOM 容器
    // 必须在 setupExtensions 之前注册，否则扩展的 ctx.emit('getContainer') 无人接收
    this._emitter.addEventListener('getContainer', ((e: Event) => {
      const callback = getEventDetail(e)
      if (typeof callback === 'function') {
        callback(this.dom)
      }
    }))

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
    const handler = (e: Event) => callback(getEventDetail<SheetEditorEvents[K]>(e))
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
      const detail = getEventDetail(e)
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
    // 更新 ViewContext 的 state 引用
    this._ctx.state = newState
    // 布局结果只算一次：统一 compute 后缓存到 LayoutEngine
    // 后续节点通过 getLayoutResult() 读取，不再重复算
    this.layoutEngine.compute(newState)
    
    // 收集 ViewPlugin 的 Widget Decorations
    const widgetDecorations = this.viewPluginManager.collectDecorations(newState)
    if (widgetDecorations.length > 0) {
      newState = newState.setDecorations(newState.decorations.addAll(widgetDecorations))
      this._state = newState
      this._ctx.state = newState
    }
    
    this.updateDocView(newState.doc, tr)
    // 将 viewport 状态同步到 LeaferJS 画布
    // setupViewportSync 只做了 LeaferJS → state 的单向同步
    // 这里补上 state → LeaferJS 的反向同步
    this.applyViewportToLeaferJS(newState.viewport)
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

    // register() 内部判断：ctx 未就绪时仅存储，ctx 已就绪时立即初始化
    this.extensionManager.register(extension)
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

  // ==================== Plugin 管理 ====================

  /** 已注册的 Plugin 列表（动态追加） */
  private _dynamicPlugins: Plugin[] = []

  /**
   * 注册 Plugin（供 Extension 使用）
   *
   * 将 Plugin 添加到 state 中，并触发一次空事务以初始化 plugin state。
   */
  registerPlugin(plugin: Plugin): void {
    // 避免重复注册
    if (this._dynamicPlugins.some((dp) => dp.key.name === plugin.key.name)) return
    this._dynamicPlugins.push(plugin)

    // 重建 state，包含新 plugin
    const newPlugins = [...this.plugins, ...this._dynamicPlugins]
    const newState = SheetState.create({
      doc: this._state.doc,
      selection: this._state.selection,
      viewport: this._state.viewport,
      plugins: newPlugins,
      decorations: this._state.decorations,
    })
    // 触发一次空事务以初始化所有 plugin states
    const emptyTr = Transaction.empty(this._state.doc)
    const initializedState = newState.apply(emptyTr)
    this.updateState(initializedState)
  }

  /**
   * 注销 Plugin
   */
  unregisterPlugin(plugin: unknown): void {
    const p = plugin as Plugin
    const idx = this._dynamicPlugins.findIndex((dp) => dp.key.name === p.key.name)
    if (idx === -1) return
    this._dynamicPlugins.splice(idx, 1)

    // 重建 state，排除该 plugin
    const newPlugins = [...this.plugins, ...this._dynamicPlugins]
    const newState = SheetState.create({
      doc: this._state.doc,
      selection: this._state.selection,
      viewport: this._state.viewport,
      plugins: newPlugins,
      decorations: this._state.decorations,
    })
    const emptyTr = Transaction.empty(this._state.doc)
    const initializedState = newState.apply(emptyTr)
    this.updateState(initializedState)
  }

  // ==================== ViewPlugin 管理 ====================

  /**
   * 注册 ViewPlugin（供 Extension 使用）
   *
   * 用于 Widget Decoration 系统
   */
  registerViewPlugin(plugin: ViewPlugin): void {
    if (this._viewPluginManager.has(plugin.name)) return
    this._viewPluginManager = this._viewPluginManager.add(plugin)
  }

  /**
   * 注销 ViewPlugin
   */
  unregisterViewPlugin(name: string): void {
    this._viewPluginManager = this._viewPluginManager.remove(name)
  }

  /**
   * 创建 Widget ViewDesc
   *
   * 查询所有 ViewPlugin 的 widgetViewFactory，返回第一个匹配的 ViewDesc
   */
  private createWidgetView(widgetType: string, widgetId: string, node: NodeDesc): ViewDesc | null {
    const factories = this._viewPluginManager.getWidgetViewFactories()
    for (const factory of factories.values()) {
      const result = factory(widgetType, widgetId, node)
      if (result) return result as ViewDesc
    }
    return null
  }

  /**
   * 初始化扩展系统（幂等：已 setup 则跳过）
   */
  setupExtensions(): void {
    if (this.extensionManager.isSetup()) return
    const ctx = this.createExtensionContext()
    this.extensionManager.setup(ctx)
    // DOM 挂载（sheet 容器就绪后）
    this.extensionManager.mountDOM(this.dom)
  }

  /** 触发初始渲染（需在扩展注册完成后调用） */
  renderInitial(): void {
    if (this._docView) {
      // 首次渲染前必须先 compute 布局，否则 getLayoutResult() 返回空 Map，
      // TopicRenderer.render() 会因找不到 nodeLayout 而跳过所有节点渲染
      const result = this.layoutEngine.compute(this._state)
      console.log(`[renderInitial] layout computed: ${result.nodes.size} nodes, doc=${this._state.doc?.id} docType=${this._state.doc?.type}`)
      this.initialRender(this._docView)

      // 初始 viewport 对准根节点：将 viewport 平移到根节点中心
      const doc = this._state.doc
      if (doc) {
        // 布局算法只计算 topic 节点，root 节点不在布局结果中
        // 优先用 doc.id 查找，找不到则用第一个 attached 子节点
        let rootLayout = result.nodes.get(doc.id)
        if (!rootLayout && doc.children?.attached?.[0]) {
          rootLayout = result.nodes.get(doc.children.attached[0].id)
        }
        if (rootLayout) {
          const rootCX = rootLayout.x + rootLayout.width / 2
          const rootCY = rootLayout.y + rootLayout.height / 2
          // 获取画布尺寸，计算偏移使根节点居中
          const canvasWidth = this.dom.clientWidth
          const canvasHeight = this.dom.clientHeight
          console.log(`[renderInitial] viewport center: root=(${rootCX},${rootCY}) canvas=(${canvasWidth}x${canvasHeight})`)
          this.setViewport({
            x: canvasWidth / 2 - rootCX,
            y: canvasHeight / 2 - rootCY,
            zoom: this._state.viewport.zoom,
          })
        } else {
          console.warn(`[renderInitial] no rootLayout for doc.id=${doc.id}`)
        }
      }
    } else {
      console.warn(`[renderInitial] no _docView`)
    }
  }

  /**
   * 创建扩展上下文
   */
  private createExtensionContext(): ExtensionContext {
    const editor = this
    return buildExtensionContext({
      storage: {},
      getWorkbook: () => editor._workbookEditor!,
      getState: <T = unknown>(): T | null => editor._state as T | null,
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
      on: (event: string, handler: (...args: unknown[]) => void) => {
        editor.onAny(event, handler)
      },
      off: (event: string, handler: (...args: unknown[]) => void) => {
        editor.offAny(event, handler)
      },
      emit: (event: string, data?: unknown) => {
        editor.emitAny(event, data)
      },
      registerNodeView: (nodeType: string, viewDesc: ViewDescConstructor) => {
        editor.registerNodeView(nodeType, viewDesc)
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
      registerPartView: (partType: string, viewDesc: ViewDescConstructor) => {
        editor.registerPartView(partType, viewDesc)
      },
      unregisterPartView: (partType: string) => {
        editor.unregisterPartView(partType)
      },
      registerPlugin: (plugin: PluginLike) => {
        editor.registerPlugin(plugin as Plugin)
      },
      unregisterPlugin: (plugin: PluginLike) => {
        editor.unregisterPlugin(plugin as Plugin)
      },
      registerViewPlugin: (plugin: ViewPluginLike) => {
        editor.registerViewPlugin(plugin as ViewPlugin)
      },
      unregisterViewPlugin: (name: string) => {
        editor.unregisterViewPlugin(name)
      },
      getContainer: () => editor.dom,
    })
  }

  // ==================== ViewDesc 管理 ====================

  private createViewDesc(node: NodeDesc): ViewDesc | null {
    const vd = _createViewDesc(node, this._nodeViewDescRegistry, this._ctx)
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
        console.log(`[initialRender] updating ${view.node.type}#${view.node.id}`)
        view.update(view.node)
      } catch (e) {
        console.error(`[initialRender] error on ${view.node.type}#${view.node.id}:`, e)
      }
    }
    // 递归子节点
    for (const child of view.children) {
      this.initialRender(child)
      // 关键修复：element lazy 创建后挂载到父级 contentGroup
      // addChild() 时机太早（_contentGroup 和 _element 都是 null），此处补挂
      if (view.contentGroup && child.element) {
        view.contentGroup.add(child.element)
      }
    }
  }

  private buildChildrenViews(parentView: ViewDesc, parentNode: NodeDesc): void {
    const children = parentNode.children
    if (!children) return

    // children 是 Record<string, NodeDesc[]>
    for (const [_slot, childNodes] of Object.entries(children)) {
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
      console.log(`[viewportSync] LeaferJS viewport event: x=${e.x} y=${e.y} zoom=${e.zoom}`)
      const viewport: Viewport = {
        x: e.x,
        y: e.y,
        zoom: e.zoom,
      }
      // 更新 state 但不触发重新渲染（避免循环）
      const tr = Transaction.empty(this._state.doc).setViewport(viewport)
      const newState = this._state.apply(tr)
      this._state = newState
      this._ctx.state = newState
      this.emit('viewportChange', viewport)
    })
  }

  /**
   * 将 viewport 状态应用到 LeaferJS 画布
   * LeaferJS 的 tree 层是可视区域的根，移动它的 x/y 相当于平移画布
   */
  private applyViewportToLeaferJS(viewport: Viewport): void {
    if (!this.app.tree) {
      console.warn('[applyViewport] no app.tree!')
      return
    }
    const tree = this.app.tree
    console.log(`[applyViewport] before: tree.x=${tree.x} tree.y=${tree.y} tree.scaleX=${tree.scaleX}`)
    
    // 尝试使用 scrollX/scrollY（Leafer 实例的滚动 API）
    // 如果不存在，fallback 到 x/y（容器偏移）
    if ('scrollX' in tree) {
      const scrollable = tree as { scrollX: number; scrollY: number }
      scrollable.scrollX = -viewport.x
      scrollable.scrollY = -viewport.y
    } else {
      tree.x = viewport.x
      tree.y = viewport.y
    }
    tree.scaleX = viewport.zoom
    tree.scaleY = viewport.zoom
    console.log(`[applyViewport] after: viewport=(${viewport.x},${viewport.y} zoom=${viewport.zoom}) tree.x=${tree.x} tree.y=${tree.y}`)
  }

  get viewport(): Viewport {
    return this._state.viewport
  }

  setViewport(viewport: Viewport): void {
    const tr = Transaction.empty(this._state.doc).setViewport(viewport)
    this.dispatch(tr)
  }

  // ==================== 布局切换 ====================

  /**
   * 切换布局算法
   * 设置活跃布局 + 标记所有节点需要重新布局 + 触发重渲染
   */
  switchLayout(layoutName: string): void {
    // 设置活跃布局
    this.layoutEngine.setActiveLayout?.(layoutName)

    // 标记所有节点需要重新布局
    if (this._docView) {
      this._docView.markAllDirty(DirtyFlag.LAYOUT)
    }

    // 重新计算布局（使用新算法）
    this.layoutEngine.compute(this._state)

    // 触发重渲染：用当前 doc 再走一遍 updateDocView
    this.updateDocView(this._state.doc)
    this.emit('layoutChange', layoutName)
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
  registerNodeView(nodeType: string, viewDescClass: ViewDescConstructor): void {
    this._nodeViewDescRegistry.set(nodeType, viewDescClass as ViewDescClass)
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
  registerPartView(partType: string, viewDescClass: ViewDescConstructor): void {
    this._partViewDescRegistry.set(partType, viewDescClass as ViewDescClass)
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
