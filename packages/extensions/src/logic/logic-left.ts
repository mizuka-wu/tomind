/**
 * LogicLeftExtension — 逻辑图向左
 */
import { createExtension } from '@tomind/core'
import { logicLeftLayoutAlgorithm } from '@tomind/layout'

export const LogicLeftExtension = createExtension({
  name: 'logicLeftLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return logicLeftLayoutAlgorithm
  },
})
