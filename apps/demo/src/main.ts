import { WorkbookEditor } from '@tomind/editor'
import { StyleEngine } from '@tomind/style'
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
  try {
    const resp = await fetch('/demo.xmind')
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
    console.log('[demo] loaded xmind:', tree.title)
  } catch (e) {
    console.error('[demo] failed to load xmind, using sample data:', e)
    // fallback
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
}

document.addEventListener('DOMContentLoaded', init)
