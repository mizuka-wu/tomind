/**
 * Part Cell Builder — 根据 PartMeasurement 构建 Cell 层级树
 *
 * 构建的 cell 层级：
 * topicCell (1-col vertical, spacing=4)
 * ├── shapePaddingCell (1-col, margins=shapePadding)
 * │   └── shapeGroupCell (1-col vertical, spacing=8)
 * │       ├── topPartsCell (1-col horizontal) ← position=top 的 parts
 * │       ├── middleCell (3-col horizontal, spacing=8)
 * │       │   ├── leftPartsCell (1-col vertical) ← position=left
 * │       │   ├── innerCell (N-col horizontal, spacing=4)
 * │       │   │   ├── numberingCell
 * │       │   │   ├── markerCell
 * │       │   │   ├── titleCell
 * │       │   │   └── infoCell (note+link)
 * │       │   └── rightPartsCell (1-col vertical) ← position=right
 * │       └── bottomPartsCell (1-col horizontal) ← position=bottom
 * └── labelsCell (1-col vertical) ← labels（在 shape 外部）
 */

import type { PartMeasurement, PartPosition } from './part-measure'
import { CellLayout, CellGridLayout } from './cell-layout'
import type { Margins } from './cell-layout'

// ==================== 类型定义 ====================

export interface TopicCellTree {
  topicCell: CellLayout
  shapePaddingCell: CellLayout
  shapeGroupCell: CellLayout
  topPartsCell: CellLayout
  middleCell: CellLayout
  leftPartsCell: CellLayout
  innerCell: CellLayout
  numberingCell: CellLayout
  markerCell: CellLayout
  titleCell: CellLayout
  titleGroupCell: CellLayout
  infoCell: CellLayout
  rightPartsCell: CellLayout
  bottomPartsCell: CellLayout
  labelsCell: CellLayout
  imageCell: CellLayout
}

// ==================== 默认配置 ====================

const DEFAULT_SHAPE_PADDING: Margins = {
  top: 5,
  right: 6,
  bottom: 5,
  left: 6,
}

// ==================== 工具函数 ====================

/**
 * 按 position 和 order 分组排序 parts
 */
function groupPartsByPosition(parts: PartMeasurement[]): Map<PartPosition, PartMeasurement[]> {
  const groups = new Map<PartPosition, PartMeasurement[]>()

  for (const part of parts) {
    const group = groups.get(part.position) ?? []
    group.push(part)
    groups.set(part.position, group)
  }

  // 每组内按 order 排序
  for (const group of groups.values()) {
    group.sort((a, b) => a.order - b.order)
  }

  return groups
}

/**
 * 创建一个空的 CellLayout
 */
function createCell(id: string, options?: {
  layout?: CellGridLayout
  data?: {
    exclude?: boolean
    horizontalAlignment?: 'beginning' | 'center' | 'end' | 'fill'
    verticalAlignment?: 'beginning' | 'center' | 'end' | 'fill'
    horizontalSpan?: number
    verticalSpan?: number
    minimumWidth?: number
    minimumHeight?: number
  }
  calcSize?: () => { width: number; height: number }
}): CellLayout {
  return new CellLayout(id, options)
}

/**
 * 创建 Part Cell
 */
function createPartCell(part: PartMeasurement): CellLayout {
  return createCell(`part-${part.partType}`, {
    data: {
      horizontalAlignment: 'fill',
      verticalAlignment: 'center',
    },
    calcSize: () => part.size,
  })
}

// ==================== 主函数 ====================

/**
 * 构建 topic cell 树
 */
