/**
 * connection-geometry — 父子连线（branch connection）的锚点与路径计算
 *
 * 对齐 snowbrush 的实现，SB 侧分散在 5 个地方：
 * - `figures/renderengine/svg/topicshapes/utils.ts`
 *   getStartDirection / getEndDirection / getJointPosition / END_OFFSET / addPositionByDirection /
 *   getLineFocusType / pureOffsetPointCalcFnMap(diver|order) / isBoundsIntersect
 * - `figures/renderengine/svg/topicshapes/abstracttopicshape.ts`
 *   getStartAnchorPosition / getControlPosition / getEndAnchorPosition / getCtrlPoint(LINECOLPOS)
 * - `structures/abstractstructure.ts` drawAttachedConnectLine
 *   （lineWidth === 0 → none；org-chart up/down → special 用 vertical brush）
 * - `render/topiclinestyle/*`（每种 line-class 的 brush 选择 + 参数 + 兄弟「干线共享」规则）
 * - `render/brushes.ts`（具体 path 公式）
 *
 * 纯函数、不依赖 leafer：既给渲染层用，也能被 vitest 和 render-compare 的 parity 工具直接调用。
 *
 * 坐标系：全部使用**布局绝对坐标**（盒左上角为 (x, y)），输出 path 也是绝对坐标，
 * 由调用方（渲染层）自行平移到父 element 的局部坐标系。
 *
 * ⚠️ 已知差距：SB 的锚点基于 `topicView.shapeBounds`（不含 labels），TM 的布局盒含 labels 高度，
 * 且 shapeHeight 未透出到 NodeLayout → 带 labels 的节点在 down 方向锚点会差一个 labels 高度(24)。
 */

export interface ConnPoint {
  x: number
  y: number
}

export interface ConnBox {
  x: number
  y: number
  width: number
  height: number
}

export type ConnDirection = 'left' | 'right' | 'up' | 'down'

/** 参与连线计算的一侧（父或子）的样式输入 */
export interface ConnSideStyle {
  /** 生效结构类（SB branchView.getStructureClass()），URI 或 tomind 短名均可 */
  structureClass?: string | null
  /** 形状类（getLineFocusType 判定 divergent/order 线用），URI 或短名均可 */
  shapeClass?: string | null
  /** 父的 line-class 决定线型；子侧忽略 */
  lineClass?: string | null
  /** 父的 line-width：0 → 不画线（SB drawAttachedConnectLine） */
  lineWidth?: number
  /** 子的 line-corner：roundedElbow 的圆角半径（SB getAdditionalParams 取 child.figure.lineCorner） */
  lineCorner?: number
  /** 父的 arrow-end-class：有箭头时线尾要留出箭头位置（SB getLineEndSpacingPatchPoint） */
  arrowEndClass?: string | null
}

export interface ConnectionGeometryInput {
  /** 父主题盒（绝对坐标） */
  parentBox: ConnBox
  /** 子主题盒（绝对坐标） */
  childBox: ConnBox
  parentStyle: ConnSideStyle
  childStyle?: ConnSideStyle
  /** 父的所有 attached 子节点盒（顺序 = attached 顺序）：map 的 diver/order 出线点 + 兄弟干线共享要用 */
  siblingBoxes: ConnBox[]
  /** 该子节点在 siblingBoxes 里的下标 */
  childIndex: number
  /** 父是否中央分支（SB isCentralBranch）：fold/roundedfold 的 tree 比例排除中央分支 */
  parentIsCentral?: boolean
  /** SB isLineTapered(parent)：sheet line-tapered + 中央分支。true 时走锥形（填充）线 */
  tapered?: boolean
}

export interface ConnectionGeometry {
  startPt: ConnPoint
  ctrlPt: ConnPoint
  endPt: ConnPoint
  /** 出线方向（箭头朝向 / 锥形线判定用） */
  startDirection: ConnDirection
  /** 入线方向（SB getEndDirection） */
  endDirection: ConnDirection
  /** 绝对坐标 path；空串表示不画（none / lineWidth 0 / 中间兄弟的 brace） */
  path: string
  /** 归一化后的线型短名 */
  lineShape: string
  /** 是否走了「锥形线」分支（当前未实现锥形公式，见文件尾说明） */
  tapered: boolean
}

// ==================== SB 常量 ====================

/** SB layoutConstant.LINECOLPOS */
const LINECOLPOS = 13
/** SB topicshapes/utils END_OFFSET */
const END_OFFSET = -1
/** SB brushes DEFAULT_SE_RATIO（skewElbow / fold） */
const DEFAULT_SE_RATIO = 2 / 3
/** SB fold.ts TREE_SE_RATIO */
const TREE_SE_RATIO = 0.5
/** SB brushes DEFAULT_HO_RATIO（horn / roundedfold） */
const DEFAULT_HO_RATIO = 1 / 2
/** SB roundedfold.ts TREE_HO_RATIO */
const TREE_HO_RATIO = 0.4
/** SB bight.ts KEY_DEGREES / brace2、brace3 的 25° */
const BRACE_KEY_DEGREES = 25

// ==================== 结构类 / 线型 / 形状归一化 ====================

/** SB STRUCTURECLASS（URI）→ 内部规范名 */
const STRUCTURE_URI_MAP: Record<string, string> = {
  'org.xmind.ui.logic.right': 'logic-right',
  'org.xmind.ui.logic.left': 'logic-left',
  'org.xmind.ui.logic-chart.right': 'logic-right',
  'org.xmind.ui.logic-chart.left': 'logic-left',
  'org.xmind.ui.tree.right': 'tree-right',
  'org.xmind.ui.tree.left': 'tree-left',
  'org.xmind.ui.timeline.vertical': 'tree-sided',
  'org.xmind.ui.org-chart.down': 'org-chart-down',
  'org.xmind.ui.org.down': 'org-chart-down',
  'org.xmind.ui.org': 'org-chart-down',
  'org.xmind.ui.org-chart.up': 'org-chart-up',
  'org.xmind.ui.org.up': 'org-chart-up',
  'org.xmind.ui.map.clockwise': 'map-clockwise',
  'org.xmind.ui.map.anticlockwise': 'map-anticlockwise',
  'org.xmind.ui.map': 'map',
  'org.xmind.ui.map.unbalanced': 'map-unbalanced',
  'org.xmind.ui.map.floating': 'map-floating',
  'org.xmind.ui.map.floating.clockwise': 'map-floating-clockwise',
  'org.xmind.ui.map.floating.anticlockwise': 'map-floating-anticlockwise',
  'org.xmind.ui.timeline.through.vertical': 'timeline-through-vertical',
  'org.xmind.ui.timeline.sided.horizontal': 'timeline-sided-horizontal',
  'org.xmind.ui.timeline.horizontal': 'timeline-horizontal',
  'org.xmind.ui.timeline.horizontal.up': 'timeline-horizontal-up',
  'org.xmind.ui.timeline.horizontal.down': 'timeline-horizontal-down',
  'org.xmind.ui.fishbone.leftHeaded': 'fishbone-left-headed',
  'org.xmind.ui.fishbone.rightHeaded': 'fishbone-right-headed',
  'org.xmind.ui.fishbone.structure.lefthead.topbone': 'left-head-top-bone',
  'org.xmind.ui.fishbone.structure.lefthead.bottombone': 'left-head-bottom-bone',
  'org.xmind.ui.fishbone.structure.righthead.topbone': 'right-head-top-bone',
  'org.xmind.ui.fishbone.structure.righthead.bottombone': 'right-head-bottom-bone',
  'org.xmind.ui.fishbone.leftHeaded.top': 'fishbone-left-head-top',
  'org.xmind.ui.fishbone.leftHeaded.bottom': 'fishbone-left-head-bottom',
  'org.xmind.ui.fishbone.rightHeaded.top': 'fishbone-right-head-top',
  'org.xmind.ui.fishbone.rightHeaded.bottom': 'fishbone-right-head-bottom',
  'org.xmind.ui.spreadsheet': 'spreadsheet',
  'org.xmind.ui.spreadsheet.column': 'column-spreadsheet',
  'org.xmind.ui.structure.spreadsheet.row': 'spreadsheet-row',
  'org.xmind.ui.structure.column.spreadsheet': 'spreadsheet-column',
  'org.xmind.ui.treetable': 'treetable',
  'org.xmind.ui.treetable.toptitle': 'treetable-toptitle',
  'org.xmind.ui.brace.right': 'brace-right',
  'org.xmind.ui.brace.left': 'brace-left',
}

