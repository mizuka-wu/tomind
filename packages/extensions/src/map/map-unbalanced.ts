/**
 * MapUnbalancedExtension — 非均衡导图（支持手动分割点）
 */
import { createExtension } from '@tomind/core'
import { mapUnbalancedLayoutAlgorithm } from '@tomind/layout'

export const MapUnbalancedExtension = createExtension({
  name: 'mapUnbalancedLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return mapUnbalancedLayoutAlgorithm
  },
})
