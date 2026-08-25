/**
 * IndicatorExtension — 拖拽指示器扩展
 *
 * 通过 Widget Decoration 系统实现：
 * - ViewPlugin 生成 indicator WidgetDecoration
 * - widgetViewFactory 创建 IndicatorNodeViewDesc
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'
import { widgetDecoration } from '@tomind/state'
import type { Decoration } from '@tomind/state'
import type { WidgetPluginLike } from '@tomind/core'

// ==================== 状态管理 ====================

interface IndicatorState {
  nodeId: string | null
  visible: boolean
}

let indicatorState: IndicatorState = { nodeId: null, visible: false }

function updateIndicatorState(nodeId: string | null, visible: boolean): void {
  indicatorState = { nodeId, visible }
}

// ==================== ViewPlugin ====================

function createIndicatorViewPlugin(): WidgetPluginLike {
  return {
    name: 'indicator',
    decorations: (state: unknown) => {
      const decorations: Decoration[] = []
      const s = state as { getNode: (id: string) => unknown }

      if (indicatorState.visible && indicatorState.nodeId) {
        const node = s.getNode(indicatorState.nodeId)
        if (node) {
          decorations.push(
            widgetDecoration(
              indicatorState.nodeId,
              `indicator-${indicatorState.nodeId}`,
              'indicator',
              'after'
            )
          )
        }
      }

      return decorations
    },
    widgetViewFactory: (widgetType: string, widgetId: string, node: unknown) => {
      if (widgetType === 'indicator') {
        // 返回标记对象，由 SheetEditor 创建实际的 ViewDesc
        return { widgetType: 'indicator', node } as any
      }
      return null
    }
  }
}

// ==================== Extension ====================

export const IndicatorExtension = createExtension({
  name: 'indicator',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext) {
    const viewPlugin = createIndicatorViewPlugin()
    ctx.registerWidgetPlugin(viewPlugin)

    const handleUpdate = (data: unknown) => {
      const { nodeId, visible } = data as { nodeId: string | null; visible: boolean }
      updateIndicatorState(nodeId, visible)
    }

    const handleClear = () => {
      updateIndicatorState(null, false)
    }

    ctx.on('indicator:update' as any, handleUpdate as any)
    ctx.on('indicator:clear' as any, handleClear as any)

    return () => {
      ctx.off('indicator:update' as any, handleUpdate as any)
      ctx.off('indicator:clear' as any, handleClear as any)
      ctx.unregisterWidgetPlugin('indicator')
      updateIndicatorState(null, false)
    }
  },
})
