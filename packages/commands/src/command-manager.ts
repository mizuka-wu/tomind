/**
 * CommandManager — 命令管理器
 *
 * 管理所有命令的注册、查询、执行
 * 对标 Tiptap 的 Editor.commands
 */

import {
  type CommandDef,
  type CommandCategory,
  type MCPTool,
  type CommandResult,
} from './command-def'
import type { SheetState } from '@tomind/state'
import type { Transaction } from '@tomind/state'

// ==================== 类型定义 ====================

/** 命令集合类型 */
export type CommandRecord = Record<string, CommandDef>

/** 命令工厂函数 */
export type CommandFactory = () => CommandRecord

// ==================== CommandManager ====================

/**
 * CommandManager — 管理所有命令
 *
 * 使用方式：
 * ```ts
 * const commands = CommandManager.create()
 *   .addCommands(titleCommands)
 *   .addCommands(styleCommands)
 *   .addCommands(structureCommands)
 *   .build()
 * ```
 */
export class CommandManager {
  private commands = new Map<string, CommandDef>()

  private constructor() {}

  /**
   * 创建空的 CommandManager
   */
  static empty(): CommandManager {
    return new CommandManager()
  }

  /**
   * 创建 CommandManager 构建器
   */
  static create(): CommandManagerBuilder {
    return new CommandManagerBuilder()
  }

  /**
   * 注册单个命令
   */
  add(def: CommandDef): this {
    if (this.commands.has(def.name)) {
      console.warn(`Command already registered: ${def.name}, overwriting`)
    }
    this.commands.set(def.name, def)
    return this
  }

  /**
   * 批量注册命令
   */
  addCommands(commands: CommandRecord | CommandDef[]): this {
    if (Array.isArray(commands)) {
      for (const cmd of commands) {
        this.add(cmd)
      }
    } else {
      for (const [name, cmd] of Object.entries(commands)) {
        // 使用 record 的 key 作为 name（如果 command 没有 name）
        if (!cmd.name) (cmd as { name: string }).name = name
        this.add(cmd)
      }
    }
    return this
  }

  /**
   * 获取命令
   */
  get(name: string): CommandDef | undefined {
    return this.commands.get(name)
  }

  /**
   * 获取所有命令
   */
  getAll(): CommandDef[] {
    return Array.from(this.commands.values())
  }

  /**
   * 按分类获取
   */
  getByCategory(category: CommandCategory): CommandDef[] {
    return this.getAll().filter(cmd => cmd.category === category)
  }

  /**
   * 按标签获取
   */
  getByTag(tag: string): CommandDef[] {
    return this.getAll().filter(cmd => cmd.tags?.includes(tag))
  }

  /**
   * 检查命令是否存在
   */
  has(name: string): boolean {
    return this.commands.has(name)
  }

  /**
   * 删除命令
   */
  remove(name: string): boolean {
    return this.commands.delete(name)
  }

  /**
   * 检查命令是否可执行
   */
  canExecute(name: string, params: unknown, state: SheetState): boolean {
    const cmd = this.commands.get(name)
    if (!cmd) return false
    if (cmd.canExecute) return cmd.canExecute(params, state)
    return true
  }

  /**
   * 执行命令
   *
   * @param name - 命令名称
   * @param params - 输入参数
   * @param state - 当前状态
   * @param dispatch - 分发事务的函数
   * @returns 命令执行结果
   */
  execute<TInput = unknown, TOutput = unknown>(
    name: string,
    params: TInput,
    state: SheetState,
    dispatch?: (tr: Transaction) => void
  ): CommandResult<TOutput> {
    const cmd = this.commands.get(name) as CommandDef<TInput, TOutput> | undefined
    if (!cmd) {
      return { success: false, error: `Command not found: ${name}` }
    }

    // 检查是否可执行
    if (cmd.canExecute && !cmd.canExecute(params, state)) {
      return { success: false, error: `Command cannot be executed: ${name}` }
    }

    try {
      return cmd.execute(params, state, dispatch)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * 转换为 MCP Tool 列表
   */
  toMCPTools(): MCPTool[] {
    return this.getAll().map(cmd => ({
      name: cmd.name,
      description: cmd.description,
      inputSchema: cmd.inputSchema,
    }))
  }

  /**
   * 获取命令数量
   */
  get size(): number {
    return this.commands.size
  }
}

// ==================== CommandManagerBuilder ====================

/**
 * CommandManager 构建器
 */
export class CommandManagerBuilder {
  private manager = CommandManager.empty()

  addCommands(commands: CommandRecord | CommandDef[]): this {
    this.manager.addCommands(commands)
    return this
  }

  add(def: CommandDef): this {
    this.manager.add(def)
    return this
  }

  build(): CommandManager {
    return this.manager
  }
}
