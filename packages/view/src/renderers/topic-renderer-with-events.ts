/**
 * 事件系统使用示例
 *
 * 展示如何在 Renderer 和 NodeViewDesc 中使用事件系统
 * 包括：指针事件、拖拽事件、键盘事件
 */

import { Group } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'
import { getTitleText } from '@tomind/schema'
import type { 
  ViewEventType, 
  ViewEventHandler, 
  ViewEvent,
  DragEventType,
  KeyboardEventType,
  GestureEventType
} from '../view-event'
import { EventManager } from '../event-manager'
import { KeyboardEventManager } from '../keyboard-event-manager'

/**
 * 带完整事件支持的 TopicRenderer 示例
 */
export class TopicRendererWithEvents implements Renderer {
  private group: Group | null = null
  private rect: Group | null = null
  private text: Group | null = null
  private nodeId: string
  private eventManager: EventManager | null = null
  private keyboardManager: KeyboardEventManager | null = null

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  create(parent: Group): void {
    this.group = new Group()
    this.rect = new Group()
    this.text = new Group()

    this.group.add(this.rect)
    this.group.add(this.text)
    parent.add(this.group)

    // 创建事件管理器
    this.eventManager = new EventManager(this.nodeId, this)
    this.keyboardManager = new KeyboardEventManager(this.nodeId)

    // 注册默认事件处理器
    this.setupDefaultEvents()
  }

  render(layout: LayoutResult, style: Record<string, unknown>, nodeAttrs?: Record<string, unknown>): void {
    if (!this.group || !this.rect || !this.text) return
    const nodeLayout = layout.nodes.get(this.nodeId)
    if (!nodeLayout) return

    // 坐标由 TopicNodeViewDesc.updateStyle() 设到 element 上
    this.rect.set({
      width: nodeLayout.width,
      height: nodeLayout.height,
      fill: style.fill as string,
      stroke: style.stroke as string,
      cornerRadius: style.cornerRadius as number,
    })
    this.text.set({
      text: getTitleText(nodeAttrs ?? style),
      fill: style.fontColor as string,
    })
  }

  destroy(): void {
    if (this.eventManager) {
      this.eventManager.clearEvents()
    }
    if (this.keyboardManager) {
      this.keyboardManager.destroy()
    }
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
    this.rect = null
    this.text = null
  }

  /**
   * 绑定键盘事件到 canvas 容器
   */
  bindKeyboard(canvasElement: HTMLElement): void {
    this.keyboardManager?.bind(canvasElement)
  }

  /**
   * 注册指针/拖拽事件
   */
  on(type: ViewEventType, handler: ViewEventHandler, element?: Group): void {
    if (!this.eventManager || !this.group) return

    const targetElement = element ?? this.group
    this.eventManager.on(type, handler, targetElement)
  }

  /**
   * 注销指针/拖拽事件
   */
  off(type: ViewEventType, handler: ViewEventHandler, element?: Group): void {
    if (!this.eventManager || !this.group) return

    const targetElement = element ?? this.group
    this.eventManager.off(type, handler, targetElement)
  }

  /**
   * 注册键盘事件
   */
  onKeyboard(type: KeyboardEventType, handler: ViewEventHandler): void {
    this.keyboardManager?.on(type, handler)
  }

  /**
   * 注册快捷键
   */
  registerKeyBinding(
    binding: { code?: string; key?: string; ctrl?: boolean; shift?: boolean; alt?: boolean },
    handler: (event: ViewEvent) => void
  ): string | undefined {
    return this.keyboardManager?.registerBinding(binding, handler)
  }

  /**
   * 清除所有事件处理器
   */
  clearEvents(): void {
    this.eventManager?.clearEvents()
  }

