/**
 * TreeTable 布局算法
 *
 * 对齐 snowbrush 的 treeTable 结构：
 * - 树转表格：每行 = 根到叶子的路径，列 = 深度层级
 * - 父节点跨行（跨其所有后代叶子）
 * - 列宽 = 单行最大宽度 + 扩展宽度
 * - 行高 = 单列最大高度 + 扩展高度
 * - 节点在单元格内左对齐（默认 textAlign=left）
 */
import type { NodeDesc } from '@tomind/schema'
import type { StyleEngine, ResolvedStyle, NodeType } from '@tomind/style'
import { classifyNode, DEFAULT_STYLES } from '@tomind/style'
import type { SheetState } from '@tomind/state'
import type { LayoutAlgorithm, LayoutResult, LayoutOptions } from './layout-engine'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import { isCollapsed, getAttachedChildren, findRootTopic, getAttr } from './layout-utils'
import { measureTitleOnlyNode } from './part-node-size'
import { delegateLogicSubtree } from './skeleton-delegate'

type NodeLayout = import('./layout-engine').NodeLayout

interface NodeSize {
  width: number
  height: number
  titleWidth: number
  titleHeight: number
}

function parseStyleValue(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return isNaN(num) ? fallback : num
  }
  return fallback
}

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
  return Math.round((rawValue * preset) / defaultValue)
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
  const result = measureTitleOnlyNode(node, padding, options, styleEngine, state)
  return {
    width: result.width,
    height: result.height,
    titleWidth: result.titleWidth,
    titleHeight: result.titleHeight,
  }
}

/**
 * 收集所有叶子节点到 root 的路径
 * 每个路径 = 一行，列 = 深度层级
 * 父节点在多行中出现 = 跨行
 */
type TableRow = (NodeDesc | null)[]

function buildTable(root: NodeDesc, maxDepth: number): TableRow[] {
  const rows: TableRow[] = []

  function walk(node: NodeDesc, path: (NodeDesc | null)[], depth: number) {
    const newPath = [...path]
    // 填充 null 到之前缺失的深度
    while (newPath.length < depth) {
      newPath.push(null)
    }
    newPath.push(node)

    const children = isCollapsed(node) ? [] : getAttachedChildren(node)
    if (children.length === 0) {
      // 叶子节点 = 一行
      while (newPath.length <= maxDepth) {
        newPath.push(null)
      }
      rows.push(newPath)
    } else {
      for (const child of children) {
        walk(child, newPath, depth + 1)
      }
    }
  }

  walk(root, [], 0)
  return rows
}

/** 获取节点在表格中首次出现的行索引 */
function getFirstRow(rows: TableRow[], nodeId: string): number {
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[i].length; j++) {
      if (rows[i][j]?.id === nodeId) return i
    }
  }
  return -1
}

/** 获取节点在表格中最后出现的行索引 */
function getLastRow(rows: TableRow[], nodeId: string): number {
  for (let i = rows.length - 1; i >= 0; i--) {
    for (let j = 0; j < rows[i].length; j++) {
      if (rows[i][j]?.id === nodeId) return i
    }
  }
  return -1
}

/** 获取节点的扩展宽度（padding + border）对齐 SB getExtendWidth */
function getExtendWidth(
  doc: NodeDesc,
  node: NodeDesc,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  options: LayoutOptions,
): number {
  const spacing = getNodeSpacing(doc, node, options, styleEngine, state)
  let borderWidth = 0
  if (styleEngine && state) {
    const style = styleEngine.computeStyle(state, node.id)
    borderWidth = parseStyleValue(style.borderWidth, 0)
  }
  // SB getExtendWidth = borderWidth + padL + padR（pad 为 preset 归一化值）
  return borderWidth + spacing.cellPad.left + spacing.cellPad.right
}

function getExtendHeight(
  doc: NodeDesc,
  node: NodeDesc,
  styleEngine: StyleEngine | null,
  state: SheetState | null,
  options: LayoutOptions,
): number {
  const spacing = getNodeSpacing(doc, node, options, styleEngine, state)
  let borderWidth = 0
  if (styleEngine && state) {
    const style = styleEngine.computeStyle(state, node.id)
    borderWidth = parseStyleValue(style.borderWidth, 0)
  }
  return borderWidth + spacing.cellPad.top + spacing.cellPad.bottom
}

