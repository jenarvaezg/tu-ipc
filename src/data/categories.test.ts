import { describe, it, expect } from 'vitest'
import { CATEGORIES, OFFICIAL_WEIGHTS } from './categories'

describe('categories', () => {
  it('has 12 ECOICOP categories', () => {
    expect(CATEGORIES).toHaveLength(12)
  })

  it('each category has required fields', () => {
    for (const cat of CATEGORIES) {
      expect(cat.code).toBeTruthy()
      expect(cat.name).toBeTruthy()
      expect(cat.icon).toBeTruthy()
      expect(cat.officialWeight).toBeGreaterThan(0)
      expect(cat.tooltip).toBeTruthy()
      expect(cat.keywords.length).toBeGreaterThan(0)
    }
  })

  it('has unique category codes', () => {
    const codes = CATEGORIES.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('official weights sum to 100', () => {
    const total = Object.values(OFFICIAL_WEIGHTS).reduce((a, b) => a + b, 0)
    expect(total).toBeCloseTo(100, 0)
  })

  it('OFFICIAL_WEIGHTS has an entry for each category', () => {
    for (const cat of CATEGORIES) {
      expect(OFFICIAL_WEIGHTS[cat.code]).toBeDefined()
      expect(OFFICIAL_WEIGHTS[cat.code]).toBe(cat.officialWeight)
    }
  })
})
