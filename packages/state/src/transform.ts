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
   * 过滤 Steps（返回新 Transform，不重新应用）
   */
  filter(predicate: (step: Step) => boolean): Transform {
    // 注意：filter 后需要重新计算 doc
    // 这里简化处理，实际应该重新应用所有 step
    return new Transform(
      this.doc,
      [...this.steps.filter(predicate)],
      [...this.docs],
      this._meta as Map<string, unknown>
    )
  }

  /**
   * 映射 Steps（返回新 Transform，不重新应用）
   */
  map(fn: (step: Step) => Step): Transform {
    return new Transform(
      this.doc,
      [...this.steps.map(fn)],
      [...this.docs],
      this._meta as Map<string, unknown>
    )
  }

  // ==================== Meta 系统 ====================

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
   * 交换兄弟节点位置（简化实现）
   */
  exchangeSibling(_nodeId: string, _direction: 'up' | 'down'): Transform {
    // 需要找到父节点和兄弟节点，然后交换
    // 这里简化处理，实际应该有专门的 ExchangeSiblingStep
    return this
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
