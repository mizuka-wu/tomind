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
  numbering?: {
    numberFormat?: string
    numberSeparator?: string
    prefix?: string
    suffix?: string
    prependingNumbers?: string
  }
  children?: {
    attached?: XMindTopic[]
    summary?: XMindTopic[]
    boundary?: XMindTopic[]
  }
  markers?: { markerId: string }[]
  labels?: string[]
  image?: {
    src: string
    width: number
    height: number
    align?: string
    borderWidth?: number
    borderColor?: string
    opacity?: number
    shadowVisible?: boolean
    lockRatio?: boolean
    flipAndRotateRecords?: string
  }
  notes?: { plain?: { content: string }; html?: { content: string } }
  href?: string
  style?: { properties?: Record<string, string> }
  comments?: Array<{ author: string; content: string; time?: number }>
}

interface XMindThemeEntry {
  id?: string
  properties?: Record<string, string>
}

interface XMindSheet {
  id: string
  class: string
  title: string
  rootTopic: XMindTopic
  theme?: {
    id?: string
    centralTopic?: XMindThemeEntry
    mainTopic?: XMindThemeEntry
    subTopic?: XMindThemeEntry
    rootTopic?: XMindThemeEntry
    floatingTopic?: XMindThemeEntry
    calloutTopic?: XMindThemeEntry
    summaryTopic?: XMindThemeEntry
    map?: XMindThemeEntry
    importantTopic?: XMindThemeEntry
    minorTopic?: XMindThemeEntry
    expiredTopic?: XMindThemeEntry
    [key: string]: XMindThemeEntry | string | undefined
  }
}

// ==================== XMind 属性名 → camelCase 映射（渲染层使用） ====================

const XMIND_PROP_MAP: Record<string, string> = {
  'fo:font-family': 'fontFamily',
  'fo:font-weight': 'fontWeight',
  'fo:font-size': 'fontSize',
  'fo:font-style': 'fontStyle',
  'fo:color': 'fontColor',
  'fo:text-decoration': 'textDecoration',
  'fo:text-transform': 'textTransform',
  'fo:text-align': 'textAlign',
  'svg:fill': 'fillColor',
  'fill-pattern': 'fillPattern',
  'border-line-color': 'borderColor',
  'border-line-width': 'borderWidth',
  'border-line-pattern': 'borderPattern',
  'line-color': 'lineColor',
  'line-width': 'lineWidth',
  'line-class': 'lineClass',
  'line-pattern': 'linePattern',
  'line-corner': 'lineCorner',
  'shape-class': 'shapeClass',
  'shape-corner': 'shapeCorner',
  'arrow-end-class': 'arrowEndClass',
  'multi-line-colors': 'multiLineColors',
}

/** 将 XMind 属性对象转为 camelCase（供 style engine / view 层调用） */
export function convertXMindProps(
  props: Record<string, string>,
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(props)) {
    const mapped = XMIND_PROP_MAP[key]
    result[mapped || key] = value
  }
  return result
}

/** 将 XMind 主题条目转为 ThemeData 格式（属性名转为 camelCase，供 StyleEngine 识别） */
function convertXMindThemeEntries(
  theme: NonNullable<XMindSheet['theme']>,
): Record<string, { id?: string; properties: Record<string, string> }> {
  const result: Record<string, { id?: string; properties: Record<string, string> }> = {}
  for (const [className, entry] of Object.entries(theme)) {
    if (className === 'id') continue
    if (typeof entry !== 'object' || !entry || !entry.properties) continue
    result[className] = {
      id: entry.id,
      // XMind 使用 kebab-case 属性名（如 "svg:fill"、"fo:font-size"），
      // 这里统一转换为 camelCase（如 "fillColor"、"fontSize"），使 StyleEngine 能正确识别和应用
      properties: convertXMindProps(entry.properties),
    }
  }
  return result
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
    ...(topic.image ? { image: {
      url: topic.image.src,
      width: topic.image.width,
      height: topic.image.height,
      ...(topic.image.align ? { align: topic.image.align } : {}),
      ...(topic.image.borderWidth != null ? { borderWidth: topic.image.borderWidth } : {}),
      ...(topic.image.borderColor ? { borderColor: topic.image.borderColor } : {}),
      ...(topic.image.opacity != null ? { opacity: topic.image.opacity } : {}),
      ...(topic.image.shadowVisible != null ? { shadowVisible: topic.image.shadowVisible } : {}),
      ...(topic.image.lockRatio != null ? { lockRatio: topic.image.lockRatio } : {}),
      ...(topic.image.flipAndRotateRecords ? { flipAndRotateRecords: topic.image.flipAndRotateRecords } : {}),
    } } : {}),
    ...(topic.notes?.plain?.content ? { note: topic.notes.plain.content } : {}),
    ...(topic.notes?.html?.content ? { noteHtml: topic.notes.html.content } : {}),
    ...(topic.href ? { href: topic.href } : {}),
    ...(topic.style?.properties ? { style: convertXMindProps(topic.style.properties) } : {}),
    ...(topic.numbering ? { numbering: {
      numberFormat: topic.numbering.numberFormat ?? 'org.xmind.numbering.arabic',
      ...(topic.numbering.numberSeparator ? { numberSeparator: topic.numbering.numberSeparator } : {}),
      ...(topic.numbering.prefix ? { prefix: topic.numbering.prefix } : {}),
      ...(topic.numbering.suffix ? { suffix: topic.numbering.suffix } : {}),
      ...(topic.numbering.prependingNumbers ? { prependingNumbers: topic.numbering.prependingNumbers } : {}),
    } } : {}),
  }
}

