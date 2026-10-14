/**
 * text-wrap — 标题文本的换行宽度决策（对齐 snowbrush 的 titleView）
 *
 * SB 的标题**从不二次换行**：它自己按 TITLE_MAX_WIDTH 切行、每行一个 tspan，
 * `titleView.bounds.width = ceil(topicTitleGroupSize.width)`（最宽那一行）。
 * leafer 的 Text 一旦设了 `width` 就会用**自己**的文本量测重排一遍：
 * 量测比布局侧的 canvas 宽零点几像素时，最后一个字会被挤到下一行
 * （实测矩阵单元格「正温度系数（PTC)」：SB 113.96×18 一行 →
 * TM 设 width=114 后变成 114×42 两行，标题溢出 30px 高的单元格）。
 *
 * 所以只有「布局侧确实换行了」才约束宽度，单行标题交给 leafer 自然宽度。
 */

/** 布局侧的行高口径：measureTextSize 用 `Math.floor(fontSize * 1.34)`（= SB lineHeight） */
export const LAYOUT_LINE_HEIGHT_RATIO = 1.34

export interface WrapLayout {
  width: number
  titleWidth: number
  titleHeight: number
}

/**
 * 返回要给 leafer Text 设的 `width`；`undefined` 表示不约束（用自然宽度）。
 *
 * - `titleWidth <= 0`（布局没给标题量测值）→ 退回旧的「盒宽 − 16」兜底
 * - 单行标题 → 不约束
 * - 多行标题 → 约束到 titleWidth（否则 leafer 会排成一行，溢出主题盒）
 */
export function computeTitleWrapWidth(
  layout: WrapLayout,
  style: { fontSize?: unknown },
): number | undefined {
  const fallback = Math.max((typeof layout.width === 'number' ? layout.width : 120) - 16, 20)
  if (!(layout.titleWidth > 0)) return fallback

  const fontSize = typeof style.fontSize === 'number' ? style.fontSize : 14
  const lineH = Math.max(1, Math.floor(fontSize * LAYOUT_LINE_HEIGHT_RATIO))
  const lineCount = layout.titleHeight > 0
    ? Math.max(1, Math.round(layout.titleHeight / lineH))
    : 1
  if (lineCount === 1) return undefined
  return Math.max(layout.titleWidth, 20)
}

export default { computeTitleWrapWidth, LAYOUT_LINE_HEIGHT_RATIO }
