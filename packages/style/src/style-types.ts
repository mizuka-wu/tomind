/**
 * 样式系统核心类型
 *
 * 设计原则：
 * 1. 样式值是纯数据 — 带单位的字符串（"16pt"）、颜色（"#ff0000"）、数字等
 * 2. inherit 支持 — null/undefined 表示继承父级，不设置默认值
 * 3. 两层分离 — StyleEngine 计算 ResolvedStyle，NodeView 转 LeaferJS 属性
 */

/** 样式值类型 — 可以是任意数据类型 */
export type StyleValue = string | number | boolean | null | undefined

/** 解析后的样式对象（camelCase 键名，纯数据） */
export interface ResolvedStyle {
  // 填充
  fillColor?: StyleValue        // "#ff0000" | "inherit"
  fillPattern?: StyleValue      // "solid" | "hachure" | ...
  fillGradient?: StyleValue     // "linear(...)" | null
  // 边框
  borderColor?: StyleValue
  borderWidth?: StyleValue
  borderPattern?: StyleValue
  // 线条
  lineColor?: StyleValue
  lineWidth?: StyleValue
  linePattern?: StyleValue
  lineCorner?: StyleValue
  lineClass?: StyleValue        // "curve" | "elbow" | "roundedElbow" | ...
  lineTapered?: StyleValue      // "tapered" | "none"
  // 形状
  shapeClass?: StyleValue       // "roundedRect" | "ellipse" | "underline" | ...
  shapeCorner?: StyleValue
  // 字体
  fontFamily?: StyleValue       // "Helvetica, Arial, sans-serif"
  fontSize?: StyleValue         // "16pt"
  fontStyle?: StyleValue        // "normal" | "italic"
  fontWeight?: StyleValue       // "normal" | "bold"
  fontColor?: StyleValue        // "#333333"
  textTransform?: StyleValue    // "manual" | "capitalize" | "uppercase" | "lowercase"
  textDecoration?: StyleValue   // "none" | "underline" | "line-through"
  textAlign?: StyleValue        // "left" | "center" | "right"
  textBackgroundColor?: StyleValue
  // 间距
  marginLeft?: StyleValue
  marginRight?: StyleValue
  marginTop?: StyleValue
  marginBottom?: StyleValue
  spacingMajor?: StyleValue
  spacingMinor?: StyleValue
  // 箭头
  arrowEndClass?: StyleValue
  arrowBeginClass?: StyleValue
  // 其他
  opacity?: StyleValue
  structureClass?: StyleValue
  // Callout 专用
  calloutFillColor?: StyleValue
  calloutLineClass?: StyleValue
  calloutLineCorner?: StyleValue
  calloutLinePattern?: StyleValue
  calloutLineWidth?: StyleValue
  calloutShapeClass?: StyleValue
  calloutLineColor?: StyleValue
  // 多线颜色
  multiLineColors?: StyleValue  // "none" | "#ff0000 #00ff00 #0000ff"
  // 扩展
  [key: string]: StyleValue
}

/** 主题数据结构 — 类名 → 样式属性 */
export interface ThemeData {
  [className: string]: {
    id?: string
    properties: Record<string, StyleValue>
  }
}

/** 节点类型（决定样式类名） */
export type NodeType =
  | 'centralTopic'
  | 'mainTopic'
  | 'subTopic'
  | 'floatingTopic'
  | 'calloutTopic'
  | 'summaryTopic'
  | 'boundary'
  | 'summary'
  | 'relationship'
  | 'map'

/** 样式计算选项 */
export interface StyleComputeOptions {
  /** 忽略用户样式 */
  ignoreUser?: boolean
  /** 忽略父级继承 */
  ignoreParent?: boolean
  /** 忽略主题样式 */
  ignoreTheme?: boolean
  /** 忽略默认样式 */
  ignoreDefault?: boolean
  /** 指定类名覆盖（不自动推断） */
  className?: NodeType
  /** 临时主题覆盖（不修改全局） */
  themeOverride?: ThemeData
}
