/**
 * XMind 格式解析器
 *
 * XMind 8+ 文件是 ZIP 包，包含：
 * - content.json: 思维导图数据（JSON 格式）
 * - metadata.json: 元数据
 * - manifest.json: 清单
 *
 * content.json 结构：
 * [{
 *   "id": "...",
 *   "class": "sheet",
 *   "title": "Sheet 1",
 *   "rootTopic": {
 *     "id": "...",
 *     "class": "topic",
 *     "title": "Central Topic",
 *     "children": { "attached": [...] }
 *   }
 * }]
 */

import JSZip from 'jszip'
import type { ModelTree, ModelNode } from './model-to-node'

// ==================== XMind JSON 类型 ====================

interface XMindTopic {
  id: string
  class: string
  title: string
  structureClass?: string
  collapsed?: boolean
  children?: {
    attached?: XMindTopic[]
    summary?: XMindTopic[]
    boundary?: XMindTopic[]
  }
  markers?: { markerId: string }[]
  labels?: string[]
  image?: { src: string; width: number; height: number }
  notes?: { plain?: { content: string } }
  href?: string
  style?: { properties?: Record<string, string> }
}

interface XMindSheet {
  id: string
  class: string
  title: string
  rootTopic: XMindTopic
}

// ==================== 解析 ====================

/** XMindTopic → ModelNode */
function convertTopic(topic: XMindTopic): ModelNode {
  const children: ModelNode[] = []

  if (topic.children?.attached) {
    for (const child of topic.children.attached) {
      children.push(convertTopic(child))
    }
  }

  return {
    id: topic.id,
    title: topic.title || '',
    children,
    ...(topic.structureClass ? { structureClass: topic.structureClass } : {}),
    ...(topic.collapsed ? { collapsed: true } : {}),
    ...(topic.markers?.length ? { markers: topic.markers.map((m) => m.markerId) } : {}),
    ...(topic.labels?.length ? { labels: topic.labels } : {}),
    ...(topic.image ? { image: { url: topic.image.src, width: topic.image.width, height: topic.image.height } } : {}),
    ...(topic.notes?.plain?.content ? { note: topic.notes.plain.content } : {}),
    ...(topic.href ? { href: topic.href } : {}),
    ...(topic.style?.properties ? { style: topic.style.properties } : {}),
  }
}

/**
 * 从 XMind ZIP 文件解析
 *
 * @param data - ZIP 文件的 ArrayBuffer 或 Uint8Array
 * @param sheetIndex - 要解析的 sheet 索引（默认 0）
 */
export async function parseXMind(
  data: ArrayBuffer | Uint8Array,
  sheetIndex = 0,
): Promise<ModelTree> {
  const zip = await JSZip.loadAsync(data)

  // 读取 content.json
  const contentFile = zip.file('content.json')
  if (!contentFile) {
    throw new Error('Invalid XMind file: content.json not found')
  }

  const contentText = await contentFile.async('text')
  const sheets: XMindSheet[] = JSON.parse(contentText)

  if (!sheets || sheets.length === 0) {
    throw new Error('XMind file contains no sheets')
  }

  const sheet = sheets[sheetIndex]
  if (!sheet?.rootTopic) {
    throw new Error('XMind sheet has no root topic')
  }

  return {
    root: convertTopic(sheet.rootTopic),
    title: sheet.title,
  }
}

// ==================== 导出 ====================

/** ModelNode → XMindTopic */
function modelToXMindTopic(node: ModelNode): XMindTopic {
  const topic: XMindTopic = {
    id: node.id,
    class: 'topic',
    title: node.title,
  }

  if (node.structureClass) topic.structureClass = node.structureClass
  if (node.collapsed) topic.collapsed = true
  if (node.markers?.length) topic.markers = node.markers.map((m) => ({ markerId: m }))
  if (node.labels?.length) topic.labels = node.labels
  if (node.image) topic.image = { src: node.image.url, width: node.image.width, height: node.image.height }
  if (node.note) topic.notes = { plain: { content: node.note } }
  if (node.href) topic.href = node.href

  if (node.children.length > 0) {
    topic.children = {
      attached: node.children.map((child) => modelToXMindTopic(child)),
    }
  }

  return topic
}

/**
 * 将 ModelTree 导出为 XMind ZIP
 */
export async function exportXMind(
  tree: ModelTree,
  _filename = 'mindmap.xmind',
): Promise<Blob> {
  const zip = new JSZip()

  const sheet: XMindSheet = {
    id: 'sheet-0',
    class: 'sheet',
    title: tree.title || 'Sheet 1',
    rootTopic: modelToXMindTopic(tree.root),
  }

  zip.file('content.json', JSON.stringify([sheet], null, 2))
  zip.file('metadata.json', JSON.stringify({ creator: { name: 'tomind', version: '0.1.0' } }))
  zip.file('manifest.json', JSON.stringify({ 'file-entries': { 'content.json': {}, 'metadata.json': {} } }))

  return zip.generateAsync({ type: 'blob', mimeType: 'application/x-xmind' })
}
