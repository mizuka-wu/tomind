import { describe, it, expect } from 'vitest'
import { parseOPML, exportOPML } from '@tomind/formats/opml'
import { parseFreeMind, exportFreeMind } from '@tomind/formats/freemind'
import { parseMarkdown, exportMarkdown } from '@tomind/formats/markdown'
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
      title: 'Test Sheet',
    }

    const nodeDesc = modelToNodeDesc(tree)

    expect(nodeDesc.id).toBe('root-1')
    expect(nodeDesc.type).toBe('topic')
    expect(nodeDesc.attrs.title).toBe('Central Topic')
    expect(nodeDesc.children.attached).toHaveLength(2)
    expect(nodeDesc.children.attached[0].attrs.title).toBe('Child 1')
    expect(nodeDesc.children.attached[1].children.attached).toHaveLength(1)
    expect(nodeDesc.children.attached[1].children.attached[0].attrs.title).toBe('Grandchild 1')
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
    expect(tree.root.children[0].title).toBe('Child 1.1')
    expect(tree.root.children[1].title).toBe('Child 1.2')
  })

  it('should export OPML', () => {
    const tree: ModelTree = {
      root: {
        id: 'root',
        title: 'Root',
        children: [
          { id: 'c1', title: 'Child 1', children: [] },
        ],
      },
    }

    const xml = exportOPML(tree)
    expect(xml).toContain('<outline text="Root"')
    expect(xml).toContain('<outline text="Child 1"')
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
    expect(tree.root.children[0].title).toBe('Child 1')
    expect(tree.root.children[1].collapsed).toBe(true)
  })

  it('should export FreeMind .mm', () => {
    const tree: ModelTree = {
      root: {
        id: 'root',
        title: 'Root',
        children: [
          { id: 'c1', title: 'Child 1', children: [] },
        ],
      },
    }

    const xml = exportFreeMind(tree)
    expect(xml).toContain('<map version="1.0.1">')
    expect(xml).toContain('TEXT="Root"')
    expect(xml).toContain('TEXT="Child 1"')
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
    expect(tree.root.children[0].children).toHaveLength(2)
    expect(tree.root.children[0].children[0].title).toBe('Child 1.1')
  })

  it('should export Markdown', () => {
    const tree: ModelTree = {
      root: {
        id: 'root',
        title: 'Root',
        children: [
          { id: 'c1', title: 'Child 1', children: [] },
        ],
      },
    }

    const md = exportMarkdown(tree)
    expect(md).toContain('# Root')
    expect(md).toContain('- Child 1')
  })
})
