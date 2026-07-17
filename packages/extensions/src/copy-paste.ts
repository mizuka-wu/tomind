import { createExtension, getTitleText, Transaction } from '@tomind/core'
import type { NodeDesc, ExtensionContext, CommandFn, KeyboardShortcutHandler, SheetState, SelectionElement } from '@tomind/core'
/**
 * CopyPasteExtension — 复制粘贴扩展
 *
 * 功能：
 * 1. 复制选中内容到剪贴板
 * 2. 从剪贴板粘贴内容
 * 3. 支持多种格式：HTML、纯文本
 *
 * 命令：
 * - clipboard.copy: 复制
 * - clipboard.paste: 粘贴
 * - clipboard.cut: 剪切
 *
 * 快捷键：
 * - Mod-c: 复制
 * - Mod-v: 粘贴
 * - Mod-x: 剪切
 */


// ==================== 类型定义 ====================

interface CopyPasteOptions {
  [key: string]: unknown
  enabled?: boolean
}

/** 剪贴板数据 */
interface ClipboardData {
  'text/plain': string
  'text/html': string
  'image/png'?: Blob
}

/** 节点数据 */
interface NodeData {
  id: string
  type: string
  title: string
  children?: NodeData[]
}

// ==================== ClipboardHelper ====================

/**
 * 剪贴板帮助类
 */
class ClipboardHelper {
  /**
   * 写入剪贴板
   */
  static async write(data: ClipboardData): Promise<void> {
    try {
      // 优先使用 Clipboard API
      if (navigator.clipboard && navigator.clipboard.write) {
        const items: Record<string, Blob> = {}
        
        if (data['text/plain']) {
          items['text/plain'] = new Blob([data['text/plain']], { type: 'text/plain' })
        }
        
        if (data['text/html']) {
          items['text/html'] = new Blob([data['text/html']], { type: 'text/html' })
        }
        
        if (data['image/png']) {
          items['image/png'] = data['image/png']
        }
        
        const clipboardItems = [new ClipboardItem(items)]
        await navigator.clipboard.write(clipboardItems)
      } else {
        // 降级到 execCommand
        const text = data['text/plain'] || ''
        await navigator.clipboard.writeText(text)
      }
    } catch (error) {
      console.error('Failed to write clipboard:', error)
    }
  }

  /**
   * 读取剪贴板
   */
  static async read(): Promise<ClipboardData> {
    const result: ClipboardData = {
      'text/plain': '',
      'text/html': '',
    }
    
    try {
      // 优先使用 Clipboard API
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read()
        
        for (const item of clipboardItems) {
          // 读取纯文本
          if (item.types.includes('text/plain')) {
            const blob = await item.getType('text/plain')
            result['text/plain'] = await blob.text()
          }
          
          // 读取 HTML
          if (item.types.includes('text/html')) {
            const blob = await item.getType('text/html')
            result['text/html'] = await blob.text()
          }
          
          // 读取图片
          if (item.types.includes('image/png')) {
            result['image/png'] = await item.getType('image/png')
          }
        }
      } else {
        // 降级到 readText
        result['text/plain'] = await navigator.clipboard.readText()
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error)
    }
    
    return result
  }
}

// ==================== CopyPasteExtension ====================

export const CopyPasteExtension = createExtension<CopyPasteOptions>({
  name: 'copyPaste',
  type: 'extension',
  defaultOptions: {
    enabled: true,
  },

  onCreate(ctx) {
    // 注册命令
    const commands = createCopyPasteCommands(ctx)
    for (const [name, command] of Object.entries(commands)) {
      ctx.registerCommand(name, command)
    }

    // 注册快捷键
    const shortcuts: Record<string, KeyboardShortcutHandler> = {
      'Mod-c': () => ctx.executeCommand('clipboard.copy'),
      'Mod-v': () => ctx.executeCommand('clipboard.paste'),
      'Mod-x': () => ctx.executeCommand('clipboard.cut'),
    }

    // 返回清理函数
    return () => {
      for (const name of Object.keys(commands)) {
        ctx.unregisterCommand(name)
      }
    }
  },
})

// ==================== 命令工厂 ====================

function createCopyPasteCommands(ctx: ExtensionContext): Record<string, CommandFn> {
  return {
    /**
     * 复制
     */
    'clipboard.copy': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      const sheetState = state as SheetState
      if (!sheetState?.selection) return false

      const { elements } = sheetState.selection
      if (elements.length === 0) return false

      // 获取选中节点数据
      const nodesData = getNodesData(sheetState, elements)
      if (nodesData.length === 0) return false

      // 生成剪贴板数据
      const data: ClipboardData = {
        'text/plain': nodesToPlainText(nodesData),
        'text/html': nodesToHTML(nodesData),
      }

      // 写入剪贴板
      ClipboardHelper.write(data)

      return true
    },

    /**
     * 粘贴
     */
    'clipboard.paste': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      const sheetState = state as SheetState
      if (!sheetState?.doc || !dispatch) return false

      // 异步读取剪贴板
      ClipboardHelper.read().then(data => {
        let nodesData: NodeData[] = []

        // 按优先级尝试解析
        if (data['text/html']) {
          nodesData = parseHTML(data['text/html'])
        } else if (data['text/plain']) {
          nodesData = parsePlainText(data['text/plain'])
        }

        if (nodesData.length === 0) return

        // 获取当前选中的节点（作为父节点）
        const parentElement = sheetState.selection?.elements[0]
        const parentId = parentElement?.id || sheetState.doc?.id

        if (!parentId) return

        // 创建事务
        const tr = new Transaction(sheetState.doc)

        // 添加节点
        for (const nodeData of nodesData) {
          addNodeFromData(tr, parentId, nodeData)
        }

        dispatch(tr)
      })

      return true
    },

    /**
     * 剪切
     */
    'clipboard.cut': (
      state: unknown,
      dispatch: ((tr: unknown) => void) | null
    ): boolean => {
      // 复制
      ctx.executeCommand('clipboard.copy')

      // 删除选中
      ctx.executeCommand('selection.deleteSelected')

      return true
    },
  }
}

