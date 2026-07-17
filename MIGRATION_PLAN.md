# Snowbrush-V2 迁移计划

> 最后更新：2026-07-16

---

## 现状

| | `packages/core/`（新架构） | `src/`（旧架构） |
|--|--|--|
| 文件数 | 134 | 230 |
| TS 真实错误 | 8 | — |
| 测试 | 71/71 通过 | 无 |
| 依赖 | leafer-ui, mitt | 旧格式转换、旧模型 |

**新架构已有能力**：不可变状态（SheetState）、Tiptap 风格 Extension 系统、ViewDesc 树（24 种节点）、28 个渲染器、布局引擎、样式引擎、命令系统

**旧架构独有**：
- `formats/` — XMind / FreeMind / OPML / Lighten / MindManager / Markdown / MindNode 导入导出
- `models/` — 旧数据模型（TopicModel / SheetModel 等）

---

## Phase 0：地基清理

**目标**：新架构 TS 真实错误归零

| 文件 | 问题 | 修复方式 |
|------|------|----------|
| `extension/starter-kit.ts` | `Extension<{enabled:true}>` vs `Extension<{}>` 泛型不兼容 | `createStarterKit` 返回类型改为 `Extension<any>` |
| `core/matrix-layout.ts:80` | `gChild` 隐式 any | 补参数类型 |
| `extension/extensions/keymap.ts:230` | Object possibly undefined | 加 `?.` 或 fallback |
| `extension/extensions/theme-exporter.ts` | `ThemeExporterOptions` 不满足 `Record<string, unknown>` 约束 | `extends Record<string, unknown>` |
| `assets/lib/markers/index.ts` | 残留索引类型问题 | 检查并补类型 |

**验证**：
```bash
cd packages/core
pnpm typecheck   # 0 errors（不含 TS6133 / TS6196）
pnpm test        # 71/71
```

**预计耗时**：1-2 小时

---

## Phase 1：NodeView 注册解耦

**目标**：移除 `sheet-editor.ts` 中 4 个硬编码 NodeView 注册，拆到独立 Extension

### 步骤

1. 创建 `extensions/topic.ts`
   ```typescript
   export const TopicExtension = createNodeExtension({
     name: 'topic',
     addNodeView() { return TopicNodeViewDesc }
   })
   ```

2. 同理创建 `extensions/relationship.ts`、`extensions/boundary.ts`、`extensions/summary.ts`

3. `sheet-editor.ts` 移除硬编码注册
   ```diff
   - nodeViewDescRegistry.set('topic', TopicNodeViewDesc)
   - nodeViewDescRegistry.set('relationship', RelationshipNodeViewDesc)
   - nodeViewDescRegistry.set('boundary', BoundaryNodeViewDesc)
   - nodeViewDescRegistry.set('summary', SummaryNodeViewDesc)
   ```

4. `StarterKit` 包含这 4 个扩展

**验证**：
```bash
pnpm typecheck   # 0 errors
pnpm test        # 71/71（现有测试不应受影响）
```

**预计耗时**：1 小时

---

## Phase 2：Demo 入口

**目标**：浏览器能看到思维导图渲染

### 步骤

1. 创建 `demo/index.html`（引入 leafer-ui、挂载容器）
2. 创建 `demo/main.ts`（加载 xmind 文件 → 创建 WorkbookEditor → 渲染）
3. 根 `package.json` 加 `"dev": "vite demo"`

### 验证

```bash
pnpm dev
```

浏览器打开后截图验证：

| 检查项 | 预期结果 | 截图位置 |
|--------|----------|----------|
| 页面加载 | 无白屏，canvas 正常渲染 | 整页截图 |
| 节点显示 | 根节点 + 子节点正常显示 | 聚焦根节点区域 |
| 连接线 | 节点间连线可见 | 整页截图 |
| 样式应用 | 节点有背景色、边框、圆角 | 聚焦任意节点 |

**预计耗时**：30 分钟

---

## Phase 3：格式转换迁移

**目标**：把 `src/formats/` 逐格式迁到 `packages/core/` 作为 Extension

### 迁移顺序（复杂度递增）

| 序号 | 格式 | 导入 | 导出 | 复杂度 |
|------|------|------|------|--------|
| 3.1 | OPML | ✅ | ✅ | 低 |
| 3.2 | XMind | ✅ | ✅ | 中 |
| 3.3 | FreeMind | ✅ | ❌ | 低 |
| 3.4 | Markdown | ✅ | ❌ | 低 |
| 3.5 | MindManager | ✅ | ❌ | 中 |
| 3.6 | Lighten | ✅ | ❌ | 低 |
| 3.7 | MindNode | ✅ | ❌ | 低 |

