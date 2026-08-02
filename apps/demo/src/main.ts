import { WorkbookEditor } from '@tomind/editor'
import { StyleEngine, isSkeletonKey, isColorKey } from '@tomind/style'
import type { ThemeData } from '@tomind/style'
import { SheetState } from '@tomind/state'
import { LayoutEngine } from '@tomind/layout'
import { StarterKit } from '@tomind/starter-vanilla'
import { parseXMind } from '@tomind/formats/xmind'
import { modelToNodeDesc } from '@tomind/formats/model-to-node'

async function init() {
  const container = document.getElementById('app')
  if (!container) {
    throw new Error('Container #app not found')
  }

  const styleEngine = new StyleEngine()
  const layoutEngine = new LayoutEngine()

  // 加载 xmind 文件
  let doc
  let xmindThemeData: Record<string, unknown> | undefined
  try {
    const resp = await fetch('./demo.xmind')
    const buffer = await resp.arrayBuffer()
    const tree = await parseXMind(new Uint8Array(buffer))
    const topicNode = modelToNodeDesc(tree)
    // 直接用 XMind 根节点作为 doc root，不包裹合成 root
    // 这样 classifyNode 能正确分类：root(depth 0) → centralTopic
    doc = topicNode
    xmindThemeData = tree.themeData
    console.log('[demo] loaded xmind:', tree.title)
  } catch (e) {
    console.error('[demo] failed to load xmind, using sample data:', e)
    const { createSampleDoc } = await import('./sample-data')
    doc = createSampleDoc()
  }

  const state = SheetState.create({ doc })

  const workbook = new WorkbookEditor({
    styleEngine,
    layoutEngine,
    editable: true,
    extensions: [StarterKit],
  })

  // 如果有 XMind 主题，分离 skeleton/color 并加载
  if (xmindThemeData) {
    const themeId = (xmindThemeData as any).map?.id || (xmindThemeData as any).centralTopic?.id || 'xmind'
    
    // 分离 skeleton（shapeClass, lineClass 等）和 color（fillColor, borderColor 等）
    const skeleton: ThemeData = {}
    const color: ThemeData = {}
    
    for (const [className, entry] of Object.entries(xmindThemeData)) {
      if (typeof entry !== 'object' || entry === null) continue
      const skeletonProps: Record<string, unknown> = {}
      const colorProps: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(entry as Record<string, unknown>)) {
        if (isSkeletonKey(key)) {
          skeletonProps[key] = value
        } else {
          colorProps[key] = value
        }
      }
      if (Object.keys(skeletonProps).length > 0) {
        skeleton[className] = { properties: skeletonProps as any }
      }
      if (Object.keys(colorProps).length > 0) {
        color[className] = { properties: colorProps as any }
      }
    }
    
    styleEngine.loadTheme({
      id: themeId,
      skeleton,
      color,
    })
    styleEngine.setActiveTheme(themeId)
    console.log('[demo] loaded xmind theme:', Object.keys(xmindThemeData))
  }

  workbook.addSheet({
    id: 'sheet-1',
    name: 'Main Sheet',
    state,
    dom: container,
  })

  workbook.setup()
}

document.addEventListener('DOMContentLoaded', init)
