import { WorkbookEditor } from '@tomind/editor'
import { StyleEngine } from '@tomind/style'
import { SheetState } from '@tomind/state'
import { DefaultLayoutEngine } from '@tomind/layout'
import { StarterKit } from '@tomind/starter-vanilla'
import { createSampleDoc } from './sample-data'

function init() {
  const container = document.getElementById('app')
  if (!container) {
    throw new Error('Container #app not found')
  }

  const styleEngine = new StyleEngine()
  const layoutEngine = new DefaultLayoutEngine()

  const doc = createSampleDoc()
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
