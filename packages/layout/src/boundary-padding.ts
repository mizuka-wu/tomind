/**
 * Boundary-aware outsidePadding computation
 *
 * Ported from snowbrush _setBoundaryPadding (structuresutil.ts)
 *
 * When a topic has boundary children, each attached child in the boundary's
 * range gets extra padding so the layout engine can reserve space for the
 * boundary outline.
 */
import type { NodeDesc } from '@tomind/schema'
import type { TreeDirection } from './tree-layout'

export const BOUNDARYGAP = 10
/** Boundary title line height: fontSize 12 × lineHeight 1.34, floored */
export const BOUNDARY_TITLE_HEIGHT = Math.floor(12 * 1.34)

export interface OutsidePadding {
  top: number
  bottom: number
  left: number
  right: number
}

function createZeroPadding(): OutsidePadding {
  return { top: 0, bottom: 0, left: 0, right: 0 }
}

function isHorizontal(dir: TreeDirection): boolean {
  return dir === 'right' || dir === 'left'
}

/**
 * Compute boundary title height for a boundary node.
 * Returns 0 if the boundary has no title.
 */
function getBoundaryTitleHeight(boundary: NodeDesc): number {
  const title = boundary.attrs.title
  if (typeof title === 'string' && title.length > 0) {
    return BOUNDARY_TITLE_HEIGHT
  }
  if (typeof title === 'object' && title !== null && Array.isArray(title)) {
    const hasText = title.some((t: { text?: string }) => (t.text ?? '').length > 0)
    return hasText ? BOUNDARY_TITLE_HEIGHT : 0
  }
  return 0
}

/**
 * Get boundary nodes attached to a parent.
 * Boundaries are stored in parent.children.boundary[].
 */
function getBoundaryChildren(parent: NodeDesc): readonly NodeDesc[] {
  return parent.children.boundary ?? []
}

/**
 * Read rangeStart/rangeEnd from a boundary's attrs.
 * Falls back to 0..0 if not set.
 */
function getBoundaryRange(boundary: NodeDesc, childCount: number): { rangeStart: number; rangeEnd: number } {
  const rawStart = boundary.attrs.rangeStart
  const rawEnd = boundary.attrs.rangeEnd
  const rangeStart = typeof rawStart === 'number' ? rawStart : 0
  const rangeEnd = typeof rawEnd === 'number' ? rawEnd : childCount - 1
  return {
    rangeStart: Math.max(0, Math.min(rangeStart, childCount - 1)),
    rangeEnd: Math.max(rangeStart, Math.min(rangeEnd, childCount - 1)),
  }
}

/**
 * Compute outsidePadding for a child at the given index within its parent's
 * attached children list, for the given layout direction.
 *
 * Mirrors snowbrush _setBoundaryPadding logic:
 * - UD (down/up) direction: children stack horizontally; boundary adds left/right caps + up/down title/end caps
 * - LR (right/left) direction: children stack vertically; boundary adds up/down caps + left/right title/end caps
 *
 * Returns accumulated padding from ALL boundaries whose range covers childIndex.
 */
export function computeOutsidePadding(
  parent: NodeDesc,
  childIndex: number,
  direction: TreeDirection,
): OutsidePadding {
  const padding = createZeroPadding()
  const boundaries = getBoundaryChildren(parent)
  if (boundaries.length === 0) return padding

  const children = parent.children.attached ?? []
  const childCount = children.length
  if (childCount === 0) return padding

  const horizontal = isHorizontal(direction)

  for (const boundary of boundaries) {
    const titleHeight = getBoundaryTitleHeight(boundary)

    // Master range: wraps all children — handled at parent level
    const range = boundary.attrs.range
    if (range === 'master') continue

    const { rangeStart, rangeEnd } = getBoundaryRange(boundary, childCount)

    if (childIndex < rangeStart || childIndex > rangeEnd) continue

    if (horizontal) {
      // LR (right/left): children stack vertically, boundary wraps vertically
      // Perpendicular (vertical) padding for all children in range
      padding.top += BOUNDARYGAP + titleHeight
      padding.bottom += BOUNDARYGAP
    } else {
      // UD (down/up): children stack horizontally, boundary wraps horizontally
      // Perpendicular (horizontal) padding for all children in range
      padding.left += BOUNDARYGAP
      padding.right += BOUNDARYGAP
    }

    // First child in range (rangeStart): cap on the side toward parent
    if (childIndex === rangeStart) {
      if (horizontal) {
        // For 'right': toward parent = left; for 'left': toward parent = right
        if (direction === 'right') {
          padding.left += BOUNDARYGAP
        } else {
          padding.right += BOUNDARYGAP
        }
      } else {
        // For 'down': toward parent = top; for 'up': toward parent = bottom (reversed)
        if (direction === 'down') {
          padding.top += BOUNDARYGAP + titleHeight
        } else {
          padding.bottom += BOUNDARYGAP
        }
      }
    }

    // Last child in range (rangeEnd): cap on the side away from parent
    if (childIndex === rangeEnd) {
      if (horizontal) {
        // For 'right': away from parent = right; for 'left': away = left
        if (direction === 'right') {
          padding.right += BOUNDARYGAP
        } else {
          padding.left += BOUNDARYGAP
        }
      } else {
        // For 'down': away from parent = bottom; for 'up': away = top (reversed)
        if (direction === 'down') {
          padding.bottom += BOUNDARYGAP
        } else {
          padding.top += BOUNDARYGAP + titleHeight
        }
      }
    }
  }

  return padding
}

/**
 * Compute outsidePadding for the parent itself when it has a 'master' boundary.
 * A master boundary wraps ALL children and adds padding to the parent's own bounds.
 */
export function computeMasterOutsidePadding(
  parent: NodeDesc,
  _direction: TreeDirection,
): OutsidePadding {
  const padding = createZeroPadding()
  const boundaries = getBoundaryChildren(parent)

  for (const boundary of boundaries) {
    const range = boundary.attrs.range
    if (range !== 'master') continue

    const titleHeight = getBoundaryTitleHeight(boundary)
    padding.top += BOUNDARYGAP + titleHeight
    padding.bottom += BOUNDARYGAP
    padding.left += BOUNDARYGAP
    padding.right += BOUNDARYGAP
  }

  return padding
}

/**
 * Compute boundaryBounds = node size expanded by outsidePadding.
 */
export function computeBoundaryBounds(
  size: { width: number; height: number },
  outsidePadding: OutsidePadding,
): { x: number; y: number; width: number; height: number } {
  return {
    x: -outsidePadding.left,
    y: -outsidePadding.top,
    width: size.width + outsidePadding.left + outsidePadding.right,
    height: size.height + outsidePadding.top + outsidePadding.bottom,
  }
}
