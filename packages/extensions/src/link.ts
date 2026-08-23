/**
 * LinkExtension — 链接扩展
 *
 * 通过 extension 注册 LinkPartViewDesc，提供链接显示功能。
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'
import { LinkPartViewDesc } from '@tomind/view'

// ==================== Extension ====================

export const LinkExtension = createExtension({
  name: 'link',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    ctx.registerPartView('link', LinkPartViewDesc)

    return () => {
      ctx.unregisterPartView('link')
    }
  },
})
