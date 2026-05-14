import { describe, it, expect } from 'vitest'
import {
  V2_SPLIT_12_WEIGHTS,
  combineV2SplitCategory12,
  foldV2GroupCodeToV1,
} from './ecoicop.mjs'

describe('foldV2GroupCodeToV1', () => {
  it('remaps v2 code 13 onto v1 code 12', () => {
    expect(foldV2GroupCodeToV1('13')).toBe('12')
  })

  it('passes through every other code unchanged', () => {
    for (const code of ['00', '01', '04', '12']) {
      expect(foldV2GroupCodeToV1(code)).toBe(code)
    }
  })
})

type NewData = Record<string, Record<string, Record<string, number>>>

describe('combineV2SplitCategory12', () => {
  it('builds a synthetic v1 category 12 and removes the split categories', () => {
    const newData: NewData = {
      nacional: {
        '12a': { '2025-11': 100, '2025-12': 110 },
        '12b': { '2025-11': 200, '2025-12': 130 },
      },
    }

    combineV2SplitCategory12(newData)

    expect(newData.nacional['12a']).toBeUndefined()
    expect(newData.nacional['12b']).toBeUndefined()
    expect(newData.nacional['12']['2025-11']).toBeCloseTo(151.948, 3)
    expect(newData.nacional['12']['2025-12']).toBeCloseTo(120.39, 2)
  })

  it('leaves regions untouched when split data is incomplete', () => {
    const newData: NewData = {
      nacional: {
        '12a': { '2025-11': 100 },
      },
    }

    combineV2SplitCategory12(newData)

    expect(newData.nacional['12']).toBeUndefined()
    expect(newData.nacional['12a']).toBeDefined()
  })

  it('uses the published 2025 base-2021 weights (3.7 + 4.0)', () => {
    expect(V2_SPLIT_12_WEIGHTS[12]).toBe(3.7)
    expect(V2_SPLIT_12_WEIGHTS[13]).toBe(4.0)
  })

  it('drops months that exist in only one of the two splits', () => {
    const newData: NewData = {
      nacional: {
        '12a': { '2025-11': 100, '2025-12': 110 },
        '12b': { '2025-11': 200 },
      },
    }

    combineV2SplitCategory12(newData)

    expect(newData.nacional['12']['2025-11']).toBeCloseTo(151.948, 3)
    expect(newData.nacional['12']['2025-12']).toBeUndefined()
  })
})
