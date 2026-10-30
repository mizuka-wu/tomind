/**
 * TreeTable 布局算法 —— SB `structures/treetable.ts` + `utils/treetable.ts` 的逐条移植
 *
 * SB 的 treetable 不是「root 一列 + 每个 head 一列」，而是**把整棵树摊成一张表**：
 *   `treeInfoToTableInfo` = expandTableRowInfoToRight（每行 = 一条根到叶子的路径，
 *   有子节点就把行复制成 N 行）+ supplyTableRowInfoToRight（短行用**最后一个 item 重复**补齐到
 *   最大列数 ⇒ 那个 item 变成「跨列的 expand item」）
 *   → calcTableCellWidth / calcTableCellHeight（单格 = 该列/行的 max，expand item 累加）
 *   → calcTableCellPosition（cellPosition 从表格左上角累加）
 *   → calcTableCellItemPosition（position = 父子两格「中心在表内坐标」之差）
 *   → calcTableBounds（bounds = 本格 + 右侧所有格；stopFlag 的格子保留自己的 bounds）
 *
 * **stopFlag**（SB `utils/branch.getBranchLayoutTreeInfo`）：
 *   `stopFlag = 该分支的生效结构 !== 本次表格的 targetStructure || shouldCollapse()`
 * ⇒ 生效结构还是 treetable 的后代**继续摊进同一张表**（非 stop 格，尺寸用 topicBounds），
 *   生效结构变了的分支才是「一整格塞一棵子树」（stop 格，尺寸用 bounds = 子树 bb，
 *   由它自己的结构布局好再交回来 —— TM 侧就是 `layoutDelegatedSubtree`）。
 *
 * ⚠️ 2026-10-30 第六轮之前 TM 只有「root 一列 + head 委派 logic」这一条路，
 * head 委派不成立时**只放 head 自己一个盒、不递归** ⇒ 宿主是 treetable 且 d1+ 继承 treetable 时
 * 235 个节点只布局了 13 个（第五轮量到的头号活差距，n=13/235、ΔY 1454.5）。
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine, ResolvedStyle, NodeType } from '@tomind/style'
import { classifyNode, DEFAULT_STYLES } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import { isCollapsed, getAttachedChildren, findRootTopic, getAttr } from './layout-utils'
import { measurePartAwareNode, measureTitleOnlyNode } from './part-node-size'
import { hasNonTitleParts } from './part-measure'
import { SC, TREE_TABLE_GROUP_LIST, delegationOf } from './child-structure'
import { resolveStructures } from './structure-resolve'
import { layoutDelegatedSubtree, placeDelegatedSubtree } from './subtree-delegate'
import type { DelegatedSubtreeLayout } from './subtree-delegate'

type NodeLayout = import('./layout-engine').NodeLayout

interface NodeSize {
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  /** 主题盒原点（shape 中心）到盒顶的距离 = shapeHeight/2；无 labels 时 = height/2 */
  originY: number
  partBounds?: Map<string, { x: number; y: number; width: number; height: number }>
}

function parseStyleValue(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return isNaN(num) ? fallback : num
  }
  return fallback
}

// SB common/constants/models.ts：treetable / matrix 主分支的标题折行宽度
const TOPIC_MAX_CUSTOM_WIDTH = 1024

// SB TREE_TABLE_CELL padding presets
const TREE_TABLE_CELL_PADDING_HORIZON = 10
const TREE_TABLE_CELL_PADDING_VERTICAL = 6

/**
 * Normalize margin value per SB formula: (styleValue * presetValue) / defaultValue
 * Returns rawValue if no default found or default is 0.
 */
function normalizeMargin(
  rawValue: number,
  nodeType: NodeType,
  key: string,
  presetH: number = TREE_TABLE_CELL_PADDING_HORIZON,
  presetV: number = TREE_TABLE_CELL_PADDING_VERTICAL,
): number {
  const defaultStyle = DEFAULT_STYLES[nodeType]
  if (!defaultStyle) return rawValue
  const defaultRaw = (defaultStyle as Record<string, unknown>)[key]
  if (defaultRaw === undefined || defaultRaw === null) return rawValue
  const defaultValue = parseStyleValue(defaultRaw, 0)
  if (defaultValue <= 0) return rawValue
  const preset = (key === "marginLeft" || key === "marginRight") ? presetH : presetV
  // SB getPadding 直接相除不取整：mainTopic 在 treetable 下 margin 被覆盖为 subTopic 的 6pt，
  // (6 * 10) / 18 = 3.333…，取整会丢掉小数并让整列错位（实测每列 0.667px）
  return (rawValue * preset) / defaultValue
}


