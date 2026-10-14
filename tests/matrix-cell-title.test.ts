/**
 * matrix 单元格标题度量回归测试
 *
 * SB 探针实测（test-matrix.xmind）：
 *   「测量方法」subTopic  topicView.bounds 68×30 / titleView.bounds **56×18**
 *                        topicContentPosition = (-28, -9) = (-titleW/2, -titleH/2)
 *   「传感器技术」中央主题 topicView.bounds 208×70 / titleView.bounds **150×40**
 *                        topicContentPosition = (-75, -20)
 * 即 titleView 是**纯文本盒**，在主题盒里居中；margin（subTopic 6pt、
 * 中央主题 29pt）只体现在「主题盒 − 标题盒」的差上。
 *
 * 旧实现把主题盒尺寸当标题尺寸写进 NodeLayout（`titleWidth: topicSize.width`），
 * 而且 measureMinSize 只返回 {width,height}、把 titleWidth/titleHeight 整个丢掉 →
 * 渲染层退回 `layout.width - 16` 当换行宽度：
 *   63 个 matrix 单元格 text.width +12、text.y −6（中央那格 text.x −29 / text.y −15），
 *   「正温度系数（PTC)」被挤成两行（SB 113.96×18 → TM 114×42），溢出 30px 高的格子。
 */

import { describe, it, expect } from 'vitest'
import { matrixLayoutAlgorithm, DEFAULT_LAYOUT_OPTIONS, measureTextSize } from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'

const node = (
  id: string,
  title: string,
  attrs: Record<string, unknown> = {},
  children: readonly NodeDesc[] = [],
): NodeDesc => ({
  id,
  type: id === 'root' ? 'root' : 'topic',
  attrs: { title, ...attrs },
  children: { attached: children },
})

/** root(spreadsheet) → 行分支 → 单元格（带 label 决定列）→ 孙节点 */
function matrixDoc(cellLabels = true) {
  const cell = node('cell', '测量方法', cellLabels ? { labels: ['col1'] } : {}, [
    node('gc', '比较法'),
  ])
  const row = node('row', '误差', {}, [cell])
  return node('root', '传感器技术', { structureClass: 'org.xmind.ui.spreadsheet' }, [row])
}

const layoutMatrix = (doc: NodeDesc) =>
  matrixLayoutAlgorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS).nodes

describe('matrix cell 的 titleWidth/titleHeight 是标题盒，不是主题盒', () => {
  it('每个 matrix cell 都给出标题量测值', () => {
    const nodes = layoutMatrix(matrixDoc())
    // 注：不带 styleEngine 时 delegateLogicSubtree 拿不到 skeleton → cell 的子树不参与布局，
    // 所以这里只校验矩阵自己的三个 cell（root/row/cell）
    for (const id of ['root', 'row', 'cell']) {
      const nl = nodes.get(id)!
      expect(nl, id).toBeTruthy()
      expect(typeof nl.titleWidth, `${id}.titleWidth`).toBe('number')
      expect(nl.titleWidth, `${id}.titleWidth`).toBeGreaterThan(0)
      expect(typeof nl.titleHeight, `${id}.titleHeight`).toBe('number')
      expect(nl.titleHeight, `${id}.titleHeight`).toBeGreaterThan(0)
    }
  })

  it('标题盒 < 主题盒（差 = 左右/上下 margin），且等于 measureTextSize 的结果', () => {
    const nodes = layoutMatrix(matrixDoc())
    for (const id of ['root', 'row', 'cell']) {
      const nl = nodes.get(id)!
      expect(nl.titleWidth, `${id} titleWidth`).toBeLessThan(nl.width)
      expect(nl.titleHeight, `${id} titleHeight`).toBeLessThan(nl.height)
    }
    // cell「测量方法」：标题宽就是文本量测宽（不带 margin）
    const cell = nodes.get('cell')!
    const measured = measureTextSize('测量方法', 14, DEFAULT_LAYOUT_OPTIONS)
    expect(cell.titleWidth).toBe(measured.width)
    expect(cell.titleHeight).toBe(measured.height)
  })

  it('单元格自身的 labels 不参与标题度量（SB _isMatrixItem 不建 labelsView）', () => {
    const withLabels = layoutMatrix(matrixDoc(true)).get('cell')!
    const without = layoutMatrix(matrixDoc(false)).get('cell')!
    expect(withLabels.width).toBe(without.width)
    expect(withLabels.height).toBe(without.height)
    expect(withLabels.titleWidth).toBe(without.titleWidth)
    expect(withLabels.titleHeight).toBe(without.titleHeight)
  })
})