// ==================== 数据转换 ====================

/**
 * 获取节点数据
 */
function getNodesData(sheetState: SheetState, elements: readonly SelectionElement[]): NodeData[] {
  const nodesData: NodeData[] = []

  for (const element of elements) {
    const node = sheetState.getNode(element.id)
    if (!node) continue

    const nodeData: NodeData = {
      id: node.id,
      type: node.type,
      title: getTitleText(node.attrs ?? {}),
    }

    // 递归获取子节点
    if (node.children) {
      nodeData.children = []
      for (const [, children] of Object.entries(node.children)) {
        if (Array.isArray(children)) {
          for (const child of children) {
            const childData = getNodesData(sheetState, [{ id: child.id, type: element.type }])
            nodeData.children.push(...childData)
          }
        }
      }
    }

    nodesData.push(nodeData)
  }

  return nodesData
}

/**
 * 节点转纯文本
 */
function nodesToPlainText(nodes: NodeData[]): string {
  const lines: string[] = []

  const walk = (node: NodeData, depth: number) => {
    const indent = '  '.repeat(depth)
    lines.push(`${indent}${node.title}`)
    if (node.children) {
      for (const child of node.children) {
        walk(child, depth + 1)
      }
    }
  }

  for (const node of nodes) {
    walk(node, 0)
  }

  return lines.join('\n')
}

/**
 * 节点转 HTML
 */
function nodesToHTML(nodes: NodeData[]): string {
  const html: string[] = []

  html.push('<div class="snowbrush-clipboard">')

  const walk = (node: NodeData) => {
    html.push(`<div class="topic" data-type="${node.type}">`)
    html.push(`<div class="title">${escapeHTML(node.title)}</div>`)
    if (node.children && node.children.length > 0) {
      html.push('<div class="children">')
      for (const child of node.children) {
        walk(child)
      }
      html.push('</div>')
    }
    html.push('</div>')
  }

  for (const node of nodes) {
    walk(node)
  }

  html.push('</div>')

  return html.join('')
}

/**
 * 解析 HTML
 */
function parseHTML(html: string): NodeData[] {
  const nodes: NodeData[] = []

  // 创建临时 DOM 解析 HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // 查找所有 topic 元素
  const topicElements = doc.querySelectorAll('.topic')

  for (const topicElement of topicElements) {
    const nodeData = parseTopicElement(topicElement)
    if (nodeData) {
      nodes.push(nodeData)
    }
  }

  return nodes
}

/**
 * 解析 topic 元素
 */
function parseTopicElement(element: Element): NodeData | null {
  const titleElement = element.querySelector(':scope > .title')
  if (!titleElement) return null

  const nodeData: NodeData = {
    id: `paste-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: element.getAttribute('data-type') || 'topic',
    title: titleElement.textContent || '',
  }

  // 解析子节点
  const childrenElement = element.querySelector(':scope > .children')
  if (childrenElement) {
    nodeData.children = []
    const childTopicElements = childrenElement.querySelectorAll(':scope > .topic')
    for (const childElement of childTopicElements) {
      const childData = parseTopicElement(childElement)
      if (childData) {
        nodeData.children.push(childData)
      }
    }
  }

  return nodeData
}

/**
 * 解析纯文本
 */
function parsePlainText(text: string): NodeData[] {
  const nodes: NodeData[] = []
  const lines = text.split('\n')

  let currentNode: NodeData | null = null
  let currentDepth = 0

  for (const line of lines) {
    if (!line.trim()) continue

    // 计算缩进深度
    const match = line.match(/^(\s*)/)
    const indent = match ? match[1].length : 0
    const depth = Math.floor(indent / 2)

    // 创建节点
    const nodeData: NodeData = {
      id: `paste-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'topic',
      title: line.trim(),
    }

    if (depth === 0) {
      // 顶级节点
      nodes.push(nodeData)
      currentNode = nodeData
      currentDepth = 0
    } else if (depth > currentDepth && currentNode) {
      // 子节点
      if (!currentNode.children) {
        currentNode.children = []
      }
      currentNode.children.push(nodeData)
      currentNode = nodeData
      currentDepth = depth
    } else {
      // 同级或上级节点
      // 需要找到正确的父节点
      // 简化处理：添加为顶级节点
      nodes.push(nodeData)
      currentNode = nodeData
      currentDepth = depth
    }
  }

  return nodes
}

/**
 * 从数据添加节点
 * 递归将 nodeData 插入到 parentId 下
 */
function addNodeFromData(tr: Transaction, parentId: string, nodeData: NodeData, index?: number): void {
  // 构造 NodeDesc
  const nodeDesc: NodeDesc = {
    id: nodeData.id,
    type: nodeData.type,
    attrs: {
      title: nodeData.title,
    },
    children: {},
  }

  // 插入到父节点的 children 中
  tr.insertNode(parentId, index ?? 0, nodeDesc)

  // 递归添加子节点
  if (nodeData.children) {
    for (let i = 0; i < nodeData.children.length; i++) {
      addNodeFromData(tr, nodeData.id, nodeData.children[i], i)
    }
  }
}

/**
 * 转义 HTML
 */
function escapeHTML(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export { ClipboardHelper, ClipboardData, NodeData }
