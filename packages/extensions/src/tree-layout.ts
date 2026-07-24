/**
 * TreeLayoutExtension — 向右展开（默认）
 */
import { createExtension, createTreeLayoutAlgorithm } from '@tomind/core'

const treeRight = createTreeLayoutAlgorithm('tree', 'right')

export const TreeLayoutExtension = createExtension({
  name: 'treeLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return treeRight
  },
})
