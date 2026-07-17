/**
 * EventDelegator 使用示例
 *
 * 展示如何使用事件委托优化大量节点的事件处理
 */

import { Group } from 'leafer-ui'
import type { ViewEvent } from '../view-event'
import { EventDelegator } from '../event-delegator'

/**
 * 基础使用示例
 * 
 * 演示单个节点的事件委托
 */
export function basicExample() {
  // 创建根容器
  const root = new Group()
  
  // 创建事件委托器
  const delegator = new EventDelegator(root)
  
  // 创建子节点
  const topic1 = new Group({ id: 'topic-1' })
  const topic2 = new Group({ id: 'topic-2' })
  const topic3 = new Group({ id: 'topic-3' })
  
  root.add(topic1)
  root.add(topic2)
  root.add(topic3)
  
  // 注册委托事件
  delegator.delegate('click', 'topic-1', (event: ViewEvent) => {
    console.log('Topic 1 clicked at:', event.position)
  })
  
  delegator.delegate('click', 'topic-2', (event: ViewEvent) => {
    console.log('Topic 2 clicked at:', event.position)
  })
  
  delegator.delegate('dblclick', 'topic-3', () => {
    console.log('Topic 3 double-clicked')
  })
  
  // 清理
  delegator.destroy()
}

/**
 * 批量注册示例
 * 
 * 演示批量为多个节点注册相同的事件处理器
 */
export function batchExample() {
  const root = new Group()
  const delegator = new EventDelegator(root)
  
  // 创建多个节点
  const topicIds = ['topic-1', 'topic-2', 'topic-3', 'topic-4', 'topic-5']
  
  for (const id of topicIds) {
    root.add(new Group({ id }))
  }
  
  // 批量注册事件
  delegator.delegateMany(topicIds, {
    click: (event: ViewEvent) => {
      console.log(`Clicked: ${event.targetId}`)
    },
    pointerenter: (event: ViewEvent) => {
      console.log(`Hover enter: ${event.targetId}`)
    },
    pointerleave: (event: ViewEvent) => {
      console.log(`Hover leave: ${event.targetId}`)
    },
  })
  
  // 检查委托状态
  console.log('Total delegations:', delegator.delegationCount)
  console.log('Has click delegation:', delegator.hasDelegation('click'))
  
  // 清理
  delegator.destroy()
}

/**
 * 动态添加节点示例
 * 
 * 演示动态添加节点时自动获得事件处理
 */
export function dynamicNodesExample() {
  const root = new Group()
  const delegator = new EventDelegator(root)
  
  // 先注册委托
  delegator.delegate('click', 'dynamic-1', () => {
    console.log('Dynamic node 1 clicked')
  })
  
  // 后添加节点（自动获得事件处理）
  setTimeout(() => {
    const dynamicNode = new Group({ id: 'dynamic-1' })
    root.add(dynamicNode)
    console.log('Dynamic node added, it will receive click events')
  }, 1000)
  
  // 清理
  setTimeout(() => {
    delegator.destroy()
  }, 5000)
}

/**
 * 性能对比示例
 * 
 * 对比传统方式和委托方式的性能差异
 */
export function performanceComparison() {
  const nodeCount = 1000
  
  // === 传统方式：每个节点绑定事件 ===
  console.time('Traditional')
  {
    const root = new Group()
    const handlers: Array<() => void> = []
    
    for (let i = 0; i < nodeCount; i++) {
      const node = new Group({ id: `node-${i}` })
      const handler = () => console.log(`Node ${i} clicked`)
      node.on('tap', handler)
      handlers.push(handler)
      root.add(node)
    }
    
    // 清理
    for (let i = 0; i < nodeCount; i++) {
      const node = root.children[i] as Group
      node.off('tap', handlers[i])
    }
  }
  console.timeEnd('Traditional')
  
  // === 委托方式：统一在根节点监听 ===
  console.time('Delegation')
  {
    const root = new Group()
    const delegator = new EventDelegator(root)
    
    for (let i = 0; i < nodeCount; i++) {
      const nodeId = `node-${i}`
      delegator.delegate('click', nodeId, () => {
        console.log(`Node ${i} clicked`)
      })
    }
    
    // 清理
    delegator.destroy()
  }
  console.timeEnd('Delegation')
}

/**
 * 思维导图节点事件委托示例
 * 
 * 实际场景中如何使用事件委托
 */
export function mindmapExample() {
  const sheetRoot = new Group({ id: 'sheet-root' })
  const delegator = new EventDelegator(sheetRoot)
  
  // 模拟节点列表
  const nodeIds: string[] = []
  
  // 添加节点时注册委托
  function addTopic(id: string) {
    nodeIds.push(id)
    
    // 注册委托事件
    delegator.delegate('click', id, () => {
      console.log(`Select topic: ${id}`)
    })
    
    delegator.delegate('dblclick', id, () => {
      console.log(`Edit topic: ${id}`)
    })
    
    delegator.delegate('contextmenu', id, (event: ViewEvent) => {
      event.preventDefault()
      console.log(`Context menu for topic: ${id}`)
    })
    
    delegator.delegate('dragstart', id, () => {
      console.log(`Start dragging topic: ${id}`)
    })
  }
  
  // 删除节点时注销委托
  function removeTopic(id: string) {
    delegator.undelegateAll(id)
    const index = nodeIds.indexOf(id)
    if (index !== -1) {
      nodeIds.splice(index, 1)
    }
  }
  
  // 添加一些节点
  addTopic('root')
  addTopic('topic-1')
  addTopic('topic-2')
  addTopic('topic-1-1')
  
  // 删除节点
  removeTopic('topic-2')
  
  // 检查状态
  console.log('Active nodes:', nodeIds)
  console.log('Total delegations:', delegator.delegationCount)
  
  // 清理
  delegator.destroy()
}

/**
 * 混合使用示例
 * 
 * 演示如何将 EventDelegator 与 EventManager 结合使用
 */
export function hybridExample() {
  const root = new Group()
  const delegator = new EventDelegator(root)
  
  // 对于频繁交互的节点，使用 EventManager 直接绑定
  // （避免委托的查找开销）
  const importantNode = new Group({ id: 'important' })
  importantNode.on('pointermove', () => {
    // 高频事件直接绑定
  })
  
  // 对于大量普通节点，使用委托
  const nodeIds = Array.from({ length: 100 }, (_, i) => `node-${i}`)
  delegator.delegateMany(nodeIds, {
    click: (event: ViewEvent) => {
      console.log(`Clicked: ${event.targetId}`)
    },
    pointerenter: (event: ViewEvent) => {
      console.log(`Hover: ${event.targetId}`)
    },
  })
  
  // 清理
  delegator.destroy()
}
