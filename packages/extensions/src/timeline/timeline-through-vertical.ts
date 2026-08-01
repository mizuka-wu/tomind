import { createExtension } from '@tomind/core'
import { timelineThroughVerticalLayoutAlgorithm } from '@tomind/layout'

export const TimelineThroughVerticalExtension = createExtension({
  name: 'timelineThroughVerticalLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return timelineThroughVerticalLayoutAlgorithm
  },
})