/** 收集树中所有节点 ID → ModelNode 的映射 */
function collectTopicIds(node: ModelNode, map: Map<string, ModelNode>): void {
  map.set(node.id, node)
  for (const child of node.children) {
    collectTopicIds(child, map)
  }
}

/** 从 comments.xml 解析评论并挂载到对应节点 */
function attachComments(root: ModelNode, commentsXml: string): void {
  // 使用正则解析 XML（避免引入 DOMParser 依赖）
  // 匹配 <comment object-id="..." time="..." author="...">...<content>...</content>...</comment>
  const commentRegex = /<comment\s[^>]*object-id="([^"]*)"[^>]*>([\s\S]*?)<\/comment>/g
  const topicMap = new Map<string, ModelNode>()
  collectTopicIds(root, topicMap)

  let match: RegExpExecArray | null
  while ((match = commentRegex.exec(commentsXml)) !== null) {
    const commentTag = match[0]
    const objectId = match[1]

    // 提取 time 和 author 属性
    const timeMatch = commentTag.match(/time="(\d+)"/)
    const authorMatch = commentTag.match(/author="([^"]*)"/)

    // 提取 <content>...</content>
    const contentMatch = commentTag.match(/<content[^>]*>([\s\S]*?)<\/content>/)

    if (!contentMatch) continue

    const node = topicMap.get(objectId)
    if (!node) continue

    const comment = {
      author: authorMatch?.[1] ?? '',
      content: contentMatch[1] ?? '',
      ...(timeMatch ? { time: Number(timeMatch[1]) } : {}),
    }

    if (!node.comments) {
      node.comments = []
    }
    node.comments.push(comment)
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

  // 提取主题数据（保留 XMind 原始属性名，转换由渲染层负责）
  let themeData: ModelTree['themeData'] | undefined
  if (sheet.theme) {
    const converted = convertXMindThemeEntries(sheet.theme)
    themeData = Object.keys(converted).length > 0 ? converted : undefined
  }

  const root = convertTopic(sheet.rootTopic)

  // 读取 comments.xml（可选文件）
  const commentsFile = zip.file('comments.xml')
  if (commentsFile) {
    const commentsXml = await commentsFile.async('text')
    attachComments(root, commentsXml)
  }

  return {
    root,
    title: sheet.title,
    themeData,
  }
}

// ==================== 导出 ====================

/** XML 特殊字符转义 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** 收集树中所有评论（object-id → comments） */
function collectAllComments(
  node: ModelNode,
  map: Map<string, Array<{ author: string; content: string; time?: number }>>,
): void {
  if (node.comments?.length) {
    map.set(node.id, node.comments)
  }
  for (const child of node.children) {
    collectAllComments(child, map)
  }
}

/** 生成 comments.xml 内容 */
function generateCommentsXml(
  commentsMap: Map<string, Array<{ author: string; content: string; time?: number }>>,
): string {
  if (commentsMap.size === 0) return ''

  const comments: string[] = []
  for (const [objectId, commentList] of commentsMap) {
    for (const comment of commentList) {
      const timeAttr = comment.time != null ? ` time="${comment.time}"` : ''
      comments.push(
        `<comment author="${escapeXml(comment.author)}"${timeAttr} object-id="${objectId}"><content>${escapeXml(comment.content)}</content></comment>`,
      )
    }
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?><comments xmlns="urn:xmind:xmap:xmlns:comments:2.0" version="2.0">${comments.join('')}</comments>`
}

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
  if (node.image) {
    topic.image = {
      src: node.image.url,
      width: node.image.width,
      height: node.image.height,
      ...(node.image.align ? { align: node.image.align } : {}),
      ...(node.image.borderWidth != null ? { borderWidth: node.image.borderWidth } : {}),
      ...(node.image.borderColor ? { borderColor: node.image.borderColor } : {}),
      ...(node.image.opacity != null ? { opacity: node.image.opacity } : {}),
      ...(node.image.shadowVisible != null ? { shadowVisible: node.image.shadowVisible } : {}),
      ...(node.image.lockRatio != null ? { lockRatio: node.image.lockRatio } : {}),
      ...(node.image.flipAndRotateRecords ? { flipAndRotateRecords: node.image.flipAndRotateRecords } : {}),
    }
  }
  if (node.note || node.noteHtml) {
    topic.notes = {}
    if (node.note) topic.notes.plain = { content: node.note }
    if (node.noteHtml) topic.notes.html = { content: node.noteHtml }
  }
  if (node.href) topic.href = node.href
  if (node.numbering) topic.numbering = node.numbering

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

  // 收集并导出 comments.xml
  const commentsMap = new Map<string, Array<{ author: string; content: string; time?: number }>>()
  collectAllComments(tree.root, commentsMap)

  const manifestEntries: Record<string, unknown> = { 'content.json': {}, 'metadata.json': {} }

  if (commentsMap.size > 0) {
    const commentsXml = generateCommentsXml(commentsMap)
    zip.file('comments.xml', commentsXml)
    manifestEntries['comments.xml'] = {}
  }

  zip.file('manifest.json', JSON.stringify({ 'file-entries': manifestEntries }))

  return zip.generateAsync({ type: 'blob', mimeType: 'application/x-xmind' })
}
