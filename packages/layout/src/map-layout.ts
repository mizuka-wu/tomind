import type { NodeDesc } from '@tomind/schema'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'

const ATTACHED = 'attached'

interface BoundaryBounds {
  x: number
  y: number
  width: number
  height: number
}

function getTitle(node: NodeDesc): string {
  const title = node.attrs.title
  if (typeof title === 'string') return title
  if (Array.isArray(title)) {
    return title.map((u: { text?: string }) => u.text ?? '').join('')
  }
  return ''
}

function getFontSize(node: NodeDesc, styleEngine?: any, state?: any): number {
  if (styleEngine && state) {
    const resolved = styleEngine.computeStyle(state, node.id)
    if (resolved?.fontSize != null) {
      const value = resolved.fontSize
      if (typeof value === 'string') {
        const parsed = parseInt(value)
        return isNaN(parsed) ? 14 : parsed
      }
      if (typeof value === 'number') {
        return value
      }
    }
  }

  const style = node.attrs.style as Record<string, unknown> | undefined
  const fontSize = style?.fontSize
  if (typeof fontSize === 'string') {
    const parsed = parseInt(fontSize)
    return isNaN(parsed) ? 14 : parsed
  }
  if (typeof fontSize === 'number') {
    return fontSize
  }
  return 14
}

function isCollapsed(node: NodeDesc): boolean {
  return (node.attrs.collapsed as boolean) ?? false
}

function getAttachedChildren(node: NodeDesc): readonly NodeDesc[] {
  return node.children[ATTACHED] ?? []
}

function findRootTopic(doc: NodeDesc): NodeDesc | null {
  if (doc.type === 'topic' || doc.type === 'root') return doc
  const attached = getAttachedChildren(doc)
  if (attached.length > 0) return attached[0]
  for (const children of Object.values(doc.children)) {
    for (const child of children) {
      const found = findRootTopic(child)
      if (found) return found
    }
  }
  return null
}

interface NodeSize {
  width: number
  height: number
}

function measureNode(node: NodeDesc, options: LayoutOptions, styleEngine?: any, state?: any): NodeSize {
  const fontSize = getFontSize(node, styleEngine, state)
  const title = getTitle(node)
  const style = node.attrs.style as Record<string, unknown> | undefined
  const fontFamily = (style?.fontFamily as string) || 'NeverMind, Microsoft YaHei, PingFang SC, Microsoft JhengHei'
  const fontWeight = (style?.fontWeight as string | number) || 'normal'
  const fontStyle = (style?.fontStyle as string) || 'normal'
  const { width, height } = measureTextSize(title, fontSize, options, fontFamily, fontWeight, fontStyle)
  return {
    width: width + options.nodePadding.left + options.nodePadding.right,
    height: height + options.nodePadding.top + options.nodePadding.bottom,
  }
}

function measureSubtree(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: any, state?: any): void {
  sizeMap.set(node.id, measureNode(node, options, styleEngine, state))
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureSubtree(child, options, sizeMap, styleEngine, state)
    }
  }
}

function getMinSumTopicSpacing(children: readonly NodeDesc[], parentHeight: number, sizeMap: Map<string, NodeSize>, options: LayoutOptions, styleEngine?: any, state?: any): number {
  const minTopBottomSpacing = 80
  const maxTopBottomSpacing = 180
  const parentTopicThreshold = 230

  let topBottomSpacing = minTopBottomSpacing
  if (parentHeight > parentTopicThreshold) {
    topBottomSpacing = Math.min(
      maxTopBottomSpacing,
      parentHeight - parentTopicThreshold + minTopBottomSpacing,
    )
  }

  const n = children.length
  if (n <= 2) {
    return topBottomSpacing
  }

  // 计算子节点实际排列高度（不包括父节点高度）
  let childrenTotalHeight = 0
  for (let i = 0; i < n; i++) {
    childrenTotalHeight += subtreeHeight(children[i], options, sizeMap, styleEngine, state)
    if (i < n - 1) {
      childrenTotalHeight += getSpacingMinor(children[i], options, styleEngine, state)
    }
  }

  // SB 公式: minSumTopicSpacing = topBottomSpacing - Σ(interior children height)
  // 但需要确保 minSumTopicSpacing >= 0
  let sumSpacing = topBottomSpacing
  for (let i = 0; i < n; i++) {
    if (i !== 0 && i !== n - 1) {
      sumSpacing -= subtreeHeight(children[i], options, sizeMap, styleEngine, state)
    }
  }

  return Math.max(0, sumSpacing)
}