function getNodeSpacing(
  doc: NodeDesc,
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
      cellPad: options.nodePadding,
    }
  }

  const majorGap = parseStyleValue(style.spacingMajor, options.horizontalGap)
  const minorGap = parseStyleValue(style.spacingMinor, options.verticalGap)

  const rawStyle = getAttr<Record<string, unknown>>(node, 'style')
  const rawMargin = rawStyle?.margin
  const nodeType = classifyNode(doc, node.id)
  const bw = parseStyleValue(style.borderWidth, 0)

  // 主题盒 padding = 原始 margin + borderWidth（SB getTopicMargins）
  let rawTop: number
  let rawBottom: number
  let rawLeft: number
  let rawRight: number
  if (typeof rawMargin === "number" && rawMargin > 0) {
    rawTop = rawBottom = rawLeft = rawRight = rawMargin
  } else if (typeof rawMargin === "string" && !Number.isNaN(parseFloat(rawMargin)) && parseFloat(rawMargin) > 0) {
    rawTop = rawBottom = rawLeft = rawRight = parseFloat(rawMargin)
  } else {
    rawTop = parseStyleValue(style.marginTop, options.nodePadding.top)
    rawBottom = parseStyleValue(style.marginBottom, options.nodePadding.bottom)
    rawLeft = parseStyleValue(style.marginLeft, options.nodePadding.left)
    rawRight = parseStyleValue(style.marginRight, options.nodePadding.right)
  }

  // 表格 cell extend padding = margin * preset / default（SB getPadding）
  const cellPad = {
    top: normalizeMargin(rawTop, nodeType, "marginTop"),
    bottom: normalizeMargin(rawBottom, nodeType, "marginBottom"),
    left: normalizeMargin(rawLeft, nodeType, "marginLeft"),
    right: normalizeMargin(rawRight, nodeType, "marginRight"),
  }

  return {
    horizontalGap: majorGap,
    verticalGap: minorGap,
    padding: { top: rawTop + bw, right: rawRight + bw, bottom: rawBottom + bw, left: rawLeft + bw },
    cellPad,
  }
}

function measureNodeSize(
  node: NodeDesc,
  padding: { top: number; right: number; bottom: number; left: number },
  options: LayoutOptions,
  styleEngine?: StyleEngine | null,
  state?: SheetState | null,
): NodeSize {
  // part-aware：labels/markers/image 计入主题盒，并透出 originY 与 partBounds。
  // 旧实现只走 measureTitleOnlyNode（part-blind），而 head 子树是委派给 part-aware 的
  // logic 布局的 → 两套「主题盒 ↔ 原点」口径混帧（实测 labels 挂在 head 分支上时
  // 234/235 个节点整体 dy = -12 = labels 24 的一半）。
  const result = hasNonTitleParts(node)
    ? measurePartAwareNode(node, options, styleEngine, state, padding)
    : measureTitleOnlyNode(node, padding, options, styleEngine, state)
  return {
    width: result.width,
    height: result.height,
    titleWidth: result.titleWidth,
    titleHeight: result.titleHeight,
    originY: result.shapeHeight / 2,
    partBounds: result.partBounds,
  }
}


// ==================== SB utils/treetable.ts 的逐条移植 ====================

interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

interface CellExternalInfo {
  cellWidth?: number
  cellHeight?: number
  cellPosition?: { x: number; y: number }
  cellX?: number
  cellY?: number
}

