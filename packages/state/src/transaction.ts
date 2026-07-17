/**
 * Transaction — 状态变更描述（对标 ProseMirror Transaction）
 *
 * 继承 Transform，添加业务上下文：
 * - before: 事务前的 State 快照
 * - docChanged: 是否有改动
 * - time: 时间戳
 * - source: 来源
 *
 * 设计原则：
 * - 不可变：所有方法返回新 Transaction
 * - 可组合：支持链式调用
 * - 可扩展：支持元数据供插件使用
 * - 基于 Step：使用原子操作描述变更
 */

import type { NodeDesc, SelectionState, Viewport } from '@tomind/schema'
import type { Step } from './step'
import { InsertNodeStep, RemoveNodeStep, SetSelectionStep, SetViewportStep } from './step'
import { Transform } from './transform'
import type { SheetState } from './sheet-state'

// ==================== Transaction 实现 ====================

export class Transaction extends Transform {
  readonly before: SheetState | null
  readonly docChanged: boolean
  readonly time: number
  readonly source: string

  constructor(
    doc: NodeDesc,
    steps: Step[] = [],
    docs: NodeDesc[] = [],
    meta: Map<string, unknown> = new Map(),
    before: SheetState | null = null,
    time: number = Date.now(),
    source: string = ''
  ) {
    super(doc, steps, docs, meta)
    this.before = before
    this.docChanged = steps.some(step => 
      step.stepType === 'insertNode' || 
      step.stepType === 'removeNode' || 
      step.stepType === 'updateNode'
    )
    this.time = time
    this.source = source
  }

  // ==================== 覆盖 Transform 方法，返回 Transaction ====================

  /**
   * 添加 Step 并应用到 doc
   */
  override append(...steps: Step[]): Transaction {
    const transform = super.append(...steps)
    return new Transaction(
      transform.doc,
      [...transform.steps],
      [...transform.docs],
      transform['_meta'] as Map<string, unknown>,
      this.before,
      this.time,
      this.source
    )
  }

  /**
   * 过滤 Steps
   */
  override filter(predicate: (step: Step) => boolean): Transaction {
    const transform = super.filter(predicate)
    return new Transaction(
      transform.doc,
      [...transform.steps],
      [...transform.docs],
      transform['_meta'] as Map<string, unknown>,
      this.before,
      this.time,
      this.source
    )
  }

  /**
   * 映射 Steps
   */
  override map(fn: (step: Step) => Step): Transaction {
    const transform = super.map(fn)
    return new Transaction(
      transform.doc,
      [...transform.steps],
      [...transform.docs],
      transform['_meta'] as Map<string, unknown>,
      this.before,
      this.time,
      this.source
    )
  }

  /**
   * 设置元数据
   */
  override setMeta(key: string, value: unknown): Transaction {
    const transform = super.setMeta(key, value)
    return new Transaction(
      transform.doc,
      [...transform.steps],
      [...transform.docs],
      transform['_meta'] as Map<string, unknown>,
      this.before,
      this.time,
      this.source
    )
  }

  // ==================== 覆盖 Transform 便捷方法，返回 Transaction ====================

  /**
   * 插入节点
   */
  override insertNode(parentId: string, index: number, node: NodeDesc): Transaction {
    return this.append(new InsertNodeStep(parentId, node, index))
  }

  /**
   * 删除节点
   */
  override deleteNode(nodeId: string): Transaction {
    return this.append(new RemoveNodeStep(nodeId))
  }

  /**
   * 设置节点属性
   */
  override setAttrs(nodeId: string, attrs: Record<string, unknown>): Transaction {
    const transform = super.setAttrs(nodeId, attrs)
    return new Transaction(
      transform.doc,
      [...transform.steps],
      [...transform.docs],
      transform['_meta'] as Map<string, unknown>,
      this.before,
      this.time,
      this.source
    )
  }

  /**
   * 设置选区
   */
  override setSelection(selection: SelectionState): Transaction {
    return this.append(new SetSelectionStep(selection.elements, selection.options))
  }

  /**
   * 设置视口
   */
  override setViewport(viewport: Viewport): Transaction {
    return this.append(new SetViewportStep(viewport))
  }

  // ==================== 业务方法 ====================

  /**
   * 设置事务来源
   */
  withSource(source: string): Transaction {
    return new Transaction(
      this.doc,
      [...this.steps],
      [...this.docs],
      this['_meta'] as Map<string, unknown>,
      this.before,
      this.time,
      source
    )
  }

  /**
   * 设置时间戳
   */
  withTime(time: number): Transaction {
    return new Transaction(
      this.doc,
      [...this.steps],
      [...this.docs],
      this['_meta'] as Map<string, unknown>,
      this.before,
      time,
      this.source
    )
  }

  /**
   * 设置 before 快照
   */
  withBefore(before: SheetState): Transaction {
    return new Transaction(
      this.doc,
      [...this.steps],
      [...this.docs],
      this['_meta'] as Map<string, unknown>,
      before,
      this.time,
      this.source
    )
  }

  // ==================== 静态工厂方法 ====================

  /**
   * 创建空 Transaction
   */
  static empty(doc: NodeDesc, before: SheetState | null = null): Transaction {
    return new Transaction(doc, [], [], new Map(), before)
  }

  /**
   * 从 Transform 创建 Transaction
   */
  static fromTransform(transform: Transform, before: SheetState | null = null): Transaction {
    return new Transaction(
      transform.doc,
      [...transform.steps],
      [...transform.docs],
      transform['_meta'] as Map<string, unknown>,
      before
    )
  }
}
