/**
 * MapUnbalancedExtension — 非均衡导图（一侧展开）
 */
import { createExtension } from '@tomind/core'
import { createTreeLayoutAlgorithm } from '@tomind/layout'

const mapUnbalanced = createTreeLayoutAlgorithm('map-unbalanced', 'right')

export const MapUnbalancedExtension = createExtension({
  name: 'mapUnbalancedLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return mapUnbalanced
  },
})
