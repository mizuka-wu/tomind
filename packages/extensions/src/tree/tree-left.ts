/**
 * TreeLeftExtension — 向左展开
 */
import { createExtension } from '@tomind/core'
import { createTreeLayoutAlgorithm } from '@tomind/layout'

const treeLeft = createTreeLayoutAlgorithm('tree-left', 'left')

export const TreeLeftExtension = createExtension({
  name: 'treeLeftLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return treeLeft
  },
})
