/**
 * EditBridgeExtension — 文字编辑桥接扩展
 *
 * 从旧 editreceiver.ts (1076行) → editbridge.ts (555行) → 精简迁移：
 * - 双击节点标题 → LeaferJS TextEditor 原地编辑
 * - 编辑结束 → 写入 model → 重算 layout
 *
 * 纯 LeaferJS 原生实现，无 DOM textarea 依赖。
 * 后续升级富文本时只需替换 TextEditor 部分。
 */

import { createExtension, Transaction, getAttributeTitle, getPlainTextFromAttributeTitle, createAttributeTitleFromPlainText } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'

// ==================== Storage ====================

interface EditBridgeStorage extends Record<string, unknown> {
  /** 当前正在编辑的节点 ID */
  editingNodeId: string | null
  /** 编辑前的原始文字 */
  originalText: string
  /** 是否正在编辑中 */
  isEditing: boolean
}

// ==================== 扩展定义 ====================

export const EditBridgeExtension = createExtension({
  name: 'edit-bridge',
  type: 'extension',

  addStorage(): Record<string, unknown> {
    return {
      editingNodeId: null,
      originalText: '',
      isEditing: false,
    } as EditBridgeStorage
  },

  onCreate(ctx: ExtensionContext) {
    /**
     * 监听 edit:start 事件
     * 由 TopicNodeViewDesc 的 doubletap 触发
     */
    ctx.on('edit:start', (data: unknown) => {
      const { nodeId, node } = data as { nodeId: string; node: any }
      handleEditStart(ctx, nodeId, node)
    })

    // 注册 topic.edit 命令（F2 / Space 触发）
    const commandNames = ['topic.edit']
    for (const name of commandNames) {
      ctx.registerCommand(name, (_params: unknown) => {
        // 获取当前选中的节点
        const state = ctx.getState() as any
        const selectedId = state?.selection?.elements?.[0]?.id
        if (!selectedId) return false

        const node = state.nodes?.get(selectedId)
        if (!node) return false

        handleEditStart(ctx, selectedId, node)
        return true
      })
    }

    return () => {
      const storage = ctx.storage as EditBridgeStorage
      if (storage.isEditing) {
        handleEditCancel(ctx)
      }
      for (const name of commandNames) {
        ctx.unregisterCommand(name)
      }
    }
  },
})

// ==================== 编辑流程 ====================

/**
 * 开始编辑
 * 流程：获取当前文字 → 打开 LeaferJS TextEditor → 监听关闭事件
 */
function handleEditStart(ctx: ExtensionContext, nodeId: string, node: any): void {
  const storage = ctx.storage as EditBridgeStorage

  // 如果正在编辑其他节点，先取消
  if (storage.isEditing && storage.editingNodeId !== nodeId) {
    handleEditCancel(ctx)
  }

  // 如果正在编辑同一个节点，忽略
  if (storage.isEditing && storage.editingNodeId === nodeId) {
    return
  }

  // 获取当前文字（从 attributeTitle 提取纯文本）
  const attributeTitle = getAttributeTitle(node.attrs ?? {})
  const currentText = getPlainTextFromAttributeTitle(attributeTitle)

  // 保存编辑前状态
  storage.editingNodeId = nodeId
  storage.originalText = currentText
  storage.isEditing = true

  // 获取 LeaferJS App
  const view = ctx.getView() as any
  const app = view?.leaferView?.app
  if (!app) {
    console.warn('[EditBridge] no LeaferJS App found')
    storage.isEditing = false
    return
  }

  // 查找 LeaferJS Text 元素（通过 NodeViewDesc 的 group 查找 name=title 的 Text）
  const textElement = findTextElement(app, nodeId)
  if (!textElement) {
    console.warn(`[EditBridge] no Text element found for node: ${nodeId}`)
    storage.isEditing = false
    return
  }

  // 打开 LeaferJS TextEditor 进行原地编辑
  openTextEditor(app, textElement, (finalText: string) => {
    // 编辑结束回调
    handleEditEnd(ctx, nodeId, finalText)
  })
}

/**
 * 编辑结束：写入 model → 重算 layout
 */
function handleEditEnd(ctx: ExtensionContext, nodeId: string, finalText: string): void {
  const storage = ctx.storage as EditBridgeStorage

  // 如果文字没变，直接结束
  if (finalText === storage.originalText) {
    resetStorage(storage)
    return
  }

  // 通过事务写入 model（同时更新 title 和 attributeTitle）
  const state = ctx.getState() as any
  if (state) {
    const tr = new Transaction(state.doc)
    tr.setAttrs(nodeId, {
      title: finalText,
      attributeTitle: createAttributeTitleFromPlainText(finalText),
    })
    ctx.dispatch(tr)
  }

  resetStorage(storage)
}

/**
 * 取消编辑：恢复原始文字
 */
function handleEditCancel(ctx: ExtensionContext): void {
  const storage = ctx.storage as EditBridgeStorage
  // LeaferJS TextEditor 取消时会恢复原始文字
  resetStorage(storage)
}

function resetStorage(storage: EditBridgeStorage): void {
  storage.editingNodeId = null
  storage.originalText = ''
  storage.isEditing = false
}

// ==================== LeaferJS 集成 ====================

/**
 * 在 LeaferJS 画布中查找指定 nodeId 的 Text 元素
 * 遍历 group 树，找到 name 匹配的 Text 节点
 */
function findTextElement(app: any, nodeId: string): any {
  const root = app.world || app.root
  if (!root) return null

  // 递归查找 name 匹配的元素
  function walk(group: any): any {
    if (!group) return null
    const children = group.children || []
    for (const child of children) {
      // LeaferJS Text 元素的 name 通常是 "title" 或包含 nodeId
      if (child.tag === 'Text' && (
        child.name === 'title' ||
        child.name === nodeId ||
        child.name?.includes(nodeId)
      )) {
        return child
      }
      if (child.children?.length) {
        const found = walk(child)
        if (found) return found
      }
    }
    return null
  }

  return walk(root)
}

/**
 * 打开 LeaferJS TextEditor 进行原地编辑
 * 编辑结束后通过回调返回最终文字
 */
function openTextEditor(
  app: any,
  textElement: any,
  onComplete: (text: string) => void,
): void {
  // 方式1: textElement.openEditText() (TextEditor 插件)
  if (typeof textElement.openEditText === 'function') {
    // 监听编辑器关闭事件
    const cleanup = () => {
      // TextEditor 关闭后，读取最终文字
      const finalText = textElement.text ?? ''
      onComplete(finalText)
    }

    // LeaferJS TextEditor 的 close 事件
    if (textElement.on) {
      textElement.on('innerEditorClose', cleanup)
      // 也监听一次性的 close
      textElement.once?.('close', cleanup)
    }

    textElement.openEditText()
    return
  }

  // 方式2: app.editor.openEditText(textElement)
  if (app.editor?.openEditText) {
    app.editor.openEditText(textElement)

    // 监听 InnerEditorEvent.CLOSE
    const onClose = () => {
      const finalText = textElement.text ?? ''
      onComplete(finalText)
      // 清理事件监听
      app.off?.('innerEditor:close', onClose)
    }
    app.on?.('innerEditor:close', onClose)
    return
  }

  // 方式3: 降级 — 直接用 prompt（兜底）
  console.warn('[EditBridge] TextEditor not available, falling back to prompt')
  const currentText = textElement.text ?? ''
  const newText = prompt('Edit text:', currentText)
  if (newText !== null && newText !== currentText) {
    textElement.text = newText
    onComplete(newText)
  } else {
    onComplete(currentText)
  }
}
