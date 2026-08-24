/**
 * Transform — 纯步骤操作基类（对标 ProseMirror Transform）
 *
 * 职责：
 * 1. 管理 Step 序列
 * 2. 提供元数据（Meta）系统
 * 3. 提供便捷操作方法（结构操作、属性操作、UI 状态）
 *
 * 设计原则：
 * - 不可变：所有方法返回新 Transform
 * - 可组合：支持链式调用
 * - 纯数据：不包含业务逻辑
 */

import type { NodeDesc, SelectionState, Viewport } from '@tomind/schema'
import type { Step } from './step'
import { InsertNodeStep, RemoveNodeStep, UpdateNodeStep, SetSelectionStep, SetViewportStep } from './step'

// ==================== Transform 实现 ====================

export class Transform {
  readonly doc: NodeDesc
  readonly steps: readonly Step[]
  readonly docs: readonly NodeDesc[]
  private readonly _meta: ReadonlyMap<string, unknown>

  constructor(
    doc: NodeDesc,
    steps: Step[] = [],
    docs: NodeDesc[] = [],
    meta: Map<string, unknown> = new Map()
  ) {
    this.doc = doc
    this.steps = steps
    this.docs = docs
    this._meta = meta
  }

  // ==================== 核心方法 ====================

  /**
   * 添加 Step 并应用到 doc
   */
  append(...steps: Step[]): Transform {
    let currentDoc = this.doc
    const newDocs = [...this.docs]
    
    for (const step of steps) {
      currentDoc = step.apply(currentDoc)
      newDocs.push(currentDoc)
    }

    return new Transform(
      currentDoc,
      [...this.steps, ...steps],
      newDocs,
      this._meta as Map<string, unknown>
    )
  }

  /**
   * 过滤 Steps（返回新 Transform，重新应用过滤后的 steps）
   */
  filter(predicate: (step: Step) => boolean): Transform {
    const filteredSteps = this.steps.filter(predicate)
    // 从原始 doc（docs[0]）重新应用过滤后的 steps
    const baseDoc = this.docs[0] ?? this.doc
    let currentDoc = baseDoc
    const newDocs: NodeDesc[] = [currentDoc]
    for (const step of filteredSteps) {
      currentDoc = step.apply(currentDoc)
      newDocs.push(currentDoc)
    }
    return new Transform(
      currentDoc,
      filteredSteps,
      newDocs,
      new Map(this._meta),
    )
  }

  /**
   * 映射 Steps（返回新 Transform，重新应用映射后的 steps）
   */
  map(fn: (step: Step) => Step): Transform {
    const mappedSteps = this.steps.map(fn)
    // 从原始 doc（docs[0]）重新应用映射后的 steps
    const baseDoc = this.docs[0] ?? this.doc
    let currentDoc = baseDoc
    const newDocs: NodeDesc[] = [currentDoc]
    for (const step of mappedSteps) {
      currentDoc = step.apply(currentDoc)
      newDocs.push(currentDoc)
    }
    return new Transform(
      currentDoc,
      mappedSteps,
      newDocs,
      new Map(this._meta),
    )
  }

  // ==================== Meta 系统 ====================

  /** 公开 meta 访问（消除 Transaction 中的 transform['_meta'] as Map 访问） */
  get meta(): ReadonlyMap<string, unknown> {
    return this._meta
  }

  /**
   * 设置元数据（对标 ProseMirror setMeta）
   */
  setMeta(key: string, value: unknown): Transform {
    const newMeta = new Map(this._meta)
    newMeta.set(key, value)
    return new Transform(this.doc, [...this.steps], [...this.docs], newMeta)
  }

  /**
   * 获取元数据（对标 ProseMirror getMeta）
   */
  getMeta<T>(key: string): T | undefined {
    return this._meta.get(key) as T | undefined
  }

  // ==================== 结构操作 ====================

  /**
   * 插入节点
   */
  insertNode(parentId: string, index: number, node: NodeDesc): Transform {
    return this.append(new InsertNodeStep(parentId, node, index))
  }

  /**
   * 删除节点
   */
  deleteNode(nodeId: string): Transform {
    return this.append(new RemoveNodeStep(nodeId))
  }

  /**
   * 移动节点（简化实现，实际需要更复杂的逻辑）
   */
  moveNode(nodeId: string, newParentId: string, newIndex: number): Transform {
    // 需要先找到节点，然后删除，再插入
    // 这里简化处理，实际应该用 MoveNodeStep
    const node = findNodeById(this.doc, nodeId)
    if (!node) return this

    return this
      .append(new RemoveNodeStep(nodeId))
      .append(new InsertNodeStep(newParentId, node, newIndex))
  }

  /**
   * 交换兄弟节点位置
   */
  exchangeSibling(nodeId: string, direction: 'up' | 'down'): Transform {
    // 找到父节点
    const parent = findParentOfNode(this.doc, nodeId)
    if (!parent) return this

    // 找到节点在父节点 attached 子节点中的索引
    const attached = parent.children['attached']
    if (!attached) return this
    const index = attached.findIndex(child => child.id === nodeId)
    if (index < 0) return this

    // 计算目标索引
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= attached.length) return this

    // 交换：删除两个节点，按新顺序重新插入
    const nodeA = attached[index]
    const nodeB = attached[targetIndex]

    return this
      .append(new RemoveNodeStep(nodeA.id, parent.id, index))
      .append(new RemoveNodeStep(nodeB.id, parent.id, direction === 'up' ? targetIndex : index))
      .append(new InsertNodeStep(parent.id, nodeB, direction === 'up' ? index : targetIndex))
      .append(new InsertNodeStep(parent.id, nodeA, direction === 'up' ? targetIndex : index))
  }

  // ==================== 属性操作 ====================

  /**
   * 设置节点属性（统一入口，Sheet/Topic/Part 都走这个）
   */
  setAttrs(nodeId: string, attrs: Record<string, unknown>): Transform {
    // 需要找到旧属性，用于 invert
    const node = findNodeById(this.doc, nodeId)
    if (!node) return this

    const oldAttrs: Record<string, unknown> = {}
    for (const key of Object.keys(attrs)) {
      oldAttrs[key] = node.attrs[key]
    }

    return this.append(new UpdateNodeStep(nodeId, attrs, oldAttrs))
  }

  // ==================== UI 状态 ====================

  /**
   * 设置选区
   */
  setSelection(selection: SelectionState): Transform {
    return this.append(new SetSelectionStep(selection.elements, selection.options))
  }

  /**
   * 设置视口
   */
  setViewport(viewport: Viewport): Transform {
    return this.append(new SetViewportStep(viewport))
  }

  /**
   * 反转 Transform（用于 undo）
   * 将所有 Step 反转，顺序也反转
   */
  invert(doc: NodeDesc): Transform {
    const invertedSteps = [...this.steps].reverse().map(step => step.invert())
    return new Transform(doc, invertedSteps, [], new Map(this._meta))
  }
}

// ==================== 工具函数 ====================

/**
 * 在节点树中查找指定 ID 的节点
 */
function findNodeById(root: NodeDesc, targetId: string): NodeDesc | null {
  if (root.id === targetId) return root

  for (const children of Object.values(root.children)) {
    for (const child of children) {
      const found = findNodeById(child, targetId)
      if (found) return found
    }
  }

  return null
}

/**
 * 查找指定节点的父节点
 */
function findParentOfNode(root: NodeDesc, targetId: string): NodeDesc | null {
  for (const children of Object.values(root.children)) {
    for (const child of children) {
      if (child.id === targetId) return root
      const found = findParentOfNode(child, targetId)
      if (found) return found
    }
  }
  return null
}
