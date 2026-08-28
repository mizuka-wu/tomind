/**
 * Layout 公共工具函数
 * 所有布局算法共享的基础操作
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutOptions } from './layout-engine'
import { measureTextSize } from './layout-engine'

const ATTACHED = 'attached'

// ─── 节点属性读取 ───

/** 类型安全获取节点 style 对象 */
export function getNodeStyle(node: NodeDesc): Record<string, unknown> | undefined {
  const s = node.attrs.style
  return isRecord(s) ? s : undefined
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object'
}

/** 类型安全的 attrs 访问器 */
export function getAttr<T>(node: NodeDesc, key: string): T | undefined {
  return node.attrs[key] as T | undefined
}

/** 类型安全的 style 属性访问器 */
export function getStyleAttr<T>(node: NodeDesc, key: string): T | undefined {
  const style = getNodeStyle(node)
  return style ? (style[key] as T) : undefined
}

export function getFontFamily(node: NodeDesc, styleEngine?: StyleEngine | null, state?: SheetState | null): string {
  if (styleEngine && state) {
    const computed = styleEngine.getStyleValue(state, node.id, 'fontFamily')
    if (typeof computed === 'string' && computed.length > 0) return computed
  }
  return getStyleAttr<string>(node, 'fontFamily') || 'NeverMind, Microsoft YaHei, PingFang SC, Microsoft JhengHei'
}

export function getFontWeight(node: NodeDesc, styleEngine?: StyleEngine | null, state?: SheetState | null): string | number {
  if (styleEngine && state) {
    const computed = styleEngine.getStyleValue(state, node.id, 'fontWeight')
    if (computed != null && (typeof computed === 'string' || typeof computed === 'number')) return computed
  }
  return getStyleAttr<string | number>(node, 'fontWeight') || 'normal'
}

export function getFontStyle(node: NodeDesc, styleEngine?: StyleEngine | null, state?: SheetState | null): string {
  if (styleEngine && state) {
    const computed = styleEngine.getStyleValue(state, node.id, 'fontStyle')
    if (typeof computed === 'string' && computed.length > 0) return computed
  }
  return getStyleAttr<string>(node, 'fontStyle') || 'normal'
}

export function getTitle(node: NodeDesc): string {
  const title = node.attrs.title
  if (typeof title === 'string') return title
  if (Array.isArray(title)) {
    return title.map((u: { text?: string }) => u.text ?? '').join('')
  }
  return ''
}

export function getFontSize(node: NodeDesc, styleEngine?: StyleEngine | null, state?: SheetState | null): number {
  if (styleEngine && state) {
    const computed = styleEngine.getStyleValue(state, node.id, 'fontSize')
    if (computed != null) {
      const parsed = typeof computed === 'string' ? parseInt(computed) : computed
      if (typeof parsed === 'number' && !isNaN(parsed)) return parsed
    }
  }
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
export function measureSimpleNode(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): SimpleNodeSize {
  const fontSize = getFontSize(node, styleEngine, state)
  const title = getTitle(node)
  const fontFamily = getFontFamily(node, styleEngine, state)
  const fontWeight = getFontWeight(node, styleEngine, state)
  const fontStyle = getFontStyle(node, styleEngine, state)
  const { width, height } = measureTextSize(title, fontSize, options, fontFamily, fontWeight, fontStyle)
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
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): void {
  sizeMap.set(node.id, measureSimpleNode(node, options, styleEngine, state))
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureSimpleSubtree(child, options, sizeMap, styleEngine, state)
    }
  }
}
