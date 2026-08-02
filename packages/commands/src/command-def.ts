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

// ==================== CommandFn（对外暴露的函数形式）====================

/** 命令函数（保持现有调用方式） */
export interface CommandFn {
  (state: SheetState, dispatch?: (tr: Transaction) => void, params?: unknown): boolean
  /** 命令名称 */
  readonly commandName: string
  /** 命令描述 */
  readonly description: string
  /** 输入 Schema */
  readonly inputSchema: JSONSchema
  /** 输出 Schema */
  readonly outputSchema?: JSONSchema
  /** 命令分类 */
  readonly category?: CommandCategory
  /** 命令标签 */
  readonly tags?: readonly string[]
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
 * 将 CommandDef 转换为 CommandFn（函数形式，保持现有调用方式）
 */
export function commandToFn<TInput, TOutput>(def: CommandDef<TInput, TOutput>): CommandFn {
  const fn = ((state: SheetState, dispatch?: (tr: Transaction) => void, params?: unknown): boolean => {
    // 执行命令（简化版，不做 schema 验证）
    const result = def.execute(params as TInput, state, dispatch)
    return result.success
  }) as CommandFn

  // 附加元数据
  Object.defineProperty(fn, 'commandName', { value: def.name })
  Object.defineProperty(fn, 'description', { value: def.description })
  Object.defineProperty(fn, 'inputSchema', { value: def.inputSchema })
  Object.defineProperty(fn, 'outputSchema', { value: def.outputSchema })
  Object.defineProperty(fn, 'category', { value: def.category })
  Object.defineProperty(fn, 'tags', { value: def.tags })

  return fn
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
