/**
 * LegendExtension — 图例扩展
 *
 * DOM 层插件，显示当前 sheet 使用的所有 marker 描述。
 * 对齐 snowbrush LegendView，使用 onDOMMount 生命周期。
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'

// ==================== DOM 创建 ====================

function createLegendPanel(): HTMLElement {
  const panel = document.createElement('div')
  panel.className = 'tomind-legend'
  panel.style.cssText = `
    position: absolute;
    bottom: 20px;
    right: 20px;
    min-width: 160px;
    max-width: 280px;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12px;
    color: #333;
    user-select: none;
    z-index: 100;
    overflow: hidden;
  `
  return panel
}

function createLegendHeader(): HTMLElement {
  const header = document.createElement('div')
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
    cursor: grab;
    background: #fafafa;
  `
  header.innerHTML = '<span style="font-weight: 500; font-size: 12px;">Legend</span>'
  return header
}

function createMarkerList(): HTMLElement {
  const list = document.createElement('div')
  list.className = 'tomind-legend-markers'
  list.style.cssText = `
    padding: 8px 12px;
    max-height: 300px;
    overflow-y: auto;
  `
  return list
}

function createMarkerItem(marker: { name: string; color?: string }): HTMLElement {
  const item = document.createElement('div')
  item.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    line-height: 1.4;
  `
  const dot = document.createElement('span')
  dot.style.cssText = `
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${marker.color || '#ff6b6b'};
    flex-shrink: 0;
  `
  const label = document.createElement('span')
  label.textContent = marker.name
  item.appendChild(dot)
  item.appendChild(label)
  return item
}

// ==================== 拖拽 ====================

function makeDraggable(panel: HTMLElement, handle: HTMLElement): void {
  let isDragging = false
  let startX = 0
  let startY = 0
  let startLeft = 0
  let startTop = 0

  handle.addEventListener('mousedown', (e) => {
    isDragging = true
    startX = e.clientX
    startY = e.clientY
    const rect = panel.getBoundingClientRect()
    const parent = panel.parentElement?.getBoundingClientRect()
    if (parent) {
      startLeft = rect.left - parent.left
      startTop = rect.top - parent.top
    }
    handle.style.cursor = 'grabbing'
    e.preventDefault()
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    panel.style.left = `${startLeft + dx}px`
    panel.style.top = `${startTop + dy}px`
    panel.style.right = 'auto'
    panel.style.bottom = 'auto'
  })

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false
      handle.style.cursor = 'grab'
    }
  })
}

// ==================== 数据收集 ====================

function collectMarkers(state: { doc?: { children?: Record<string, readonly { attrs?: Record<string, unknown> }[]> } } | null): Map<string, { name: string; color?: string }> {
  const markers = new Map<string, { name: string; color?: string }>()
  if (!state?.doc) return markers

  function walk(node: { attrs?: Record<string, unknown>; children?: Record<string, readonly { attrs?: Record<string, unknown> }[]> }) {
    const nodeMarkers = node.attrs?.markers as { id: string; name?: string; color?: string }[] | undefined
    if (Array.isArray(nodeMarkers)) {
      for (const m of nodeMarkers) {
        if (m.id && !markers.has(m.id)) {
          markers.set(m.id, { name: m.name || m.id, color: m.color })
        }
      }
    }
    if (node.children) {
      for (const childArr of Object.values(node.children)) {
        if (Array.isArray(childArr)) {
          for (const child of childArr) {
            walk(child)
          }
        }
      }
    }
  }

  walk(state.doc)
  return markers
}

// ==================== Extension ====================

export const LegendExtension = createExtension({
  name: 'legend',
  type: 'extension',
  defaultOptions: { enabled: true },

  onDOMMount(ctx: ExtensionContext) {
    const panel = createLegendPanel()
    const header = createLegendHeader()
    const markerList = createMarkerList()

    panel.appendChild(header)
    panel.appendChild(markerList)

    // 拖拽
    makeDraggable(panel, header)

    // 渲染 marker 列表
    function render() {
      const state = ctx.getState() as { doc?: unknown } | null
      const markers = collectMarkers(state as Parameters<typeof collectMarkers>[0])
      markerList.innerHTML = ''
      if (markers.size === 0) {
        const empty = document.createElement('div')
        empty.style.cssText = 'color: #999; font-size: 11px; padding: 4px 0;'
        empty.textContent = 'No markers'
        markerList.appendChild(empty)
      } else {
        for (const [, marker] of markers) {
          markerList.appendChild(createMarkerItem(marker))
        }
      }
    }

    // 初始渲染
    render()

    // 监听状态变化
    const handleStateUpdate = () => render()
    ctx.on('stateUpdate' as never, handleStateUpdate as never)

    // 挂载到容器
    const container = ctx.getContainer()
    container.appendChild(panel)

    return () => {
      ctx.off('stateUpdate' as never, handleStateUpdate as never)
      panel.remove()
    }
  },
})
