import { describe, it, expect } from 'vitest'
import { redistributeWeights } from './weightRedistribution'
import { OFFICIAL_WEIGHTS } from '@/data/categories'

describe('redistributeWeights', () => {
  it('maintains sum close to 100', () => {
    const result = redistributeWeights(OFFICIAL_WEIGHTS, '01', 30, new Set())
    const sum = Object.values(result).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(100, 0)
  })

  it('does not modify locked categories', () => {
    const locked = new Set(['07', '04'])
    const result = redistributeWeights(OFFICIAL_WEIGHTS, '01', 30, locked)
    expect(result['07']).toBe(OFFICIAL_WEIGHTS['07'])
    expect(result['04']).toBe(OFFICIAL_WEIGHTS['04'])
  })

  it('distributes delta proportionally', () => {
    const weights = { '01': 50, '02': 30, '03': 20 }
    const result = redistributeWeights(weights, '01', 60, new Set())
    // Delta is +10, distributed among 02 and 03 proportionally
    // 02 share: 30/50 = 0.6, loses 6 → 24
    // 03 share: 20/50 = 0.4, loses 4 → 16
    expect(result['02']).toBeCloseTo(24, 1)
    expect(result['03']).toBeCloseTo(16, 1)
  })

  it('does not produce negative weights', () => {
    const weights = { '01': 90, '02': 5, '03': 5 }
    const result = redistributeWeights(weights, '01', 100, new Set())
    expect(result['02']).toBeGreaterThanOrEqual(0)
    expect(result['03']).toBeGreaterThanOrEqual(0)
  })

  it('handles all adjustable at zero', () => {
    const weights = { '01': 100, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0, '07': 0, '08': 0, '09': 0, '10': 0, '11': 0, '12': 0 }
    const result = redistributeWeights(weights, '01', 90, new Set())
    // -10 delta distributed equally among 11 adjustable categories (all except '01')
    // Each should get 10/11 ≈ 0.909
    expect(result['02']).toBeCloseTo(10 / 11, 1)
    expect(result['03']).toBeCloseTo(10 / 11, 1)
  })

  it('returns original when no adjustable categories exist', () => {
    const weights = { '01': 50, '02': 30, '03': 20, '04': 0, '05': 0, '06': 0, '07': 0, '08': 0, '09': 0, '10': 0, '11': 0, '12': 0 }
    const locked = new Set(['02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'])
    const result = redistributeWeights(weights, '01', 60, locked)
    // All others are locked, should return unchanged
    expect(result).toBe(weights)
  })

  it('handles single unlocked category', () => {
    const weights = { '01': 40, '02': 30, '03': 30 }
    const locked = new Set(['03'])
    const result = redistributeWeights(weights, '01', 50, locked)
    // Only 02 is adjustable, absorbs all delta
    expect(result['02']).toBe(20)
    expect(result['03']).toBe(30)
  })
})
