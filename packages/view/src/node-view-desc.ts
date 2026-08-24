/**
 * NodeViewDesc — 节点视图描述（对标 ProseMirror NodeViewDesc）
 *
 * 职责：
 * 1. 渲染节点（Topic/Relationship/Boundary/Summary）
 * 2. 管理 PartViewDesc（标题、图片、标记等）
 * 3. 处理样式和布局
 * 4. 应用 Node Decoration（样式装饰）
 */
import { Group, Line, Path } from 'leafer-ui'

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
import { LegendRenderer } from './renderers/legend-renderer'
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
  private _connectionPaths: Array<Line | Path> = []

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
      console.warn(`[updateStyle] SKIP ${this.node.type}#${this.node.id} — renderer=${!!this.renderer} styleEngine=${!!NodeViewDesc.styleEngine} state=${!!NodeViewDesc.state}`)
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
    
    // 布局坐标设到 element（节点根 Group），不是 renderer.group（内部渲染 Group）
    // renderer.group 保持 (0,0)，只负责 rect+text 的相对布局
    // 子节点在父节点的 contentGroup(y:40) 里，所以坐标需要减去父节点的绝对位置
    const nodeLayout = layout.nodes.get(this.node.id)
    if (nodeLayout && this.element) {
      const parentViewDesc = this._parent
      const parentLayout = parentViewDesc ? layout.nodes.get(parentViewDesc.node.id) : null
      if (parentLayout) {
        // 子节点：相对坐标（减去父节点绝对位置和 contentGroup y 偏移）
        const contentOffsetY = (this._parent as any)?._contentGroup?.y ?? 40
        this.element.x = nodeLayout.x - parentLayout.x
        this.element.y = nodeLayout.y - parentLayout.y - contentOffsetY
      } else {
        // 根节点：绝对坐标
        this.element.x = nodeLayout.x
        this.element.y = nodeLayout.y
      }
      console.log(`[updateStyle] ${this.node.type}#${this.node.id} layout=(${nodeLayout.x},${nodeLayout.y} ${nodeLayout.width}x${nodeLayout.height}) element=(${this.element.x},${this.element.y}) parent=${parentViewDesc?.node.id ?? 'none'} group=(${this.element.width ?? '?'},${this.element.height ?? '?'})`)
    } else {
      console.warn(`[updateStyle] ${this.node.type}#${this.node.id} NO LAYOUT — nodeLayout=${!!nodeLayout} element=${!!this.element} layoutNodes=${layout.nodes.size}`)
    }

    this.renderer.render(layout, style, this.node.attrs)

    // 绘制父子连线
    this.renderConnections(layout)
  }

  /**
   * 绘制从当前节点到每个子节点的连线
   * 使用 Line + points，样式从 StyleEngine 的 LeaferJS 映射读取
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
    if (children.length === 0) {
      console.log(`[renderConnections] ${this.node.type}#${this.node.id} — no attached children`)
      return
    }

    console.log(`[renderConnections] ${this.node.type}#${this.node.id} — ${children.length} children: [${children.map(c => c.id).join(',')}]`)

    const leaferStyle = NodeViewDesc.styleEngine && NodeViewDesc.state
      ? NodeViewDesc.styleEngine.getLeaferStyle(NodeViewDesc.state, this.node.id)
      : {}

    const color = (leaferStyle.lineColor as string) ?? '#999999'
    const multiLineColors = typeof leaferStyle.multiLineColors === 'string'
      ? leaferStyle.multiLineColors.split(/\s+/).filter(Boolean)
      : []
    const width = (leaferStyle.strokeWidth as number) ?? 1.5
    const cornerRadius = (leaferStyle.lineCornerRadius as number) ?? (leaferStyle.cornerRadius as number) ?? 0
    const strokeDash = leaferStyle.strokeDash as number[] | null | undefined
    const lineClass = (leaferStyle.lineClass as string) ?? 'elbow'
    const arrowEndClass = leaferStyle.arrowEndClass as string | undefined

    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const childLayout = layout.nodes.get(child.id)
      if (!childLayout) continue

      // 连线坐标相对于当前 element（element 已定位到 myLayout.x/y）
      const dx = myLayout.x
      const dy = myLayout.y
      const parentCX = myLayout.width / 2
      const parentCY = myLayout.height / 2
      // 子节点中心在父 element 坐标系下
      const childCX = childLayout.x - dx + childLayout.width / 2
      const childCY = childLayout.y - dy + childLayout.height / 2

      const isHorizontal = Math.abs(childCX - parentCX) > Math.abs(childCY - parentCY)
      let startX: number, startY: number, endX: number, endY: number

      if (isHorizontal) {
        if (childCX > parentCX) {
          startX = myLayout.width
          startY = parentCY
          endX = childLayout.x - dx
          endY = childCY
        } else {
          startX = 0
          startY = parentCY
          endX = childLayout.x - dx + childLayout.width
          endY = childCY
        }
      } else {
        if (childCY > parentCY) {
          startX = parentCX
          startY = myLayout.height
          endX = childCX
          endY = childLayout.y - dy
        } else {
          startX = parentCX
          startY = 0
          endX = childCX
          endY = childLayout.y - dy + childLayout.height
        }
      }

      let path: string
      if (lineClass === 'none') {
        path = ''
      } else if (lineClass === 'curve') {
        path = this.computeCurvePath(startX, startY, endX, endY, isHorizontal)
      } else if (lineClass === 'roundedElbow') {
        const r = cornerRadius > 0 ? cornerRadius : 8
        path = this.computeRoundedElbowPath(startX, startY, endX, endY, isHorizontal, r)
      } else if (lineClass === 'straight') {
        path = this.computeStraightPath(startX, startY, endX, endY, isHorizontal)
      } else if (lineClass === 'fold') {
        path = this.computeFoldPath(startX, startY, endX, endY, isHorizontal)
      } else if (lineClass === 'fold2') {
        path = this.computeFold2Path(startX, startY, endX, endY, isHorizontal)
      } else if (lineClass === 'roundedfold') {
        const r = cornerRadius > 0 ? cornerRadius : 8
        path = this.computeRoundedFoldPath(startX, startY, endX, endY, isHorizontal, r)
      } else if (lineClass === 'bight') {
        path = this.computeBightPath(startX, startY, endX, endY, isHorizontal)
      } else if (lineClass === 'horizontal') {
        path = this.computeHorizontalPath(startX, startY, endX, endY)
      } else if (lineClass === 'brace') {
        path = this.computeBracePath(startX, startY, endX, endY, isHorizontal)
      } else if (lineClass === 'brace2') {
        path = this.computeBrace2Path(startX, startY, endX, endY, isHorizontal)
      } else if (lineClass === 'brace3') {
        path = this.computeBrace3Path(startX, startY, endX, endY, isHorizontal)
      } else if (lineClass === 'brace4') {
        path = this.computeBrace4Path(startX, startY, endX, endY, isHorizontal, width)
      } else if (lineClass === 'brace5') {
        path = this.computeBrace5Path(startX, startY, endX, endY, isHorizontal, width)
      } else if (lineClass === 'calloutLine') {
        path = this.computeCalloutLinePath(startX, startY, endX, endY, isHorizontal)
      } else {
        // default: elbow (right-angle with midpoint)
        if (isHorizontal) {
          const midX = (startX + endX) / 2
          path = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`
        } else {
          const midY = (startY + endY) / 2
          path = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`
        }
      }

      const pathElement = new Path({
        path,
        stroke: multiLineColors.length > 0 ? multiLineColors[i % multiLineColors.length] : color,
        strokeWidth: width,
        strokeLinecap: 'round',
        ...(strokeDash ? { dashPattern: strokeDash } : {}),
      })
      group.add(pathElement)
      this._connectionPaths.push(pathElement)

      if (arrowEndClass === 'triangle') {
        const arrow = this.createArrow(endX, endY, isHorizontal, multiLineColors.length > 0 ? multiLineColors[i % multiLineColors.length] : color)
        group.add(arrow)
        this._connectionPaths.push(arrow)
      }
    }
  }

  private computeCurvePath(sx: number, sy: number, ex: number, ey: number, isHorizontal: boolean): string {
    if (isHorizontal) {
      const ctrlX = sx + (ex - sx) * 0.2
      return `M ${sx} ${sy} L ${ctrlX} ${sy} Q ${ctrlX} ${ey} ${ex} ${ey}`
    } else {
      const ctrlY = sy + (ey - sy) * 0.2
      return `M ${sx} ${sy} L ${sx} ${ctrlY} Q ${ex} ${ctrlY} ${ex} ${ey}`
    }
  }

  private computeRoundedElbowPath(sx: number, sy: number, ex: number, ey: number, isHorizontal: boolean, r: number): string {
    if (isHorizontal) {
      const midX = (sx + ex) / 2
      return `M ${sx} ${sy} L ${midX - r} ${sy} Q ${midX} ${sy} ${midX} ${sy + r} L ${midX} ${ey - r} Q ${midX} ${ey} ${midX + r} ${ey} L ${ex} ${ey}`
    } else {
      const midY = (sy + ey) / 2
      return `M ${sx} ${sy} L ${sx} ${midY - r} Q ${sx} ${midY} ${sx + r} ${midY} L ${ex - r} ${midY} Q ${ex} ${midY} ${ex} ${midY + r} L ${ex} ${ey}`
    }
  }

  private createArrow(x: number, y: number, isHorizontal: boolean, color: string): Path {
    const size = 8
    let path: string
    if (isHorizontal) {
      path = `M ${x} ${y} L ${x - size} ${y - size / 2} L ${x - size} ${y + size / 2} Z`
    } else {
      path = `M ${x} ${y} L ${x - size / 2} ${y - size} L ${x + size / 2} ${y - size} Z`
    }
    return new Path({ path, fill: color })
  }

  // ==================== Connection path computation methods ====================

  /**
   * 直线 — start → ctrl → end（三段折线，但 ctrl 在中点使前两段为一条直线）
   */
  private computeStraightPath(
    sx: number, sy: number, ex: number, ey: number, isHorizontal: boolean
  ): string {
    if (isHorizontal) {
      const midX = (sx + ex) / 2
      return `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ey} L ${ex} ${ey}`
    } else {
      const midY = (sy + ey) / 2
      return `M ${sx} ${sy} L ${sx} ${midY} L ${ex} ${midY} L ${ex} ${ey}`
    }
  }

  /**
   * 折线（fold / skewElbow）— ctrl 处走一段，flex 处拐向 end
   * ratio 控制 flex 在 ctrl→end 间的比例（snowbrush TREE_SE_RATIO=0.5）
   */
  private computeFoldPath(
    sx: number, sy: number, ex: number, ey: number, isHorizontal: boolean, ratio = 0.5
  ): string {
    if (isHorizontal) {
      const midX = (sx + ex) / 2
      const flexX = midX + (ex - midX) * ratio
      return `M ${sx} ${sy} L ${midX} ${sy} L ${flexX} ${ey} L ${ex} ${ey}`
    } else {
      const midY = (sy + ey) / 2
      const flexY = midY + (ey - midY) * ratio
      return `M ${sx} ${sy} L ${sx} ${midY} L ${ex} ${flexY} L ${ex} ${ey}`
    }
  }

  /**
   * 折线变体（fold2）— 与 fold 相同比例，统一使用默认 ratio
   */
  private computeFold2Path(
    sx: number, sy: number, ex: number, ey: number, isHorizontal: boolean
  ): string {
    return this.computeFoldPath(sx, sy, ex, ey, isHorizontal)
  }

  /**
   * 圆角折线（roundedfold / horn）— flex 处用 Q 圆角
   * cornerRadius 控制圆角半径
   */
  private computeRoundedFoldPath(
    sx: number, sy: number, ex: number, ey: number, isHorizontal: boolean, r: number
  ): string {
    if (isHorizontal) {
      const midX = (sx + ex) / 2
      const dx = Math.abs(ex - midX)
      const dy = Math.abs(ey - sy)
      const corner = Math.min(dx, dy) / 4
      const c = corner > 0 ? corner : Math.min(r, Math.abs(ey - sy) / 2)
      if (ey > sy) {
        const beforeY = sy + c
        const afterX = midX + c
        return `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${beforeY} Q ${midX} ${ey} ${afterX} ${ey} L ${ex} ${ey}`
      } else {
        const beforeY = sy - c
        const afterX = midX + c
        return `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${beforeY} Q ${midX} ${ey} ${afterX} ${ey} L ${ex} ${ey}`
      }
    } else {
      const midY = (sy + ey) / 2
      const dx = Math.abs(ex - sx)
      const dy = Math.abs(ey - midY)
      const corner = Math.min(dx, dy) / 4
      const c = corner > 0 ? corner : Math.min(r, Math.abs(ex - sx) / 2)
      if (ex > sx) {
        const beforeX = sx + c
        const afterY = midY + c
        return `M ${sx} ${sy} L ${sx} ${midY} L ${beforeX} ${midY} Q ${ex} ${midY} ${ex} ${afterY} L ${ex} ${ey}`
      } else {
        const beforeX = sx - c
        const afterY = midY + c
        return `M ${sx} ${sy} L ${sx} ${midY} L ${beforeX} ${midY} Q ${ex} ${midY} ${ex} ${afterY} L ${ex} ${ey}`
      }
    }
  }

  /**
   * 弯曲线（bight / sinus）— ctrl 处直走，然后 cubic bezier 拐向 end
   */
  private computeBightPath(
    sx: number, sy: number, ex: number, ey: number, isHorizontal: boolean
  ): string {
    if (isHorizontal) {
      const midX = (sx + ex) / 2
      const dx = ex - midX
      const flexX = (ex + midX) / 2
      return `M ${sx} ${sy} L ${midX} ${sy} C ${ex - dx / 4} ${sy} ${flexX} ${ey} ${ex} ${ey}`
    } else {
      const midY = (sy + ey) / 2
      const dy = ey - midY
      const flexY = (ey + midY) / 2
      return `M ${sx} ${sy} L ${sx} ${midY} C ${sx} ${ey - dy / 4} ${ex} ${flexY} ${ex} ${ey}`
    }
  }

  /**
   * 水平线 — 始终走水平直线
   */
  private computeHorizontalPath(
    sx: number, sy: number, ex: number, ey: number
  ): string {
    return `M ${sx} ${sy} L ${ex} ${ey}`
  }

  /**
   * 大括号线（brace）— 对称 S 曲线，Q 在水平中点转弯
   */
  private computeBracePath(
    sx: number, sy: number, ex: number, ey: number, isHorizontal: boolean
  ): string {
    if (isHorizontal) {
      const midX = (sx + ex) / 2
      return `M ${sx} ${sy} Q ${midX} ${sy} ${midX} ${(sy + ey) / 2} L ${midX} ${(sy + ey) / 2} Q ${midX} ${ey} ${ex} ${ey}`
    } else {
      const midY = (sy + ey) / 2
      return `M ${sx} ${sy} Q ${sx} ${midY} ${(sx + ex) / 2} ${midY} L ${(sx + ex) / 2} ${midY} Q ${ex} ${midY} ${ex} ${ey}`
    }
  }

  /**
   * brace2 — ctrl 处直走，然后直线拐到中点，再直走拐向 end
   */
  private computeBrace2Path(
    sx: number, sy: number, ex: number, ey: number, isHorizontal: boolean
  ): string {
    if (isHorizontal) {
      const midX = (sx + ex) / 2
      const dy = ey - sy
      const a = Math.abs(dy) * 0.3
      const ver = dy >= 0 ? 1 : -1
      return `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${sy + ver * a} L ${midX} ${ey - ver * a} L ${midX} ${ey} L ${ex} ${ey}`
    } else {
      const midY = (sy + ey) / 2
      const dx = ex - sx
      const a = Math.abs(dx) * 0.3
      const hor = dx >= 0 ? 1 : -1
      return `M ${sx} ${sy} L ${sx} ${midY} L ${sx + hor * a} ${midY} L ${ex - hor * a} ${midY} L ${ex} ${midY} L ${ex} ${ey}`
    }
  }

  /**
   * brace3 — ctrl 直走，带25°角的斜线到中点，竖直到 end
   */
  private computeBrace3Path(
    sx: number, sy: number, ex: number, ey: number, isHorizontal: boolean
  ): string {
    if (isHorizontal) {
      const midX = (sx + ex) / 2
      const dx = Math.abs(ex - sx)
      const ver = ey >= sy ? 1 : -1
      const angleDy = Math.tan(25 * Math.PI / 180) * dx / 2
      return `M ${sx} ${sy} L ${midX} ${sy + ver * angleDy} L ${midX} ${ey} L ${ex} ${ey}`
    } else {
      const midY = (sy + ey) / 2
      const dy = Math.abs(ey - sy)
      const hor = ex >= sx ? 1 : -1
      const angleDx = Math.tan(25 * Math.PI / 180) * dy / 2
      return `M ${sx} ${sy} L ${sx + hor * angleDx} ${midY} L ${ex} ${midY} L ${ex} ${ey}`
    }
  }

  /**
   * brace4 — ctrl 直走，竖直到 end 附近，带 Q 尾巴返回
   */
  private computeBrace4Path(
    sx: number, sy: number, ex: number, ey: number, isHorizontal: boolean, lineWidth: number
  ): string {
    if (isHorizontal) {
      const midX = (sx + ex) / 2
      const hw = lineWidth / 2
      const ver = ey >= sy ? 1 : -1
      return `M ${midX - hw} ${sy} L ${midX - hw} ${ey - ver * hw} L ${ex} ${ey - ver * hw} L ${ex} ${ey + ver * hw} L ${midX + hw} ${ey + ver * hw * 1.2} Q ${midX + hw * 2} ${ey * 0.6 + sy * 0.4} ${midX + hw * 2} ${sy}`
    } else {
      const midY = (sy + ey) / 2
      const hw = lineWidth / 2
      const hor = ex >= sx ? 1 : -1
      return `M ${sx} ${midY - hw} L ${ex - hor * hw} ${midY - hw} L ${ex - hor * hw} ${ey} L ${ex + hor * hw} ${ey} L ${ex + hor * hw * 1.2} ${midY + hw} Q ${ex * 0.6 + sx * 0.4} ${midY + hw * 2} ${sx} ${midY + hw * 2}`
    }
  }

  /**
   * brace5 — ctrl 直走，Q 圆角拐向 end，再 Q 圆角尾巴返回
   */
  private computeBrace5Path(
    sx: number, sy: number, ex: number, ey: number, isHorizontal: boolean, lineWidth: number
  ): string {
    if (isHorizontal) {
      const midX = (sx + ex) / 2
      const hw = lineWidth / 2
      const dy = Math.abs(ey - sy)
      const corner = Math.min(Math.abs(ex - sx), dy / 2) / 4
      return `M ${midX - hw} ${sy} L ${midX - hw} ${ey - corner} Q ${midX - hw} ${ey} ${ex} ${ey} Q ${midX + hw} ${ey} ${midX + hw} ${ey - corner} Q ${midX + hw + corner} ${ey * 0.6 + sy * 0.4} ${midX + hw + corner} ${sy}`
    } else {
      const midY = (sy + ey) / 2
      const hw = lineWidth / 2
      const dx = Math.abs(ex - sx)
      const corner = Math.min(dx, Math.abs(ey - sy) / 2) / 4
      return `M ${sx} ${midY - hw} L ${ex - corner} ${midY - hw} Q ${ex} ${midY - hw} ${ex} ${ey} Q ${ex} ${midY + hw} ${ex - corner} ${midY + hw} Q ${ex * 0.6 + sx * 0.4} ${midY + hw + corner} ${sx} ${midY + hw + corner}`
    }
  }

  /**
   * 气泡线（calloutLine）— ctrl 处直走，然后两段斜线到 end 左右偏移点
   */
  private computeCalloutLinePath(
    sx: number, sy: number, ex: number, ey: number, isHorizontal: boolean
  ): string {
    // calloutLine: V 形线，从子节点两侧偏移点出发，汇聚到父节点出口点
    // snowbrush: crossPtA → parentInsectPt → crossPtB
    const dx = ex - sx
    const dy = ey - sy
    const dist = Math.hypot(dx, dy)
    const offset = Math.max(dist * 0.06, 8)
    if (isHorizontal) {
      const ver = dy >= 0 ? 1 : -1
      return `M ${ex} ${ey - ver * offset} L ${sx} ${sy} L ${ex} ${ey + ver * offset}`
    } else {
      const hor = dx >= 0 ? 1 : -1
      return `M ${ex - hor * offset} ${ey} L ${sx} ${sy} L ${ex + hor * offset} ${ey}`
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
      this.renderer?.setHovered(true)
    })

    // pointerleave - 恢复
    group.on_('pointerleave', () => {
      if (!this._isHovering) return
      this._isHovering = false
      this.renderer?.setHovered(false)
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
    const shape = this.renderer.getShapePath()
    if (!shape) return

    if (visible) {
      // 高亮：蓝色边框 + 加粗
      this._savedStroke = shape.stroke as string
      this._savedStrokeWidth = shape.strokeWidth as number
      shape.stroke = '#2563eb'
      shape.strokeWidth = 2
    } else {
      // 恢复原始样式
      if (this._savedStroke !== undefined) shape.stroke = this._savedStroke
      if (this._savedStrokeWidth !== undefined) shape.strokeWidth = this._savedStrokeWidth
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
            const circleFill = this.renderer.getCircleFill()
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
        const circleFill = this.renderer.getCircleFill()
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

    // 从布局引擎获取 layout，查找父 topic 的 partBounds 来定位 image
    let layout: LayoutResult
    if (NodeViewDesc.layoutEngine) {
      layout = NodeViewDesc.layoutEngine.getLayoutResult()
    } else {
      layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    }

    // 查找父 topic 的 partBounds
    const parentViewDesc = this._parent
    const parentId = parentViewDesc?.node.id
    const parentLayout = parentId ? layout.nodes.get(parentId) : null
    const imageBounds = parentLayout?.partBounds?.get('image')

    if (imageBounds) {
      // 用 partBounds 构造一个虚拟的 LayoutResult 传给 renderer
      const virtualLayout: LayoutResult = {
        nodes: new Map([[this.node.id, {
          x: imageBounds.x,
          y: imageBounds.y,
          width: imageBounds.width,
          height: imageBounds.height,
          titleWidth: 0,
          titleHeight: 0,
          branchHeight: 0,
        }]]),
        totalWidth: imageBounds.x + imageBounds.width,
        totalHeight: imageBounds.y + imageBounds.height,
      }
      this.renderer.render(virtualLayout, style)
    } else {
      this.renderer.render(layout, style)
    }
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

    // 读取缓存的布局结果（由 SheetEditor.updateState 统一 compute）
    let layout: LayoutResult
    if (NodeViewDesc.layoutEngine) {
      layout = NodeViewDesc.layoutEngine.getLayoutResult()
    } else {
      layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    }

    const node = this.node as RelationshipNodeDesc
    const { sourceId, targetId } = node.attrs
    const sourceLayout = layout.nodes.get(sourceId)
    const targetLayout = layout.nodes.get(targetId)
    if (sourceLayout && targetLayout) {
      const from = {
        x: sourceLayout.x + sourceLayout.width / 2,
        y: sourceLayout.y + sourceLayout.height / 2,
      }
      const to = {
        x: targetLayout.x + targetLayout.width / 2,
        y: targetLayout.y + targetLayout.height / 2,
      }
      this.renderer.setEndpoints(from, to)
    }

    this.renderer.render(layout, style)
  }

  protected updateContent(): void { this.updateStyle() }
}

// ==================== LegendNodeViewDesc ====================

export class LegendNodeViewDesc extends NodeViewDesc {
  private renderer: LegendRenderer | null = null

  protected createElement(): Group {
    const group = new Group()
    this.renderer = new LegendRenderer()
    this.renderer.create(group)
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

  protected updateStyle(): void {
    if (!this.renderer) return

    // 可见性
    const visibility = this.node.attrs.visibility as string | undefined
    this.renderer.setVisible(visibility !== 'hidden')

    // 位置
    const position = this.node.attrs.position as { x: number; y: number } | undefined
    if (position) {
      this.renderer.setPosition(position.x, position.y)
    }
  }

  protected updateContent(): void {
    if (!this.renderer || !NodeViewDesc.state) return

    // 从 state 中收集所有 topic 的 markers
    const markerSet = new Map<string, string>()
    const topicIds = NodeViewDesc.state.getTopicIds()
    for (const topicId of topicIds) {
      const nodeInfo = NodeViewDesc.state.getNode(topicId)
      if (!nodeInfo) continue
      const markers = nodeInfo.attrs.markers as string[] | undefined
      if (!markers) continue
      for (const markerId of markers) {
        if (!markerSet.has(markerId)) {
          markerSet.set(markerId, markerId)
        }
      }
    }

    // 用户自定义的 marker 描述（attrs.markers 为 Record<markerId, {name?: string}> 时）
    const userMarkerDescMap = (this.node.attrs.markers ?? {}) as Record<string, { name?: string }>

    const markerItems = Array.from(markerSet.entries()).map(([id]) => ({
      id,
      name: userMarkerDescMap[id]?.name ?? id,
    }))

    this.renderer.updateMarkers(markerItems)
  }
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