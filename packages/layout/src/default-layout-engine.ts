import type { SheetState } from '@tomind/state'
import type { StyleEngine } from '@tomind/style'
import { layout, DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import type { LayoutEngine, LayoutResult } from './layout-engine'

export class DefaultLayoutEngine implements LayoutEngine {
  private _styleEngine: StyleEngine | null = null
  private _lastResult: LayoutResult = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }

  setStyleEngine(engine: StyleEngine): void {
    this._styleEngine = engine
  }

  compute(state: SheetState): LayoutResult {
    this._lastResult = layout(
      state.doc,
      DEFAULT_LAYOUT_OPTIONS,
      this._styleEngine ?? undefined,
      state,
      'tree'
    )
    return this._lastResult
  }

  getLayoutResult(): LayoutResult {
    return this._lastResult
  }
}
