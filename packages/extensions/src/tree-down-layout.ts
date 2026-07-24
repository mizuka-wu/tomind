/**
 * TreeDownLayoutExtension — 向下展开（类 Org）
 */
import { createExtension, createTreeLayoutAlgorithm } from '@tomind/core'

const treeDown = createTreeLayoutAlgorithm('tree-down', 'down')

export const TreeDownLayoutExtension = createExtension({
  name: 'treeDownLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return treeDown
  },
})
