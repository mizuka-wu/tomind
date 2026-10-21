/**
 * TM 侧的子树委派分派 —— SB 的结构表与解析在 `@tomind/style` 的 `structure-class.ts`
 * （样式层也要用同一份「生效结构」语义，见那个文件的注释）。
 *
 * 这里只回答一个问题：**某个生效结构类，TM 有没有「独立子树布局入口」可以整棵交出去？**
 * 有 → 返回委派方式，宿主调用 `subtree-delegate.layoutDelegatedSubtree`；
 * 没有（timeline.* / treetable / map 系 / fishbone）→ 返回 null，宿主自己递归（已知差距，见 skill）。
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

/**
 * 生效结构类 → TM 的委派方式；TM 没有对应子树入口的（timeline.* / treetable /
 * map 系 / fishbone）返回 null，由宿主自己递归（已知差距，见 skill）。
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
    default:
      return null
  }
}
