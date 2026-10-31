// snowbrush fishbone 对角线算法对齐 (BONE_CONNECTION_TAN = 1.5)
/**
 * Fishbone 布局 — 鱼骨图（石川图）
 *
 * 鱼骨图: 中间一条主脊，原因分支斜向排列
 * leftHeaded: 鱼头在左（问题在左，原因在右）
 * rightHeaded: 鱼头在右（问题在右，原因在左）
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine, ResolvedStyle } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import { isCollapsed, getAttachedChildren, findRootTopic, getAttr } from './layout-utils'
import { hasNonTitleParts } from './part-measure'
import { measurePartAwareNode, measureTitleOnlyNode } from './part-node-size'
import { DEFAULT_STYLES, classifyNode } from '@tomind/style'
import { SC, delegationOf, resolveChildStructure } from './child-structure'
import { structurePresetOf } from './structure-resolve'
import { layoutDelegatedSubtree } from './subtree-delegate'

function parseStyleValue(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return isNaN(num) ? fallback : num
  }
  return fallback
}

/**
 * 读取节点的间距配置，对齐 logic-layout.ts 的 getNodeSpacing 模式：
 * - spacingMajor / spacingMinor 从 resolved style 读取
 * - padding 从 resolved style margin 属性 + attrs.style.margin 统一回退
 */
function getNodeSpacing(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
) {
  let style: ResolvedStyle | undefined
  if (styleEngine && state) {
    style = styleEngine.computeStyle(state, node.id)
  }

  if (!style) {
    return {
      horizontalGap: options.horizontalGap,
      verticalGap: options.verticalGap,
      padding: options.nodePadding,
    }
  }

  const majorGap = parseStyleValue(style.spacingMajor, options.horizontalGap)
  const minorGap = parseStyleValue(style.spacingMinor, options.verticalGap)

  // 对齐 snowbrush getTopicMargins: 先读统一 margin，有值则四方向使用，否则 fallback 到分侧值
  const rawStyle = getAttr<Record<string, unknown>>(node, 'style')
  const rawMargin = rawStyle?.margin

  let top: number
  let bottom: number
  let left: number
  let right: number

  if (typeof rawMargin === 'number' && rawMargin > 0) {
    top = bottom = left = right = rawMargin
  } else if (typeof rawMargin === 'string') {
    const parsed = parseFloat(rawMargin)
    if (!isNaN(parsed) && parsed > 0) {
      top = bottom = left = right = parsed
    } else {
      top = parseStyleValue(style.marginTop, options.nodePadding.top)
      bottom = parseStyleValue(style.marginBottom, options.nodePadding.bottom)
      left = parseStyleValue(style.marginLeft, options.nodePadding.left)
      right = parseStyleValue(style.marginRight, options.nodePadding.right)
    }
  } else {
    top = parseStyleValue(style.marginTop, options.nodePadding.top)
    bottom = parseStyleValue(style.marginBottom, options.nodePadding.bottom)
    left = parseStyleValue(style.marginLeft, options.nodePadding.left)
    right = parseStyleValue(style.marginRight, options.nodePadding.right)
  }

  return {
    horizontalGap: majorGap,
    verticalGap: minorGap,
    padding: { top, right, bottom, left },
  }
}

interface NodeSize {
  width: number
  height: number
  /**
   * 主题盒原点（SB branch position = **shape 中心**）到盒顶的距离 = shapeHeight/2。
   * SB 的 topicView.bounds.y / boundaryBounds.y 都以原点为参考（bounds.y = -originY），
   * 有 labels 时 height > shapeHeight，原点不在盒中心。
   */
  originY: number
  titleWidth: number
  titleHeight: number
  partBounds?: Map<string, { x: number; y: number; width: number; height: number }>
}

