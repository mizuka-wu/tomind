/**
 * NumberingExtension — 编号扩展
 *
 * 注册 NumberingPlugin 到编辑器，提供节点编号功能。
 * 编号配置在父节点上（node.attrs.numbering），控制子节点的显示编号。
 *
 * 对齐 snowbrush 的 numbering 系统：
 * - NUMBERFORMAT: org.xmind.numbering.arabic / roman / lowercase / uppercase / none
 * - NUMBERSEPARATOR: org.xmind.numbering.separator.comma / dot / hyphen / dash / oblique
 */

import { createExtension } from '@tomind/extension'
import { createNumberingPlugin } from '@tomind/state'
import type { ExtensionContext } from '@tomind/extension'

// ==================== Extension ====================

export const NumberingExtension = createExtension({
  name: 'numbering',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    const plugin = createNumberingPlugin()
    ctx.registerPlugin(plugin)

    return () => {
      ctx.unregisterPlugin(plugin)
    }
  },
})
