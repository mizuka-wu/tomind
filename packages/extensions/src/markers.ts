/**
 * MarkersExtension — 标记扩展
 *
 * 通过 extension 注册 MarkersPartViewDesc，提供标记显示功能。
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'
import { MarkersPartViewDesc } from '@tomind/view'

// ==================== Extension ====================

export const MarkersExtension = createExtension({
  name: 'markers',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext<any, any>) {
    ctx.registerPartView('markers', MarkersPartViewDesc)

    return () => {
      ctx.unregisterPartView('markers')
    }
  },
})
