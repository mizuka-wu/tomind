/**
 * 结构类常量与「子分支生效结构」解析 —— 逐条对齐 snowbrush
 *   `common/constants/structures.ts`（EXPOSED / *_EXPOSED / SIMILAR_STRUCTURE_MAP）
 *   `utils/branch.getViewStructure`（preset → available → 镜像 → 继承父结构）
 *   各 structure 的 `getAvailableChildStructure` 覆写
 *   `figures/renderengine/svg/topicshapes/utils.getStartDirection`
 *
 * 放在 @tomind/style（而不是 @tomind/layout）是因为**样式层也要用**：
 * SB `structuredescriptor[BEFORE_USER]` 的 line-class 覆盖判据是
 * 「这个分支自己的**生效**结构类是不是 brace.*」，而生效结构要靠继承往下传
 * （skeleton 没写 subTopic 时 d2+ 继承父结构）。@tomind/layout 依赖 @tomind/style，
 * 所以表放这里、`delegationOf`（TM 有哪些子树布局入口）留在 layout 的 child-structure.ts。
 */
/** SB `STRUCTURECLASS`（只收 TM 会消费到的那些；私有/废弃项按需补） */
export const SC = {
  LOGIC_RIGHT: 'org.xmind.ui.logic.right',
  LOGIC_LEFT: 'org.xmind.ui.logic.left',
  TREE_RIGHT: 'org.xmind.ui.tree.right',
  TREE_LEFT: 'org.xmind.ui.tree.left',
  ORG_CHART_DOWN: 'org.xmind.ui.org-chart.down',
  ORG_CHART_UP: 'org.xmind.ui.org-chart.up',
  MAP_CLOCKWISE: 'org.xmind.ui.map.clockwise',
  MAP_ANTICLOCKWISE: 'org.xmind.ui.map.anticlockwise',
  MAP: 'org.xmind.ui.map',
  MAP_UNBALANCED: 'org.xmind.ui.map.unbalanced',
  MAP_FLOATING: 'org.xmind.ui.map.floating',
  MAP_FLOATING_CLOCKWISE: 'org.xmind.ui.map.floating.clockwise',
  MAP_FLOATING_ANTICLOCKWISE: 'org.xmind.ui.map.floating.anticlockwise',
  TIMELINE_THROUGH_VERTICAL: 'org.xmind.ui.timeline.through.vertical',
  TIMELINE_SIDED_HORIZONTAL: 'org.xmind.ui.timeline.sided.horizontal',
  TIMELINE_HORIZONTAL: 'org.xmind.ui.timeline.horizontal',
  TIMELINE_HORIZONTAL_UP: 'org.xmind.ui.timeline.horizontal.up',
  TIMELINE_HORIZONTAL_DOWN: 'org.xmind.ui.timeline.horizontal.down',
  /** SB STRUCTURECLASS.TREESIDED 与 TIMELINEVERTICAL 是同一个字符串 */
  TIMELINE_VERTICAL: 'org.xmind.ui.timeline.vertical',
  FISHBONE_LEFT_HEADED: 'org.xmind.ui.fishbone.leftHeaded',
  FISHBONE_RIGHT_HEADED: 'org.xmind.ui.fishbone.rightHeaded',
  SPREADSHEET: 'org.xmind.ui.spreadsheet',
  COLUMN_SPREADSHEET: 'org.xmind.ui.spreadsheet.column',
  BRACE_RIGHT: 'org.xmind.ui.brace.right',
  BRACE_LEFT: 'org.xmind.ui.brace.left',
  TREE_TABLE: 'org.xmind.ui.treetable',
  TOP_TITLE_TREE_TABLE: 'org.xmind.ui.treetable.toptitle',
} as const

export type StructureClass = string

/** SB EXPOSED_STRUCTURE（原文顺序） */
export const EXPOSED_STRUCTURE: readonly StructureClass[] = [
  SC.LOGIC_RIGHT,
  SC.LOGIC_LEFT,
  SC.TREE_RIGHT,
  SC.TREE_LEFT,
  SC.ORG_CHART_DOWN,
  SC.ORG_CHART_UP,
  SC.MAP_CLOCKWISE,
  SC.MAP_ANTICLOCKWISE,
  SC.MAP,
  SC.MAP_UNBALANCED,
  SC.TIMELINE_THROUGH_VERTICAL,
  SC.TIMELINE_SIDED_HORIZONTAL,
  SC.TIMELINE_HORIZONTAL,
  SC.TIMELINE_VERTICAL,
  SC.FISHBONE_LEFT_HEADED,
  SC.FISHBONE_RIGHT_HEADED,
  SC.SPREADSHEET,
  SC.COLUMN_SPREADSHEET,
  SC.BRACE_LEFT,
  SC.BRACE_RIGHT,
  SC.TOP_TITLE_TREE_TABLE,
  SC.TREE_TABLE,
]

