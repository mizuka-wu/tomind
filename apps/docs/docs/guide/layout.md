# 布局引擎

## 坐标系

LeaferJS 坐标系：**每个节点的 (x, y) 相对于父节点的 (0, 0)**

```
ROOT (0, 0)
└── centralTopic (rootOffsetX, 0)
    ├── mainTopic1 (parentWidth + gap, offset)
    │   ├── subTopic1 (parentWidth + gap, offset)
    │   └── subTopic2 (parentWidth + gap, offset)
    └── mainTopic2 (parentWidth + gap, offset)
```

## 使用

```ts
import { layoutTree, DEFAULT_LAYOUT_OPTIONS } from '@tomind/layout'

const result = layoutTree(doc, DEFAULT_LAYOUT_OPTIONS)
// result.nodes: Map<string, NodeLayout>
// result.totalWidth: number
// result.totalHeight: number
```

## 布局选项

```ts
interface LayoutOptions {
  horizontalGap: number    // 父子节点水平间距 (默认 40)
  verticalGap: number      // 兄弟节点垂直间距 (默认 10)
  nodePadding: {
    top: number            // 默认 8
    right: number          // 默认 16
    bottom: number         // 默认 8
    left: number           // 默认 16
  }
  rootOffsetX: number      // 根节点水平偏移 (默认 50)
  lineHeight: number       // 文字行高 (默认 20)
  charWidthFactor: number  // 字符宽度系数 (默认 0.6)
}
```

## 支持的布局类型

- Tree（树形：左/右/双向）
- Map（径向：顺时针/逆时针/不平衡）
- OrgChart（组织图：上/下/双向）
- Timeline（时间线：水平/垂直）
- Spreadsheet（矩阵/电子表格）
- Fishbone（鱼骨图）
- Brace（括号图）
- TreeTable（树表）