/** tomind 布局算法名 → 内部规范名（布局层用的是这套短名） */
const STRUCTURE_TM_MAP: Record<string, string> = {
  'logic-right': 'logic-right',
  'logic-left': 'logic-left',
  'tree-right': 'tree-right',
  'tree-left': 'tree-left',
  'tree-sided': 'tree-sided',
  'org-chart-down': 'org-chart-down',
  'org-chart-up': 'org-chart-up',
  'map-clockwise': 'map-clockwise',
  'map-anticlockwise': 'map-anticlockwise',
  'map': 'map',
  'map-unbalanced': 'map-unbalanced',
  'timeline-through-vertical': 'timeline-through-vertical',
  'timeline-sided-horizontal': 'timeline-sided-horizontal',
  'timeline-horizontal': 'timeline-horizontal',
  'timeline-vertical': 'timeline-vertical',
  'fishbone-left': 'fishbone-left-headed',
  'fishbone-right': 'fishbone-right-headed',
  'fishbone-left-headed': 'fishbone-left-headed',
  'fishbone-right-headed': 'fishbone-right-headed',
  'treetable': 'treetable',
  'matrix': 'spreadsheet',
  'brace-right': 'brace-right',
  'brace-left': 'brace-left',
}

/** 归一化结构类；无法识别时原样返回（isMapStructure 之类的判定仍能工作） */
export function normalizeStructureClass(value?: string | null): string {
  if (typeof value !== 'string' || !value) return ''
  return STRUCTURE_URI_MAP[value] ?? STRUCTURE_TM_MAP[value] ?? value
}

const LINE_CLASS_PREFIX = 'org.xmind.branchConnection.'
/** SB BRANCHCONNECTION.HORIZONTAL 的 URI 与短名不同名 */
const LINE_CLASS_ALIAS: Record<string, string> = {
  'timeline.horizontal': 'horizontal',
  'balloon.roundedRect': 'balloon.roundedRect',
}

/** 归一化 line-class（SB BRANCHCONNECTION 值 → 短名） */
export function normalizeLineClass(value?: string | null): string {
  if (typeof value !== 'string' || !value) return ''
  const short = value.startsWith(LINE_CLASS_PREFIX) ? value.slice(LINE_CLASS_PREFIX.length) : value
  return LINE_CLASS_ALIAS[short] ?? short
}

const SHAPE_CLASS_PREFIXES = ['org.xmind.topicShape.', 'org.xmind.calloutTopicShape.']

/** 归一化 shape-class → 短名（roundedRect / underline / cloud / …） */
export function normalizeShapeClass(value?: string | null): string {
  if (typeof value !== 'string' || !value) return ''
  for (const p of SHAPE_CLASS_PREFIXES) {
    if (value.startsWith(p)) return value.slice(p.length)
  }
  return value
}

/** SB BRACE_BRANCH_CONNECTION（5 种大括号线） */
const BRACE_LINE_CLASSES = new Set(['brace', 'brace2', 'brace3', 'brace4', 'brace5'])

// ==================== 基础几何（SB commonUtils / topicshapes utils） ====================

function boxCenter(b: ConnBox): ConnPoint {
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}

function addPoint(a: ConnPoint, b: ConnPoint): ConnPoint {
  return { x: a.x + b.x, y: a.y + b.y }
}

/** SB addPositionByDirection(position, direction, dx, dy = dx) */
function addPositionByDirection(p: ConnPoint, dir: ConnDirection, dx: number, dy = dx): ConnPoint {
  const out = { x: p.x, y: p.y }
  switch (dir) {
    case 'left': out.x -= dx; break
    case 'right': out.x += dx; break
    case 'up': out.y -= dy; break
    case 'down': out.y += dy; break
  }
  return out
}

/**
 * SB getJointPosition(bounds, direction)：
 * 方向轴取盒边，另一轴取 0（= 主题盒原点 = shape 中心）。
 */
function getJointPosition(box: ConnBox, dir: ConnDirection): ConnPoint {
  const c = boxCenter(box)
  switch (dir) {
    case 'left': return { x: box.x, y: c.y }
    case 'right': return { x: box.x + box.width, y: c.y }
    case 'up': return { x: c.x, y: box.y }
    case 'down': return { x: c.x, y: box.y + box.height }
  }
}

// ==================== 方向判定 ====================

/** SB topicshapes/utils.getStartDirection */
export function getStartDirection(parentStructure: string, parentCenter: ConnPoint, childCenter: ConnPoint): ConnDirection {
  switch (parentStructure) {
    case 'logic-right':
    case 'timeline-horizontal':
    case 'timeline-sided-horizontal':
      return 'right'
    case 'logic-left':
      return 'left'
    case 'org-chart-up':
    case 'timeline-horizontal-up':
      return 'up'
    case 'org-chart-down':
    case 'tree-left':
    case 'tree-right':
    case 'tree-sided':
    case 'timeline-vertical':
    case 'timeline-horizontal-down':
    case 'timeline-through-vertical':
      return 'down'
    default:
      break
  }
  return childCenter.x < parentCenter.x ? 'left' : 'right'
}

/** SB topicshapes/utils.getEndDirection（timeline-sided-horizontal 的 reverse 分支见下方注释） */
export function getEndDirection(parentStructure: string, parentCenter: ConnPoint, childCenter: ConnPoint): ConnDirection {
  // SB: TIMELINESIDEDHORIZONTAL → getReverseDir(getFinalTimelineChildDirection(parent, index))
  // 需要 timeline 的上下分组信息（boundary/summary 参与），无 fixture 覆盖 → 落到位置判定。
  switch (parentStructure) {
    case 'logic-right':
    case 'tree-right':
    case 'timeline-horizontal':
    case 'timeline-horizontal-up':
    case 'timeline-horizontal-down':
    case 'left-head-top-bone':
    case 'left-head-bottom-bone':
      return 'left'
    case 'logic-left':
    case 'tree-left':
    case 'right-head-top-bone':
    case 'right-head-bottom-bone':
      return 'right'
    case 'org-chart-up':
      return 'down'
    case 'org-chart-down':
    case 'timeline-through-vertical':
      return 'up'
    default:
      break
  }
  return childCenter.x < parentCenter.x ? 'right' : 'left'
}

// ==================== 出线点聚拢类型（map 专用） ====================

const LINE_FOCUS_TYPE = { DIVER: 'DIVER_LINE', ORDER: 'ORDER_LINE', FOCUS: 'FOCUS_LINE' } as const
type LineFocusType = typeof LINE_FOCUS_TYPE[keyof typeof LINE_FOCUS_TYPE]

const UNDERLINE_DIVERGENCE = ['roundedElbow', 'curve', 'elbow']
const DIVERGENCE = UNDERLINE_DIVERGENCE.concat(['straight', 'fold', 'roundedfold'])
const BIGHT_DIVERGENCE = DIVERGENCE.concat(['bight'])

/** SB isMapStructure：structure.indexOf('map') !== -1 */
function isMapStructure(structure: string): boolean {
  return structure.indexOf('map') !== -1
}

function isDivergentLine(shapeStyle: string, lineStyle: string): boolean {
  const arr = shapeStyle === 'underline'
    ? UNDERLINE_DIVERGENCE
    : (shapeStyle === 'cloud' || shapeStyle === 'parallelogram') ? BIGHT_DIVERGENCE : DIVERGENCE
  return arr.indexOf(lineStyle) >= 0
}

function isOrderLine(shapeStyle: string, lineStyle: string): boolean {
  const arr = ['underline', 'diamond', 'hexagon', 'parallelogram'].includes(shapeStyle) ? [] : ['bight']
  return arr.indexOf(lineStyle) >= 0
}

/** SB getLineFocusType(branchView) */
export function getLineFocusType(structure: string, shapeClass: string, lineClass: string): LineFocusType {
  if (!isMapStructure(structure)) return LINE_FOCUS_TYPE.FOCUS
  if (isDivergentLine(shapeClass, lineClass)) return LINE_FOCUS_TYPE.DIVER
  if (isOrderLine(shapeClass, lineClass)) return LINE_FOCUS_TYPE.ORDER
  return LINE_FOCUS_TYPE.FOCUS
}

/**
 * SB topicshapes/utils 里的反比例函数 _f：
 * |y| <= 100 时恒为 p1，随 |y| 增大趋近 p2，且 f(600) = (p1-p2)*0.1 处过渡。
 */
function inverseProportion(y: number, p1In: number, p2In: number): number {
  const y0 = 100
  const y1 = 600
  const k = 0.1
  const p1 = Math.abs(p1In)
  const symb = p2In / Math.abs(p2In)
  const ay = Math.abs(y)
  if (ay < y0) return symb * p1
  const p2 = Math.abs(p2In)
  const c = p2
  const b = ((k * p1 + (1 - k) * p2) * y1 - (p1 - p2) * y0) / ((1 - k) * p1 + (k - 2) * p2)
  const a = (p1 - p2) * (y0 + b)
  return symb * (a / (ay + b) + c)
}

