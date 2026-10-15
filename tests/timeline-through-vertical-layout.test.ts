/**
 * timeline-through-vertical 布局回归测试（精确移植 SB timelinethroughvertical.ts）
 *
 * SB `calAttachedChildrenPos` 的三件事，旧实现一件都没做：
 *
 * 1. **轴上所有子节点 x 相同**（`x = prevPosX + getBasePoint(prev,DOWN).x - getBasePoint(prev,UP).x`，
 *    而 AbstractTopicShape.getBasePoint → getJointPosition 的 x 分量对 UP/DOWN 恒为 0）。
 *    子树朝哪边长由**子结构**决定（getChildStructure → getFinalTimelineChildDirection，
 *    从 LEFT 起交替 → logic.left / logic.right 委派）。
 *    旧实现把轴节点本身按 `i % 2` 左右错开（childX = x - w - gap / x + w + gap）。
 * 2. **双约束 Y 递推**（都相对**原点 = shape 中心**）：
 *      offsetYOfTopics = prevBaseDownY + TOPIC_SPACING - currBoundsY
 *      offsetYOfBounds = prevBaseDownY + prevBoundsHeight + prevBoundsY - currBoundsY
 *      posY = prevPosY + max(offsetYOfBounds, offsetYOfTopics)
 *    index === 1 时 prevBounds = 父的 topicView.shapeBounds（y = -originY、h = 2×originY），
 *    index > 1 时 = prev.boundaryBounds。旧实现用盒顶坐标 + DESIGN_PADDING=10 常量。
 * 3. **TOPIC_SPACING = getTopicSpacing(parentBranch)**：
 *      parseInt(spacingMinor) × designPadding(centralTopic 60 / 其他 36)
 *        ÷ parseInt(defaultStyles.spacingMinor) + getLineEndSpacingPatchGap(parent)
 *    轴节点自己的结构类就是 through.vertical → isTimelineThrough = true → 补丁常量用 4。
 *    旧实现读不到样式（layout 只接 2 个参数）→ 常量 10。
 *
 * 探针实测（sb-through-vertical.mjs，test-arrow-through-vertical.xmind）：
 *   root topicSpacing **76**（= 35×60÷35 + 3×4+4）、root baseDown.y = 35 = originY、
 *   轴子节点 pos.x 全是 0、pos.y = 236 / 813 / 1485 / 2188.88 …
 *   （236 = 35 + 76 + 125，125 = -bb.y；813 = 236 + max(452, 577)）
 * 修复后 test-arrow-through-vertical 从 236.6/362/14.9/11.9 → **0/0/0/0**（235/235），
 * 无箭头对照 /tmp/tv-noarrow.xmind 从 191.2/362.2/14.9/11.9 → **0/0/0/0**。
 */

import { describe, it, expect } from 'vitest'
import { timelineThroughVerticalLayoutAlgorithm, DEFAULT_LAYOUT_OPTIONS } from '@tomind/layout'
import type { NodeDesc } from '@tomind/schema'
import { SheetState } from '@tomind/state'
import { StyleEngine } from '@tomind/style'

const node = (
  id: string,
  title: string,
  attrs: Record<string, unknown> = {},
  children: Record<string, readonly NodeDesc[]> = {},
): NodeDesc => ({ id, type: id === 'root' ? 'root' : 'topic', attrs: { title, ...attrs }, children })

/** 4 个叶子轴节点（c0/c2 朝左，c1/c3 朝右） */
const leafDoc = (): NodeDesc =>
  node('root', 'ROOT', {}, { attached: [node('c0', 'A'), node('c1', 'B'), node('c2', 'C'), node('c3', 'D')] })

/** 轴节点带子树：验「整棵委派 logic」而不是「每层各自交替」 */
const subtreeDoc = (): NodeDesc =>
  node('root', 'ROOT', {}, {
    attached: [
      node('c0', 'A', {}, { attached: [node('c0-1', 'A1'), node('c0-2', 'A2')] }),
      node('c1', 'B', {}, { attached: [node('c1-1', 'B1'), node('c1-2', 'B2')] }),
    ],
  })