/** 表格单元格 = SB `getBranchLayoutTreeInfo` 的一条 treeInfo */
interface CellItem {
  node: NodeDesc
  id: string
  size: NodeSize
  /** SB `getExtendWidth` = borderLineWidth(**表头分支**) + padL + padR */
  extendW: number
  /** SB `getExtendHeight` = borderLineWidth(**表头分支**) + padT + padB */
  extendH: number
  /** SB `style['fo:text-align']`（getItemCellXY 按它决定格内水平对齐） */
  textAlign: string
  /** SB `topicBounds` —— 主题盒，相对自身原点（shape 中心） */
  topicBounds: Bounds
  /** SB `bounds` —— stopFlag 时 = 子树 bb；否则由 calcTableBounds 填 */
  bounds: Bounds
  stopFlag: boolean
  children: CellItem[]
  externalInfo: CellExternalInfo
  /** SB `position` —— 相对**父格 item 的原点** */
  position: { x: number; y: number }
  /** stopFlag 且 TM 有该结构的子树入口时的委派结果 */
  del: DelegatedSubtreeLayout | null
}

/** SB `isExpandItem`：同一列/行里出现多次的 item（= 跨格） */
function isExpandItem(list: readonly CellItem[], item: CellItem): boolean {
  return list.indexOf(item) !== list.lastIndexOf(item)
}

/** SB `getItemCellXY`：item 原点相对自己格子左上角的偏移（返回负值） */
function getItemCellXY(item: CellItem): { cellX: number; cellY: number } {
  const itemBounds = item.stopFlag ? item.bounds : item.topicBounds
  const cellWidth = item.externalInfo.cellWidth ?? 0
  const cellHeight = item.externalInfo.cellHeight ?? 0
  let cellX = item.extendW / 2 + Math.abs(itemBounds.x)
  switch (item.textAlign) {
    case 'center':
      cellX = (cellWidth - itemBounds.width) / 2 + Math.abs(itemBounds.x)
      break
    case 'right':
      cellX = cellWidth - itemBounds.width - item.extendW / 2 + Math.abs(itemBounds.x)
      break
  }
  const cellY = (cellHeight - itemBounds.height) / 2 + Math.abs(itemBounds.y)
  return { cellX: -cellX, cellY: -cellY }
}

/** SB `getItemCenterToCellRelativePosition`：item 原点在**整张表**里的坐标 */
function getItemCenterToCellRelativePosition(item: CellItem): { x: number; y: number } {
  const { cellX, cellY } = getItemCellXY(item)
  const pos = item.externalInfo.cellPosition ?? { x: 0, y: 0 }
  return { x: pos.x + Math.abs(cellX), y: pos.y + Math.abs(cellY) }
}

/** SB `getCellItemRelativePosition`：B 的原点相对 A 的原点 */
function getCellItemRelativePosition(a: CellItem, b: CellItem): { x: number; y: number } {
  const pa = getItemCenterToCellRelativePosition(a)
  const pb = getItemCenterToCellRelativePosition(b)
  return { x: pb.x - pa.x, y: pb.y - pa.y }
}

/** 单格宽（SB：stopFlag 用 bounds.width，否则 topicBounds.width）+ extendWidth */
function itemCellWidth(item: CellItem): number {
  return (item.stopFlag ? item.bounds.width : item.topicBounds.width) + item.extendW
}

/** 单格高（SB：stopFlag 用 bounds.height，否则 topicBounds.height）+ extendHeight */
function itemCellHeight(item: CellItem): number {
  return (item.stopFlag ? item.bounds.height : item.topicBounds.height) + item.extendH
}

/** SB `calcTableCellWidth` */
function calcTableCellWidth(tableInfo: CellItem[][]): void {
  const rowLength = tableInfo[0].length
  for (let rIndex = 0; rIndex < rowLength; rIndex++) {
    const currentColItemInfoList = tableInfo.map((row) => ({ row, item: row[rIndex] }))
    const singleColItemInfoList = currentColItemInfoList.filter((info) => !isExpandItem(info.row, info.item))
    const maxSingleColWidth = Math.max(...singleColItemInfoList.map((info) => itemCellWidth(info.item)))
    const expandColItemInfoList = currentColItemInfoList.filter((info) => isExpandItem(info.row, info.item))
    let expandWidthToSuply = 0
    const widthListToSuplyToEachRow = new Array<number>(rowLength).fill(0)
    expandColItemInfoList.forEach((info) => {
      info.item.externalInfo.cellWidth = (info.item.externalInfo.cellWidth ?? 0) + maxSingleColWidth
      if (rIndex === info.row.lastIndexOf(info.item)) {
        const itemOriginWidth = itemCellWidth(info.item)
        const cw = info.item.externalInfo.cellWidth ?? 0
        if (cw < itemOriginWidth) {
          expandWidthToSuply = Math.max(itemOriginWidth - cw, expandWidthToSuply)
          widthListToSuplyToEachRow[rIndex] = expandWidthToSuply
        }
      }
    })
    expandColItemInfoList.forEach((info) => {
      info.item.externalInfo.cellWidth = (info.item.externalInfo.cellWidth ?? 0) + widthListToSuplyToEachRow[rIndex]
    })
    singleColItemInfoList.forEach((info) => {
      info.item.externalInfo.cellWidth = maxSingleColWidth + widthListToSuplyToEachRow[rIndex]
    })
  }
}

