import type { NodeDesc } from '@tomind/schema'
import type { SheetState } from '@tomind/state'
import type { StyleEngine } from '@tomind/style'

export interface ILayoutEngine {
  setStyleEngine(engine: StyleEngine | null): void
  compute(state: SheetState): LayoutResult
  getLayoutResult(): LayoutResult
  setActiveLayout?(name: string): void
  getActiveLayout?(): string
  register?(algorithm: LayoutAlgorithm): void
  unregister?(name: string): void
}

export interface NodeLayout {
  x: number
  y: number
  width: number
  height: number
  titleWidth: number
  titleHeight: number
  branchHeight: number
  parentId?: string
}

export interface LayoutResult {
  nodes: Map<string, NodeLayout>
  totalWidth: number
  totalHeight: number
}

export interface LayoutOptions {
  horizontalGap: number
  verticalGap: number
  nodePadding: { top: number; right: number; bottom: number; left: number }
  rootOffsetX: number
  lineHeight: number
  charWidthFactor: number
  canvasWidth: number
  canvasHeight: number
}

export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  horizontalGap: 10,
  verticalGap: 40,
  nodePadding: { top: 8, right: 16, bottom: 8, left: 16 },
  rootOffsetX: 50,
  lineHeight: 1.0,
  charWidthFactor: 0.8,
  canvasWidth: 10000,
  canvasHeight: 10000,
}

export interface LayoutAlgorithm {
  name: string
  layout(
    node: NodeDesc,
    options: LayoutOptions,
    styleEngine: StyleEngine | null,
    state: SheetState | null,
  ): LayoutResult
}

export function measureTextSize(
  text: string,
  fontSize: number,
  options: LayoutOptions,
): { width: number; height: number } {
  if (!text) return { width: 0, height: 0 }

  const lines = text.split('\n')
  const maxWidth = 200
  const lineHeight = Math.floor(fontSize * options.lineHeight)

  const charWidth = fontSize * options.charWidthFactor
  const lineWidths = lines.map(line => Math.min(line.length * charWidth, maxWidth))
  const width = Math.max(...lineWidths)
  const height = lines.length * lineHeight

  return { width: Math.ceil(width), height }
}
