# AGENTS.md — tomind monorepo

## 包体命名规范

使用 npm scope `@tomind/`，命名规则：

| 位置 | 命名格式 | 示例 |
|------|----------|------|
| `packages/` 下 | `@tomind/<名称>` | `@tomind/state`, `@tomind/view` |
| `packages/extensions/` 下拆分时 | `@tomind/extension-<名称>` | `@tomind/extension-keymap` |
| `startkits/` 下 | `@tomind/starter-<名称>` | `@tomind/starter-vanilla` |
| `apps/` 下 | `@tomind/app-<名称>` | `@tomind/app-demo` |

**规则**：
- 全小写，单词间用连字符 `-` 分隔
- `@tomind/xxx` 是独立功能包
- `@tomind/extension-xxx` 是从 extensions 合集拆出的单个扩展
- `@tomind/starter-xxx` 是预装包，组合 core + extensions

## 项目结构

```
tomind/
├── packages/
│   ├── schema/               # @tomind/schema — NodeDesc, SelectionState, Viewport 类型
│   ├── state/                # @tomind/state — SheetState, Transaction, Transform, Step
│   ├── view/                 # @tomind/view — ViewDesc, NodeViewDesc, PartViewDesc
│   ├── layout/               # @tomind/layout — 布局引擎（layout, matrixLayout）
│   ├── style/                # @tomind/style — 样式系统（StyleEngine, ThemePackage）
│   ├── assets/               # @tomind/assets — 资源处理
│   ├── extension/            # @tomind/extension — Extension 系统（createExtension, types, manager）
│   ├── commands/             # @tomind/commands — CommandDef, CommandManager
│   ├── editor/               # @tomind/editor — SheetEditor, CommandChain
│   ├── xap/                  # @tomind/xap — XAP 格式
│   ├── extensions/           # @tomind/extensions — 具体扩展合集
│   │   └── src/
│   │       ├── keymap.ts
│   │       ├── viewport.ts
│   │       ├── selection.ts
│   │       ├── relationship.ts
│   │       ├── theme-exporter.ts
│   │       └── ... (20+ 扩展)
│   │
├── startkits/
│   └── vanilla/              # @tomind/starter-vanilla — 默认预装包
│       └── src/index.ts
│
├── tests/                    # 集成测试（与 packages/ 同级）
├── apps/                     # 应用层（demo、编辑器等）
├── docs/                     # 架构文档
├── pnpm-workspace.yaml       # packages/* + startkits/* + apps/*
└── turbo.json
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

## 开发命令

```bash
pnpm typecheck    # 类型检查（turbo 并行）
pnpm test         # 测试（vitest）
pnpm build        # 构建（turbo）
```

## TypeScript 规范

- 严格模式（`strict: true`）
- 禁止 `as` 类型断言 — 用类型守卫、泛型或精确类型定义
- 核心类型错误必须真正修复，不绕过
- TS6133（未使用变量）暂不处理，后续统一清理

## 测试规范

- 测试框架：vitest
- 测试文件位于根目录 `tests/` 目录（与 `packages/`、`startkits/` 同级）
- 运行方式：`pnpm test`（根目录 vitest.config.ts 配置了 @tomind/* 包的 resolve alias）
- 修完 bug 后跑两遍 review（先修明显问题，再深挖隐藏 bug）

## 工作流偏好

- 收到消息先回复「收到」+ 复述需求
- 小步增量改动，每次改完通过验证
- 保守渐进优于激进重写
- 发现 bug 直接修不问
