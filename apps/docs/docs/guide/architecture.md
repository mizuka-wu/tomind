# 架构设计

## 核心数据流

```
输入（XMind/FreeMind/OPML 文件）
    ↓ formatconverter.fromXMind()
旧 Model (TopicModel/SheetModel)
    ↓ modelToState()
SheetState { doc: NodeDesc, selection, viewport }
    ↓ SheetEditor.dispatch(tr)
Transaction → Step 序列 → 新 SheetState
    ↓ ViewDesc.update(state)
LeaferJS 渲染 (Group/Rect/Text)
    ↓ LayoutEngine.compute()
坐标定位
    ↓ StyleEngine.computeStyle()
样式应用
```

## 目录结构

```
tomind/
├── packages/
│   ├── schema/          # 类型定义
│   ├── state/           # 不可变状态管理
│   ├── view/            # ViewDesc 树 + 渲染器
│   ├── layout/          # 布局引擎
│   ├── style/           # 样式引擎
│   ├── extension/       # 扩展系统
│   ├── commands/        # 命令系统
│   ├── editor/          # 编辑器主类
│   ├── extensions/      # 内置扩展集合
│   ├── plugins/         # 插件系统
│   ├── assets/          # 资源处理
│   ├── xap/             # XAP 格式
│   └── core/            # 统一入口 barrel
├── startkits/
│   └── vanilla/         # 默认预装包
├── apps/
│   ├── demo/            # 浏览器演示
│   └── docs/            # VitePress 文档站
└── tests/               # 集成测试
```

## 依赖方向

```
@tomind/starter-vanilla
  ├── @tomind/extensions ──→ @tomind/extension
  │                        ──→ @tomind/schema
  │                        ──→ @tomind/state
  │                        ──→ @tomind/view
  │                        ──→ @tomind/layout
  │                        ──→ @tomind/style
  │                        ──→ @tomind/assets
  │                        ──→ leafer-ui
  └── @tomind/extension
      @tomind/editor ──→ @tomind/state, @tomind/view, @tomind/extension, @tomind/commands
      @tomind/commands ──→ @tomind/state
```

**原则**：单向依赖，低层包不依赖上层。
