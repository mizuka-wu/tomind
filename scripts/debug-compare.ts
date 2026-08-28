import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseXMind } from '../packages/formats/src/xmind'
import { modelToNodeDesc } from '../packages/formats/src/model-to-node'
import { mapClockwiseLayoutAlgorithm } from '../packages/layout/src/index'
import { runSnowbrushMapLayout, type RefNode } from '../tests/snowbrush-layout-ref'
import { getFontSize } from '../packages/layout/src/layout-utils'

const file = resolve('../render-compare/public/demo.xmind')

async function main() {
  const buf = readFileSync(file)
  const tree = await parseXMind(new Uint8Array(buf))
  const topicNode = modelToNodeDesc(tree)
  const doc = { ...topicNode, type: 'root' as const }

  // Match snowbrush-ref: horizontalGap=39, no padding
  const options = {
    horizontalGap: 39, verticalGap: 0,
    nodePadding: { top: 5, right: 6, bottom: 5, left: 6 },
    rootOffsetX: 0, lineHeight: 1.2, charWidthFactor: 0.55,
    maxTitleWidth: 300, canvasWidth: 10000, canvasHeight: 10000,
  }
  const tomindResult = mapClockwiseLayoutAlgorithm.layout(doc, options)

  const titleMap = new Map<string, string>()
  const buildRef = (node: any): RefNode => {
    const title = node.attrs?.title || node.id
    titleMap.set(node.id, title)
    return { id: node.id, title, fontSize: getFontSize(node) || 14, children: (node.children?.attached || []).map(buildRef) }
  }
  const refRoot = buildRef(doc)
  const snowResult = runSnowbrushMapLayout(refRoot)

  // Print root + all children
  const allIds = [...tomindResult.nodes.keys()]
  for (const id of allIds) {
    const t = tomindResult.nodes.get(id)!
    const s = snowResult.nodes.get(id)
    const title = (titleMap.get(id) || id).slice(0, 15)
    const sInfo = s ? `SB x=${String(Math.round(s.x)).padStart(5)} y=${String(Math.round(s.y)).padStart(5)} w=${Math.round(s.width)}` : 'SB: N/A'
    console.log(
      title.padEnd(15),
      `TM x=${String(Math.round(t.x)).padStart(5)} y=${String(Math.round(t.y)).padStart(5)} w=${Math.round(t.width)}`,
      sInfo,
    )
  }

  // Also check totalWidth
  console.log(`\nTomind totalWidth: ${tomindResult.totalWidth.toFixed(0)}, totalHeight: ${tomindResult.totalHeight.toFixed(0)}`)
  console.log(`Snow  numRight: ${snowResult.numRight}`)
}

main().catch(console.error)
