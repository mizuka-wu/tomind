/**
 * @tomind/core — 统一入口（向后兼容）
 *
 * 所有模块已拆分为独立包：
 * - @tomind/schema — 类型定义
 * - @tomind/state — 状态管理
 * - @tomind/view — 视图层
 * - @tomind/commands — 命令系统
 * - @tomind/layout — 布局引擎
 * - @tomind/style — 样式系统
 * - @tomind/extension — 扩展系统
 * - @tomind/assets — 资源处理
 * - @tomind/plugins — 插件系统
 * - @tomind/editor — 编辑器
 * - @tomind/xap — XAP 格式
 *
 * 新代码请直接从对应包导入。
 */

export * from '@tomind/schema'
export * from '@tomind/state'
export * from '@tomind/commands'
export * from '@tomind/layout'
export * from '@tomind/style'
export * from '@tomind/extension'
export * from '@tomind/assets'
export * from '@tomind/plugins'
export * from '@tomind/xap'
export * from '@tomind/view'
export * from '@tomind/editor'