export function buildTopicCellTree(parts: PartMeasurement[]): TopicCellTree {
  // 按 position 分组
  const groups = groupPartsByPosition(parts)

  // ─── 创建叶子 cells ───

  // Numbering Cell
  const numberingParts = groups.get('left')?.filter(p => p.partType === 'numbering') ?? []
  const numberingCell = createCell('numbering', {
    data: {
      horizontalAlignment: 'fill',
      verticalAlignment: 'center',
    },
    calcSize: () => {
      if (numberingParts.length === 0) return { width: 0, height: 0 }
      return numberingParts[0].size
    },
  })

  // Marker Cell
  const markerParts = groups.get('top')?.filter(p => p.partType === 'markers') ?? []
  const markerCell = createCell('markers', {
    data: {
      horizontalAlignment: 'fill',
      verticalAlignment: 'center',
    },
    calcSize: () => {
      if (markerParts.length === 0) return { width: 0, height: 0 }
      return markerParts[0].size
    },
  })

  // Title Cell
  const titleParts = groups.get('center')?.filter(p => p.partType === 'title') ?? []
  const titleCell = createCell('title', {
    data: {
      horizontalAlignment: 'fill',
      verticalAlignment: 'center',
    },
    calcSize: () => {
      if (titleParts.length === 0) return { width: 0, height: 0 }
      return titleParts[0].size
    },
  })

  // Title Group Cell (1-col vertical)
  const titleGroupCell = createCell('titleGroup', {
    layout: new CellGridLayout(1, {
      horizontalSpacing: 0,
      verticalSpacing: 0,
    }),
    data: {
      horizontalAlignment: 'fill',
      verticalAlignment: 'center',
    },
  })
  titleGroupCell.add(titleCell)

  // Info Cell (note + link)
  const noteParts = groups.get('right')?.filter(p => p.partType === 'note') ?? []
  const linkParts = groups.get('right')?.filter(p => p.partType === 'link') ?? []
  const infoCell = createCell('info', {
    layout: new CellGridLayout(1, {
      horizontalSpacing: 4,
      verticalSpacing: 0,
    }),
    data: {
      horizontalAlignment: 'fill',
      verticalAlignment: 'center',
    },
  })

  // 添加 note 和 link 到 info cell
  if (noteParts.length > 0) {
    const noteCell = createPartCell(noteParts[0])
    infoCell.add(noteCell)
  }
  if (linkParts.length > 0) {
    const linkCell = createPartCell(linkParts[0])
    infoCell.add(linkCell)
  }

  // Center Image Cell — position=center 的 image 与 title 水平并排
  const centerImageParts = (groups.get('center') ?? []).filter(p => p.partType === 'image')
  const hasCenterImage = centerImageParts.length > 0
  const imageCell = createCell('image', {
    data: {
      horizontalAlignment: 'center',
      verticalAlignment: 'center',
    },
    calcSize: () => {
      if (centerImageParts.length === 0) return { width: 0, height: 0 }
      return centerImageParts[0].size
    },
  })

  // ─── 创建容器 cells ───

  // Inner Cell (4-col horizontal: numbering, markers, title, info)
  // 当 center 有 image 时扩展为 5 列（image 放在 title 之后）
  const innerNumCols = hasCenterImage ? 5 : 4
  const innerCell = createCell('inner', {
    layout: new CellGridLayout(innerNumCols, {
      horizontalSpacing: 10,
      verticalSpacing: 0,
    }),
    data: {
      horizontalAlignment: 'fill',
      verticalAlignment: 'center',
    },
  })
  innerCell.add(numberingCell)
  innerCell.add(markerCell)
  innerCell.add(titleGroupCell)
  if (hasCenterImage) {
    innerCell.add(imageCell)
  }
  innerCell.add(infoCell)

  // Left Parts Cell (position=left, 除去 numbering)
  const leftParts = (groups.get('left') ?? []).filter(p => p.partType !== 'numbering')
  const leftPartsCell = createCell('leftParts', {
    layout: new CellGridLayout(1, {
      horizontalSpacing: 0,
      verticalSpacing: 4,
    }),
    data: {
      horizontalAlignment: 'fill',
      verticalAlignment: 'center',
    },
  })
  for (const part of leftParts) {
    leftPartsCell.add(createPartCell(part))
  }

  // Right Parts Cell (position=right, 除去 note 和 link)
  const rightParts = (groups.get('right') ?? []).filter(p => p.partType !== 'note' && p.partType !== 'link')
  const rightPartsCell = createCell('rightParts', {
    layout: new CellGridLayout(1, {
      horizontalSpacing: 0,
      verticalSpacing: 4,
    }),
    data: {
      horizontalAlignment: 'fill',
      verticalAlignment: 'center',
    },
  })
  for (const part of rightParts) {
    rightPartsCell.add(createPartCell(part))
  }

  // Middle Cell (3-col horizontal: left, inner, right)
  const middleCell = createCell('middle', {
    layout: new CellGridLayout(3, {
      horizontalSpacing: 8,
      verticalSpacing: 0,
    }),
    data: {
      horizontalAlignment: 'fill',
      verticalAlignment: 'center',
    },
  })
  middleCell.add(leftPartsCell)
  middleCell.add(innerCell)
  middleCell.add(rightPartsCell)

  // Top Parts Cell (position=top, 除去 markers)
  const topParts = (groups.get('top') ?? []).filter(p => p.partType !== 'markers')
  const topPartsCell = createCell('topParts', {
    layout: new CellGridLayout(1, {
      horizontalSpacing: 0,
      verticalSpacing: 4,
    }),
    data: {
      horizontalAlignment: 'fill',
      verticalAlignment: 'beginning',
    },
  })
  for (const part of topParts) {
    topPartsCell.add(createPartCell(part))
  }

  // Bottom Parts Cell (position=bottom)
  const bottomParts = groups.get('bottom') ?? []
  const bottomPartsCell = createCell('bottomParts', {
    layout: new CellGridLayout(1, {
      horizontalSpacing: 0,
      verticalSpacing: 4,
    }),
    data: {
      horizontalAlignment: 'fill',
      verticalAlignment: 'beginning',
    },
  })
  for (const part of bottomParts) {
    bottomPartsCell.add(createPartCell(part))
  }

  // Shape Group Cell (1-col vertical: top, middle, bottom)
  const shapeGroupCell = createCell('shapeGroup', {
    layout: new CellGridLayout(1, {
      horizontalSpacing: 0,
      verticalSpacing: 8,
    }),
    data: {
      horizontalAlignment: 'fill',
      verticalAlignment: 'center',
    },
  })
  shapeGroupCell.add(topPartsCell)
  shapeGroupCell.add(middleCell)
  shapeGroupCell.add(bottomPartsCell)

  // Shape Padding Cell (margins=shapePadding)
  const shapePaddingCell = createCell('shapePadding', {
    layout: new CellGridLayout(1, {
      margins: DEFAULT_SHAPE_PADDING,
    }),
    data: {
      horizontalAlignment: 'fill',
      verticalAlignment: 'center',
    },
  })
  shapePaddingCell.add(shapeGroupCell)

  // Labels Cell (position=outside/bottom, 在 shape 外部)
  const labelsParts = groups.get('outside') ?? groups.get('bottom') ?? []
  const labelsCell = createCell('labels', {
    layout: new CellGridLayout(1, {
      horizontalSpacing: 0,
      verticalSpacing: 4,
    }),
    data: {
      horizontalAlignment: 'beginning',
      verticalAlignment: 'beginning',
    },
  })
  for (const part of labelsParts) {
    if (part.partType === 'labels') {
      labelsCell.add(createPartCell(part))
    }
  }

  // Topic Cell (最外层容器)
  const topicCell = createCell('topic', {
    layout: new CellGridLayout(1, {
      horizontalSpacing: 0,
      verticalSpacing: 4,
    }),
  })
  topicCell.add(shapePaddingCell)
  topicCell.add(labelsCell)

  return {
    topicCell,
    shapePaddingCell,
    shapeGroupCell,
    topPartsCell,
    middleCell,
    leftPartsCell,
    innerCell,
    numberingCell,
    markerCell,
    titleCell,
    titleGroupCell,
    infoCell,
    rightPartsCell,
    bottomPartsCell,
    labelsCell,
    imageCell,
  }
}

export default { buildTopicCellTree }
