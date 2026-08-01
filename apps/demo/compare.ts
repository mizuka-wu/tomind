import { parseXMind } from '@tomind/formats/xmind'
import { modelToNodeDesc } from '@tomind/formats/model-to-node'
import { LayoutEngine, createTreeLayoutAlgorithm } from '@tomind/layout'

interface NodeLayout {
  x: number; y: number; width: number; height: number
  titleWidth: number; titleHeight: number; branchHeight: number
}

async function init() {
  const loading = document.getElementById('loading')!
  const main = document.getElementById('main')!

  try {
    // 1. Load xmind
    const resp = await fetch('./demo.xmind')
    const buffer = await resp.arrayBuffer()
    const tree = await parseXMind(new Uint8Array(buffer))
    const topicNode = modelToNodeDesc(tree)
    const doc = {
      id: 'root',
      type: 'root',
      attrs: { title: tree.title || 'XMind Demo' },
      children: { attached: [topicNode] },
    }

    console.log('[compare] doc:', JSON.stringify(doc, null, 2).slice(0, 500))

    // 2. Run layout
    const engine = new LayoutEngine()
    engine.register(createTreeLayoutAlgorithm('tree', 'right'))
    const fakeState = { doc } as any
    const layout = engine.compute(fakeState)

    console.log('[compare] layout nodes:', layout.nodes.size)
    for (const [id, nl] of layout.nodes) {
      console.log(`  ${id}: (${nl.x.toFixed(1)}, ${nl.y.toFixed(1)}) ${nl.width.toFixed(1)}x${nl.height.toFixed(1)}`)
    }

    // 3. Collect all nodes with depth
    const nodeInfos: Array<{ node: any; depth: number; layout: NodeLayout | undefined }> = []
    function walk(node: any, depth: number) {
      nodeInfos.push({ node, depth, layout: layout.nodes.get(node.id) })
      for (const child of (node.children?.attached ?? [])) {
        walk(child, depth + 1)
      }
    }
    walk(doc, 0)

    // 4. Render SVG
    renderSVG('svg-panel', doc, layout)

    // 5. Render coords table
    renderCoordsTable('coords-panel', nodeInfos)

    // 6. Show
    loading.style.display = 'none'
    main.style.display = ''

  } catch (e: any) {
    console.error('[compare] failed:', e)
    loading.textContent = `Error: ${e.message}`
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function renderSVG(containerId: string, doc: any, layout: { nodes: Map<string, NodeLayout>; totalWidth: number; totalHeight: number }) {
  const container = document.getElementById(containerId)!
  const pad = 60
  const totalW = layout.totalWidth + pad * 2
  const totalH = layout.totalHeight + pad * 2

  const paths: string[] = []
  const rects: string[] = []

  // Draw connections
  function drawConnections(node: any) {
    const myLayout = layout.nodes.get(node.id)
    const children = node.children?.attached ?? []
    for (const child of children) {
      const cl = layout.nodes.get(child.id)
      if (!cl) continue

      if (!myLayout) {
        // Parent has no layout (e.g. root wrapper), just recurse
        drawConnections(child)
        continue
      }

      // Start: parent right edge, vertical center
      const sx = pad + myLayout.x + myLayout.width
      const sy = pad + myLayout.y + myLayout.height / 2
      // End: child left edge, vertical center
      const ex = pad + cl.x
      const ey = pad + cl.y + cl.height / 2

      // 贝塞尔曲线样式: M → L → Q
      const ctrlX = sx + (ex - sx) * 0.2
      paths.push(`<path d="M${sx},${sy} L${ctrlX},${sy} Q${ctrlX},${ey} ${ex},${ey}" fill="none" stroke="#aaa" stroke-width="1.5"/>`)

      // Debug: draw connection endpoint circles
      rects.push(`<circle cx="${sx}" cy="${sy}" r="3" fill="red"/>`)
      rects.push(`<circle cx="${ex}" cy="${ey}" r="3" fill="blue"/>`)

      drawConnections(child)
    }
  }
  drawConnections(doc)

  // Draw nodes
  function drawNodes(node: any) {
    const nl = layout.nodes.get(node.id)
    if (!nl) {
      // No layout (root wrapper), just recurse children
      for (const child of (node.children?.attached ?? [])) drawNodes(child)
      return
    }

    const x = pad + nl.x
    const y = pad + nl.y

    const color = node.type === 'root' ? '#4a90d9'
      : node.type === 'topic' ? '#5cb85c'
      : '#f0ad4e'

    rects.push(`<rect x="${x}" y="${y}" width="${nl.width}" height="${nl.height}" rx="6" fill="${color}" opacity="0.85" stroke="#333" stroke-width="1"/>`)

    // Title
    const title = (typeof node.attrs?.title === 'string' ? node.attrs.title : '') || node.id
    rects.push(`<text x="${x + nl.width / 2}" y="${y + nl.height / 2 + 4}" text-anchor="middle" fill="#fff" font-size="12" font-weight="500">${escapeHtml(title)}</text>`)

    // Coordinate label
    rects.push(`<text x="${x + 2}" y="${y - 4}" fill="#666" font-size="9" font-family="monospace">(${Math.round(nl.x)},${Math.round(nl.y)})</text>`)

    for (const child of (node.children?.attached ?? [])) drawNodes(child)
  }
  drawNodes(doc)

  container.innerHTML = `<svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg" style="background:#fafafa">${paths.join('')}${rects.join('')}</svg>`
}

function renderCoordsTable(containerId: string, nodeInfos: Array<{ node: any; depth: number; layout: NodeLayout | undefined }>) {
  const container = document.getElementById(containerId)!
  let html = `<table class="coord-table"><thead><tr>
    <th>ID</th><th>Type</th><th>Title</th><th>Depth</th>
    <th>X</th><th>Y</th><th>W</th><th>H</th>
    <th>CX</th><th>CY</th><th>branchH</th>
  </tr></thead><tbody>`

  for (const { node, depth, layout: nl } of nodeInfos) {
    if (!nl) {
      html += `<tr><td>${node.id}</td><td>${node.type}</td><td>${escapeHtml(String(node.attrs?.title || ''))}</td><td>${depth}</td><td colspan="8" style="color:#f66">NO LAYOUT DATA</td></tr>`
      continue
    }
    const cx = (nl.x + nl.width / 2).toFixed(1)
    const cy = (nl.y + nl.height / 2).toFixed(1)
    html += `<tr>
      <td>${node.id}</td><td>${node.type}</td><td>${escapeHtml(String(node.attrs?.title || ''))}</td><td>${depth}</td>
      <td>${nl.x.toFixed(1)}</td><td>${nl.y.toFixed(1)}</td><td>${nl.width.toFixed(1)}</td><td>${nl.height.toFixed(1)}</td>
      <td>${cx}</td><td>${cy}</td><td>${nl.branchHeight.toFixed(1)}</td>
    </tr>`
  }

  html += '</tbody></table>'
  container.innerHTML = html
}

init()
