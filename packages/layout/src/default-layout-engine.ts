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

  /** 当前激活的布局名称 */
  private _activeLayout = 'tree'

  /** 设置当前激活的布局 */
  setActiveLayout(name: string): void {
    this._activeLayout = name
  }

  /** 获取当前激活的布局名称 */
  getActiveLayout(): string {
    return this._activeLayout
  }

  compute(state: SheetState): LayoutResult {
    const algorithm = this._registry.get(this._activeLayout)
    if (!algorithm) {
      // fallback: 尝试 'tree'，再 fallback 到第一个可用算法
      const fallback = this._registry.get('tree') ?? this._registry.values().next().value
      if (!fallback) {
        console.warn(`[LayoutEngine] No layout algorithm registered. activeLayout=${this._activeLayout} registry=[${[...this._registry.keys()].join(',')}]`)
        return { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
      }
      console.log(`[LayoutEngine] Using fallback algorithm: ${fallback.name}`)
      this._lastResult = fallback.layout(
        state.doc,
        DEFAULT_LAYOUT_OPTIONS,
        this._styleEngine ?? null,
        state,
      )
      console.log(`[LayoutEngine] compute result: ${this._lastResult.nodes.size} nodes, ${this._lastResult.totalWidth}x${this._lastResult.totalHeight}`)
      for (const [id, n] of this._lastResult.nodes) {
        console.log(`  [layout] ${id} → (${n.x},${n.y} ${n.width}x${n.height})`)
      }
      return this._lastResult
    }
    this._lastResult = algorithm.layout(
      state.doc,
      DEFAULT_LAYOUT_OPTIONS,
      this._styleEngine ?? null,
      state,
    )
    console.log(`[LayoutEngine] compute(${algorithm.name}): ${this._lastResult.nodes.size} nodes, ${this._lastResult.totalWidth}x${this._lastResult.totalHeight}`)
    for (const [id, n] of this._lastResult.nodes) {
      console.log(`  [layout] ${id} → (${n.x},${n.y} ${n.width}x${n.height})`)
    }
    return this._lastResult
  }

  getLayoutResult(): LayoutResult {
    return this._lastResult
  }
}
