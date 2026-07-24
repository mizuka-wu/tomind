/**
 * OrgChartUpExtension — 组织架构图向上
 */
import { createExtension } from '@tomind/core'
import { orgChartUpLayoutAlgorithm } from '@tomind/layout'

export const OrgChartUpExtension = createExtension({
  name: 'orgChartUpLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return orgChartUpLayoutAlgorithm
  },
})
