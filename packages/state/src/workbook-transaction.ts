/**
 * WorkbookTransaction — 工作簿事务
 *
 * 用于 Workbook 级别的操作（添加/删除 Sheet、修改全局数据等）
 * 通常由 Workbook 级别的 command 内部使用
 */

import type { SheetState } from './sheet-state'

// ==================== 全局数据 ====================

/** 全局数据 */
export interface GlobalData {
  /** 全局变量 */
  variables: Map<string, unknown>
  /** 全局标签 */
  tags: Map<string, string[]>
  /** 跨 Sheet 关系 */
  relations: Relation[]
}

/** 跨 Sheet 关系 */
export interface Relation {
  sourceSheetId: string
  sourceNodeId: string
  targetSheetId: string
  targetNodeId: string
  type: string
}

/** 创建空的全局数据 */
export function createEmptyGlobalData(): GlobalData {
  return {
    variables: new Map(),
    tags: new Map(),
    relations: [],
  }
}

// ==================== WorkbookTransaction ====================

/**
 * WorkbookTransaction — 工作簿事务
 *
 * 用于 Workbook 级别的操作
 */
export interface WorkbookTransaction {
  /** 添加 Sheet */
  addSheet?: {
    id: string
    name: string
    state: SheetState
  }
  /** 删除 Sheet */
  removeSheet?: {
    id: string
  }
  /** 重命名 Sheet */
  renameSheet?: {
    id: string
    name: string
  }
  /** 设置活动 Sheet */
  setActiveSheet?: {
    id: string
  }
  /** 更新全局数据 */
  updateData?: {
    setVariables?: Array<{ key: string; value: unknown }>
    deleteVariables?: string[]
    setTags?: Array<{ nodeId: string; tags: string[] }>
    deleteTags?: string[]
    addRelations?: Relation[]
    deleteRelations?: number[]  // 索引
  }
}

/**
 * 创建空的 WorkbookTransaction
 */
export function createWorkbookTransaction(): WorkbookTransaction {
  return {}
}

/**
 * WorkbookTransaction 构建器
 *
 * 提供链式 API 创建 WorkbookTransaction
 */
export class WorkbookTransactionBuilder {
  private _tr: WorkbookTransaction = {}

  addSheet(id: string, name: string, state: SheetState): this {
    this._tr.addSheet = { id, name, state }
    return this
  }

  removeSheet(id: string): this {
    this._tr.removeSheet = { id }
    return this
  }

  renameSheet(id: string, name: string): this {
    this._tr.renameSheet = { id, name }
    return this
  }

  setActiveSheet(id: string): this {
    this._tr.setActiveSheet = { id }
    return this
  }

  setVariable(key: string, value: unknown): this {
    if (!this._tr.updateData) {
      this._tr.updateData = {}
    }
    if (!this._tr.updateData.setVariables) {
      this._tr.updateData.setVariables = []
    }
    this._tr.updateData.setVariables.push({ key, value })
    return this
  }

  deleteVariable(key: string): this {
    if (!this._tr.updateData) {
      this._tr.updateData = {}
    }
    if (!this._tr.updateData.deleteVariables) {
      this._tr.updateData.deleteVariables = []
    }
    this._tr.updateData.deleteVariables.push(key)
    return this
  }

  addRelation(relation: Relation): this {
    if (!this._tr.updateData) {
      this._tr.updateData = {}
    }
    if (!this._tr.updateData.addRelations) {
      this._tr.updateData.addRelations = []
    }
    this._tr.updateData.addRelations.push(relation)
    return this
  }

  build(): WorkbookTransaction {
    return { ...this._tr }
  }
}