  /**
   * 设置默认事件处理器
   */
  private setupDefaultEvents(): void {
    if (!this.group) return

    // === 指针事件 ===
    
    // 点击事件
    this.on('click', (event) => {
      console.log(`Topic ${this.nodeId} clicked`, event)
      // 可以在这里触发选中、展开等操作
    })

    // 双击事件
    this.on('dblclick', (event) => {
      console.log(`Topic ${this.nodeId} double-clicked`, event)
      // 可以在这里触发编辑模式
    })

    // 右键菜单
    this.on('contextmenu', (event) => {
      console.log(`Topic ${this.nodeId} context menu`, event)
      event.preventDefault()
      // 可以在这里显示右键菜单
    })

    // 鼠标悬停
    this.on('pointerenter', (event) => {
      console.log(`Topic ${this.nodeId} mouse enter`, event)
      // 可以在这里显示高亮效果
    })

    this.on('pointerleave', (event) => {
      console.log(`Topic ${this.nodeId} mouse leave`, event)
      // 可以在这里移除高亮效果
    })

    // === 拖拽事件 ===
    
    // 拖拽开始
    this.on('dragstart' as DragEventType, (event) => {
      console.log(`Topic ${this.nodeId} drag start`, {
        position: event.position,
        drag: event.drag,
      })
      // 可以在这里记录拖拽起始状态
    })

    // 拖拽中
    this.on('drag' as DragEventType, (event) => {
      console.log(`Topic ${this.nodeId} dragging`, {
        delta: event.drag?.delta,
      })
      // 可以在这里更新拖拽视觉效果
    })

    // 拖拽结束
    this.on('dragend' as DragEventType, (event) => {
      console.log(`Topic ${this.nodeId} drag end`, {
        position: event.position,
      })
      // 可以在这里处理拖拽结果
    })

    // 拖拽进入目标
    this.on('dragenter' as DragEventType, (event) => {
      console.log(`Topic ${this.nodeId} drag enter`, event)
      // 可以在这里显示放置区域高亮
    })

    // 拖拽离开目标
    this.on('dragleave' as DragEventType, (event) => {
      console.log(`Topic ${this.nodeId} drag leave`, event)
      // 可以在这里移除放置区域高亮
    })

    // 拖拽悬停在目标上
    this.on('dragover' as DragEventType, (event) => {
      console.log(`Topic ${this.nodeId} drag over`, event)
      // 可以在这里显示放置位置提示
    })

    // 放置
    this.on('drop' as DragEventType, (event) => {
      console.log(`Topic ${this.nodeId} drop`, {
        data: event.drag?.data,
        dropTargetId: event.drag?.dropTargetId,
      })
      // 可以在这里处理放置逻辑
    })

    // === 手势事件 ===
    
    // 双指缩放开始
    this.on('pinchstart' as GestureEventType, (event) => {
      console.log(`Topic ${this.nodeId} pinch start`, {
        center: event.gesture?.center,
      })
      // 可以在这里记录缩放起始状态
    })

    // 双指缩放中
    this.on('pinch' as GestureEventType, (event) => {
      console.log(`Topic ${this.nodeId} pinching`, {
        scale: event.gesture?.scale,
        totalScale: event.gesture?.totalScale,
      })
      // 可以在这里更新缩放效果
    })

    // 双指缩放结束
    this.on('pinchend' as GestureEventType, (event) => {
      console.log(`Topic ${this.nodeId} pinch end`, {
        totalScale: event.gesture?.totalScale,
      })
      // 可以在这里处理缩放结果
    })

    // 旋转开始
    this.on('rotatestart' as GestureEventType, (event) => {
      console.log(`Topic ${this.nodeId} rotate start`, {
        center: event.gesture?.center,
      })
      // 可以在这里记录旋转起始状态
    })

    // 旋转中
    this.on('rotate' as GestureEventType, (event) => {
      console.log(`Topic ${this.nodeId} rotating`, {
        rotation: event.gesture?.rotation,
        totalRotation: event.gesture?.totalRotation,
      })
      // 可以在这里更新旋转效果
    })

    // 旋转结束
    this.on('rotateend' as GestureEventType, (event) => {
      console.log(`Topic ${this.nodeId} rotate end`, {
        totalRotation: event.gesture?.totalRotation,
      })
      // 可以在这里处理旋转结果
    })
  }
}

/**
 * 使用示例
 */
export function example() {
  // 创建 Renderer
  const renderer = new TopicRendererWithEvents('topic-1')

  // 创建父容器
  const parent = new Group()

  // 创建 Renderer
  renderer.create(parent)

  // 注册自定义指针事件
  renderer.on('click', (event: ViewEvent) => {
    console.log('Custom click handler:', event.targetId)
    console.log('Position:', event.position)
    console.log('Ctrl key:', event.ctrlKey)
  })

  // 注册键盘事件
  renderer.onKeyboard('keydown', (event: ViewEvent) => {
    if (event.keyboard?.key === 'Escape') {
      console.log('ESC pressed')
    }
  })

  // 注册快捷键
  renderer.registerKeyBinding(
    { code: 'KeyZ', ctrl: true },
    () => {
      console.log('Ctrl+Z pressed - Undo')
    }
  )

  renderer.registerKeyBinding(
    { code: 'KeyS', ctrl: true },
    () => {
      console.log('Ctrl+S pressed - Save')
    }
  )

  // 绑定键盘事件到 canvas 容器（需要实际的 canvas 元素）
  // renderer.bindKeyboard(canvasElement)

  // 模拟布局和样式
  const layout = {
    nodes: new Map([
      ['topic-1', { x: 100, y: 100, width: 150, height: 60, titleWidth: 100, titleHeight: 20, branchHeight: 60 }],
    ]),
    totalWidth: 400,
    totalHeight: 300,
  }

  const style = {
    fill: '#4A90D9',
    stroke: '#2C3E50',
    cornerRadius: 8,
    title: 'Test Topic',
    fontColor: '#FFFFFF',
  }

  // 渲染
  renderer.render(layout, style)

  // 清理
  renderer.clearEvents()
  renderer.destroy()
}

