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
} from '@tomind/schema'
import { isRelationshipNode, isBoundaryNode, isSummaryNode } from '@tomind/schema'
import type { StyleEngine, LeaferStyle, ResolvedStyle } from '@tomind/style'
import { classifyNode } from '@tomind/style'
import type { LayoutEngine, LayoutResult } from '@tomind/layout'
import { getAttr, getEffectiveStructureClass, getStructurePreset } from '@tomind/layout'
import { getShapeBox, getShapeHeight, withShapeHeight } from './shape-box'
import {
  computeConnectionGeometry,
  normalizeStructureClass,
  resolveChildStructureClass,
  resolveCalloutStructureClass,
  resolveDetachedStructureClass,
  type ConnBox,
  type ConnDirection,
  type ConnPoint,
  type ConnSideStyle,
} from './connection-geometry'
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

// ==================== ViewContext ====================

export interface ViewContext {
  styleEngine: StyleEngine | null
  layoutEngine: LayoutEngine | null
  state: SheetState | null
  eventEmitter: { emit: (event: string, ...args: unknown[]) => void } | null
  widgetViewFactory?: (widgetType: string, widgetId: string, node: NodeDesc) => ViewDesc | null
}

// ==================== 工具函数 ====================

/** 获取类型化的 LeaferStyle（消除 Record<string, unknown> 断言） */
export function getLeaferStyle(ctx: ViewContext, nodeId: string): LeaferStyle {
  if (!ctx.styleEngine || !ctx.state) return {}
  return ctx.styleEngine.getLeaferStyle(ctx.state, nodeId)
}

// ==================== NodeViewDesc ====================

export abstract class NodeViewDesc extends ViewDesc {
  /** 视图上下文（由 SheetEditor 注入） */
  protected readonly ctx: ViewContext

  constructor(node: NodeDesc, role: string, ctx: ViewContext) {
    super(node, role)
    this.ctx = ctx
  }

  // ==================== 样式计算 ====================