/** SB pureOffsetPointCalcFnMap.diver —— map 结构下出线点向主题内部收拢（扇形发散） */
function diverOffset(parentBox: ConnBox, parentCenter: ConnPoint, childCenter: ConnPoint): ConnPoint {
  // SB 用 parent.topicView.bounds（相对主题盒原点）：x = -w/2, width = w
  const relX = -parentBox.width / 2
  const isRight = childCenter.x > parentCenter.x
  const scale = 2 / 3
  const p1 = isRight ? (relX + parentBox.width) * scale : relX * scale
  const p2 = isRight ? 0.1 : -0.1
  const offset = isRight ? relX : -relX
  const deltaX = inverseProportion(childCenter.y - parentCenter.y, p1, p2) + offset
  return { x: deltaX, y: 0 }
}

/** SB isBoundsIntersect(parent)：map 下左右两组子节点的排列方向与起始下标 */
function boundsIntersectInfo(structure: string, siblingBoxes: ConnBox[], parentCenter: ConnPoint) {
  const rightNum = siblingBoxes.filter((b) => boxCenter(b).x > parentCenter.x).length
  const leftNum = siblingBoxes.length - rightNum
  const rightGroupInfo = { dir: 'down' as ConnDirection, length: rightNum, firstIndex: 0 }
  const leftGroupInfo = { dir: 'up' as ConnDirection, length: leftNum, firstIndex: rightNum }
  if (structure === 'map' || structure === 'map-floating') {
    leftGroupInfo.dir = 'down'
  } else if (structure === 'map-anticlockwise' || structure === 'map-floating-anticlockwise') {
    rightGroupInfo.dir = 'up'
    leftGroupInfo.dir = 'down'
    rightGroupInfo.firstIndex = leftNum
    leftGroupInfo.firstIndex = 0
  }
  return { rightGroupInfo, leftGroupInfo }
}

/** SB pureOffsetPointCalcFnMap.order —— map + bight 时出线点在主题边上按序错开 */
function orderOffset(parentBox: ConnBox, info: { num: number; cur: number; dir: ConnDirection }): ConnPoint {
  const { num, cur, dir } = info
  const height = parentBox.height - 5 // SB 注释：不要突出
  let offset = 0
  const step = Math.min(height / (num + 1), 3)
  if (num % 2) {
    const mid = Math.floor(num / 2)
    offset = (cur - mid) * step
  } else {
    const mid = num / 2 - 0.5
    offset = (cur - mid) * step
  }
  if (dir === 'up') offset *= -1
  return { x: 0, y: offset }
}

/** SB offsetPointCalcFnMap.calcSinusStartYPoint */
function sinusStartYOffset(structure: string, parentBox: ConnBox, siblingBoxes: ConnBox[], parentCenter: ConnPoint, childIndex: number): ConnPoint {
  const { rightGroupInfo, leftGroupInfo } = boundsIntersectInfo(structure, siblingBoxes, parentCenter)
  const atRight = rightGroupInfo.firstIndex <= childIndex && childIndex < rightGroupInfo.firstIndex + rightGroupInfo.length
  const groupInfo = atRight ? rightGroupInfo : leftGroupInfo
  return orderOffset(parentBox, {
    num: groupInfo.length,
    cur: childIndex - groupInfo.firstIndex,
    dir: groupInfo.dir,
  })
}

/** SB abstracttopicshape.getLineOffsetPts（DIVER → diver；ORDER → order；FOCUS → 无） */
function lineOffsetPts(
  focusType: LineFocusType,
  structure: string,
  parentBox: ConnBox,
  siblingBoxes: ConnBox[],
  parentCenter: ConnPoint,
  childCenter: ConnPoint,
  childIndex: number,
): ConnPoint[] {
  switch (focusType) {
    case LINE_FOCUS_TYPE.DIVER:
      return [diverOffset(parentBox, parentCenter, childCenter)]
    case LINE_FOCUS_TYPE.ORDER:
      return [sinusStartYOffset(structure, parentBox, siblingBoxes, parentCenter, childIndex)]
    default:
      return []
  }
}

/** SB layoutConstant.LINE.LINE_SPACING / LINE_TIMELINE_THROUGH_SPACING */
const LINE_SPACING = 16
const LINE_TIMELINE_THROUGH_SPACING = 4
/** SB utils/linearrow BaseArrow.arrowSizeRatio（全库无覆盖，恒为 4） */
const ARROW_SIZE_RATIO = 4

/** SB utils/branch.isTimelineThroughStructure（注意：包含 timeline.horizontal） */
function isTimelineThroughStructure(structure: string): boolean {
  return structure === 'timeline-horizontal' || structure === 'timeline-through-vertical'
}

function isBraceStructure(structure: string): boolean {
  return structure === 'brace-left' || structure === 'brace-right'
}

function hasLineEndArrow(arrowEndClass?: string | null): boolean {
  if (typeof arrowEndClass !== 'string' || !arrowEndClass) return false
  const short = arrowEndClass.replace(/^org\.xmind\.arrowShape\./, '')
  return short !== 'none' && short !== ''
}

/**
 * SB 各 structure 的 getChildTargetOrientation（子节点相对父的朝向）。
 * map / timeline-vertical 用 index 与 numRight 比较，这里等价地用几何左右侧。
 */
export function getChildTargetOrientation(
  structure: string,
  isRightSide: boolean,
): ConnDirection {
  if (MAP_LIKE_STRUCTURES.has(structure)) {
    const anticlockwise = structure === 'map-anticlockwise' || structure === 'map-floating-anticlockwise'
    // clockwise/map：index < numRight（右侧）→ LEFT；anticlockwise 相反
    return (isRightSide !== anticlockwise) ? 'left' : 'right'
  }
  switch (structure) {
    case 'logic-left':
    case 'tree-left':
    // SB BraceLeft = Object.assign({}, logicLeft, …) → 继承 logicLeft.getChildTargetOrientation = RIGHT
    case 'brace-left':
    case 'right-head-top-bone':
    case 'right-head-bottom-bone':
      return 'right'
    case 'org-chart-down':
      return 'up'
    case 'org-chart-up':
      return 'down'
    case 'timeline-through-vertical':
      return 'up'
    case 'tree-sided':
      return isRightSide ? 'left' : 'right'
    // 其余（logic-right / tree-right / brace* / timeline-horizontal* / fishbone 左头骨 / treetable / matrix）
    // 都落到 SB abstractstructure 的默认值 LEFT
    default:
      return 'left'
  }
}

/** SB utils/line.getLineEndSpacingPatchPoint：brace 结构或有箭头时，线尾回缩 */
function lineEndSpacingPatchPoint(
  input: ConnectionGeometryInput,
  structure: string,
  endDirection: ConnDirection,
): ConnPoint {
  const arrow = hasLineEndArrow(input.parentStyle.arrowEndClass)
  const brace = isBraceStructure(structure)
  // SB shouldPatchLineSpacing
  if (!brace && !arrow) return { x: 0, y: 0 }

  const lineWidth = Math.trunc(input.parentStyle.lineWidth ?? 1) || 0
  // SB getLineEndSpacing
  let lineEndSpacing: number
  if (brace && !arrow) {
    lineEndSpacing = LINE_SPACING
  } else if (!arrow) {
    lineEndSpacing = 0
  } else {
    const spacing = isTimelineThroughStructure(structure) ? LINE_TIMELINE_THROUGH_SPACING : LINE_SPACING
    lineEndSpacing = lineWidth * ARROW_SIZE_RATIO + spacing
  }

  const parentCenter = boxCenter(input.parentBox)
  const childCenter = boxCenter(input.childBox)
  const isRightSide = childCenter.x >= parentCenter.x
  void endDirection
  switch (getChildTargetOrientation(structure, isRightSide)) {
    case 'right': return { x: lineEndSpacing, y: 0 }
    case 'left': return { x: -lineEndSpacing, y: 0 }
    case 'down': return { x: 0, y: lineEndSpacing }
    case 'up': return { x: 0, y: -lineEndSpacing }
  }
}

// ==================== 锚点 ====================

/**
 * 计算 start/ctrl/end 三个锚点（绝对坐标）。
 * SB: getStartAnchorPosition / getControlPosition / getEndAnchorPosition
 */
