import { readFileSync } from 'fs'
import { parseXmind } from '@tomind/formats'
import { createDefaultState } from '@tomind/state'
import { mapClockwiseLayoutAlgorithm } from '@tomind/layout'
import { StyleEngine } from '@tomind/style'

const buf = readFileSync('../render-compare/public/demo.xmind')
const parsed = await parseXmind(buf)
const state = createDefaultState(parsed.sheets[0])
const styleEngine = new StyleEngine(state.doc)

const opts = {
  rootOffsetX: 100, rootOffsetY: 200,
  horizontalGap: 34, verticalGap: 10,
  nodePadding: { top: 8, right: 13, bottom: 8, left: 13 },
}

const result = mapClockwiseLayoutAlgorithm.layout(state.doc, opts, styleEngine, state)
const nodes = result.nodes

const root = state.doc
const rootNL = nodes.get(root.id)!
console.log(`Root: (${rootNL.x.toFixed(1)}, ${rootNL.y.toFixed(1)})`)
console.log(`Root branchH: ${rootNL.branchHeight.toFixed(1)}`)

const rootChildren = root.children?.attached || root.children || []
for (let i = 0; i < Math.min(6, rootChildren.length); i++) {
  const c = rootChildren[i]
  const nl = nodes.get(c.id)
  if (nl) {
    console.log(`  [${i}] "${(c.title||'').slice(0,12)}": y=${nl.y.toFixed(1)}, bh=${nl.branchHeight.toFixed(1)}, h=${nl.height.toFixed(1)}`)
  }
}
