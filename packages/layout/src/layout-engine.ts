import type { NodeDesc } from '@tomind/schema'
import type { SheetState } from '@tomind/state'
import type { StyleEngine } from '@tomind/style'

export interface LayoutEngine {
  setStyleEngine(engine: StyleEngine): void
  compute(state: SheetState): LayoutResult
  getLayoutResult(): LayoutResult
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
}

export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  horizontalGap: 40,
  verticalGap: 10,
  nodePadding: { top: 8, right: 16, bottom: 8, left: 16 },
  rootOffsetX: 50,
  lineHeight: 20,
  charWidthFactor: 0.6,
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

const layoutRegistry = new Map<string, LayoutAlgorithm>()

export function registerLayout(algorithm: LayoutAlgorithm): void {
  layoutRegistry.set(algorithm.name, algorithm)
}

export function unregisterLayout(name: string): void {
  layoutRegistry.delete(name)
}

export function getLayout(name: string): LayoutAlgorithm | undefined {
  return layoutRegistry.get(name)
}

export function measureTextSize(
  text: string,
  fontSize: number,
  options: LayoutOptions,
): { width: number; height: number } {
  if (!text) return { width: 0, height: 0 }
  const charWidth = fontSize * options.charWidthFactor
  const maxWidth = 200
  const textWidth = Math.min(text.length * charWidth, maxWidth)
  const lines = Math.ceil((text.length * charWidth) / maxWidth)
  const textHeight = lines * options.lineHeight
  return { width: Math.ceil(textWidth), height: Math.ceil(textHeight) }
}

export function layout(
  doc: NodeDesc,
  options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS,
  styleEngine?: StyleEngine,
  state?: SheetState,
  layoutName: string = 'tree',
): LayoutResult {
  const algorithm = layoutRegistry.get(layoutName)
  if (!algorithm) {
    console.warn(`Layout algorithm "${layoutName}" not registered`)
    return { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
  }
  return algorithm.layout(doc, options, styleEngine ?? null, state ?? null)
}

export const layoutTree = layout
