/**
 * CommandDef — 命令定义接口
 *
 * 对标 Tiptap 的 Command 概念，兼容 MCP Tool 规范
 */

import type { SheetState } from '@tomind/state'
import type { Transaction } from '@tomind/state'

// ==================== 类型定义 ====================

/** JSON Schema（兼容 MCP 规范） */
export interface JSONSchema {
  readonly type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null'
  readonly description?: string
  readonly properties?: Record<string, JSONSchema>
  readonly required?: readonly string[]
  readonly items?: JSONSchema
  readonly enum?: readonly unknown[]
  readonly default?: unknown
  readonly examples?: readonly unknown[]
}

/** 命令执行结果 */
export interface CommandResult<T = unknown> {
  readonly success: boolean
  readonly data?: T
  readonly error?: string
  readonly meta?: Record<string, unknown>
}

/** 命令分类 */
export type CommandCategory =
  | 'node'        // 节点操作（增删改）
  | 'structure'   // 结构操作（移动、排序）
  | 'style'       // 样式操作
  | 'selection'   // 选区操作
  | 'view'        // 视图操作（缩放、滚动）
  | 'relationship' // 关系操作
  | 'boundary'    // 边界操作
  | 'summary'     // 摘要操作
  | 'sheet'       // Sheet 操作
  | 'workbook'    // Workbook 操作

// ==================== CommandDef ====================

/**
 * CommandDef — 命令定义
 *
 * 每个命令是一个独立的、可序列化的操作单元
 */
export interface CommandDef<TInput = unknown, TOutput = unknown> {
  /** 命令名称（唯一标识） */
  readonly name: string
  /** 命令描述 */
  readonly description: string
  /** 输入参数的 JSON Schema */
  readonly inputSchema: JSONSchema
  /** 输出结果的 JSON Schema（可选） */
  readonly outputSchema?: JSONSchema
  /** 命令分类 */
  readonly category?: CommandCategory
  /** 命令标签 */
  readonly tags?: readonly string[]
  /** 是否需要选区 */
  readonly requiresSelection?: boolean
  /** 是否幂等（相同输入多次执行结果相同） */
  readonly idempotent?: boolean

  /**
   * 执行命令
   *
   * @param params - 输入参数
   * @param state - 当前状态
   * @param dispatch - 分发事务的函数（如果为 undefined，则只检查是否可执行）
   * @returns 命令执行结果
   */
  readonly execute: (
    params: TInput,
    state: SheetState,
    dispatch?: (tr: Transaction) => void
  ) => CommandResult<TOutput>

  /**
   * 检查命令是否可执行（可选）
   */
  readonly canExecute?: (params: TInput, state: SheetState) => boolean
}

// ==================== MCP Tool ====================

/** MCP Tool 定义 */
export interface MCPTool {
  readonly name: string
  readonly description: string
  readonly inputSchema: JSONSchema
}

// ==================== 工厂函数 ====================

/**
 * 创建 CommandDef 的辅助函数
 */
export function defineCommand<TInput = unknown, TOutput = unknown>(
  def: CommandDef<TInput, TOutput>
): CommandDef<TInput, TOutput> {
  return def
}
