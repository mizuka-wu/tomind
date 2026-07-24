/**
 * MapClockwiseExtension — 均衡导图
 */
import { createExtension } from '@tomind/core'
import { mapClockwiseLayoutAlgorithm } from '@tomind/layout'

export const MapClockwiseExtension = createExtension({
  name: 'mapClockwiseLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return mapClockwiseLayoutAlgorithm
  },
})
