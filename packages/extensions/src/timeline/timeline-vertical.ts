/**
 * TimelineVerticalExtension — 时间线垂直
 */
import { createExtension } from '@tomind/core'
import { timelineVerticalLayoutAlgorithm } from '@tomind/layout'

export const TimelineVerticalExtension = createExtension({
  name: 'timelineVerticalLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return timelineVerticalLayoutAlgorithm
  },
})