/** SB `calcTableCellHeight`（SB 的 cIndex 遍历的是**行**，命名沿用它） */
function calcTableCellHeight(tableInfo: CellItem[][]): void {
  const colLength = tableInfo.length
  for (let cIndex = 0; cIndex < colLength; cIndex++) {
    const currentRowItemInfoList = tableInfo[cIndex].map((item, rIndex) => ({
      col: tableInfo.map((row) => row[rIndex]),
      item,
    }))
    const singleRowItemInfoList = currentRowItemInfoList.filter((info) => !isExpandItem(info.col, info.item))
    const maxSingleRowHeight = Math.max(...singleRowItemInfoList.map((info) => itemCellHeight(info.item)))
    const expandRowItemInfoList = currentRowItemInfoList.filter((info) => isExpandItem(info.col, info.item))
    // SB 注：此处假定了不会有交叉的跨 row 单元格
    let expandHeightToSuply = 0
    let expandRowItemFirstIndex = -1
    const heightListToSuplyToEachCol = new Array<number>(colLength).fill(0)
    expandRowItemInfoList.forEach((info) => {
      info.item.externalInfo.cellHeight = (info.item.externalInfo.cellHeight ?? 0) + maxSingleRowHeight
      if (cIndex === info.col.lastIndexOf(info.item)) {
        const itemOriginHeight = itemCellHeight(info.item)
        const ch = info.item.externalInfo.cellHeight ?? 0
        if (ch < itemOriginHeight) {
          expandHeightToSuply = Math.max(itemOriginHeight - ch, expandHeightToSuply)
          expandRowItemFirstIndex = info.col.indexOf(info.item)
          const heightToSuplyToEachCol = expandHeightToSuply / (cIndex - expandRowItemFirstIndex + 1)
          for (let i = expandRowItemFirstIndex; i <= cIndex; i++) {
            heightListToSuplyToEachCol[i] = heightToSuplyToEachCol
          }
        }
      }
    })
    if (expandRowItemFirstIndex !== -1) {
      for (let i = expandRowItemFirstIndex; i < cIndex; i++) {
        const seen = new Set<CellItem>()
        for (const item of tableInfo[i]) {
          if (seen.has(item)) continue
          seen.add(item)
          item.externalInfo.cellHeight = (item.externalInfo.cellHeight ?? 0) + heightListToSuplyToEachCol[i]
        }
      }
    }
    expandRowItemInfoList.forEach((info) => {
      info.item.externalInfo.cellHeight = (info.item.externalInfo.cellHeight ?? 0) + heightListToSuplyToEachCol[cIndex]
    })
    singleRowItemInfoList.forEach((info) => {
      info.item.externalInfo.cellHeight = maxSingleRowHeight + heightListToSuplyToEachCol[cIndex]
    })
  }
}

/** SB `calcTableCellPosition`（左上角为原点，先 x 后 y） */
function calcTableCellPosition(tableInfo: CellItem[][]): void {
  tableInfo.forEach((row) => {
    let baseX = 0
    const seen = new Set<CellItem>()
    for (const item of row) {
      if (seen.has(item)) continue
      seen.add(item)
      item.externalInfo.cellPosition = { x: baseX, y: 0 }
      baseX += item.externalInfo.cellWidth ?? 0
    }
  })
  const colCount = tableInfo[0]?.length ?? 0
  for (let i = 0; i < colCount; i++) {
    let baseY = 0
    const seen = new Set<CellItem>()
    for (const row of tableInfo) {
      const item = row[i]
      if (!item || seen.has(item)) continue
      seen.add(item)
      const prev = item.externalInfo.cellPosition ?? { x: 0, y: 0 }
      item.externalInfo.cellPosition = { x: prev.x, y: baseY }
      baseY += item.externalInfo.cellHeight ?? 0
    }
  }
}

