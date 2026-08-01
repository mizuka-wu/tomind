import { createExtension } from '@tomind/core'
import { matrixLayoutAlgorithm } from '@tomind/layout'

export const SpreadsheetExtension = createExtension({
  name: 'spreadsheetLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return matrixLayoutAlgorithm
  },
})
