import { createExtension } from '@tomind/core'
import { timelineSidedHorizontalLayoutAlgorithm } from '@tomind/layout'

export const TimelineSidedHorizontalExtension = createExtension({
  name: 'timelineSidedHorizontalLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return timelineSidedHorizontalLayoutAlgorithm
  },
})
