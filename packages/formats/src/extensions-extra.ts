/**
 * MindManager / Lighten / MindNode 格式扩展
 *
 * 每个格式注册 import.xxx 命令
 */

import { createExtension, Transaction, InsertNodeStep } from '@tomind/core'
import type { SheetState, ExtensionContext } from '@tomind/core'
import { modelToNodeDesc } from './model-to-node'
import type { ModelTree } from './model-to-node'
import { parseMindManager } from './mindmanager'
import { parseLighten, exportLighten } from './lighten'
import { parseMindNode, exportMindNode } from './mindnode'

// ==================== 类型 ====================

export interface FormatOptions extends Record<string, unknown> {
  enabled?: boolean
}

// ==================== 工具函数 ====================

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}

async function readFileAsText(file: File): Promise<string> {
  return file.text()
}

function applyModelTree(state: SheetState, tree: ModelTree): Transaction {
  const newDoc = modelToNodeDesc(tree)
  const tr = new Transaction(state.doc, [
    new InsertNodeStep(newDoc.id, '', -1, newDoc),
  ], [state.doc], new Map())
  return tr
}

// ==================== MindManager 扩展 ====================

export const MindManagerFormatExtension = createExtension<FormatOptions>({
  name: 'import-mindmanager',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    ctx.registerCommand('import.mindmanager', async (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { file } = (params ?? {}) as { file?: File }
      if (!file) return false

      const data = await readFileAsArrayBuffer(file)
      const tree = await parseMindManager(data)
      const tr = applyModelTree(sheetState, tree)
      dispatch(tr)
      return true
    })
  },
})

// ==================== Lighten 扩展 ====================

export const LightenFormatExtension = createExtension<FormatOptions>({
  name: 'import-lighten',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    ctx.registerCommand('import.lighten', async (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { file } = (params ?? {}) as { file?: File }
      if (!file) return false

      const text = await readFileAsText(file)
      const tree = parseLighten(text)
      const tr = applyModelTree(sheetState, tree)
      dispatch(tr)
      return true
    })

    ctx.registerCommand('export.lighten', (state: unknown) => {
      const sheetState = state as SheetState
      const tree: ModelTree = {
        root: {
          id: sheetState.doc.id,
          title: (sheetState.doc.attrs?.title as string) || '',
          children: [],
        },
      }
      return exportLighten(tree)
    })
  },
})

// ==================== MindNode 扩展 ====================

export const MindNodeFormatExtension = createExtension<FormatOptions>({
  name: 'import-mindnode',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    ctx.registerCommand('import.mindnode', async (state: unknown, dispatch: ((tr: unknown) => void) | null, params?: unknown) => {
      if (!dispatch) return true
      const sheetState = state as SheetState
      const { file } = (params ?? {}) as { file?: File }
      if (!file) return false

      const text = await readFileAsText(file)
      const tree = parseMindNode(text)
      const tr = applyModelTree(sheetState, tree)
      dispatch(tr)
      return true
    })

    ctx.registerCommand('export.mindnode', (state: unknown) => {
      const sheetState = state as SheetState
      const tree: ModelTree = {
        root: {
          id: sheetState.doc.id,
          title: (sheetState.doc.attrs?.title as string) || '',
          children: [],
        },
      }
      return exportMindNode(tree)
    })
  },
})