const lay = (doc: NodeDesc, engine: StyleEngine | null = null, state: SheetState | null = null) =>
  timelineThroughVerticalLayoutAlgorithm.layout(doc, DEFAULT_LAYOUT_OPTIONS, engine, state).nodes

const withStyle = (doc: NodeDesc) => {
  const state = SheetState.create({ doc })
  const engine = new StyleEngine()
  return { engine, state }
}

/** 主题盒原点（shape 中心）—— 叶子无 labels 时 originY = height/2 */
const origin = (nodes: ReturnType<typeof lay>, id: string) => {
  const b = nodes.get(id)!
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}

describe('through-vertical：轴上所有子节点 x 相同（SB getBasePoint 的 x 恒为 0）', () => {
  it('轴子节点的中心 X 与根一致（旧实现按 i%2 左右错开）', () => {
    const nodes = lay(leafDoc())
    const rootCx = origin(nodes, 'root').x
    for (const id of ['c0', 'c1', 'c2', 'c3']) {
      expect(origin(nodes, id).x).toBeCloseTo(rootCx, 6)
    }
  })

  it('子树整棵委派 logic：偶数下标朝左、奇数下标朝右', () => {
    const nodes = lay(subtreeDoc())
    // c0（index 0 → LEFT）：子节点在父盒左侧
    expect(nodes.get('c0-1')!.x + nodes.get('c0-1')!.width).toBeLessThanOrEqual(nodes.get('c0')!.x)
    // c1（index 1 → RIGHT）：子节点在父盒右侧
    expect(nodes.get('c1-1')!.x).toBeGreaterThanOrEqual(nodes.get('c1')!.x + nodes.get('c1')!.width)
  })

  it('同一父的子节点在**同一侧**纵向堆叠（logic），不是各自交替左右', () => {
    const nodes = lay(subtreeDoc())
    // 旧实现：c0-1 在左、c0-2 在右（每层各自 i%2）
    expect(nodes.get('c0-2')!.x).toBeCloseTo(nodes.get('c0-1')!.x, 6)
    expect(nodes.get('c1-2')!.x).toBeCloseTo(nodes.get('c1-1')!.x, 6)
    // 纵向堆叠 → y 不同
    expect(nodes.get('c0-2')!.y).not.toBeCloseTo(nodes.get('c0-1')!.y, 6)
  })
})

describe('through-vertical：双约束 Y 递推（相对原点，不是盒顶）', () => {
  it('index===1 用父的 shapeBounds：Δorigin = max(originY_root + SP + originY_c, h_root + originY_c)', () => {
    const { engine, state } = withStyle(leafDoc())
    const nodes = lay(leafDoc(), engine, state)
    const root = nodes.get('root')!
    const c0 = nodes.get('c0')!
    const sp = topicSpacing(engine, state)
    const topics = root.height / 2 + sp + c0.height / 2
    const bounds = root.height + c0.height / 2
    expect(origin(nodes, 'c0').y - origin(nodes, 'root').y).toBeCloseTo(Math.max(topics, bounds), 6)
  })

  it('index>1 用 prev.boundaryBounds（叶子 = 主题盒）', () => {
    const { engine, state } = withStyle(leafDoc())
    const nodes = lay(leafDoc(), engine, state)
    const c0 = nodes.get('c0')!
    const c1 = nodes.get('c1')!
    const sp = topicSpacing(engine, state)
    const topics = c0.height / 2 + sp + c1.height / 2
    const bounds = c0.height + c1.height / 2
    expect(origin(nodes, 'c1').y - origin(nodes, 'c0').y).toBeCloseTo(Math.max(topics, bounds), 6)
  })

  it('轴上子树不重叠：后一个的原点顶边 ≥ 前一个子树的底边', () => {
    const { engine, state } = withStyle(subtreeDoc())
    const nodes = lay(subtreeDoc(), engine, state)
    const bottomOf = (id: string) =>
      Math.max(...[...nodes.values()].filter((n) => n.x !== undefined && id !== 'root' && n !== nodes.get(id)).map((n) => n.y + n.height))
    void bottomOf
    const c0Sub = ['c0', 'c0-1', 'c0-2'].map((id) => nodes.get(id)!)
    const c1Sub = ['c1', 'c1-1', 'c1-2'].map((id) => nodes.get(id)!)
    const c0Bottom = Math.max(...c0Sub.map((n) => n.y + n.height))
    const c1Top = Math.min(...c1Sub.map((n) => n.y))
    expect(c1Top).toBeGreaterThanOrEqual(c0Bottom - 1e-6)
  })
})

