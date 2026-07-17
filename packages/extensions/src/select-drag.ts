import { createPartExtension, NodeViewDesc } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'

interface SelectBox extends NodeViewDesc {
  relationBranch: NodeViewDesc[]
  selectBoxOneG: { move: (x: number, y: number) => void }
  selectBoxTwoG: { move: (x: number, y: number) => void }
  render: (direction: string) => void
}

/**
 * SelectDragExtension - 处理 boundary/summary 的 selectBox 拖拽
 * 
 * 职责：
 * - 跟踪 selectBox 拖拽状态
 * - 计算新的 range（最小/最大索引）
 * - 更新 boundary/summary 的 rangeStart/rangeEnd
 */
export const SelectDragExtension = createPartExtension({
  name: 'selectDrag',

  onCreate(ctx: ExtensionContext) {
    // 使用闭包管理状态
    let selectBox: SelectBox | null = null
    let context: NodeViewDesc | null = null
    let direction: string | null = null
    let startContains: NodeViewDesc[] | null = null
    let selectedBranches: NodeViewDesc[] = []

    // 开始拖拽
    const onSelectDragStart = (...args: unknown[]) => {
      const [newSelectBox, newContext, newDirection] = args as [SelectBox, NodeViewDesc, string]
      selectBox = newSelectBox
      context = newContext
      direction = newDirection
      startContains = structuredClone(newSelectBox.relationBranch)
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

      const parent = (context as any).parent?.()
      if (!parent) return [0, 0]

      const children = parent.getChildrenBranchesByType?.() || []
      if (children.length === 0) return [0, 0]

      let maxIndex = children.indexOf(selectedBranches[0])
      let minIndex = maxIndex

      for (let i = 1; i < selectedBranches.length; i++) {
        const tempIndex = children.indexOf(selectedBranches[i])
        if (tempIndex > maxIndex) maxIndex = tempIndex
        if (tempIndex < minIndex) minIndex = tempIndex
      }

      return [minIndex, maxIndex]
    }

    // 检查 range 是否变化
    const selectedHasChanged = (): boolean => {
      if (!selectBox || !startContains) return false
      return JSON.stringify(startContains) !== JSON.stringify(selectBox.relationBranch)
    }

    // 检查是否有相同的 range
    const hasSameRange = (contexts: any, newIndex: [number, number]): boolean => {
      return Object.values(contexts).some(
        (ctx: any) => ctx.rangeStart === newIndex[0] && ctx.rangeEnd === newIndex[1]
      )
    }

    // 重置状态
    const resetManager = () => {
      selectedBranches.forEach(branch => {
        ;(branch as any).onMouseout?.()
      })
      selectedBranches = []

      if (selectBox) {
        selectBox.selectBoxOneG.move(0, 0)
        selectBox.selectBoxTwoG.move(0, 0)
        selectBox.render(direction || '')
        selectBox.relationBranch = []
        selectBox = null
      }

      context = null
      direction = null
      startContains = null
    }

    // 结束拖拽
    const onSelectDragEnd = () => {
      if (!selectedHasChanged()) {
        resetManager()
        return
      }

      if (!context) return

      const isBoundary = (context as any).type === 'boundary'
      const typeParam = isBoundary ? ['model', 'boundaries'] : ['summaryModel', 'summaries']
      const contextModel = (context as any)[typeParam[0]]
      const parent = (context as any).parent?.()

      if (!contextModel || !parent) {
        resetManager()
        return
      }

      const newIndex = calcRangeIndex()
      const [minIndex, maxIndex] = newIndex
      const refViewModels = Object.assign({}, parent.model?.[typeParam[1]]?.())

      if (!hasSameRange(refViewModels, newIndex)) {
        const newRange = `(${minIndex},${maxIndex})`
        contextModel.setRange(newRange)
      }

      resetManager()
    }

    // 监听事件
    ctx.on('selectDrag:start', onSelectDragStart)
    ctx.on('selectDrag:addBranch', addSelectBranch)
    ctx.on('selectDrag:removeBranch', removeSelectBranch)
    ctx.on('selectDrag:end', onSelectDragEnd)

    return () => {
      ctx.off('selectDrag:start', onSelectDragStart)
      ctx.off('selectDrag:addBranch', addSelectBranch)
      ctx.off('selectDrag:removeBranch', removeSelectBranch)
      ctx.off('selectDrag:end', onSelectDragEnd)
    }
  },
})

export default SelectDragExtension
