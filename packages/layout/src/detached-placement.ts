/**
 * 自由主题（children.detached）的落位 — SB `abstractstructure.calDetachedChildrenPos`
 *
 * SB 的实现（只对**中央分支**生效）：
 * ```
 * if (!branchView.isCentralBranch()) return
 * const isTopicOverlapping = branchView.model.ownerSheet().isTopicOverlapping()   // sheet.topicOverlapping === 'overlap'
 * for (const detached of branchView.getChildrenBranchesByType(DETACHED)) {
 *   const modelPosition = detached.model.getPosition()
 *   if (isTopicOverlapping && modelPosition) detached.setPosition(modelPosition)
 *   else detached.setPosition(HitDetectInstance.calcRealPosition(detached, allBranchViewList))
 * }
 * extend(newBounds, structuresUtil.mergeBounds(detachedChildren, newBounds))
 * ```
 * 结构类（`utils/branch.getViewStructure`）：
 *   `presetStructure = 自身 structure-class || skeleton[className=floatingTopic]` 有定义就用它，
 *   否则 `model.position.x < 0 ? LOGICLEFT : LOGICRIGHT`（**严格 <**，x=0 归右，
 *   与 callout 的 `<=` 不同）。
 * 探针实测（scripts/sb-detached.mjs，test-detached.xmind，sheet 没有 topicOverlapping →
 * isTopicOverlapping = false → 走 HitDetect，但三个 detached 都放得足够远）：
 *   det-right (1600,-1000)  shiftFromModel (0,0) → logic.right，子 rel (123,∓19)
 *   det-left  (-1600,1000)  shiftFromModel (0,0) → logic.left， 子 rel (-118,∓19)
 *   det-zero  (0,-2000)     shiftFromModel (0,0) → **logic.right**（x=0 归右）
 * 即「没有重叠时 HitDetect 原样返回 model position」→ TM 直接用 model position。
 * ⚠️ 主题**重叠**时 SB 会推开（OldHitDetect，577 行，已判搁置），TM 不做 → 那种
 * fixture 会差 hit-detect 的位移量（与 callout 的已知差距同源）。
 *
 * newBounds 合并这一步 TM 不做：它只影响中央分支自己的 bounds（视口/包围盒），
 * 不影响任何节点落位 —— 实测 test-detached 的 235 个 attached 节点在 SB 里与
 * 「完全忽略 detached」的 TM 逐节点一致（四项 Δ 全 0）。
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutOptions, NodeLayout } from './layout-engine'
import { getAttr, getStructurePreset } from './layout-utils'
import { layoutLogicSubtree } from './logic-layout'
import { measureNodeOriginY } from './spacing-utils'

/** 中央分支的 children.detached 槽 */
export function getDetachedChildren(node: NodeDesc): readonly NodeDesc[] {
  return (node.children as Record<string, readonly NodeDesc[]> | undefined)?.detached ?? []
}

/** 这个 structureClass 是不是「朝左长」的族（用于把 preset 映射成 logic 侧向） */
function isLeftStructure(structureClass: string): boolean {
  return /(^|\.)(left|leftHeaded)$/.test(structureClass) || structureClass.includes('.left')
}

/**
 * SB `getViewStructure` 对 detached 的侧向：
 * preset（自身 structure-class || skeleton[floatingTopic]）优先，否则 `position.x < 0` 判左。
 *
 * ⚠️ preset 是 tree.* / org-chart.* 这类非 logic 结构时，SB 会整棵按那个结构长；
 * TM 只有 logic 委派入口（与「org-chart 下显式声明 tree.*」那条已知差距同源）→
 * 这里只按名字判左右侧，交给 logic 布局。
 */
export function detachedSide(doc: NodeDesc, node: NodeDesc, posX: number): 'left' | 'right' {
  const preset = getStructurePreset(doc, node)
  if (typeof preset === 'string' && preset) return isLeftStructure(preset) ? 'left' : 'right'
  return posX < 0 ? 'left' : 'right'
}

/**
 * 把中央分支的 detached 子树摆进布局结果（原位追加，不动已有节点）。
 *
 * @returns 追加了 detached 节点时返回 true（调用方据此重算 totalWidth/Height）
 */
export function placeDetachedChildren(
  doc: NodeDesc,
  root: NodeDesc,
  nodes: Map<string, NodeLayout>,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
): boolean {
  const detached = getDetachedChildren(root)
  if (detached.length === 0) return false
  const rootNL = nodes.get(root.id)
  if (!rootNL) return false

  // 父主题盒原点（shape 中心）：detached 的 model.position 相对它（与 callout 同口径）
  const pcx = rootNL.x + rootNL.width / 2
  const pcy = rootNL.y + measureNodeOriginY(root, options, styleEngine, state)

  let placed = false
  for (const d of detached) {
    // 折叠由 layoutLogicSubtree 内部处理（computePlacement 对 isCollapsed 的节点不取子节点）
    const pos = getAttr<{ x?: number; y?: number }>(d, 'position')
    const px = typeof pos?.x === 'number' ? pos.x : 0
    const py = typeof pos?.y === 'number' ? pos.y : 0
    const side = detachedSide(doc, d, px)
    // 整棵子树按 logic 布局（局部帧：detached 盒左上角 = (0, -originY)），再平移到目标原点
    const sub = layoutLogicSubtree(d, 0, 0, options, styleEngine, state, side)
    const own = sub.nodes.get(d.id)
    if (!own) continue
    const dx = (pcx + px - own.width / 2) - own.x
    const dy = (pcy + py) - (own.y + sub.originY)
    for (const [id, nl] of sub.nodes) {
      nodes.set(id, { ...nl, x: nl.x + dx, y: nl.y + dy })
    }
    placed = true
  }
  return placed
}
