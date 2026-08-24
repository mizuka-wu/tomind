/**
 * Event Map — 所有扩展间事件的类型定义
 *
 * 新增事件必须先在此处定义。
 * 各 extension 通过泛型参数声明自己 emit 的事件。
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

  // ─── Edit ───
  'edit:start': { nodeId: string; node: unknown }

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

  // ─── Select Drag ───
  'selectDrag:start': unknown
  'selectDrag:addBranch': unknown
  'selectDrag:removeBranch': unknown
  'selectDrag:move': unknown
  'selectDrag:end': void
  'selectDrag:branchMouseout': unknown

  // ─── Mouse Box Select ───
  'mouseBoxSelect:start': unknown
  'mouseBoxSelect:started': unknown
  'mouseBoxSelect:selecting': unknown
  'mouseBoxSelect:ended': void

  // ─── Resize ───
  'resize:changed': { nodeId: string; width: number; height: number }

  // ─── Context Menu ───
  'contextMenu:show': Record<string, unknown>
  'contextMenu:action': Record<string, unknown>

  // ─── Relationship ───
  'relationship:create': Record<string, unknown>
  'relationship:createMoving': Record<string, unknown>
  'relationship:updateMoving': Record<string, unknown>
  'relationship:endpointMoved': Record<string, unknown>
  'relationship:controlPointMoved': Record<string, unknown>
  'relationship:removeMoving': Record<string, unknown>
  'relationship:setStyle': Record<string, unknown>
  'relationship:setControlPoints': Record<string, unknown>
  'relationship:updateStyle': Record<string, unknown>

  // ─── Topic ───
  'topic:addChild': Record<string, unknown>
  'topic:addFloating': Record<string, unknown>
  'topic:createFloating': Record<string, unknown>
  'topic:customWidthChanged': Record<string, unknown>

  // ─── Drag Branch ───
  'drag:branch:placeholder:update': unknown
  'drag:branch:mount:detached': { views: unknown[]; position: { x: number; y: number }; isDuplicate?: boolean }
  'drag:branch:mount:attach': { views: unknown[]; parentView: unknown; at: number; isDuplicate?: boolean }
  'drag:branch:mount:free': { views: unknown[]; parentView: unknown; at: number; position: { x: number; y: number }; isDuplicate?: boolean }

  // ─── MiniMap ───
  'miniMap:created': { container: unknown }
  'miniMap:navigate': { ratioX: number; ratioY: number }
  'miniMap:drag': { ratioDx: number; ratioDy: number }
  'miniMap:requestViewport': unknown
  'miniMap:requestBounds': unknown
  'miniMap:requestRender': unknown
  'miniMap:requestScale': unknown

  // ─── Coordinate ───
  'coordinate:viewportToMindMap': unknown

  // ─── Drop ───
  'drop:image': Record<string, unknown>
  'drop:folder': Record<string, unknown>
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
  getLeaferView: unknown
  getViewPortCover: unknown
  getContainer: unknown
  getConfig: unknown
}
