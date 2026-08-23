/**
 * Numbering 工具函数和常量
 *
 * 对齐 snowbrush NUMBERFORMAT / NUMBERSEPARATOR + getNumberText
 */

// ==================== 常量 ====================

/** 编号格式（XMind URI） */
export const NUMBERFORMAT = {
  NONE: 'org.xmind.numbering.none',
  ARABIC: 'org.xmind.numbering.arabic',
  ROMAN: 'org.xmind.numbering.roman',
  LOWERCASE: 'org.xmind.numbering.lowercase',
  UPPERCASE: 'org.xmind.numbering.uppercase',
} as const

/** 编号分隔符（XMind URI） */
export const NUMBERSEPARATOR = {
  COMMA: 'org.xmind.numbering.separator.comma',
  DOT: 'org.xmind.numbering.separator.dot',
  HYPHEN: 'org.xmind.numbering.separator.hyphen',
  DASH: 'org.xmind.numbering.separator.dash',
  OBLIQUE: 'org.xmind.numbering.separator.oblique',
} as const

/** 分隔符常量 → 实际字符映射 */
export const SEPARATOR_MAP: ReadonlyMap<string, string> = new Map([
  [NUMBERSEPARATOR.COMMA, ','],
  [NUMBERSEPARATOR.DOT, '.'],
  [NUMBERSEPARATOR.HYPHEN, '-'],
  [NUMBERSEPARATOR.DASH, '_'],
  [NUMBERSEPARATOR.OBLIQUE, '/'],
])

// ==================== 数字转换 ====================

/**
 * 数字转罗马数字（对齐 snowbrush Util.getNumberText ROMAN 分支）
 *
 * toRoman(1) → "I", toRoman(4) → "IV", toRoman(9) → "IX"
 */
export function toRoman(n: number): string {
  if (n <= 0) return ''
  const mapping: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let result = ''
  let remaining = n
  for (const [value, numeral] of mapping) {
    const count = Math.floor(remaining / value)
    for (let i = 0; i < count; i++) {
      result += numeral
    }
    remaining = remaining % value
  }
  return result
}

/**
 * 数字转字母（对齐 snowbrush Util.getNumberText LOWERCASE/UPPERCASE 分支）
 *
 * toAlpha(1, false) → "a", toAlpha(26, false) → "z", toAlpha(27, false) → "aa"
 * toAlpha(1, true) → "A", toAlpha(26, true) → "Z", toAlpha(27, true) → "AA"
 */
export function toAlpha(n: number, upper: boolean): string {
  if (n <= 0) return ''
  const ordA = upper ? 65 : 97 // 'A'.charCodeAt(0) or 'a'.charCodeAt(0)
  const len = 26
  let result = ''
  let index = n
  while (index > 0) {
    index-- // 0-based
    result = String.fromCharCode((index % len) + ordA) + result
    index = Math.floor(index / len)
  }
  return result
}

/**
 * 根据格式将 1-based index 转为编号字符串（对齐 snowbrush Util.getNumberText）
 *
 * getNumberText('org.xmind.numbering.arabic', 1) → "1"
 * getNumberText('org.xmind.numbering.roman', 3) → "III"
 * getNumberText('org.xmind.numbering.lowercase', 1) → "a"
 * getNumberText('org.xmind.numbering.uppercase', 27) → "AA"
 * getNumberText('org.xmind.numbering.none', 1) → ""
 */
export function getNumberText(format: string, index: number): string {
  switch (format) {
    case NUMBERFORMAT.ARABIC:
      return String(index)
    case NUMBERFORMAT.ROMAN:
      return toRoman(index)
    case NUMBERFORMAT.LOWERCASE:
      return toAlpha(index, false)
    case NUMBERFORMAT.UPPERCASE:
      return toAlpha(index, true)
    case NUMBERFORMAT.NONE:
    default:
      return ''
  }
}