function computeBoundaryBounds(
  node: NodeDesc,
  nodes: Map<string, { x: number; y: number; width: number; height: number }>,
  boundaryBoundsMap: Map<string, BoundaryBounds>,
): BoundaryBounds {
  const nl = nodes.get(node.id)
  if (!nl) return { x: 0, y: 0, width: 0, height: 0 }

  // 子树边界框（绝对坐标）
  let minX = nl.x
  let minY = nl.y
  let maxX = nl.x + nl.width
  let maxY = nl.y + nl.height

  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      const childBounds = computeBoundaryBounds(child, nodes, boundaryBoundsMap)
      // childBounds 是相对于 child 原点的偏移，需要转换为绝对坐标
      const childNode = nodes.get(child.id)!
      const childAbsX = childNode.x + childBounds.x
      const childAbsY = childNode.y + childBounds.y
      minX = Math.min(minX, childAbsX)
      minY = Math.min(minY, childAbsY)
      maxX = Math.max(maxX, childAbsX + childBounds.width)
      maxY = Math.max(maxY, childAbsY + childBounds.height)
    }
  }

  // 返回相对于节点原点的偏移
  const bounds: BoundaryBounds = {
    x: minX - nl.x,
    y: minY - nl.y,
    width: maxX - minX,
    height: maxY - minY,
  }
  boundaryBoundsMap.set(node.id, bounds)
  return bounds
}

function subtreeHeight(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: any, state?: any): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.height
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.height

  let total = 0
  for (let i = 0; i < children.length; i++) {
    total += subtreeHeight(children[i], options, sizeMap, styleEngine, state)
    if (i < children.length - 1) {
      const spacingMinor = getSpacingMinor(children[i], options, styleEngine, state)
      total += spacingMinor
    }
  }
  // 返回父节点高度 + 子节点实际排列高度
  // 这与 SB 的 boundaryBounds.height 一致
  return size.height + total
}

function getWeight(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: any, state?: any): number {
  return subtreeHeight(node, options, sizeMap, styleEngine, state) + 30
}

function isWithinThreshold(node: NodeDesc, totalChildren: number, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: any, state?: any): boolean {
  return getWeight(node, options, sizeMap, styleEngine, state) < (Math.log(totalChildren) + 1) * 200
}

function calcNumRight(children: readonly NodeDesc[], options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: any, state?: any): number {
  if (children.length <= 1) return children.length

  const totalWeight = children.reduce((sum, child) => sum + getWeight(child, options, sizeMap, styleEngine, state), 0)
  const halfWeight = totalWeight / 2

  let rightWeight = 0
  let lastIndex = -1

  for (let i = 0; i < children.length; i++) {
    const weight = getWeight(children[i], options, sizeMap, styleEngine, state)
    const newRightWeight = rightWeight + weight

    if (newRightWeight >= halfWeight) {
      if (lastIndex >= 0 && newRightWeight - halfWeight > halfWeight - rightWeight) {
        // SB 特殊处理：2 个节点且都在阈值内时返回 2
        if (i === 1 && lastIndex === 0 &&
            isWithinThreshold(children[0], children.length, options, sizeMap, styleEngine, state) &&
            isWithinThreshold(children[i], children.length, options, sizeMap, styleEngine, state)) {
          return 2
        }
        return lastIndex + 1
      }
      return i + 1
    }

    rightWeight = newRightWeight
    lastIndex = i
  }

  return children.length
}

function getSpacingMinor(node: NodeDesc, options: LayoutOptions, styleEngine?: any, state?: any): number {
  if (styleEngine && state) {
    const resolved = styleEngine.computeStyle(state, node.id)
    if (resolved?.spacingMinor != null) {
      const value = resolved.spacingMinor
      if (typeof value === 'string') {
        const parsed = parseInt(value)
        return isNaN(parsed) ? options.verticalGap : parsed
      }
      if (typeof value === 'number') {
        return value
      }
    }
  }

  const style = node.attrs.style as Record<string, unknown> | undefined
  const spacingMinor = style?.spacingMinor
  if (typeof spacingMinor === 'string') {
    const parsed = parseInt(spacingMinor)
    return isNaN(parsed) ? options.verticalGap : parsed
  }
  if (typeof spacingMinor === 'number') {
    return spacingMinor
  }
  return options.verticalGap
}

