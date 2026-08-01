import { createExtension } from '@tomind/core'
import { treeTableLayoutAlgorithm } from '@tomind/layout'

export const TreeTableExtension = createExtension({
  name: 'treeTableLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return treeTableLayoutAlgorithm
  },
})
