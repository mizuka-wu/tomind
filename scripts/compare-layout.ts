import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseXMind } from '../packages/formats/src/xmind'
import { modelToNodeDesc } from '../packages/formats/src/model-to-node'
import { mapClockwiseLayoutAlgorithm } from '../packages/layout/src/index'
import { runSnowbrushMapLayout, type RefNode } from '../tests/snowbrush-layout-ref'
import { getTitle, getFontSize } from '../packages/layout/src/layout-utils'

const file = resolve('../render-compare/public/demo.xmind')

function findNode(node: any, id: string): any {
  if (node.id === id) return node
  for (const child of node.children?.attached || []) {
    const found = findNode(child, id)
    if (found) return found
  }
  return null
}

async function main() {
  const buf = readFileSync(file)
  const tree = await parseXMind(new Uint8Array(buf))
  const topicNode = modelToNodeDesc(tree)
  const doc = { ...topicNode, type: 'root' as const }

  // tomind layout — horizontalGap=39 to match snowbrush LINECOLPOS*3 (fold default)
  const options = {
    horizontalGap: 39,
    verticalGap: 0,
    nodePadding: { top: 5, right: 6, bottom: 5, left: 6 },
    rootOffsetX: 0,
    lineHeight: 1.2,
    charWidthFactor: 0.55,
    maxTitleWidth: 300,
    canvasWidth: 10000,
    canvasHeight: 10000,
  }
  const tomindResult = mapClockwiseLayoutAlgorithm.layout(doc, options)

  // Build RefNode tree for snowbrush reference (snowbrush ref measures its own text)
  const titleMap = new Map<string, string>()
  const buildRef = (node: any): RefNode => {
    const title = node.attrs?.title || node.id
    titleMap.set(node.id, title)
    const fontSize = getFontSize(node) || 14
    const children = (node.children?.attached || []).map(buildRef)
    return { id: node.id, title, fontSize, children }
  }
  const refRoot = buildRef(doc)

  const snowResult = runSnowbrushMapLayout(refRoot)

  // Compare
  const diffs: { id: string; title: string; dx: number; dy: number; dw: number; dh: number }[] = []
  for (const [id, tNode] of tomindResult.nodes) {
    const sNode = snowResult.nodes.get(id)
    if (!sNode) continue
    const title = titleMap.get(id) || id
    diffs.push({
      id,
      title: title.slice(0, 25),
      dx: Math.abs(tNode.x - sNode.x),
      dy: Math.abs(tNode.y - sNode.y),
      dw: Math.abs(tNode.width - sNode.width),
      dh: Math.abs(tNode.height - sNode.height),
    })
  }

  if (diffs.length === 0) {
    console.log('No nodes to compare!')
    return
  }

  // Summary
  const avgDx = diffs.reduce((s, d) => s + d.dx, 0) / diffs.length
  const avgDy = diffs.reduce((s, d) => s + d.dy, 0) / diffs.length
  const avgDw = diffs.reduce((s, d) => s + d.dw, 0) / diffs.length
  const avgDh = diffs.reduce((s, d) => s + d.dh, 0) / diffs.length
  const maxDx = Math.max(...diffs.map(d => d.dx))
  const maxDy = Math.max(...diffs.map(d => d.dy))

  console.log(`\n=== Layout Comparison (tomind vs snowbrush-ref) ===`)
  console.log(`Nodes compared: ${diffs.length}`)
  console.log(`avgΔX: ${avgDx.toFixed(1)}px  avgΔY: ${avgDy.toFixed(1)}px`)
  console.log(`avgΔW: ${avgDw.toFixed(1)}px  avgΔH: ${avgDh.toFixed(1)}px`)
  console.log(`maxΔX: ${maxDx.toFixed(1)}px  maxΔY: ${maxDy.toFixed(1)}px`)

  // Top 10 biggest X diffs
  diffs.sort((a, b) => b.dx - a.dx)
  console.log(`\nTop 10 ΔX:`)
  for (const d of diffs.slice(0, 10)) {
    console.log(`  ${d.title.padEnd(25)} ΔX=${d.dx.toFixed(0)} ΔY=${d.dy.toFixed(0)} ΔW=${d.dw.toFixed(0)} ΔH=${d.dh.toFixed(0)}`)
  }

  // Top 10 biggest Y diffs
  diffs.sort((a, b) => b.dy - a.dy)
  console.log(`\nTop 10 ΔY:`)
  for (const d of diffs.slice(0, 10)) {
    console.log(`  ${d.title.padEnd(25)} ΔX=${d.dx.toFixed(0)} ΔY=${d.dy.toFixed(0)} ΔW=${d.dw.toFixed(0)} ΔH=${d.dh.toFixed(0)}`)
  }
}

main().catch(console.error)