/** SB `calcTableCellItemPosition`：position = 父子两格中心之差（stopFlag 不再往里递归） */
function calcTableCellItemPosition(treeInfo: CellItem): void {
  if (!treeInfo.children.length) return
  treeInfo.children.forEach((childInfo) => {
    childInfo.position = getCellItemRelativePosition(treeInfo, childInfo)
    if (!childInfo.stopFlag) calcTableCellItemPosition(childInfo)
  })
}

/**
 * SB `calcTableBounds`：逐行按「唯一 item 反序」写 bounds。
 * 反序 ⇒ `currentRow[index - 1]` 是**更深一列**的 item ⇒
 * `bounds.width = 本格 cellWidth + 右侧所有格的宽度`（= 从本格左边缘到表格右边缘）。
 */
function calcTableBounds(tableInfo: CellItem[][]): void {
  tableInfo.forEach((row) => {
    const unique = [...new Set(row)].reverse()
    unique.forEach((item, index) => {
      const { cellX, cellY } = getItemCellXY(item)
      item.externalInfo.cellX = cellX
      item.externalInfo.cellY = cellY
      if (item.stopFlag) return
      item.bounds.x = cellX
      item.bounds.y = cellY
      item.bounds.height = item.externalInfo.cellHeight ?? 0
      let preItemBoundsWidth = 0
      if (index > 0) {
        const preItem = unique[index - 1]
        preItemBoundsWidth = preItem.stopFlag
          ? (preItem.externalInfo.cellWidth ?? 0)
          : preItem.bounds.width
      }
      item.bounds.width = (item.externalInfo.cellWidth ?? 0) + preItemBoundsWidth
    })
  })
}

/** SB `expandTableRowInfoToRight`：把树摊成「每行 = 一条根到叶子的路径」 */
function expandTableRowInfoToRight(tableInfo: CellItem[][], level: number): CellItem[][] {
  const newTableInfo: CellItem[][] = []
  let hasChildToExpend = false
  tableInfo.forEach((row) => {
    const levelTreeToExpend = row[level]
    if (!levelTreeToExpend || levelTreeToExpend.stopFlag || !levelTreeToExpend.children.length) {
      newTableInfo.push([...row])
    } else {
      hasChildToExpend = true
      levelTreeToExpend.children.forEach((childInfo) => {
        newTableInfo.push([...row, childInfo])
      })
    }
  })
  if (hasChildToExpend) return expandTableRowInfoToRight(newTableInfo, level + 1)
  return newTableInfo
}

/** SB `supplyTableRowInfoToRight`：短行用最后一个 item 重复补齐 ⇒ 它成为跨列的 expand item */
function supplyTableRowInfoToRight(tableInfo: CellItem[][]): CellItem[][] {
  const maxColNumber = Math.max(...tableInfo.map((row) => row.length))
  tableInfo.forEach((row) => {
    const last = row[row.length - 1]
    for (let i = row.length; i < maxColNumber; i++) row.push(last)
  })
  return tableInfo
}

// ==================== 算法 ====================

interface TreeTableCtx {
  doc: NodeDesc
  options: LayoutOptions
  styleEngine: StyleEngine | null
  state: SheetState | null
  sizeMap: Map<string, NodeSize>
  spacingMap: Map<string, ReturnType<typeof getNodeSpacing>>
  eff: Map<string, string>
  depth: Map<string, number>
  selfEff: string
  /** SB `getLayoutStyleInfo`：border-line-width 一律取**表头分支**的值 */
  headBorderWidth: number
}

