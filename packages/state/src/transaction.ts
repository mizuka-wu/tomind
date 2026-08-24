/**
 * Transaction — 状态变更描述（对标 ProseMirror Transaction）
 *
 * 组合 Transform（has-a），添加业务上下文：
 * - before: 事务前的 State 快照
 * - docChanged: 是否有改动
 * - time: 时间戳
 * - source: 来源
 *
 * 设计原则：
 * - 组合优于继承：持有 Transform 实例，委托所有步骤操作
 * - 不可变：所有方法返回新 Transaction
 * - 可组合：支持链式调用
 * - 基于 Step：使用原子操作描述变更
 */

import type { NodeDesc, SelectionState, Viewport } from '@tomind/schema'
import type { Step } from './step'
import { InsertNodeStep, RemoveNodeStep, SetSelectionStep, SetViewportStep } from './step'
import { Transform } from './transform'
import type { SheetState } from './sheet-state'

// ==================== Transaction 实现 ====================

export class Transaction {
  readonly transform: Transform
  readonly before: SheetState | null
  readonly docChanged: boolean
  readonly time: number
  readonly source: string

  constructor(
    doc: NodeDesc,
    steps: Step[] = [],
    docs: NodeDesc[] = [],
    meta: ReadonlyMap<string, unknown> = new Map(),
    before: SheetState | null = null,
    time: number = Date.now(),
    source: string = ''
  ) {
    this.transform = new Transform(doc, steps, docs, meta)
    this.before = before
    this.docChanged = steps.some(step => 
      step.stepType === 'insertNode' || 
      step.stepType === 'removeNode' || 
      step.stepType === 'updateNode'
    )
    this.time = time
    this.source = source
  }

  // ==================== 委托属性 ====================

  get doc(): NodeDesc { return this.transform.doc }
  get steps(): readonly Step[] { return this.transform.steps }
  get docs(): readonly NodeDesc[] { return this.transform.docs }
  get meta(): ReadonlyMap<string, unknown> { return this.transform.meta }

  // ==================== 核心方法 ====================

  /**
   * 添加 Step 并应用到 doc
   */
  append(...steps: Step[]): Transaction {
    const t = this.transform.append(...steps)
    return Transaction.fromTransform(t, this.before, this.time, this.source)
  }

  /**
   * 过滤 Steps
   */
  filter(predicate: (step: Step) => boolean): Transaction {
    const t = this.transform.filter(predicate)
    return Transaction.fromTransform(t, this.before, this.time, this.source)
  }

  /**
   * 映射 Steps
   */
  map(fn: (step: Step) => Step): Transaction {
    const t = this.transform.map(fn)
    return Transaction.fromTransform(t, this.before, this.time, this.source)
  }

  /**
   * 设置元数据
   */
  setMeta(key: string, value: unknown): Transaction {
    const t = this.transform.setMeta(key, value)
    return Transaction.fromTransform(t, this.before, this.time, this.source)
  }

  /**
   * 获取元数据
   */
  getMeta<T>(key: string): T | undefined {
    return this.transform.getMeta<T>(key)
  }

  // ==================== 便捷方法 ====================

  /**
   * 插入节点
   */
  insertNode(parentId: string, index: number, node: NodeDesc): Transaction {
    return this.append(new InsertNodeStep(parentId, node, index))
  }

  /**
   * 删除节点
   */
  deleteNode(nodeId: string): Transaction {
    return this.append(new RemoveNodeStep(nodeId))
  }

  /**
   * 设置节点属性
   */
  setAttrs(nodeId: string, attrs: Record<string, unknown>): Transaction {
    const t = this.transform.setAttrs(nodeId, attrs)
    return Transaction.fromTransform(t, this.before, this.time, this.source)
  }

  /**
   * 设置选区
   */
  setSelection(selection: SelectionState): Transaction {
    return this.append(new SetSelectionStep(selection.elements, selection.options))
  }

  /**
   * 设置视口
   */
  setViewport(viewport: Viewport): Transaction {
    return this.append(new SetViewportStep(viewport))
  }

  /**
   * 反转（用于 undo）
   */
  invert(doc: NodeDesc): Transaction {
    const t = this.transform.invert(doc)
    return Transaction.fromTransform(t, this.before, this.time, this.source)
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
      new Map(this.meta),
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
      new Map(this.meta),
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
      new Map(this.meta),
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
  static fromTransform(
    transform: Transform,
    before: SheetState | null = null,
    time: number = Date.now(),
    source: string = ''
  ): Transaction {
    return new Transaction(
      transform.doc,
      [...transform.steps],
      [...transform.docs],
      new Map(transform.meta),
      before,
      time,
      source
    )
  }
}
