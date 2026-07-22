/**
 * OPML 格式解析器
 *
 * OPML (Outline Processor Markup) 是 XML 格式的大纲文件。
 * 常见于 RSS 阅读器、大纲工具导出。
 *
 * 结构：
 * <opml>
 *   <head><title>...</title></head>
 *   <body>
 *     <outline text="Topic" _note="...">
 *       <outline text="Child 1"/>
 *       <outline text="Child 2"/>
 *     </outline>
 *   </body>
 * </opml>
 */

import type { ModelTree, ModelNode } from './model-to-node'

// ==================== 解析 ====================

/** 递归解析 OPML outline 元素 */
function parseOutline(el: Element): ModelNode {
  const title = el.getAttribute('text') || el.getAttribute('title') || ''
  const note = el.getAttribute('_note') || undefined
  const href = el.getAttribute('url') || el.getAttribute('href') || undefined
  const children: ModelNode[] = []

  for (const child of Array.from(el.children)) {
    if (child.tagName === 'outline') {
      children.push(parseOutline(child))
    }
  }

  return {
    id: `opml-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    children,
    ...(note ? { note } : {}),
    ...(href ? { href } : {}),
  }
}

/**
 * 从 OPML XML 字符串解析
 */
export function parseOPML(xml: string): ModelTree {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'text/xml')

  const errorNode = doc.querySelector('parsererror')
  if (errorNode) {
    throw new Error(`Invalid OPML: ${errorNode.textContent}`)
  }

  const titleEl = doc.querySelector('head > title')
  const title = titleEl?.textContent || undefined

  const bodyEl = doc.querySelector('body')
  if (!bodyEl) {
    throw new Error('OPML has no <body> element')
  }

  // 取第一个 outline 作为根
  const rootOutline = bodyEl.querySelector('outline')
  if (!rootOutline) {
    throw new Error('OPML body has no outlines')
  }

  return {
    root: parseOutline(rootOutline),
    title,
  }
}

// ==================== 导出 =================.ts

/** ModelNode → OPML XML string */
function modelToOPML(node: ModelNode, indent = 2): string {
  const pad = ' '.repeat(indent)
  const attrs = [`text="${escapeXml(node.title)}"`]
  if (node.note) attrs.push(`_note="${escapeXml(node.note)}"`)
  if (node.href) attrs.push(`url="${escapeXml(node.href)}"`)

  if (node.children.length === 0) {
    return `${pad}<outline ${attrs.join(' ')}/>`
  }

  const childrenXml = node.children
    .map((child) => modelToOPML(child, indent + 2))
    .join('\n')

  return `${pad}<outline ${attrs.join(' ')}>\n${childrenXml}\n${pad}</outline>`
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 将 ModelTree 导出为 OPML XML
 */
export function exportOPML(tree: ModelTree): string {
  const bodyContent = modelToOPML(tree.root)

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${escapeXml(tree.title || 'Untitled')}</title>
  </head>
  <body>
${bodyContent}
  </body>
</opml>`
}
