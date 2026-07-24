/**
 * TreeDownExtension — 向下展开（类 Org）
 */
import { createExtension } from '@tomind/core'
import { createTreeLayoutAlgorithm } from '@tomind/layout'

const treeDown = createTreeLayoutAlgorithm('tree-down', 'down')

export const TreeDownExtension = createExtension({
  name: 'treeDownLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return treeDown
  },
})