export const treeTableLayoutAlgorithm: LayoutAlgorithm = {
  name: 'treetable',
  layout(doc: NodeDesc, options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS, styleEngine: StyleEngine | null = null, state: SheetState | null = null): LayoutResult {
    const nodes = new Map<string, NodeLayout>()
    const root = findRootTopic(doc)
    if (!root) return { nodes, totalWidth: 0, totalHeight: 0 }

    // 测量所有节点尺寸（主题盒 = title + 2*margin + bw）
    const sizeMap = new Map<string, NodeSize>()
    function measureSubtree(node: NodeDesc): void {
      const spacing = getNodeSpacing(doc, node, options, styleEngine, state)
      sizeMap.set(node.id, measureNodeSize(node, spacing.padding, options, styleEngine, state))
      if (!isCollapsed(node)) {
        for (const child of getAttachedChildren(node)) {
          measureSubtree(child)
        }
      }
    }
    measureSubtree(root)

    // snowbrush treetable = 两列表格：col0 = root（跨所有行），col1 = 每个 head 分支，
    // head cell 内嵌其整棵子树（stopFlag，子结构由 skeleton/available child structure 决定）
    const heads = isCollapsed(root) ? [] : getAttachedChildren(root)
    const rootSize = sizeMap.get(root.id)!
    const rootExtendW = getExtendWidth(doc, root, styleEngine, state, options)
    const rootExtendH = getExtendHeight(doc, root, styleEngine, state, options)
    const col0W = rootSize.width + rootExtendW

    // head 子树 provisional 布局（skeleton logic 委派，否则退回 logic 以外的自身递归不存在 → logic）
    const provs: { nodes: Map<string, NodeLayout>; bb: { x: number; y: number; width: number; height: number }; own: NodeLayout }[] = []
    for (const head of heads) {
      const del = delegateLogicSubtree(head, 0, 0, 0, options, styleEngine, state)
      if (del) {
        provs.push({ nodes: del.nodes, bb: { x: del.bb.x, y: del.bb.y, width: del.bb.width, height: del.bb.height }, own: del.nodes.get(head.id)! })
      } else {
        const provNodes = new Map<string, NodeLayout>()
        const hs = sizeMap.get(head.id)!
        provNodes.set(head.id, { x: 0, y: 0, width: hs.width, height: hs.height, titleWidth: hs.titleWidth, titleHeight: hs.titleHeight, branchHeight: hs.height })
        provs.push({ nodes: provNodes, bb: { x: 0, y: 0, width: hs.width, height: hs.height }, own: provNodes.get(head.id)! })
      }
    }

    // 列宽 = max(stop? bounds.width : topicBounds.width) + extendWidth
    let col1W = 0
    heads.forEach((head, i) => {
      const extendW = getExtendWidth(doc, head, styleEngine, state, options)
      col1W = Math.max(col1W, provs[i].bb.width + extendW)
    })

    // 行高 = 子树高度 + extendHeight
    const rowH: number[] = heads.map((head, i) => provs[i].bb.height + getExtendHeight(doc, head, styleEngine, state, options))
    const totalH = rowH.reduce((a, b) => a + b, 0)

    // root 主题：col0 内左对齐 + 垂直居中（getItemCellXY）
    nodes.set(root.id, {
      x: rootExtendW / 2,
      y: (totalH - rootSize.height) / 2,
      width: rootSize.width,
      height: rootSize.height,
      titleWidth: rootSize.titleWidth,
      titleHeight: rootSize.titleHeight,
      branchHeight: totalH,
    })

    // head 行：cell 内容区 = cellH - extendH；子树 bb 顶边对齐内容区顶边
    let rowY = 0
    heads.forEach((head, i) => {
      const p = provs[i]
      const extendW = getExtendWidth(doc, head, styleEngine, state, options)
      const extendH = getExtendHeight(doc, head, styleEngine, state, options)
      const contentTop = rowY + extendH / 2
      const contentLeft = col0W + extendW / 2
      // bb 左边缘对齐内容区左边缘
      const dx = contentLeft - p.bb.x - (p.own.x + p.own.width / 2) + p.own.width / 2 - p.own.width / 2
      const dxFinal = contentLeft - (p.own.x + p.own.width / 2 + p.bb.x)
      const dyFinal = contentTop - (p.own.y + p.own.height / 2 + p.bb.y)
      void dx
      for (const [id, nl] of p.nodes) {
        nodes.set(id, { ...nl, x: nl.x + dxFinal, y: nl.y + dyFinal })
      }
      rowY += rowH[i]
    })

    let totalWidth = 0
    let totalHeight = 0
    for (const layout of nodes.values()) {
      totalWidth = Math.max(totalWidth, layout.x + layout.width)
      totalHeight = Math.max(totalHeight, layout.y + layout.height)
    }
    return { nodes, totalWidth, totalHeight }
  },
}