/** SB MAP_LIKE_STRUCTURES */
export const MAP_LIKE_STRUCTURES: readonly StructureClass[] = [
  SC.MAP,
  SC.MAP_UNBALANCED,
  SC.MAP_ANTICLOCKWISE,
  SC.MAP_CLOCKWISE,
  SC.MAP_FLOATING,
  SC.MAP_FLOATING_CLOCKWISE,
  SC.MAP_FLOATING_ANTICLOCKWISE,
]

function without(list: readonly StructureClass[], drop: readonly StructureClass[]): StructureClass[] {
  return list.filter((item) => !drop.includes(item))
}

/** SB ATTACHED_EXPOSED_STRUCTURE = EXPOSED 去掉 map 系 */
export const ATTACHED_EXPOSED_STRUCTURE: readonly StructureClass[] =
  without(EXPOSED_STRUCTURE, MAP_LIKE_STRUCTURES)

/** SB LEFT_EXPOSED_STRUCTURE */
export const LEFT_EXPOSED_STRUCTURE: readonly StructureClass[] = without(ATTACHED_EXPOSED_STRUCTURE, [
  SC.LOGIC_RIGHT,
  SC.BRACE_RIGHT,
  SC.FISHBONE_LEFT_HEADED,
  SC.TIMELINE_HORIZONTAL,
  SC.TIMELINE_SIDED_HORIZONTAL,
])

/** SB RIGHT_EXPOSED_STRUCTURE */
export const RIGHT_EXPOSED_STRUCTURE: readonly StructureClass[] = without(ATTACHED_EXPOSED_STRUCTURE, [
  SC.LOGIC_LEFT,
  SC.BRACE_LEFT,
  SC.FISHBONE_RIGHT_HEADED,
])

/** SB TOP_EXPOSED_STRUCTURE（org-chart.up 用） */
export const TOP_EXPOSED_STRUCTURE: readonly StructureClass[] = without(ATTACHED_EXPOSED_STRUCTURE, [
  SC.ORG_CHART_DOWN,
  SC.TIMELINE_VERTICAL,
  SC.TREE_LEFT,
  SC.TREE_RIGHT,
  SC.TIMELINE_THROUGH_VERTICAL,
])

/** SB DOWN_EXPOSED_STRUCTURE */
export const DOWN_EXPOSED_STRUCTURE: readonly StructureClass[] = without(ATTACHED_EXPOSED_STRUCTURE, [
  SC.ORG_CHART_UP,
])

/** SB TREE_LEFT_EXPOSED_STRUCTURE */
export const TREE_LEFT_EXPOSED_STRUCTURE: readonly StructureClass[] = without(LEFT_EXPOSED_STRUCTURE, [
  SC.TIMELINE_VERTICAL,
])

/** SB TREE_RIGHT_EXPOSED_STRUCTURE = RIGHT_EXPOSED_STRUCTURE */
export const TREE_RIGHT_EXPOSED_STRUCTURE: readonly StructureClass[] = RIGHT_EXPOSED_STRUCTURE

/** SB TREE_TABLE_EXPOSED_STRUCTURE */
export const TREE_TABLE_EXPOSED_STRUCTURE: readonly StructureClass[] = without(ATTACHED_EXPOSED_STRUCTURE, [
  SC.SPREADSHEET,
  SC.COLUMN_SPREADSHEET,
])

/** SB TREE_TABLE_GROUP_LIST */
export const TREE_TABLE_GROUP_LIST: readonly StructureClass[] = [SC.TREE_TABLE, SC.TOP_TITLE_TREE_TABLE]

/** SB MATRIX_GROUP_LIST（spreadsheet / spreadsheet.column） */
export const MATRIX_GROUP_LIST: readonly StructureClass[] = [SC.SPREADSHEET, SC.COLUMN_SPREADSHEET]

/**
 * SB TABLE_LIKE_STRUCTURE_LIST = TREE_TABLE_GROUP_LIST + MATRIX_GROUP_LIST。
 * `abstractstructure.isSpecialOffSetBranchView` 判的就是这两组
 * （matrix 主分支 / treetable 头分支）⇒ logic·map 宿主的 X maxOffset 要按它分流。
 */
export const TABLE_LIKE_STRUCTURE_LIST: readonly StructureClass[] = [
  ...TREE_TABLE_GROUP_LIST,
  ...MATRIX_GROUP_LIST,
]

