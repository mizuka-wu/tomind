/**
 * MapExtension — 导图布局
 *
 * 支持类型: clockwise / unbalanced
 * 用法: MapExtension.configure({ variant: 'unbalanced' })
 */
import { createExtension } from '@tomind/core'
import { mapClockwiseLayoutAlgorithm, createTreeLayoutAlgorithm } from '@tomind/layout'

export interface MapLayoutOptions extends Record<string, unknown> {
  variant: 'clockwise' | 'unbalanced'
}

function createMapExt(opts: MapLayoutOptions) {
  return createExtension<MapLayoutOptions>({
    name: 'mapLayout',
    type: 'extension',
    defaultOptions: { enabled: true, ...opts },
    addLayout() {
      return opts.variant === 'unbalanced'
        ? createTreeLayoutAlgorithm('map-unbalanced', 'right')
        : mapClockwiseLayoutAlgorithm
    },
  })
}

export const MapExtension = createMapExt({ variant: 'clockwise' })

MapExtension.configure = (opts: Partial<MapLayoutOptions>) => {
  return createMapExt({ variant: 'clockwise', ...opts })
}
