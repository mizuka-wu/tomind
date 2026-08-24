/**
 * Event Map — 通过模块声明合并收集所有扩展的事件类型
 *
 * 每个 extension 在自己的文件中通过 declare module 扩展此接口：
 *
 * ```ts
 * declare module '@tomind/extension' {
 *   interface EventMap {
 *     'my:event': { data: string }
 *   }
 * }
 * ```
 *
 * TypeScript 自动合并所有声明，ctx.on/emit 自动获得类型推导。
 */
export interface EventMap {
  // ─── View 事件透传 ───
  click: unknown
  dblclick: unknown
  contextmenu: unknown
  pointerdown: unknown
  pointerup: unknown
  pointermove: unknown
  keydown: unknown
  keyup: unknown
  dragstart: unknown
  dragend: unknown
  drop: unknown

  // ─── Selection ───
  'selection:hoverEnter': { nodeId: string }
  'selection:hoverLeave': { nodeId: string }
  'selection:select': { nodeId: string }
  'selection:toggle': { nodeId: string }
  'selection:notify': void
  'selection:setSilent': boolean
  'selection:boxSelectPreview': { nodeIds: string[]; bounds: unknown }
  'selection:boxSelectComplete': void

  // ─── Navigation ───
  'navigation:up': void
  'navigation:down': void
  'navigation:left': void
  'navigation:right': void
  'navigation:enter': void
  'navigation:tab:child': void
  'navigation:tab:sibling': void

  // ─── Drag (example) ───
  'drag:start': { sourceId: string | null }
  'drag:end': { sourceId: string | null }
  'drag:drop': { sourceId: string; targetId: string; data?: unknown }

  // ─── Viewport ───
  'viewport:setAutoMove': boolean
  'viewportChange': void
  'scaleChange': unknown

  // ─── Callback-based ───
  getLeaferView: (view: unknown) => void
  getViewPortCover: (el: HTMLElement) => void
  getContainer: (dom: HTMLElement) => void
  getConfig: (config: unknown) => void
}
