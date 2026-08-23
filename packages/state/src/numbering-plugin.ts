/**
 * NumberingPlugin — ProseMirror 风格 Plugin，计算节点编号文本
 *
 * 编号配置在父节点上（node.attrs.numbering），控制子节点的显示编号。
 * Plugin 在每次 state.apply 时重新计算所有节点的编号文本。
 *
 * 对齐 snowbrush branchview.ts 的 getNumberText 逻辑：
 * 1. 获取节点在父节点 children 中的 sibling index
 * 2. 根据父节点的 numberFormat 转换 index 为编号字符串
 * 3. 递归拼接祖先编号（用 separator 分隔）
 * 4. 加上 prefix / suffix
 */

import type { NodeDesc, NumberingData } from '@tomind/schema'
import {
  NUMBERFORMAT,
  SEPARATOR_MAP,
  getNumberText,
} from '@tomind/schema'
import { PluginKey } from './sheet-state'
import type { Plugin, SheetState } from './sheet-state'
import type { Transaction } from './transaction'

// ==================== 类型 ====================

/** NumberingState — plugin state */
export interface NumberingState {
  /** nodeId → 显示文本（如 "1.1", "Chapter 1."） */
  readonly texts: ReadonlyMap<string, string>
}

// ==================== PluginKey ====================

export const numberingKey = new PluginKey<NumberingState>('numbering')

// ==================== 编号计算 ====================

/**
 * 递归计算整棵 doc 树的编号文本
 *
 * 返回 Map<nodeId, displayText>
 */
function computeNumberingTexts(doc: NodeDesc): Map<string, string> {
  const texts = new Map<string, string>()

  /**
   * 递归遍历子节点
   * @param parent 父节点
   * @param ancestorTexts 祖先链的编号文本累积（不含 prefix/suffix）
   * @param parentNumbering 父节点的 numbering 配置（用于继承 format/separator）
   * @param parentComputedFormat 父节点的计算后 format（用于继承）
   * @param parentComputedSeparator 父节点的计算后 separator（用于继承）
   */
  function walkChildren(
    parent: NodeDesc,
    ancestorTexts: string,
    parentNumbering: NumberingData | undefined,
    parentComputedFormat: string | undefined,
    parentComputedSeparator: string | undefined,
  ) {
    // 遍历所有 children group（attached, detached, callout, summary 等）
    for (const [, children] of Object.entries(parent.children)) {
      if (!Array.isArray(children)) continue

      // 计算 attached 子节点的 sibling index
      let siblingIndex = 0
      for (const child of children) {
        // 只有 attached 类型的子节点参与编号
        // 对于非 attached 的 children group，跳过编号计算
        const isAttachedGroup = true // children group key 不影响，snowbrush 按 attached 类型过滤
        if (isAttachedGroup) {
          siblingIndex++
          processNode(child, siblingIndex, ancestorTexts, parentNumbering, parentComputedFormat, parentComputedSeparator)
        }
      }
    }
  }

  /**
   * 处理单个节点：计算编号文本，然后递归处理子节点
   */
  function processNode(
    node: NodeDesc,
    siblingIndex: number,
    ancestorTexts: string,
    parentNumbering: NumberingData | undefined,
    parentComputedFormat: string | undefined,
    parentComputedSeparator: string | undefined,
  ) {
    // 当前节点的 numbering 配置（从 attrs 中读取）
    const nodeNumbering = node.attrs?.numbering as NumberingData | undefined

    // 当前节点的计算后 format（继承自 parent 或自己定义）
    const computedFormat = nodeNumbering?.numberFormat ?? parentComputedFormat
    // 当前节点的计算后 separator（继承自 parent 或自己定义，默认 DOT）
    const computedSeparator = nodeNumbering?.numberSeparator ?? parentComputedSeparator ?? 'org.xmind.numbering.separator.dot'

    // 如果父节点有 numbering 配置（或继承了 format），当前节点需要编号
    if (parentComputedFormat && parentComputedFormat !== NUMBERFORMAT.NONE) {
      // 编号数字
      const numberText = getNumberText(parentComputedFormat, siblingIndex)

      if (numberText) {
        // 完整编号 = prefix + (ancestorTexts + separator + number) + suffix
        let fullNumber: string
        if (ancestorTexts) {
          const separatorChar = SEPARATOR_MAP.get(parentComputedSeparator ?? computedSeparator) ?? '.'
          fullNumber = ancestorTexts + separatorChar + numberText
        } else {
          fullNumber = numberText
        }

        // 加 prefix/suffix（来自父节点的 numbering 配置）
        const prefix = parentNumbering?.prefix ?? ''
        const suffix = parentNumbering?.suffix ?? ''
        const displayText = prefix + fullNumber + suffix
        texts.set(node.id, displayText)

        // 递归子节点时，ancestorTexts 是不带 prefix/suffix 的纯数字部分
        walkChildren(node, fullNumber, nodeNumbering, computedFormat, computedSeparator)
        return
      }
    }

    // 无编号：继续递归子节点（传递继承的 format/separator）
    walkChildren(node, ancestorTexts, nodeNumbering, computedFormat, computedSeparator)
  }

  // 从 doc 根节点开始遍历
  // doc 本身没有 numbering，直接遍历其子节点
  walkChildren(doc, '', undefined, undefined, undefined)

  return texts
}

// ==================== Plugin 工厂 ====================

/**
 * 创建 NumberingPlugin
 *
 * 对齐 ProseMirror Plugin 设计：
 * - state.init: 初始化时计算所有节点编号
 * - state.apply: 每次 transaction 后重新计算
 */
export function createNumberingPlugin(): Plugin<NumberingState> {
  return {
    key: numberingKey,
    state: {
      init(_state: SheetState): NumberingState {
        // init 时 doc 可能还没准备好，返回空 map
        // 实际计算在首次 apply 时进行
        return { texts: new Map() }
      },

      apply(_tr: Transaction, _value: NumberingState, state: SheetState): NumberingState {
        const texts = computeNumberingTexts(state.doc)
        return { texts }
      },
    },
  }
}
