/**
 * MapAnticlockwiseExtension — 逆时针思维导图布局
 */
import { createExtension } from '@tomind/core'
import { mapAnticlockwiseLayoutAlgorithm } from '@tomind/layout'

export const MapAnticlockwiseExtension = createExtension({
  name: 'mapAnticlockwiseLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return mapAnticlockwiseLayoutAlgorithm
  },
})
