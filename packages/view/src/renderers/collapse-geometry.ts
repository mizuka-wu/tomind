/**
 * 折叠/展开按钮几何 — 对齐 snowbrush layoutExtendCollapse（纯函数，无 DOM 依赖）
 * SB utils/layoutconstant: COL_GAP 13 / EXT_GAP 14 / COL_RADIUS 6 / EXT_RADIUS 8
 */
export const COLLAPSE_CHROME = {
  COL_GAP: 13,
  EXT_GAP: 14,
  COL_RADIUS: 6,
  EXT_RADIUS: 8,
} as const

export function computeCollapseButtonPos(
  bounds: { x: number; y: number; width: number; height: number },
  side: 'right' | 'left' | 'down' | 'up',
  collapsed: boolean,
): { x: number; y: number; r: number; gap: number } {
  const gap = collapsed ? COLLAPSE_CHROME.EXT_GAP : COLLAPSE_CHROME.COL_GAP
  const r = collapsed ? COLLAPSE_CHROME.EXT_RADIUS : COLLAPSE_CHROME.COL_RADIUS
  let x: number
  let y: number
  switch (side) {
    case 'right':
      x = bounds.x + bounds.width + gap - r
      y = bounds.y + bounds.height / 2 - r
      break
    case 'left':
      x = bounds.x - gap - r
      y = bounds.y + bounds.height / 2 - r
      break
    case 'down':
      x = bounds.x + bounds.width / 2 - r
      y = bounds.y + bounds.height + gap - r
      break
    case 'up':
      x = bounds.x + bounds.width / 2 - r
      y = bounds.y - gap - r
      break
  }
  return { x, y, r, gap }
}
