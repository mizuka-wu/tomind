import { WorkbookEditor } from '@tomind/editor'
import { StyleEngine, isSkeletonKey, isColorKey } from '@tomind/style'
import type { ThemeData } from '@tomind/style'
import { SheetState } from '@tomind/state'
import { LayoutEngine } from '@tomind/layout'
import { StarterKit } from '@tomind/starter-vanilla'
import { parseXMind } from '@tomind/formats/xmind'
import { modelToNodeDesc } from '@tomind/formats/model-to-node'

// 全局调试接口
declare global {
  interface Window {
    __tomind: {
      workbook: WorkbookEditor
      styleEngine: StyleEngine
      layoutEngine: LayoutEngine
      state: SheetState
      doc: any
      rawXMind: any
      themeData: any
      getStyle: (nodeId: string) => any
      getClassStyle: (nodeType: string) => any
    }
  }
}

async function init() {
  const container = document.getElementById('app')
  if (!container) {
    throw new Error('Container #app not found')
  }

  const styleEngine = new StyleEngine()
  const layoutEngine = new LayoutEngine()

  // 加载 xmind 文件
  let doc: any
  let rawXMind: any
  let xmindThemeData: Record<string, unknown> | undefined
  try {
    const resp = await fetch('./demo.xmind')
    const buffer = await resp.arrayBuffer()
    rawXMind = await parseXMind(new Uint8Array(buffer))
    const topicNode = modelToNodeDesc(rawXMind)
    doc = topicNode
    xmindThemeData = rawXMind.themeData
    console.log('[demo] loaded xmind:', rawXMind.title)
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

  workbook.addSheet({
    id: 'sheet-1',
    name: 'Main Sheet',
    state,
    dom: container,
  })

  workbook.setup()

  // XMind 主题必须在 workbook.setup() 之后加载，否则会被 PresetThemeExtension 覆盖
  if (xmindThemeData) {
    const themeId = (xmindThemeData as any).map?.id || (xmindThemeData as any).centralTopic?.id || 'xmind'
    
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
        skeleton[className] = { id: (entry as any).id, properties: skeletonProps as any }
      }
      if (Object.keys(colorProps).length > 0) {
        color[className] = { id: (entry as any).id, properties: colorProps as any }
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

  // 暴露调试接口到 window
  window.__tomind = {
    workbook,
    styleEngine,
    layoutEngine,
    state,
    doc,
    rawXMind,
    themeData: xmindThemeData,
    getStyle: (nodeId: string) => {
      const activeSheet = workbook.getActiveSheet()
      if (!activeSheet) return null
      return styleEngine.getLeaferStyle(activeSheet.state, nodeId)
    },
    getClassStyle: (nodeType: string) => {
      const theme = styleEngine.getActiveTheme()
      if (!theme) return null
      return theme[nodeType] ?? null
    },
  }

  console.log('[demo] debug interface ready: window.__tomind')
  console.log('[demo] try: __tomind.doc, __tomind.state.doc, __tomind.getStyle("nodeId"), __tomind.getClassStyle("mainTopic")')
}

document.addEventListener('DOMContentLoaded', init)