function measureNodeSize(
  node: NodeDesc,
  padding: { top: number; right: number; bottom: number; left: number },
  options: LayoutOptions,
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): NodeSize {
  if (hasNonTitleParts(node)) {
    const result = measurePartAwareNode(node, options, styleEngine, state, padding)
    return {
      width: result.width,
      height: result.height,
      originY: result.shapeHeight / 2,
      titleWidth: result.titleWidth,
      titleHeight: result.titleHeight,
      partBounds: result.partBounds,
    }
  }

  const result = measureTitleOnlyNode(node, padding, options, styleEngine, state)
  return {
    width: result.width,
    height: result.height,
    originY: result.shapeHeight / 2,
    titleWidth: result.titleWidth,
    titleHeight: result.titleHeight,
    partBounds: result.partBounds,
  }
}

function measureSubtree(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine?: StyleEngine | null, state?: SheetState | null): void {
  const spacing = getNodeSpacing(node, options, styleEngine ?? null, state ?? null)
  sizeMap.set(node.id, measureNodeSize(node, spacing.padding, options, styleEngine, state))
  if (!isCollapsed(node)) {
    for (const child of getAttachedChildren(node)) {
      measureSubtree(child, options, sizeMap, styleEngine, state)
    }
  }
}

function getSpacingMajor(node: NodeDesc, options: LayoutOptions, styleEngine: StyleEngine | null, state: SheetState | null): number {
  return getNodeSpacing(node, options, styleEngine, state).horizontalGap
}

/** 递归计算子树总宽度（水平方向的总跨度），沿主脊方向使用 spineGap */
function subtreeTotalWidth(node: NodeDesc, options: LayoutOptions, sizeMap: Map<string, NodeSize>, styleEngine: StyleEngine | null, state: SheetState | null): number {
  const size = sizeMap.get(node.id)!
  if (isCollapsed(node)) return size.width
  const children = getAttachedChildren(node)
  if (children.length === 0) return size.width
  const spineGap = getSpacingMajor(node, options, styleEngine, state) * 1.5
  let maxChildWidth = 0
  for (const child of children) {
    maxChildWidth = Math.max(maxChildWidth, subtreeTotalWidth(child, options, sizeMap, styleEngine, state))
  }
  return size.width + spineGap + maxChildWidth
}

// ==================== snowbrush fishbone 精确移植 ====================
const FISH_BONE = {
  BONE_PADDING_HORIZON: 60,
  BONE_PADDING_VERTICAL: 40,
  SUB_BONE_PADDING_VERTICAL: 20,
  FIRST_BONE_CONNECTION_DISTANCE: 30,
  BONE_CONNECTION_DISTANCE: 30,
  BONE_CONNECTION_TAN: Math.tan((Math.PI / 180) * 60),
  HEAD_BONE_LINE_EXTEND_BODY_WIDTH: 60,
  HEAD_BONE_LINE_MIN_BODY_WIDTH: 0,
}

interface FBB { x: number; y: number; width: number; height: number }
interface FBNode { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number; partBounds?: Map<string, { x: number; y: number; width: number; height: number }> }

function defaultSpacing(state: SheetState | null, node: NodeDesc, key: 'spacingMajor' | 'spacingMinor'): number {
  if (!state) return key === 'spacingMajor' ? 26 : 8
  const cls = classifyNode(state.doc, node.id)
  const entry = (DEFAULT_STYLES as Record<string, Record<string, unknown>>)[cls]
  return parseStyleValue(entry?.[key], key === 'spacingMajor' ? 26 : 8)
}

/** SB getBonePaddingVertical / getMainBonePaddingVertical：head 的 spacingMajor * 40 / default(headClass) */
function bonePaddingVertical(head: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null): number {
  const sm = styleEngine && state ? parseStyleValue(styleEngine.getStyleValue(state, head.id, 'spacingMajor'), 0) : 0
  const def = defaultSpacing(state, head, 'spacingMajor') || 1
  return (sm * FISH_BONE.BONE_PADDING_VERTICAL) / def
}

