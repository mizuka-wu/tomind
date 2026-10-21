/**
 * 生效结构的**逐节点**解析（SB `utils/branch.getViewStructure` 的 attached 分支）
 *
 * 为什么要有这一层：SB 的生效结构是「preset 缺失 → **继承父结构**」往下传的，
 * 而 TM 各宿主此前要么只看 skeleton、要么带 `sk[role] ?? sk.mainTopic` 这种兜底：
 *   - 兜底会污染被委派出去的子树：skeleton 写了 `mainTopic: logic.right` 时，
 *     tree 宿主的 `getChildLogicSide` 在**每一层**都拿到 logic.right，
 *     于是「org-chart/logic 下声明 tree.right 的分支」它的后代被错误地委派回 logic
 *     （SB：那些后代 preset 缺失 → 继承 **tree.right**）。
 *     实测 probe-logic.right+tree.right：只改委派入口不改这条 ⇒ 残差 91.9 / 185.7。
 *   - 只看 skeleton 会漏掉节点自己声明的 structure-class（第三轮 test-org-mixed 那条）。
 *
 * 这里统一算出两张表交给宿主：`eff`（每个节点的生效结构类）与
 * `delegate`（哪些子分支要整棵交给别的布局器）。宿主自己那族的（isSelf）不进 delegate。
 */
import type { NodeDesc } from '@tomind/schema'
import type { SheetState } from '@tomind/state'
import { isCollapsed, getAttachedChildren, getAttr, getStructurePreset } from './layout-utils'
import { resolveChildStructure, delegationOf } from './child-structure'
import type { DelegableStructure } from './child-structure'

export interface StructureResolution {
  /** nodeId → 生效结构类（含继承） */
  eff: Map<string, string>
  /** nodeId → 该子分支整棵交给别的结构布局（不在表里 = 宿主自己递归） */
  delegate: Map<string, DelegableStructure>
  /** nodeId → 文档深度（委派 tree 子树时当 skeleton 角色基准） */
  depth: Map<string, number>
}

/** SB `presetStructure = modelStructure || skeletonStructureStyle[getActivedClassName(view)]` */
export function structurePresetOf(node: NodeDesc, state: SheetState | null): string | null {
  const own = getAttr<string>(node, 'structureClass')
  if (typeof own === 'string' && own) return own
  if (!state) return null
  return getStructurePreset(state.doc, node)
}

/**
 * 从 root 往下把每个 attached 子节点的生效结构算出来。
 *
 * @param rootEff  root 的生效结构（SB：中央分支 = modelStructure || skeleton[centralTopic]）
 * @param isSelf   该委派方式是否就是宿主自己的递归（同族同向）——是则不委派
 * @param rootDepth root 在文档中的深度（被委派的子树根 ≥ 1）
 */
export function resolveStructures(
  root: NodeDesc,
  rootEff: string,
  state: SheetState | null,
  isSelf: (d: DelegableStructure) => boolean,
  rootDepth = 0,
): StructureResolution {
  const eff = new Map<string, string>()
  const delegate = new Map<string, DelegableStructure>()
  const depth = new Map<string, number>()
  eff.set(root.id, rootEff)
  depth.set(root.id, rootDepth)

  const walk = (node: NodeDesc): void => {
    if (isCollapsed(node)) return
    const parentEff = eff.get(node.id) ?? rootEff
    const parentDepth = depth.get(node.id) ?? rootDepth
    for (const child of getAttachedChildren(node)) {
      const childEff = resolveChildStructure(parentEff, structurePresetOf(child, state)) ?? parentEff
      eff.set(child.id, childEff)
      depth.set(child.id, parentDepth + 1)
      const d = delegationOf(childEff)
      if (d && !isSelf(d)) {
        delegate.set(child.id, d)
        // 被委派出去的子树由被委派方自己解析生效结构，宿主不再往里走
        continue
      }
      walk(child)
    }
  }
  walk(root)
  return { eff, delegate, depth }
}
