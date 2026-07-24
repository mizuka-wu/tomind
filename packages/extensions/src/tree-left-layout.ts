/**
 * TreeLeftLayoutExtension — 向左展开
 */
import { createExtension, createTreeLayoutAlgorithm } from '@tomind/core'

const treeLeft = createTreeLayoutAlgorithm('tree-left', 'left')

export const TreeLeftLayoutExtension = createExtension({
  name: 'treeLeftLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return treeLeft
  },
})