/** SB getBonePaddingHorizon：head 的 spacingMinor * 60 / defaultMinor(headClass) */
function bonePaddingHorizon(head: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null): number {
  const sm = styleEngine && state ? parseStyleValue(styleEngine.getStyleValue(state, head.id, 'spacingMinor'), 0) : 0
  const def = defaultSpacing(state, head, 'spacingMinor') || 1
  return (sm * FISH_BONE.BONE_PADDING_HORIZON) / def
}

/** SB getSubBonePaddingVertical：bone 的 spacingMinor * 20 / default(boneClass) */
function subBonePaddingVertical(bone: NodeDesc, styleEngine: StyleEngine | null, state: SheetState | null): number {
  const sm = styleEngine && state ? parseStyleValue(styleEngine.getStyleValue(state, bone.id, 'spacingMinor'), 0) : 0
  const def = defaultSpacing(state, bone, 'spacingMinor') || 1
  return (sm * FISH_BONE.SUB_BONE_PADDING_VERTICAL) / def
}

/** SB getMainBoneConnectionWidth */
function boneConnectionWidth(bb: FBB, topicH: number, padV: number): number {
  const connectionHeight = bb.height - topicH + padV
  return connectionHeight / FISH_BONE.BONE_CONNECTION_TAN
}

/**
 * 布局一根主骨（topbone/bottombone）：子节点（logic 子树）沿骨线斜向排列。
 * 返回合并节点表与骨的 boundaryBounds（相对骨中心）。
 */
