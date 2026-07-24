/**
 * FishboneExtension — 鱼骨图
 *
 * 支持方向: leftHeaded / rightHeaded
 * 用法: FishboneExtension.configure({ direction: 'rightHeaded' })
 */
import { createExtension } from '@tomind/core'
import { fishboneLeftHeadedLayoutAlgorithm, fishboneRightHeadedLayoutAlgorithm } from '@tomind/layout'

export interface FishboneOptions extends Record<string, unknown> {
  direction: 'leftHeaded' | 'rightHeaded'
}

function createFishboneExt(opts: FishboneOptions) {
  return createExtension<FishboneOptions>({
    name: 'fishboneLayout',
    type: 'extension',
    defaultOptions: { enabled: true, ...opts },
    addLayout() {
      return opts.direction === 'rightHeaded' ? fishboneRightHeadedLayoutAlgorithm : fishboneLeftHeadedLayoutAlgorithm
    },
  })
}

export const FishboneExtension = createFishboneExt({ direction: 'leftHeaded' })

FishboneExtension.configure = (opts: Partial<FishboneOptions>) => {
  return createFishboneExt({ direction: 'leftHeaded', ...opts })
}