/** SB SIMILAR_STRUCTURE_MAP（preset 不在 available 里时试它的镜像） */
export const SIMILAR_STRUCTURE_MAP: Record<string, StructureClass> = {
  [SC.FISHBONE_LEFT_HEADED]: SC.FISHBONE_RIGHT_HEADED,
  [SC.FISHBONE_RIGHT_HEADED]: SC.FISHBONE_LEFT_HEADED,
  [SC.BRACE_LEFT]: SC.BRACE_RIGHT,
  [SC.BRACE_RIGHT]: SC.BRACE_LEFT,
  [SC.LOGIC_LEFT]: SC.LOGIC_RIGHT,
  [SC.LOGIC_RIGHT]: SC.LOGIC_LEFT,
  [SC.ORG_CHART_DOWN]: SC.ORG_CHART_UP,
  [SC.ORG_CHART_UP]: SC.ORG_CHART_DOWN,
}

/**
 * SB 各 structure 的 `getAvailableChildStructure`（逐条抄，含覆写与继承 AbstractStructure 的默认值）：
 *
 * | 父结构 | available |
 * |---|---|
 * | logic.right | RIGHT_EXPOSED |
 * | logic.left | LEFT_EXPOSED |
 * | tree.right | TREE_RIGHT_EXPOSED（= RIGHT_EXPOSED） |
 * | tree.left | TREE_LEFT_EXPOSED |
 * | org-chart.down | ATTACHED_EXPOSED 去掉 `org-chart.up*`（**前缀**匹配） |
 * | org-chart.up | TOP_EXPOSED |
 * | map 系 | 按子分支在左/右：RIGHT_EXPOSED / LEFT_EXPOSED |
 * | timeline.vertical（treesided） | 按子分支在左/右：TREE_RIGHT_EXPOSED / TREE_LEFT_EXPOSED |
 * | timeline.horizontal / .up / .down / sided.horizontal / through.vertical | **[]** |
 * | treetable / treetable.toptitle | TREE_TABLE_EXPOSED 去掉另一张表（同组只留自己） |
 * | spreadsheet / spreadsheet.column | **[]** |
 * | fishbone.leftHeaded / rightHeaded | 只有自己的 top/bone 私有结构 |
 * | fishbone 主骨 | RIGHT_EXPOSED / LEFT_EXPOSED（按 direction） |
 * | brace.left / brace.right | **LEFT_EXPOSED / RIGHT_EXPOSED** —— `BraceLeft = Object.assign({}, logicLeft, …)`，
 *   自己没写 getAvailableChildStructure ⇒ 继承 logicLeft/logicRight 的那张表。
 *   实测 test-brace-left（skeleton mainTopic = logic.right）：SB 给 d1 的 available 只有 13 项
 *   = LEFT_EXPOSED，preset logic.right 不在里面 → 镜像 logic.left ⇒ **eff = logic.left**。
 *   （曾按「无覆写 = ATTACHED_EXPOSED」实现 ⇒ 判成 logic.right ⇒ test-brace-left 0 → 240.4） |
 * | spreadsheet.row 等私有/无覆写 | ATTACHED_EXPOSED（AbstractStructure 默认） |
 *
 * ⚠️ `[]` 的那几个 ⇒ **任何 preset 都不可用** ⇒ 子结构一律走 getChildStructure
 * （timeline.horizontal → .up/.down；through.vertical / sided.horizontal → logic.left/right 交替）。
 */
export function getAvailableChildStructure(
  parentStructure: StructureClass | null,
  opts: { childIsRight?: boolean } = {},
): readonly StructureClass[] {
  switch (parentStructure) {
    case SC.LOGIC_RIGHT:
    case SC.BRACE_RIGHT: // BraceRight = Object.assign({}, logicRight, …) → 继承它的表
      return RIGHT_EXPOSED_STRUCTURE
    case SC.LOGIC_LEFT:
    case SC.BRACE_LEFT: // BraceLeft = Object.assign({}, logicLeft, …)
      return LEFT_EXPOSED_STRUCTURE
    case SC.TREE_RIGHT:
      return TREE_RIGHT_EXPOSED_STRUCTURE
    case SC.TREE_LEFT:
      return TREE_LEFT_EXPOSED_STRUCTURE
    case SC.ORG_CHART_DOWN:
      // SB orgchartdown: `item.indexOf("org.xmind.ui.org-chart.up") === 0` —— 前缀匹配
      return ATTACHED_EXPOSED_STRUCTURE.filter((item) => !item.startsWith(SC.ORG_CHART_UP))
    case SC.ORG_CHART_UP:
      return TOP_EXPOSED_STRUCTURE
    case SC.MAP:
    case SC.MAP_CLOCKWISE:
    case SC.MAP_ANTICLOCKWISE:
    case SC.MAP_UNBALANCED:
    case SC.MAP_FLOATING:
    case SC.MAP_FLOATING_CLOCKWISE:
    case SC.MAP_FLOATING_ANTICLOCKWISE:
      return opts.childIsRight === false ? LEFT_EXPOSED_STRUCTURE : RIGHT_EXPOSED_STRUCTURE
    case SC.TIMELINE_VERTICAL:
      return opts.childIsRight === false ? TREE_LEFT_EXPOSED_STRUCTURE : TREE_RIGHT_EXPOSED_STRUCTURE
    case SC.TIMELINE_HORIZONTAL:
    case SC.TIMELINE_HORIZONTAL_UP:
    case SC.TIMELINE_HORIZONTAL_DOWN:
    case SC.TIMELINE_SIDED_HORIZONTAL:
    case SC.TIMELINE_THROUGH_VERTICAL:
    case SC.SPREADSHEET:
    case SC.COLUMN_SPREADSHEET:
      return []
    case SC.TREE_TABLE:
    case SC.TOP_TITLE_TREE_TABLE:
      // SB treetable: 同组（treetable / toptitle）里只留自己
      return TREE_TABLE_EXPOSED_STRUCTURE.filter(
        (structure) => !TREE_TABLE_GROUP_LIST.includes(structure) || structure === parentStructure,
      )
    default:
      // brace.left / brace.right / fishbone 主骨 等无覆写或按方向；TM 只在有委派入口的宿主里用到
      return ATTACHED_EXPOSED_STRUCTURE
  }
}

