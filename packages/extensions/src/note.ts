/**
 * NoteExtension — 备注扩展
 *
 * 通过 extension 注册 NotePartViewDesc，提供备注显示功能。
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'
import { NotePartViewDesc } from '@tomind/view'

// ==================== Extension ====================

export const NoteExtension = createExtension({
  name: 'note',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    ctx.registerPartView('note', NotePartViewDesc)

    return () => {
      ctx.unregisterPartView('note')
    }
  },
})
