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

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null

function getCanvasContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null
  if (!canvas) {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
  }
  return ctx
}

export function measureTextSize(
  text: string,
  fontSize: number,
  options: LayoutOptions,
  fontFamily: string = 'sans-serif',
  fontWeight: string | number = 'normal',
  fontStyle: string = 'normal',
): { width: number; height: number } {
  if (!text) return { width: 0, height: 0 }

  const lines = text.split('\n')
  const preFontSize = fontSize
  let ratio = 1
  if (fontSize < 12) {
    ratio = fontSize / 12
    fontSize = 12
  }

  const ctx = getCanvasContext()
  if (ctx) {
    const fontWeightStr = typeof fontWeight === 'number' ? fontWeight.toString() : fontWeight
    const fontSizePx = `${fontSize}px`
    const fontArr = [fontStyle, fontWeightStr, fontSizePx, fontFamily]
    ctx.font = fontArr.filter(Boolean).join(' ')

    const widthArr = lines.map(line => ctx.measureText(line).width)
    const width = Math.max(...widthArr) * ratio
    const height = lines.length * preFontSize

    return { width: Math.ceil(width), height }
  }

  // Fallback to charWidthFactor if canvas not available
  const charWidth = preFontSize * options.charWidthFactor
  const lineWidths = lines.map(line => line.length * charWidth)
  const width = Math.max(...lineWidths)
  const height = lines.length * preFontSize

  return { width: Math.ceil(width), height }
}
