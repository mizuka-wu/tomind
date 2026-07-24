/**
 * LogicChartExtension — 逻辑图
 *
 * 支持方向: right / left
 * 用法: LogicChartExtension.configure({ direction: 'left' })
 */
import { createExtension } from '@tomind/core'
import { logicRightLayoutAlgorithm, logicLeftLayoutAlgorithm } from '@tomind/layout'

export interface LogicChartOptions extends Record<string, unknown> {
  direction: 'right' | 'left'
}

function createLogicChartExt(opts: LogicChartOptions) {
  return createExtension<LogicChartOptions>({
    name: 'logicChartLayout',
    type: 'extension',
    defaultOptions: { enabled: true, ...opts },
    addLayout() {
      return opts.direction === 'left' ? logicLeftLayoutAlgorithm : logicRightLayoutAlgorithm
    },
  })
}

export const LogicChartExtension = createLogicChartExt({ direction: 'right' })

LogicChartExtension.configure = (opts: Partial<LogicChartOptions>) => {
  return createLogicChartExt({ direction: 'right', ...opts })
}
