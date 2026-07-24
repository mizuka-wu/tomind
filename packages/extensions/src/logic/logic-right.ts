/**
 * LogicRightExtension — 逻辑图向右
 */
import { createExtension } from '@tomind/core'
import { logicRightLayoutAlgorithm } from '@tomind/layout'

export const LogicRightExtension = createExtension({
  name: 'logicRightLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return logicRightLayoutAlgorithm
  },
})
