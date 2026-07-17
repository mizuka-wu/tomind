// 旧模块（保持兼容）
export * from './lib'

import * as stickerModule from './lib/stickers/index'
import * as markerModule from './lib/markers/index'
import * as addonModule from './lib/addons/index'
import * as illustrationModule from './lib/illustrations/index'

/**
 * 获取 Assets Provider（兼容旧接口）
 * 返回所有资源模块的聚合访问器
 */
export function getAssetsProvider() {
  return {
    stickers: stickerModule,
    markers: markerModule,
    addons: addonModule,
    illustrations: illustrationModule,
  }
}
