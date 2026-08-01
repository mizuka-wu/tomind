import { WorkbookEditor } from '@tomind/editor'
import { StyleEngine } from '@tomind/style'
import { SheetState } from '@tomind/state'
import { LayoutEngine } from '@tomind/layout'
import { StarterKit } from '@tomind/starter-vanilla'
import { parseXMind } from '@tomind/formats/xmind'
import { modelToNodeDesc } from '@tomind/formats/model-to-node'
import { DEFAULT_SKELETON_THEME, DEFAULT_COLOR_THEME } from '@tomind/extensions'

async function init() {
  const container = document.getElementById('app')
  if (!container) {
    throw new Error('Container #app not found')
  }

  const styleEngine = new StyleEngine()
  const layoutEngine = new LayoutEngine()

  // 加载默认主题（skeleton + color）
  styleEngine.loadTheme({
    id: 'default-skeleton',
    name: 'Default Skeleton',
    skeleton: DEFAULT_SKELETON_THEME,
  })
  styleEngine.loadTheme({
    id: 'default-color',
    name: 'Default Color',
    color: DEFAULT_COLOR_THEME,
  })

  // 加载 xmind 文件
  let doc
  try {
    const resp = await fetch('./demo.xmind')
    const buffer = await resp.arrayBuffer()
    const tree = await parseXMind(new Uint8Array(buffer))
    const topicNode = modelToNodeDesc(tree)
    // 包装为 root 类型
    doc = {
      id: 'root',
      type: 'root',
      attrs: { title: tree.title || 'XMind Demo' },
      children: { attached: [topicNode] },
    }
    // 注册 XMind 主题到 StyleEngine（覆盖默认 color 主题）
    if (tree.themeData) {
      styleEngine.loadTheme({
        id: tree.themeData.map?.id || tree.themeData.centralTopic?.id || 'xmind',
        color: tree.themeData,
      })
      styleEngine.setActiveTheme(
        tree.themeData.map?.id || tree.themeData.centralTopic?.id || 'xmind'
      )
      console.log('[demo] loaded xmind theme:', Object.keys(tree.themeData))
    } else {
      // 没有 XMind 主题，使用默认 color 主题
      styleEngine.setActiveTheme('default-color')
    }
    console.log('[demo] loaded xmind:', tree.title)
  } catch (e) {
    console.error('[demo] failed to load xmind, using sample data:', e)
    // fallback
    const { createSampleDoc } = await import('./sample-data')
    doc = createSampleDoc()
    // 使用默认主题
    styleEngine.setActiveTheme('default-color')
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
}

document.addEventListener('DOMContentLoaded', init)
