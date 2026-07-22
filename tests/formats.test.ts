import { describe, it, expect } from 'vitest'
import { parseOPML, exportOPML } from '@tomind/formats/opml'
import { parseFreeMind, exportFreeMind } from '@tomind/formats/freemind'
import { parseMarkdown, exportMarkdown } from '@tomind/formats/markdown'
import { parseLighten, exportLighten } from '@tomind/formats/lighten'
import { parseMindNode, exportMindNode } from '@tomind/formats/mindnode'
import { modelToNodeDesc } from '@tomind/formats/model-to-node'
import type { ModelTree } from '@tomind/formats/model-to-node'

// ==================== modelToNodeDesc ====================

describe('modelToNodeDesc', () => {
  it('should convert ModelTree to NodeDesc', () => {
    const tree: ModelTree = {
      root: {
        id: 'root-1',
        title: 'Central Topic',
        children: [
          { id: 'child-1', title: 'Child 1', children: [] },
          { id: 'child-2', title: 'Child 2', children: [
            { id: 'grandchild-1', title: 'Grandchild 1', children: [] },
          ]},
        ],
      },
      title: 'Test',
    }

    const nodeDesc = modelToNodeDesc(tree)
    expect(nodeDesc.id).toBe('root-1')
    expect(nodeDesc.type).toBe('topic')
    expect(nodeDesc.attrs.title).toBe('Central Topic')
    expect(nodeDesc.children.attached).toHaveLength(2)
    expect(nodeDesc.children.attached[0].attrs.title).toBe('Child 1')
    expect(nodeDesc.children.attached[1].children.attached).toHaveLength(1)
  })
})

// ==================== OPML ====================

describe('OPML format', () => {
  const sampleOPML = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>Test OPML</title></head>
  <body>
    <outline text="Topic 1">
      <outline text="Child 1.1"/>
      <outline text="Child 1.2"/>
    </outline>
    <outline text="Topic 2"/>
  </body>
</opml>`

  it('should parse OPML', () => {
    const tree = parseOPML(sampleOPML)
    expect(tree.title).toBe('Test OPML')
    expect(tree.root.title).toBe('Topic 1')
    expect(tree.root.children).toHaveLength(2)
  })

  it('should round-trip OPML', () => {
    const tree = parseOPML(sampleOPML)
    const xml = exportOPML(tree)
    expect(xml).toContain('<outline text="Topic 1"')
    expect(xml).toContain('<outline text="Child 1.1"')
    expect(xml).toContain('</opml>')
  })
})

// ==================== FreeMind ====================

describe('FreeMind format', () => {
  const sampleMM = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Central Topic" ID="root-1">
    <node TEXT="Child 1" ID="c1"/>
    <node TEXT="Child 2" ID="c2" FOLDED="true"/>
  </node>
</map>`

  it('should parse FreeMind .mm', () => {
    const tree = parseFreeMind(sampleMM)
    expect(tree.root.title).toBe('Central Topic')
    expect(tree.root.children).toHaveLength(2)
    expect(tree.root.children[1].collapsed).toBe(true)
  })

  it('should round-trip FreeMind', () => {
    const tree = parseFreeMind(sampleMM)
    const xml = exportFreeMind(tree)
    expect(xml).toContain('<map version="1.0.1">')
    expect(xml).toContain('TEXT="Central Topic"')
  })
})

// ==================== Markdown ====================

describe('Markdown format', () => {
  const sampleMD = `# Central Topic
## Topic 1
### Child 1.1
### Child 1.2
## Topic 2
- Item 1
- Item 2`

  it('should parse Markdown', () => {
    const tree = parseMarkdown(sampleMD)
    expect(tree.root.title).toBe('Central Topic')
    expect(tree.root.children.length).toBeGreaterThan(0)
    expect(tree.root.children[0].title).toBe('Topic 1')
  })

  it('should round-trip Markdown', () => {
    const tree = parseMarkdown(sampleMD)
    const md = exportMarkdown(tree)
    expect(md).toContain('# Central Topic')
    expect(md).toContain('- Topic 1')
  })
})

// ==================== Lighten ====================

describe('Lighten format', () => {
  const sampleLighten = JSON.stringify({
    version: '2.0',
    topicTree: {
      id: 'root',
      title: 'Root Topic',
      children: [
        { id: 'c1', title: 'Child 1', note: 'A note' },
        { id: 'c2', title: 'Child 2', isCollapsed: true, labels: ['tag1'] },
      ],
    },
  })

  it('should parse Lighten', () => {
    const tree = parseLighten(sampleLighten)
    expect(tree.root.title).toBe('Root Topic')
    expect(tree.root.children).toHaveLength(2)
    expect(tree.root.children[0].note).toBe('A note')
    expect(tree.root.children[1].collapsed).toBe(true)
    expect(tree.root.children[1].labels).toEqual(['tag1'])
  })

  it('should round-trip Lighten', () => {
    const tree = parseLighten(sampleLighten)
    const json = exportLighten(tree)
    const parsed = JSON.parse(json)
    expect(parsed.topicTree.title).toBe('Root Topic')
    expect(parsed.topicTree.children).toHaveLength(2)
  })
})

// ==================== MindNode ====================

describe('MindNode format', () => {
  const sampleMindNode = JSON.stringify({
    metadata: { name: 'My Map' },
    nodeTree: {
      id: 'root',
      text: 'Root Node',
      children: [
        { id: 'c1', text: 'Child 1', url: 'https://example.com' },
        { id: 'c2', text: 'Child 2', collapsed: true },
      ],
    },
  })

  it('should parse MindNode', () => {
    const tree = parseMindNode(sampleMindNode)
    expect(tree.root.title).toBe('Root Node')
    expect(tree.root.children).toHaveLength(2)
    expect(tree.root.children[0].href).toBe('https://example.com')
    expect(tree.root.children[1].collapsed).toBe(true)
  })

  it('should round-trip MindNode', () => {
    const tree = parseMindNode(sampleMindNode)
    const json = exportMindNode(tree)
    const parsed = JSON.parse(json)
    expect(parsed.nodeTree.text).toBe('Root Node')
    expect(parsed.nodeTree.children).toHaveLength(2)
  })
})