function getSpacingMajor(node: NodeDesc, options: LayoutOptions, styleEngine?: any, state?: any): number {
  if (styleEngine && state) {
    const resolved = styleEngine.computeStyle(state, node.id)
    if (resolved?.spacingMajor != null) {
      const value = resolved.spacingMajor
      if (typeof value === 'string') {
        const parsed = parseInt(value)
        return isNaN(parsed) ? options.horizontalGap : parsed
      }
      if (typeof value === 'number') {
        return value
      }
    }
  }

  const style = node.attrs.style as Record<string, unknown> | undefined
  const spacingMajor = style?.spacingMajor
  if (typeof spacingMajor === 'string') {
    const parsed = parseInt(spacingMajor)
    return isNaN(parsed) ? options.horizontalGap : parsed
  }
  if (typeof spacingMajor === 'number') {
    return spacingMajor
  }
  return options.horizontalGap
}

function layoutSideChildren(
  children: readonly NodeDesc[],
  startX: number,
  startY: number,
  parentHeight: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
  boundaryBoundsMap?: Map<string, BoundaryBounds>,
  styleEngine?: any,
  state?: any,
): void {
  if (children.length === 0) return

  const minSumTopicSpacing = getMinSumTopicSpacing(children, parentHeight, sizeMap, options, styleEngine, state)
  let sumTopicSpacing = minSumTopicSpacing

  const yPosRelativeToFirstChild = [0]
  for (let i = 1; i < children.length; i++) {
    const pre = children[i - 1]
    const now = children[i]
    const nowSize = sizeMap.get(now.id)!

    const gap1 = getSpacingMinor(now, options, styleEngine, state)
    const gap2 = sumTopicSpacing / (children.length - i)

    // 使用 boundaryBounds 计算间距（如果可用）
    if (boundaryBoundsMap) {
      const preBounds = boundaryBoundsMap.get(pre.id)
      const nowBounds = boundaryBoundsMap.get(now.id)
      if (preBounds && nowBounds) {
        // 使用节点的实际位置计算间距
        const preNode = nodes.get(pre.id)
        const nowNode = nodes.get(now.id)
        if (preNode && nowNode) {
          // pre 子树底部的绝对 Y 坐标
          const preBottomY = preNode.y + preBounds.y + preBounds.height
          // now 子树顶部的绝对 Y 坐标
          const nowTopY = nowNode.y + nowBounds.y
          // 间距 = now 子树顶部 - pre 子树底部 + spacingMinor
          const gap = nowTopY - preBottomY + gap1
          yPosRelativeToFirstChild[i] = Math.max(
            yPosRelativeToFirstChild[i - 1] + gap,
            yPosRelativeToFirstChild[i - 1] + nowSize.height + gap2,
          )
        } else {
          const preSubtreeH = subtreeHeight(pre, options, sizeMap, styleEngine, state)
          yPosRelativeToFirstChild[i] = Math.max(
            yPosRelativeToFirstChild[i - 1] + preSubtreeH + gap1,
            yPosRelativeToFirstChild[i - 1] + nowSize.height + gap2,
          )
        }
      } else {
        const preSubtreeH = subtreeHeight(pre, options, sizeMap, styleEngine, state)
        yPosRelativeToFirstChild[i] = Math.max(
          yPosRelativeToFirstChild[i - 1] + preSubtreeH + gap1,
          yPosRelativeToFirstChild[i - 1] + nowSize.height + gap2,
        )
      }
    } else {
      const preSubtreeH = subtreeHeight(pre, options, sizeMap, styleEngine, state)
      yPosRelativeToFirstChild[i] = Math.max(
        yPosRelativeToFirstChild[i - 1] + preSubtreeH + gap1,
        yPosRelativeToFirstChild[i - 1] + nowSize.height + gap2,
      )
    }

    sumTopicSpacing -= (yPosRelativeToFirstChild[i] - yPosRelativeToFirstChild[i - 1] - subtreeHeight(pre, options, sizeMap, styleEngine, state))
  }

  const lastChildSize = sizeMap.get(children[children.length - 1].id)!
  const totalH = yPosRelativeToFirstChild[children.length - 1] + lastChildSize.height
  const firstChildY = -totalH / 2

  // posYoffsetToClosestChild — 对齐离父节点中心最近的子节点
  // 只在子节点数 >= 3 且偏移量在阈值内时应用
  let posYoffsetToClosestChild = 0
  if (children.length >= 3) {
    const childrenHeight = totalH
    const maxOffset = Math.min(30, childrenHeight * 0.15)
    let minAbsOffset = Infinity

    for (let i = 0; i < children.length; i++) {
      const size = sizeMap.get(children[i].id)!
      const cy = firstChildY + yPosRelativeToFirstChild[i]
      const childCenterY = cy + size.height / 2
      const offset = childCenterY

      if (Math.abs(offset) < Math.abs(minAbsOffset)) {
        minAbsOffset = offset
      }
    }

    if (Math.abs(minAbsOffset) < maxOffset) {
      posYoffsetToClosestChild = minAbsOffset
    }
  }

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const size = sizeMap.get(child.id)!
    const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(child), getFontSize(child, styleEngine, state), options)
    const cy = startY + firstChildY + yPosRelativeToFirstChild[i] - posYoffsetToClosestChild + size.height / 2
    nodes.set(child.id, { x: startX, y: cy, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height })
    layoutSubtree(child, startX, cy, options, sizeMap, nodes, boundaryBoundsMap, styleEngine, state)
  }
}

