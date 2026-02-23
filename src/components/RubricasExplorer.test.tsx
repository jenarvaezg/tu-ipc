import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import RubricasExplorer from './RubricasExplorer'
import type { RubricasData } from '@/data/rubricasTypes'
import { OFFICIAL_WEIGHTS } from '@/data/categories'

vi.mock('recharts', () => {
  const Passthrough = ({ children }: { children?: ReactNode }) => <div>{children}</div>
  return {
    ResponsiveContainer: Passthrough,
    LineChart: Passthrough,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    ReferenceLine: () => null,
    Line: () => null,
  }
})

function createDataset(seriesCount = 3): RubricasData {
  const months = ['2002-01', '2002-02', '2002-03']
  const classSeries = Array.from({ length: seriesCount }, (_, i) => {
    const id = 1001 + i
    return {
      id: `764:${id}`,
      ineSeriesCode: `IPC${id}`,
      variableId: 764 as const,
      level: 'clase' as const,
      rubricaId: id,
      parentRubricaId: 200 + i,
      codigo: `01.${i + 1}`,
      nombre: `Clase ${i + 1}`,
      firstMonth: '2002-01',
      lastMonth: '2002-03',
      hasBaseMonth: true,
      points: [
        { month: '2002-01', value: 100 + i },
        { month: '2002-02', value: 101 + i },
        { month: '2002-03', value: 102 + i },
      ],
    }
  })

  return {
    schemaVersion: '1.0',
    generatedAt: '2026-02-21T00:00:00.000Z',
    baseMonth: '2002-01',
    months,
    series: [
      {
        id: '762:304092',
        ineSeriesCode: 'IPC000',
        variableId: 762,
        level: 'grupo',
        rubricaId: 304092,
        codigo: '00',
        nombre: 'Índice general',
        firstMonth: '2002-01',
        lastMonth: '2002-03',
        hasBaseMonth: true,
        points: [
          { month: '2002-01', value: 100 },
          { month: '2002-02', value: 101 },
          { month: '2002-03', value: 102 },
        ],
      },
      ...classSeries,
    ],
    catalog: [
      { id: 1, variableId: 762, level: 'grupo', codigo: '01', nombre: 'Grupo 01', parentIds: [] },
      ...Array.from({ length: seriesCount }, (_, i) => ({
        id: 200 + i,
        variableId: 763 as const,
        level: 'subgrupo' as const,
        codigo: `01${i + 1}`,
        nombre: `Subgrupo ${i + 1}`,
        parentIds: [1],
      })),
    ],
  }
}

function createDatasetWithCustomSeries(valuesBySeries: number[][]): RubricasData {
  const months = ['2002-01', '2002-02', '2002-03']
  const classSeries = valuesBySeries.map((values, i) => {
    const id = 1001 + i
    return {
      id: `764:${id}`,
      ineSeriesCode: `IPC${id}`,
      variableId: 764 as const,
      level: 'clase' as const,
      rubricaId: id,
      parentRubricaId: 200 + i,
      codigo: `01.${i + 1}`,
      nombre: `Clase ${i + 1}`,
      firstMonth: '2002-01',
      lastMonth: '2002-03',
      hasBaseMonth: true,
      points: [
        { month: '2002-01', value: values[0] },
        { month: '2002-02', value: values[1] },
        { month: '2002-03', value: values[2] },
      ],
    }
  })

  return {
    schemaVersion: '1.0',
    generatedAt: '2026-02-21T00:00:00.000Z',
    baseMonth: '2002-01',
    months,
    series: [
      {
        id: '762:304092',
        ineSeriesCode: 'IPC000',
        variableId: 762,
        level: 'grupo',
        rubricaId: 304092,
        codigo: '00',
        nombre: 'Índice general',
        firstMonth: '2002-01',
        lastMonth: '2002-03',
        hasBaseMonth: true,
        points: [
          { month: '2002-01', value: 100 },
          { month: '2002-02', value: 100 },
          { month: '2002-03', value: 100 },
        ],
      },
      ...classSeries,
    ],
    catalog: [
      { id: 1, variableId: 762, level: 'grupo', codigo: '01', nombre: 'Grupo 01', parentIds: [] },
      ...valuesBySeries.map((_, i) => ({
        id: 200 + i,
        variableId: 763 as const,
        level: 'subgrupo' as const,
        codigo: `01${i + 1}`,
        nombre: `Subgrupo ${i + 1}`,
        parentIds: [1],
      })),
    ],
  }
}