function layoutBone(
  bone: NodeDesc,
  left: number,
  centerY: number,
  sideSign: 1 | -1,
  dirSign: 1 | -1,
  depth: number,
  head: NodeDesc,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): { nodes: Map<string, FBNode>; bb: FBB } {
  const size = sizeMap.get(bone.id)!
  const h = size.height
  const w = size.width
  const out = new Map<string, FBNode>()
  // centerY 是骨的主题盒原点（shape 中心），盒顶 = 原点 - originY
  out.set(bone.id, { x: left, y: centerY - size.originY, width: w, height: h, titleWidth: size.titleWidth, titleHeight: size.titleHeight, branchHeight: h, partBounds: size.partBounds })

  const children = isCollapsed(bone) ? [] : getAttachedChildren(bone)
  if (children.length === 0) {
    return { nodes: out, bb: { x: -w / 2, y: -size.originY, width: w, height: h } }
  }

  const boneCenterX = left + w / 2
  const bonePadV = bonePaddingVertical(head, styleEngine, state)
  const subPadV = subBonePaddingVertical(bone, styleEngine, state)

  let baseX = 0
  let baseY = (h / 2 + bonePadV) * sideSign
  let boundsMinX = -w / 2
  let boundsMaxX = w / 2
  let boundsHeight = h + bonePadV

  /**
   * 骨的子分支的生效结构（SB `fishbone{left,right}head{top,bottom}bone`）：
   *   `direction` = RIGHT（leftHeaded 的上下骨）/ LEFT（rightHeaded 的上下骨）
   *   `getAvailableChildStructure()`（继承 FishBoneBaseMainBone）= RIGHT_EXPOSED / LEFT_EXPOSED
   *   `getChildStructure()` = **LOGICRIGHT / LOGICLEFT**（与 skeleton 无关）
   * TM 的 dirSign 正是这个 direction（leftHeaded → 1、rightHeaded → -1）。
   *
   * ⚠️ 2026-10-30 第六轮之前这里走 `delegateLogicSubtree`（读 skeleton）：
   * demo-fishbone 的 skeleton 写着 mainTopic: logic.right ⇒ 一直委派 ⇒ 假 0；
   * 对照组 noskel-fishbone.leftHeaded（skeleton = fishbone.leftHeaded）拿不到 logic
   * ⇒ fallback 只放子分支自己一个盒 ⇒ **n=63/235**（172 个节点不存在）、avgΔX 2239。
   */
  const boneEff = dirSign === 1 ? SC.LOGIC_RIGHT : SC.LOGIC_LEFT
  for (const child of children) {
    const childEff = resolveChildStructure(boneEff, structurePresetOf(child, state), {
      defaultChildStructure: boneEff,
    })
    const delegation = delegationOf(childEff)
    const res = delegation
      ? layoutDelegatedSubtree(child, delegation, options, styleEngine, state, depth + 1)
      : null
    let bb: FBB
    let provNodes: Map<string, FBNode>
    if (res) {
      bb = { x: res.bb.x, y: res.bb.y, width: res.bb.width, height: res.bb.height }
      provNodes = new Map<string, FBNode>()
      for (const [id, nl] of res.nodes) provNodes.set(id, nl)
    } else {
      const cs = sizeMap.get(child.id)!
      provNodes = new Map<string, FBNode>()
      provNodes.set(child.id, { x: 0, y: -cs.originY, width: cs.width, height: cs.height, titleWidth: cs.titleWidth, titleHeight: cs.titleHeight, branchHeight: cs.height })
      bb = { x: -cs.width / 2, y: -cs.originY, width: cs.width, height: cs.height }
    }
    const childXToBase = dirSign === 1 ? Math.abs(bb.x) : -(bb.width + bb.x)
    const childYDist = sideSign === 1 ? Math.abs(bb.y) : Math.abs(bb.height + bb.y)
    /**
     * SB `fishbonebasemainbone._calcAttachedChildrenPositiconAndSelfBounds` 的
     * 「optimize baseX for similar structure fishbone」：
     * ```js
     * if (getParentFishBoneStructureClass(this.STRUCTURECLASS) === childInfo.currentBranchStructure) {
     *   childX = childX - (childYToBaseYDistance / BONE_CONNECTION_TAN) * isToRightMultiplicationParam
     * }
     * ```
     * `getParentFishBoneStructureClass(LEFTHEADTOP/BOTTOMBONE) = FISHBONELEFTHEADED`
     * （RIGHTHEAD* → FISHBONERIGHTHEADED）⇒ 判据是「骨上这个子分支自己也是一条**同向鱼骨**」。
     * 调整后 childX 同时用于 position 与 boundsMinX/boundsMaxX。
     * 实测 probe-fishbone.leftHeaded × fishbone.leftHeaded：漏这条 ⇒ 整棵嵌套鱼骨
     * （40 个节点）dx 恒为 **+240.2**（= childYDist 416 / tan60）。
     */
    const sameFishbone = childEff === (dirSign === 1 ? SC.FISHBONE_LEFT_HEADED : SC.FISHBONE_RIGHT_HEADED)
    const childX = baseX + childXToBase - (sameFishbone ? (childYDist / FISH_BONE.BONE_CONNECTION_TAN) * dirSign : 0)
    const childY = baseY + childYDist * sideSign
    const dx = boneCenterX + childX - (bb.width / 2 + bb.x) - (provNodes.get(child.id)!.x + provNodes.get(child.id)!.width / 2 - (provNodes.get(child.id)!.x + provNodes.get(child.id)!.width / 2)) - 0
    // 子节点中心目标 = 骨中心 + (childX, childY)；provisional 中心 = (own.x + w/2, own.y + h/2)
    const own = provNodes.get(child.id)!
    const ddx = boneCenterX + childX - (own.x + own.width / 2)
    // 目标位置是子分支**原点**：盒顶 = 原点 - originY
    const ddy = centerY + childY - (own.y + sizeMap.get(child.id)!.originY)
    void dx
    for (const [id, nl] of provNodes) {
      out.set(id, { ...nl, x: nl.x + ddx, y: nl.y + ddy })
    }
    const childDistanceY = (bb.height + subPadV) * sideSign
    boundsMinX = Math.min(boundsMinX, childX - Math.abs(bb.x))
    boundsMaxX = Math.max(boundsMaxX, childX + bb.width + bb.x)
    boundsHeight += Math.abs(childDistanceY)
    baseX -= (Math.abs(childDistanceY) / FISH_BONE.BONE_CONNECTION_TAN) * dirSign
    baseY += childDistanceY
  }

  const bbWidth = Math.abs(boundsMaxX - boundsMinX)
  const bbHeight = boundsHeight - subPadV
  const bbY = sideSign === 1 ? -h / 2 : -(bbHeight - h / 2)
  return { nodes: out, bb: { x: boundsMinX, y: bbY, width: bbWidth, height: bbHeight } }
}

