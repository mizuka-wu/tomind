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
  maxTitleWidth: number
  canvasWidth: number
  canvasHeight: number
}

export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  horizontalGap: 22,
  verticalGap: 0,
  nodePadding: { top: 5, right: 6, bottom: 5, left: 6 },
  rootOffsetX: 50,
  lineHeight: 1.34,
  charWidthFactor: 0.8,
  maxTitleWidth: 300,
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

const SNOWBRUSH_FONT_FAMILY = "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif"

const FONT_WEIGHT_STRING_TO_NUMBER: Record<string, number> = {
  normal: 400,
  regular: 400,
  bold: 700,
}

function getCanvasContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null
  if (!canvas) {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
  }
  return ctx
}

function normalizeFontWeight(fontWeight: string | number): number | string {
  if (typeof fontWeight === 'number') return fontWeight
  
  const str = fontWeight.toString().toLowerCase()
  if (FONT_WEIGHT_STRING_TO_NUMBER[str] !== undefined) {
    return FONT_WEIGHT_STRING_TO_NUMBER[str]
  }
  
  if (/\dpt\b/.test(fontWeight.toString())) {
    const num = parseInt(fontWeight.toString())
    if (!isNaN(num)) return num
  }
  
  const num = parseInt(fontWeight.toString())
  if (!isNaN(num)) return num
  
  return fontWeight
}

export function measureTextSize(
  text: string,
  fontSize: number,
  options: LayoutOptions,
  fontFamily: string = SNOWBRUSH_FONT_FAMILY,
  fontWeight: string | number = 'normal',
  fontStyle: string = 'normal',
): { width: number; height: number } {
  if (!text) return { width: 0, height: 0 }

  const preFontSize = fontSize
  let ratio = 1
  if (fontSize < 12) {
    ratio = fontSize / 12
    fontSize = 12
  }

  const ctx = getCanvasContext()
  if (ctx) {
    const normalizedWeight = normalizeFontWeight(fontWeight)
    const fontWeightStr = typeof normalizedWeight === 'number' ? normalizedWeight.toString() : normalizedWeight
    const fontSizePx = `${fontSize}px`
    const fontArr = [fontStyle, fontWeightStr, fontSizePx, fontFamily]
    ctx.font = fontArr.filter(Boolean).join(' ')

    const measureFn = (t: string) => ctx.measureText(t).width
    const lines = text.split('\n')
    const widthArr = lines.map(line => measureFn(line))
    const width = Math.max(...widthArr) * ratio
    const height = lines.length * preFontSize

    return { width: Math.ceil(width), height }
  }

  const charWidth = preFontSize * options.charWidthFactor
  const measureFn = (t: string) => t.length * charWidth
  const lines = text.split('\n')
  const lineWidths = lines.map(line => measureFn(line))
  const width = Math.max(...lineWidths)
  const height = lines.length * preFontSize

  return { width: Math.ceil(width), height }
}
