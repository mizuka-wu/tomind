/**
 * @tomind/formats — 思维导图格式转换工具包
 *
 * 纯函数，无副作用，支持摇树优化。
 * 每个格式独立子路径导入：
 *
 * ```ts
 * import { parseXMind, exportXMind } from '@tomind/formats/xmind'
 * import { parseOPML, exportOPML } from '@tomind/formats/opml'
 * import { parseFreeMind, exportFreeMind } from '@tomind/formats/freemind'
 * import { parseMarkdown, exportMarkdown } from '@tomind/formats/markdown'
 * import { parseMindManager } from '@tomind/formats/mindmanager'
 * import { parseLighten, exportLighten } from '@tomind/formats/lighten'
 * import { parseMindNode, exportMindNode } from '@tomind/formats/mindnode'
 * import { modelToNodeDesc } from '@tomind/formats/model-to-node'
 * ```
 */

export { modelToNodeDesc } from './model-to-node'
export type { ModelTree, ModelNode } from './model-to-node'