function createDatasetWithSeriesSpecs(
  specs: Array<{ code: string; name: string; values: [number, number, number] }>
): RubricasData {
  const months = ['2002-01', '2002-02', '2002-03']
  const classSeries = specs.map((spec, i) => {
    const id = 1001 + i
    return {
      id: `764:${id}`,
      ineSeriesCode: `IPC${id}`,
      variableId: 764 as const,
      level: 'clase' as const,
      rubricaId: id,
      parentRubricaId: 300 + i,
      codigo: spec.code,
      nombre: spec.name,
      firstMonth: '2002-01',
      lastMonth: '2002-03',
      hasBaseMonth: true,
      points: [
        { month: '2002-01', value: spec.values[0] },
        { month: '2002-02', value: spec.values[1] },
        { month: '2002-03', value: spec.values[2] },
      ],
    }
  })

  return {
    schemaVersion: '1.0',
    generatedAt: '2026-02-21T00:00:00.000Z',
    baseMonth: '2002-01',
    months,
    series: [
      {
        id: '762:304092',
        ineSeriesCode: 'IPC000',
        variableId: 762,
        level: 'grupo',
        rubricaId: 304092,
        codigo: '00',
        nombre: 'Índice general',
        firstMonth: '2002-01',
        lastMonth: '2002-03',
        hasBaseMonth: true,
        points: [
          { month: '2002-01', value: 100 },
          { month: '2002-02', value: 100 },
          { month: '2002-03', value: 100 },
        ],
      },
      ...classSeries,
    ],
    catalog: [
      { id: 1, variableId: 762, level: 'grupo', codigo: '01', nombre: 'Grupo 01', parentIds: [] },
      ...specs.map((_, i) => ({
        id: 300 + i,
        variableId: 763 as const,
        level: 'subgrupo' as const,
        codigo: `0${(i % 9) + 1}`,
        nombre: `Subgrupo ${i + 1}`,
        parentIds: [1],
      })),
    ],
  }
}

