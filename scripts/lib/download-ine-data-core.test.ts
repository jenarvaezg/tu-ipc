import {
  assertArrayResponse,
  chainLinkRegions,
  collectSortedNewMonths,
  combineSplitCategory12,
  matchCategory,
  parseSeriesData,
} from './download-ine-data-core.mjs'

describe('download-ine-data core', () => {
  it('parseSeriesData handles empty input', () => {
    expect(parseSeriesData(undefined)).toEqual({})
  })

  it('parseSeriesData prioritizes Anyo/FK_Periodo to avoid month drift', () => {
    const parsed = parseSeriesData([
      // INE monthly points can be published with previous-month UTC timestamps.
      { Fecha: Date.UTC(2025, 11, 31, 23, 0, 0), Anyo: 2026, FK_Periodo: 1, Valor: 101.2 },
      { Fecha: Date.UTC(2025, 10, 30, 23, 0, 0), Anyo: 2025, FK_Periodo: 12, Valor: 102.3 },
    ])

    expect(parsed).toEqual({
      '2026-01': 101.2,
      '2025-12': 102.3,
    })
  })

  it('parseSeriesData falls back to UTC timestamp when Anyo/FK_Periodo is missing', () => {
    const parsed = parseSeriesData([
      { Fecha: Date.UTC(2024, 0, 31, 23, 0, 0), Valor: 101.2 },
      { Fecha: Date.UTC(2024, 1, 1, 0, 0, 0), Valor: 102.3 },
    ])

    expect(parsed).toEqual({
      '2024-01': 101.2,
      '2024-02': 102.3,
    })
  })

  it('matchCategory skips false positive of category 02 with alimentos', () => {
    const map = [
      { code: '01', keywords: ['alimentos'] },
      { code: '02', keywords: ['alcohólicas', 'tabaco'] },
    ]

    expect(matchCategory('Alimentos y bebidas alcohólicas', map)).toEqual(map[0])
  })

  it('matchCategory returns null when there is no match', () => {
    const map = [{ code: '01', keywords: ['alimentos'] }]
    expect(matchCategory('Servicios financieros', map)).toBeNull()
  })

  it('combineSplitCategory12 builds synthetic 12 and removes split categories', () => {
    const newData = {
      nacional: {
        '12a': { '2025-11': 100, '2025-12': 110 },
        '12b': { '2025-11': 200, '2025-12': 130 },
      },
    }

    combineSplitCategory12(newData, 3.7, 4.0)

    expect(newData.nacional['12a']).toBeUndefined()
    expect(newData.nacional['12b']).toBeUndefined()
    expect(newData.nacional['12']['2025-11']).toBeCloseTo(151.948, 3)
    expect(newData.nacional['12']['2025-12']).toBeCloseTo(120.39, 2)
  })

  it('combineSplitCategory12 leaves regions untouched when split data is incomplete', () => {
    const newData = {
      nacional: {
        '12a': { '2025-11': 100 },
      },
    }

    combineSplitCategory12(newData, 3.7, 4.0)

    expect(newData.nacional['12']).toBeUndefined()
    expect(newData.nacional['12a']).toBeDefined()
  })

  it('collectSortedNewMonths returns unique sorted month list', () => {
    const months = collectSortedNewMonths({
      nacional: {
        '00': { '2025-11': 100, '2025-12': 101 },
        '01': { '2025-10': 90, '2025-12': 95 },
      },
    })

    expect(months).toEqual(['2025-10', '2025-11', '2025-12'])
  })

  it('chainLinkRegions appends linked values and reports skipped categories', () => {
    const regions = {
      nacional: {
        categories: {
          '00': { data: { '2025-11': 120 } },
          '01': { data: { '2025-11': 110 } },
          '03': { data: { '2025-11': 50 } },
        },
      },
    }

    const newData = {
      nacional: {
        '00': { '2025-11': 100, '2025-12': 101 },
        '01': { '2025-11': 55, '2025-12': 56 },
        '03': { '2025-11': 0, '2025-12': 10 },
      },
    }

    const allMonths = new Set(['2025-11'])
    const result = chainLinkRegions(regions, newData, '2025-11', ['2025-11', '2025-12'], allMonths)

    expect(result).toEqual({ extended: 2, skipped: 1 })
    expect(regions.nacional.categories['00'].data['2025-12']).toBeCloseTo(121.2, 3)
    expect(regions.nacional.categories['01'].data['2025-12']).toBeCloseTo(112, 3)
    expect(regions.nacional.categories['03'].data['2025-12']).toBeUndefined()
    expect(allMonths.has('2025-12')).toBe(true)
  })

  it('chainLinkRegions skips missing regions/categories and ignores non-extendable months', () => {
    const regions = {
      nacional: { categories: { '00': { data: { '2025-11': 100 } } } },
      madrid: { categories: { '00': { data: { '2025-11': 100 } } } },
    }
    const newData = {
      nacional: {
        '00': {
          '2025-10': 99,
          '2025-11': 100,
          '2025-12': null,
        },
      },
    }
    const allMonths = new Set(['2025-11'])
    const result = chainLinkRegions(regions, newData, '2025-11', ['2025-10', '2025-11', '2025-12'], allMonths)

    expect(result).toEqual({ extended: 0, skipped: 0 })
    expect(regions.nacional.categories['00'].data['2025-12']).toBeUndefined()
    expect(allMonths.has('2025-12')).toBe(false)
  })

  it('assertArrayResponse throws on unexpected payload', () => {
    expect(() =>
      assertArrayResponse({ COD: 123, Error: [{ COD: 56 }] }, 'Tabla test')
    ).toThrow(/Respuesta inesperada en Tabla test/)
  })

  it('assertArrayResponse returns arrays as-is', () => {
    const payload = [{ Id: 1 }]
    expect(assertArrayResponse(payload, 'Tabla test')).toBe(payload)
  })
})
