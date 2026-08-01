import { createExtension } from '@tomind/core'
import { braceRightLayoutAlgorithm } from '@tomind/layout'

export const BraceRightExtension = createExtension({
  name: 'braceRightLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return braceRightLayoutAlgorithm
  },
})