export function computeConnectionAnchors(input: ConnectionGeometryInput): {
  startPt: ConnPoint
  ctrlPt: ConnPoint
  endPt: ConnPoint
  startDirection: ConnDirection
  endDirection: ConnDirection
  focusType: LineFocusType
} {
  const structure = normalizeStructureClass(input.parentStyle.structureClass)
  const shapeClass = normalizeShapeClass(input.parentStyle.shapeClass)
  const lineClass = normalizeLineClass(input.parentStyle.lineClass)
  const parentCenter = boxCenter(input.parentBox)
  const childCenter = boxCenter(input.childBox)

  const startDirection = getStartDirection(structure, parentCenter, childCenter)
  const endDirection = getEndDirection(structure, parentCenter, childCenter)
  const focusType = getLineFocusType(structure, shapeClass, lineClass)

  // startPt = 父盒在 startDirection 上的关节点 + 出线点偏移
  const basePt = getJointPosition(input.parentBox, startDirection)
  const offsets = lineOffsetPts(focusType, structure, input.parentBox, input.siblingBoxes, parentCenter, childCenter, input.childIndex)
  const startPt = offsets.reduce(addPoint, basePt)

  // ctrlPt：非 FOCUS_LINE（map 的 diver/order）时与 startPt 重合；
  // FOCUS_LINE 时在关节点基础上沿方向外推 LINECOLPOS（bight 例外，直接用关节点）
  let ctrlPt: ConnPoint
  if (focusType !== LINE_FOCUS_TYPE.FOCUS) {
    ctrlPt = startPt
  } else if (lineClass === 'bight') {
    ctrlPt = basePt
  } else {
    ctrlPt = addPositionByDirection(basePt, startDirection, LINECOLPOS)
  }

  // endPt = 子盒在 endDirection 上的关节点，再沿方向回退 1（END_OFFSET）
  const endBase = getJointPosition(input.childBox, endDirection)
  let endPt = addPositionByDirection(endBase, endDirection, END_OFFSET)

  // ── SB topicshapes/index.ts PositionWrapper.wrapLineEndSpacingPatch ──
  // 每个 shape 的 getEndAnchorPosition 都被包了一层：
  //   1) brace 结构：x 直接取子盒的靠父侧边缘（覆盖掉 END_OFFSET）
  //   2) 再叠加 getLineEndSpacingPatchPoint(parent, child)：brace 结构或有箭头时，
  //      线尾沿「子节点朝向」回缩 lineEndSpacing（brace 无箭头 = 16；有箭头 = lineWidth*4 + 16/4）
  if (structure === 'brace-right') {
    endPt = { x: input.childBox.x, y: endPt.y }
  } else if (structure === 'brace-left') {
    endPt = { x: input.childBox.x + input.childBox.width, y: endPt.y }
  }
  const patch = lineEndSpacingPatchPoint(input, structure, endDirection)
  endPt = { x: endPt.x + patch.x, y: endPt.y + patch.y }

  return { startPt, ctrlPt, endPt, startDirection, endDirection, focusType }
}

// ==================== brushes（SB render/brushes.ts，非锥形部分） ====================

interface LinePositions {
  startPt: ConnPoint
  ctrlPt: ConnPoint
  endPt: ConnPoint
}

function curveHorizon(lp: LinePositions): string {
  const { startPt, ctrlPt, endPt } = lp
  const dx = endPt.x - ctrlPt.x
  const ctrlX = dx / 5 + ctrlPt.x
  return `M ${startPt.x} ${startPt.y}L ${ctrlPt.x} ${ctrlPt.y}Q ${ctrlX} ${endPt.y} ${endPt.x} ${endPt.y}`
}

/** SB brushes.rect（curve 的 vertical 版本） */
function curveVertical(lp: LinePositions): string {
  const { startPt, ctrlPt, endPt } = lp
  return `M ${startPt.x} ${startPt.y}L ${ctrlPt.x} ${ctrlPt.y}Q ${endPt.x} ${ctrlPt.y} ${endPt.x} ${endPt.y}`
}

function elbowHorizon(lp: LinePositions): string {
  const { startPt, ctrlPt, endPt } = lp
  return `M ${startPt.x} ${startPt.y}L ${ctrlPt.x} ${ctrlPt.y}L ${ctrlPt.x} ${endPt.y}L ${endPt.x} ${endPt.y}`
}

function elbowVertical(lp: LinePositions): string {
  const { startPt, ctrlPt, endPt } = lp
  return `M ${startPt.x} ${startPt.y}L ${ctrlPt.x} ${ctrlPt.y}L ${endPt.x} ${ctrlPt.y}L ${endPt.x} ${endPt.y}`
}

function roundedElbowHorizon(lp: LinePositions, cornerIn: number): string {
  const { startPt, ctrlPt, endPt } = lp
  let corner = cornerIn
  const linear = Math.abs(ctrlPt.y - endPt.y) < corner ? 0 : 1
  const hor = endPt.x > ctrlPt.x ? 1 : -1
  const ver = endPt.y > ctrlPt.y ? 1 : -1
  const flexPt = { x: ctrlPt.x, y: endPt.y }
  corner = Math.min(corner, Math.abs(endPt.x - ctrlPt.x))
  const bflexPt = { x: flexPt.x, y: flexPt.y - ver * corner * linear }
  const aflexPt = { x: flexPt.x + hor * corner, y: flexPt.y }
  return `M ${startPt.x} ${startPt.y}L ${ctrlPt.x} ${ctrlPt.y}L ${bflexPt.x} ${bflexPt.y}Q ${flexPt.x} ${flexPt.y} ${aflexPt.x} ${aflexPt.y}L ${endPt.x} ${endPt.y}`
}

function roundedElbowVertical(lp: LinePositions, cornerIn: number): string {
  const { startPt, ctrlPt, endPt } = lp
  let corner = cornerIn
  const linear = Math.abs(ctrlPt.x - endPt.x) < corner ? 0 : 1
  const hor = endPt.x > ctrlPt.x ? 1 : -1
  const ver = endPt.y > ctrlPt.y ? 1 : -1
  const flexPt = { x: endPt.x, y: ctrlPt.y }
  corner = Math.min(corner, Math.abs(endPt.y - ctrlPt.y))
  const bflexPt = { x: flexPt.x - hor * corner * linear, y: flexPt.y }
  const aflexPt = { x: flexPt.x, y: flexPt.y + ver * corner }
  return `M ${startPt.x} ${startPt.y}L ${ctrlPt.x} ${ctrlPt.y}L ${bflexPt.x} ${bflexPt.y}Q ${flexPt.x} ${flexPt.y} ${aflexPt.x} ${aflexPt.y}L ${endPt.x} ${endPt.y}`
}

function straightLine(lp: LinePositions): string {
  const { startPt, ctrlPt, endPt } = lp
  return `M ${startPt.x} ${startPt.y}L ${ctrlPt.x} ${ctrlPt.y}L ${endPt.x} ${endPt.y}`
}

function skewElbowHorizon(lp: LinePositions, seRatio = DEFAULT_SE_RATIO): string {
  const { startPt, ctrlPt, endPt } = lp
  const flexPt = { x: (endPt.x - ctrlPt.x) * seRatio + ctrlPt.x, y: endPt.y }
  return `M ${startPt.x} ${startPt.y}L ${ctrlPt.x} ${ctrlPt.y}L ${flexPt.x} ${flexPt.y}L ${endPt.x} ${endPt.y}`
}

function skewElbowVertical(lp: LinePositions, seRatio = DEFAULT_SE_RATIO): string {
  const { startPt, ctrlPt, endPt } = lp
  const flexPt = { x: endPt.x, y: (endPt.y - ctrlPt.y) * seRatio + ctrlPt.y }
  return `M ${startPt.x} ${startPt.y}L ${ctrlPt.x} ${ctrlPt.y}L ${flexPt.x} ${flexPt.y}L ${endPt.x} ${endPt.y}`
}

/** SB commonUtils.flexCornerEaseIn */
function flexCornerEaseIn(start: ConnPoint, flex: ConnPoint, end: ConnPoint, corner: number): [ConnPoint, ConnPoint] {
  const normalize = (v: ConnPoint, len: number): ConnPoint => {
    const d = Math.hypot(v.x, v.y)
    const ratio = d / len
    return { x: Number.isNaN(ratio) ? 0 : v.x / ratio, y: Number.isNaN(ratio) ? 0 : v.y / ratio }
  }
  const v1 = normalize({ x: flex.x - start.x, y: flex.y - start.y }, corner * 2)
  const v2 = normalize({ x: flex.x - end.x, y: flex.y - end.y }, corner)
  return [{ x: flex.x + v1.x, y: flex.y + v1.y }, { x: flex.x + v2.x, y: flex.y + v2.y }]
}

