/**
 * Markdown 格式解析器
 *
 * 支持标准 Markdown 缩进列表转思维导图：
 *
 * # 中心主题
 * ## 主题 1
 * ### 子主题 1.1
 * ### 子主题 1.2
 * ## 主题 2
 * - 列表项 1
 * - 列表项 2
 *   - 嵌套项
 *
 * 规则：
 * - # = 根节点标题
 * - ## = 第一层子节点
 * - ### = 第二层子节点
 * - - 或 * = 无序列表项（同层级）
 * - 缩进 2/4 空格 = 嵌套层级
 */

import type { ModelTree, ModelNode } from './model-to-node'

// ==================== 解析 ====================

interface ParsedLine {
  level: number
  text: string
  isHeading: boolean
}

/** 将 Markdown 文本解析为结构化行 */
function parseLines(markdown: string): ParsedLine[] {
  const lines = markdown.split('\n')
  const result: ParsedLine[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // 标题
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)/)
    if (headingMatch) {
      result.push({
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
        isHeading: true,
      })
      continue
    }

    // 列表项
    const listMatch = trimmed.match(/^[-*]\s+(.+)/)
    if (listMatch) {
      const indent = line.search(/\S/)
      const level = Math.floor(indent / 2) + 2 // 列表从 level 2 开始
      result.push({
        level,
        text: listMatch[1].trim(),
        isHeading: false,
      })
    }
  }

  return result
}

/** 结构化行 → ModelNode 树 */
function linesToTree(lines: ParsedLine[]): ModelNode {
  const root: ModelNode = {
    id: `md-root-${Date.now()}`,
    title: '',
    children: [],
  }

  const stack: { node: ModelNode; level: number }[] = [{ node: root, level: 0 }]

  for (const line of lines) {
    const newNode: ModelNode = {
      id: `md-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: line.text,
      children: [],
    }

    // 回退到正确的父节点
    while (stack.length > 1 && stack[stack.length - 1].level >= line.level) {
      stack.pop()
    }

    const parent = stack[stack.length - 1].node
    parent.children.push(newNode)
    stack.push({ node: newNode, level: line.level })
  }

  return root
}

/**
 * 从 Markdown 字符串解析
 */
export function parseMarkdown(markdown: string): ModelTree {
  const lines = parseLines(markdown)
  if (lines.length === 0) {
    throw new Error('Empty Markdown')
  }

  // 第一个 # 标题作为根节点
  const rootLine = lines[0]
  const root: ModelNode = {
    id: `md-root-${Date.now()}`,
    title: rootLine.text,
    children: [],
  }

  // 剩余行构建子树
  const remaining = lines.slice(1)
  if (remaining.length > 0) {
    const subtree = linesToTree(remaining)
    root.children = subtree.children
  }

  return { root, title: rootLine.text }
}

// ==================== 导出 ====================

/** ModelNode → Markdown 缩进列表 */
function modelToMarkdown(node: ModelNode, depth = 0): string {
  const indent = '  '.repeat(depth)
  const lines: string[] = []

  if (depth === 0) {
    lines.push(`# ${node.title}`)
  } else {
    lines.push(`${indent}- ${node.title}`)
  }

  for (const child of node.children) {
    lines.push(modelToMarkdown(child, depth + 1))
  }

  return lines.join('\n')
}

/**
 * 将 ModelTree 导出为 Markdown
 */
export function exportMarkdown(tree: ModelTree): string {
  return modelToMarkdown(tree.root)
}
