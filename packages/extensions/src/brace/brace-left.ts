import { createExtension } from '@tomind/core'
import { braceLeftLayoutAlgorithm } from '@tomind/layout'

export const BraceLeftExtension = createExtension({
  name: 'braceLeftLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return braceLeftLayoutAlgorithm
  },
})
