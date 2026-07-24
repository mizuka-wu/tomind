/**
 * TreeUpLayoutExtension — 向上展开
 */
import { createExtension, createTreeLayoutAlgorithm } from '@tomind/core'

const treeUp = createTreeLayoutAlgorithm('tree-up', 'up')

export const TreeUpLayoutExtension = createExtension({
  name: 'treeUpLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return treeUp
  },
})
