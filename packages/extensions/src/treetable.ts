import { createExtension } from '@tomind/core'
import { treeTableLayoutAlgorithm, treeTableTopTitleLayoutAlgorithm } from '@tomind/layout'

export const TreeTableExtension = createExtension({
  name: 'treeTableLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return treeTableLayoutAlgorithm
  },
})

/** SB `structures/treetabletoptitle.ts` —— 标题在整张表最上面一行（跨所有列） */
export const TreeTableTopTitleExtension = createExtension({
  name: 'treeTableTopTitleLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return treeTableTopTitleLayoutAlgorithm
  },
})
