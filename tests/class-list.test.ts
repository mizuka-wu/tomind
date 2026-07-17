/**
 * ClassList 测试
 */

import { describe, it, expect } from 'vitest'
import {
  parseClassList,
  serializeClassList,
  hasClass,
  addClass,
  removeClass,
  toggleClass,
  getClassStyleValue,
  getClassStyles,
} from '@tomind/state'

describe('parseClassList', () => {
  it('should parse class string', () => {
    expect(parseClassList('topic main')).toEqual(['topic', 'main'])
    expect(parseClassList('single')).toEqual(['single'])
    expect(parseClassList('')).toEqual([])
    expect(parseClassList(undefined)).toEqual([])
  })

  it('should handle multiple spaces', () => {
    expect(parseClassList('topic  main')).toEqual(['topic', 'main'])
    expect(parseClassList(' topic main ')).toEqual(['topic', 'main'])
  })
})

describe('serializeClassList', () => {
  it('should serialize class list', () => {
    expect(serializeClassList(['topic', 'main'])).toBe('topic main')
    expect(serializeClassList(['single'])).toBe('single')
    expect(serializeClassList([])).toBe('')
  })
})

describe('hasClass', () => {
  it('should check if class exists', () => {
    const list = ['topic', 'main']
    expect(hasClass(list, 'topic')).toBe(true)
    expect(hasClass(list, 'main')).toBe(true)
    expect(hasClass(list, 'other')).toBe(false)
  })
})

describe('addClass', () => {
  it('should add class', () => {
    expect(addClass([], 'topic')).toEqual(['topic'])
    expect(addClass(['topic'], 'main')).toEqual(['topic', 'main'])
  })

  it('should not add duplicate', () => {
    expect(addClass(['topic'], 'topic')).toEqual(['topic'])
  })

  it('should add at index', () => {
    expect(addClass(['topic'], 'main', 0)).toEqual(['main', 'topic'])
    expect(addClass(['topic'], 'main', 1)).toEqual(['topic', 'main'])
  })

  it('should reject invalid class name', () => {
    expect(addClass(['topic'], '')).toEqual(['topic'])
    expect(addClass(['topic'], 'in valid')).toEqual(['topic'])
  })
})

describe('removeClass', () => {
  it('should remove class', () => {
    expect(removeClass(['topic', 'main'], 'topic')).toEqual(['main'])
    expect(removeClass(['topic', 'main'], 'main')).toEqual(['topic'])
  })

  it('should handle non-existent class', () => {
    expect(removeClass(['topic'], 'other')).toEqual(['topic'])
  })

  it('should handle empty string', () => {
    expect(removeClass(['topic'], '')).toEqual(['topic'])
  })
})

describe('toggleClass', () => {
  it('should toggle class', () => {
    expect(toggleClass(['topic'], 'main')).toEqual(['topic', 'main'])
    expect(toggleClass(['topic', 'main'], 'main')).toEqual(['topic'])
  })
})

describe('getClassStyleValue', () => {
  const theme = {
    topic: { properties: { fill: '#E8F5E9', fontSize: 14 } },
    main: { properties: { fill: '#FF9800', bold: true } },
  }

  it('should get style value', () => {
    expect(getClassStyleValue(['topic'], theme, 'fill')).toBe('#E8F5E9')
    expect(getClassStyleValue(['topic'], theme, 'fontSize')).toBe(14)
  })

  it('should return undefined for non-existent key', () => {
    expect(getClassStyleValue(['topic'], theme, 'color')).toBeUndefined()
  })

  it('should return undefined for non-existent class', () => {
    expect(getClassStyleValue(['other'], theme, 'fill')).toBeUndefined()
  })

  it('should override with later class', () => {
    expect(getClassStyleValue(['topic', 'main'], theme, 'fill')).toBe('#FF9800')
  })

  it('should handle empty classList', () => {
    expect(getClassStyleValue([], theme, 'fill')).toBeUndefined()
  })

  it('should handle undefined theme', () => {
    expect(getClassStyleValue(['topic'], undefined, 'fill')).toBeUndefined()
  })
})

describe('getClassStyles', () => {
  const theme = {
    topic: { properties: { fill: '#E8F5E9', fontSize: 14 } },
    main: { properties: { fill: '#FF9800', bold: true } },
  }

  it('should get all styles', () => {
    expect(getClassStyles(['topic'], theme)).toEqual({ fill: '#E8F5E9', fontSize: 14 })
  })

  it('should merge styles from multiple classes', () => {
    expect(getClassStyles(['topic', 'main'], theme)).toEqual({
      fill: '#FF9800',
      fontSize: 14,
      bold: true,
    })
  })

  it('should handle empty classList', () => {
    expect(getClassStyles([], theme)).toEqual({})
  })

  it('should handle undefined theme', () => {
    expect(getClassStyles(['topic'], undefined)).toEqual({})
  })
})
