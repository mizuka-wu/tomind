import type { Group } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { ViewEventType, ViewEventHandler } from '../view-event'

/**
 * Renderer 接口 — 负责 LeaferJS 图形对象的创建和更新
 * 
 * 参考 Tiptap 的 NodeView 模式：
 * - 简单节点可以在 NodeViewDesc 里直接实现
 * - 复杂节点委托给 Renderer
 * 
 * style 参数是 LeaferJS 格式（由 StyleEngine.getLeaferStyle() 提供）
 */
export interface Renderer {
  /**
   * 创建 LeaferJS 图形对象
   * @param parent 父级 Group
   */
  create(parent: Group): void

  /**
   * 更新渲染
   * @param layout 布局结果
   * @param style LeaferJS 格式样式（fill, stroke, strokeWidth, cornerRadius 等）
   * @param nodeAttrs 节点原始属性（含 title/attributeTitle，供文本渲染使用）
   */
  render(layout: LayoutResult, style: Record<string, unknown>, nodeAttrs?: Record<string, unknown>): void

  /**
   * 销毁图形对象
   */
  destroy(): void

  /**
   * 注册事件处理器（可选）
   * @param type 事件类型
   * @param handler 事件处理器
   * @param element 目标元素（可选，默认为根元素）
   */
  on?(type: ViewEventType, handler: ViewEventHandler, element?: Group): void

  /**
   * 注销事件处理器（可选）
   * @param type 事件类型
   * @param handler 事件处理器
   * @param element 目标元素（可选，默认为根元素）
   */
  off?(type: ViewEventType, handler: ViewEventHandler, element?: Group): void

  /**
   * 清除所有事件处理器（可选）
   */
  clearEvents?(): void
}
