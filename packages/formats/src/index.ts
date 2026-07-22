/**
 * @tomind/formats — 格式转换模块
 *
 * 支持 7 种格式的导入/导出：
 * - XMind (.xmind) — ZIP + content.json
 * - OPML (.opml) — XML 大纲格式
 * - FreeMind (.mm) — XML 思维导图
 * - Markdown (.md) — 标题 + 列表
 * - MindManager (.mmap) — ZIP + Document.xml
 * - Lighten (.lighten) — JSON
 * - MindNode (.mindnode) — JSON
 */

// 中间格式
export { modelToNodeDesc } from './model-to-node'
export type { ModelTree, ModelNode } from './model-to-node'

// 解析器 + 导出器
export { parseXMind, exportXMind } from './xmind'
export { parseOPML, exportOPML } from './opml'
export { parseFreeMind, exportFreeMind } from './freemind'
export { parseMarkdown, exportMarkdown } from './markdown'
export { parseMindManager } from './mindmanager'
export { parseLighten, exportLighten } from './lighten'
export { parseMindNode, exportMindNode } from './mindnode'

// Extension（基础格式）
export {
  XmindFormatExtension,
  OpmlFormatExtension,
  FreemarkFormatExtension,
  MarkdownFormatExtension,
} from './extensions'

// Extension（扩展格式）
export {
  MindManagerFormatExtension,
  LightenFormatExtension,
  MindNodeFormatExtension,
} from './extensions-extra'
