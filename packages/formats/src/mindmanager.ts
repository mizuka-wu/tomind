/**
 * MindManager 格式解析器
 *
 * MindManager 文件是 ZIP 包，包含：
 * - Document.xml: 思维导图数据（XML 格式）
 *
 * Document.xml 结构：
 * <Document>
 *   <Topics>
 *     <Topic ID="..." Text="...">
 *       <Topics>
 *         <Topic .../>
 *       </Topics>
 *     </Topic>
 *   </Topics>
 * </Document>
 */

import JSZip from 'jszip'
import type { ModelTree, ModelNode } from './model-to-node'

// ==================== 解析 ====================

function parseTopic(el: Element): ModelNode {
  const title = el.getAttribute('Text') || el.getAttribute('Name') || ''
  const id = el.getAttribute('ID') || `mm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const note = el.getAttribute('Notes') || el.getAttribute('Note') || undefined
  const href = el.getAttribute('Hyperlink') || undefined
  const children: ModelNode[] = []

  // MindManager 的子节点在 <Topics> 或 <SubTopics> 下
  const topicsContainer = el.querySelector('Topics') || el.querySelector('SubTopics')
  if (topicsContainer) {
    for (const child of Array.from(topicsContainer.children)) {
      if (child.tagName === 'Topic') {
        children.push(parseTopic(child))
      }
    }
  }

  return {
    id,
    title,
    children,
    ...(note ? { note } : {}),
    ...(href ? { href } : {}),
  }
}

/**
 * 从 MindManager ZIP 文件解析
 */
export async function parseMindManager(
  data: ArrayBuffer | Uint8Array,
): Promise<ModelTree> {
  const zip = await JSZip.loadAsync(data)

  // 尝试常见的文件名
  const xmlFileEntry = zip.file('Document.xml')
    || zip.file('document.xml')
    || zip.file('MindMap.xml')
    || Object.keys(zip.files).find((f) => f.endsWith('.xml') && !f.startsWith('_'))

  if (!xmlFileEntry || typeof xmlFileEntry === 'string') {
    throw new Error('Invalid MindManager file: no XML document found')
  }

  const xmlText = await xmlFileEntry.async('text')
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')

  const errorNode = doc.querySelector('parsererror')
  if (errorNode) {
    throw new Error(`Invalid MindManager XML: ${errorNode.textContent}`)
  }

  // 查找根 Topic
  const rootTopic = doc.querySelector('Topic')
    || doc.querySelector('CentralTopic')
    || doc.querySelector('MainTopic')

  if (!rootTopic) {
    throw new Error('MindManager file has no root topic')
  }

  return {
    root: parseTopic(rootTopic),
    title: rootTopic.getAttribute('Text') || rootTopic.getAttribute('Name') || undefined,
  }
}
