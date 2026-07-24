/**
 * OrgChartDownExtension — 组织架构图向下
 */
import { createExtension } from '@tomind/core'
import { orgChartDownLayoutAlgorithm } from '@tomind/layout'

export const OrgChartDownExtension = createExtension({
  name: 'orgChartDownLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return orgChartDownLayoutAlgorithm
  },
})
