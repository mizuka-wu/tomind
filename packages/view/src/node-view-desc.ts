/**
 * NodeViewDesc — 节点视图描述（对标 ProseMirror NodeViewDesc）
 *
 * 职责：
 * 1. 渲染节点（Topic/Relationship/Boundary/Summary）
 * 2. 管理 PartViewDesc（标题、图片、标记等）
 * 3. 处理样式和布局
 * 4. 应用 Node Decoration（样式装饰）
 */

import { Group, Rect, Ellipse } from 'leafer-ui'
import { Path } from 'leafer-ui'
import { ViewDesc, DirtyFlag } from './view-desc'
import type {
  NodeDesc,
  NodeRole,
  RelationshipNodeDesc,
  BoundaryNodeDesc,
  SummaryNodeDesc,
} from '@tomind/schema'
import type { StyleEngine } from '@tomind/style'
import type { LayoutEngine, LayoutResult } from '@tomind/layout'
import { getTitleText } from '@tomind/schema'
import type { SheetState } from '@tomind/state'
import type { NodeDecoration } from '@tomind/state'
import { TopicRenderer } from './renderers/topic-renderer'
import { RelationshipRenderer } from './renderers/relationship-renderer'
import { BoundaryRenderer } from './renderers/boundary-renderer'
import { SummaryRenderer } from './renderers/summary-renderer'
import { CollapseExtendRenderer } from './renderers/collapse-extend-renderer'
import { NumberingRenderer } from './renderers/numbering-renderer'
import { TopicTitleRenderer } from './renderers/topic-title-renderer'
import { InformationRenderer } from './renderers/information-renderer'
import { LabelRenderer } from './renderers/label-renderer'
import { PlaceholderTopicRenderer } from './renderers/placeholder-topic-renderer'
import { ImageRenderer } from './renderers/image-renderer'
import { IndicatorRenderer } from './renderers/indicator-renderer'
import { BoundaryTitleRenderer } from './renderers/boundary-title-renderer'
import { MathjaxRenderer } from './renderers/mathjax-renderer'
import { SelectBoxRenderer } from './renderers/select-box-renderer'
import { TopicSelectBoxRenderer } from './renderers/topic-select-box-renderer'
import { ResizeBoxRenderer } from './renderers/resize-box-renderer'
import { FishboneMainLineRenderer } from './renderers/fishbone-main-line-renderer'
import { FishboneHeadLineRenderer } from './renderers/fishbone-head-line-renderer'
import { MatrixCellRenderer } from './renderers/matrix-cell-renderer'
import { TreeTableCellRenderer } from './renderers/tree-table-cell-renderer'
import { ConnectionRenderer } from './renderers/connection-renderer'
import type { Renderer } from './renderers/renderer'

// ==================== NodeViewDesc ====================

export abstract class NodeViewDesc extends ViewDesc {
  /** 样式引擎引用（由 SheetEditor 注入） */
  static styleEngine: StyleEngine | null = null
  /** 布局引擎引用（由 SheetEditor 注入） */
  static layoutEngine: LayoutEngine | null = null
  /** 状态引用（由 SheetEditor 注入） */
  static state: SheetState | null = null
  /** 事件发射器引用（由 SheetEditor 注入，用于扩展间通信） */
  static _eventEmitter: { emit: (event: string, ...args: unknown[]) => void } | null = null

  constructor(node: NodeDesc, role: NodeRole) {
    super(node, role)
  }

  // ==================== 样式计算 ====================

  protected getNodeStyle(): Record<string, unknown> {
    if (NodeViewDesc.styleEngine && NodeViewDesc.state) {
      return NodeViewDesc.styleEngine.computeStyle(NodeViewDesc.state, this.node.id) as Record<string, unknown>
    }
    return {}
  }

  protected getNodeAttrs(): Record<string, unknown> {
    return this.node.attrs
  }

  // ==================== Decoration 应用 ====================