function horn(lp: LinePositions, flexPt: ConnPoint): string {
  const { startPt, ctrlPt, endPt } = lp
  const dx = Math.abs(endPt.x - ctrlPt.x)
  const dy = Math.abs(endPt.y - ctrlPt.y)
  const corner = Math.min(dx, dy) / 4
  const flexes = flexCornerEaseIn(ctrlPt, flexPt, endPt, corner)
  return `M ${startPt.x} ${startPt.y}L ${ctrlPt.x} ${ctrlPt.y}L ${flexes[0].x} ${flexes[0].y}Q ${flexPt.x} ${flexPt.y} ${flexes[1].x} ${flexes[1].y}L ${endPt.x} ${endPt.y}`
}

function hornHorizon(lp: LinePositions, hoRatio = DEFAULT_HO_RATIO): string {
  const { ctrlPt, endPt } = lp
  return horn(lp, { x: (endPt.x - ctrlPt.x) * hoRatio + ctrlPt.x, y: endPt.y })
}

function hornVertical(lp: LinePositions, hoRatio = DEFAULT_HO_RATIO): string {
  const { ctrlPt, endPt } = lp
  return horn(lp, { x: endPt.x, y: (endPt.y - ctrlPt.y) * hoRatio + ctrlPt.y })
}

function sinusHorizon(lp: LinePositions): string {
  const { startPt, ctrlPt, endPt } = lp
  const dx = endPt.x - ctrlPt.x
  const flexX = (endPt.x + ctrlPt.x) / 2
  return `M ${startPt.x} ${startPt.y}L ${ctrlPt.x} ${ctrlPt.y}C ${endPt.x - dx / 4} ${ctrlPt.y} ${flexX} ${endPt.y} ${endPt.x} ${endPt.y}`
}

function sinusVertical(lp: LinePositions): string {
  const { startPt, ctrlPt, endPt } = lp
  const dy = endPt.y - ctrlPt.y
  const flexY = (endPt.y + ctrlPt.y) / 2
  return `M ${startPt.x} ${startPt.y}L ${ctrlPt.x} ${ctrlPt.y}C ${ctrlPt.x} ${endPt.y - dy / 4} ${endPt.x} ${flexY} ${endPt.x} ${endPt.y}`
}

/** SB brushes.convexrect（tree / timeline 系 bight 的 horizontal 版本） */
function convexrect(lp: LinePositions, reverseDirection = false): string {
  const { startPt, ctrlPt, endPt } = lp
  const dx = endPt.x - ctrlPt.x
  const sign = reverseDirection ? -1 : 1
  const c1x = ctrlPt.x + dx / 3
  const c1y = ctrlPt.y + (Math.abs(dx) / 5) * sign
  const c2x = endPt.x - dx / 3
  const c2y = endPt.y - (Math.abs(dx) / 6) * sign
  return `M ${startPt.x} ${startPt.y}L ${ctrlPt.x} ${ctrlPt.y}C ${c1x} ${c1y} ${c2x} ${c2y} ${endPt.x} ${endPt.y}`
}

function horizontalLine(lp: LinePositions): string {
  const { startPt, endPt } = lp
  return `M ${startPt.x} ${startPt.y}L ${endPt.x} ${endPt.y}`
}

// ---------- brace ----------

function getBraceCalcInfo(ctrlPt: ConnPoint, endPt: ConnPoint) {
  const isToRight = endPt.x > ctrlPt.x ? 1 : -1
  const isToDown = endPt.y > ctrlPt.y ? 1 : -1
  const braceEndPt = endPt
  const centerX = (ctrlPt.x + braceEndPt.x) / 2
  const dx = Math.abs(braceEndPt.x - ctrlPt.x)
  const dy = Math.abs(braceEndPt.y - ctrlPt.y)
  const corner = Math.min(Math.abs(dx) / 2, Math.abs(dy) / 4)
  return { isToRight, isToDown, braceEndPt, centerX, dx, dy, corner }
}

function braceVertical(ctrlPt: ConnPoint, endPt: ConnPoint): string {
  const { isToDown, braceEndPt, centerX, corner } = getBraceCalcInfo(ctrlPt, endPt)
  return `M ${ctrlPt.x} ${ctrlPt.y}Q ${centerX} ${ctrlPt.y} ${centerX} ${ctrlPt.y + isToDown * corner} ` +
    `L ${centerX} ${braceEndPt.y - isToDown * corner}Q ${centerX} ${braceEndPt.y} ${braceEndPt.x} ${braceEndPt.y}`
}

function fullBraceVertical(ctrlPt: ConnPoint, endPt1: ConnPoint, endPt2: ConnPoint): string {
  const line1 = (() => {
    const { isToDown, braceEndPt, centerX, corner } = getBraceCalcInfo(ctrlPt, endPt1)
    return `M ${braceEndPt.x} ${braceEndPt.y} Q ${centerX} ${braceEndPt.y} ${centerX} ${braceEndPt.y - isToDown * corner} ` +
      `L ${centerX} ${ctrlPt.y + isToDown * corner} Q ${centerX} ${ctrlPt.y} ${ctrlPt.x} ${ctrlPt.y} `
  })()
  const line2 = (() => {
    const { isToDown, braceEndPt, centerX, corner } = getBraceCalcInfo(ctrlPt, endPt2)
    return `M ${ctrlPt.x} ${ctrlPt.y}Q ${centerX} ${ctrlPt.y} ${centerX} ${ctrlPt.y + isToDown * corner} ` +
      `L ${centerX} ${braceEndPt.y - isToDown * corner}Q ${centerX} ${braceEndPt.y} ${braceEndPt.x} ${braceEndPt.y}`
  })()
  return line1 + line2
}

function brace2Vertical(ctrlPt: ConnPoint, endPt: ConnPoint): string {
  const { isToDown, braceEndPt, centerX, dx } = getBraceCalcInfo(ctrlPt, endPt)
  const cornerDy = (Math.tan((BRACE_KEY_DEGREES * Math.PI) / 180) * dx) / 2
  return `M ${ctrlPt.x} ${ctrlPt.y}L ${centerX} ${ctrlPt.y + isToDown * cornerDy}` +
    `L ${centerX} ${braceEndPt.y - isToDown * cornerDy}L ${braceEndPt.x} ${braceEndPt.y}`
}

function brace3Vertical(ctrlPt: ConnPoint, endPt: ConnPoint): string {
  const { isToDown, braceEndPt, centerX, dx } = getBraceCalcInfo(ctrlPt, endPt)
  const cornerDy = (Math.tan((BRACE_KEY_DEGREES * Math.PI) / 180) * dx) / 2
  return `M ${ctrlPt.x} ${ctrlPt.y}L ${centerX} ${ctrlPt.y + isToDown * cornerDy}` +
    `L ${centerX} ${braceEndPt.y}L ${braceEndPt.x} ${braceEndPt.y}`
}

function brace4Vertical(ctrlPt: ConnPoint, endPt: ConnPoint, lineWidth: number): string {
  const { isToDown, isToRight, braceEndPt, centerX, dy } = getBraceCalcInfo(ctrlPt, endPt)
  const centerHalfWidth = lineWidth / 2
  const endHalfWidth = ((lineWidth / 2) * 3) / 4
  const curveCenterPositionMagnification = 4 / 5
  const curveEndPositionMagnification = 3 / 5
  const p1 = { x: centerX - isToRight * centerHalfWidth, y: ctrlPt.y }
  const p2 = { x: p1.x, y: braceEndPt.y + isToDown * endHalfWidth }
  const p3 = { x: braceEndPt.x, y: p2.y }
  const p4 = { x: braceEndPt.x, y: braceEndPt.y - isToDown * endHalfWidth }
  const p5 = { x: centerX + isToRight * centerHalfWidth, y: p4.y - isToDown * endHalfWidth * curveEndPositionMagnification }
  const p6 = { x: centerX + isToRight * centerHalfWidth * (1 + curveCenterPositionMagnification), y: p1.y }
  const line56CtrlPt = { x: p6.x, y: p5.y - (isToDown * dy) / 4 }
  return `M ${p1.x} ${p1.y}L ${p2.x} ${p2.y}L ${p3.x} ${p3.y}L ${p4.x} ${p4.y}L ${p5.x} ${p5.y}` +
    `Q ${line56CtrlPt.x} ${line56CtrlPt.y} ${p6.x} ${p6.y}`
}