describe('RubricasExplorer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('applies URL params on load (rs) and uses global period props', async () => {
    window.history.replaceState({}, '', '/?t=rubricas&rs=764:1002')
    vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => createDataset(3),
    } as Response)

    render(
      <RubricasExplorer
        startMonth="2002-02"
        endMonth="2002-03"
        userWeights={OFFICIAL_WEIGHTS}
      />
    )

    await screen.findByText('Selector de rúbricas')
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^Quitar rúbrica 01\.2 Clase 2$/i })
      ).toBeInTheDocument()
    })
    expect(
      screen.getByText(/febrero 2002\s*–\s*marzo 2002\s*·\s*Selecciona hasta/i)
    ).toBeInTheDocument()
  })

  it('writes selected series into URL params', async () => {
    window.history.replaceState({}, '', '/?t=rubricas')
    vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => createDataset(3),
    } as Response)

    render(
      <RubricasExplorer
        startMonth="2002-01"
        endMonth="2002-03"
        userWeights={OFFICIAL_WEIGHTS}
      />
    )
    await screen.findByText('Selector de rúbricas')

    const class1Button = screen.getByRole('button', {
      name: /^(Seleccionar|Quitar) rúbrica 01\.1 Clase 1$/i,
    })
    const searchBefore = window.location.search

    const user = userEvent.setup()
    await user.click(class1Button)

    await waitFor(() => {
      expect(window.location.search).toContain('rs=')
      expect(window.location.search).not.toBe(searchBefore)
    })
  })

  it('announces limit reached when 6 series are selected', async () => {
    window.history.replaceState({}, '', '/?t=rubricas')
    vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => createDataset(7),
    } as Response)

    render(
      <RubricasExplorer
        startMonth="2002-01"
        endMonth="2002-03"
        userWeights={OFFICIAL_WEIGHTS}
      />
    )
    await screen.findByText('Selector de rúbricas')

    const user = userEvent.setup()
    for (let i = 0; i < 10; i += 1) {
      const nextSelectable = screen
        .queryAllByRole('button', { name: /^Seleccionar rúbrica/i })
        .find((button) => !button.hasAttribute('disabled'));
      if (!nextSelectable) break;
      await user.click(nextSelectable);
    }

    await waitFor(() => {
      expect(screen.getByText(/6\/6 seleccionadas/i)).toBeInTheDocument()
      expect(screen.getByText(/límite alcanzado: máximo 6 rúbricas/i)).toBeInTheDocument()
    })
  })

  it('removes selected category when clicking summary chip', async () => {
    window.history.replaceState({}, '', '/?t=rubricas')
    vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => createDataset(3),
    } as Response)

    render(
      <RubricasExplorer
        startMonth="2002-01"
        endMonth="2002-03"
        userWeights={OFFICIAL_WEIGHTS}
      />
    )
    await screen.findByText('Selector de rúbricas')

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /Quitar rúbrica .* desde resumen/i }).length
      ).toBeGreaterThan(0)
    })

    const summaryButtonsBefore = screen.getAllByRole('button', {
      name: /Quitar rúbrica .* desde resumen/i,
    })
    const selectedBefore =
      new URLSearchParams(window.location.search).get('rs')?.split(',').filter(Boolean).length ?? 0

    const user = userEvent.setup()
    await user.click(summaryButtonsBefore[0])

    await waitFor(() => {
      expect(window.location.search).toContain('rs=')
      const selectedAfter =
        new URLSearchParams(window.location.search).get('rs')?.split(',').filter(Boolean).length ??
        0
      expect(selectedAfter).toBe(Math.max(0, selectedBefore - 1))
    })
  })

  it('uses selected period for suggested selection', async () => {
    window.history.replaceState({}, '', '/?t=rubricas')
    vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () =>
        createDatasetWithCustomSeries([
          [100, 200, 200], // sube antes del periodo filtrado
          [100, 100, 130],
          [100, 100, 125],
          [100, 100, 120],
          [100, 100, 115],
        ]),
    } as Response)

    render(
      <RubricasExplorer
        startMonth="2002-02"
        endMonth="2002-03"
        userWeights={OFFICIAL_WEIGHTS}
      />
    )
    await screen.findByText('Selector de rúbricas')

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Seleccionar rúbrica 01\.1 Clase 1/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /^Quitar rúbrica 01\.5 Clase 5$/i })
      ).toBeInTheDocument()
    })
  })

  it('prioritizes top weighted user categories in suggested selection', async () => {
    window.history.replaceState({}, '', '/?t=rubricas')
    vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () =>
        createDatasetWithSeriesSpecs([
          { code: '03.1', name: 'Moda rápida', values: [100, 100, 150] },
          { code: '07.1', name: 'Gasolina', values: [100, 100, 110] },
          { code: '11.1', name: 'Restauración', values: [100, 100, 108] },
          { code: '01.1', name: 'Alimentos básicos', values: [100, 100, 107] },
          { code: '05.1', name: 'Muebles', values: [100, 100, 106] },
        ]),
    } as Response)

    const weights = {
      ...OFFICIAL_WEIGHTS,
      '07': 40,
      '11': 30,
      '03': 2,
    }

    render(
      <RubricasExplorer
        startMonth="2002-02"
        endMonth="2002-03"
        userWeights={weights}
      />
    )

    await screen.findByText('Selector de rúbricas')

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^Quitar rúbrica 07\.1 Gasolina$/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /^Quitar rúbrica 11\.1 Restauración$/i })
      ).toBeInTheDocument()
    })
  })
})
