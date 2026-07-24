/**
 * @tomind/starter-vanilla — 默认扩展预装包
 */

// 引擎核心
import type { Extension, StarterKitOptions } from '@tomind/core'
import { createExtension } from '@tomind/core'

// 具体扩展
import {
  KeymapExtension,
  ViewportExtension,
  HistoryExtension,
  BoundaryExtension,
  SummaryExtension,
  CollapseExtension,
  TopicExtension,
  SelectionExtension,
  CopyPasteExtension,
  EditBridgeExtension,
  ContextMenuExtension,
  // 布局（一个大类一个文件夹，文件夹导出多个方向插件）
  TreeRightExtension,
  TreeLeftExtension,
  TreeDownExtension,
  TreeUpExtension,
  MapClockwiseExtension,
  MapUnbalancedExtension,
  LogicRightExtension,
  LogicLeftExtension,
  OrgChartDownExtension,
  OrgChartUpExtension,
  TimelineHorizontalExtension,
  TimelineVerticalExtension,
  FishboneLeftHeadedExtension,
  FishboneRightHeadedExtension,
} from '@tomind/extensions'

// ==================== 内置扩展列表 ====================

const builtInExtensions: Extension<any>[] = [
  // 结构元素（节点类型）
  TopicExtension,

  // 布局（每个方向独立插件，按需选用）
  TreeRightExtension,
  TreeLeftExtension,
  TreeDownExtension,
  TreeUpExtension,
  MapClockwiseExtension,
  MapUnbalancedExtension,
  LogicRightExtension,
  LogicLeftExtension,
  OrgChartDownExtension,
  OrgChartUpExtension,
  TimelineHorizontalExtension,
  TimelineVerticalExtension,
  FishboneLeftHeadedExtension,
  FishboneRightHeadedExtension,

  // 核心编辑
  KeymapExtension,
  ViewportExtension,
  SelectionExtension,
  HistoryExtension,
  EditBridgeExtension,

  // 结构装饰
  BoundaryExtension,
  SummaryExtension,
  CollapseExtension,

  // 交互
  CopyPasteExtension,
  ContextMenuExtension,
]

// ==================== StarterKit ====================

function createStarterKit(options: StarterKitOptions = {}) {
  const { extensions: extraExtensions = [], ...extensionConfigs } = options

  const allExtensions: Extension<any>[] = []

  for (const ext of builtInExtensions) {
    const config = extensionConfigs[ext.name]
    if (config === false) continue
    if (config && typeof config === 'object') {
      allExtensions.push(ext.configure(config as Record<string, unknown>))
    } else {
      allExtensions.push(ext)
    }
  }

  for (const ext of extraExtensions) {
    if (ext !== false) {
      allExtensions.push(ext)
    }
  }

  return createExtension({
    name: 'starterKit',
    type: 'extension',
    defaultOptions: { enabled: true },

    onCreate(ctx) {
      const cleanupFns: (() => void)[] = []

      for (const ext of allExtensions) {
        if (!ext.isEnabled()) continue

        if (ext.commands) {
          for (const [cmdName, cmdFactory] of Object.entries(ext.commands)) {
            const fullName = `${ext.name}.${cmdName}`
            ctx.registerCommand(fullName, cmdFactory as unknown as import('@tomind/core').CommandFn)
          }
        }

        if (ext.addLayout) {
          const algorithm = ext.addLayout()
          ctx.registerLayout(algorithm)
        }

        if (ext.onCreate) {
          const cleanup = ext.onCreate(ctx)
          if (cleanup) {
            cleanupFns.push(cleanup)
          }
        }
      }

      return () => {
        for (const cleanup of cleanupFns) {
          cleanup()
        }
      }
    },
  })
}

export const StarterKit = createStarterKit()

export const StarterKitFactory = {
  create: createStarterKit,
  configure: (options: StarterKitOptions) => createStarterKit(options),
}

export type { StarterKitOptions } from '@tomind/core'