function buildCellItem(node: NodeDesc, ctx: TreeTableCtx): CellItem {
  const size = ctx.sizeMap.get(node.id)!
  const spacing = ctx.spacingMap.get(node.id)!
  const eff = ctx.eff.get(node.id) ?? ctx.selfEff
  const collapsed = isCollapsed(node)
  // SB getBranchLayoutTreeInfo：stopFlag = 生效结构 !== targetStructure || shouldCollapse()
  const stopFlag = eff !== ctx.selfEff || collapsed
  const style = ctx.styleEngine && ctx.state ? ctx.styleEngine.computeStyle(ctx.state, node.id) : undefined
  const item: CellItem = {
    node,
    id: node.id,
    size,
    extendW: ctx.headBorderWidth + spacing.cellPad.left + spacing.cellPad.right,
    extendH: ctx.headBorderWidth + spacing.cellPad.top + spacing.cellPad.bottom,
    textAlign: typeof style?.textAlign === 'string' ? style.textAlign : 'left',
    topicBounds: { x: -size.width / 2, y: -size.originY, width: size.width, height: size.height },
    bounds: { x: 0, y: 0, width: 0, height: 0 },
    stopFlag,
    children: [],
    externalInfo: {},
    position: { x: 0, y: 0 },
    del: null,
  }
  if (!stopFlag) {
    for (const child of getAttachedChildren(node)) item.children.push(buildCellItem(child, ctx))
    return item
  }
  if (collapsed) {
    item.bounds = { ...item.topicBounds }
    return item
  }
  const del = delegationOf(eff)
  if (del) {
    const res = layoutDelegatedSubtree(node, del, ctx.options, ctx.styleEngine, ctx.state, ctx.depth.get(node.id) ?? 1)
    item.del = res
    item.bounds = { x: res.bb.x, y: res.bb.y, width: res.bb.width, height: res.bb.height }
    return item
  }
  // TM 没有该结构的独立子树入口（timeline.* / map 系 / fishbone / spreadsheet / treetable.toptitle）
  // ⇒ 只能放自己的主题盒。⚠️ 已知差距：SB 会用那个结构自己布局整棵子树，
  //    TM 这里会丢节点（n 少于 SB）—— 见 skill「潜在差距」。
  item.bounds = { ...item.topicBounds }
  return item
}

interface TreeTableRunResult {
  /** 绝对坐标节点表，**表格根的原点（shape 中心）= (0,0)** */
  nodes: Map<string, NodeLayout>
  /** SB `branchLayoutTreeInfo.bounds`（= 表格根那一格，相对自身原点） */
  bb: Bounds
  /** 表格根主题盒原点到盒顶的距离 = shapeHeight/2 */
  originY: number
}

/**
 * 跑一次 treetable 表格布局（SB 一次 `doLayoutBranch` + `treeTable.startLayout`）。
 *
 * @param root      表格根（= SB 的 branch；它的生效结构就是 selfEff）
 * @param baseDepth root 在文档中的深度（中央分支 0，被委派进来的子树根 ≥ 1）
 */
