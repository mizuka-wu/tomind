/**
 * TreeUpExtension — 向上展开
 */
import { createExtension } from '@tomind/core'
import { createTreeLayoutAlgorithm } from '@tomind/layout'

const treeUp = createTreeLayoutAlgorithm('tree-up', 'up')

export const TreeUpExtension = createExtension({
  name: 'treeUpLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return treeUp
  },
})
