# @tomind/core

统一入口 barrel 包（向后兼容）。新代码请直接从子包导入。

## 重新导出

所有子包的导出通过此包统一暴露：

```ts
// 推荐：直接从子包导入
import { SheetState } from '@tomind/state'
import { TopicNodeViewDesc } from '@tomind/view'

// 兼容：从 core 导入（不推荐）
import { SheetState, TopicNodeViewDesc } from '@tomind/core'
```

## 依赖

所有 `@tomind/*` 子包。
