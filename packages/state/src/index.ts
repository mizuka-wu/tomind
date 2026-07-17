/**
 * State 模块导出
 */

export { Transform } from './transform'
export { Transaction } from './transaction'
export { SheetState, PluginKey } from './sheet-state'
export type { Plugin } from './sheet-state'
export { 
  Step,
  InsertNodeStep,
  RemoveNodeStep,
  UpdateNodeStep,
  SetSelectionStep,
  SetViewportStep
} from './step'
export type { StepType, StepJSON } from './step'
export type { NodeDesc, NodeInfo, NodeRole, SelectionState, Viewport } from '@tomind/schema'

// Decoration 系统
export {
  DecorationSet,
  widgetDecoration,
  nodeDecoration,
  inlineDecoration,
} from './decoration'
export type {
  Decoration,
  WidgetDecoration,
  NodeDecoration,
  InlineDecoration,
  WidgetSide,
} from './decoration'

// ClassList 工具
export {
  CLASS_SEPARATOR,
  parseClassList,
  serializeClassList,
  hasClass,
  addClass,
  removeClass,
  toggleClass,
  getClassStyleValue,
  getClassStyles,
} from './class-list'

// Workbook 系统
export { WorkbookState } from './workbook-state'
export type { WorkbookMetadata } from './workbook-state'
export { WorkbookTransactionBuilder } from './workbook-transaction'
export type { WorkbookTransaction, GlobalData, Relation } from './workbook-transaction'
