/**
 * Part Node Size — 整合测量和布局，计算 part-aware 的节点尺寸
 *
 * 流程：
 * 1. measureNodeParts() 获取各 part 尺寸
 * 2. buildTopicCellTree() 构建 cell 树
 * 3. root.getPreferredSize(-1, -1) 计算总尺寸
 * 4. root.layout() 定位各 cell
 * 5. 遍历 cell 树提取 partBounds
 * 6. 返回结果
 */

import type { NodeDesc } from '@tomind/schema'
import type { LayoutOptions } from './layout-engine'
import { measureTextSize } from './layout-engine'
import type { PartMeasurement } from './part-measure'
import { measureNodeParts, hasNonTitleParts } from './part-measure'
import { buildTopicCellTree } from './part-cell-builder'
import type { CellLayout } from './cell-layout'

// ==================== 类型定义 ====================

export interface PartAwareNodeSize {
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  partBounds: Map<string, { x: number; y: number; width: number; height: number }>
}

// ==================== 工具函数 ====================

function getTitle(node: NodeDesc): string {
  const title = node.attrs.title
  if (typeof title === 'string') return title
  if (Array.isArray(title)) {
    return title.map((u: { text?: string }) => u.text ?? '').join('')
  }
  return ''
}

function getFontSize(node: NodeDesc): number {
  const style = node.attrs.style as Record<string, unknown> | undefined
  return (style?.fontSize as number) ?? 14
}

function getFontFamily(node: NodeDesc): string {
  const style = node.attrs.style as Record<string, unknown> | undefined
  return (style?.fontFamily as string) || 'NeverMind, Microsoft YaHei, PingFang SC, Microsoft JhengHei'
}

function getFontWeight(node: NodeDesc): string | number {
  const style = node.attrs.style as Record<string, unknown> | undefined
  return (style?.fontWeight as string | number) || 'normal'
}

function getFontStyle(node: NodeDesc): string {
  const style = node.attrs.style as Record<string, unknown> | undefined
  return (style?.fontStyle as string) || 'normal'
}

/**
 * 从 cell 树中提取 part bounds
 */
function extractPartBounds(cell: CellLayout, bounds: Map<string, { x: number; y: number; width: number; height: number }>, offsetX: number = 0, offsetY: number = 0): void {
  // 如果是 part cell，记录 bounds
  if (cell.id.startsWith('part-')) {
    const partType = cell.id.replace('part-', '')
    bounds.set(partType, {
      x: cell.position.x + offsetX,
      y: cell.position.y + offsetY,
      width: cell.computedSize.width,
      height: cell.computedSize.height,
    })
  }

  // 递归处理 children
  for (const child of cell.children) {
    extractPartBounds(child, bounds, offsetX + cell.position.x, offsetY + cell.position.y)
  }
}

// ==================== 主函数 ====================

/**
 * 测量 part-aware 的节点尺寸
 */
export function measurePartAwareNode(
  node: NodeDesc,
  options: LayoutOptions,
): PartAwareNodeSize {
  // 测量各 part 尺寸
  const parts = measureNodeParts(node, options)

  // 构建 cell 树
  const cellTree = buildTopicCellTree(parts)

  // 计算首选尺寸
  const preferredSize = cellTree.topicCell.getPreferredSize(-1, -1)

  // 布局 cell
  cellTree.topicCell.layoutChildren({
    x: 0,
    y: 0,
    width: preferredSize.width,
    height: preferredSize.height,
  })

  // 提取 partBounds
  const partBounds = new Map<string, { x: number; y: number; width: number; height: number }>()
  extractPartBounds(cellTree.topicCell, partBounds)

  // 获取 title 尺寸
  const titlePart = parts.find(p => p.partType === 'title')
  const titleWidth = titlePart?.size.width ?? 0
  const titleHeight = titlePart?.size.height ?? 0

  return {
    width: preferredSize.width,
    height: preferredSize.height,
    titleWidth,
    titleHeight,
    partBounds,
  }
}

/**
 * 快速路径：只测量 title + padding
 */
export function measureTitleOnlyNode(
  node: NodeDesc,
  padding: { top: number; right: number; bottom: number; left: number },
  options: LayoutOptions,
): PartAwareNodeSize {
  const fontSize = getFontSize(node)
  const title = getTitle(node)
  const fontFamily = getFontFamily(node)
  const fontWeight = getFontWeight(node)
  const fontStyle = getFontStyle(node)

  const { width: titleWidth, height: titleHeight } = measureTextSize(
    title,
    fontSize,
    options,
    fontFamily,
    fontWeight,
    fontStyle,
  )

  return {
    width: titleWidth + padding.left + padding.right,
    height: titleHeight + padding.top + padding.bottom,
    titleWidth,
    titleHeight,
    partBounds: new Map(),
  }
}

export default { measurePartAwareNode, measureTitleOnlyNode }