function runTreeTable(
  doc: NodeDesc,
  root: NodeDesc,
  selfEff: string,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  baseDepth: number,
): TreeTableRunResult {
    const nodes = new Map<string, NodeLayout>()

    // 逐节点解析生效结构（skeleton 只是其中一条 preset 来源，深层靠继承）。
    // isSelf：生效结构还是 treetable 的子分支**不委派**，它们继续摊进同一张表
    // （漏了这条 = 自己委派自己 ⇒ 无限递归）。
    const resolved = resolveStructures(root, selfEff, state, (d) => d.kind === 'treetable', baseDepth)

    /**
     * SB `figures/layoutengine/titlelayoutworker.getResolvedText`：
     *   `isMatrixMainBranch(branch) || isTreeTableStructure(branch)` ⇒ 标题按
     *   **TOPIC_MAX_CUSTOM_WIDTH(1024)** 折行，其余分支才是默认的 TITLE_MAX_WIDTH(300)。
     * `isTreeTableStructure` 判的是**生效结构** ∈ TREE_TABLE_GROUP_LIST ⇒ treetable 宿主下
     * 摊进表格的每一个节点都吃 1024（stop 格的子树不是 treetable 结构 ⇒ 仍走 300）。
     * 漏掉这条 ⇒ 长标题在 TM 里被折成 4 行、SB 只有 2 行（实测 noskel-treetable：
     * ΔW 31.4 / ΔH 2.6，单点最大 ΔW -728、ΔH -54，行高连带 ΔY 全错）。
     */
    const measureOptionsOf = (id: string): LayoutOptions => {
      // ⚠️ 只认 eff 表里有的节点：被委派出去的子树 / 折叠子树不在表里，
      //    它们不是 treetable 结构 ⇒ 仍按 300 折行（回退 selfEff 会把它们错判成 1024）
      const eff = resolved.eff.get(id)
      return eff !== undefined && TREE_TABLE_GROUP_LIST.includes(eff)
        ? { ...options, maxTitleWidth: TOPIC_MAX_CUSTOM_WIDTH }
        : options
    }

    const spacingMap = new Map<string, ReturnType<typeof getNodeSpacing>>()
    const sizeMap = new Map<string, NodeSize>()
    const measureSubtree = (node: NodeDesc): void => {
      const spacing = getNodeSpacing(doc, node, options, styleEngine, state)
      spacingMap.set(node.id, spacing)
      sizeMap.set(node.id, measureNodeSize(node, spacing.padding, measureOptionsOf(node.id), styleEngine, state))
      if (!isCollapsed(node)) {
        for (const child of getAttachedChildren(node)) measureSubtree(child)
      }
    }
    measureSubtree(root)

    // SB getLayoutStyleInfo：TREE_TABLE_GROUP 下 border-line-width 取 getTreeTableHeadBranchView(branch)
    // ⇒ 本次表格的表头分支就是表格根（它的父分支不是 treetable，否则它会是父表格里的 stop 格）
    let headBorderWidth = 0
    if (styleEngine && state) {
      const headStyle = styleEngine.computeStyle(state, root.id)
      headBorderWidth = parseStyleValue(headStyle.borderWidth, 0)
    }

    const ctx: TreeTableCtx = {
      doc, options, styleEngine, state, sizeMap, spacingMap,
      eff: resolved.eff, depth: resolved.depth, selfEff, headBorderWidth,
    }
    const treeInfo = buildCellItem(root, ctx)

    // SB treeTable.startLayout 的顺序（一步都不能换）
    const tableInfo = supplyTableRowInfoToRight(expandTableRowInfoToRight([[treeInfo]], 0))
    calcTableCellWidth(tableInfo)
    calcTableCellHeight(tableInfo)
    calcTableCellPosition(tableInfo)
    calcTableCellItemPosition(treeInfo)
    calcTableBounds(tableInfo)

    // 落位：SB 的 root.realPosition = (0,0)，position 是相对父格 item 原点的偏移
    const place = (item: CellItem, originX: number, originY: number): void => {
      if (item.del) {
        placeDelegatedSubtree(item.del, originX, originY, nodes)
        const own = nodes.get(item.id)
        if (own) own.branchHeight = item.bounds.height
        return
      }
      nodes.set(item.id, {
        x: originX + item.topicBounds.x,
        y: originY + item.topicBounds.y,
        width: item.size.width,
        height: item.size.height,
        titleWidth: item.size.titleWidth,
        titleHeight: item.size.titleHeight,
        branchHeight: item.bounds.height,
        partBounds: item.size.partBounds,
      })
      for (const child of item.children) {
        place(child, originX + child.position.x, originY + child.position.y)
      }
    }
    place(treeInfo, 0, 0)

    return { nodes, bb: treeInfo.bounds, originY: treeInfo.size.originY }
}

/**
 * 独立布局一棵 treetable 子树（供其它结构按生效结构委派使用）。
 * 契约同 `subtree-delegate.layoutDelegatedSubtree`：节点表以 child 原点为 (0,0)，
 * bb = SB 的 `child.boundaryBounds`（无 boundary 时 == `child.bounds` = 表格根那一格）。
 */
export function layoutTreetableSubtree(
  node: NodeDesc,
  options: LayoutOptions,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  baseDepth = 1,
): TreeTableRunResult {
  // classifyNode 要靠**整份文档**判层级（mainTopic / subTopic）⇒ 有 state 就用 state.doc
  return runTreeTable(state?.doc ?? node, node, SC.TREE_TABLE, options, styleEngine, state, baseDepth)
}

export const treeTableLayoutAlgorithm: LayoutAlgorithm = {
  name: 'treetable',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const root = findRootTopic(doc)
    if (!root) return { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    const res = runTreeTable(doc, root, SC.TREE_TABLE, options, styleEngine, state, 0)
    let totalWidth = 0
    let totalHeight = 0
    for (const layout of res.nodes.values()) {
      totalWidth = Math.max(totalWidth, layout.x + layout.width)
      totalHeight = Math.max(totalHeight, layout.y + layout.height)
    }
    return { nodes: res.nodes, totalWidth, totalHeight }
  },
}
