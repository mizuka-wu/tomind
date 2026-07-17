/**
 * Style 模块 — 主题管理 + 样式计算
 *
 * 核心组件：
 * - StyleEngine: 主题管理器 + 样式计算引擎
 * - classifyNode: 从 doc 树推断节点类型
 * - DEFAULT_STYLES: 默认样式值
 * - ThemePackage: 主题包接口
 *
 * 使用示例：
 * ```ts
 * import { StyleEngine, classifyNode, DEFAULT_STYLES } from '@/core/style'
 *
 * const engine = new StyleEngine()
 *
 * // 加载 Snowball 主题
 * engine.loadTheme({
 *   id: 'snowball-dark',
 *   skeleton: skeletonTheme,
 *   color: colorTheme,
 * })
 *
 * // 设置为当前主题
 * engine.setActiveTheme('snowball-dark')
 *
 * // 计算节点样式
 * const style = engine.computeStyle(state, topicId)
 * ```
 */

// 核心引擎
export { StyleEngine } from './style-engine'
export type { ThemePackage } from './style-engine'

// 工具函数
export { classifyNode, getParentId } from './classify'

// 默认样式
export { DEFAULT_STYLES } from './default-styles'

// 类型定义
export type {
  StyleValue,
  ResolvedStyle,
  ThemeData,
  StyleComputeOptions,
  NodeType,
} from './style-types'

// 样式转换器（双向转换）
export {
  normalizeColor,
  serializeColor,
  parseUnit,
  serializeUnit,
  parseStrokeDash,
  serializeStrokeDash,
  normalizeTextAlign,
  serializeTextAlign,
  normalizeFontWeight,
  serializeFontWeight,
  normalizeOpacity,
  serializeOpacity,
  parseTransform,
  serializeTransform,
  normalizeStyleObject,
  serializeStyleObject,
} from './style-converter'
export type { TransformValues } from './style-converter'