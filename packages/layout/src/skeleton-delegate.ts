/**
 * Skeleton 结构委派 — 对齐 snowbrush 的 skeleton structure style
 *
 * xmind extensions（provider=org.xmind.ui.skeleton.structure.style）按角色指定结构：
 *   { centralTopic: 'org.xmind.ui.map.clockwise', mainTopic: 'org.xmind.ui.logic.right' }
 * snowbrush 中每个 branch 的结构由其 class 决定（root 用 centralTopic，主分支用 mainTopic，
 * 更深层继承父结构的 available child structure）。tomind 的各结构布局此前对所有层级
 * 递归自身规则，导致 skeleton 为 logic 的深层子树排列错误。
 *
 * 这里提供统一委派入口：子层级结构为 logic.* 时，用 logic 布局精确移植版布局整棵子树，
 * 再平移到宿主布局给出的目标位置。
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutOptions, NodeLayout } from './layout-engine'
import { layoutLogicSubtree } from './logic-layout'

/** 读取 skeleton 中子层级结构对应的 logic 方向；非 logic 返回 null */
export function getChildLogicSide(state: SheetState | null, parentDepth: number): 'right' | 'left' | null {
  const sk = (state?.doc?.attrs as Record<string, unknown> | undefined)?.skeletonStructure as Record<string, string> | undefined
  if (!sk) return null
  const sc = sk[parentDepth === 0 ? 'mainTopic' : 'subTopic'] ?? sk.mainTopic
  if (typeof sc !== 'string' || !sc.startsWith('org.xmind.ui.logic')) return null
  return sc.endsWith('left') ? 'left' : 'right'
}

export interface DelegatedSubtree {
  /** 绝对坐标节点表（child 主题左上角位于 (x, y)） */
  nodes: Map<string, NodeLayout>
  /** 子树包围盒（相对 child 中心） */
  bb: { y: number; height: number; x: number; width: number }
}

/**
 * 以 (x, y) 为 child 主题左上角布局其子树：
 * skeleton 为 logic.* 时用 logic 精确移植版，否则返回 null 由调用方自行递归。
 */
export function delegateLogicSubtree(
  child: NodeDesc,
  x: number,
  y: number,
  parentDepth: number,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): DelegatedSubtree | null {
  const side = getChildLogicSide(state, parentDepth)
  if (!side) return null
  const cs = (child.attrs as Record<string, unknown> | undefined) ? child : child
  void cs
  const res = layoutLogicSubtree(child, 0, 0, options, styleEngine, state, side)
  const own = res.nodes.get(child.id)
  if (!own) return null
  const dx = x - own.x
  const dy = y - own.y
  const nodes = new Map<string, NodeLayout>()
  for (const [id, nl] of res.nodes) {
    nodes.set(id, { ...nl, x: nl.x + dx, y: nl.y + dy } as NodeLayout)
  }
  return { nodes, bb: { y: res.bb.y, height: res.bb.height, x: res.bbX, width: res.bbW } }
}
