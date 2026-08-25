/**
 * MathjaxExtension — MathJax 公式扩展
 *
 * 通过 extension 注册 MathjaxNodeViewDesc，提供 MathJax 公式渲染。
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'
import { MathjaxNodeViewDesc } from '@tomind/view'

// ==================== Extension ====================

export const MathjaxExtension = createExtension({
  name: 'mathjax',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext<any, any>) {
    ctx.registerNodeView('mathjax', MathjaxNodeViewDesc)

    return () => {
      ctx.unregisterNodeView('mathjax')
    }
  },
})
