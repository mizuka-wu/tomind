import type { SheetState } from '@tomind/state'
import type { StyleEngine } from '@tomind/style'
import type { NodeDesc } from '@tomind/schema'
import { DEFAULT_LAYOUT_OPTIONS } from './layout-engine'
import type { ILayoutEngine, LayoutResult, LayoutAlgorithm, LayoutOptions } from './layout-engine'

/** XMind structureClass → 布局算法名 */
const STRUCTURE_CLASS_TO_LAYOUT: Record<string, string> = {
  'org.xmind.ui.map.clockwise': 'map-clockwise',
  'org.xmind.ui.map.anticlockwise': 'map-anticlockwise',
  'org.xmind.ui.map.unbalanced': 'map-unbalanced',
  'org.xmind.ui.logic.right': 'logic-right',
  'org.xmind.ui.logic.left': 'logic-left',
  'org.xmind.ui.tree.right': 'tree',
  'org.xmind.ui.tree.left': 'tree-left',
  'org.xmind.ui.tree.down': 'tree-down',
  'org.xmind.ui.tree.up': 'tree-up',
  'org.xmind.ui.brace.right': 'brace-right',
  'org.xmind.ui.brace.left': 'brace-left',
  'org.xmind.ui.org': 'org-chart-down',
  'org.xmind.ui.org.down': 'org-chart-down',
  'org.xmind.ui.org-chart.down': 'org-chart-down',
  'org.xmind.ui.org-chart.up': 'org-chart-up',
  'org.xmind.ui.org.up': 'org-chart-up',
  'org.xmind.ui.timeline.horizontal': 'timeline-horizontal',
  'org.xmind.ui.timeline.horizontal.down': 'timeline-horizontal-down',
  'org.xmind.ui.timeline.horizontal.up': 'timeline-horizontal-up',
  'org.xmind.ui.timeline.horizontal-down': 'timeline-horizontal-down',
  'org.xmind.ui.timeline.horizontal-up': 'timeline-horizontal-up',
  'org.xmind.ui.timeline.vertical': 'timeline-vertical',
  'org.xmind.ui.timeline.sided.horizontal': 'timeline-sided-horizontal',
  'org.xmind.ui.timeline.through.vertical': 'timeline-through-vertical',
  'org.xmind.ui.treetable': 'treetable',
  'org.xmind.ui.spreadsheet': 'matrix',
  'org.xmind.ui.spreadsheet.column': 'matrix',
  // SB allstructures.getStructure: 不支持的结构类回退 LOGICRIGHT
  // （legacy 'org.xmind.ui.fishbone.left/right' 在 SB 中不存在）
  'org.xmind.ui.fishbone.left': 'logic-right',
  'org.xmind.ui.fishbone.right': 'logic-right',
  'org.xmind.ui.fishbone.leftHeaded': 'fishbone-leftHeaded',
  'org.xmind.ui.fishbone.rightHeaded': 'fishbone-rightHeaded',
}

function resolveLayoutNameFromDoc(doc: NodeDesc | null | undefined): string | null {
  if (!doc) return null
  const structureClass = doc.attrs?.structureClass
  if (typeof structureClass !== 'string' || !structureClass) return null
  // SB: 显式 structureClass 存在但不受支持时回退 logic-right
  return STRUCTURE_CLASS_TO_LAYOUT[structureClass] ?? 'logic-right'
}

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

  compute(state: SheetState, customOptions?: Partial<LayoutOptions>): LayoutResult {
    const options = { ...DEFAULT_LAYOUT_OPTIONS, ...customOptions }

    // 优先按文档 structureClass 自动选择布局（对标 snowbrush）
    const autoName = resolveLayoutNameFromDoc(state.doc)
    const preferred = autoName ?? this._activeLayout
    const algorithm = this._registry.get(preferred)

    if (!algorithm) {
      const fallback =
        this._registry.get(this._activeLayout) ??
        this._registry.get('tree') ??
        this._registry.values().next().value
      if (!fallback) {
        console.warn(
          `[LayoutEngine] No layout algorithm registered. preferred=${preferred} registry=[${[...this._registry.keys()].join(',')}]`,
        )
        return { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
      }
      this._lastResult = fallback.layout(state.doc, options, this._styleEngine ?? null, state)
      return this._lastResult
    }

    if (autoName && autoName !== this._activeLayout) {
      this._activeLayout = autoName
    }

    this._lastResult = algorithm.layout(state.doc, options, this._styleEngine ?? null, state)
    return this._lastResult
  }

  getLayoutResult(): LayoutResult {
    return this._lastResult
  }
}
