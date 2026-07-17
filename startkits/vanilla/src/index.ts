/**
 * @tomind/starter-vanilla — 默认扩展预装包
 *
 * 参考 Tiptap StarterKit 设计：
 * - 打包常用扩展
 * - 支持配置内部扩展
 * - 支持禁用扩展
 *
 * 依赖：
 * - @tomind/core — 引擎核心（Extension 类型、createExtension）
 * - @tomind/extensions — 具体扩展实现（Keymap、Viewport）
 *
 * 用法：
 * ```typescript
 * import { StarterKit } from '@tomind/starter-vanilla'
 * workbook.installExtension(StarterKit)
 *
 * // 配置内部扩展
 * workbook.installExtension(StarterKit.configure({
 *   viewport: { defaultZoom: 1.5 },
 *   keymap: false,  // 禁用
 * }))
 *
 * // 添加额外扩展
 * workbook.installExtension(StarterKit.configure({
 *   extensions: [MyCustomExtension],
 * }))
 * ```
 */

// 引擎核心
import type { Extension, StarterKitOptions } from '@tomind/core'
import { createExtension } from '@tomind/core'

// 具体扩展
import { KeymapExtension, ViewportExtension } from '@tomind/extensions'

// ==================== 内置扩展列表 ====================

const builtInExtensions: Extension<any>[] = [
  KeymapExtension,
  ViewportExtension,
]

// ==================== StarterKit ====================

/**
 * 创建 StarterKit
 */
function createStarterKit(options: StarterKitOptions = {}) {
  const { extensions: extraExtensions = [], ...extensionConfigs } = options

  // 收集所有扩展
  const allExtensions: Extension<any>[] = []

  // 处理内置扩展
  for (const ext of builtInExtensions) {
    const config = extensionConfigs[ext.name]

    // 如果明确禁用，跳过
    if (config === false) {
      continue
    }

    // 如果有配置，应用配置
    if (config && typeof config === 'object') {
      allExtensions.push(ext.configure(config as Record<string, unknown>))
    } else {
      allExtensions.push(ext)
    }
  }

  // 添加额外扩展（过滤掉 false）
  for (const ext of extraExtensions) {
    if (ext !== false) {
      allExtensions.push(ext)
    }
  }

  // 创建 StarterKit 扩展
  return createExtension({
    name: 'starterKit',
    type: 'extension',
    defaultOptions: { enabled: true },

    onCreate(ctx) {
      // 注册所有子扩展
      const cleanupFns: (() => void)[] = []

      for (const ext of allExtensions) {
        if (!ext.isEnabled()) continue

        // 注册扩展的命令
        if (ext.commands) {
          for (const [cmdName, cmdFactory] of Object.entries(ext.commands)) {
            const fullName = `${ext.name}.${cmdName}`
            ctx.registerCommand(fullName, cmdFactory as unknown as import('@tomind/core').CommandFn)
          }
        }

        // 调用扩展的 onCreate
        if (ext.onCreate) {
          const cleanup = ext.onCreate(ctx)
          if (cleanup) {
            cleanupFns.push(cleanup)
          }
        }
      }

      // 返回清理函数
      return () => {
        for (const cleanup of cleanupFns) {
          cleanup()
        }
      }
    },
  })
}

/**
 * StarterKit 实例（使用默认配置）
 */
export const StarterKit = createStarterKit()

/**
 * StarterKit 工厂（支持配置）
 */
export const StarterKitFactory = {
  create: createStarterKit,
  configure: (options: StarterKitOptions) => createStarterKit(options),
}

// Re-export 类型
export type { StarterKitOptions } from '@tomind/core'
