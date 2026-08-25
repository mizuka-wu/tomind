/**
 * BaseEventMap — 基础设施事件
 *
 * 只保留 DOM 透传、浏览器 DnD、Callback、跨层事件、
 * 编辑器状态、基础设施事件。
 *
 * 各 extension 自定义事件通过 createExtension<Opts, Storage, Events> 泛型注入。
 */

/**
 * drag:branch 事件中视图描述符的最小结构
 * 通过模块声明合并可扩展
 */
export interface DragViewDesc {
  node: {
    id: string
    type: string
    attrs: Record<string, unknown>
    children: Record<string, unknown>
    parent?: unknown
  }
  opacity?: number
  getStructureClass?: () => string
  getChildrenBranches?: () => DragViewDesc[]
  getRealPosition?: () => { x: number; y: number }
  getPolyPointsArr?: () => unknown[]
}

export interface BaseEventMap {
  // ─── DOM 透传 ───
  click: MouseEvent
  dblclick: MouseEvent
  contextmenu: MouseEvent
  pointerdown: PointerEvent
  pointerup: PointerEvent
  pointermove: PointerEvent
  keydown: KeyboardEvent
  keyup: KeyboardEvent

  // ─── 浏览器 DnD ───
  dragstart: unknown
  dragend: unknown
  drop: unknown

  // ─── Callback ───
  getLeaferView: unknown
  getViewPortCover: unknown
  getContainer: unknown
  getConfig: unknown

  // ─── 跨层事件 ───
  'edit:start': { nodeId: string; node: { attrs?: Record<string, unknown> } }

  // ─── 编辑器状态 ───
  viewportChange: void
  scaleChange: unknown
  contentChange: void
  'file:save': void

  // ─── 基础设施 ───
  'indicator:update': unknown
  'coordinate:viewportToMindMap': unknown
}
