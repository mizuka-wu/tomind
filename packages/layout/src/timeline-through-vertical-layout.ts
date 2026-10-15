/**
 * Timeline Through Vertical 布局 — 穿透垂直时间线
 *
 * 精确移植 snowbrush `structures/timelinethroughvertical.ts`：
 *
 * 1. 子结构 = `getChildStructure` → `getFinalTimelineChildDirection(parent, index)`
 *    从 **LEFT** 起交替（有 boundary/summary 分组时 SB 用 inSameRangeWithPreviousChild
 *    保持同侧，两侧都还没实现 —— 与 timeline-horizontal 的现状一致）。
 *    所以轴子节点整棵子树按 logic.left / logic.right 长（委派 layoutLogicSubtree）。
 * 2. 轴上定位 = `calAttachedChildrenPos` 的双约束递推（**所有轴节点 x 相同**）：
 *      x = prevPosX + getBasePoint(prev, DOWN).x - getBasePoint(prev, UP).x
 *        = prevPosX（AbstractTopicShape.getBasePoint 的 x 恒为 0，见 getJointPosition）
 *      offsetYOfTopics = prevBaseDownY + TOPIC_SPACING - currBoundsY
 *      offsetYOfBounds = prevBaseDownY + prevBoundsHeight + prevBoundsY - currBoundsY
 *      y = prevPosY + max(offsetYOfBounds, offsetYOfTopics)
 *    其中 index === 1 时 prevBounds 取 **父的 topicView.shapeBounds**，
 *    index > 1 时取 prev.boundaryBounds；currBoundsY 恒为 current.boundaryBounds.y。
 * 3. `TOPIC_SPACING = getTopicSpacing(parentBranch)`：
 *      parseInt(spacingMinor) × designPadding(centralTopic 60 / 其他 36)
 *        ÷ parseInt(defaultStyles.spacingMinor(className)) + getLineEndSpacingPatchGap(parent)
 *    轴节点自己的结构类就是 timeline.through.vertical → isTimelineThroughStructure 为真
 *    → 线尾补丁用 LINE_TIMELINE_THROUGH_SPACING(4)（实测 root: 3×4+4 = 16，topicSpacing 76）。
 *
 * 旧实现是「交替左右 + DESIGN_PADDING=10 常量 + options.horizontalGap」的近似：
 * 轴节点被左右错开（SB 全在同一条竖线上）、间距用错常量、测量用 measureSimpleSubtree
 * （读不到样式 margin → 每个盒窄 12px）。实测 test-arrow-through-vertical
 * avgΔX 236.6 / avgΔY 362 / avgΔW 14.9 / avgΔH 11.9，234/235 个节点错位。
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import { DEFAULT_STYLES, classifyNode } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions, NodeLayout } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS, measureTextSize } from './layout-engine'
import { getTitle, getFontSize, isCollapsed, getAttachedChildren, findRootTopic } from './layout-utils'
import { measureStyledSubtree, getLineEndSpacingPatchGap, hasLineEndArrow } from './spacing-utils'
import { layoutLogicSubtree } from './logic-layout'

type NodeSize = import('./layout-utils').SimpleNodeSize

/** SB timelinethroughvertical.getTopicSpacing 的 designPadding：中央主题 60，其他 36 */
const DESIGN_PADDING_CENTRAL = 60
const DESIGN_PADDING_OTHER = 36

/** SB 用 `parseInt(styleValue)`（"35pt" → 35），不是 parseFloat */
function parseIntStyle(value: unknown, fallback: number): number {
  if (typeof value === 'number') return Math.trunc(value)
  if (typeof value === 'string') {
    const n = parseInt(value, 10)
    return Number.isNaN(n) ? fallback : n
  }
  return fallback
}

/** SB `defaultStyles.getStyleValue(className, SPACING_MINOR)` */
function getDefaultSpacingMinor(state: SheetState | null, node: NodeDesc): number {
  if (!state) return 8
  const cls = classifyNode(state.doc, node.id)
  const entry = (DEFAULT_STYLES as Record<string, Record<string, unknown>>)[cls]
  return parseIntStyle(entry?.spacingMinor, 8)
}

/**
 * SB `timelinethroughvertical.getTopicSpacing(parentBranch)`。
 * 轴节点的结构类是 timeline.through.vertical → isTimelineThrough = true → 补丁常量用 4。
 */
function getTopicSpacing(node: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null): number {
  const className = state ? classifyNode(state.doc, node.id) : 'centralTopic'
  const designPadding = className === 'centralTopic' ? DESIGN_PADDING_CENTRAL : DESIGN_PADDING_OTHER
  const spacingMinor = styleEngine && state
    ? parseIntStyle(styleEngine.getStyleValue(state, node.id, 'spacingMinor'), 0)
    : 0
  const defaultSpacingMinor = getDefaultSpacingMinor(state, node) || 1
  const lineEndSpacing = styleEngine && state
    ? getLineEndSpacingPatchGap({
      isTimelineThrough: true,
      hasArrow: hasLineEndArrow(styleEngine.getStyleValue(state, node.id, 'arrowEndClass')),
      lineWidth: parseIntStyle(styleEngine.getStyleValue(state, node.id, 'lineWidth'), 0),
    })
    : 0
  return (spacingMinor * designPadding) / defaultSpacingMinor + lineEndSpacing
}