/**
 * SB `fishbonebasehead._calcAttachedChildrenPosition` + `_calcBounds`。
 *
 * 返回值 = SB 的 `branchLayoutTreeInfo.bounds`（鱼头分支的 bounds，相对**鱼头主题盒原点**）：
 * ```js
 * maxSideWidth = max(topSide.width, bottomSide.width)      // 两侧同值 = 最后一次 _updateSideSize 的 sideWidth
 * width  = topicBounds.width + (maxSideWidth !== 0
 *            ? max(maxSideWidth + HEAD_BONE_LINE_EXTEND_BODY_WIDTH(60),
 *                  HEAD_BONE_LINE_MIN_BODY_WIDTH(0)) : 0)
 * height = max(halfH + startAnchorPositionY, topSide.height)
 *        + max(halfH - startAnchorPositionY, bottomSide.height)
 * x = direction === LEFT ? -(width - topicBounds.width/2) : topicBounds.x
 * y = -max(halfH, topSide.height - startAnchorPositionY)
 * ```
 * `startAnchorPositionY` 只有 underline 形状才非 0（TM 的 fixture 全是 roundedRect ⇒ 0）。
 * 半高用 **topicBounds.height / 2**（SB 原文），不是 originY。
 *
 * ⚠️ 第七轮补：没有这个 bounds，fishbone 就没法当「被委派方」——宿主的 stop 格/cell
 * 拿不到子树包围盒 ⇒ `delegationOf(FISHBONE_*)` 只能返回 null ⇒ 丢节点
 * （实测 probe-treetable×fishbone.leftHeaded n=203/235、probe-spreadsheet× n=220/235）。
 */