/**
 * SB `utils/branch.getViewStructure` 的 attached 分支部分：
 *
 * ```js
 * if (isDef(presetStructure)) {
 *   const structs = parentStructObj.getAvailableChildStructure(parentBranchView, view)
 *   if (structs.includes(presetStructure)) return presetStructure
 *   const similar = SIMILAR_STRUCTURE_MAP[presetStructure]
 *   if (isDef(similar) && structs.includes(similar)) return similar
 *   return parentStructObj.getChildStructure(parentStructure, index, parentBranchView)
 * }
 * return parentStructObj.getChildStructure(parentStructure, index, parentBranchView)
 * ```
 *
 * `getChildStructure` 的默认实现（AbstractStructure）就是 `return parentStructure`；
 * 覆写了的只有 map 系 / timeline 系 / timelinevertical（按 index 定侧）。
 * 这里只处理「默认 = 继承父结构」的情形，需要按 index 定侧的宿主自己算。
 */
export function resolveChildStructure(
  parentStructure: StructureClass | null,
  preset: StructureClass | null,
  opts: { childIsRight?: boolean } = {},
): StructureClass | null {
  if (!preset) return parentStructure
  const available = getAvailableChildStructure(parentStructure, opts)
  if (available.includes(preset)) return preset
  const similar = SIMILAR_STRUCTURE_MAP[preset]
  if (similar && available.includes(similar)) return similar
  return parentStructure
}

/**
 * SB `figures/renderengine/svg/topicshapes/utils.getStartDirection(parentBranchView, childBranchView)`。
 *
 * ⚠️ org-chart 的调用点是 `getStartDirection(childBranch, undefined)` —— **第一个参数传的是子分支**，
 * 所以 switch 判的是「子分支自己的生效结构」，第二参数 undefined ⇒ default 分支直接 `return RIGHT`。
 * org-chart 用它决定 `currentAllHeight` 走哪套口径（水平生长的子分支要把主题盒切一半）：
 *   LEFT/RIGHT → maxOffset + topicBounds.height/2 + restSize；UP/DOWN → maxOffset + bb.height
 * 注意 **tree.left/tree.right 在这里算 DOWN**（纵向），brace.* 落到 default ⇒ RIGHT（横向）。
 */
export function getStartDirectionOf(eff: StructureClass | null): 'right' | 'left' | 'up' | 'down' {
  switch (eff) {
    case SC.LOGIC_RIGHT:
    case SC.TIMELINE_HORIZONTAL:
    case SC.TIMELINE_SIDED_HORIZONTAL:
      return 'right'
    case SC.LOGIC_LEFT:
      return 'left'
    case SC.ORG_CHART_UP:
    case SC.TIMELINE_HORIZONTAL_UP:
      return 'up'
    case SC.ORG_CHART_DOWN:
    case SC.TREE_LEFT:
    case SC.TREE_RIGHT:
    case SC.TIMELINE_VERTICAL:
    case SC.TIMELINE_HORIZONTAL_DOWN:
    case SC.TIMELINE_THROUGH_VERTICAL:
      return 'down'
    default:
      // brace.* / treetable / map 系 / fishbone…：SB 走到 `if (!childBranchView) return RIGHT`
      return 'right'
  }
}

/** getStartDirection 是 LEFT/RIGHT ⇒ 子分支水平生长（org-chart 的 currentAllHeight 走 restSize 口径） */
export function isHorizontalStart(eff: StructureClass | null): boolean {
  const d = getStartDirectionOf(eff)
  return d === 'left' || d === 'right'
}
