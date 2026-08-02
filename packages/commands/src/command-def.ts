/**
 * CommandDef — 命令定义（对齐 MCP Tool 规范）
 *
 * 使用方式：
 * ```ts
 * import { defineCommand } from '@tomind/commands'
 *
 * const addChildCommand = defineCommand({
 *   name: 'addChild',
 *   description: '添加子节点',
 *   inputSchema: {
 *     type: 'object',
 *     properties: {
 *       nodeId: { type: 'string' },
 *       title: { type: 'string' },
 *     },
 *   },
 *   execute: (params, state, dispatch) => {
 *     return { success: true, data: { newId: '...' } }
 *   },
 * })
 * ```
 */

import type { SheetState, Transaction } from '@tomind/state'

// ==================== 命令执行结果 ====================

export interface CommandResult<T = unknown> {
  readonly success: boolean
  readonly data?: T
  readonly error?: string
  readonly meta?: Record<string, unknown>
}

// ==================== 命令分类 ====================

export type CommandCategory =
  | 'node'
  | 'structure'
  | 'style'
  | 'selection'
  | 'view'
  | 'relationship'
  | 'boundary'
  | 'summary'
  | 'sheet'
  | 'workbook'

// ==================== JSON Schema ====================

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

// ==================== CommandDef ====================

export interface CommandDef<TInput = unknown, TOutput = unknown> {
  readonly name: string
  readonly description: string
  readonly inputSchema: JSONSchema
  readonly outputSchema?: JSONSchema
  readonly category?: CommandCategory
  readonly tags?: readonly string[]
  readonly requiresSelection?: boolean
  readonly idempotent?: boolean

  readonly execute: (
    params: TInput,
    state: SheetState,
    dispatch?: (tr: Transaction) => void
  ) => CommandResult<TOutput>

  readonly canExecute?: (params: TInput, state: SheetState) => boolean
}

// ==================== MCP Tool ====================

export interface MCPTool {
  readonly name: string
  readonly description: string
  readonly inputSchema: JSONSchema
  readonly outputSchema?: JSONSchema
}

// ==================== 工厂函数 ====================

/**
 * 定义命令（对齐 MCP Tool 规范）
 */
export function defineCommand<TInput, TOutput>(config: {
  name: string
  description: string
  inputSchema: JSONSchema
  outputSchema?: JSONSchema
  category?: CommandCategory
  tags?: string[]
  requiresSelection?: boolean
  idempotent?: boolean
  execute: (params: TInput, state: SheetState, dispatch?: (tr: Transaction) => void) => CommandResult<TOutput>
  canExecute?: (params: TInput, state: SheetState) => boolean
}): CommandDef<TInput, TOutput> {
  return {
    name: config.name,
    description: config.description,
    inputSchema: config.inputSchema,
    outputSchema: config.outputSchema,
    category: config.category,
    tags: config.tags,
    requiresSelection: config.requiresSelection,
    idempotent: config.idempotent,
    execute: config.execute,
    canExecute: config.canExecute,
  }
}

/**
 * 将 CommandDef 转换为函数形式（兼容扩展系统的 CommandFn 签名）
 */
export function commandToFn<TInput, TOutput>(def: CommandDef<TInput, TOutput>) {
  return (state: SheetState, dispatch?: (tr: Transaction) => void, params?: unknown): boolean => {
    const result = def.execute(params as TInput, state, dispatch)
    return result.success
  }
}

/**
 * 将 CommandDef 转换为 MCP Tool 格式
 */
export function commandToMCPTool(def: CommandDef): MCPTool {
  return {
    name: def.name,
    description: def.description,
    inputSchema: def.inputSchema,
    outputSchema: def.outputSchema,
  }
}