/**
 * 拖拽排序示例
 */
export function dragDropExample() {
  const items = ['item-1', 'item-2', 'item-3']
  const renderers = items.map(id => {
    const renderer = new TopicRendererWithEvents(id)
    const parent = new Group()
    renderer.create(parent)
    return renderer
  })

  // 设置拖拽
  let dragSource: string | null = null

  renderers.forEach(renderer => {
    renderer.on('dragstart' as DragEventType, (event) => {
      dragSource = event.targetId
      console.log('Drag started:', dragSource)
    })

    renderer.on('dragenter' as DragEventType, (event) => {
      if (dragSource && dragSource !== event.targetId) {
        console.log(`Can drop ${dragSource} on ${event.targetId}`)
      }
    })

    renderer.on('drop' as DragEventType, (event) => {
      if (dragSource && dragSource !== event.targetId) {
        console.log(`Dropped ${dragSource} on ${event.targetId}`)
        // 这里处理排序逻辑
      }
      dragSource = null
    })

    renderer.on('dragend' as DragEventType, () => {
      dragSource = null
    })
  })

  // 清理
  renderers.forEach(r => {
    r.clearEvents()
    r.destroy()
  })
}

/**
 * 键盘导航示例
 */
export function keyboardNavigationExample() {
  const renderer = new TopicRendererWithEvents('root')
  const parent = new Group()
  renderer.create(parent)

  // 上下左右导航
  renderer.registerKeyBinding({ code: 'ArrowUp' }, () => {
    console.log('Navigate up')
    // 移动选中到上方节点
  })

  renderer.registerKeyBinding({ code: 'ArrowDown' }, () => {
    console.log('Navigate down')
    // 移动选中到下方节点
  })

  renderer.registerKeyBinding({ code: 'ArrowLeft' }, () => {
    console.log('Navigate left')
    // 移动选中到父节点
  })

  renderer.registerKeyBinding({ code: 'ArrowRight' }, () => {
    console.log('Navigate right')
    // 移动选中到子节点
  })

  // Enter 键展开/折叠
  renderer.registerKeyBinding({ code: 'Enter' }, () => {
    console.log('Toggle expand/collapse')
  })

  // Delete 键删除选中
  renderer.registerKeyBinding({ code: 'Delete' }, () => {
    console.log('Delete selected node')
  })

  // F2 键重命名
  renderer.registerKeyBinding({ code: 'F2' }, () => {
    console.log('Rename selected node')
  })

  // Tab 键创建子节点
  renderer.registerKeyBinding({ code: 'Tab' }, () => {
    console.log('Create child node')
  })

  // Shift+Tab 创建同级节点
  renderer.registerKeyBinding({ code: 'Tab', shift: true }, () => {
    console.log('Create sibling node')
  })

  // 清理
  renderer.clearEvents()
  renderer.destroy()
}

/**
 * 手势交互示例
 */
export function gestureExample() {
  const renderer = new TopicRendererWithEvents('canvas-root')
  const parent = new Group()
  renderer.create(parent)

  // 缩放状态
  let currentScale = 1
  let currentRotation = 0

  // 监听缩放手势
  renderer.on('pinchstart' as GestureEventType, (event) => {
    console.log('Pinch started at:', event.gesture?.center)
  })

  renderer.on('pinch' as GestureEventType, (event) => {
    const scaleDelta = event.gesture?.scale ?? 1
    currentScale *= scaleDelta
    console.log('Current scale:', currentScale)
    // 应用缩放到画布
  })

  renderer.on('pinchend' as GestureEventType, () => {
    console.log('Pinch ended, final scale:', currentScale)
  })

  // 监听旋转手势
  renderer.on('rotatestart' as GestureEventType, (event) => {
    console.log('Rotate started at:', event.gesture?.center)
  })

  renderer.on('rotate' as GestureEventType, (event) => {
    const rotationDelta = event.gesture?.rotation ?? 0
    currentRotation += rotationDelta
    console.log('Current rotation:', currentRotation)
    // 应用旋转到画布
  })

  renderer.on('rotateend' as GestureEventType, () => {
    console.log('Rotate ended, final rotation:', currentRotation)
  })

  // 清理
  renderer.clearEvents()
  renderer.destroy()
}
