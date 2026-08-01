import { createExtension } from '@tomind/core'
import { timelineHorizontalUpLayoutAlgorithm } from '@tomind/layout'

export const TimelineHorizontalUpExtension = createExtension({
  name: 'timelineHorizontalUpLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return timelineHorizontalUpLayoutAlgorithm
  },
})
