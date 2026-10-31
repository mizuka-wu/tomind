/**
 * TM 侧的子树委派分派 —— SB 的结构表与解析在 `@tomind/style` 的 `structure-class.ts`
 * （样式层也要用同一份「生效结构」语义，见那个文件的注释）。
 *
 * 这里只回答一个问题：**某个生效结构类，TM 有没有「独立子树布局入口」可以整棵交出去？**
 * 有 → 返回委派方式，宿主调用 `subtree-delegate.layoutDelegatedSubtree`；
 * 没有（timeline 的其余变体 / map 系 / fishbone / spreadsheet 系）→ 返回 null，宿主自己递归（已知差距，见 skill）。
 */
export {
  SC,
  EXPOSED_STRUCTURE,
  MAP_LIKE_STRUCTURES,
  ATTACHED_EXPOSED_STRUCTURE,
  LEFT_EXPOSED_STRUCTURE,
  RIGHT_EXPOSED_STRUCTURE,
  TOP_EXPOSED_STRUCTURE,
  DOWN_EXPOSED_STRUCTURE,
  TREE_LEFT_EXPOSED_STRUCTURE,
  TREE_RIGHT_EXPOSED_STRUCTURE,
  TREE_TABLE_EXPOSED_STRUCTURE,
  TREE_TABLE_GROUP_LIST,
  MATRIX_GROUP_LIST,
  TABLE_LIKE_STRUCTURE_LIST,
  SIMILAR_STRUCTURE_MAP,
  getAvailableChildStructure,
  resolveChildStructure,
  getStartDirectionOf,
  isHorizontalStart,
} from '@tomind/style'
export type { StructureClass } from '@tomind/style'
import { SC } from '@tomind/style'
import type { StructureClass } from '@tomind/style'

// ─── TM 侧的委派分派 ───

/** TM 已有「独立子树布局入口」的结构（宿主可以把整棵子树交出去） */
export type DelegableStructure =
  | { kind: 'logic'; side: 'right' | 'left' }
  | { kind: 'brace'; side: 'right' | 'left' }
  | { kind: 'tree'; dir: 'right' | 'left' }
  | { kind: 'org'; dir: 'down' | 'up' }
  | { kind: 'treetable'; topTitle?: boolean }
  | { kind: 'timeline' }
  | { kind: 'throughVertical' }
  | { kind: 'sidedHorizontal' }
  | { kind: 'timelineVertical' }
  | { kind: 'matrix'; transpose?: boolean }
  | { kind: 'fishbone'; headed: 'left' | 'right' }

/**
 * 生效结构类 → TM 的委派方式。**只有 map 系返回 null**（2026-10-31 第七轮把
 * sided.horizontal / through.vertical / timeline.vertical / spreadsheet(.column) / fishbone
 * 五个入口全补齐了），由宿主自己递归。
 * ⚠️ map 系其实**到不了这里**：MAP_LIKE_STRUCTURES 被 ATTACHED_EXPOSED 排除 ⇒
 * 任何 attached 子分支的生效结构都不可能是 map.*（实测 probe-treetable×map.clockwise
 * 声明无效、n=235/235、Δ 全 0）。
 *
 * ⚠️ 返回 null 对「宿主自己递归」的那几个（logic / tree / org / brace / map）只是 Δ 差距，
 * 但对**有 stop 格/cell 的宿主**（treetable / spreadsheet / fishbone）就是**丢节点**
 * （n 造假）⇒ 每补一个入口都要回头看那三处 fallback。
 *
 * brace.left/right 也算有入口：SB `braceleftandright` 就是 `underscore.extend({}, logicLeftAndRight, …)`，
 * 堆叠/居中公式与 logic 逐字相同，唯一差异是 calcSpacingMajor 里
 * `isBraceStructure(branch) && !hasArrow → LINE.LINE_SPACING(16)`（utils/line.getLineEndSpacing）。
 * ⇒ 复用 logic 的子树入口，只多传一个「本层是 brace」的标记。
 */
export function delegationOf(eff: StructureClass | null): DelegableStructure | null {
  switch (eff) {
    case SC.LOGIC_RIGHT:
      return { kind: 'logic', side: 'right' }
    case SC.LOGIC_LEFT:
      return { kind: 'logic', side: 'left' }
    case SC.BRACE_RIGHT:
      return { kind: 'brace', side: 'right' }
    case SC.BRACE_LEFT:
      return { kind: 'brace', side: 'left' }
    case SC.TREE_RIGHT:
      return { kind: 'tree', dir: 'right' }
    case SC.TREE_LEFT:
      return { kind: 'tree', dir: 'left' }
    case SC.ORG_CHART_DOWN:
      return { kind: 'org', dir: 'down' }
    case SC.ORG_CHART_UP:
      return { kind: 'org', dir: 'up' }
    // treetable 有子树入口（2026-10-30 第六轮：宿主改成 SB 的通用表格算法后顺手抽出来的）。
    // toptitle 是同一套表格机器的变体（标题行横跨整张表 + bounds.height 收尾不同）
    case SC.TREE_TABLE:
      return { kind: 'treetable' }
    case SC.TOP_TITLE_TREE_TABLE:
      return { kind: 'treetable', topTitle: true }
    // timeline.horizontal 有子树入口（轴布局本身）。
    // ⚠️ .up / .down 不在 EXPOSED_STRUCTURE 里 ⇒ 生效结构不可能是它们（只有轴自己的
    //    getChildStructure 会给），所以这里不需要分方向；sided.horizontal /
    //    through.vertical / vertical 仍是 null（TM 没抽子树入口，见 skill）
    case SC.TIMELINE_HORIZONTAL:
      return { kind: 'timeline' }
    // timeline.through.vertical 有子树入口（2026-10-31 第七轮）：轴只有**一层**
    // （available = [] ⇒ 轴子节点一律 logic.left/right 交替），抽入口的成本极低，
    // 而不抽的代价是宿主的 stop 格/cell/骨子分支 fallback **只放一个盒**⇒ 丢节点
    // （实测 treetable× n=203/235、spreadsheet× n=220/235、fishbone× n=220/235）。
    case SC.TIMELINE_THROUGH_VERTICAL:
      return { kind: 'throughVertical' }
    // timeline.sided.horizontal 有子树入口（2026-10-31 第七轮：轴布局按 SB 整条重写后抽出来的）
    case SC.TIMELINE_SIDED_HORIZONTAL:
      return { kind: 'sidedHorizontal' }
    // timeline.vertical（SB TREESIDED，同一个字符串）有子树入口（2026-10-31 第七轮）
    case SC.TIMELINE_VERTICAL:
      return { kind: 'timelineVertical' }
    // spreadsheet / spreadsheet.column 有子树入口（2026-10-31 第七轮）：
    // SB 两张表是同一套机器，只差 `_needTranspose`（columnSpreadsheet = true）
    case SC.SPREADSHEET:
      return { kind: 'matrix' }
    case SC.COLUMN_SPREADSHEET:
      return { kind: 'matrix', transpose: true }
    // fishbone 有子树入口（2026-10-31 第七轮：补了 SB `_calcBounds` 的鱼头 bounds）
    case SC.FISHBONE_LEFT_HEADED:
      return { kind: 'fishbone', headed: 'left' }
    case SC.FISHBONE_RIGHT_HEADED:
      return { kind: 'fishbone', headed: 'right' }
    default:
      return null
  }
}
