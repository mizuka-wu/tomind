/**
 * WorkbookState — 工作簿状态（不可变）
 *
 * 管理多个 SheetState 和全局数据
 *
 * 设计原则：
 * - 不可变：所有修改返回新 State
 * - 单一数据源：sheets 是唯一的数据来源
 * - 支持事务：通过 WorkbookTransaction 更新
 */

import type { SheetState } from './sheet-state'
import type { WorkbookTransaction, GlobalData } from './workbook-transaction'
import { createEmptyGlobalData } from './workbook-transaction'

// ==================== WorkbookState ====================

export class WorkbookState {
  readonly id: string
  readonly name: string
  readonly sheets: ReadonlyMap<string, SheetState>
  readonly activeSheetId: string | null
  readonly data: GlobalData
  readonly metadata: WorkbookMetadata

  constructor(
    id: string,
    name: string,
    sheets: Map<string, SheetState>,
    activeSheetId: string | null,
    data: GlobalData,
    metadata: WorkbookMetadata
  ) {
    this.id = id
    this.name = name
    this.sheets = sheets
    this.activeSheetId = activeSheetId
    this.data = data
    this.metadata = metadata
  }

  // ==================== 查询 ====================

  /**
   * 获取 Sheet
   */
  getSheet(id: string): SheetState | undefined {
    return this.sheets.get(id)
  }

  /**
   * 获取活动 Sheet
   */
  getActiveSheet(): SheetState | null {
    if (!this.activeSheetId) return null
    return this.sheets.get(this.activeSheetId) ?? null
  }

  /**
   * 获取所有 Sheet ID
   */
  getSheetIds(): string[] {
    return Array.from(this.sheets.keys())
  }

  /**
   * 获取 Sheet 数量
   */
  get sheetCount(): number {
    return this.sheets.size
  }

  // ==================== 状态更新 ====================

  /**
   * 应用 WorkbookTransaction，返回新 State
   */
  applyWorkbook(tr: WorkbookTransaction): WorkbookState {
    let newSheets = new Map(this.sheets)
    let newActiveSheetId = this.activeSheetId
    let newData = { ...this.data }
    let newMetadata = { ...this.metadata }

    // 添加 Sheet
    if (tr.addSheet) {
      newSheets.set(tr.addSheet.id, tr.addSheet.state)
      // 如果是第一个 Sheet，设为活动 Sheet
      if (newSheets.size === 1) {
        newActiveSheetId = tr.addSheet.id
      }
    }

    // 删除 Sheet
    if (tr.removeSheet) {
      newSheets.delete(tr.removeSheet.id)
      // 如果删除的是活动 Sheet，切换到其他 Sheet
      if (newActiveSheetId === tr.removeSheet.id) {
        const remaining = Array.from(newSheets.keys())
        newActiveSheetId = remaining.length > 0 ? remaining[0] : null
      }
    }

    // 重命名 Sheet（需要更新 SheetState 的属性）
    if (tr.renameSheet) {
      // SheetState 没有 name 属性，name 存在 WorkbookState 的 metadata 中
      // 这里暂时不处理，需要扩展 metadata
    }

    // 设置活动 Sheet
    if (tr.setActiveSheet) {
      if (newSheets.has(tr.setActiveSheet.id)) {
        newActiveSheetId = tr.setActiveSheet.id
      }
    }

    // 更新全局数据
    if (tr.updateData) {
      // 设置变量
      if (tr.updateData.setVariables) {
        const newVariables = new Map(newData.variables)
        for (const { key, value } of tr.updateData.setVariables) {
          newVariables.set(key, value)
        }
        newData.variables = newVariables
      }

      // 删除变量
      if (tr.updateData.deleteVariables) {
        const newVariables = new Map(newData.variables)
        for (const key of tr.updateData.deleteVariables) {
          newVariables.delete(key)
        }
        newData.variables = newVariables
      }

      // 设置标签
      if (tr.updateData.setTags) {
        const newTags = new Map(newData.tags)
        for (const { nodeId, tags } of tr.updateData.setTags) {
          newTags.set(nodeId, tags)
        }
        newData.tags = newTags
      }

      // 删除标签
      if (tr.updateData.deleteTags) {
        const newTags = new Map(newData.tags)
        for (const nodeId of tr.updateData.deleteTags) {
          newTags.delete(nodeId)
        }
        newData.tags = newTags
      }

      // 添加关系
      if (tr.updateData.addRelations) {
        newData.relations = [...newData.relations, ...tr.updateData.addRelations]
      }

      // 删除关系
      if (tr.updateData.deleteRelations) {
        const indices = new Set(tr.updateData.deleteRelations)
        newData.relations = newData.relations.filter((_, i) => !indices.has(i))
      }
    }

    // 更新修改时间
    newMetadata = {
      ...newMetadata,
      modifiedAt: Date.now(),
    }

    return new WorkbookState(
      this.id,
      this.name,
      newSheets,
      newActiveSheetId,
      newData,
      newMetadata
    )
  }

  /**
   * 更新单个 Sheet（返回新 WorkbookState）
   */
  updateSheet(sheetId: string, newSheetState: SheetState): WorkbookState {
    const newSheets = new Map(this.sheets)
    newSheets.set(sheetId, newSheetState)

    return new WorkbookState(
      this.id,
      this.name,
      newSheets,
      this.activeSheetId,
      this.data,
      {
        ...this.metadata,
        modifiedAt: Date.now(),
      }
    )
  }

  // ==================== 静态工厂方法 ====================

  /**
   * 创建初始 WorkbookState
   */
  static create(options: {
    id?: string
    name?: string
    sheets?: Map<string, SheetState>
    activeSheetId?: string
    data?: GlobalData
  }): WorkbookState {
    const sheets = options.sheets ?? new Map()
    return new WorkbookState(
      options.id ?? 'workbook-1',
      options.name ?? 'Untitled',
      sheets,
      options.activeSheetId ?? (sheets.size > 0 ? Array.from(sheets.keys())[0] : null),
      options.data ?? createEmptyGlobalData(),
      {
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      }
    )
  }
}

// ==================== 元数据 ====================

/** 工作簿元数据 */
export interface WorkbookMetadata {
  /** 创建时间 */
  readonly createdAt: number
  /** 修改时间 */
  readonly modifiedAt: number
  /** 作者 */
  readonly author?: string
  /** 描述 */
  readonly description?: string
}
