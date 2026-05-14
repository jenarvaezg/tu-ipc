import { describe, it, expect } from 'vitest'
import type { RubricaSeries } from '@/data/rubricasTypes'
import {
  getSuggestedSelection,
  MAX_SUGGESTED_SERIES,
} from './getSuggestedSelection'

function makeSeries(
  id: string,
  codigo: string,
  points: Array<[string, number]>,
): RubricaSeries {
  return {
    id,
    ineSeriesCode: `IPC${id}`,
    variableId: 764,
    level: 'clase',
    rubricaId: Number(id.split(':')[1] ?? 0),
    parentRubricaId: undefined,
    codigo,
    nombre: `Clase ${codigo}`,
    firstMonth: points[0]?.[0] ?? '',
    lastMonth: points[points.length - 1]?.[0] ?? '',
    hasBaseMonth: points.some(([m]) => m === '2002-01'),
    points: points.map(([month, value]) => ({ month, value })),
  }
}

const START = '2002-01'
const END = '2024-12'

const SERIES: RubricaSeries[] = [
  // Big swing in category 04 (vivienda): +60% accumulated.
  makeSeries('764:1', '04.5', [
    [START, 100],
    [END, 160],
  ]),
  // Smaller swing in category 04: +10%.
  makeSeries('764:2', '04.1', [
    [START, 100],
    [END, 110],
  ]),
  // Category 01 (alimentos): +50%.
  makeSeries('764:3', '01.1', [
    [START, 100],
    [END, 150],
  ]),
  // Category 07 (transporte): +20%.
  makeSeries('764:4', '07.2', [
    [START, 100],
    [END, 120],
  ]),
  // Category 09 (ocio): +5%.
  makeSeries('764:5', '09.4', [
    [START, 100],
    [END, 105],
  ]),
  // ECOICOP v2 code starting with 13 -> folded into category 12.
  makeSeries('764:6', '13.1', [
    [START, 100],
    [END, 130],
  ]),
]

describe('getSuggestedSelection', () => {
  it('returns an empty array when the period is invalid', () => {
    expect(getSuggestedSelection(SERIES, '', END, {})).toEqual([])
    expect(getSuggestedSelection(SERIES, START, '', {})).toEqual([])
    expect(getSuggestedSelection(SERIES, END, START, {})).toEqual([])
  })

  it('returns at most MAX_SUGGESTED_SERIES ids', () => {
    const ids = getSuggestedSelection(SERIES, START, END, {})
    expect(ids.length).toBeLessThanOrEqual(MAX_SUGGESTED_SERIES)
  })

  it('prioritises classes from the user top-2 weighted categories', () => {
    const ids = getSuggestedSelection(SERIES, START, END, {
      '04': 30, // top-1: vivienda
      '01': 25, // top-2: alimentos
      '07': 10,
      '09': 5,
    })
    // Best class in 04 is 764:1 (60% > 10%); best in 01 is 764:3.
    expect(ids[0]).toBe('764:1')
    expect(ids[1]).toBe('764:3')
  })

  it('fills the rest with the largest-magnitude accumulated classes', () => {
    const ids = getSuggestedSelection(SERIES, START, END, {
      '04': 30,
      '01': 25,
    })
    // After 04 and 01 picks, ranked list (by |accumulated|): 764:6 (30%),
    // 764:4 (20%), 764:2 (10%), 764:5 (5%). First two fill remaining slots.
    expect(ids.slice(2)).toEqual(['764:6', '764:4'])
  })

  it('treats ECOICOP v2 code 13 as category 12 (fold)', () => {
    const ids = getSuggestedSelection(SERIES, START, END, {
      '12': 50, // user weights only know about category 12
    })
    // 764:6 has code 13.1 which folds to 12; should be picked first.
    expect(ids[0]).toBe('764:6')
  })

  it('ignores user weights of zero or negative when choosing top categories', () => {
    const ids = getSuggestedSelection(SERIES, START, END, {
      '04': 0,
      '01': -5,
    })
    // Falls back to magnitude ranking: 764:1 > 764:3 > 764:6 > 764:4.
    expect(ids).toEqual(['764:1', '764:3', '764:6', '764:4'])
  })
})