/** 主题盒原点（shape 中心）到盒顶的距离；part-blind 时退回 height/2 */
const originYOf = (s: NodeSize): number => s.originY ?? s.height / 2

interface ThroughProv {
  nodes: Map<string, NodeLayout>
  /** 委派子树的包围盒（相对 child 原点：X 相对盒中心、Y 相对 shape 中心）= SB boundaryBounds */
  bb: { x: number; y: number; width: number; height: number }
  own: NodeLayout
  originY: number
}

export const timelineThroughVerticalLayoutAlgorithm: LayoutAlgorithm = {
  name: 'timeline-through-vertical',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, NodeLayout>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureStyledSubtree(root, options, sizeMap, 'horizontal', styleEngine, state)

    // 先把根放在自己的原点上（原点 = shape 中心；盒左上 = (-w/2, -originY)），最后统一平移到正数区
    const rootSize = sizeMap.get(root.id)!
    const rootW = rootSize.width
    const rootH = rootSize.height
    const rootOriginY = originYOf(rootSize)
    const rootTitle = measureTextSize(getTitle(root), getFontSize(root, styleEngine, state), options)
    nodes.set(root.id, {
      x: -rootW / 2,
      y: -rootOriginY,
      width: rootW,
      height: rootH,
      titleWidth: rootSize.titleWidth ?? rootTitle.width,
      titleHeight: rootSize.titleHeight ?? rootTitle.height,
      branchHeight: rootH,
      partBounds: rootSize.partBounds,
    })

    const children = isCollapsed(root) ? [] : getAttachedChildren(root)
    if (children.length === 0) {
      return { nodes, totalWidth: rootW, totalHeight: rootH }
    }

    const TOPIC_SPACING = getTopicSpacing(root, styleEngine, state)

    // 轴子节点的子树整棵委派 logic（side 从 LEFT 起交替，SB getFinalTimelineChildDirection）
    const provs: ThroughProv[] = children.map((child, i) => {
      const side: 'left' | 'right' = i % 2 === 0 ? 'left' : 'right'
      const res = layoutLogicSubtree(child, 0, 0, options, styleEngine, state, side)
      const own = res.nodes.get(child.id)!
      return {
        nodes: res.nodes,
        bb: { x: res.bbX, y: res.bb.y, width: res.bbW, height: res.bb.height },
        own,
        originY: res.originY,
      }
    })

    // SB posList 递推（index 0 是父分支自己，位置 (0,0)）
    let prevPosX = 0
    let prevPosY = 0
    // getBasePoint(prev, DOWN).y = shapeBounds.y + shapeBounds.height = -originY + shapeHeight = originY
    let prevBaseDownY = rootOriginY
    // index === 1 时 prevBounds 用父的 topicView.shapeBounds：y = -originY、height = shapeHeight = 2×originY
    let prevBoundsY = -rootOriginY
    let prevBoundsH = 2 * rootOriginY

    for (let i = 0; i < provs.length; i++) {
      const p = provs[i]
      if (i > 0) {
        const prev = provs[i - 1]
        prevBaseDownY = prev.originY
        prevBoundsY = prev.bb.y
        prevBoundsH = prev.bb.height
      }
      const currBoundsY = p.bb.y
      // getBasePoint(prev, DOWN).x 与 getBasePoint(prev, UP).x 都是 0 → x 恒等于 prevPosX
      const posX = prevPosX
      const offsetYOfTopics = prevBaseDownY + TOPIC_SPACING - currBoundsY
      const offsetYOfBounds = prevBaseDownY + prevBoundsH + prevBoundsY - currBoundsY
      const posY = prevPosY + Math.max(offsetYOfBounds, offsetYOfTopics)

      // 把子树从局部帧（own 盒左上在 (0, -originY)）平移到「原点在 (posX, posY)」
      const dx = (posX - p.own.width / 2) - p.own.x
      const dy = posY - (p.own.y + p.originY)
      for (const [id, nl] of p.nodes) {
        nodes.set(id, { ...nl, x: nl.x + dx, y: nl.y + dy })
      }

      prevPosX = posX
      prevPosY = posY
    }

    // 平移到正数区
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const l of nodes.values()) {
      minX = Math.min(minX, l.x)
      minY = Math.min(minY, l.y)
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }
    const ox = minX < 0 ? -minX : 0
    const oy = minY < 0 ? -minY : 0
    if (ox !== 0 || oy !== 0) {
      for (const l of nodes.values()) {
        l.x += ox
        l.y += oy
      }
    }

    return { nodes, totalWidth: maxX - minX, totalHeight: maxY - minY }
  },
}