  protected getNodeStyle(): ResolvedStyle {
    if (this.ctx.styleEngine && this.ctx.state) {
      return this.ctx.styleEngine.computeStyle(this.ctx.state, this.node.id)
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

    // 确保 element/renderer 已创建，否则 updateStyle 会因 renderer=null 提前返回并丢失样式
    void this.element

    if (this.isDirty(DirtyFlag.STYLE)) this.updateStyle()
    if (this.isDirty(DirtyFlag.CONTENT)) this.updateContent()

    // 应用 Node Decoration
    if (this.ctx.state) {
      const nodeDecs = this.ctx.state.decorations.getNodeDecorations(this.node.id)
      this.applyNodeDecorations(nodeDecs)
      
      // 应用 Widget Decoration
      if (this.ctx.widgetViewFactory) {
        const widgetDecs = this.ctx.state.decorations.getWidgets(this.node.id)
        this.updateWidgets(widgetDecs, this.ctx.widgetViewFactory)
      }
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

/**
 * 生效结构类推导（对齐 SB utils/branch.getStructureClass）
 *
 * 连线的出线/入线方向、拐点、线型全部依赖**每个节点自己的生效结构类**，
 * 而 tomind 的 style 层只按角色（centralTopic/mainTopic/subTopic）查 skeleton，
 * 拿不到「map 左侧主分支及其子树 = logic.left」这种继承结果
 * （实测 demo：SB 有 6 个 logic.left 主分支 + 106 个 logic.left 子节点，TM 全给 logic.right）。
 * 这里从根开始按 SB 的 getChildStructure 规则推导一次并缓存。
 */
const structureMapCache = new WeakMap<object, { layout: LayoutResult; map: Map<string, string> }>()

const EMPTY_BOX: ConnBox = { x: 0, y: 0, width: 0, height: 0 }

export function getConnectionStructureMap(doc: NodeDesc, layout: LayoutResult): Map<string, string> {
  const cached = structureMapCache.get(doc)
  if (cached && cached.layout === layout) return cached.map

  const boxOf = (id: string): ConnBox => {
    const nl = layout.nodes.get(id)
    return nl ? getShapeBox(nl) : EMPTY_BOX
  }
  const map = new Map<string, string>()
  // SB: 中央分支 = presetStructure（自身 structure-class || skeleton['centralTopic']），
  // 否则 DEFAULT_STRUCTURE（org.xmind.ui.map）
  const rootStructure = normalizeStructureClass(getStructurePreset(doc, doc)) || 'map'

  const walk = (node: NodeDesc, structure: string): void => {
    map.set(node.id, structure)
    const box = boxOf(node.id)
    for (const slot of ['attached', 'callout', 'detached'] as const) {
      const list = node.children?.[slot] ?? []
      for (let i = 0; i < list.length; i++) {
        const child = list[i]
        // SB getViewStructure 的 presetStructure = 模型属性 || skeleton[className]（**精确取**，
        // 不退回 mainTopic）；取不到就交给 resolveChildStructureClass 走 getChildStructure
        const own = getStructurePreset(doc, child)
        const childBox = boxOf(child.id)
        // callout / detached 各有自己的规则（SB utils/branch.getStructureClass）：
        // callout 走父结构的 getCalloutStructure（map 系按 position.x<=0 判左、其余继承父侧），
        // detached 按自己的显式 structure-class 或 position.x<0
        const position = getAttr<{ x?: number; y?: number }>(child, 'position')
        const childStructure = slot === 'callout'
          ? resolveCalloutStructureClass(structure, box, childBox, position)
          : slot === 'detached'
            ? resolveDetachedStructureClass(own, box, childBox, position)
            : resolveChildStructureClass(structure, own, box, childBox, i)
        walk(child, childStructure)
      }
    }
  }
  walk(doc, rootStructure)

  structureMapCache.set(doc, { layout, map })
  return map
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
      this.ctx.eventEmitter?.emit('edit:start', {
        nodeId: this.node.id,
        node: this.node,
      })
    })
    
    // 鼠标进入 - 通知选区扩展
    group.on_('pointerenter', () => {
      if (this._isHovering) return
      this._isHovering = true
      this.ctx.eventEmitter?.emit('selection:hoverEnter', this.node.id)
    })
    
    // 鼠标离开 - 通知选区扩展
    group.on_('pointerleave', () => {
      if (!this._isHovering) return
      this._isHovering = false
      this.ctx.eventEmitter?.emit('selection:hoverLeave', this.node.id)
    })
    
    // 右键菜单
    group.on_('righttap', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })
    
    // 长按菜单
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      this.ctx.eventEmitter?.emit('contextmenu:show', {
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) {
      console.warn(`[updateStyle] SKIP ${this.node.type}#${this.node.id} — renderer=${!!this.renderer} styleEngine=${!!this.ctx.styleEngine} state=${!!this.ctx.state}`)
      return
    }
    
    // 获取 LeaferJS 格式样式
    const style = getLeaferStyle(this.ctx, this.node.id)
    
    // 读取缓存的布局结果（由 SheetEditor.updateState 统一 compute）
    let layout: LayoutResult
    if (this.ctx.layoutEngine) {
      layout = this.ctx.layoutEngine.getLayoutResult()
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
        const contentOffsetY = parentViewDesc!.contentGroup?.y ?? 40
        this.element.x = nodeLayout.x - parentLayout.x
        this.element.y = nodeLayout.y - parentLayout.y - contentOffsetY
      } else {
        // 根节点：绝对坐标
        this.element.x = nodeLayout.x
        this.element.y = nodeLayout.y
      }
    } else {
      console.warn(`[updateStyle] ${this.node.type}#${this.node.id} NO LAYOUT — nodeLayout=${!!nodeLayout} element=${!!this.element} layoutNodes=${layout.nodes.size}`)
    }

    // 形状与标题都按 shape 盒画（SB topicView.shapeBounds）：
    // 主题盒高含 labels，直接用 layout.height 会把带 labels 的主题画高 24px、标题下移 12px。
    // 只有带 labels 的节点才需要替换（避免每次渲染都复制整张 nodes Map）
    const shapedLayout = nodeLayout && getShapeHeight(nodeLayout) !== nodeLayout.height
      ? { ...layout, nodes: new Map(layout.nodes).set(this.node.id, withShapeHeight(nodeLayout)) }
      : layout
    this.renderer.render(shapedLayout, style, this.node.attrs)

    // 绘制父子连线
    this.renderConnections(layout)
  }

