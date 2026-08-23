/**
 * CommentsExtension — 评论扩展
 *
 * 通过 extension 注册 CommentsPartViewDesc，提供评论显示功能。
 * 评论数据在 topic.attrs.comments 中，格式对齐 XMind comments.xml。
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'
import { CommentsPartViewDesc } from '@tomind/view'

// ==================== Extension ====================

export const CommentsExtension = createExtension({
  name: 'comments',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    ctx.registerPartView('comments', CommentsPartViewDesc)

    return () => {
      ctx.unregisterPartView('comments')
    }
  },
})
