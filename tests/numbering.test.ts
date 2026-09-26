import { describe, it, expect } from 'vitest'
import { getNumberText, NUMBERFORMAT, NUMBERSEPARATOR, SEPARATOR_MAP, toRoman, toAlpha } from '../packages/schema/src/numbering-utils'

describe('numbering utils', () => {
  it('formats arabic/roman/letters', () => {
    expect(getNumberText(NUMBERFORMAT.ARABIC, 1)).toBe('1')
    expect(getNumberText(NUMBERFORMAT.ROMAN, 3)).toBe('III')
    expect(getNumberText(NUMBERFORMAT.LOWERCASE, 1)).toBe('a')
    expect(getNumberText(NUMBERFORMAT.UPPERCASE, 27)).toBe('AA')
    expect(getNumberText(NUMBERFORMAT.NONE, 1)).toBe('')
  })
  it('maps separators', () => {
    expect(SEPARATOR_MAP.get(NUMBERSEPARATOR.DOT)).toBe('.')
    expect(SEPARATOR_MAP.get(NUMBERSEPARATOR.OBLIQUE)).toBe('/')
    expect(SEPARATOR_MAP.get(NUMBERSEPARATOR.COMMA)).toBe(',')
    expect(SEPARATOR_MAP.get(NUMBERSEPARATOR.HYPHEN)).toBe('-')
    expect(SEPARATOR_MAP.get(NUMBERSEPARATOR.DASH)).toBe('_')
  })
  it('roman and alpha helpers', () => {
    expect(toRoman(4)).toBe('IV')
    expect(toRoman(9)).toBe('IX')
    expect(toAlpha(1, false)).toBe('a')
    expect(toAlpha(2, true)).toBe('B')
  })
})
