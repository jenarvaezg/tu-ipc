import { describe, expect, it } from 'vitest'
import {
  buildAccumulatedSeries,
  computeAccumulatedAtMonth,
  computeAccumulatedInflation,
  computeGeneralBenchmark,
  type IndexPoint,
} from './accumulatedInflation'

const points: IndexPoint[] = [
  { month: '2001-12', value: 99 },
  { month: '2002-01', value: 100 },
  { month: '2002-02', value: 102 },
  { month: '2002-03', value: 98 },
]

describe('accumulatedInflation', () => {
  it('computes accumulated inflation from index values', () => {
    expect(computeAccumulatedInflation(100, 120)).toBeCloseTo(20, 5)
    expect(computeAccumulatedInflation(100, 80)).toBeCloseTo(-20, 5)
  })

  it('returns null when base or target index are invalid', () => {
    expect(computeAccumulatedInflation(0, 120)).toBeNull()
    expect(computeAccumulatedInflation(100, 0)).toBeNull()
    expect(computeAccumulatedInflation(Number.NaN, 120)).toBeNull()
  })

  it('computes accumulated value for a target month', () => {
    const result = computeAccumulatedAtMonth(points, '2002-01', '2002-02')
    expect(result).toBeCloseTo(2, 5)
  })

  it('returns null when base or target month are missing', () => {
    expect(computeAccumulatedAtMonth(points, '2000-01', '2002-02')).toBeNull()
    expect(computeAccumulatedAtMonth(points, '2002-01', '2099-01')).toBeNull()
  })

  it('builds accumulated series from base month onward', () => {
    const series = buildAccumulatedSeries(points, '2002-01')
    expect(series.map(item => item.month)).toEqual(['2002-01', '2002-02', '2002-03'])
    expect(series[0].value).toBeCloseTo(0, 5)
    expect(series[1].value).toBeCloseTo(2, 5)
    expect(series[2].value).toBeCloseTo(-2, 5)
  })

  it('uses explicit timeline and marks missing months as null', () => {
    const series = buildAccumulatedSeries(points, '2002-01', ['2002-01', '2002-02', '2002-04'])
    expect(series.map(item => item.month)).toEqual(['2002-01', '2002-02', '2002-04'])
    expect(series[0].value).toBeCloseTo(0, 5)
    expect(series[1].value).toBeCloseTo(2, 5)
    expect(series[2].value).toBeNull()
  })

  it('returns empty series when base month is not present', () => {
    expect(buildAccumulatedSeries(points, '1999-01')).toEqual([])
  })

  it('computes general benchmark as accumulated value at end month', () => {
    const benchmark = computeGeneralBenchmark(points, '2002-01', '2002-03')
    expect(benchmark).toBeCloseTo(-2, 5)
  })
})
