/**
 * ImageExtension — 图片扩展
 *
 * 通过 extension 注册 ImagePartViewDesc，提供图片显示功能。
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'
import { ImagePartViewDesc } from '@tomind/view'

// ==================== Extension ====================

export const ImageExtension = createExtension({
  name: 'image',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext<any, any>) {
    ctx.registerPartView('image', ImagePartViewDesc)

    return () => {
      ctx.unregisterPartView('image')
    }
  },
})
