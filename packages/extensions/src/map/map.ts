/**
 * MapExtension — SB `structures/map.ts`（structureClass `org.xmind.ui.map`）
 *
 * 与 map.clockwise 的差别只有两处（左侧 `slice(numRight)` 不 reverse、两侧 isUpToDown 都 true），
 * 但少了这个算法引擎会按「不支持的结构类」回退 logic-right ⇒ 12 个主分支全摆到右侧
 * （实测 noskel-map avgΔY 678.8）。
 */
import { createExtension } from '@tomind/core'
import { mapLayoutAlgorithm } from '@tomind/layout'

export const MapExtension = createExtension({
  name: 'mapLayout',
  type: 'extension',
  defaultOptions: { enabled: true },
  addLayout() {
    return mapLayoutAlgorithm
  },
})