  /**
   * 渲染子节点连接线
   *
   * 锚点与 path 公式全部走 `connection-geometry`（snowbrush 精确移植版）：
   * - 出线点 = 父盒在 startDirection 上的关节点（map 结构再叠加 diver/order 偏移）
   * - 拐点   = 关节点沿方向外推 LINECOLPOS(13)；map 的 diver/order 与 bight 例外（= 出线点）
   * - 终点   = 子盒在 endDirection 上的关节点回退 1（END_OFFSET）
   * - 线型   = 父的 line-class（lineWidth 0 → 不画），org-chart up/down 走 vertical brush
   *
   * 坐标以父 element 原点（= 父布局盒左上角）为参考：几何公式对平移不变，
   * 所以直接把「子盒减去父盒左上角」喂进去即可，无需再平移 path。
   */
  private renderConnections(layout: LayoutResult): void {
    const group = this.element
    if (!group) return

    // 清除旧连线
    for (const p of this._connectionPaths) {
      p.destroy()
    }
    this._connectionPaths = []

    const myLayout = layout.nodes.get(this.node.id)
    if (!myLayout) return

    const attachedChildren = this.node.children['attached'] ?? []
    // SB abstractstructure.drawConnectLine：detached 子分支不是 callout → 走同一条
    // `drawAttachedConnectLine(parentBranch, childBranch)`（父结构的），
    // 所以「中央主题 → 自由主题」也画线，锚点/线型与 attached 完全同一套。
    // conn-parity 实测 test-detached：SB 243 条边 = 234 attached + 3 (root→detached) + 6 (detached→子)。
    const detachedChildren = this.node.children['detached'] ?? []
    if (attachedChildren.length === 0 && detachedChildren.length === 0) return

    const doc = this.ctx.state?.doc
    if (!doc) return

    const parentLeafer = getLeaferStyle(this.ctx, this.node.id)
    // 锚点基于 shape 盒（SB getJointPosition(topicView.shapeBounds, dir)），不是含 labels 的主题盒
    const parentShape = getShapeBox(myLayout)
    const parentBox: ConnBox = { x: 0, y: 0, width: parentShape.width, height: parentShape.height }
    const structureMap = getConnectionStructureMap(doc, layout)
    const parentStyle: ConnSideStyle = {
      structureClass: structureMap.get(this.node.id) ?? getEffectiveStructureClass(doc, this.node),
      shapeClass: parentLeafer.shapeClass,
      lineClass: parentLeafer.lineClass,
      // SB connectionview: setLineWidth(startBranchView.figure.lineWidth) = parseInt(父的 line-width)
      lineWidth: parentLeafer.lineStrokeWidth,
      // SB getLineEndSpacingPatchPoint：有箭头时线尾要回缩 lineWidth*4 + 16
      arrowEndClass: parentLeafer.arrowEndClass,
    }
    const parentIsCentral = classifyNode(doc, this.node.id) === 'centralTopic'
    // SB arrowSelector: endArrowClass 取父分支的 arrow-end-class（锥形线时强制 none）
    const arrowEndClass = parentLeafer.arrowEndClass

    // 兄弟盒与 childIndex 用同一套下标（只算有布局结果的 attached 子节点）
    const entries: Array<{ child: NodeDesc; index: number; box: ConnBox }> = []
    const pushEntry = (child: NodeDesc, index: number): void => {
      const nl = layout.nodes.get(child.id)
      if (!nl) return
      const cs = getShapeBox(nl)
      entries.push({
        child,
        index,
        box: { x: cs.x - myLayout.x, y: cs.y - myLayout.y, width: cs.width, height: cs.height },
      })
    }
    for (const child of attachedChildren) pushEntry(child, entries.length)
    // siblingBoxes 只含 attached：SB 的兄弟干线共享（horizon）与 order 线下标
    // （calcSinusStartYPoint 的 `attached.indexOf(child)`）都只看 attached 子节点
    const siblingBoxes = entries.map((e) => e.box)
    // detached 不在 attached 列表里 → SB 的 indexOf 给 -1（diver 线不用下标，order 线才用）
    for (const child of detachedChildren) pushEntry(child, -1)

    for (const entry of entries) {
      const childLeafer = getLeaferStyle(this.ctx, entry.child.id)
      const geo = computeConnectionGeometry({
        parentBox,
        childBox: entry.box,
        parentStyle,
        // SB roundedelbow: corner = parseInt(child.topicView.figure.lineCorner || 0)
        childStyle: { lineCorner: childLeafer.lineCornerRadius },
        siblingBoxes,
        childIndex: entry.index,
        parentIsCentral,
      })
      if (!geo.path) continue

      // 连线颜色取子节点解析后的 lineColor（含 multiLineColors 分支色），对齐 SB
      // connectionview.initNormalConnectionEventListener: setLineColor(parentBranchView.figure.lineColor)
      const strokeColor = childLeafer.lineColor || parentLeafer.lineColor || '#999999'
      const width = parentStyle.lineWidth ?? 1
      const strokeDash = parentLeafer.dashPattern ?? parentLeafer.strokeDash

      const pathElement = new Path({
        name: `connection:${entry.child.id}`,
        path: geo.path,
        stroke: strokeColor,
        strokeWidth: width,
        strokeLinecap: 'round',
        ...(Array.isArray(strokeDash) && strokeDash.length > 0 ? { dashPattern: strokeDash } : {}),
      })
      group.add(pathElement)
      this._connectionPaths.push(pathElement)

      if (arrowEndClass && arrowEndClass !== 'none') {
        const arrow = this.createArrow(geo.endPt, geo.endDirection, arrowEndClass, width, strokeColor)
        if (arrow) {
          group.add(arrow)
          this._connectionPaths.push(arrow)
        }
      }
    }
  }

