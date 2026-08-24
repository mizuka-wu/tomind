/**
 * Layout 公共工具函数
 * 所有布局算法共享的基础操作
 */
import type { NodeDesc } from '@tomind/schema'
import type { LayoutOptions } from './layout-engine'
import { measureTextSize } from './layout-engine'

const ATTACHED = 'attached'

// ─── 节点属性读取 ───

/** 类型安全获取节点 style 对象 */
export function getNodeStyle(node: NodeDesc): Record<string, unknown> | undefined {
  const s = node.attrs.style
  return (s && typeof s === 'object') ? s as Record<string, unknown> : undefined
}

export function getTitle(node: NodeDesc): string {
  const title = node.attrs.title
  if (typeof title === 'string') return title
  if (Array.isArray(title)) {
    return title.map((u: { text?: string }) => u.text ?? '').join('')
  }
  return ''
}

export function getFontSize(node: NodeDesc): number {
  const style = getNodeStyle(node)
  const fontSize = style?.fontSize
  if (typeof fontSize === 'string') {
    const parsed = parseInt(fontSize)
    return isNaN(parsed) ? 14 : parsed
  }
  if (typeof fontSize === 'number') return fontSize
  return 14
}

export function isCollapsed(node: NodeDesc): boolean {
  return (node.attrs.collapsed as boolean) ?? false
}

// ─── 树遍历 ───

export function getAttachedChildren(node: NodeDesc): readonly NodeDesc[] {
  return node.children[ATTACHED] ?? []
}

export function findRootTopic(doc: NodeDesc): NodeDesc | null {
  if (doc.type === 'topic' || doc.type === 'root') return doc
  const attached = getAttachedChildren(doc)
  if (attached.length > 0) return attached[0]
  for (const children of Object.values(doc.children)) {
    for (const child of children) {
      const found = findRootTopic(child)
      if (found) return found
    }
  }
  return null
}

// ─── 测量 ───

export { measureTextSize }

export interface SimpleNodeSize {
  width: number
  height: number
}

/** 简单节点测量（title + padding），适用于不需要 part-aware 的布局 */
export function measureSimpleNode(node: NodeDesc, options: LayoutOptions): SimpleNodeSize {
  const fontSize = getFontSize(node)
  const title = getTitle(node)
  const { width, height } = measureTextSize(title, fontSize, options)
  return {
    width: width + options.nodePadding.left + options.nodePadding.right,
    height: height + options.nodePadding.top + options.nodePadding.bottom,
  }
}

/** 递归测量整棵子树，填充 sizeMap */
export function measureSimpleSubtree(
  node: NodeDesc,
  options: LayoutOptions,
  sizeMap: Map<string, SimpleNodeSize>,
): void {
  sizeMap.set(node.id, measureSimpleNode(node, options))
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureSimpleSubtree(child, options, sizeMap)
    }
  }
}
