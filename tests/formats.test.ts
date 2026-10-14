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

  it('callout 保留完整子树与 part（SB 里 callout 是正常 branchView）', () => {
    // 旧实现把 callout 和 summary/boundary 一起走「只留 title/range/position」的轻量转换，
    // children: {} → callout 的整棵子树在解析阶段就被丢掉
    // （test-callout-children.xmind：SB 256 个节点，TM 只解析出 238）
    const tree: ModelTree = {
      root: {
        id: 'root-1',
        title: 'Central Topic',
        children: [],
        callouts: [{
          id: 'co-1',
          title: '标注',
          children: [
            { id: 'co-1-1', title: '标注子 1', children: [
              { id: 'co-1-1-1', title: '标注孙', children: [] },
            ] },
            { id: 'co-1-2', title: '标注子 2', children: [] },
          ],
          position: { x: 320, y: -60 },
          labels: ['L1'],
          markers: [{ markerId: 'priority-1' }],
          note: 'N',
        }],
      },
      title: 'Test',
    }

    const nodeDesc = modelToNodeDesc(tree)
    const callouts = nodeDesc.children.callout
    expect(callouts).toHaveLength(1)
    const co = callouts[0]
    expect(co.type).toBe('callout')
    // 自由位置仍然保留（布局要用 model.position 放置）
    expect(co.attrs.position).toEqual({ x: 320, y: -60 })
    // 子树完整
    expect(co.children.attached).toHaveLength(2)
    expect(co.children.attached[0].children.attached).toHaveLength(1)
    expect(co.children.attached[0].children.attached[0].id).toBe('co-1-1-1')
    // part 不被丢（callout 也可以有 labels / markers / note）
    expect(co.attrs.labels).toEqual(['L1'])
    expect(co.attrs.markers).toEqual([{ markerId: 'priority-1' }])
    expect(co.attrs.note).toBeTruthy()
  })

  it('summary / boundary 仍然是轻量节点（带 range，不带子树）', () => {
    const tree: ModelTree = {
      root: {
        id: 'root-1',
        title: 'Central Topic',
        children: [{ id: 'c1', title: 'C1', children: [] }],
        summaries: [{ id: 's1', title: 'S1', children: [], rangeStart: 0, rangeEnd: 1 }],
        boundaries: [{ id: 'b1', title: 'B1', children: [], rangeStart: 0, rangeEnd: 1 }],
      },
      title: 'Test',
    }
    const nodeDesc = modelToNodeDesc(tree)
    expect(nodeDesc.children.summary[0].type).toBe('summary')
    expect(nodeDesc.children.summary[0].attrs.rangeStart).toBe(0)
    expect(nodeDesc.children.summary[0].attrs.rangeEnd).toBe(1)
    expect(nodeDesc.children.boundary[0].type).toBe('boundary')
  })

  it('should convert note with HTML content', () => {
    const tree: ModelTree = {
      root: {
        id: 'root-1',
        title: 'Root',
        children: [
          {
            id: 'child-1',
            title: 'Child 1',
            children: [],
            note: 'Plain note',
            noteHtml: '<p>Rich <b>text</b></p>',
          },
          {
            id: 'child-2',
            title: 'Child 2',
            children: [],
            note: 'Plain only',
          },
        ],
      },
      title: 'Test',
    }

    const nodeDesc = modelToNodeDesc(tree)
    const child1 = nodeDesc.children.attached[0]
    const child2 = nodeDesc.children.attached[1]

    // child1: 有 HTML 内容
    const note1 = child1.attrs.note as { content: string; format?: string; htmlContent?: string }
    expect(note1.content).toBe('Plain note')
    expect(note1.format).toBe('html')
    expect(note1.htmlContent).toBe('<p>Rich <b>text</b></p>')

    // child2: 只有纯文本
    const note2 = child2.attrs.note as { content: string; format?: string; htmlContent?: string }
    expect(note2.content).toBe('Plain only')
    expect(note2.format).toBeUndefined()
    expect(note2.htmlContent).toBeUndefined()
  })

  it('should convert note with only HTML content (no plain)', () => {
    const tree: ModelTree = {
      root: {
        id: 'root-1',
        title: 'Root',
        children: [
          {
            id: 'child-1',
            title: 'Child 1',
            children: [],
            noteHtml: '<p>Only HTML</p>',
          },
        ],
      },
      title: 'Test',
    }

    const nodeDesc = modelToNodeDesc(tree)
    const child1 = nodeDesc.children.attached[0]
    const note = child1.attrs.note as { content: string; format?: string; htmlContent?: string }
    expect(note.content).toBe('')
    expect(note.format).toBe('html')
    expect(note.htmlContent).toBe('<p>Only HTML</p>')
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
