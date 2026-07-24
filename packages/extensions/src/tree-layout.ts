/**
 * TreeLayoutExtension — 树形图
 *
 * 支持方向: right / left / down / up
 * 用法: TreeLayoutExtension.configure({ direction: 'left' })
 */
import { createExtension } from '@tomind/core'
import { createTreeLayoutAlgorithm } from '@tomind/layout'

export interface TreeLayoutOptions extends Record<string, unknown> {
  direction: 'right' | 'left' | 'down' | 'up'
}

function createTreeLayoutExt(opts: TreeLayoutOptions) {
  return createExtension<TreeLayoutOptions>({
    name: 'treeLayout',
    type: 'extension',
    defaultOptions: { enabled: true, ...opts },
    addLayout() {
      return createTreeLayoutAlgorithm('tree', opts.direction)
    },
  })
}

export const TreeLayoutExtension = createTreeLayoutExt({ direction: 'right' })

// 覆盖 configure 以传递方向
TreeLayoutExtension.configure = (opts: Partial<TreeLayoutOptions>) => {
  return createTreeLayoutExt({ direction: 'right', ...opts })
}
