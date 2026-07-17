import { MatrixNodeViewDesc, matrixLayoutAlgorithm } from '@tomind/core'
import type { Extension } from '@tomind/core'
/**
 * MatrixExtension — 矩阵布局扩展
 *
 * 使用 Tiptap 风格的：
 * - addNodeView 注册 MatrixNodeViewDesc
 * - addCommands 注册行列命令
 * - addLayout 注册 Matrix 布局算法
 */


export interface MatrixExtensionOptions {
  enabled?: boolean
}

export const MatrixExtension: Extension<MatrixExtensionOptions> = {
  name: 'matrix',
  type: 'node',
  defaultOptions: {
    enabled: true,
  },

  configure(options: Partial<MatrixExtensionOptions>) {
    return {
      ...this,
      defaultOptions: { ...this.defaultOptions, ...options },
    }
  },

  isEnabled() {
    return this.defaultOptions.enabled !== false
  },

  // Tiptap 风格：addNodeView 自动注册
  addNodeView() {
    return MatrixNodeViewDesc as any
  },

  // Tiptap 风格：addCommands 注册命令
  addCommands() {
    return {
      /**
       * 添加列
       */
      addColumn: (matrixId: string, label?: string) => {
        return (state: any, dispatch: any) => {
          if (!dispatch) return true

          // 获取矩阵节点
          const matrixNode = state.getNode(matrixId)
          if (!matrixNode) return false

          // 创建新列的标签
          const newLabel = label || `Column ${(matrixNode.children?.TOPIC?.length || 0) + 1}`

          // 更新节点属性
          const tr = state.tr
          tr.updateNode(matrixId, {
            ...matrixNode.attrs,
            labels: [...(matrixNode.attrs?.labels || []), newLabel],
          })
          dispatch(tr)

          return true
        }
      },

      /**
       * 添加行
       */
      addRow: (matrixId: string) => {
        return (state: any, dispatch: any) => {
          if (!dispatch) return true

          // 获取矩阵节点
          const matrixNode = state.getNode(matrixId)
          if (!matrixNode) return false

          // 创建新行节点
          const newRow = {
            type: 'topic',
            attrs: {
              title: `Row ${(matrixNode.children?.TOPIC?.length || 0) + 1}`,
            },
            children: { TOPIC: [] },
          }

          // 添加到子节点
          const tr = state.tr
          tr.addNode(matrixId, 'TOPIC', newRow)
          dispatch(tr)

          return true
        }
      },

      /**
       * 删除列
       */
      removeColumn: (matrixId: string, columnIndex: number) => {
        return (state: any, dispatch: any) => {
          if (!dispatch) return true

          // 获取矩阵节点
          const matrixNode = state.getNode(matrixId)
          if (!matrixNode) return false

          // 删除列标签
          const labels = [...(matrixNode.attrs?.labels || [])]
          if (columnIndex < 0 || columnIndex >= labels.length) return false
          labels.splice(columnIndex, 1)

          // 更新节点属性
          const tr = state.tr
          tr.updateNode(matrixId, {
            ...matrixNode.attrs,
            labels,
          })
          dispatch(tr)

          return true
        }
      },

      /**
       * 删除行
       */
      removeRow: (matrixId: string, rowIndex: number) => {
        return (state: any, dispatch: any) => {
          if (!dispatch) return true

          // 获取矩阵节点
          const matrixNode = state.getNode(matrixId)
          if (!matrixNode) return false

          // 删除行
          const children = matrixNode.children?.TOPIC || []
          if (rowIndex < 0 || rowIndex >= children.length) return false

          const tr = state.tr
          tr.removeNode(children[rowIndex].id)
          dispatch(tr)

          return true
        }
      },
    }
  },

  // Tiptap 风格：addLayout 注册布局算法
  addLayout() {
    return matrixLayoutAlgorithm
  },
}

export default MatrixExtension
