import type { SheetState } from '@tomind/state'
import type { StyleEngine } from '@tomind/style'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import type { ILayoutEngine, LayoutResult, LayoutAlgorithm } from './layout-engine'

export class LayoutEngine implements ILayoutEngine {
  private _styleEngine: StyleEngine | null = null
  private _lastResult: LayoutResult = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
  private _registry = new Map<string, LayoutAlgorithm>()

  register(algorithm: LayoutAlgorithm): void {
    this._registry.set(algorithm.name, algorithm)
  }

  unregister(name: string): void {
    this._registry.delete(name)
  }

  setStyleEngine(engine: StyleEngine | null): void {
    this._styleEngine = engine
  }

  compute(state: SheetState): LayoutResult {
    const algorithm = this._registry.get('tree')
    if (!algorithm) {
      console.warn(`Layout algorithm "tree" not registered`)
      return { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    }
    this._lastResult = algorithm.layout(
      state.doc,
      DEFAULT_LAYOUT_OPTIONS,
      this._styleEngine ?? null,
      state,
    )
    return this._lastResult
  }

  getLayoutResult(): LayoutResult {
    return this._lastResult
  }
}
