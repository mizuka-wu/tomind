/**
 * AssetsExtension — 资源管理扩展
 *
 * 提供贴纸、标记、插图等视觉资源
 */

import type { Extension, ExtensionContext } from '@tomind/core'
import { getAssetsProvider } from '@tomind/core'

export interface AssetsExtensionOptions {
  enabled?: boolean
}

export const AssetsExtension: Extension<AssetsExtensionOptions> = {
  name: 'assets',
  type: 'extension',
  defaultOptions: {
    enabled: true,
  },

  configure(options: Partial<AssetsExtensionOptions>) {
    return {
      ...this,
      defaultOptions: { ...this.defaultOptions, ...options },
    }
  },

  isEnabled() {
    return this.defaultOptions.enabled !== false
  },

  onCreate(ctx: ExtensionContext) {
    // 获取 assets provider
    const assetsProvider = getAssetsProvider()

    // 将 assetsProvider 注册到上下文，供其他扩展访问
    // 当 preset 系统实现后，应通过 ctx.emit('preset:registerAssets', assetsProvider) 注册
    ;(ctx as any).assetsProvider = assetsProvider

    // 返回清理函数
    return () => {
      // 清理
    }
  },
}

export default AssetsExtension
