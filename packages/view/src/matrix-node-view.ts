/**
 * MatrixNodeViewDesc — 矩阵布局节点视图描述
 *
 * 管理 matrix 布局中的所有子视图：
 * - MatrixCellView（单元格）
 * - MatrixPlusView（添加按钮）
 * - MatrixLabelView（列标签）
 *
 * 集成 MatrixLayout 算法
 * 支持单元格选择编辑
 */

import { Group } from 'leafer-ui'
import { NodeViewDesc } from './node-view-desc'
import { MatrixRenderer } from './renderers/matrix-renderer'
import { layout } from '@tomind/layout'
import type { MatrixCell } from '@tomind/layout'

export class MatrixNodeViewDesc extends NodeViewDesc {
  private _renderer: MatrixRenderer | null = null
  private _selectedCell: MatrixCell | null = null

  protected createElement(): Group {
    const group = new Group()
    this._renderer = new MatrixRenderer(this.node.id)
    this._renderer.create(group)

    // 设置单元格点击回调
    this._renderer.setOnCellClick((cell: MatrixCell) => {
      this._onCellClick(cell)
    })

    // 设置单元格双击回调
    this._renderer.setOnCellDblClick((cell: MatrixCell) => {
      this._onCellDblClick(cell)
    })

    return group
  }

  protected createContentGroup(): Group | null {
    return null
  }

  protected updateStyle(): void {
    if (!this._renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return

    // 获取 LeaferJS 格式样式
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)

    // 使用 Matrix 布局算法计算布局
    const layoutResult = layout(
      this.node,
      undefined,  // 使用默认配置
      NodeViewDesc.styleEngine,
      NodeViewDesc.state,
      'matrix',  // 使用 Matrix 布局算法
    )

    // 渲染
    this._renderer.render(layoutResult, style)
  }

  protected updateContent(): void {
    if (!this._renderer || !NodeViewDesc.state) return

    // 获取子节点
    const children = (this.node.children as Record<string, unknown[]>)?.TOPIC || []

    // 更新矩阵
    this._renderer.updateMatrix(
      children as any[],
      (id: string) => NodeViewDesc.state?.getNode(id),
    )
  }

  /**
   * 更新矩阵布局
   */
  updateMatrix(): void {
    this.updateContent()
  }

  /**
   * 单元格点击事件处理
   */
  private _onCellClick(cell: MatrixCell): void {
    // 取消选中之前的单元格
    if (this._selectedCell && this._selectedCell !== cell) {
      this._selectedCell._view?.displayDeselect?.()
    }

    // 选中当前单元格
    this._selectedCell = cell
    cell._view?.displaySelect?.()

    // 触发选择事件
    this._emitSelectionEvent(cell)
  }

  /**
   * 单元格双击事件处理
   */
  private _onCellDblClick(cell: MatrixCell): void {
    // 触发编辑事件
    this._emitEditEvent(cell)
  }

  /**
   * 触发选择事件
   */
  private _emitSelectionEvent(cell: MatrixCell): void {
    // 获取节点 ID
    const nodeId = cell.item?.id || cell._view?.id
    if (!nodeId) return

    // 触发事件 — 通过事件系统通知编辑器更新选择状态
    // TODO: 接入事件系统 dispatch selection update
  }

  /**
   * 触发编辑事件
   */
  private _emitEditEvent(cell: MatrixCell): void {
    // 获取节点 ID
    const nodeId = cell.item?.id || cell._view?.id
    if (!nodeId) return

    // 触发编辑事件 — 通过事件系统通知编辑器
    console.log('Edit cell:', nodeId)
  }

  /**
   * 获取选中的单元格
   */
  getSelectedCell(): MatrixCell | null {
    return this._selectedCell
  }

  /**
   * 清除选择
   */
  clearSelection(): void {
    if (this._selectedCell) {
      this._selectedCell._view?.displayDeselect?.()
      this._selectedCell = null
    }
  }
}
