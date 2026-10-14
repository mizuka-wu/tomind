/**
 * 线尾回缩 / 层间距补丁回归测试（SB utils/line.getLineEndSpacingPatchGap）
 *
 *   hasArrow = endArrowClass && endArrowClass !== ARROW_CLASS.NONE
 *   shouldPatch = isBraceStructure(v) || hasArrow           // 否则 0
 *   getLineEndSpacing:
 *     isBrace && !hasArrow → LINE.LINE_SPACING(16)
 *     !hasArrow            → 0
 *     否则 → lineWidth * arrowSizeRatio(4)
 *            + (isTimelineThroughStructure(v) ? LINE_TIMELINE_THROUGH_SPACING(4) : LINE_SPACING(16))
 *   isTimelineThroughStructure = structureClass === TIMELINEHORIZONTAL || TIMELINETHROUGHVERTICAL
 *
 * 探针实测（test-arrow-timeline.xmind，箭头 = org.xmind.arrowShape.triangle）：
 *   root  timeline.horizontal       lineWidth 3 → patchGap **16**（= 3*4 + 4），topicSpacing 116
 *   d1    timeline.horizontal.up    lineWidth 2 → patchGap **24**（= 2*4 + 16），topicSpacing 44
 *   d2    logic.right               lineWidth 2 → patchGap **24**，calcSpacingMajor 26+24 = **50**
 *
 * 旧实现两处错：
 *   1. timeline-layout 的轴间距与分支间距都写死 `lw*4+16` → 轴每层多 12px
 *   2. logic-layout.getSpacingMajor **完全没有** patch（只有 brace 用 spacingMajorExtra=16
 *      硬编码补了一份）→ 委派子树每层窄 24px，在 timeline 轴上累积成 -48/-96/-192，
 *      test-arrow-timeline avgΔX 82.5（改完 0）
 */

import { describe, it, expect } from 'vitest'
import {
  getLineEndSpacingPatchGap,
  hasLineEndArrow,
  LINE_SPACING,
  LINE_TIMELINE_THROUGH_SPACING,
  ARROW_SIZE_RATIO,
} from '@tomind/layout'

describe('SB 常量', () => {
  it('LINE_SPACING=16 / LINE_TIMELINE_THROUGH_SPACING=4 / arrowSizeRatio=4', () => {
    expect(LINE_SPACING).toBe(16)
    expect(LINE_TIMELINE_THROUGH_SPACING).toBe(4)
    expect(ARROW_SIZE_RATIO).toBe(4)
  })
})

describe('hasLineEndArrow', () => {
  it('none / 空 / 非字符串都算没有箭头', () => {
    expect(hasLineEndArrow('org.xmind.arrowShape.none')).toBe(false)
    expect(hasLineEndArrow('none')).toBe(false)
    expect(hasLineEndArrow('')).toBe(false)
    expect(hasLineEndArrow(null)).toBe(false)
    expect(hasLineEndArrow(undefined)).toBe(false)
  })
  it('URI 与短名都认', () => {
    expect(hasLineEndArrow('org.xmind.arrowShape.triangle')).toBe(true)
    expect(hasLineEndArrow('triangle')).toBe(true)
    expect(hasLineEndArrow('org.xmind.arrowShape.spearhead')).toBe(true)
  })
})

describe('getLineEndSpacingPatchGap（SB getLineEndSpacingPatchGap）', () => {
  it('无箭头且非 brace → 0', () => {
    expect(getLineEndSpacingPatchGap({ hasArrow: false, lineWidth: 3 })).toBe(0)
    expect(getLineEndSpacingPatchGap({})).toBe(0)
  })

  it('brace 无箭头 → LINE_SPACING(16)（不看 lineWidth）', () => {
    expect(getLineEndSpacingPatchGap({ isBrace: true, hasArrow: false, lineWidth: 2 })).toBe(16)
  })

  it('有箭头 → lineWidth*4 + 16（普通结构）', () => {
    // 探针实测：logic.right d2 / timeline.horizontal.up d1，lineWidth 2 → 24
    expect(getLineEndSpacingPatchGap({ hasArrow: true, lineWidth: 2 })).toBe(24)
    expect(getLineEndSpacingPatchGap({ hasArrow: true, lineWidth: 3 })).toBe(28)
    expect(getLineEndSpacingPatchGap({ hasArrow: true, lineWidth: 1 })).toBe(20)
  })

  it('有箭头 + timeline-through（timeline.horizontal / through.vertical）→ lineWidth*4 + 4', () => {
    // 探针实测：root timeline.horizontal，lineWidth 3 → 16（不是 28）
    expect(getLineEndSpacingPatchGap({ isTimelineThrough: true, hasArrow: true, lineWidth: 3 })).toBe(16)
    expect(getLineEndSpacingPatchGap({ isTimelineThrough: true, hasArrow: true, lineWidth: 2 })).toBe(12)
  })

  it('brace + 有箭头 → 走箭头分支（lw*4+16），不是 16', () => {
    expect(getLineEndSpacingPatchGap({ isBrace: true, hasArrow: true, lineWidth: 2 })).toBe(24)
  })
})