function layoutSubtree(
  node: NodeDesc,
  x: number,
  y: number,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>,
  boundaryBoundsMap?: Map<string, BoundaryBounds>,
  styleEngine?: any,
  state?: any,
): void {
  const size = sizeMap.get(node.id)!
  const { width: titleWidth, height: titleHeight } = measureTextSize(getTitle(node), getFontSize(node, styleEngine, state), options)

  if (isCollapsed(node)) {
    nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height })
    return
  }
  const children = getAttachedChildren(node)
  if (children.length === 0) {
    nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: size.height })
    return
  }

  const numRight = calcNumRight(children, options, sizeMap, styleEngine, state)
  const spacingMajor = getSpacingMajor(node, options, styleEngine, state)
  const spacingMinor = getSpacingMinor(node, options, styleEngine, state)

  const rightChildren = children.slice(0, numRight)
  // 左侧子节点反转以实现顺时针缠绕：index pos 在底部，index n-1 在顶部
  const leftChildren = children.slice(numRight).reverse()

  const rightSpacingMinor = rightChildren.length > 0 ? getSpacingMinor(rightChildren[0], options, styleEngine, state) : spacingMinor
  const leftSpacingMinor = leftChildren.length > 0 ? getSpacingMinor(leftChildren[0], options, styleEngine, state) : spacingMinor
  const rightTotalH = rightChildren.reduce((sum, child) => sum + subtreeHeight(child, options, sizeMap, styleEngine, state), 0) + Math.max(0, rightChildren.length - 1) * rightSpacingMinor
  const leftTotalH = leftChildren.reduce((sum, child) => sum + subtreeHeight(child, options, sizeMap, styleEngine, state), 0) + Math.max(0, leftChildren.length - 1) * leftSpacingMinor

  nodes.set(node.id, { x, y, width: size.width, height: size.height, titleWidth, titleHeight, branchHeight: Math.max(rightTotalH, leftTotalH) })

  if (rightChildren.length > 0) {
    const childX = x + size.width + spacingMajor
    const childY = y + size.height / 2
    layoutSideChildren(rightChildren, childX, childY, size.height, options, sizeMap, nodes, boundaryBoundsMap, styleEngine, state)
  }

  if (leftChildren.length > 0) {
    const maxLeftWidth = leftChildren.reduce((max, child) => {
      const childSize = sizeMap.get(child.id)!
      return Math.max(max, childSize.width)
    }, 0)
    const childX = x - maxLeftWidth - spacingMajor
    const childY = y + size.height / 2
    layoutSideChildren(leftChildren, childX, childY, size.height, options, sizeMap, nodes, boundaryBoundsMap, styleEngine, state)
  }
}

export const mapClockwiseLayoutAlgorithm: LayoutAlgorithm = {
  name: 'map-clockwise',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine?: any, state?: any): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap, styleEngine, state)

    const rootX = 0
    const rootY = 0

    // 第一遍：用当前逻辑计算位置
    layoutSubtree(root, rootX, rootY, options, sizeMap, nodes, undefined, styleEngine, state)

    // 计算 boundaryBounds（子树边界框）
    const boundaryBoundsMap = new Map<string, BoundaryBounds>()
    computeBoundaryBounds(root, nodes, boundaryBoundsMap)

    // 第二遍：用 boundaryBounds 重新计算位置
    const nodes2 = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number }>()
    layoutSubtree(root, rootX, rootY, options, sizeMap, nodes2, boundaryBoundsMap, styleEngine, state)

    let minX = Infinity, minY = Infinity
    for (const l of nodes2.values()) {
      minX = Math.min(minX, l.x)
      minY = Math.min(minY, l.y)
    }

    for (const l of nodes2.values()) {
      l.x -= minX
      l.y -= minY
    }

    let maxX = 0, maxY = 0
    for (const l of nodes2.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    return { nodes: nodes2, totalWidth: maxX, totalHeight: maxY }
  },
}
