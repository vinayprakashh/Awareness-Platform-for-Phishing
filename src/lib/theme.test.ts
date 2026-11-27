import { describe, expect, it } from 'vitest'
import { normalizeTheme } from './theme'

describe('theme preference', () => {
  it('accepts only explicit light and dark values', () => {
    expect(normalizeTheme('light')).toBe('light')
    expect(normalizeTheme('dark')).toBe('dark')
    expect(normalizeTheme('system')).toBeNull()
    expect(normalizeTheme('')).toBeNull()
    expect(normalizeTheme(null)).toBeNull()
    expect(normalizeTheme(1)).toBeNull()
  })
})
