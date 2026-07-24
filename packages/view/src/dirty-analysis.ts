/**
 * dirty-analysis — 从 Transaction steps 推理标脏类型
 *
 * 根据变化的属性决定每个节点需要标记的 DirtyFlag
 */

import type { Step } from '@tomind/state'
import { DirtyFlag } from './view-desc'

// ==================== 属性 → 标脏映射 ====================

/** style 子属性 → 额外标脏 */
const STYLE_LAYOUT_KEYS = new Set([
  'spacingMajor',
  'spacingMinor',
])

const STYLE_SIZE_KEYS = new Set([
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
])


// ==================== 分析结果 ====================

export interface DirtyAnalysis {
  /** 节点 ID → 标脏标记 */
  nodeFlags: Map<string, DirtyFlag>
  /** 是否需要全局刷新（所有节点都脏） */
  globalDirty: boolean
  /** 全局标脏标记（仅当 globalDirty=true 时有效） */
  globalFlag: DirtyFlag
}

// ==================== 分析函数 ====================

/**
 * 分析 Transaction 的 steps，推理每个节点的标脏类型
 */
export function analyzeSteps(steps: readonly Step[]): DirtyAnalysis {
  const nodeFlags = new Map<string, DirtyFlag>()
  let globalDirty = false
  let globalFlag = DirtyFlag.CLEAN

  for (const step of steps) {
    switch (step.stepType) {
      case 'updateNode': {
        const { nodeId, attrs, oldAttrs } = step as import('@tomind/state').UpdateNodeStep
        let flag = analyzeAttrsChange(attrs, oldAttrs)

        // 特殊处理：compactLayoutModeLevel 变化 → 全局刷新
        if ('compactLayoutModeLevel' in attrs) {
          const oldLevel = oldAttrs['compactLayoutModeLevel'] || 'Third'
          const newLevel = attrs['compactLayoutModeLevel'] || 'Third'
          if (oldLevel !== newLevel) {
            globalDirty = true
            globalFlag = DirtyFlag.STYLE | DirtyFlag.LAYOUT | DirtyFlag.SIZE
            return { nodeFlags, globalDirty, globalFlag }
          }
        }

        if (flag !== DirtyFlag.CLEAN) {
          mergeFlag(nodeFlags, nodeId, flag)
        }
        break
      }

      case 'insertNode': {
        const { parentId, node } = step as import('@tomind/state').InsertNodeStep
        // 新节点标记 ALL
        mergeFlag(nodeFlags, node.id, DirtyFlag.ALL)
        // 父节点标记 CHILDREN
        mergeFlag(nodeFlags, parentId, DirtyFlag.CHILDREN)
        break
      }

      case 'removeNode': {
        // removeNode 没有 parentId，需要从其他方式获取
        // 暂时跳过，后续可以通过 doc 树查找
        break
      }

      // setSelection, setViewport 不影响标脏
      case 'setSelection':
      case 'setViewport':
        break
    }
  }

  return { nodeFlags, globalDirty, globalFlag }
}

/**
 * 分析 attrs 变化，返回标脏标记
 */
function analyzeAttrsChange(
  attrs: Record<string, unknown>,
  oldAttrs: Record<string, unknown>,
): DirtyFlag {
  let flag = DirtyFlag.CLEAN

  for (const [key, newValue] of Object.entries(attrs)) {
    const oldValue = oldAttrs[key]
    if (newValue === oldValue) continue

    switch (key) {
      case 'style':
        flag |= analyzeStyleChange(
          newValue as Record<string, unknown> | undefined,
          oldValue as Record<string, unknown> | undefined,
        )
        break

      case 'title':
        flag |= DirtyFlag.CONTENT | DirtyFlag.SIZE
        break

      case 'collapsed':
        flag |= DirtyFlag.LAYOUT | DirtyFlag.SIZE | DirtyFlag.CHILDREN
        // 折叠/展开时父节点连线需要重画，标记父子都脏
        break

      case 'class':
        flag |= DirtyFlag.STYLE
        break

      case 'compactLayoutModeLevel':
        // 由调用方特殊处理
        break

      default:
        // 其他属性变化，标记 STYLE
        flag |= DirtyFlag.STYLE
        break
    }
  }

  return flag
}

/**
 * 分析 style 子属性变化，返回标脏标记
 */
function analyzeStyleChange(
  newStyle: Record<string, unknown> | undefined,
  oldStyle: Record<string, unknown> | undefined,
): DirtyFlag {
  if (!newStyle && !oldStyle) return DirtyFlag.CLEAN
  if (!newStyle || !oldStyle) return DirtyFlag.STYLE | DirtyFlag.SIZE | DirtyFlag.LAYOUT

  let flag = DirtyFlag.STYLE

  // 检查影响布局的属性
  for (const key of STYLE_LAYOUT_KEYS) {
    if (newStyle[key] !== oldStyle[key]) {
      flag |= DirtyFlag.LAYOUT
      break
    }
  }

  // 检查影响尺寸的属性
  for (const key of STYLE_SIZE_KEYS) {
    if (newStyle[key] !== oldStyle[key]) {
      flag |= DirtyFlag.SIZE
      break
    }
  }

  return flag
}

/**
 * 合并标脏标记到 Map
 */
function mergeFlag(map: Map<string, DirtyFlag>, nodeId: string, flag: DirtyFlag): void {
  const existing = map.get(nodeId) ?? DirtyFlag.CLEAN
  map.set(nodeId, existing | flag)
}
