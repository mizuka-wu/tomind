/**
 * Step — 原子操作（对标 ProseMirror Step）
 *
 * 分两类：
 * 1. Doc Steps — 操作 NodeDesc 树（InsertNodeStep, RemoveNodeStep, UpdateNodeStep）
 * 2. Meta Steps — 操作 state 元数据（SetSelectionStep, SetViewportStep）
 *
 * 设计原则：
 * - 不可变
 * - 可逆（invert）
 * - 可序列化（toJSON）
 * - 原子性（一个 Step 只做一件事）
 */

import type { NodeDesc, SelectionElement, SetSelectionOptions, Viewport } from '@tomind/schema'

// ==================== Step 基类 ====================

export type StepType = 'insertNode' | 'removeNode' | 'updateNode' | 'setSelection' | 'setViewport'

export abstract class Step {
  constructor(
    public readonly stepType: StepType
  ) {}

  /**
   * 应用 Step 到 NodeDesc 树，返回新 NodeDesc
   * Meta Steps 直接返回传入的 doc
   */
  apply(doc: NodeDesc): NodeDesc {
    return doc
  }

  /**
   * 生成可逆 Step（用于 undo）
   */
  abstract invert(): Step

  /**
   * 序列化
   */
  abstract toJSON(): StepJSON
}

// ==================== Step JSON ====================

export type StepJSON =
  | { stepType: 'insertNode'; parentId: string; node: NodeDesc; index?: number }
  | { stepType: 'removeNode'; nodeId: string; node?: NodeDesc }
  | { stepType: 'updateNode'; nodeId: string; attrs: Record<string, unknown>; oldAttrs: Record<string, unknown> }
  | { stepType: 'setSelection'; elements: readonly SelectionElement[]; options?: SetSelectionOptions; oldElements?: readonly SelectionElement[] }
  | { stepType: 'setViewport'; viewport: Viewport; oldViewport?: Viewport }

// ==================== 工具函数 ====================

/**
 * 递归替换节点树中指定 ID 的节点
 * 返回新的根节点（不可变）
 */
function replaceNodeInTree(root: NodeDesc, targetId: string, replacer: (node: NodeDesc) => NodeDesc): NodeDesc {
  if (root.id === targetId) {
    return replacer(root)
  }

  // 递归子节点
  let changed = false
  const newChildren: Record<string, readonly NodeDesc[]> = {}

  for (const [key, children] of Object.entries(root.children)) {
    const newChildrenList: NodeDesc[] = []
    for (const child of children) {
      const result = replaceNodeInTree(child, targetId, replacer)
      if (result !== child) changed = true
      newChildrenList.push(result)
    }
    newChildren[key] = newChildrenList
  }

  if (!changed) return root

  // 重建父节点（不可变）
  return { ...root, children: newChildren }
}

/**
 * 递归删除节点树中指定 ID 的节点
 * 返回新的根节点（不可变）
 */
function removeNodeFromTree(root: NodeDesc, targetId: string): NodeDesc {
  // 检查直接子节点
  let changed = false
  const newChildren: Record<string, readonly NodeDesc[]> = {}

  for (const [key, children] of Object.entries(root.children)) {
    const newChildrenList: NodeDesc[] = []
    for (const child of children) {
      if (child.id === targetId) {
        changed = true
        // 跳过此子节点
      } else {
        const result = removeNodeFromTree(child, targetId)
        if (result !== child) changed = true
        newChildrenList.push(result)
      }
    }
    newChildren[key] = newChildrenList
  }

  if (!changed) return root

  return { ...root, children: newChildren }
}

/**
 * 在父节点下插入子节点
 */
function insertNodeInTree(root: NodeDesc, parentId: string, node: NodeDesc, index?: number): NodeDesc {
  return replaceNodeInTree(root, parentId, (parent) => {
    const newChildren: Record<string, readonly NodeDesc[]> = {}
    
    for (const [key, children] of Object.entries(parent.children)) {
      if (key === 'attached') {
        // 在 attached 中插入
        const newChildrenList = [...children]
        if (index !== undefined && index >= 0 && index <= newChildrenList.length) {
          newChildrenList.splice(index, 0, node)
        } else {
          newChildrenList.push(node)
        }
        newChildren[key] = newChildrenList
      } else {
        newChildren[key] = children
      }
    }

    // 如果没有 attached key，创建一个
    if (!newChildren['attached']) {
      newChildren['attached'] = [node]
    }

    return { ...parent, children: newChildren }
  })
}

