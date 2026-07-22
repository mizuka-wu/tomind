/**
 * FreeMind/Freeplane 格式解析器
 *
 * FreeMind 文件是 XML 格式 (.mm)：
 * <map version="1.0.1">
 *   <node TEXT="Central Topic" ID="...">
 *     <node TEXT="Child 1" ID="...">
 *       <node TEXT="Grandchild" ID="..."/>
 *     </node>
 *     <node TEXT="Child 2" ID="..."/>
 *   </node>
 * </map>
 */

import type { ModelTree, ModelNode } from './model-to-node'

// ==================== 解析 ====================

function parseNode(el: Element): ModelNode {
  const title = el.getAttribute('TEXT') || ''
  const id = el.getAttribute('ID') || `fm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const note = el.getAttribute('NOTE') || undefined
  const href = el.getAttribute('LINK') || undefined
  const folded = el.getAttribute('FOLDED') === 'true'
  const children: ModelNode[] = []

  for (const child of Array.from(el.children)) {
    if (child.tagName === 'node') {
      children.push(parseNode(child))
    }
  }

  return {
    id,
    title,
    children,
    ...(note ? { note } : {}),
    ...(href ? { href } : {}),
    ...(folded ? { collapsed: true } : {}),
  }
}

/**
 * 从 FreeMind XML 字符串解析
 */
export function parseFreeMind(xml: string): ModelTree {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'text/xml')

  const errorNode = doc.querySelector('parsererror')
  if (errorNode) {
    throw new Error(`Invalid FreeMind: ${errorNode.textContent}`)
  }

  const mapEl = doc.querySelector('map')
  if (!mapEl) {
    throw new Error('Not a FreeMind file: no <map> element')
  }

  const rootNode = mapEl.querySelector('node')
  if (!rootNode) {
    throw new Error('FreeMind map has no root node')
  }

  return {
    root: parseNode(rootNode),
    title: rootNode.getAttribute('TEXT') || undefined,
  }
}

// ==================== 导出 ====================

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function modelToFreeMind(node: ModelNode, indent = 2): string {
  const pad = ' '.repeat(indent)
  const attrs = [`TEXT="${escapeXml(node.title)}"`, `ID="${node.id}"`]
  if (node.note) attrs.push(`NOTE="${escapeXml(node.note)}"`)
  if (node.href) attrs.push(`LINK="${escapeXml(node.href)}"`)
  if (node.collapsed) attrs.push('FOLDED="true"')

  if (node.children.length === 0) {
    return `${pad}<node ${attrs.join(' ')}/>`
  }

  const childrenXml = node.children
    .map((child) => modelToFreeMind(child, indent + 2))
    .join('\n')

  return `${pad}<node ${attrs.join(' ')}>\n${childrenXml}\n${pad}</node>`
}

/**
 * 将 ModelTree 导出为 FreeMind XML
 */
export function exportFreeMind(tree: ModelTree): string {
  const rootXml = modelToFreeMind(tree.root)

  return `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
${rootXml}
</map>`
}
