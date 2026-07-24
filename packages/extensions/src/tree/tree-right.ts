/**
 * TreeLayoutExtension — 向右展开（默认）
 */
import { createExtension } from '@tomind/core'
import { createTreeLayoutAlgorithm } from '@tomind/layout'

const treeRight = createTreeLayoutAlgorithm('tree', 'right')

export const TreeRightExtension = createExtension({
  name: 'treeRightLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return treeRight
  },
})
