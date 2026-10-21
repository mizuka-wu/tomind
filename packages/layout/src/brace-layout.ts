/**
 * Brace 布局 — 大括号布局
 *
 * snowbrush 中 BraceLeftAndRight 继承 logicLeftAndRight，堆叠/居中公式完全一致；
 * 唯一差异是 calcSpacingMajor 会加上 getLineEndSpacingPatchGap：
 * brace 结构无箭头时补 LINE.LINE_SPACING = 16。
 */
import type { LayoutAlgorithm } from './layout-engine'
import { createLogicLikeAlgorithm } from './logic-layout'
import { SC } from './child-structure'

/** snowbrush layoutConstant.LINE.LINE_SPACING */
const BRACE_LINE_SPACING = 16

/**
 * hostStructure 传 brace.*：`getSpacingMajor` 的 LINE_SPACING 补丁按**每个节点自己的生效结构**判定
 * （SB `shouldPatchLineSpacing → isBraceStructure(branchView)`），而生效结构要靠
 * 「preset 缺失 → 继承父结构」往下传 ⇒ 入口这一层必须先说清楚自己是 brace。
 * 实测：skeleton 没写 mainTopic 时 SB 里 d1+ 的 eff 全是 brace.right，每层都要 +16
 * （noskel-brace.right：旧实现只补根层 → avgΔX 51.5）。
 */
export const braceRightLayoutAlgorithm: LayoutAlgorithm = createLogicLikeAlgorithm('brace-right', 'right', BRACE_LINE_SPACING, SC.BRACE_RIGHT)
export const braceLeftLayoutAlgorithm: LayoutAlgorithm = createLogicLikeAlgorithm('brace-left', 'left', BRACE_LINE_SPACING, SC.BRACE_LEFT)
