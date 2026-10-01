/**
 * Brace 布局 — 大括号布局
 *
 * snowbrush 中 BraceLeftAndRight 继承 logicLeftAndRight，堆叠/居中公式完全一致；
 * 唯一差异是 calcSpacingMajor 会加上 getLineEndSpacingPatchGap：
 * brace 结构无箭头时补 LINE.LINE_SPACING = 16。
 */
import type { LayoutAlgorithm } from './layout-engine'
import { createLogicLikeAlgorithm } from './logic-layout'

/** snowbrush layoutConstant.LINE.LINE_SPACING */
const BRACE_LINE_SPACING = 16

export const braceRightLayoutAlgorithm: LayoutAlgorithm = createLogicLikeAlgorithm('brace-right', 'right', BRACE_LINE_SPACING)
export const braceLeftLayoutAlgorithm: LayoutAlgorithm = createLogicLikeAlgorithm('brace-left', 'left', BRACE_LINE_SPACING)
