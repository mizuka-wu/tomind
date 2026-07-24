/**
 * TimelineExtension — 时间线
 *
 * 支持方向: horizontal / vertical
 * 用法: TimelineExtension.configure({ direction: 'vertical' })
 */
import { createExtension } from '@tomind/core'
import { timelineHorizontalLayoutAlgorithm, timelineVerticalLayoutAlgorithm } from '@tomind/layout'

export interface TimelineOptions extends Record<string, unknown> {
  direction: 'horizontal' | 'vertical'
}

function createTimelineExt(opts: TimelineOptions) {
  return createExtension<TimelineOptions>({
    name: 'timelineLayout',
    type: 'extension',
    defaultOptions: { enabled: true, ...opts },
    addLayout() {
      return opts.direction === 'vertical' ? timelineVerticalLayoutAlgorithm : timelineHorizontalLayoutAlgorithm
    },
  })
}

export const TimelineExtension = createTimelineExt({ direction: 'horizontal' })

TimelineExtension.configure = (opts: Partial<TimelineOptions>) => {
  return createTimelineExt({ direction: 'horizontal', ...opts })
}