function brace5Vertical(ctrlPt: ConnPoint, endPt: ConnPoint, lineWidth: number): string {
  const { isToDown, isToRight, braceEndPt, centerX, dx, dy } = getBraceCalcInfo(ctrlPt, endPt)
  const centerHalfWidth = lineWidth / 2
  const corner = Math.min(Math.abs(dx), Math.abs(dy) / 2)
  const curveCenterPositionMagnification = 4 / 5
  const p1 = { x: centerX - isToRight * centerHalfWidth, y: ctrlPt.y }
  const p2 = { x: p1.x, y: braceEndPt.y - isToDown * corner }
  const p3 = { x: braceEndPt.x, y: braceEndPt.y }
  const line23CtrlPt = { x: p2.x, y: p3.y }
  const p4 = { x: centerX + isToRight * centerHalfWidth, y: p2.y }
  const line34CtrlPt = { x: p4.x, y: p3.y }
  const p5 = { x: centerX + isToRight * centerHalfWidth * (1 + curveCenterPositionMagnification), y: p1.y }
  const line45CtrlPt = { x: p5.x, y: p5.y + (isToDown * dy) / 4 }
  return `M ${p1.x} ${p1.y}L ${p2.x} ${p2.y}Q ${line23CtrlPt.x} ${line23CtrlPt.y} ${p3.x} ${p3.y}` +
    `Q ${line34CtrlPt.x} ${line34CtrlPt.y} ${p4.x} ${p4.y}Q ${line45CtrlPt.x} ${line45CtrlPt.y} ${p5.x} ${p5.y}`
}

// ==================== 主入口 ====================

/** fold / roundedfold 的「tree 系结构用另一套比例」判定（SB fold.ts / roundedfold.ts targetStructureArr） */
const TREE_RATIO_STRUCTURES = new Set([
  'tree-left', 'tree-right', 'timeline-horizontal-up', 'timeline-horizontal-down', 'timeline-vertical', 'tree-sided',
])
/** bight 用 convexrect 的结构（SB bight.ts targetStructureArr） */
const BIGHT_CONVEX_STRUCTURES = new Set(['tree-left', 'tree-right', 'timeline-horizontal-down', 'timeline-vertical', 'tree-sided'])

/**
 * 计算一条父→子连线的几何（锚点 + path）。
 *
 * SB 的调用链：abstractstructure.drawAttachedConnectLine → getTopicLineStyle(lineShape) →
 * setConnectionAttr（horizon/vertical brush 选择 + 兄弟干线共享）。
 */
export function computeConnectionGeometry(input: ConnectionGeometryInput): ConnectionGeometry {
  const structure = normalizeStructureClass(input.parentStyle.structureClass)
  const tapered = !!input.tapered
  const anchors = computeConnectionAnchors(input)

  const lineWidth = Math.trunc(input.parentStyle.lineWidth ?? 1) || 0
  const rawLineClass = normalizeLineClass(input.parentStyle.lineClass)
  // SB drawAttachedConnectLine：lineWidth === 0 → BRANCHCONNECTION.NONE
  let lineShape = lineWidth === 0 ? 'none' : (rawLineClass || 'roundedElbow')

  const base: ConnectionGeometry = {
    startPt: anchors.startPt, ctrlPt: anchors.ctrlPt, endPt: anchors.endPt,
    startDirection: anchors.startDirection, endDirection: anchors.endDirection,
    path: '', lineShape, tapered,
  }

  // 结构级「不画连线」（treetable / matrix / fishbone head）
  if (NO_CONNECTION_STRUCTURES.has(structure)) return { ...base, lineShape: 'none' }
  if (lineShape === 'none') return base

  // callout 线：SB 用 calloutLine（需要沿子主题轮廓取交点 + 路径长度采样），tomind 尚未实现
  if (lineShape === 'calloutLine') return { ...base, lineShape: 'calloutLine' }

  // 结构自定义锚点 / 线型（SB 各 structure 的 drawAttachedConnectLine 覆写）
  const override = structureOverride(structure, input, anchors, lineShape)
  if (override?.lineShape) lineShape = override.lineShape
  const pts: LinePositions = override
    ? { startPt: override.startPt, ctrlPt: override.ctrlPt, endPt: override.endPt }
    : { startPt: anchors.startPt, ctrlPt: anchors.ctrlPt, endPt: anchors.endPt }

  // brace 系：只有首/末子节点画线，单子节点画完整括号（SB braceLineStyleTemplate）
  if (BRACE_LINE_CLASSES.has(lineShape)) {
    return { ...base, lineShape, path: bracePath(lineShape, input, pts, lineWidth) }
  }

  // special = org-chart up/down → 用 vertical brush（SB abstractstructure.drawAttachedConnectLine）；
  // 有结构覆写时用覆写给的 special（SB 这些结构调用时恒传 false / true）
  const special = override
    ? (override.special ?? false)
    : (structure === 'org-chart-up' || structure === 'org-chart-down')

  // SB horizon()：startPt.x !== ctrlPt.x 时，非「同方向最后一个兄弟」的线从 ctrlPt 起（共享干线）
  let lp: LinePositions = pts
  if (!special && pts.startPt.x !== pts.ctrlPt.x) {
    const parentCenter = boxCenter(input.parentBox)
    const brothers = input.siblingBoxes
      .map((box, index) => ({ box, index }))
      .filter(({ box }) => getStartDirection(structure, parentCenter, boxCenter(box)) === anchors.startDirection)
    const isLastChild = brothers.length > 0 && brothers[brothers.length - 1].index === input.childIndex
    if (!isLastChild) lp = { startPt: pts.ctrlPt, ctrlPt: pts.ctrlPt, endPt: pts.endPt }
  }

  // SB roundedelbow.ts getAdditionalParams：parseInt(child.topicView.figure.lineCorner || 0)
  const corner = Math.trunc(input.childStyle?.lineCorner ?? 0)
  const useTreeRatio = TREE_RATIO_STRUCTURES.has(structure) && !input.parentIsCentral
  let path = ''

  switch (lineShape) {
    case 'curve':
      path = special ? curveVertical(lp) : curveHorizon(lp)
      break
    case 'elbow':
      path = special ? elbowVertical(lp) : elbowHorizon(lp)
      break
    case 'roundedElbow':
      path = special ? roundedElbowVertical(lp, corner) : roundedElbowHorizon(lp, corner)
      break
    case 'straight':
      // SB straight 只定义了 horizonBrush：special（org-chart）时无 vertical brush → 不画
      path = special ? '' : straightLine(lp)
      break
    case 'fold':
      path = special
        ? skewElbowVertical(lp, useTreeRatio ? TREE_SE_RATIO : DEFAULT_SE_RATIO)
        : skewElbowHorizon(lp, useTreeRatio ? TREE_SE_RATIO : DEFAULT_SE_RATIO)
      break
    case 'fold2':
      path = special ? skewElbowVertical(lp) : skewElbowHorizon(lp)
      break
    case 'roundedfold':
      path = special
        ? hornVertical(lp, useTreeRatio ? TREE_HO_RATIO : DEFAULT_HO_RATIO)
        : hornHorizon(lp, useTreeRatio ? TREE_HO_RATIO : DEFAULT_HO_RATIO)
      break
    case 'bight': {
      const vertical = sinusVertical(lp)
      if (special) { path = vertical; break }
      if (structure === 'timeline-horizontal-up') { path = convexrect(lp, true); break }
      path = BIGHT_CONVEX_STRUCTURES.has(structure) ? convexrect(lp) : sinusHorizon(lp)
      break
    }
    case 'horizontal':
      // SB horizontal：special = true 恒走 verticalBrush（M start L end）
      path = horizontalLine(lp)
      break
    default:
      // SB getTopicLineStyle：未知线型 warn 后回退 curve
      path = special ? curveVertical(lp) : curveHorizon(lp)
      break
  }

  return {
    startPt: pts.startPt, ctrlPt: pts.ctrlPt, endPt: pts.endPt,
    startDirection: anchors.startDirection, endDirection: anchors.endDirection,
    path, lineShape, tapered,
  }
}

/** SB braceLineStyleTemplate + braceN Vertical */
function bracePath(
  lineShape: string,
  input: ConnectionGeometryInput,
  anchors: { ctrlPt: ConnPoint; endPt: ConnPoint },
  lineWidth: number,
): string {
  const brothers = input.siblingBoxes
  const count = brothers.length
  const isFirstChild = input.childIndex === 0
  const isLastChild = input.childIndex === count - 1
  if (!isFirstChild && !isLastChild) return ''

  const lw = lineWidth || 1
  const control = anchors.ctrlPt
  const end = anchors.endPt

  const vertical = (ctrl: ConnPoint, e: ConnPoint, w: number): string => {
    switch (lineShape) {
      case 'brace2': return brace2Vertical(ctrl, e)
      case 'brace3': return brace3Vertical(ctrl, e)
      case 'brace4': return brace4Vertical(ctrl, e, w)
      case 'brace5': return brace5Vertical(ctrl, e, w)
      default: return braceVertical(ctrl, e)
    }
  }

  if (isFirstChild && isLastChild) {
    const childH = input.childBox.height
    const end1 = { x: end.x, y: end.y - childH / 2 }
    const end2 = { x: end.x, y: end.y + childH / 2 }
    // brace4/brace5 在 SB 里是 forceTapered（锥形时线宽 ×1.5），非锥形仍用原线宽
    if (lineShape === 'brace') return fullBraceVertical(control, end1, end2)
    return vertical(control, end1, lw) + vertical(control, end2, lw)
  }
  return vertical(control, end, lw)
}

