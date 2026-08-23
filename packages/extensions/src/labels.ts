/**
 * LabelsExtension — 标签扩展
 *
 * 通过 extension 注册 LabelsPartViewDesc，提供标签显示功能。
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'
import { LabelsPartViewDesc } from '@tomind/view'

// ==================== Extension ====================

export const LabelsExtension = createExtension({
  name: 'labels',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    ctx.registerPartView('labels', LabelsPartViewDesc)

    return () => {
      ctx.unregisterPartView('labels')
    }
  },
})
