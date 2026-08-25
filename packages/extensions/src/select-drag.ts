/**
 * SelectDragExtension — 拖拽选中节点重排扩展
 *
 * 从旧 editreceiver.ts → editbridge.ts 中的拖拽选中逻辑迁移
 * 实现：
 * 1. 选中多个节点（selection 事件）
 * 2. 拖拽选中节点到目标节点
 * 3. 移动选中节点到目标节点前后
 * 4. 支持 Shift 键切换前后位置
 * 5. 实时预览移动效果
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'
import type { NodeViewDesc } from '@tomind/view'

/** LeaferJS 拖拽上下文 — 扩展 NodeViewDesc 的运行时属性 */
interface LeaferDragContext {
  type?: string
  model?: unknown
  summaryModel?: unknown
  parent?: () => LeaferDragContext | null
  [key: string]: unknown
}

export interface SelectDragEvents {
  'selectDrag:start': unknown
  'selectDrag:addBranch': unknown
  'selectDrag:removeBranch': unknown
  'selectDrag:move': unknown
  'selectDrag:end': void
  'selectDrag:branchMouseout': unknown
}

// ==================== Extension ====================

export const SelectDragExtension = createExtension<Record<string, unknown>, Record<string, unknown>, SelectDragEvents>({
  name: 'selectDrag',
  type: 'extension',
  defaultOptions: { enabled: true },

  onCreate(ctx: ExtensionContext<any, any>) {
    let context: NodeViewDesc | null = null
    let selectedBranches: NodeViewDesc[] = []
    let direction = 'after'

    // 开始拖拽
    const onSelectDragStart = (...args: unknown[]) => {
      const [newSelectBox, newContext, newDirection] = args as [unknown, NodeViewDesc, string]
      context = newContext
      direction = newDirection
      selectedBranches = []
    }

    // 添加选中的分支
    const addSelectBranch = (...args: unknown[]) => {
      const [branchView] = args as [NodeViewDesc]
      if (!selectedBranches.includes(branchView)) {
        selectedBranches.push(branchView)
      }
    }

    // 移除选中的分支
    const removeSelectBranch = (...args: unknown[]) => {
      const [branchView] = args as [NodeViewDesc]
      selectedBranches = selectedBranches.filter(b => b !== branchView)
    }

    // 计算新的 range
    const calcRangeIndex = (): [number, number] => {
      if (!context || selectedBranches.length === 0) return [0, 0]

      const leaferCtx = context as unknown as LeaferDragContext
      const parent = leaferCtx.parent?.()
      if (!parent) return [0, 0]

      const children = (parent as { getChildrenBranchesByType?: () => NodeViewDesc[] }).getChildrenBranchesByType?.() || []
      if (children.length === 0) return [0, 0]

      let maxIndex = children.indexOf(selectedBranches[0])
      let minIndex = maxIndex

      for (const branch of selectedBranches) {
        const index = children.indexOf(branch)
        if (index > maxIndex) maxIndex = index
        if (index < minIndex) minIndex = index
      }

      if (direction === 'before') {
        return [minIndex, selectedBranches.length]
      } else {
        return [maxIndex + 1, selectedBranches.length]
      }
    }

    // 移动选中的节点
    const onSelectDragMove = (...args: unknown[]) => {
      const [manager] = args as [{ setRelationBranch: (id: string, range: [number, number]) => void }]
      if (!context || selectedBranches.length === 0) return

      const range = calcRangeIndex()
      for (const branch of selectedBranches) {
        manager.setRelationBranch(branch.node.id, range)
      }
    }

    // 结束拖拽
    const onSelectDragEnd = () => {
      if (!context) return

      const leaferCtx = context as unknown as LeaferDragContext
      const isBoundary = leaferCtx.type === 'boundary'
      const typeParam = isBoundary ? ['model', 'boundaries'] : ['summaryModel', 'summaries']
      const contextModel = leaferCtx[typeParam[0]]
      const parent = leaferCtx.parent?.()

      if (!contextModel || !parent) {
        return
      }

      // 执行移动
      const range = calcRangeIndex()
      ctx.executeCommand('node.move', {
        sourceIds: selectedBranches.map(b => b.node.id),
        targetId: (parent as { node?: { id?: string } }).node?.id,
        position: direction === 'before' ? range[0] : range[0],
      })
    }

    // 鼠标移出分支
    const onBranchMouseout = (...args: unknown[]) => {
      const [branch] = args as [NodeViewDesc]
      const leaferBranch = branch as unknown as { onMouseout?: () => void }
      leaferBranch.onMouseout?.()
    }

    // 注册事件
    ctx.on('selectDrag:start', onSelectDragStart)
    ctx.on('selectDrag:addBranch', addSelectBranch)
    ctx.on('selectDrag:removeBranch', removeSelectBranch)
    ctx.on('selectDrag:move', onSelectDragMove)
    ctx.on('selectDrag:end', onSelectDragEnd)
    ctx.on('selectDrag:branchMouseout', onBranchMouseout)

    return () => {
      ctx.off('selectDrag:start', onSelectDragStart)
      ctx.off('selectDrag:addBranch', addSelectBranch)
      ctx.off('selectDrag:removeBranch', removeSelectBranch)
      ctx.off('selectDrag:move', onSelectDragMove)
      ctx.off('selectDrag:end', onSelectDragEnd)
      ctx.off('selectDrag:branchMouseout', onBranchMouseout)
    }
  },
})
