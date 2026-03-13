import {
  buildSeriesPayload,
  buildValueIndexes,
  computeMonths,
  dedupeByRubricaName,
  extractRubricaName,
  normalizeForMatch,
  normalizeSeries,
  resolveValueByName,
} from './download-ine-rubricas-core.mjs'

describe('download-ine-rubricas core', () => {
  it('extractRubricaName keeps the second segment of INE series names', () => {
    expect(extractRubricaName('España. Índice general. Base 2021')).toBe('Índice general')
    expect(extractRubricaName('Índice general.')).toBe('Índice general')
  })

  it('normalizeForMatch strips accents and normalizes n.c.o.p variants', () => {
    expect(normalizeForMatch('Peluquerías y estética n.c.o.p.')).toBe(
      'peluquerias y estetica n'
    )
  })

  it('normalizeSeries sorts points and marks base month presence', () => {
    const series = normalizeSeries(
      [
        {
          COD: 'A1',
          Nombre: 'España. Frutas.',
          Data: [
            { Fecha: Date.UTC(2002, 0, 1), Valor: 60 },
            { Fecha: Date.UTC(2001, 11, 1), Valor: 58 },
          ],
        },
      ],
      '2002-01'
    )

    expect(series[0].rubricaName).toBe('Frutas')
    expect(series[0].firstMonth).toBe('2001-12')
    expect(series[0].lastMonth).toBe('2002-01')
    expect(series[0].hasBaseMonth).toBe(true)
    expect(series[0].points[0]).toEqual({ month: '2001-12', value: 58 })
  })

  it('normalizeSeries prefers Anyo/FK_Periodo over UTC-boundary Fecha values', () => {
    const series = normalizeSeries(
      [
        {
          COD: 'A2',
          Nombre: 'España. Índice general.',
          Data: [
            {
              Fecha: 1769900400000,
              FK_Periodo: 2,
              Anyo: 2026,
              Valor: 100.423,
            },
          ],
        },
      ],
      '2002-01'
    )

    expect(series[0].firstMonth).toBe('2026-02')
    expect(series[0].lastMonth).toBe('2026-02')
    expect(series[0].points[0]).toEqual({ month: '2026-02', value: 100.423 })
  })

  it('normalizeSeries handles missing fields and absent base month', () => {
    const series = normalizeSeries([{ Data: [] }], '2002-01')
    expect(series[0].ineSeriesCode).toBe('')
    expect(series[0].rubricaName).toBe('')
    expect(series[0].firstMonth).toBe('')
    expect(series[0].lastMonth).toBe('')
    expect(series[0].hasBaseMonth).toBe(false)
  })

  it('dedupeByRubricaName keeps the series with more points or newer tie-break', () => {
    const deduped = dedupeByRubricaName([
      { rubricaName: 'Frutas', points: [{ month: '2002-01' }], lastMonth: '2002-01' },
      {
        rubricaName: 'Frutas',
        points: [{ month: '2002-01' }, { month: '2002-02' }],
        lastMonth: '2002-02',
      },
      { rubricaName: 'Verduras', points: [{ month: '2002-01' }], lastMonth: '2002-01' },
      { rubricaName: 'Verduras', points: [{ month: '2002-01' }], lastMonth: '2002-03' },
    ])

    expect(deduped).toHaveLength(2)
    const frutas = deduped.find(item => item.rubricaName === 'Frutas')
    const verduras = deduped.find(item => item.rubricaName === 'Verduras')
    expect(frutas?.lastMonth).toBe('2002-02')
    expect(verduras?.lastMonth).toBe('2002-03')
  })

  it('buildValueIndexes + resolveValueByName supports exact and normalized matching', () => {
    const values = [
      { Id: 1, Nombre: 'Peluquerías' },
      { Id: 2, Nombre: 'Peluquerias' },
      { Id: 3, Nombre: 'Índice general' },
    ]
    const indexes = buildValueIndexes(values)

    expect(resolveValueByName('Índice general', indexes)?.Id).toBe(3)
    expect(resolveValueByName('Peluquerías', indexes)?.Id).toBe(1)
    expect(resolveValueByName('PELUQUERIAS Y ESTETICA', indexes)).toBeNull()
  })

  it('resolveValueByName uses normalized fallback when exact key does not exist', () => {
    const indexes = buildValueIndexes([{ Id: 10, Nombre: 'Peluquerias y estetica' }])
    const resolved = resolveValueByName('Peluquerías y estética', indexes)
    expect(resolved?.Id).toBe(10)
  })

  it('buildValueIndexes ignores empty normalized keys', () => {
    const indexes = buildValueIndexes([{ Id: 1, Nombre: '...' }, { Id: 2, Nombre: '' }])
    expect(indexes.normalized.size).toBe(0)
  })

  it('buildSeriesPayload maps known names and reports missing rubricas', () => {
    const indexes = buildValueIndexes([
      {
        Id: 304092,
        Nombre: 'Índice general',
        Codigo: '00',
        FK_JerarquiaPadres: [12345],
      },
    ])

    const { payload, missing } = buildSeriesPayload(
      [
        {
          ineSeriesCode: 'SER-1',
          rubricaName: 'Índice general',
          firstMonth: '2001-12',
          lastMonth: '2025-12',
          hasBaseMonth: true,
          points: [{ month: '2001-12', value: 58.7 }],
        },
        {
          ineSeriesCode: 'SER-2',
          rubricaName: 'Desconocida',
          firstMonth: '2002-01',
          lastMonth: '2002-01',
          hasBaseMonth: true,
          points: [{ month: '2002-01', value: 100 }],
        },
      ],
      indexes,
      762,
      'grupo'
    )

    expect(payload).toHaveLength(1)
    expect(payload[0].id).toBe('762:304092')
    expect(payload[0].parentRubricaId).toBe(12345)
    expect(missing).toEqual(['Desconocida'])
  })

  it('buildSeriesPayload leaves parentRubricaId undefined when parent list is empty', () => {
    const indexes = buildValueIndexes([
      {
        Id: 999,
        Nombre: 'Sin padre',
        Codigo: 'xx',
        FK_JerarquiaPadres: [],
      },
    ])

    const { payload } = buildSeriesPayload(
      [
        {
          ineSeriesCode: 'SER-X',
          rubricaName: 'Sin padre',
          firstMonth: '2002-01',
          lastMonth: '2002-01',
          hasBaseMonth: true,
          points: [{ month: '2002-01', value: 100 }],
        },
      ],
      indexes,
      764,
      'clase'
    )

    expect(payload[0].parentRubricaId).toBeUndefined()
  })

  it('computeMonths returns sorted unique month list', () => {
    const months = computeMonths([
      { points: [{ month: '2002-01' }, { month: '2002-03' }] },
      { points: [{ month: '2002-02' }, { month: '2002-03' }] },
    ])

    expect(months).toEqual(['2002-01', '2002-02', '2002-03'])
  })

  it('normalizeSeries drops points without a valid month label', () => {
    const series = normalizeSeries(
      [
        {
          COD: 'A3',
          Nombre: 'España. Sin fecha.',
          Data: [{ Valor: 12 }],
        },
      ],
      '2002-01'
    )

    expect(series[0].points).toEqual([])
    expect(series[0].firstMonth).toBe('')
    expect(series[0].lastMonth).toBe('')
  })
})