/** SB timelinethroughvertical.getTopicSpacing 的期望值（独立算一遍，防止实现自证） */
function topicSpacing(engine: StyleEngine, state: SheetState): number {
  const spacingMinor = parseInt(String(engine.getStyleValue(state, 'root', 'spacingMinor')), 10)
  const hasArrow = (() => {
    const v = engine.getStyleValue(state, 'root', 'arrowEndClass')
    return typeof v === 'string' && v !== '' && v !== 'none' && v !== 'org.xmind.arrowShape.none'
  })()
  const lineWidth = parseInt(String(engine.getStyleValue(state, 'root', 'lineWidth')), 10) || 0
  const patch = hasArrow ? lineWidth * 4 + 4 : 0
  // centralTopic：designPadding 60、defaultStyles.spacingMinor 35pt
  return (spacingMinor * 60) / 35 + patch
}

describe('through-vertical：TOPIC_SPACING = getTopicSpacing（读得到样式）', () => {
  it('无箭头时轴间距 = spacingMinor × 60 ÷ 35（不是常量 10）', () => {
    const doc = leafDoc()
    const { engine, state } = withStyle(doc)
    expect(topicSpacing(engine, state)).toBe(60)
    const nodes = lay(doc, engine, state)
    // topics 约束生效时：子盒顶 = 父盒底 + SP
    const root = nodes.get('root')!
    const c0 = nodes.get('c0')!
    const topicsWins = root.height / 2 + 60 + c0.height / 2 >= root.height + c0.height / 2
    if (topicsWins) {
      expect(c0.y - (root.y + root.height)).toBeCloseTo(60, 6)
    }
  })

  it('有箭头时补上线尾 patch = lineWidth×4 + LINE_TIMELINE_THROUGH_SPACING(4)', () => {
    // StyleEngine 读的是 attrs.style（扁平 ResolvedStyle，见 style-engine.ts getAttr(node.attrs,'style')）
    const doc = node('root', 'ROOT', { style: { arrowEndClass: 'org.xmind.arrowShape.triangle' } }, {
      attached: [node('c0', 'A'), node('c1', 'B')],
    })
    const { engine, state } = withStyle(doc)
    const sp = topicSpacing(engine, state)
    const lineWidth = parseInt(String(engine.getStyleValue(state, 'root', 'lineWidth')), 10)
    expect(sp).toBe(60 + lineWidth * 4 + 4)
    const nodes = lay(doc, engine, state)
    const root = nodes.get('root')!
    const c0 = nodes.get('c0')!
    const topicsWins = root.height / 2 + sp + c0.height / 2 >= root.height + c0.height / 2
    if (topicsWins) {
      expect(c0.y - (root.y + root.height)).toBeCloseTo(sp, 6)
    }
  })

  it('无 styleEngine 时 SP = 0 → bounds 约束接管：Δorigin = prevH + currOriginY', () => {
    const nodes = lay(leafDoc())
    const c0 = nodes.get('c0')!
    const c1 = nodes.get('c1')!
    // 叶子 boundaryBounds = {y: -h/2, height: h} → offsetYOfBounds = oy0 + h0 + (-oy0) + oy1 = h0 + oy1
    expect(origin(nodes, 'c1').y - origin(nodes, 'c0').y).toBeCloseTo(c0.height + c1.height / 2, 6)
  })
})