  /**
   * 连线末端箭头（对齐 SB utils/linearrow.ts 的 marker 语义）
   *
   * SB 用 SVG marker（markerUnits 默认 = strokeWidth），TRIANGLE 的 endD = "M 0 0 L 4 2 L 0 4 Z"、
   * refX/refY = (0, 2) → 尖端在路径终点**前方 4 个单位**、半宽 2 个单位，
   * 1 单位 = lineWidth px（这也是布局侧 arrowSizeRatio = 4 的来源）。
   * 其余箭头形状（spearhead/dot/square/diamond/herringbone/doublearrow/ring/eye…）尚未实现。
   */
  private createArrow(
    endPt: { x: number; y: number },
    endDirection: ConnDirection,
    arrowClass: string,
    lineWidth: number,
    color: string,
  ): Path | null {
    const shape = arrowClass.replace(/^org\.xmind\.arrowShape\./, '')
    if (shape !== 'triangle') return null
    const unit = lineWidth
    const tipLen = 4 * unit
    const halfWidth = 2 * unit
    const dir: ConnPoint =
      endDirection === 'left' ? { x: -1, y: 0 }
        : endDirection === 'right' ? { x: 1, y: 0 }
          : endDirection === 'up' ? { x: 0, y: -1 }
            : { x: 0, y: 1 }
    const tip = { x: endPt.x + dir.x * tipLen, y: endPt.y + dir.y * tipLen }
    const perp = { x: -dir.y, y: dir.x }
    const b1 = { x: endPt.x + perp.x * halfWidth, y: endPt.y + perp.y * halfWidth }
    const b2 = { x: endPt.x - perp.x * halfWidth, y: endPt.y - perp.y * halfWidth }
    return new Path({
      path: `M ${tip.x} ${tip.y} L ${b1.x} ${b1.y} L ${b2.x} ${b2.y} Z`,
      fill: color,
    })
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
      this.ctx.eventEmitter?.emit('selection:select', this.node.id)
    })

    // 右键菜单
    group.on_('righttap', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 长按菜单
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      this.ctx.eventEmitter?.emit('contextmenu:show', {
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
    const layout = this.ctx.layoutEngine?.getLayoutResult?.() ?? { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    if (!this.renderer || !this.ctx.state) return
    if (!isRelationshipNode(this.node)) return
    const { sourceId, targetId, title, controlPoints } = this.node.attrs

    // 端点优先用布局结果（topic 的 position/size 不在 attrs 里）
    const layout = this.ctx.layoutEngine?.getLayoutResult?.()
    const source = layout?.nodes?.get(sourceId)
    const target = layout?.nodes?.get(targetId)
    if (!source || !target) return

    // 端点锚到形状外缘（对齐 snowbrush getEndAnchorPosition：取朝向对方的那条边中点）
    const anchorTo = (self: { x: number; y: number; width: number; height: number }, other: { x: number; y: number; width: number; height: number }) => {
      const scx = self.x + self.width / 2
      const scy = self.y + self.height / 2
      const ocx = other.x + other.width / 2
      const ocy = other.y + other.height / 2
      const dx = ocx - scx
      const dy = ocy - scy
      if (Math.abs(dx) >= Math.abs(dy)) {
        // 水平方向占优：锚到左右边
        return { x: dx >= 0 ? self.x + self.width : self.x, y: scy }
      }
      return { x: scx, y: dy >= 0 ? self.y + self.height : self.y }
    }
    const from = anchorTo(source, target)
    const to = anchorTo(target, source)

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
      this._savedStroke = typeof shape.stroke === 'string' ? shape.stroke : undefined
      this._savedStrokeWidth = typeof shape.strokeWidth === 'number' ? shape.strokeWidth : undefined
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
    const layout = this.ctx.layoutEngine?.getLayoutResult?.() ?? { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    if (!this.renderer || !this.ctx.state) return
    if (!isBoundaryNode(this.node)) return
    const { topicIds, title, rangeStart, rangeEnd } = this.node.attrs

    const layout = this.ctx.layoutEngine?.getLayoutResult?.()
    const positions: { x: number; y: number; width: number; height: number }[] = []

    if (layout && typeof rangeStart === 'number') {
      // 用 rangeStart/rangeEnd 覆盖的 attached 子节点范围
      const parentId = this._parent?.node.id
      const siblings = parentId
        ? (this._parent?.node.children.attached ?? [])
        : []
      const end = typeof rangeEnd === 'number' ? rangeEnd : siblings.length - 1
      for (let i = rangeStart; i <= end && i < siblings.length; i++) {
        const nl = layout.nodes.get(siblings[i].id)
        if (nl) positions.push({ x: nl.x, y: nl.y, width: nl.width, height: nl.height })
      }
    } else if (Array.isArray(topicIds) && topicIds.length > 0) {
      for (const topicId of topicIds) {
        const nl = layout?.nodes?.get(topicId)
        if (nl) positions.push({ x: nl.x, y: nl.y, width: nl.width, height: nl.height })
      }
    }

    if (positions.length === 0) return

    // 对齐 snowbrush BOUNDARYGAP = 10，标题区域额外增加 top padding
    const BOUNDARYGAP = 10
    const titleFontSize = 12
    const titleHeight = title ? Math.floor(titleFontSize * 1.34) : 0
    const paddingTop = BOUNDARYGAP + titleHeight
    const paddingBottom = BOUNDARYGAP
    const paddingLeft = BOUNDARYGAP
    const paddingRight = BOUNDARYGAP

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of positions) {
      minX = Math.min(minX, p.x)
      minY = Math.min(minY, p.y)
      maxX = Math.max(maxX, p.x + p.width)
      maxY = Math.max(maxY, p.y + p.height)
    }

    this.renderer.setBounds(
      { x: minX - paddingLeft, y: minY - paddingTop, width: maxX - minX + paddingLeft + paddingRight, height: maxY - minY + paddingTop + paddingBottom },
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
    if (!this.topicRenderer || !this.summaryRenderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
    const layout = this.ctx.layoutEngine?.getLayoutResult?.() ?? { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.topicRenderer.render(layout, style)
    this.summaryRenderer.render(layout, style)
  }

  protected updateContent(): void {
    if (!this.summaryRenderer || !this.ctx.state) return
    if (!isSummaryNode(this.node)) return

    // 优先用布局结果定位（summary 在 layoutSummaries 中已算好位置）
    const layout = this.ctx.layoutEngine?.getLayoutResult?.()
    const nl = layout?.nodes?.get(this.node.id)
    if (nl) {
      this.summaryRenderer.setBounds(
        { x: nl.x, y: nl.y, width: nl.width, height: nl.height },
        getTitleText(this.node.attrs),
      )
      this.updateStyle()
      return
    }

    // fallback：用 topicIds 推算范围
    const topicIds = this.node.attrs.topicIds
    if (!Array.isArray(topicIds) || topicIds.length === 0) return

    const positions: { x: number; y: number; height: number }[] = []
    for (const topicId of topicIds) {
      const topicNode = this.ctx.state.getNode(topicId)
      if (topicNode) {
        const pos = getAttr<{ x: number; y: number }>(topicNode, 'position')
        const size = getAttr<{ width: number; height: number }>(topicNode, 'size')
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
        this.ctx.eventEmitter?.emit('collapse:toggleAll', nodeId)
      } else {
        this.ctx.eventEmitter?.emit('collapse:toggle', nodeId)
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
      if (this.renderer && this.ctx.styleEngine && this.ctx.state) {
        // 获取父节点的 lineColor
        const parentId = this._parent?.node.id
        if (parentId) {
          const parentStyle = this.ctx.styleEngine.getLeaferStyle(this.ctx.state, parentId)
          const lineColor = parentStyle.lineColor
          if (lineColor) {
            const circleFill = this.renderer.getCircleFill()
            if (circleFill) {
              this._savedFill = typeof circleFill.fill === 'string' ? circleFill.fill : undefined
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
    const layout = this.ctx.layoutEngine?.getLayoutResult?.() ?? { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    this.renderer.render(layout, style)
  }

  protected updateContent(): void {
    if (!this.renderer || !this.ctx.layoutEngine) return
    this.updateStyle()

    const layout = this.ctx.layoutEngine.getLayoutResult()
    const nl = layout.nodes.get(this.node.id)
    if (!nl) return

    const kids = this.node.children.attached ?? []
    const collapsed = this.node.attrs.collapsed === true

    // 侧向：按首个子节点相对位置判断
    let side: 'right' | 'left' | 'down' | 'up' = 'right'
    const firstKid = kids[0]
    const kn = firstKid ? layout.nodes.get(firstKid.id) : undefined
    if (kn) {
      const dx = kn.x - nl.x
      const dy = kn.y - nl.y
      if (Math.abs(dx) >= Math.abs(dy)) {
        side = dx >= 0 ? 'right' : 'left'
      } else {
        side = dy >= 0 ? 'down' : 'up'
      }
    }

    // 后代计数（对齐 snowbrush BIGGEST_NUM）
    let count = 0
    const walk = (n: typeof this.node) => {
      for (const c of (n.children.attached ?? [])) {
        count++
        walk(c)
      }
    }
    walk(this.node)

    this.renderer.place({ x: nl.x, y: nl.y, width: nl.width, height: nl.height }, side, collapsed, count)
    // 无子节点且未折叠时不显示
    const group = this.renderer as { place: (...a: unknown[]) => void }
    void group
    if (kids.length === 0 && !collapsed) {
      // place() 已定位，再靠 visible 隐藏
      const el = this.element
      if (el) el.visible = kids.length > 0 || collapsed
    }
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 长按菜单
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 鼠标进入 - 通知选区扩展
    group.on_('pointerenter', () => {
      if (this._isHovering) return
      this._isHovering = true
      this.ctx.eventEmitter?.emit('selection:hoverEnter', this.node.id)
    })

    // 鼠标离开 - 通知选区扩展
    group.on_('pointerleave', () => {
      if (!this._isHovering) return
      this._isHovering = false
      this.ctx.eventEmitter?.emit('selection:hoverLeave', this.node.id)
    })
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 长按菜单
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 鼠标进入 - 通知选区扩展
    group.on_('pointerenter', () => {
      if (this._isHovering) return
      this._isHovering = true
      this.ctx.eventEmitter?.emit('selection:hoverEnter', this.node.id)
    })

    // 鼠标离开 - 通知选区扩展
    group.on_('pointerleave', () => {
      if (!this._isHovering) return
      this._isHovering = false
      this.ctx.eventEmitter?.emit('selection:hoverLeave', this.node.id)
    })
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 长按菜单
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // hover → 通知 ResizeBoxExtension 显示/隐藏调整大小框
    group.on_('pointerenter', () => {
      this.ctx.eventEmitter?.emit('selection:hoverEnter', { nodeId: this.node.id })
    })
    group.on_('pointerleave', () => {
      this.ctx.eventEmitter?.emit('selection:hoverLeave', { nodeId: this.node.id })
    })
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)

    // 从布局引擎获取 layout，查找父 topic 的 partBounds 来定位 image
    let layout: LayoutResult
    if (this.ctx.layoutEngine) {
      layout = this.ctx.layoutEngine.getLayoutResult()
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 长按菜单
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id,
        x: e.x,
        y: e.y,
      })
    })

    // 鼠标进入 - 通知选区扩展
    group.on_('pointerenter', () => {
      if (this._isHovering) return
      this._isHovering = true
      this.ctx.eventEmitter?.emit('selection:hoverEnter', this.node.id)
    })

    // 鼠标离开 - 通知选区扩展
    group.on_('pointerleave', () => {
      if (!this._isHovering) return
      this._isHovering = false
      this.ctx.eventEmitter?.emit('selection:hoverLeave', this.node.id)
    })
  }

  protected createContentGroup(): null {
    return null
  }

  protected updateStyle(): void {
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)
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
      this.ctx.eventEmitter?.emit('selection:select', this.node.id)
    })
    group.on_('doubletap', (e: any) => {
      e.stopPropagation?.()
    })
    group.on_('righttap', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id, x: e.x, y: e.y,
      })
    })
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id, x: e.x, y: e.y,
      })
    })
  }

  protected createContentGroup(): null { return null }

  protected updateStyle(): void {
    if (!this.renderer || !this.ctx.styleEngine || !this.ctx.state) return
    const style = getLeaferStyle(this.ctx, this.node.id)

    // 读取缓存的布局结果（由 SheetEditor.updateState 统一 compute）
    let layout: LayoutResult
    if (this.ctx.layoutEngine) {
      layout = this.ctx.layoutEngine.getLayoutResult()
    } else {
      layout = { nodes: new Map(), totalWidth: 0, totalHeight: 0 }
    }

    if (!isRelationshipNode(this.node)) return
    const { sourceId, targetId } = this.node.attrs
    const sourceLayout = layout.nodes.get(sourceId)
    const targetLayout = layout.nodes.get(targetId)
    if (sourceLayout && targetLayout) {
      const anchorTo = (self: { x: number; y: number; width: number; height: number }, other: { x: number; y: number; width: number; height: number }) => {
        const scx = self.x + self.width / 2
        const scy = self.y + self.height / 2
        const ocx = other.x + other.width / 2
        const ocy = other.y + other.height / 2
        const dx = ocx - scx
        const dy = ocy - scy
        if (Math.abs(dx) >= Math.abs(dy)) {
          return { x: dx >= 0 ? self.x + self.width : self.x, y: scy }
        }
        return { x: scx, y: dy >= 0 ? self.y + self.height : self.y }
      }
      const from = anchorTo(sourceLayout, targetLayout)
      const to = anchorTo(targetLayout, sourceLayout)
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
      this.ctx.eventEmitter?.emit('legend:positionChanged', this.node.id, {
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
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id, x: e.x, y: e.y,
      })
    })
  }

  protected createContentGroup(): null { return null }

  protected updateStyle(): void {
    if (!this.renderer) return

    // 可见性
    const visibility = getAttr<string>(this.node, 'visibility')
    this.renderer.setVisible(visibility !== 'hidden')

    // 位置
    const position = getAttr<{ x: number; y: number }>(this.node, 'position')
    if (position) {
      this.renderer.setPosition(position.x, position.y)
    }
  }

  protected updateContent(): void {
    if (!this.renderer || !this.ctx.state) return

    // 从 state 中收集所有 topic 的 markers
    const markerSet = new Map<string, string>()
    const topicIds = this.ctx.state.getTopicIds()
    for (const topicId of topicIds) {
      const nodeInfo = this.ctx.state.getNode(topicId)
      if (!nodeInfo) continue
      const markers = getAttr<string[]>(nodeInfo, 'markers')
      if (!markers) continue
      for (const markerId of markers) {
        if (!markerSet.has(markerId)) {
          markerSet.set(markerId, markerId)
        }
      }
    }

    // 用户自定义的 marker 描述（attrs.markers 为 Record<markerId, {name?: string}> 时）
    const userMarkerDescMap = getAttr<Record<string, { name?: string }>>(this.node, 'markers') ?? {}

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
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id, x: e.x, y: e.y,
      })
    })
    group.on_('longpress', (e: any) => {
      e.preventDefault?.()
      e.stopPropagation?.()
      this.ctx.eventEmitter?.emit('contextmenu:show', {
        nodeId: this.node.id, x: e.x, y: e.y,
      })
    })
  }

  protected createContentGroup(): null { return null }
  protected updateStyle(): void {}
  protected updateContent(): void {}
}