/**
 * 使用 Zod 定义 Command 的 inputSchema/outputSchema
 *
 * 优势：
 * 1. 类型安全：Zod schema 自动生成 TypeScript 类型
 * 2. 运行时验证：可以验证输入输出是否符合 schema
 * 3. JSON Schema 转换：可以将 Zod schema 转换为 JSON Schema，方便对接 AI
 * 4. 文档生成：可以从 schema 自动生成文档
 */

import { z } from 'zod'

// ==================== 基础 Schema 定义 ====================

/** 节点 ID Schema */
export const NodeIdSchema = z.string().describe('节点 ID')

/** 标题 Schema */
export const TitleSchema = z.string().optional().describe('节点标题（可选）')

/** 位置 Schema */
export const PositionSchema = z.object({
  x: z.number().describe('X 坐标'),
  y: z.number().describe('Y 坐标'),
}).describe('位置')

/** 尺寸 Schema */
export const SizeSchema = z.object({
  width: z.number().describe('宽度'),
  height: z.number().describe('高度'),
}).describe('尺寸')

// ==================== Command Input/Output Schema ====================

/** 添加子节点命令 */
export const AddChildInputSchema = z.object({
  nodeId: NodeIdSchema.optional().describe('父节点 ID（不传则用选中节点）'),
  title: TitleSchema,
}).describe('添加子节点参数')

export const AddChildOutputSchema = z.object({
  newId: z.string().describe('新节点 ID'),
}).describe('添加子节点结果')

/** 添加同级节点命令 */
export const AddSiblingInputSchema = z.object({
  nodeId: NodeIdSchema.optional().describe('参考节点 ID（不传则用选中节点）'),
  title: TitleSchema,
}).describe('添加同级节点参数')

export const AddSiblingOutputSchema = z.object({
  newId: z.string().describe('新节点 ID'),
}).describe('添加同级节点结果')

/** 删除节点命令 */
export const DeleteNodeInputSchema = z.object({
  nodeIds: z.array(NodeIdSchema).optional().describe('要删除的节点 ID 列表（不传则用选中节点）'),
}).describe('删除节点参数')

export const DeleteNodeOutputSchema = z.object({
  deletedIds: z.array(NodeIdSchema).describe('已删除的节点 ID 列表'),
}).describe('删除节点结果')

/** 修改标题命令 */
export const ChangeTitleInputSchema = z.object({
  nodeId: NodeIdSchema.optional().describe('节点 ID（不传则用选中节点）'),
  title: z.string().describe('新标题'),
}).describe('修改标题参数')

export const ChangeTitleOutputSchema = z.object({
  nodeId: NodeIdSchema.describe('节点 ID'),
  oldTitle: z.string().describe('旧标题'),
  newTitle: z.string().describe('新标题'),
}).describe('修改标题结果')

/** 修改样式命令 */
export const ChangeStyleInputSchema = z.object({
  nodeIds: z.array(NodeIdSchema).optional().describe('节点 ID 列表（不传则用选中节点）'),
  style: z.record(z.unknown()).describe('样式属性'),
}).describe('修改样式参数')

export const ChangeStyleOutputSchema = z.object({
  nodeIds: z.array(NodeIdSchema).describe('已修改的节点 ID 列表'),
}).describe('修改样式结果')

/** 折叠/展开命令 */
export const CollapseInputSchema = z.object({
  nodeId: NodeIdSchema.optional().describe('节点 ID（不传则用选中节点）'),
  collapsed: z.boolean().optional().describe('折叠状态（不传则切换）'),
}).describe('折叠/展开参数')

export const CollapseOutputSchema = z.object({
  nodeId: NodeIdSchema.describe('节点 ID'),
  collapsed: z.boolean().describe('折叠状态'),
}).describe('折叠/展开结果')

/** 选择节点命令 */
export const SelectNodeInputSchema = z.object({
  nodeIds: z.array(NodeIdSchema).describe('要选择的节点 ID 列表'),
  addToSelection: z.boolean().optional().describe('是否添加到现有选区'),
}).describe('选择节点参数')

export const SelectNodeOutputSchema = z.object({
  selectedIds: z.array(NodeIdSchema).describe('已选择的节点 ID 列表'),
}).describe('选择节点结果')

/** 导航命令 */
export const NavigateInputSchema = z.object({
  direction: z.enum(['up', 'down', 'left', 'right']).describe('导航方向'),
  extend: z.boolean().optional().describe('是否扩展选区'),
}).describe('导航参数')

export const NavigateOutputSchema = z.object({
  nodeId: NodeIdSchema.optional().describe('导航到的节点 ID'),
}).describe('导航结果')

/** 缩放命令 */
export const ZoomInputSchema = z.object({
  factor: z.number().describe('缩放因子（>1 放大，<1 缩小）'),
  center: PositionSchema.optional().describe('缩放中心点'),
}).describe('缩放参数')

export const ZoomOutputSchema = z.object({
  zoom: z.number().describe('新缩放比例'),
}).describe('缩放结果')

/** 平移命令 */
export const PanInputSchema = z.object({
  delta: PositionSchema.describe('平移量'),
}).describe('平移参数')

export const PanOutputSchema = z.object({
  position: PositionSchema.describe('新位置'),
}).describe('平移结果')

// ==================== Schema 转换工具 ====================

/**
 * 将 Zod schema 转换为 JSON Schema（MCP 兼容格式）
 */
export function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  // 这里需要使用 zod-to-json-schema 库
  // 或者手动实现转换逻辑
  // 简化版本：返回基本结构
  return {
    type: 'object',
    properties: {},
    required: [],
  }
}

/**
 * 从 Zod schema 创建 CommandDef
 */
export function defineCommandWithZod<TInput extends z.ZodType, TOutput extends z.ZodType>(config: {
  name: string
  description: string
  inputSchema: TInput
  outputSchema?: TOutput
  category?: string
  tags?: string[]
  execute: (params: z.infer<TInput>, state: any, dispatch?: (tr: any) => void) => {
    success: boolean
    data?: z.infer<TOutput>
    error?: string
  }
}) {
  return {
    name: config.name,
    description: config.description,
    inputSchema: zodToJsonSchema(config.inputSchema),
    outputSchema: config.outputSchema ? zodToJsonSchema(config.outputSchema) : undefined,
    category: config.category,
    tags: config.tags,
    execute: config.execute,
  }
}
