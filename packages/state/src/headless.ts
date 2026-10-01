/**
 * Headless 支持 — 无编辑器场景下使用插件系统
 *
 * 编辑器场景里，插件由 Extension 通过 ExtensionContext.registerPlugin 注册，
 * SheetEditor 会重建 state 并触发一次空事务初始化 plugin states。
 * 头层场景（布局服务、导出、对比工具）没有 WorkbookEditor，因此提供等价入口：
 *   - createBuiltinStatePlugins(): 影响布局/样式测量的内建 state 插件
 *   - createHeadlessSheetState(): create + 空事务初始化，等价于 registerPlugin 的行为
 */
import type { NodeDesc, SelectionState, Viewport } from '@tomind/schema'
import { SheetState } from './sheet-state'
import type { Plugin } from './sheet-state'
import { Transaction } from './transaction'
import { createNumberingPlugin } from './numbering-plugin'

/**
 * 内建 state 插件列表。
 * 编号文本会进入 leafer style（numberingText），进而影响标题测量宽度，
 * 因此任何需要与编辑器一致测量结果的 headless 调用都应注册它。
 */
export function createBuiltinStatePlugins(): Plugin[] {
  // Plugin<T> 的 state 方法对 T 不变，注册表以 Plugin<unknown> 存储（同 SheetEditor.registerPlugin 的 PluginLike 处理）
  return [createNumberingPlugin() as unknown as Plugin]
}

export interface HeadlessSheetStateOptions {
  doc: NodeDesc
  /** 额外插件；不传则只使用内建插件 */
  plugins?: readonly Plugin[]
  /** 为 false 时不注册内建插件 */
  builtinPlugins?: boolean
  selection?: SelectionState
  viewport?: Viewport
}

/** 创建带插件状态的 SheetState（headless 等价于 WorkbookEditor + StarterKit 的 state） */
export function createHeadlessSheetState(options: HeadlessSheetStateOptions): SheetState {
  const plugins = [
    ...(options.builtinPlugins === false ? [] : createBuiltinStatePlugins()),
    ...(options.plugins ?? []),
  ]
  const state = SheetState.create({
    doc: options.doc,
    plugins,
    selection: options.selection,
    viewport: options.viewport,
  })
  // 触发一次空事务初始化所有 plugin states（对齐 SheetEditor.registerPlugin）
  return state.apply(Transaction.empty(options.doc))
}
