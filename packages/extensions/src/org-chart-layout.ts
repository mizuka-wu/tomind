/**
 * OrgChartExtension — 组织架构图
 *
 * 支持方向: down / up
 * 用法: OrgChartExtension.configure({ direction: 'up' })
 */
import { createExtension } from '@tomind/core'
import { orgChartDownLayoutAlgorithm, orgChartUpLayoutAlgorithm } from '@tomind/layout'

export interface OrgChartOptions extends Record<string, unknown> {
  direction: 'down' | 'up'
}

function createOrgChartExt(opts: OrgChartOptions) {
  return createExtension<OrgChartOptions>({
    name: 'orgChartLayout',
    type: 'extension',
    defaultOptions: { enabled: true, ...opts },
    addLayout() {
      return opts.direction === 'up' ? orgChartUpLayoutAlgorithm : orgChartDownLayoutAlgorithm
    },
  })
}

export const OrgChartExtension = createOrgChartExt({ direction: 'down' })

OrgChartExtension.configure = (opts: Partial<OrgChartOptions>) => {
  return createOrgChartExt({ direction: 'down', ...opts })
}
