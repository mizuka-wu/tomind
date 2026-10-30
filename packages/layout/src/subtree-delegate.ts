/**
 * 通用子树委派 —— 把「某个子分支整棵按别的结构长」这件事收成一个入口
 *
 * SB 里这不是特例：`utils/branch.getViewStructure` 对每个 attached 子分支都解析一次生效结构，
 * 然后**那个分支的 calAttachedChildrenPos 由它自己的 structure 对象跑**（父结构只负责
 * 用 child.boundaryBounds 把它摆到位）。TM 的各宿主布局此前各写一份局部判定，
 * 只有 logic 一个委派入口（org-chart 的 getOrgChildLogicSide），于是
 * 「org-chart 下声明 tree.right」这类组合整棵退回宿主递归
 * （量尺 test-org-tree-branch 29.1 / 40.9，单点最大 dx -483）。
 *
 * 统一契约：**返回的节点表以 child 的主题盒原点（shape 中心）为 (0,0)**，
 * bb 就是 SB 的 `child.boundaryBounds`（同样相对原点）⇒ 宿主只需要
 * 「算出 child 原点该落在哪」再整体平移，不用关心被委派结构内部的坐标帧。
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutOptions } from './layout-engine'
import { SC } from './child-structure'
import type { DelegableStructure } from './child-structure'
import { layoutLogicSubtree } from './logic-layout'
import { layoutTreeSubtree } from './tree-layout'
import { layoutOrgSubtree } from './org-chart-layout'
import { layoutTreetableSubtree } from './treetable-layout'
import { layoutTimelineSubtree } from './timeline-layout'

export interface SubtreeNodeLayout {
  x: number
  y: number
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  branchHeight: number
  partBounds?: Map<string, { x: number; y: number; width: number; height: number }>
}

export interface DelegatedSubtreeLayout {
  /** 绝对坐标节点表，**child 原点（shape 中心）= (0,0)** */
  nodes: Map<string, SubtreeNodeLayout>
  /** SB `child.boundaryBounds` —— 相对 child 原点 */
  bb: { x: number; y: number; width: number; height: number }
  /** child 主题盒原点到盒顶的距离 = shapeHeight/2（有 labels 时 ≠ height/2） */
  originY: number
  /** child 自己的主题盒（相对原点：x = -width/2、y = -originY） */
  own: SubtreeNodeLayout
}

/**
 * 以 child 原点为 (0,0) 布局整棵子树。
 *
 * - `tree.left/right` → `layoutTreeSubtree`
 * - `treetable` → `layoutTreetableSubtree`（SB 里它也是「整棵子树摊成一张表」的独立结构）
 * - `timeline.horizontal` → `layoutTimelineSubtree`（轴布局；它的子分支是 up/down，再往下是 logic.right）
 * - `logic.left/right` / `brace.left/right` → `layoutLogicSubtree`
 *   （SB `BraceLeftAndRight = Object.assign({}, logicLeftAndRight, { calAttachedChildrenPos, … })`，
 *    堆叠公式同源，差别是 calcSpacingMajor 的 `isBraceStructure → LINE_SPACING(16)` 补丁
 *    与不走 outward ⇒ 用 rootEff 把「本层是 brace」传进去，由 logic 内部按生效结构判定）
 */
export function layoutDelegatedSubtree(
  child: NodeDesc,
  del: DelegableStructure,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  baseDepth = 1,
): DelegatedSubtreeLayout {
  if (del.kind === 'timeline') {
    const res = layoutTimelineSubtree(child, options, styleEngine, state, baseDepth)
    return { nodes: res.nodes, bb: res.bb, originY: res.originY, own: res.nodes.get(child.id)! }
  }

  if (del.kind === 'treetable') {
    // runTreeTable 本来就把表格根的原点放在 (0,0) ⇒ 不用再平移
    const res = layoutTreetableSubtree(child, options, styleEngine, state, baseDepth, del.topTitle === true)
    return { nodes: res.nodes, bb: res.bb, originY: res.originY, own: res.nodes.get(child.id)! }
  }

  if (del.kind === 'tree' || del.kind === 'org') {
    const res = del.kind === 'tree'
      ? layoutTreeSubtree(child, 0, 0, options, styleEngine, state, del.dir, baseDepth)
      : layoutOrgSubtree(child, 0, 0, options, styleEngine, state, del.dir, baseDepth)
    const raw = res.nodes.get(child.id)!
    const ox = raw.x + raw.width / 2
    const oy = raw.y + res.originY
    const nodes = new Map<string, SubtreeNodeLayout>()
    for (const [id, nl] of res.nodes) nodes.set(id, { ...nl, x: nl.x - ox, y: nl.y - oy })
    return { nodes, bb: res.bb, originY: res.originY, own: nodes.get(child.id)! }
  }

  const rootEff = del.kind === 'brace'
    ? (del.side === 'right' ? SC.BRACE_RIGHT : SC.BRACE_LEFT)
    : (del.side === 'right' ? SC.LOGIC_RIGHT : SC.LOGIC_LEFT)
  const res = layoutLogicSubtree(child, 0, 0, options, styleEngine, state, del.side, { rootEff })
  const raw = res.nodes.get(child.id)!
  // centerY = 0 ⇒ 原点 Y 已经是 0，只需要把 X 从「盒左边缘」挪到「盒中心」
  const ox = raw.x + raw.width / 2
  const nodes = new Map<string, SubtreeNodeLayout>()
  for (const [id, nl] of res.nodes) nodes.set(id, { ...nl, x: nl.x - ox })
  return {
    nodes,
    bb: { x: res.bbX, y: res.bb.y, width: res.bbW, height: res.bb.height },
    originY: res.originY,
    own: nodes.get(child.id)!,
  }
}

/**
 * 把委派子树平移到「child 原点 = (originX, originY)」并并进宿主的节点表。
 * 宿主自己的 bb / 堆叠推进用 `del.bb`（= SB child.boundaryBounds）。
 */
export function placeDelegatedSubtree<T extends SubtreeNodeLayout>(
  del: DelegatedSubtreeLayout,
  originX: number,
  originY: number,
  out: Map<string, T>,
): void {
  for (const [id, nl] of del.nodes) {
    out.set(id, { ...nl, x: nl.x + originX, y: nl.y + originY } as T)
  }
}
