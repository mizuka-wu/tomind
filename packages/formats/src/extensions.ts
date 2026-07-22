/**
 * FormatExtensions — 格式转换扩展集合
 *
 * 每个格式一个 Extension，注册 import.xxx / export.xxx 命令：
 * - import.xmind / export.xmind
 * - import.opml / export.opml
 * - import.freemind / export.freemind
 * - import.markdown / export.markdown
 *
 * 用法：
 * ```ts
 * import { XmindFormatExtension } from '@tomind/formats'
 * const editor = new SheetEditor({ extensions: [XmindFormatExtension] })
 * editor.commands['import.xmind'](file)
 * ```
 */

import { createExtension, Transaction, InsertNodeStep } from '@tomind/core'
import type { SheetState, NodeDesc, ExtensionContext } from '@tomind/core'
import { modelToNodeDesc } from './model-to-node'
import type { ModelTree } from './model-to-node'
import { parseXMind, exportXMind } from './xmind'
import { parseOPML, exportOPML } from './opml'
import { parseFreeMind, exportFreeMind } from './freemind'
import { parseMarkdown, exportMarkdown } from './markdown'

// ==================== 类型 ====================

export interface FormatOptions extends Record<string, unknown> {
  enabled?: boolean
}

// ==================== 工具函数 ====================

/** 从 File 读取 ArrayBuffer */
async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}

/** 从 File 读取文本 */
async function readFileAsText(file: File): Promise<string> {
  return file.text()
}

/** ModelTree → 替换整个 doc */
function applyModelTree(state: SheetState, tree: ModelTree): Transaction {
  const newDoc = modelToNodeDesc(tree)
  const tr = new Transaction(state.doc, [
    new InsertNodeStep(newDoc.id, '', -1, newDoc),
  ], [state.doc], new Map())
  return tr
}

// ==================== XMind 扩展 ====================

export const XmindFormatExtension = createExtension<FormatOptions>({
  name: 'import-xmind',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    ctx.registerCommand('import.xmind', async (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { file } = (params ?? {}) as { file?: File }
      if (!file) return false

      const data = await readFileAsArrayBuffer(file)
      const tree = await parseXMind(data)
      const tr = applyModelTree(sheetState, tree)
      dispatch(tr)
      return true
    })

    ctx.registerCommand('export.xmind', async (state: unknown, _dispatch: unknown, params?: unknown) => {
      const sheetState = state as SheetState
      const { filename } = (params ?? {}) as { filename?: string }

      // 将当前 doc 转回 ModelTree（简化：直接用 doc 作为 root）
      const tree: ModelTree = {
        root: {
          id: sheetState.doc.id,
          title: (sheetState.doc.attrs?.title as string) || '',
          children: [],
        },
        title: (sheetState.doc.attrs?.title as string) || undefined,
      }

      const blob = await exportXMind(tree, filename)
      return blob
    })
  },
})

// ==================== OPML 扩展 ====================

export const OpmlFormatExtension = createExtension<FormatOptions>({
  name: 'import-opml',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    ctx.registerCommand('import.opml', async (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { file } = (params ?? {}) as { file?: File }
      if (!file) return false

      const text = await readFileAsText(file)
      const tree = parseOPML(text)
      const tr = applyModelTree(sheetState, tree)
      dispatch(tr)
      return true
    })

    ctx.registerCommand('export.opml', (state: unknown) => {
      const sheetState = state as SheetState
      const tree: ModelTree = {
        root: {
          id: sheetState.doc.id,
          title: (sheetState.doc.attrs?.title as string) || '',
          children: [],
        },
      }
      return exportOPML(tree)
    })
  },
})

// ==================== FreeMind 扩展 ====================

export const FreemarkFormatExtension = createExtension<FormatOptions>({
  name: 'import-freemind',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    ctx.registerCommand('import.freemind', async (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { file } = (params ?? {}) as { file?: File }
      if (!file) return false

      const text = await readFileAsText(file)
      const tree = parseFreeMind(text)
      const tr = applyModelTree(sheetState, tree)
      dispatch(tr)
      return true
    })

    ctx.registerCommand('export.freemind', (state: unknown) => {
      const sheetState = state as SheetState
      const tree: ModelTree = {
        root: {
          id: sheetState.doc.id,
          title: (sheetState.doc.attrs?.title as string) || '',
          children: [],
        },
      }
      return exportFreeMind(tree)
    })
  },
})

// ==================== Markdown 扩展 ====================

export const MarkdownFormatExtension = createExtension<FormatOptions>({
  name: 'import-markdown',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    ctx.registerCommand('import.markdown', async (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { file } = (params ?? {}) as { file?: File }
      if (!file) return false

      const text = await readFileAsText(file)
      const tree = parseMarkdown(text)
      const tr = applyModelTree(sheetState, tree)
      dispatch(tr)
      return true
    })

    ctx.registerCommand('export.markdown', (state: unknown) => {
      const sheetState = state as SheetState
      const tree: ModelTree = {
        root: {
          id: sheetState.doc.id,
          title: (sheetState.doc.attrs?.title as string) || '',
          children: [],
        },
      }
      return exportMarkdown(tree)
    })
  },
})