function layoutHead(
  head: NodeDesc,
  left: number,
  centerY: number,
  dirSign: 1 | -1,
  options: LayoutOptions,
  sizeMap: Map<string, NodeSize>,
  nodes: Map<string, FBNode>,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  baseDepth = 0,
): FBB {
  const size = sizeMap.get(head.id)!
  const h = size.height
  const w = size.width
  nodes.set(head.id, { x: left, y: centerY - h / 2, width: w, height: h, titleWidth: size.titleWidth, titleHeight: size.titleHeight, branchHeight: h, partBounds: size.partBounds })

  const children = isCollapsed(head) ? [] : getAttachedChildren(head)
  if (children.length === 0) return { x: -w / 2, y: -h / 2, width: w, height: h }

  const headCenterX = left + w / 2
  const bonePadH = bonePaddingHorizon(head, styleEngine, state)
  const padV = bonePaddingVertical(head, styleEngine, state)
  const baseY = 0 // shape != underline → startAnchorPositionY = 0
  let baseX = (w / 2 + bonePadH) * dirSign
  // SB fishBoneSideSize（_updateSideSize 每组分完更新：宽度是**赋值**、高度是 max）
  let sideWidth = 0
  let topSideHeight = 0
  let bottomSideHeight = 0

  for (let i = 0; i < children.length; i += 2) {
    const top = children[i]
    const bottom = children[i + 1]
    const topSize = sizeMap.get(top.id)!
    const topProv = layoutBone(top, 0, 0, 1, dirSign, baseDepth + 1, head, options, sizeMap, styleEngine, state)
    const bottomProv = bottom ? layoutBone(bottom, 0, 0, -1, dirSign, baseDepth + 1, head, options, sizeMap, styleEngine, state) : null

    const topConnW = boneConnectionWidth(topProv.bb, topSize.height, padV)
    const topDist = Math.max(topSize.width / 2, topConnW)
    const topY = baseY - (padV + topProv.bb.height + topProv.bb.y)

    let topPos: { x: number; y: number }
    if (!bottomProv || !bottom) {
      topPos = { x: baseX + topDist * dirSign, y: topY }
      if (dirSign === 1) {
        baseX = topPos.x + topProv.bb.width + topProv.bb.x + bonePadH
      } else {
        baseX = topPos.x + topProv.bb.x - bonePadH
      }
    } else {
      const bottomSize = sizeMap.get(bottom.id)!
      const topTempX = topDist * dirSign
      const bottomConnW = boneConnectionWidth(bottomProv.bb, bottomSize.height, padV)
      const bottomTempX = topTempX + (bottomConnW + FISH_BONE.BONE_CONNECTION_DISTANCE - topConnW) * dirSign
      const tempBaseXToRealBaseXDistance = Math.abs(bottomTempX) - bottomSize.width / 2
      const baseXFix = tempBaseXToRealBaseXDistance < 0 ? -tempBaseXToRealBaseXDistance : 0
      topPos = { x: baseX + baseXFix * dirSign + topTempX, y: topY }
      const bottomPos = {
        x: baseX + baseXFix * dirSign + bottomTempX,
        y: baseY + padV + Math.abs(bottomProv.bb.y),
      }
      if (dirSign === 1) {
        baseX = Math.max(topPos.x + topProv.bb.width + topProv.bb.x, bottomPos.x + bottomProv.bb.width + bottomProv.bb.x) + bonePadH
      } else {
        baseX = Math.min(topPos.x + topProv.bb.x, bottomPos.x + bottomProv.bb.x) - bonePadH
      }
      const bdx = headCenterX + bottomPos.x - (bottomProv.nodes.get(bottom.id)!.x + bottomProv.nodes.get(bottom.id)!.width / 2)
      const bdy = centerY + bottomPos.y - (bottomProv.nodes.get(bottom.id)!.y + bottomSize.originY)
      for (const [id, nl] of bottomProv.nodes) {
        nodes.set(id, { ...nl, x: nl.x + bdx, y: nl.y + bdy })
      }
    }
    const tdx = headCenterX + topPos.x - (topProv.nodes.get(top.id)!.x + topProv.nodes.get(top.id)!.width / 2)
    const tdy = centerY + topPos.y - (topProv.nodes.get(top.id)!.y + sizeMap.get(top.id)!.originY)
    for (const [id, nl] of topProv.nodes) {
      nodes.set(id, { ...nl, x: nl.x + tdx, y: nl.y + tdy })
    }

    // SB _updateSideSize(baseX, topBoneInfo, bottomBoneInfo)
    sideWidth = Math.abs(baseX) - bonePadH - w / 2
    topSideHeight = Math.max(topProv.bb.height + padV, topSideHeight)
    if (bottomProv) bottomSideHeight = Math.max(bottomProv.bb.height + padV, bottomSideHeight)
  }

  // SB _calcBounds()
  const maxSideWidth = Math.max(sideWidth, sideWidth)
  let boundsW = w
  if (maxSideWidth !== 0) {
    boundsW += Math.max(
      maxSideWidth + FISH_BONE.HEAD_BONE_LINE_EXTEND_BODY_WIDTH,
      FISH_BONE.HEAD_BONE_LINE_MIN_BODY_WIDTH,
    )
  }
  const halfH = h / 2
  const boundsH = Math.max(halfH + baseY, topSideHeight) + Math.max(halfH - baseY, bottomSideHeight)
  const boundsX = dirSign === 1 ? -w / 2 : -(boundsW - w / 2)
  const boundsY = -Math.max(halfH, topSideHeight - baseY)
  return { x: boundsX, y: boundsY, width: boundsW, height: boundsH }
}

