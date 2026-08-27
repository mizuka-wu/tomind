/**
 * Standalone snowbrush map layout reference implementation
 *
 * Reimplements the core snowbrush MAP / MAPCLOCKWISE layout algorithm
 * using simple data structures, so it can be called from tests without
 * bootstrapping the full snowbrush runtime (backbone, jQuery, SVG, etc.).
 *
 * Source files referenced:
 *   - structures/basemap.ts   (calcNumRight, calSidePos, getMinSumTopicSpacing, getWeight)
 *   - structures/mapclockwise.ts (mapClockwise structure)
 *   - structures/helper/layoutstyleoptimization.ts (calcOutwardDistanceByAttachedChildren)
 *   - utils/layoutconstant.ts (PADDING, LINECOLPOS, etc.)
 */

// ─── Constants (from snowbrush utils/layoutconstant.ts) ───

const PADDING = 20
const LINECOLPOS = 13

// ─── Constants (from snowbrush structures/basemap.ts) ───

const minTopBottomSpacing = 80
const maxTopBottomSpacing = 180
const parentTopicThreshold = 230

// ─── Types ───

export interface RefNode {
  id: string
  title: string
  fontSize: number
  children: RefNode[]
}

export interface RefNodeLayout {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface RefLayoutResult {
  nodes: Map<string, RefNodeLayout>
  numRight: number
}

// ─── Text measurement (matches tomind's character-width fallback) ───

const SNOWBRUSH_FONT_FAMILY = "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif"

function measureTextSize(
  text: string,
  fontSize: number,
  charWidthFactor = 0.8,
  lineHeight = 1.34,
  maxWidth = 300,
): { width: number; height: number } {
  if (!text) return { width: 0, height: 0 }

  const preFontSize = fontSize
  let ratio = 1
  if (fontSize < 12) {
    ratio = fontSize / 12
    fontSize = 12
  }

  const charWidth = fontSize * charWidthFactor
  const measureFn = (t: string) => t.length * charWidth

  const rawLines = text.split('\n')
  const wrappedLines: string[] = []

  for (const line of rawLines) {
    if (measureFn(line) <= maxWidth) {
      wrappedLines.push(line)
    } else {
      let current = ''
      for (const char of line) {
        const test = current + char
        if (measureFn(test) > maxWidth && current) {
          wrappedLines.push(current)
          current = char
        } else {
          current = test
        }
      }
      if (current) wrappedLines.push(current)
    }
  }

  const lineWidths = wrappedLines.map(line => measureFn(line))
  const width = Math.max(...lineWidths) * ratio
  const height = wrappedLines.length * Math.floor(preFontSize * lineHeight)

  return { width: Math.ceil(width), height: Math.ceil(height) }
}

function measureNodeSize(node: RefNode): { width: number; height: number } {
  const { width: titleWidth, height: titleHeight } = measureTextSize(node.title, node.fontSize)
  return {
    width: titleWidth + 6 + 6, // nodePadding left=6, right=6 (matches tomind DEFAULT_LAYOUT_OPTIONS)
    height: titleHeight + 5 + 5, // nodePadding top=5, bottom=5
  }
}

// ─── Core snowbrush algorithms ───

/**
 * getWeight — from basemap.ts line 145-147
 * weight = boundaryBounds.height + (PADDING / 2) * 3
 */
function getWeight(nodeHeight: number): number {
  return nodeHeight + (PADDING / 2) * 3
}

/**
 * calcNumRight — from basemap.ts lines 83-137
 * Weight-based left/right split with threshold logic.
 *
 * Simplified version: no boundary/summary range checks (isInSameRange),
 * no numRightInDraging override.
 */
function calcNumRight(
  children: { height: number }[],
): number {
  const length = children.length
  if (length <= 1) return length

  let totalWeight = 0
  for (const child of children) {
    totalWeight += getWeight(child.height)
  }

  const halfWeight = totalWeight / 2
  let rightWeight = 0
  let blockWeight = 0

  for (let index = 0; index < length; index++) {
    blockWeight += getWeight(children[index].height)
    const num = index + 1
    // Simplified: no isInSameRangeWithLast check (no boundaries in test)
    const newRightWeight = rightWeight + blockWeight
    if (newRightWeight >= halfWeight) {
      if (newRightWeight - halfWeight > halfWeight - rightWeight && index > 0) {
        return index
      }
      return num
    }
    rightWeight = newRightWeight
    blockWeight = 0
  }

  return length
}

/**
 * getMinSumTopicSpacing — from basemap.ts lines 334-356
 * Adaptive vertical spacing based on parent topic height.
 */
function getMinSumTopicSpacing(
  children: { height: number }[],
  parentHeight: number,
): number {
  let topBottomSpacing = minTopBottomSpacing
  if (parentHeight > parentTopicThreshold) {
    topBottomSpacing = Math.min(
      maxTopBottomSpacing,
      parentHeight - parentTopicThreshold + topBottomSpacing,
    )
  }

  const n = children.length
  if (n <= 2) return topBottomSpacing

  // sumSpacing = topBottomSpacing - sum(middle children heights)
  let sumSpacing = topBottomSpacing
  for (let i = 1; i < n - 1; i++) {
    sumSpacing -= children[i].height
  }
  return sumSpacing
}

/**
 * calcSpacingMajor — from mapclockwise.ts (uses baseMap.calcSpacingMajor)
 * For map-clockwise with default fold line style:
 *   LINECOLPOS * 3 = 13 * 3 = 39
 * For other line styles (abstractstructure default):
 *   majorSpacing + patch
 *
 * We use the fold-line default (39) since that's the common case.
 */
function calcSpacingMajor(): number {
  return LINECOLPOS * 3
}

/**
 * calcOutwardDistanceByAttachedChildren — from layoutstyleoptimization.ts
 * Fan-out distance when there are many children.
 */
function calcOutwardDistance(children: { height: number }[]): number {
  const CHILDREN_COUNT_LIMIT = 8
  const K = 0.15
  const MIN = 400
  const MAX = 800

  if (children.length < CHILDREN_COUNT_LIMIT) return 0

  const totalHeight = children.reduce((sum, c) => sum + c.height, 0)
  if (totalHeight <= MIN) return 0
  return K * (Math.min(totalHeight, MAX) - MIN)
}

/**
 * calSidePos — from basemap.ts lines 168-315
 * Core positioning algorithm for one side (left or right).
 *
 * Simplified version for nodes without boundaries:
 *   - boundaryBounds.y = 0, boundaryBounds.height = node height
 *   - topicView.bounds.y = 0, topicView.bounds.height = node height
 *   - No posXoffsetToClosestChild adjustment (rendering-specific)
 *   - No freePositionBranch handling
 */
function calSidePos(
  side: 'right' | 'left',
  children: RefNode[],
  sizeMap: Map<string, { width: number; height: number }>,
  spacingMajor: number,
  spacingMinor: number,
  parentBounds: { x: number; y: number; width: number; height: number },
  isUpToDown: boolean,
  offsetX: number,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()
  const n = children.length
  if (n === 0) return positions

  const childSizes = children.map(c => sizeMap.get(c.id)!)
  const minSumTopicSpacing = getMinSumTopicSpacing(childSizes, parentBounds.height)
  let sumTopicSpacing = minSumTopicSpacing

  // Calculate Y positions relative to first child
  // For simple nodes: boundaryBounds.y = 0, topicView.bounds.y = 0
  const yPosRelativeToFirstChild: number[] = [0]

  for (let index = 1; index < n; index++) {
    const preSize = childSizes[index - 1]
    const nowSize = childSizes[index]

    // Two constraints:
    // 1. boundary gap: prev bottom + spacingMinor
    // 2. topic gap: prev topic bottom + distributed remaining spacing
    const boundaryConstraint =
      yPosRelativeToFirstChild[index - 1] + 0 + preSize.height + spacingMinor - 0
    const topicConstraint =
      yPosRelativeToFirstChild[index - 1] + 0 + preSize.height + sumTopicSpacing / (n - index) - 0

    yPosRelativeToFirstChild[index] = Math.max(boundaryConstraint, topicConstraint)

    // Update remaining spacing
    const usedSpacing =
      yPosRelativeToFirstChild[index] - (yPosRelativeToFirstChild[index - 1] + preSize.height)
    sumTopicSpacing -= usedSpacing
  }

  // Calculate parent Y position relative to first child
  // firstChildEndPosY and lastChildEndPosY represent the connection anchor points
  // For simple nodes without boundaries, these are the center of the topic's edge
  const firstChildSize = childSizes[0]
  const lastChildSize = childSizes[n - 1]
  const firstChildEndPosY = firstChildSize.height / 2
  const lastChildEndPosY = lastChildSize.height / 2

  const parentPosRelativeToFirstChild =
    (firstChildEndPosY +
      yPosRelativeToFirstChild[0] +
      lastChildEndPosY +
      yPosRelativeToFirstChild[n - 1]) /
    2

  let firstChildY: number
  if (children[0] === children[n - 1]) {
    // Only one child
    firstChildY =
      ((isUpToDown ? -1 : 1) * minSumTopicSpacing) / 2 -
      0 -
      (isUpToDown ? 1 : 0) * firstChildSize.height
  } else {
    firstChildY = -parentPosRelativeToFirstChild
  }

  // Calculate X position
  let x: number
  if (side === 'left') {
    // For left side, x is the right edge of the child
    x = parentBounds.x - spacingMajor
  } else {
    // For right side, x is the left edge of the child
    x = parentBounds.x + parentBounds.width + spacingMajor
  }

  // Position each child
  for (let index = 0; index < n; index++) {
    const child = children[index]
    const size = childSizes[index]
    const y = firstChildY + yPosRelativeToFirstChild[index]

    let posX: number
    if (side === 'left') {
      posX = x + 0 - offsetX // topicView.bounds.x = 0 for simple nodes
    } else {
      posX = x - 0 + offsetX // topicView.bounds.x = 0 for simple nodes
    }

    positions.set(child.id, { x: posX, y })
  }

  return positions
}

// ─── Main layout function ───

/**
 * Run snowbrush's map-clockwise layout algorithm on a tree of RefNodes.
 *
 * This replicates the behavior of snowbrush's mapClockwise structure
 * (structures/mapclockwise.ts + structures/basemap.ts).
 */
export function runSnowbrushMapLayout(root: RefNode): RefLayoutResult {
  // Step 1: Measure all nodes
  const sizeMap = new Map<string, { width: number; height: number }>()
  function measureAll(node: RefNode) {
    sizeMap.set(node.id, measureNodeSize(node))
    for (const child of node.children) {
      measureAll(child)
    }
  }
  measureAll(root)

  // Step 2: Layout the root at (0, 0)
  const rootSize = sizeMap.get(root.id)!
  const nodes = new Map<string, RefNodeLayout>()
  nodes.set(root.id, {
    id: root.id,
    x: 0,
    y: 0,
    width: rootSize.width,
    height: rootSize.height,
  })

  if (root.children.length === 0) {
    return { nodes, numRight: 0 }
  }

  // Step 3: Calculate numRight (left/right split)
  const childSizes = root.children.map(c => sizeMap.get(c.id)!)
  const numRightCalc = calcNumRight(childSizes)

  // mapClockwise: left children are reversed
  const rightChildren = root.children.slice(0, numRightCalc)
  const leftChildren = root.children.slice(numRightCalc).reverse()

  // Step 4: Calculate spacing
  const spacingMajor = calcSpacingMajor()
  const spacingMinor = 0 // default minorSpacing

  // Step 5: Calculate outward distance
  const outwardOffsetRight = calcOutwardDistance(
    rightChildren.map(c => sizeMap.get(c.id)!),
  )
  const outwardOffsetLeft = calcOutwardDistance(
    leftChildren.map(c => sizeMap.get(c.id)!),
  )

  // Step 6: Layout right side children
  const rootBounds = { x: 0, y: 0, width: rootSize.width, height: rootSize.height }

  if (rightChildren.length > 0) {
    const rightPositions = calSidePos(
      'right',
      rightChildren,
      sizeMap,
      spacingMajor,
      spacingMinor,
      rootBounds,
      true, // isUpToDown
      outwardOffsetRight,
    )
    for (const [id, pos] of rightPositions) {
      const size = sizeMap.get(id)!
      nodes.set(id, { id, x: pos.x, y: pos.y, width: size.width, height: size.height })
    }
  }

  // Step 7: Layout left side children
  if (leftChildren.length > 0) {
    const leftPositions = calSidePos(
      'left',
      leftChildren,
      sizeMap,
      spacingMajor,
      spacingMinor,
      rootBounds,
      false, // isUpToDown = false for left side in mapClockwise
      outwardOffsetLeft,
    )
    for (const [id, pos] of leftPositions) {
      const size = sizeMap.get(id)!
      nodes.set(id, { id, x: pos.x, y: pos.y, width: size.width, height: size.height })
    }
  }

  // Step 8: Normalize positions (shift so min x/y = 0)
  let minX = Infinity
  let minY = Infinity
  for (const n of nodes.values()) {
    minX = Math.min(minX, n.x)
    minY = Math.min(minY, n.y)
  }
  for (const n of nodes.values()) {
    n.x -= minX
    n.y -= minY
  }

  return { nodes, numRight: numRightCalc }
}