### 每个格式迁移步骤

1. 创建 `extensions/import-{format}.ts`
   - Extension + `addCommands()` 注册导入命令
   - 复制格式转换逻辑，移除旧依赖
2. 写测试验证文件能正确加载
3. 从 `src/formats/` 删除对应文件

### 验证（每个格式）

#### 单元测试
```bash
pnpm typecheck
pnpm test        # 新增格式测试通过
```

#### 截图验证

准备测试文件：`test-fixtures/{format}/sample.{ext}`

| 检查项 | 预期结果 | 截图方式 |
|--------|----------|----------|
| 文件导入 | 节点结构正确解析 | 截图整个思维导图 |
| 节点数量 | 与源文件一致 | 截图 + 控制台日志节点数 |
| 层级关系 | 父子节点正确嵌套 | 截图展开/折叠状态 |
| 样式还原 | 颜色、字体、标记正确 | 对比截图：源文件 vs 渲染结果 |
| 中文支持 | 中文节点正常显示 | 截图含中文节点区域 |

#### 导出验证（OPML/XMind）
```bash
# 导出后重新导入，对比节点结构
pnpm test -- --grep "export"
```

| 检查项 | 预期结果 | 截图方式 |
|--------|----------|----------|
| 导出文件 | 文件可被外部工具打开 | 用 XMind/OPML 编辑器打开截图 |
| 往返测试 | 导入→导出→再导入结构一致 | 截图对比三次渲染结果 |

**预计耗时**：每个格式 1-2 小时

---

## Phase 4：补全 NodeViewDesc

**目标**：补全 AGENTS.md 标记为 stub 的实现

- `LegendNodeViewDesc`
- `MarkerNodeViewDesc`
- 其他 stub

### 验证

| 检查项 | 预期结果 | 截图方式 |
|--------|----------|----------|
| Legend 渲染 | 图例正确显示 | 截图 legend 区域 |
| Marker 渲染 | 标记图标正确显示 | 截图含 marker 的节点 |
| Stub 替换 | 不再返回占位元素 | 截图对比前后效果 |

**预计耗时**：2-3 小时

---

## Phase 5：测试补全

**目标**：覆盖核心路径

| 测试类型 | 工具 | 覆盖范围 |
|----------|------|----------|
| 单元测试 | vitest | 状态管理、转换、布局 |
| 集成测试 | vitest | Extension 组合加载、格式导入导出 |
| E2E 测试 | Playwright | 页面渲染、交互 |
| 性能测试 | vitest | 大文件加载基准 |

### E2E 截图验证清单

| 场景 | 操作 | 截图 |
|------|------|------|
| 初始渲染 | 打开页面 | 整页截图 |
| 节点选中 | 点击节点 | 高亮状态截图 |
| 节点编辑 | 双击节点 | 编辑框截图 |
| 缩放 | 滚轮缩放 | 不同缩放级别截图 |
| 拖拽 | 拖拽节点 | 拖拽中 + 释放后截图 |
| 大文件 | 加载 1000+ 节点文件 | 性能截图（FPS overlay） |

**预计耗时**：1-2 天

---

## Phase 6：清理旧架构

**目标**：删除 `src/` 目录

### 前置条件
- [ ] 所有格式迁移完成（Phase 3）
- [ ] 所有模型迁移完成
- [ ] Demo 功能完整
- [ ] 测试覆盖充分

### 验证

```bash
pnpm typecheck   # 0 errors
pnpm test        # 全部通过
pnpm dev         # 功能完整
rm -rf src/      # 删除旧架构
```

删除后再次验证：
```bash
pnpm typecheck   # 0 errors
pnpm test        # 全部通过
pnpm dev         # 功能完整（截图对比删除前后）
```

---

## 执行时间线

```
Phase 0  ████░░░░░░░░░░░░  地基清理（1-2h）
Phase 1  ░░░░████░░░░░░░░  NodeView 解耦（1h）
Phase 2  ░░░░░░░░██░░░░░░  Demo 入口（30min）
Phase 3  ░░░░░░░░░░████░░  格式迁移（按格式，每个 1-2h）
Phase 4  ░░░░░░░░░░░░░░██  NodeViewDesc 补全（2-3h）
Phase 5  ░░░░░░░░░░░░░░░░  测试补全（1-2d）
Phase 6  ░░░░░░░░░░░░░░░░  清理旧架构（最终）
```

---

## 当前状态

- [x] Monorepo 搭建（turbo + pnpm workspace）
- [x] 代码搬运（snowbrush-v2 → tomind）
- [x] 大部分 TS 错误修复（62 → 8）
- [ ] Phase 0：剩余 8 个 TS 错误
- [ ] Phase 1-6：待执行
