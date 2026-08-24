/**
 * Commands 测试
 */

import { describe, it, expect } from 'vitest'
import {
  CommandManager,
  defineCommand,
} from '@tomind/commands'
import { createNodeDesc } from '@tomind/schema'
import type { SheetState } from '@tomind/state'

// ==================== 测试命令 ====================

const testCommand = defineCommand<{ value: number }, { doubled: number }>({
  name: 'test_double',
  description: 'Doubles the input value',
  category: 'node',
  tags: ['test'],
  inputSchema: {
    type: 'object',
    properties: {
      value: { type: 'number', description: 'Input value' },
    },
    required: ['value'],
  },
  execute: (params) => {
    return { success: true, data: { doubled: params.value * 2 } }
  },
})

const testFailCommand = defineCommand<{ shouldFail: boolean }, void>({
  name: 'test_fail',
  description: 'Fails if shouldFail is true',
  category: 'node',
  inputSchema: {
    type: 'object',
    properties: {
      shouldFail: { type: 'boolean' },
    },
    required: ['shouldFail'],
  },
  execute: (params) => {
    if (params.shouldFail) {
      return { success: false, error: 'Intentional failure' }
    }
    return { success: true }
  },
  canExecute: (params) => !params.shouldFail,
})

/** 创建最小 SheetState mock（测试用） */
function mockState(): SheetState {
  return {
    doc: createNodeDesc('root', 'root'),
    getNode: () => null,
  } as unknown as SheetState
}

// ==================== 测试 ====================

describe('CommandManager', () => {
  it('should create empty manager', () => {
    const manager = CommandManager.empty()
    expect(manager.size).toBe(0)
    expect(manager.getAll()).toEqual([])
  })

  it('should add commands', () => {
    const manager = CommandManager.empty()
    manager.add(testCommand)

    expect(manager.size).toBe(1)
    expect(manager.has('test_double')).toBe(true)
    expect(manager.get('test_double')).toBe(testCommand)
  })

  it('should add commands via builder', () => {
    const manager = CommandManager.create()
      .add(testCommand)
      .add(testFailCommand)
      .build()

    expect(manager.size).toBe(2)
    expect(manager.has('test_double')).toBe(true)
    expect(manager.has('test_fail')).toBe(true)
  })

  it('should remove commands', () => {
    const manager = CommandManager.empty()
    manager.add(testCommand)
    manager.add(testFailCommand)

    expect(manager.size).toBe(2)

    const removed = manager.remove('test_double')
    expect(removed).toBe(true)
    expect(manager.size).toBe(1)
    expect(manager.has('test_double')).toBe(false)
    expect(manager.has('test_fail')).toBe(true)

    // remove nonexistent returns false
    const notRemoved = manager.remove('nonexistent')
    expect(notRemoved).toBe(false)
  })

  it('should add commands via addCommands', () => {
    const manager = CommandManager.empty()
    manager.addCommands([testCommand, testFailCommand])

    expect(manager.size).toBe(2)
  })

  it('should execute command', () => {
    const manager = CommandManager.empty()
    manager.add(testCommand)

    const result = manager.execute('test_double', { value: 5 }, mockState())
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ doubled: 10 })
  })

  it('should handle command not found', () => {
    const manager = CommandManager.empty()

    const result = manager.execute('nonexistent', {}, mockState())
    expect(result.success).toBe(false)
    expect(result.error).toContain('Command not found')
  })

  it('should handle command failure', () => {
    const manager = CommandManager.empty()
    manager.add(testFailCommand)

    const result = manager.execute('test_fail', { shouldFail: true }, mockState())
    expect(result.success).toBe(false)
    expect(result.error).toContain('cannot be executed')
  })

  it('should check canExecute', () => {
    const manager = CommandManager.empty()
    manager.add(testFailCommand)

    expect(manager.canExecute('test_fail', { shouldFail: false }, mockState())).toBe(true)
    expect(manager.canExecute('test_fail', { shouldFail: true }, mockState())).toBe(false)
    expect(manager.canExecute('nonexistent', {}, mockState())).toBe(false)
  })

  it('should get commands by category', () => {
    const manager = CommandManager.empty()
    manager.addCommands([testCommand, testFailCommand])

    const nodeCommands = manager.getByCategory('node')
    expect(nodeCommands.length).toBe(2)
  })

  it('should get commands by tag', () => {
    const manager = CommandManager.empty()
    manager.addCommands([testCommand, testFailCommand])

    const testCommands = manager.getByTag('test')
    expect(testCommands.length).toBe(1)
    expect(testCommands[0].name).toBe('test_double')
  })

  it('should convert to MCP tools', () => {
    const manager = CommandManager.empty()
    manager.add(testCommand)

    const tools = manager.toMCPTools()
    expect(tools.length).toBe(1)
    expect(tools[0].name).toBe('test_double')
    expect(tools[0].description).toBe('Doubles the input value')
    expect(tools[0].inputSchema).toBeDefined()
  })
})

describe('defineCommand', () => {
  it('should create command definition', () => {
    const cmd = defineCommand({
      name: 'test',
      description: 'Test command',
      inputSchema: { type: 'object' as const },
      execute: () => ({ success: true }),
    })

    expect(cmd.name).toBe('test')
    expect(cmd.description).toBe('Test command')
    expect(typeof cmd.execute).toBe('function')
  })
})