  /**
   * 应用 Node Decoration 到元素
   */
  protected applyNodeDecorations(decorations: readonly NodeDecoration[]): void {
    if (!this._element || decorations.length === 0) return

    // 合并所有 Decoration 的 attrs
    let mergedClass = ''
    const mergedStyle: Record<string, string | number> = {}

    for (const dec of decorations) {
      if (dec.attrs.class) {
        mergedClass += (mergedClass ? ' ' : '') + dec.attrs.class
      }
      if (dec.attrs.style) {
        Object.assign(mergedStyle, dec.attrs.style)
      }
    }

    // 应用到元素
    if (mergedClass) {
      this._element.setAttr('className', mergedClass)
    }
    for (const [key, value] of Object.entries(mergedStyle)) {
      this._element.setAttr(key, value)
    }
  }

  // ==================== 更新 ====================

  override update(newNode: NodeDesc): boolean {
    if (this._destroyed) return false

    if (newNode.type !== this.node.type) return false

    this.updateNode(newNode)

    if (this.isDirty(DirtyFlag.STYLE)) this.updateStyle()
    if (this.isDirty(DirtyFlag.CONTENT)) this.updateContent()

    // 应用 Node Decoration
    if (NodeViewDesc.state) {
      const nodeDecs = NodeViewDesc.state.decorations.getNodeDecorations(this.node.id)
      this.applyNodeDecorations(nodeDecs)
    }

    this.clearDirty()
    return true
  }

  protected abstract updateStyle(): void
  protected abstract updateContent(): void
}

// ==================== RootViewDesc ====================

/** 根节点 ViewDesc — 透明容器，不渲染自身，只管理子节点 */
export class RootViewDesc extends NodeViewDesc {
  protected createElement(): Group {
    return new Group()
  }

  protected createContentGroup(): Group {
    return new Group()
  }

  protected updateStyle(): void {}
  protected updateContent(): void {}
}

// ==================== TopicNodeViewDesc ====================

export class TopicNodeViewDesc extends NodeViewDesc {
  private renderer: Renderer | null = null
  private _selectBoxElement: Group | null = null
  private _isHovering = false
  private _connectionPaths: Path[] = []

  protected createElement(): Group {
    const group = new Group()
    
    // 创建 Renderer
    this.renderer = new TopicRenderer(this.node.id)
    this.renderer.create(group)
    
    // 注册事件
    this.setupEvents(group)
    
    return group
  }

  private setupEvents(group: Group): void {
    // 双击 - 进入编辑模式
    group.on_('doubletap', (e: any) => {
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('edit:start', {
        nodeId: this.node.id,
        node: this.node,
      })
    })
    
    // 鼠标进入 - 通知选区扩展
    group.on_('pointerenter', () => {
      if (this._isHovering) return
      this._isHovering = true
      NodeViewDesc._eventEmitter?.emit('selection:hoverEnter', this.node.id)
    })
    
    // 鼠标离开 - 通知选区扩展
    group.on_('pointerleave', () => {
      if (!this._isHovering) return
      this._isHovering = false
      NodeViewDesc._eventEmitter?.emit('selection:hoverLeave', this.node.id)
    })
    
    // 右键菜单
    group.on_('righttap', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })
    
