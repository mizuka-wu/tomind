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

import { createExtension, parseArgs } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'
import type { NodeViewDesc } from '@tomind/view'

/** LeaferJS 拖拽上下文内部属性（NodeViewDesc 的运行时扩展） */
interface LeaferDragLike {
  type?: string
  model?: unknown
  summaryModel?: unknown
  parent?: () => LeaferDragLike | null
  getChildrenBranchesByType?: () => NodeViewDesc[]
  node?: { id?: string }
  onMouseout?: () => void
  [key: string]: unknown
}

/** 将 NodeViewDesc 安全转为 LeaferDragLike（boundary cast） */
function asLeaferDrag(node: NodeViewDesc): LeaferDragLike {
  return node as unknown as LeaferDragLike
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
      const [newSelectBox, newContext, newDirection] = parseArgs<[unknown, NodeViewDesc, string]>(args)
      context = newContext
      direction = newDirection
      selectedBranches = []
    }

    // 添加选中的分支
    const addSelectBranch = (...args: unknown[]) => {
      const [branchView] = parseArgs<[NodeViewDesc]>(args)
      if (!selectedBranches.includes(branchView)) {
        selectedBranches.push(branchView)
      }
    }

    // 移除选中的分支
    const removeSelectBranch = (...args: unknown[]) => {
      const [branchView] = parseArgs<[NodeViewDesc]>(args)
      selectedBranches = selectedBranches.filter(b => b !== branchView)
    }

    // 计算新的 range
    const calcRangeIndex = (): [number, number] => {
      if (!context || selectedBranches.length === 0) return [0, 0]

      const leaferCtx = asLeaferDrag(context)
      const parent = leaferCtx.parent?.()
      if (!parent) return [0, 0]

      const children = (parent as LeaferDragLike).getChildrenBranchesByType?.() || []
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
      const [manager] = parseArgs<[{ setRelationBranch: (id: string, range: [number, number]) => void }]>(args)
      if (!context || selectedBranches.length === 0) return

      const range = calcRangeIndex()
      for (const branch of selectedBranches) {
        manager.setRelationBranch(branch.node.id, range)
      }
    }

    // 结束拖拽
    const onSelectDragEnd = () => {
      if (!context) return

      const leaferCtx = asLeaferDrag(context)
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
        targetId: (parent as LeaferDragLike).node?.id,
        position: direction === 'before' ? range[0] : range[0],
      })
    }

    // 鼠标移出分支
    const onBranchMouseout = (...args: unknown[]) => {
      const [branch] = parseArgs<[NodeViewDesc]>(args)
      asLeaferDrag(branch).onMouseout?.()
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