// ==================== InsertNodeStep ====================

/**
 * 在父节点下插入子节点
 */
export class InsertNodeStep extends Step {
  constructor(
    public readonly parentId: string,
    public readonly node: NodeDesc,
    public readonly index?: number
  ) {
    super('insertNode')
  }

  apply(doc: NodeDesc): NodeDesc {
    return insertNodeInTree(doc, this.parentId, this.node, this.index)
  }

  invert(): Step {
    return new RemoveNodeStep(this.node.id, this.parentId, this.index)
  }

  toJSON(): StepJSON {
    return {
      stepType: 'insertNode',
      parentId: this.parentId,
      node: this.node,
      index: this.index
    }
  }
}

// ==================== RemoveNodeStep ====================

/**
 * 删除节点
 */
export class RemoveNodeStep extends Step {
  constructor(
    public readonly nodeId: string,
    public readonly parentId?: string,
    public readonly index?: number
  ) {
    super('removeNode')
  }

  apply(doc: NodeDesc): NodeDesc {
    return removeNodeFromTree(doc, this.nodeId)
  }

  invert(): Step {
    // 需要保存被删除的节点，用于 undo
    // 这里简化处理，实际应该在 apply 时保存
    return new InsertNodeStep(this.parentId || '', { id: this.nodeId } as NodeDesc, this.index)
  }

  toJSON(): StepJSON {
    return {
      stepType: 'removeNode',
      nodeId: this.nodeId
    }
  }
}

// ==================== UpdateNodeStep ====================

/**
 * 更新节点属性
 */
export class UpdateNodeStep extends Step {
  constructor(
    public readonly nodeId: string,
    public readonly attrs: Record<string, unknown>,
    public readonly oldAttrs: Record<string, unknown>
  ) {
    super('updateNode')
  }

  apply(doc: NodeDesc): NodeDesc {
    return replaceNodeInTree(doc, this.nodeId, (node) => {
      return {
        ...node,
        attrs: { ...node.attrs, ...this.attrs }
      }
    })
  }

  invert(): Step {
    return new UpdateNodeStep(this.nodeId, this.oldAttrs, this.attrs)
  }

  toJSON(): StepJSON {
    return {
      stepType: 'updateNode',
      nodeId: this.nodeId,
      attrs: this.attrs,
      oldAttrs: this.oldAttrs
    }
  }
}

// ==================== SetSelectionStep ====================

/**
 * 设置选区（Meta Step）
 */
export class SetSelectionStep extends Step {
  constructor(
    public readonly elements: readonly SelectionElement[],
    public readonly options?: SetSelectionOptions,
    public readonly oldElements?: readonly SelectionElement[]
  ) {
    super('setSelection')
  }

  // Meta Step 不修改 doc
  // apply 直接返回 doc

  invert(): Step {
    return new SetSelectionStep(
      this.oldElements || [],
      this.options,
      this.elements
    )
  }

  toJSON(): StepJSON {
    return {
      stepType: 'setSelection',
      elements: this.elements,
      options: this.options,
      oldElements: this.oldElements
    }
  }
}

// ==================== SetViewportStep ====================

/**
 * 设置视口（Meta Step）
 */
export class SetViewportStep extends Step {
  constructor(
    public readonly viewport: Viewport,
    public readonly oldViewport?: Viewport
  ) {
    super('setViewport')
  }

  // Meta Step 不修改 doc
  // apply 直接返回 doc

  invert(): Step {
    return new SetViewportStep(this.oldViewport || { x: 0, y: 0, zoom: 1 }, this.viewport)
  }

  toJSON(): StepJSON {
    return {
      stepType: 'setViewport',
      viewport: this.viewport,
      oldViewport: this.oldViewport
    }
  }
}