    // 长按菜单
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })
  }

  protected createContentGroup(): Group {
    const content = new Group({ x: 0, y: 40 })
    return content
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) {
      return
    }
    
    // 获取 LeaferJS 格式样式
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    
    // 读取缓存的布局结果（由 SheetEditor.updateState 统一 compute）
    let layout: LayoutResult
    if (NodeViewDesc.layoutEngine) {
      layout = NodeViewDesc.layoutEngine.getLayoutResult()
    } else {
      layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    }
    
    this.renderer.render(layout, style)

    // 绘制父子连线
    this.renderConnections(layout)
  }

  /**
   * 绘制从当前节点到每个子节点的连线
   * 连线画在 contentGroup 里（在子节点下方）
   */
  private renderConnections(layout: LayoutResult): void {
    const group = this.element
    if (!group) return

    // 清除旧连线
    for (const p of this._connectionPaths) {
      p.destroy()
    }
    this._connectionPaths = []

    // 获取自己的布局位置
    const myLayout = layout.nodes.get(this.node.id)
    if (!myLayout) return

    // 遍历子节点（attached slot）
    const children = this.node.children['attached'] ?? []
    if (children.length === 0) return

    // 连线样式
    const strokeColor = (style: Record<string, unknown>) =>
      (style.lineColor as string) ?? '#999'
    const strokeWidth = (style: Record<string, unknown>) =>
      (style.lineWidth as number) ?? 1

    const nodeStyle = NodeViewDesc.styleEngine && NodeViewDesc.state
      ? NodeViewDesc.styleEngine.computeStyle(NodeViewDesc.state, this.node.id) as Record<string, unknown>
      : {}

    for (const child of children) {
      const childLayout = layout.nodes.get(child.id)
      if (!childLayout) continue

      // 起点：当前节点右边缘中心
      const startX = myLayout.x + myLayout.width
      const startY = myLayout.y + myLayout.height / 2

      // 终点：子节点左边缘中心
      const endX = childLayout.x
      const endY = childLayout.y + childLayout.height / 2

      // 圆角折线：先水平再垂直再水平（XMind 风格）
      const midX = (startX + endX) / 2
      const d = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`

      const path = new Path({
        path: d,
        stroke: strokeColor(nodeStyle),
        strokeWidth: strokeWidth(nodeStyle),
        fill: 'none',
      })

      group.add(path)
      this._connectionPaths.push(path)
    }
  }

  protected updateContent(): void {
    // 内容更新在 render 中处理
    this.updateStyle()
  }

  /**
   * 设置选择框元素（用于动画）
   */
  setSelectBoxElement(element: Group | null): void {
    this._selectBoxElement = element
  }

  /**
   * 分支放大动画
   */
  zoomIn(): Promise<void> {
    return new Promise((resolve) => {
      const element = this.element
      if (!element) { resolve(); return }

      const doZoomIn = () => {
        // 放大分支
        const anim = element.animate(
          { scaleX: 1.05, scaleY: 1.05 },
          { duration: 200, easing: 'ease-in' }
        )
        anim.on('completed', () => {
          // 恢复原始大小
          const restore = element.animate(
            { scaleX: 1, scaleY: 1 },
            { duration: 100, easing: 'ease-out' }
          )
          restore.on('completed', () => resolve())
        })
      }

      // 淡出选择框
      if (this._selectBoxElement) {
        const fadeAnim = this._selectBoxElement.animate(
          { opacity: 0 },
          { duration: 200, easing: 'ease-in' }
        )
        fadeAnim.on('completed', doZoomIn)
      } else {
        doZoomIn()
      }
    })
  }

  /**
   * 高亮选择框动画
   */
  highlightSelectBox(): Promise<void> {
    return new Promise((resolve) => {
      const selectBox = this._selectBoxElement
      if (!selectBox) { resolve(); return }

      // 高亮动画
      const animation = selectBox.animate(
        { strokeWidth: 3, stroke: '#ef3420' },
        { duration: 400, easing: 'ease-out' }
      )

      animation.on('completed', () => {
        // 恢复原始样式
        const restore = selectBox.animate(
          { strokeWidth: 1, stroke: '#000' },
          { duration: 200, easing: 'ease-in' }
        )
        restore.on('completed', () => resolve())
      })
    })
  }

  /**
   * 杀死所有动画
   */
  killAnimations(): void {
    // LeaferJS 会自动处理动画清理
  }
}

// ==================== RelationshipNodeViewDesc ====================

export class RelationshipNodeViewDesc extends NodeViewDesc {
  private renderer: RelationshipRenderer | null = null
  private _isHovering = false
  private _savedStroke: string | undefined

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new RelationshipRenderer(this.node.id)
    this.renderer.create(group)

    // 注册事件
    this.setupEvents(group)

    return group
  }

  protected createContentGroup(): null {
    return null
  }

  private setupEvents(group: Group): void {
    // 双击 - 选中关联关系
    group.on_('doubletap', (e: any) => {
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('selection:select', this.node.id)
    })

    // 右键菜单
    group.on_('righttap', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 长按菜单
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // pointerenter - 关联线悬停高亮
    group.on_('pointerenter', () => {
      if (this._isHovering) return
      this._isHovering = true
      if (this.renderer) {
        const pathRect = (this.renderer as unknown as { pathRect: Rect | null }).pathRect
        if (pathRect) {
          this._savedStroke = pathRect.stroke as string
          pathRect.stroke = '#2563eb'
          pathRect.strokeWidth = 3
        }
      }
    })

    // pointerleave - 恢复
    group.on_('pointerleave', () => {
      if (!this._isHovering) return
      this._isHovering = false
      if (this.renderer) {
        const pathRect = (this.renderer as unknown as { pathRect: Rect | null }).pathRect
        if (pathRect) {
          pathRect.stroke = this._savedStroke ?? '#666'
          pathRect.strokeWidth = 2
        }
      }
    })
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    if (!this.renderer || !NodeViewDesc.state) return
    
    const node = this.node as RelationshipNodeDesc
    const { sourceId, targetId, title, controlPoints } = node.attrs

    const sourceNode = NodeViewDesc.state.getNode(sourceId)
    const targetNode = NodeViewDesc.state.getNode(targetId)
    if (!sourceNode || !targetNode) return

    const sourcePos = sourceNode.attrs.position as { x: number; y: number } | undefined
    const sourceSize = sourceNode.attrs.size as { width: number; height: number } | undefined
    const targetPos = targetNode.attrs.position as { x: number; y: number } | undefined
    const targetSize = targetNode.attrs.size as { width: number; height: number } | undefined
    if (!sourcePos || !sourceSize || !targetPos || !targetSize) return

    const from = {
      x: sourcePos.x + sourceSize.width / 2,
      y: sourcePos.y + sourceSize.height / 2,
    }
    const to = {
      x: targetPos.x + targetSize.width / 2,
      y: targetPos.y + targetSize.height / 2,
    }

    this.renderer.setEndpoints(from, to, controlPoints, title)
    this.updateStyle()
  }

  /**
   * 高亮选择框动画
   */
  highlightSelectBox(): Promise<void> {
    return new Promise((resolve) => {
      const element = this.element
      if (!element) { resolve(); return }

      // 高亮动画
      const animation = element.animate(
        { strokeWidth: 9, stroke: '#ef3420' },
        { duration: 400, easing: 'ease-out' }
      )

      animation.on('completed', () => {
        // 恢复原始样式
        const restore = element.animate(
          { strokeWidth: 1, stroke: '#000' },
          { duration: 200, easing: 'ease-in' }
        )
        restore.on('completed', () => resolve())
      })
    })
  }

  /**
   * 杀死所有动画
   */
  killAnimations(): void {
    // LeaferJS 会自动处理动画清理
  }
}

// ==================== BoundaryNodeViewDesc ====================

export class BoundaryNodeViewDesc extends NodeViewDesc {
  private renderer: BoundaryRenderer | null = null
  private _selectBoxVisible = false
  private _savedStroke: string | undefined
  private _savedStrokeWidth: number | undefined

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new BoundaryRenderer(this.node.id)
    this.renderer.create(group)
    
    // 注册事件
    this.setupEvents(group)
    
    return group
  }

  private setupEvents(group: Group): void {
    // 鼠标进入 - 显示选择框
    group.on_('pointerenter', () => {
      if (!this._selectBoxVisible) {
        this._selectBoxVisible = true
        this.updateSelectBoxVisibility(true)
      }
    })
    
    // 鼠标离开 - 隐藏选择框
    group.on_('pointerleave', () => {
      if (this._selectBoxVisible) {
        this._selectBoxVisible = false
        this.updateSelectBoxVisibility(false)
      }
    })
    
    // 右键菜单
    group.on_('righttap', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
    })
    
    // 长按菜单
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
    })
  }

  private updateSelectBoxVisibility(visible: boolean): void {
    if (!this.renderer) return
    const rect = (this.renderer as unknown as { rect: Rect | null }).rect
    if (!rect) return

    if (visible) {
      // 高亮：蓝色边框 + 加粗
      this._savedStroke = rect.stroke as string
      this._savedStrokeWidth = rect.strokeWidth as number
      rect.stroke = '#2563eb'
      rect.strokeWidth = 2
    } else {
      // 恢复原始样式
      if (this._savedStroke !== undefined) rect.stroke = this._savedStroke
      if (this._savedStrokeWidth !== undefined) rect.strokeWidth = this._savedStrokeWidth
    }
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    if (!this.renderer || !NodeViewDesc.state) return
    
    const node = this.node as BoundaryNodeDesc
    const { topicIds, title } = node.attrs

    const positions: { x: number; y: number; width: number; height: number }[] = []
    for (const topicId of topicIds) {
      const topicNode = NodeViewDesc.state.getNode(topicId)
      if (topicNode) {
        const pos = topicNode.attrs.position as { x: number; y: number } | undefined
        const size = topicNode.attrs.size as { width: number; height: number } | undefined
        if (pos && size) {
          positions.push({ ...pos, ...size })
        }
      }
    }

    if (positions.length === 0) return

    const padding = 8
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of positions) {
      minX = Math.min(minX, p.x)
      minY = Math.min(minY, p.y)
      maxX = Math.max(maxX, p.x + p.width)
      maxY = Math.max(maxY, p.y + p.height)
    }

    this.renderer.setBounds(
      { x: minX - padding, y: minY - padding, width: maxX - minX + padding * 2, height: maxY - minY + padding * 2 },
      title,
    )
    this.updateStyle()
  }

  /**
   * 高亮选择框动画
   */
  highlightSelectBox(): Promise<void> {
    return new Promise((resolve) => {
      const element = this.element
      if (!element) { resolve(); return }

      // 高亮动画
      const animation = element.animate(
        { strokeWidth: 3, stroke: '#ef3420' },
        { duration: 400, easing: 'ease-out' }
      )

      animation.on('completed', () => {
        // 恢复原始样式
        const restore = element.animate(
          { strokeWidth: 1, stroke: '#000' },
          { duration: 200, easing: 'ease-in' }
        )
        restore.on('completed', () => resolve())
      })
    })
  }

  /**
   * 杀死所有动画
   */
  killAnimations(): void {
    // LeaferJS 会自动处理动画清理
  }
}

// ==================== SummaryNodeViewDesc ====================

export class SummaryNodeViewDesc extends NodeViewDesc {
  private topicRenderer: TopicRenderer | null = null
  private summaryRenderer: SummaryRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    
    // Topic 部分
    this.topicRenderer = new TopicRenderer(this.node.id)
    this.topicRenderer.create(group)
    
    // Summary 括号线
    this.summaryRenderer = new SummaryRenderer(this.node.id)
    this.summaryRenderer.create(group)
    
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.topicRenderer || !this.summaryRenderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.topicRenderer.render(layout, style)
    this.summaryRenderer.render(layout, style)
  }

  protected updateContent(): void {
    if (!this.summaryRenderer || !NodeViewDesc.state) return
    
    const node = this.node as SummaryNodeDesc
    const { topicIds } = node.attrs

    const positions: { x: number; y: number; height: number }[] = []
    for (const topicId of topicIds) {
      const topicNode = NodeViewDesc.state.getNode(topicId)
      if (topicNode) {
        const pos = topicNode.attrs.position as { x: number; y: number } | undefined
        const size = topicNode.attrs.size as { width: number; height: number } | undefined
        if (pos && size) {
          positions.push({ x: pos.x, y: pos.y, height: size.height })
        }
      }
    }

    if (positions.length === 0) return

    const padding = 12
    let minY = Infinity, maxY = -Infinity
    let maxX = -Infinity
    for (const p of positions) {
      minY = Math.min(minY, p.y)
      maxY = Math.max(maxY, p.y + p.height)
      maxX = Math.max(maxX, p.x)
    }

    this.summaryRenderer.setBounds(
      { x: maxX + padding, y: minY, width: 0, height: maxY - minY },
      getTitleText(this.node.attrs),
    )
    this.updateStyle()
  }
}

// ==================== CollapseExtendNodeViewDesc ====================

export class CollapseExtendNodeViewDesc extends NodeViewDesc {
  private renderer: CollapseExtendRenderer | null = null
  private _isHovering = false
  private _savedFill: string | undefined

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new CollapseExtendRenderer(this.node.id)
    this.renderer.create(group)
    this.setupEvents(group)
    return group
  }

  private setupEvents(group: Group): void {
    // 点击 → 折叠/展开
    group.on_('tap', (e: any) => {
      e.stopPropagation?.()
      const nodeId = this.node.id
      if (e.altKey) {
        // Alt+click: 全部折叠/展开
        NodeViewDesc._eventEmitter?.emit('collapse:toggleAll', nodeId)
      } else {
        NodeViewDesc._eventEmitter?.emit('collapse:toggle', nodeId)
      }
    })

    // 双击 → 阻止冒泡（防止触发节点编辑）
    group.on_('doubletap', (e: any) => {
      e.stopPropagation?.()
    })

    // hover 高亮 - 用父节点的 lineColor 做填充
    group.on_('pointerenter', () => {
      if (this._isHovering) return
      this._isHovering = true
      if (this.renderer && NodeViewDesc.styleEngine && NodeViewDesc.state) {
        // 获取父节点的 lineColor
        const parentId = this._parent?.node.id
        if (parentId) {
          const parentStyle = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, parentId)
          const lineColor = parentStyle.lineColor as string | undefined
          if (lineColor) {
            const circleFill = (this.renderer as unknown as { circleFill: Ellipse | null }).circleFill
            if (circleFill) {
              this._savedFill = circleFill.fill as string
              circleFill.fill = lineColor
            }
          }
        }
      }
    })
    group.on_('pointerleave', () => {
      if (!this._isHovering) return
      this._isHovering = false
      if (this.renderer) {
        const circleFill = (this.renderer as unknown as { circleFill: Ellipse | null }).circleFill
        if (circleFill) {
          circleFill.fill = this._savedFill ?? 'none'
        }
      }
    })
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== NumberingNodeViewDesc ====================

export class NumberingNodeViewDesc extends NodeViewDesc {
  private renderer: NumberingRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new NumberingRenderer(this.node.id)
    this.renderer.create(group)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}


// ==================== TopicTitleNodeViewDesc ====================

export class TopicTitleNodeViewDesc extends NodeViewDesc {
  private renderer: TopicTitleRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new TopicTitleRenderer(this.node.id)
    this.renderer.create(group)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== InformationNodeViewDesc ====================

export class InformationNodeViewDesc extends NodeViewDesc {
  private renderer: InformationRenderer | null = null
  private _isHovering = false

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new InformationRenderer(this.node.id)
    this.renderer.create(group)
    this.setupEvents(group)
    return group
  }

  private setupEvents(group: Group): void {
    // 双击 - 阻止传播
    group.on_('doubletap', (e: any) => {
      e.stopPropagation?.()
    })

    // 右键菜单
    group.on_('righttap', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 长按菜单
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 鼠标进入 - 通知选区扩展
    group.on_('pointerenter', () => {
      if (this._isHovering) return
      this._isHovering = true
      NodeViewDesc._eventEmitter?.emit('selection:hoverEnter', this.node.id)
    })

    // 鼠标离开 - 通知选区扩展
    group.on_('pointerleave', () => {
      if (!this._isHovering) return
      this._isHovering = false
      NodeViewDesc._eventEmitter?.emit('selection:hoverLeave', this.node.id)
    })
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== LabelNodeViewDesc ====================

export class LabelNodeViewDesc extends NodeViewDesc {
  private renderer: LabelRenderer | null = null
  private _isHovering = false

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new LabelRenderer(this.node.id)
    this.renderer.create(group)
    this.setupEvents(group)
    return group
  }

  private setupEvents(group: Group): void {
    // 双击 - 阻止传播
    group.on_('doubletap', (e: any) => {
      e.stopPropagation?.()
    })

    // 右键菜单
    group.on_('righttap', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 长按菜单
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 鼠标进入 - 通知选区扩展
    group.on_('pointerenter', () => {
      if (this._isHovering) return
      this._isHovering = true
      NodeViewDesc._eventEmitter?.emit('selection:hoverEnter', this.node.id)
    })

    // 鼠标离开 - 通知选区扩展
    group.on_('pointerleave', () => {
      if (!this._isHovering) return
      this._isHovering = false
      NodeViewDesc._eventEmitter?.emit('selection:hoverLeave', this.node.id)
    })
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== PlaceholderTopicNodeViewDesc ====================

export class PlaceholderTopicNodeViewDesc extends NodeViewDesc {
  private renderer: PlaceholderTopicRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new PlaceholderTopicRenderer(this.node.id)
    this.renderer.create(group)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== ImageNodeViewDesc ====================

export class ImageNodeViewDesc extends NodeViewDesc {
  private renderer: ImageRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new ImageRenderer(this.node.id)
    this.renderer.create(group)
    this.setupEvents(group)
    return group
  }

  private setupEvents(group: Group): void {
    // 双击 → 阻止冒泡
    group.on_('doubletap', (e: any) => {
      e.stopPropagation?.()
    })

    // 右键菜单
    group.on_('righttap', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 长按菜单
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // hover → 通知 ResizeBoxExtension 显示/隐藏调整大小框
    group.on_('pointerenter', () => {
      NodeViewDesc._eventEmitter?.emit('selection:hoverEnter', { nodeId: this.node.id })
    })
    group.on_('pointerleave', () => {
      NodeViewDesc._eventEmitter?.emit('selection:hoverLeave', { nodeId: this.node.id })
    })
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== IndicatorNodeViewDesc ====================

export class IndicatorNodeViewDesc extends NodeViewDesc {
  private renderer: IndicatorRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new IndicatorRenderer(this.node.id)
    this.renderer.create(group)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== BoundaryTitleNodeViewDesc ====================

export class BoundaryTitleNodeViewDesc extends NodeViewDesc {
  private renderer: BoundaryTitleRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new BoundaryTitleRenderer(this.node.id)
    this.renderer.create(group)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== MathjaxNodeViewDesc ====================

export class MathjaxNodeViewDesc extends NodeViewDesc {
  private renderer: MathjaxRenderer | null = null
  private _isHovering = false

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new MathjaxRenderer(this.node.id)
    this.renderer.create(group)
    this.setupEvents(group)
    return group
  }

  private setupEvents(group: Group): void {
    // 双击 - 阻止传播
    group.on_('doubletap', (e: any) => {
      e.stopPropagation?.()
    })

    // 右键菜单
    group.on_('righttap', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 长按菜单
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 鼠标进入 - 通知选区扩展
    group.on_('pointerenter', () => {
      if (this._isHovering) return
      this._isHovering = true
      NodeViewDesc._eventEmitter?.emit('selection:hoverEnter', this.node.id)
    })

    // 鼠标离开 - 通知选区扩展
    group.on_('pointerleave', () => {
      if (!this._isHovering) return
      this._isHovering = false
      NodeViewDesc._eventEmitter?.emit('selection:hoverLeave', this.node.id)
    })
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== SelectBoxNodeViewDesc ====================

export class SelectBoxNodeViewDesc extends NodeViewDesc {
  private renderer: SelectBoxRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new SelectBoxRenderer(this.node.id)
    this.renderer.create(group)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== TopicSelectBoxNodeViewDesc ====================

export class TopicSelectBoxNodeViewDesc extends NodeViewDesc {
  private renderer: TopicSelectBoxRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new TopicSelectBoxRenderer(this.node.id)
    this.renderer.create(group)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== ResizeBoxNodeViewDesc ====================

export class ResizeBoxNodeViewDesc extends NodeViewDesc {
  private renderer: ResizeBoxRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new ResizeBoxRenderer(this.node.id)
    this.renderer.create(group)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== FishboneMainLineNodeViewDesc ====================

export class FishboneMainLineNodeViewDesc extends NodeViewDesc {
  private renderer: FishboneMainLineRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new FishboneMainLineRenderer(this.node.id)
    this.renderer.create(group)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== FishboneHeadLineNodeViewDesc ====================

export class FishboneHeadLineNodeViewDesc extends NodeViewDesc {
  private renderer: FishboneHeadLineRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new FishboneHeadLineRenderer(this.node.id)
    this.renderer.create(group)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== MatrixCellNodeViewDesc ====================

export class MatrixCellNodeViewDesc extends NodeViewDesc {
  private renderer: MatrixCellRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new MatrixCellRenderer(this.node.id)
    this.renderer.create(group)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== TreeTableCellNodeViewDesc ====================

export class TreeTableCellNodeViewDesc extends NodeViewDesc {
  private renderer: TreeTableCellRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new TreeTableCellRenderer(this.node.id)
    this.renderer.create(group)
    return group
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    this.updateStyle()
  }
}

// ==================== ConnectionNodeViewDesc ====================

export class ConnectionNodeViewDesc extends NodeViewDesc {
  private renderer: ConnectionRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new ConnectionRenderer()
    this.renderer.create(group)
    this.setupEvents(group)
    return group
  }

  private setupEvents(group: Group): void {
    group.on_('tap', (e: any) => {
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('selection:select', this.node.id)
    })
    group.on_('doubletap', (e: any) => {
      e.stopPropagation?.()
    })
    group.on_('righttap', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id, x: e.x, y: e.y,
      })
    })
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id, x: e.x, y: e.y,
      })
    })
  }

  protected createContentGroup(): null { return null }

  protected updateStyle(): void {
    if (!this.renderer || !NodeViewDesc.styleEngine || !NodeViewDesc.state) return
    const style = NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
    const layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void { this.updateStyle() }
}

// ==================== LegendNodeViewDesc ====================

export class LegendNodeViewDesc extends NodeViewDesc {
  protected createElement(): Group {
    const group = new Group()
    // LeaferJS 原生拖拽
    group.draggable = true
    this.setupEvents(group)
    return group
  }

  private setupEvents(group: Group): void {
    // 拖拽结束 → 保存图例位置
    group.on_('dragend', () => {
      NodeViewDesc._eventEmitter?.emit('legend:positionChanged', this.node.id, {
        x: group.x,
        y: group.y,
      })
    })
    group.on_('doubletap', (e: any) => {
      e.stopPropagation?.()
    })
    group.on_('righttap', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id, x: e.x, y: e.y,
      })
    })
  }

  protected createContentGroup(): null { return null }
  protected updateStyle(): void {}
  protected updateContent(): void {}
}

// ==================== MarkerNodeViewDesc ====================

export class MarkerNodeViewDesc extends NodeViewDesc {
  protected createElement(): Group {
    const group = new Group()
    this.setupEvents(group)
    return group
  }

  private setupEvents(group: Group): void {
    group.on_('doubletap', (e: any) => {
      e.stopPropagation?.()
    })
    group.on_('righttap', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id, x: e.x, y: e.y,
      })
    })
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      NodeViewDesc._eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id, x: e.x, y: e.y,
      })
    })
  }

  protected createContentGroup(): null { return null }
  protected updateStyle(): void {}
  protected updateContent(): void {}
}