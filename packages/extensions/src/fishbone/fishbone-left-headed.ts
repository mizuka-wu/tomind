/**
 * FishboneLeftHeadedExtension — 鱼骨图（左头）
 */
import { createExtension } from '@tomind/core'
import { fishboneLeftHeadedLayoutAlgorithm } from '@tomind/layout'

export const FishboneLeftHeadedExtension = createExtension({
  name: 'fishboneLeftHeadedLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return fishboneLeftHeadedLayoutAlgorithm
  },
})
