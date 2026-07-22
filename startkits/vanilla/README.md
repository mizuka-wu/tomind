# @tomind/starter-vanilla

默认预装包：组合 core + 所有内置扩展。

## 用法

```ts
import { createVanillaStarter } from '@tomind/starter-vanilla'

const editor = createVanillaStarter({
  container: document.getElementById('app'),
})
```

## 包含的扩展

- KeymapExtension
- ViewportExtension
- SelectDragExtension
- MouseBoxSelectExtension
- DropExtension
- ContextMenuExtension
- ResizeBoxExtension
- TopicSelectBoxExtension
- SelectBoxExtension
- RelationshipExtension
- EditBridgeExtension
- ThemeExporterExtension
- MatrixExtension
- 等 20+ 扩展

## 依赖

- `@tomind/editor`
- `@tomind/extensions`
- `@tomind/schema`
- `@tomind/state`
- `@tomind/view`
- `@tomind/layout`
- `@tomind/style`
- `@tomind/assets`
- `@tomind/extension`
- `@tomind/commands`
- `@tomind/plugins`
