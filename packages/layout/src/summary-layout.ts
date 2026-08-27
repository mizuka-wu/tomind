/**
 * Summary Layout — positions summary nodes relative to their range children
 *
 * Ported from snowbrush summary positioning logic.
 * Summary children are positioned AFTER attached children are laid out.
 * Summary bounds expand the parent's total bounds.
 */
import type { NodeDesc } from '@tomind/schema'

/** Total padding between summary bracket and the range children */
const SUMMARY_PADDING_WITH_TOPIC = 40 // PADDING(20) + TOSUMMARY(10) + TORANGE(10)

interface NodeSize {
  width: number
  height: number
}

interface ChildBounds {
  x: number
  y: number
  width: number
  height: number
}

type Direction = 'right' | 'left' | 'down' | 'up'

function isHorizontal(dir: Direction): boolean {
  return dir === 'right' || dir === 'left'
}

/** Get summary children from parent (stored in children.summary) */
function getSummaryChildren(parent: NodeDesc): readonly NodeDesc[] {
  return parent.children.summary ?? []
}

/** Read rangeStart/rangeEnd from summary attrs */
function getSummaryRange(
  summary: NodeDesc,
  childCount: number,
): { rangeStart: number; rangeEnd: number } {
  const rawStart = summary.attrs.rangeStart
  const rawEnd = summary.attrs.rangeEnd
  const rangeStart = typeof rawStart === 'number' ? rawStart : 0
  const rangeEnd = typeof rawEnd === 'number' ? rawEnd : childCount - 1
  return {
    rangeStart: Math.max(0, Math.min(rangeStart, childCount - 1)),
    rangeEnd: Math.max(rangeStart, Math.min(rangeEnd, childCount - 1)),
  }
}

/**
 * Compute the combined bounds of a range of children.
 * Returns null if no valid children are found.
 */
function computeRangeBounds(
  rangeChildren: readonly NodeDesc[],
  childPositions: Map<string, ChildBounds>,
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  let found = false
  for (const child of rangeChildren) {
    const pos = childPositions.get(child.id)
    if (!pos) continue
    found = true
    minX = Math.min(minX, pos.x)
    minY = Math.min(minY, pos.y)
    maxX = Math.max(maxX, pos.x + pos.width)
    maxY = Math.max(maxY, pos.y + pos.height)
  }

  return found ? { minX, minY, maxX, maxY } : null
}

/**
 * Position summary nodes after attached children are laid out.
 *
 * For each summary child of the parent:
 * 1. Read rangeStart/rangeEnd from attrs (indexes into attached children)
 * 2. Compute the combined bounds of the range children
 * 3. Position the summary bracket/title adjacent to those bounds
 *
 * @returns Map from summary node id to its computed { x, y }
 */
export function layoutSummaries(
  parent: NodeDesc,
  attachedChildren: readonly NodeDesc[],
  childPositions: Map<string, ChildBounds>,
  direction: Direction,
  sizeMap: Map<string, NodeSize>,
): Map<string, { x: number; y: number }> {
  const result = new Map<string, { x: number; y: number }>()
  const summaries = getSummaryChildren(parent)
  if (summaries.length === 0) return result

  const childCount = attachedChildren.length
  if (childCount === 0) return result

  const h = isHorizontal(direction)
  const pad = SUMMARY_PADDING_WITH_TOPIC

  for (const summary of summaries) {
    const summarySize = sizeMap.get(summary.id)
    if (!summarySize) continue

    const { rangeStart, rangeEnd } = getSummaryRange(summary, childCount)
    const rangeChildren = attachedChildren.slice(rangeStart, rangeEnd + 1)
    const bounds = computeRangeBounds(rangeChildren, childPositions)
    if (!bounds) continue

    let x: number
    let y: number

    if (h) {
      // Horizontal layout (right/left): children stack vertically
      // Summary bracket is on the side away from the parent
      const midY = (bounds.minY + bounds.maxY) / 2

      if (direction === 'right') {
        // Summary to the right of range children
        x = bounds.maxX + pad
      } else {
        // Summary to the left of range children
        x = bounds.minX - summarySize.width - pad
      }
      y = midY
    } else {
      // Vertical layout (down/up): children stack horizontally
      // Summary bracket is on the side away from the parent
      const midX = (bounds.minX + bounds.maxX) / 2

      if (direction === 'down') {
        // Summary below range children
        y = bounds.maxY + pad
      } else {
        // Summary above range children
        y = bounds.minY - summarySize.height - pad
      }
      x = midX
    }

    result.set(summary.id, { x, y })
  }

  return result
}

/**
 * Get summary children of a parent node.
 * Exported for use by layout algorithms to filter summaries from attached children.
 */
export { getSummaryChildren }
