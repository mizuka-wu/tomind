/**
 * FishboneRightHeadedExtension — 鱼骨图（右头）
 */
import { createExtension } from '@tomind/core'
import { fishboneRightHeadedLayoutAlgorithm } from '@tomind/layout'

export const FishboneRightHeadedExtension = createExtension({
  name: 'fishboneRightHeadedLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return fishboneRightHeadedLayoutAlgorithm
  },
})