// ==================== 生效结构类推导（SB utils/branch.getStructureClass） ====================

/**
 * SB `utils/branch.getStructureClass()`：
 * - 中央分支：自身 structure-class，否则 DEFAULT_STRUCTURE（org.xmind.ui.map）
 * - 其余 attached 分支：自身 structure-class（若在 getAvailableChildStructure 里），
 *   否则 `AllStructures(parentStructure).getChildStructure(parentStructure, index, parent)`
 *
 * SB 的 getChildStructure 用 index / getFinalTimelineChildDirection 判方向，
 * 这里改用**布局结果的几何位置**判方向（布局已 1:1 对齐，两者等价，且不需要重算 numRight）。
 */
/** SB common/constants/structures.EXPOSED_STRUCTURE（规范化短名，顺序同 SB） */
const EXPOSED_STRUCTURE = [
  'logic-right', 'logic-left', 'tree-right', 'tree-left', 'org-chart-down', 'org-chart-up',
  'map-clockwise', 'map-anticlockwise', 'map', 'map-unbalanced',
  'timeline-through-vertical', 'timeline-sided-horizontal', 'timeline-horizontal', 'tree-sided',
  'fishbone-left-headed', 'fishbone-right-headed', 'spreadsheet', 'column-spreadsheet',
  'brace-left', 'brace-right', 'treetable-toptitle', 'treetable',
]
const MAP_LIKE_STRUCTURES = new Set([
  'map', 'map-unbalanced', 'map-anticlockwise', 'map-clockwise',
  'map-floating', 'map-floating-clockwise', 'map-floating-anticlockwise',
])
/** SB common/constants/structures.SIMILAR_STRUCTURE_MAP（镜像结构回退） */
const SIMILAR_STRUCTURE_MAP: Record<string, string> = {
  'fishbone-left-headed': 'fishbone-right-headed',
  'fishbone-right-headed': 'fishbone-left-headed',
  'brace-left': 'brace-right',
  'brace-right': 'brace-left',
  'logic-left': 'logic-right',
  'logic-right': 'logic-left',
  'org-chart-down': 'org-chart-up',
  'org-chart-up': 'org-chart-down',
}

/** SB ATTACHED_EXPOSED_STRUCTURE */
const ATTACHED_EXPOSED = EXPOSED_STRUCTURE.filter((s) => !MAP_LIKE_STRUCTURES.has(s))
/** SB LEFT_EXPOSED_STRUCTURE */
const LEFT_EXPOSED = ATTACHED_EXPOSED.filter((s) =>
  !['logic-right', 'brace-right', 'fishbone-left-headed', 'timeline-horizontal', 'timeline-sided-horizontal'].includes(s))
/** SB RIGHT_EXPOSED_STRUCTURE */
const RIGHT_EXPOSED = ATTACHED_EXPOSED.filter((s) => !['logic-left', 'brace-left', 'fishbone-right-headed'].includes(s))
/** SB TOP_EXPOSED_STRUCTURE */
const TOP_EXPOSED = ATTACHED_EXPOSED.filter((s) =>
  !['org-chart-down', 'tree-sided', 'tree-left', 'tree-right', 'timeline-through-vertical'].includes(s))
/** SB TREE_LEFT_EXPOSED_STRUCTURE / TREE_RIGHT_EXPOSED_STRUCTURE */
const TREE_LEFT_EXPOSED = LEFT_EXPOSED.filter((s) => s !== 'tree-sided')
const TREE_RIGHT_EXPOSED = RIGHT_EXPOSED
/** SB TREE_TABLE_EXPOSED_STRUCTURE */
const TREE_TABLE_EXPOSED = ATTACHED_EXPOSED.filter((s) => !['spreadsheet', 'column-spreadsheet'].includes(s))

/**
 * SB 各 structure 的 getAvailableChildStructure（决定「节点自己的 structure-class 能不能生效」）。
 * map / timeline-vertical 按左右侧给不同列表；timeline 系与 matrix 直接给空列表
 * （⇒ 子结构完全由 getChildStructure 决定）。
 */
function availableChildStructures(parentStructure: string, isRightSide: boolean): string[] {
  if (MAP_LIKE_STRUCTURES.has(parentStructure)) return isRightSide ? RIGHT_EXPOSED : LEFT_EXPOSED
  switch (parentStructure) {
    case 'logic-right': return RIGHT_EXPOSED
    case 'logic-left': return LEFT_EXPOSED
    // SB BraceLeft = Object.assign({}, logicLeft) / BraceRight = {...logicRight}
    // → 直接继承 logic 的 getAvailableChildStructure
    case 'brace-right': return RIGHT_EXPOSED
    case 'brace-left': return LEFT_EXPOSED
    case 'tree-right': return TREE_RIGHT_EXPOSED
    case 'tree-left': return TREE_LEFT_EXPOSED
    // SB orgchartdown：ATTACHED_EXPOSED 去掉 org-chart.up*
    case 'org-chart-down': return ATTACHED_EXPOSED.filter((s) => s !== 'org-chart-up')
    case 'org-chart-up': return TOP_EXPOSED
    case 'timeline-horizontal':
    case 'timeline-horizontal-up':
    case 'timeline-horizontal-down':
    case 'timeline-sided-horizontal':
    case 'timeline-through-vertical':
    case 'spreadsheet':
      return []
    case 'timeline-vertical': return isRightSide ? TREE_RIGHT_EXPOSED : TREE_LEFT_EXPOSED
    case 'fishbone-left-headed': return ['left-head-top-bone', 'left-head-bottom-bone']
    case 'fishbone-right-headed': return ['right-head-top-bone', 'right-head-bottom-bone']
    // SB fishbonebasemainbone：direction RIGHT → RIGHT_EXPOSED，LEFT → LEFT_EXPOSED
    case 'left-head-top-bone':
    case 'left-head-bottom-bone':
      return RIGHT_EXPOSED
    case 'right-head-top-bone':
    case 'right-head-bottom-bone':
      return LEFT_EXPOSED
    case 'treetable':
    case 'treetable-toptitle':
      return TREE_TABLE_EXPOSED.filter((s) =>
        (s !== 'treetable' && s !== 'treetable-toptitle') || s === parentStructure)
    default: return ATTACHED_EXPOSED
  }
}

/**
 * SB `utils/branch.getStructureClass()`：
 * - 中央分支：自身 structure-class，否则 DEFAULT_STRUCTURE（org.xmind.ui.map）
 * - 其余 attached 分支：自身 structure-class（**若在 getAvailableChildStructure 里**），
 *   否则 `AllStructures(parentStructure).getChildStructure(parentStructure, index, parent)`
 *
 * 「自身 structure-class」在 SB 里是 model.getStructureClass() = 模型属性 ?? 样式级联值，
 * 也就是主题 skeleton 的 structure style（centralTopic/mainTopic/subTopic 各一个）——
 * tomind 侧对应 getEffectiveStructureClass()。
 *
 * SB 的 getChildStructure 用 index / getFinalTimelineChildDirection 判方向，
 * 这里改用**布局结果的几何位置**判方向（布局已 1:1 对齐，两者等价，且不必重算 numRight）。
 */
