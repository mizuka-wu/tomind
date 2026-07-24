/**
 * TimelineHorizontalExtension — 时间线水平
 */
import { createExtension } from '@tomind/core'
import { timelineHorizontalLayoutAlgorithm } from '@tomind/layout'

export const TimelineHorizontalExtension = createExtension({
  name: 'timelineHorizontalLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return timelineHorizontalLayoutAlgorithm
  },
})
