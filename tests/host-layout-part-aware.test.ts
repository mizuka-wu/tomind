/**
 * 宿布局 part-blind × 委派子树 part-aware 的「混帧」回归测试
 *
 * timeline / treetable 自己量尺寸走 SimpleNodeSize（只测 title + padding），
 * 而它们委派出去的 logic 子树是 part-aware 的（labels 计入主题盒 +24、
 * 原点 = shapeHeight/2）。SB 的 boundaryBounds.y / newBounds.y 一律以**原点**
 * （shape 中心）为参考，所以宿布局接委派子树时也必须用 originY，不能用 height/2。
 *
 * 量尺 fixture：test-timeline-labels / test-treetable-labels（labels 同时挂在主分支与孙节点）
 *   修前 timeline：只挂孙节点 → avgΔY 1.3（root 对齐后 222/235 个节点 dy = -12）；
 *                只挂主分支 → avgΔY 11.9 / avgΔH 1.2（100 个节点 dy = -24、12 个 ΔH = -24）
 *   修前 treetable：只挂主分支 → 报告 avgΔY 0.1（被质心对齐掩盖），
 *                  root 对齐后 **234/235 个节点 dy = -12**
 *   修后两者四项指标全 0。
 */

import { describe, it, expect } from 'vitest'
import { SheetState } from '@tomind/state'
import {
  timelineHorizontalLayoutAlgorithm,
  treeTableLayoutAlgorithm,
  DEFAULT_LAYOUT_OPTIONS,
} from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'

/** labels 行 = SB topicCell verticalSpacing(4) + LabelsView 单行高(20) */
const LABELS_EXTRA = 24

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

/** skeleton 让子层级委派 logic（否则 delegateLogicSubtree 直接返回 null，测不到衔接点） */
const withSkeleton = (doc: NodeDesc): SheetState => SheetState.create({
  doc: {
    ...doc,
    attrs: {
      ...doc.attrs,
      skeletonStructure: {
        centralTopic: 'org.xmind.ui.logic.right',
        mainTopic: 'org.xmind.ui.logic.right',
        subTopic: 'org.xmind.ui.logic.right',
      },
    },
  },
})

describe('timeline：主题盒含 labels，且按原点（shape 中心）对齐', () => {
  const build = (labels: boolean) => node('root', 'ROOT', { structureClass: 'org.xmind.ui.timeline.horizontal' }, [
    node('b1', 'BBBBB'),
    node('b2', 'BBBBB', labels ? { labels: ['L1'] } : {}, [node('b2c', 'CHILD')]),
  ])

  it('带 labels 的轴分支主题盒高 +24（part-aware 量测）', () => {
    const plain = timelineHorizontalLayoutAlgorithm.layout(build(false), DEFAULT_LAYOUT_OPTIONS, null, withSkeleton(build(false))).nodes
    const labeled = timelineHorizontalLayoutAlgorithm.layout(build(true), DEFAULT_LAYOUT_OPTIONS, null, withSkeleton(build(true))).nodes
    expect(labeled.get('b2')!.height).toBe(plain.get('b2')!.height + LABELS_EXTRA)
    // 宽度不受 labels 影响（SB labelsView.setParentWidth(shape 宽)）
    expect(labeled.get('b2')!.width).toBe(plain.get('b2')!.width)
  })

  it('轴分支的原点落在轴线上：盒顶 = 轴线 - shapeHeight/2（不是 - height/2）', () => {
    const doc = build(true)
    const state = withSkeleton(doc)
    const n = timelineHorizontalLayoutAlgorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS, null, state).nodes
    const b1 = n.get('b1')!
    const b2 = n.get('b2')!
    // b1 没有 labels → 原点 = 盒中心；两个分支都在同一条轴线上
    const axisY = b1.y + b1.height / 2
    const shapeH = b2.height - LABELS_EXTRA
    expect(b2.y).toBeCloseTo(axisY - shapeH / 2, 6)
    // 旧实现是 axisY - b2.height/2，正好低 12px
    expect(b2.y).not.toBeCloseTo(axisY - b2.height / 2, 6)
  })

  it('带 labels 的分支透出 partBounds（渲染层 shape-box 要靠它反推 shapeHeight）', () => {
    const doc = build(true)
    const n = timelineHorizontalLayoutAlgorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS, null, withSkeleton(doc)).nodes
    const labels = n.get('b2')!.partBounds?.get('labels')
    expect(labels).toBeTruthy()
    // shape-box 口径：shapeHeight = labels.y - 4
    expect(labels!.y - 4).toBe(n.get('b2')!.height - LABELS_EXTRA)
  })
})

describe('treetable：head 子树按原点接进单元格', () => {
  const build = (labels: boolean) => node('root', 'ROOT', { structureClass: 'org.xmind.ui.treetable' }, [
    node('h1', 'HEAD', labels ? { labels: ['L1'] } : {}, [node('h1c', 'CHILD')]),
  ])

  it('带 labels 的 head 主题盒高 +24，且首行内容顶边仍对齐（旧实现整棵子树上移 12）', () => {
    const plainDoc = build(false)
    const labeledDoc = build(true)
    const plain = treeTableLayoutAlgorithm.layout(plainDoc, DEFAULT_LAYOUT_OPTIONS, null, withSkeleton(plainDoc)).nodes
    const labeled = treeTableLayoutAlgorithm.layout(labeledDoc, DEFAULT_LAYOUT_OPTIONS, null, withSkeleton(labeledDoc)).nodes

    expect(labeled.get('h1')!.height).toBe(plain.get('h1')!.height + LABELS_EXTRA)
    // 第一行 rowY = 0、extendH = 0 → head 子树的 bb 顶边 = 0；
    // head 是子树最上面的节点，所以它的盒顶就是 0（旧实现：-12）
    expect(labeled.get('h1')!.y).toBeCloseTo(plain.get('h1')!.y, 6)
    expect(labeled.get('h1c')!.y).toBeCloseTo(plain.get('h1c')!.y, 6)
  })
})
