/**
 * InformationIconExtension — 信息图标扩展
 *
 * 通过 extension 注册 InformationIconPartViewDesc，提供信息图标显示功能。
 * 根据 node.attrs 中的 note/comments/link/taskInfo 确定图标类型。
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'
import { InformationIconPartViewDesc } from '@tomind/view'

// ==================== Extension ====================

export const InformationIconExtension = createExtension({
  name: 'informationIcon',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext<any, any>) {
    ctx.registerPartView('informationIcon', InformationIconPartViewDesc)

    return () => {
      ctx.unregisterPartView('informationIcon')
    }
  },
})
