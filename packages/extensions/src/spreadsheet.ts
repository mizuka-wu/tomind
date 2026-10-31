import { createExtension } from '@tomind/core'
import { matrixLayoutAlgorithm, matrixColumnLayoutAlgorithm } from '@tomind/layout'

export const SpreadsheetExtension = createExtension({
  name: 'spreadsheetLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return matrixLayoutAlgorithm
  },
})

/** SB `structures/columnspreadsheet.ts` —— 同一套表格机器，`_needTranspose: true` */
export const SpreadsheetColumnExtension = createExtension({
  name: 'spreadsheetColumnLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return matrixColumnLayoutAlgorithm
  },
})