/**
 * 独立布局一棵 fishbone 子树（供其它结构按生效结构委派使用）。
 * 契约同 `subtree-delegate.layoutDelegatedSubtree`：节点表以 child 原点为 (0,0)、
 * bb = SB 的 `child.boundaryBounds`（无 boundary 时 == `fishbonebasehead._calcBounds` 的 bounds）。
 *
 * @param headed 'left' = fishbone.leftHeaded（鱼头在左、骨往右长，dirSign = 1）；
 *               'right' = fishbone.rightHeaded（dirSign = -1）
 */
export function layoutFishboneSubtree(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  baseDepth = 1,
  headed: 'left' | 'right' = 'left',
): { nodes: Map<string, FBNode>; bb: FBB; originY: number } {
  const sizeMap = new Map<string, NodeSize>()
  measureSubtree(node, options, sizeMap, styleEngine, state)
  const raw = new Map<string, FBNode>()
  const dirSign: 1 | -1 = headed === 'left' ? 1 : -1
  const bb = layoutHead(node, 0, 0, dirSign, options, sizeMap, raw, styleEngine, state, baseDepth)
  const own = raw.get(node.id)!
  const originY = sizeMap.get(node.id)!.originY
  const ox = own.x + own.width / 2
  const oy = own.y + originY
  const nodes = new Map<string, FBNode>()
  for (const [id, nl] of raw) nodes.set(id, { ...nl, x: nl.x - ox, y: nl.y - oy })
  return { nodes, bb, originY }
}

export const fishboneLeftHeadedLayoutAlgorithm: LayoutAlgorithm = {
  name: 'fishbone-leftHeaded',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number; partBounds?: Map<string, { x: number; y: number; width: number; height: number }> }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap, styleEngine, state)

    // 鱼头在左侧
    layoutHead(root, options.rootOffsetX, 200, 1, options, sizeMap, nodes, styleEngine, state)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    // 居中根节点
    const rootLayout = nodes.get(root.id)
    if (rootLayout) {
      const ox = maxX / 2 - (rootLayout.x + rootLayout.width / 2)
      const oy = maxY / 2 - (rootLayout.y + rootLayout.height / 2)
      if (Math.abs(ox) > 0.5 || Math.abs(oy) > 0.5) {
        for (const l of nodes.values()) { l.x += ox; l.y += oy }
        maxX += ox; maxY += oy
      }
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}

export const fishboneRightHeadedLayoutAlgorithm: LayoutAlgorithm = {
  name: 'fishbone-rightHeaded',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, { x: number; y: number; width: number; height: number; titleWidth: number; titleHeight: number; branchHeight: number; partBounds?: Map<string, { x: number; y: number; width: number; height: number }> }>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    const sizeMap = new Map<string, NodeSize>()
    measureSubtree(root, options, sizeMap, styleEngine, state)

    // 鱼头在右侧
    const totalW = (() => {
      let w = 0
      const children = getAttachedChildren(root)
      for (let i = 0; i < children.length; i++) {
        w += subtreeTotalWidth(children[i], options, sizeMap, styleEngine, state) + getSpacingMajor(root, options, styleEngine, state) * 1.5
      }
      return w + sizeMap.get(root.id)!.width
    })()

    layoutHead(root, totalW - sizeMap.get(root.id)!.width - options.rootOffsetX, 200, -1, options, sizeMap, nodes, styleEngine, state)

    let maxX = 0, maxY = 0
    for (const l of nodes.values()) {
      maxX = Math.max(maxX, l.x + l.width)
      maxY = Math.max(maxY, l.y + l.height)
    }

    // 居中根节点
    const rootLayout = nodes.get(root.id)
    if (rootLayout) {
      const ox = maxX / 2 - (rootLayout.x + rootLayout.width / 2)
      const oy = maxY / 2 - (rootLayout.y + rootLayout.height / 2)
      if (Math.abs(ox) > 0.5 || Math.abs(oy) > 0.5) {
        for (const l of nodes.values()) { l.x += ox; l.y += oy }
        maxX += ox; maxY += oy
      }
    }

    return { nodes, totalWidth: maxX, totalHeight: maxY }
  },
}
