import { createExtension } from '@tomind/core'
import { timelineHorizontalDownLayoutAlgorithm } from '@tomind/layout'

export const TimelineHorizontalDownExtension = createExtension({
  name: 'timelineHorizontalDownLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return timelineHorizontalDownLayoutAlgorithm
  },
})