export function resolveChildStructureClass(
  parentStructure: string,
  ownStructureClass: string | null | undefined,
  parentBox: ConnBox,
  childBox: ConnBox,
  childIndex: number,
): string {
  const pc = boxCenter(parentBox)
  const cc = boxCenter(childBox)
  const isRightSide = cc.x >= pc.x

  const own = normalizeStructureClass(ownStructureClass)
  const available = availableChildStructures(parentStructure, isRightSide)
  if (own && available.includes(own)) return own
  // SB getViewStructure：自身结构不可用时，先试「镜像结构」（logic.left ↔ logic.right 等）
  const similar = own ? SIMILAR_STRUCTURE_MAP[own] : undefined
  if (similar && available.includes(similar)) return similar

  switch (parentStructure) {
    // map 系：calcNumRight 之前的 index 在右侧（anticlockwise 相反），几何结果都是「右→logic.right」
    case 'map':
    case 'map-clockwise':
    case 'map-anticlockwise':
    case 'map-unbalanced':
    case 'map-floating':
    case 'map-floating-clockwise':
    case 'map-floating-anticlockwise':
      return isRightSide ? 'logic-right' : 'logic-left'
    // timeline-horizontal / sided：SB getFinalTimelineChildDirection(index) → up/down。
    // 用**下标奇偶**而不是几何位置：tomind 的 timeline 布局就是 `i % 2 === 0 → up`
    // （SB 在有 boundary/summary 分组时会用 inSameRangeWithPreviousChild 修正，两侧都还没实现）。
    case 'timeline-horizontal':
    case 'timeline-sided-horizontal':
      return childIndex % 2 === 0 ? 'timeline-horizontal-up' : 'timeline-horizontal-down'
    case 'timeline-horizontal-up':
    case 'timeline-horizontal-down':
      return 'logic-right'
    // timeline-through-vertical：同样按下标奇偶（tomind 布局 `i % 2 === 0 → 左侧`）
    case 'timeline-through-vertical':
      return childIndex % 2 === 0 ? 'logic-left' : 'logic-right'
    // fishbone：骨头按 index 奇偶上下交替
    case 'fishbone-left-headed':
      return childIndex % 2 === 0 ? 'left-head-top-bone' : 'left-head-bottom-bone'
    case 'fishbone-right-headed':
      return childIndex % 2 === 0 ? 'right-head-top-bone' : 'right-head-bottom-bone'
    case 'left-head-top-bone':
    case 'left-head-bottom-bone':
    case 'right-head-top-bone':
    case 'right-head-bottom-bone':
      return 'logic-right'
    // matrix（spreadsheet）：row → logic.right
    case 'spreadsheet':
      return 'spreadsheet-row'
    case 'column-spreadsheet':
      return 'spreadsheet-column'
    case 'spreadsheet-row':
    case 'spreadsheet-column':
      return 'logic-right'
    // 其余（logic / tree / org-chart / brace / treetable …）：SB 默认继承父结构
    default:
      return parentStructure
  }
}

// ==================== 结构级连线差异（SB 各 structure 的 drawAttachedConnectLine） ====================

/**
 * SB 里这些结构的 drawAttachedConnectLine 直接 `getTopicLineStyle(NONE)`：
 * - treetable.ts / spreadsheet.ts / spreadsheetrow.ts / spreadsheetcolumn.ts / columnspreadsheet.ts
 *   （单元格之间不画连线，边框由 matrix / treetable 视图自己画）
 * - fishbonebasehead.ts（鱼骨头 → 骨头的线由 FishboneHeadLine 视图画，不是 connection）
 */
const NO_CONNECTION_STRUCTURES = new Set([
  'treetable',
  'spreadsheet',
  'spreadsheet-row',
  'spreadsheet-column',
  'column-spreadsheet',
  'fishbone-left-headed',
  'fishbone-right-headed',
])

/** SB treeleftandright.isSpecialLineShape */
const TREE_SPECIAL_LINE_SHAPES = new Set(['straight', 'curve', 'fold', 'roundedfold'])
/** SB layoutConstant.FISH_BONE.BONE_CONNECTION_TAN = tan(60°) */
const BONE_CONNECTION_TAN = Math.tan((Math.PI / 180) * 60)
/** SB treeleftandright / timelinehorizontal* 里的 30° 拐点 */
const tan30 = Math.tan((Math.PI * 30) / 180)

interface StructureOverride {
  startPt: ConnPoint
  ctrlPt: ConnPoint
  endPt: ConnPoint
  /** 结构强制的线型（SB timeline-sided → HORIZONTAL、fishbone bone → STRAIGHT） */
  lineShape?: string
  /** SB 这些结构调用 getTopicLineStyle 时 special 恒为 false */
  special?: boolean
}

/**
 * 各结构的 drawAttachedConnectLine 覆写（SB structures/*.ts）。
 * 返回 null 表示走 abstractstructure 的通用逻辑。
 */
function structureOverride(structure: string, input: ConnectionGeometryInput, anchors: {
  startPt: ConnPoint
  ctrlPt: ConnPoint
  endPt: ConnPoint
  startDirection: ConnDirection
  endDirection: ConnDirection
}, lineShape: string): StructureOverride | null {
  const prevBox = input.childIndex > 0 ? input.siblingBoxes[input.childIndex - 1] : undefined

  switch (structure) {
    // tree-left / tree-right：ctrl.y 按线型修正（SB treeleftandright.drawAttachedConnectLine）
    case 'tree-left':
    case 'tree-right': {
      const ctrlPt = { ...anchors.ctrlPt }
      if (TREE_SPECIAL_LINE_SHAPES.has(lineShape)) {
        ctrlPt.y = anchors.endPt.y - Math.abs(anchors.endPt.x - ctrlPt.x) * tan30
      } else if (lineShape === 'roundedElbow') {
        ctrlPt.y = anchors.startPt.y
      } else {
        ctrlPt.y = anchors.endPt.y
      }
      return { startPt: anchors.startPt, ctrlPt, endPt: anchors.endPt, special: false }
    }

    // timeline-horizontal：干线从前一个兄弟（首个则父）的 RIGHT 关节点出发，ctrl = start
    case 'timeline-horizontal': {
      const base = prevBox ?? input.parentBox
      const startPt = getJointPosition(base, 'right')
      return { startPt, ctrlPt: startPt, endPt: anchors.endPt, special: false }
    }

    // timeline-through-vertical：同上，方向 DOWN
    case 'timeline-through-vertical': {
      const base = prevBox ?? input.parentBox
      const startPt = getJointPosition(base, 'down')
      return { startPt, ctrlPt: startPt, endPt: anchors.endPt, special: false }
    }

    // timeline-sided-horizontal：竖直线，start.x 对齐 end.x，y 取父的出线点；线型强制 horizontal
    case 'timeline-sided-horizontal': {
      const startPt = { x: anchors.endPt.x, y: anchors.startPt.y }
      return { startPt, ctrlPt: startPt, endPt: anchors.endPt, lineShape: 'horizontal', special: true }
    }

    // timeline-horizontal-up / -down：ctrl.y = end.y ∓ |dx|*tan30（bight 例外 = end.y）
    // SB timelinehorizontalup.ts 注释：「方向向上所以这里用加法」→ up 用 +，down 用 -
    case 'timeline-horizontal-up':
    case 'timeline-horizontal-down': {
      const ctrlPt = { ...anchors.ctrlPt }
      const sign = structure === 'timeline-horizontal-up' ? 1 : -1
      if (lineShape === 'bight') {
        ctrlPt.y = anchors.endPt.y
      } else {
        ctrlPt.y = anchors.endPt.y + sign * Math.abs(anchors.endPt.x - ctrlPt.x) * tan30
      }
      return { startPt: anchors.startPt, ctrlPt, endPt: anchors.endPt, special: false }
    }

    // timeline-vertical（SB TREESIDED）：ctrl.y = end.y（straight 例外）
    case 'timeline-vertical': {
      const ctrlPt = { ...anchors.ctrlPt }
      ctrlPt.y = lineShape === 'straight'
        ? anchors.endPt.y - Math.abs(anchors.endPt.x - ctrlPt.x) * tan30
        : anchors.endPt.y
      return { startPt: anchors.startPt, ctrlPt, endPt: anchors.endPt, special: false }
    }

    // 鱼骨主骨 → 子节点：从主骨斜线上的一点直线连到子节点（SB fishbonebasemainbone.drawAttachedConnectLine）
    case 'left-head-top-bone':
    case 'left-head-bottom-bone':
    case 'right-head-top-bone':
    case 'right-head-bottom-bone': {
      const isToLeftHead = structure === 'left-head-top-bone' || structure === 'left-head-bottom-bone'
      // SB: direction = RIGHT（leftHeaded）/ LEFT（rightHeaded）
      const isToRightMultiplicationParam = isToLeftHead ? 1 : -1
      // SB: getRangeGrowthDirection() === DOWN ? 1 : -1（topbone → DOWN，bottombone → UP）
      const isTopBone = structure === 'left-head-top-bone' || structure === 'right-head-top-bone'
      const isTopSideMultiplicationParam = isTopBone ? 1 : -1
      const parentCenter = boxCenter(input.parentBox)
      const mainlineStart = {
        x: parentCenter.x,
        y: parentCenter.y + (input.parentBox.height / 2) * isTopSideMultiplicationParam,
      }
      const endPt = anchors.endPt
      const connectionLineWidth = Math.abs(endPt.y - mainlineStart.y) / BONE_CONNECTION_TAN
      const startPt = {
        x: mainlineStart.x - connectionLineWidth * isToRightMultiplicationParam,
        y: endPt.y,
      }
      return { startPt, ctrlPt: { ...startPt }, endPt, lineShape: 'straight', special: false }
    }

    default:
      return null
  }
}
