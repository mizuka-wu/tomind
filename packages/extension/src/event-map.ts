/**
 * Event Map — 通过模块声明合并收集所有扩展的事件类型
 *
 * 每个 extension 在自己的文件中通过 declare module 扩展此接口。
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
  'viewport:showMouseInViewPort': { x: number; y: number }
  'viewportChange': void
  'scaleChange': unknown

  // ─── Select Box ───
  'selectBox:rangeChanged': { nodeId: string; rangeStart: number; rangeEnd: number; direction: string }

  // ─── Mouse Box Select ───
  'mouseBoxSelect:start': unknown
  'mouseBoxSelect:started': unknown
  'mouseBoxSelect:selecting': { bounds: unknown; isSegmentMultiSelect: boolean }
  'mouseBoxSelect:ended': void

  // ─── Resize ───
  'resize:changed': { nodeId: string; width: number; height: number }

  // ─── Context Menu ───
  'contextMenu:show': { event: unknown; nodeId: string }
  'contextMenu:action': { itemId: string; nodeId: string }

  // ─── Relationship ───
  'relationship:create': { sourceId: string; targetId: string }
  'relationship:createMoving': { sourceId: string; position: unknown }
  'relationship:updateMoving': { position: unknown }
  'relationship:endpointMoved': { relationshipId: string; endpoint: string; nodeId: string }
  'relationship:controlPointMoved': { relationshipId: string; controlPoint: unknown }
  'relationship:removeMoving': { id: string }
  'relationship:setStyle': { style: unknown }
  'relationship:setControlPoints': { points: unknown }
  'relationship:updateStyle': { style: unknown }

  // ─── Topic ───
  'topic:addChild': { parentId?: string; attrs?: unknown }
  'topic:addFloating': { position: unknown; attrs?: unknown }
  'topic:createFloating': { position: unknown }
  'topic:customWidthChanged': { nodeId: string; width: number }

  // ─── MiniMap ───
  'miniMap:created': { container: unknown }
  'miniMap:navigate': { ratioX: number; ratioY: number }
  'miniMap:drag': { ratioDx: number; ratioDy: number }
  'miniMap:requestViewport': (viewport: unknown) => void
  'miniMap:requestBounds': (bounds: unknown) => void
  'miniMap:requestRender': unknown
  'miniMap:requestScale': (scale: number | null) => void

  // ─── Coordinate ───
  'coordinate:viewportToMindMap': unknown

  // ─── Drop ───
  'drop:image': { src: string; position: unknown }
  'drop:folder': { name: string; position: unknown }
  'drop:attachment': unknown
  'drop:onDragMoving': unknown
  'drop:getDropView': unknown
  'drop:finish': void

  // ─── Indicator ───
  'indicator:update': unknown

  // ─── File ───
  'file:save': void

  // ─── Content ───
  'contentChange': void

  // ─── Callback-based ───
  getLeaferView: (view: unknown) => void
  getViewPortCover: (el: HTMLElement) => void
  getContainer: (dom: HTMLElement) => void
  getConfig: (config: unknown) => void
}
