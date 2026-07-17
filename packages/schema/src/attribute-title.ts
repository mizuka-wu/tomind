/**
 * AttributeTitle 富文本格式
 *
 * 从 y-mindmap/packages/core/src/types/topic.ts 直接迁移
 * 用于 topic/relationship/boundary/summary 的标题
 */

// ==================== 类型定义 ====================

export type AttributeTitle = AttributeTitleUnit[]

export interface AttributeTitleStyle {
  'fo:font-family'?: string
  'fo:font-weight'?: string | number
  'fo:font-style'?: string
  'fo:font-size'?: string | number
  'fo:color'?: string
  'fo:text-decoration'?: string
  'fo:background-color'?: string
}

export interface AttributeTitleUnit extends Partial<AttributeTitleStyle> {
  text: string
  href?: string
  embedLink?: string
  embedLinkIcon?: string
  mention?: string
  formula?: string
}

// ==================== 工具函数 ====================

export function isAttributeTitleEmpty(title: AttributeTitle | undefined): boolean {
  return !title || title.length === 0
}

export function isRichAttributeTitle(title: AttributeTitle | undefined): boolean {
  if (!title || title.length === 0) return false
  return title.some(unit => {
    const keys = Object.keys(unit).filter(k => k !== 'text')
    return keys.length > 0
  })
}

export function getPlainTextFromAttributeTitle(title: AttributeTitle | undefined): string {
  if (!title || title.length === 0) return ''
  return title.map(unit => unit.text).join('')
}

export function createAttributeTitleFromPlainText(text: string): AttributeTitle {
  if (!text) return [{ text: '' }]
  return [{ text }]
}

export function createAttributeTitleUnit(
  text: string,
  styles?: Partial<AttributeTitleStyle>,
  extras?: Partial<Omit<AttributeTitleUnit, 'text' | keyof AttributeTitleStyle>>
): AttributeTitleUnit {
  return {
    text,
    ...styles,
    ...extras,
  }
}

export function normalizeAttributeTitle(
  title: AttributeTitle | undefined,
  plainTitle: string
): { title: string; attributeTitle: AttributeTitle } {
  if (isAttributeTitleEmpty(title)) {
    return { title: plainTitle, attributeTitle: createAttributeTitleFromPlainText(plainTitle) }
  }
  return {
    title: getPlainTextFromAttributeTitle(title),
    attributeTitle: title as AttributeTitle,
  }
}

export function isEqualAttributeTitle(
  a: AttributeTitle | undefined,
  b: AttributeTitle | undefined
): boolean {
  if (a === b) return true
  if (!a && !b) return true
  if (!a || !b) return false
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    const unitA = a[i]!
    const unitB = b[i]!

    if (unitA.text !== unitB.text) return false
    if (unitA.href !== unitB.href) return false
    if (unitA.formula !== unitB.formula) return false
    if (unitA.embedLink !== unitB.embedLink) return false
    if (unitA.mention !== unitB.mention) return false

    const styleKeys: (keyof AttributeTitleStyle)[] = [
      'fo:font-family', 'fo:font-weight', 'fo:font-style',
      'fo:font-size', 'fo:color', 'fo:text-decoration', 'fo:background-color',
    ]

    for (const key of styleKeys) {
      if (unitA[key] !== unitB[key]) return false
    }
  }

  return true
}

export function extractGlobalStyle(title: AttributeTitle | undefined): Partial<AttributeTitleStyle> | undefined {
  if (!title || title.length === 0) return undefined

  const globalStyle: Partial<AttributeTitleStyle> = {}
  let hasGlobalStyle = false

  const firstUnit: AttributeTitleUnit | undefined = title[0]
  if (!firstUnit) return undefined

  const checkKey = (key: keyof AttributeTitleStyle) => {
    const firstValue = firstUnit[key]
    if (firstValue === undefined) return

    const allSame = title.every(unit => unit[key] === firstValue)
    if (allSame) {
      (globalStyle as any)[key] = firstValue
      hasGlobalStyle = true
    }
  }

  checkKey('fo:font-family')
  checkKey('fo:font-weight')
  checkKey('fo:font-style')
  checkKey('fo:font-size')
  checkKey('fo:color')
  checkKey('fo:text-decoration')
  checkKey('fo:background-color')

  return hasGlobalStyle ? globalStyle : undefined
}

export function removeGlobalStyleFromAttributeTitle(
  title: AttributeTitle,
  globalStyle: Partial<AttributeTitleStyle>
): AttributeTitle {
  const styleKeys = Object.keys(globalStyle) as (keyof AttributeTitleStyle)[]

  return title.map(unit => {
    const newUnit = { ...unit }
    for (const key of styleKeys) {
      delete newUnit[key]
    }
    return newUnit
  })
}

// ==================== 辅助函数 ====================

/**
 * 获取节点的标题纯文本
 * 优先取 attributeTitle 的纯文本，fallback 到 title
 */
export function getTitleText(attrs: Record<string, unknown>): string {
  const attributeTitle = attrs.attributeTitle as AttributeTitle | undefined
  if (attributeTitle && attributeTitle.length > 0) {
    return getPlainTextFromAttributeTitle(attributeTitle)
  }
  return (attrs.title as string) ?? ''
}

/**
 * 获取节点的 attributeTitle
 * 必定返回 AttributeTitle（不返回 undefined）
 * 如果没有 attributeTitle，从 title 创建 [{ text: title原文 }]
 */
export function getAttributeTitle(attrs: Record<string, unknown>): AttributeTitle {
  const attributeTitle = attrs.attributeTitle as AttributeTitle | undefined
  if (attributeTitle && attributeTitle.length > 0) {
    return attributeTitle
  }
  const plainTitle = (attrs.title as string) ?? ''
  return createAttributeTitleFromPlainText(plainTitle)
}
