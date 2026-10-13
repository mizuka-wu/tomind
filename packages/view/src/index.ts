/**
 * View 模块导出
 */

export { ViewDesc, DirtyFlag } from './view-desc'
export type { ViewDesc as ViewDescType } from './view-desc'
export { analyzeSteps } from './dirty-analysis'
export type { DirtyAnalysis } from './dirty-analysis'

export { 
  NodeViewDesc, 
  RootViewDesc,
  TopicNodeViewDesc, 
  RelationshipNodeViewDesc, 
  BoundaryNodeViewDesc, 
  SummaryNodeViewDesc,
  CollapseExtendNodeViewDesc,
  NumberingNodeViewDesc,
  TopicTitleNodeViewDesc,
  InformationNodeViewDesc,
  LabelNodeViewDesc,
  PlaceholderTopicNodeViewDesc,
  ImageNodeViewDesc,
  IndicatorNodeViewDesc,
  BoundaryTitleNodeViewDesc,
  MathjaxNodeViewDesc,
  SelectBoxNodeViewDesc,
  TopicSelectBoxNodeViewDesc,
  ResizeBoxNodeViewDesc,
  FishboneMainLineNodeViewDesc,
  FishboneHeadLineNodeViewDesc,
  MatrixCellNodeViewDesc,
  TreeTableCellNodeViewDesc,
  ConnectionNodeViewDesc,
  LegendNodeViewDesc,
  MarkerNodeViewDesc
} from './node-view-desc'
export { getConnectionStructureMap } from './node-view-desc'
export type { ViewContext } from './node-view-desc'

// 父子连线的锚点/路径纯函数（对齐 snowbrush），也供 parity 工具与单测直接调用
export {
  computeConnectionGeometry,
  computeConnectionAnchors,
  resolveChildStructureClass,
  normalizeStructureClass,
  normalizeLineClass,
  normalizeShapeClass,
  getStartDirection,
  getEndDirection,
  getLineFocusType,
} from './connection-geometry'
export type {
  ConnBox,
  ConnPoint,
  ConnDirection,
  ConnSideStyle,
  ConnectionGeometry,
  ConnectionGeometryInput,
} from './connection-geometry'

export { MatrixNodeViewDesc } from './matrix-node-view'

export {
  PartViewDesc,
  TitlePartViewDesc,
  ImagePartViewDesc,
  MarkersPartViewDesc,
  LabelsPartViewDesc,
  NotePartViewDesc,
  LinkPartViewDesc,
  CommentsPartViewDesc,
  InformationIconPartViewDesc,
} from './part-view-desc'

// 事件系统 - 类型
export type { 
  ViewEventType, 
  ViewEventHandler, 
  ViewEvent, 
  EventEmitter,
  PointerEventType,
  DragEventType,
  KeyboardEventType,
  GestureEventType,
  DragEventData,
  KeyboardEventData,
  GestureEventData
} from './view-event'

// 事件系统 - 实现
export { 
  DefaultEventEmitter, 
  createViewEvent, 
  fromLeaferEventType,
  fromDomEventType,
  isDragEventType,
  isKeyboardEventType,
  isGestureEventType
} from './view-event'
export { EventManager } from './event-manager'
export { EventDelegator } from './event-delegator'
export { KeyboardEventManager } from './keyboard-event-manager'
export { 
  throttle, 
  debounce, 
  rafThrottle, 
  createThrottledHandler, 
  createDebouncedHandler 
} from './event-throttler'
