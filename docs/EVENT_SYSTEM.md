# 事件系统架构

## 概述

事件系统为 Renderer 和 ViewDesc 提供统一的事件处理能力，支持常见的交互事件（点击、双击、拖拽等）。

## 核心组件

### 1. ViewEvent（事件对象）

定义在 `view-event.ts` 中，提供统一的事件接口：

```typescript
interface ViewEvent<T = unknown> {
  type: ViewEventType          // 事件类型
  targetId: string             // 目标节点 ID
  target: unknown              // 目标 ViewDesc
  nativeEvent: T               // 原始事件（LeaferJS 事件）
  position: { x: number; y: number }  // 鼠标位置
  ctrlKey: boolean             // Ctrl/Cmd 键
  shiftKey: boolean            // Shift 键
  altKey: boolean              // Alt 键
  preventDefault: () => void   // 阻止默认行为
  stopPropagation: () => void  // 阻止冒泡
}
```

### 2. EventManager（事件管理器）

定义在 `event-manager.ts` 中，负责：

- 管理 LeaferJS 事件绑定
- 将 LeaferJS 事件转换为 ViewEvent
- 支持事件委托（事件冒泡）

```typescript
class EventManager {
  constructor(targetId: string, target: unknown)
  
  on(type: ViewEventType, handler: ViewEventHandler, element: Group): void
  off(type: ViewEventType, handler: ViewEventHandler, element: Group): void
  clearEvents(): void
}
```

### 3. ViewDesc 事件支持

ViewDesc 基类已集成事件处理能力：

```typescript
class ViewDesc {
  on(type: ViewEventType, handler: ViewEventHandler): void
  off(type: ViewEventType, handler: ViewEventHandler): void
  emit(event: ViewEvent): void
  clearEvents(): void
  setEventEmitter(emitter: EventEmitter): void
}
```

### 4. Renderer 事件接口

Renderer 接口已扩展，支持事件处理：

```typescript
interface Renderer {
  // ... 原有方法
  
  // 事件处理（可选）
  on?(type: ViewEventType, handler: ViewEventHandler, element?: Group): void
  off?(type: ViewEventType, handler: ViewEventHandler, element?: Group): void
  clearEvents?(): void
}
```

## 支持的事件类型

| 事件类型 | 说明 | LeaferJS 映射 |
|----------|------|---------------|
| `click` | 点击 | `tap` |
| `dblclick` | 双击 | `doubletap` |
| `contextmenu` | 右键菜单 | `righttap` |
| `pointerdown` | 鼠标按下 | `pointerdown` |
| `pointerup` | 鼠标抬起 | `pointerup` |
| `pointermove` | 鼠标移动 | `pointermove` |
| `pointerenter` | 鼠标进入 | `pointerenter` |
| `pointerleave` | 鼠标离开 | `pointerleave` |
| `pointerover` | 鼠标悬停 | `pointerover` |
| `pointerout` | 鼠标移出 | `pointerout` |

## 使用示例

### 1. 在 Renderer 中使用事件

```typescript
import { EventManager } from '../event-manager'
import type { ViewEventType, ViewEventHandler } from '../view-event'

class MyRenderer implements Renderer {
  private eventManager: EventManager | null = null
  
  create(parent: Group): void {
    // 创建元素...
    
    // 创建事件管理器
    this.eventManager = new EventManager(this.nodeId, this)
    
    // 注册事件
    this.setupEvents()
  }
  
  on(type: ViewEventType, handler: ViewEventHandler, element?: Group): void {
    if (!this.eventManager) return
    const target = element ?? this.group!
    this.eventManager.on(type, handler, target)
  }
  
  off(type: ViewEventType, handler: ViewEventHandler, element?: Group): void {
    if (!this.eventManager) return
    const target = element ?? this.group!
    this.eventManager.off(type, handler, target)
  }
  
  clearEvents(): void {
    if (this.eventManager) {
      this.eventManager.clearEvents()
    }
  }
  
  private setupEvents(): void {
    // 点击事件
    this.on('click', (event) => {
      console.log('Clicked:', event.targetId)
    })
    
    // 悬停事件
    this.on('pointerenter', (event) => {
      console.log('Mouse enter:', event.targetId)
    })
  }
  
  destroy(): void {
    this.clearEvents()
    // 销毁元素...
  }
}
```

### 2. 在 ViewDesc 中使用事件

```typescript
class MyNodeViewDesc extends NodeViewDesc {
  protected createElement(): Group {
    const group = new Group()
    
    // 注册事件
    this.on('click', (event) => {
      console.log('Node clicked:', event.targetId)
    })
    
    return group
  }
}
```

### 3. 外部监听事件

```typescript
const editor = new SheetEditor(options)

// 获取 ViewDesc
const viewDesc = editor.docView?.findById('topic-1')

// 注册事件
viewDesc?.on('click', (event) => {
  console.log('Topic clicked:', event.targetId)
  console.log('Position:', event.position)
  
  // 检查修饰键
  if (event.ctrlKey) {
    console.log('Ctrl + Click')
  }
})
```

## 事件冒泡

事件会自动从子节点冒泡到父节点：

```
Root ViewDesc
  └── Topic ViewDesc
        └── Child Topic ViewDesc (点击)
              ↓
        Topic ViewDesc (冒泡)
              ↓
        Root ViewDesc (冒泡)
```

可以通过 `event.stopPropagation()` 阻止冒泡。

## 最佳实践

1. **在 Renderer 中注册事件**：使用 `EventManager` 管理事件绑定
2. **在 ViewDesc 中监听事件**：使用 `on/off` 方法
3. **及时清理事件**：在 `destroy()` 方法中调用 `clearEvents()`
4. **使用事件冒泡**：利用冒泡机制减少事件监听器数量
5. **检查修饰键**：使用 `event.ctrlKey`、`event.shiftKey` 等检查修饰键

## 下一步

- 添加拖拽事件支持
- 添加键盘事件支持
- 添加手势事件支持（双指缩放等）
- 优化事件性能（事件委托、批量处理）
