import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import RubricasExplorer from './RubricasExplorer'
import type { RubricasData } from '@/data/rubricasTypes'

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

describe('RubricasExplorer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('applies URL params on load (rs/rf/re)', async () => {
    window.history.replaceState({}, '', '/?t=rubricas&rs=764:1002&rf=2002-02&re=2002-03')
    vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => createDataset(3),
    } as Response)

    render(<RubricasExplorer />)

    await screen.findByText('Selector de rúbricas')
    expect(screen.getByText(/1\/6 seleccionadas/i)).toBeInTheDocument()
    expect(screen.getByText(/hasta marzo 2002/i)).toBeInTheDocument()
  })

  it('writes selected series into URL params', async () => {
    window.history.replaceState({}, '', '/?t=rubricas')
    vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => createDataset(3),
    } as Response)

    render(<RubricasExplorer />)
    await screen.findByText('Selector de rúbricas')

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Quitar rúbrica 01\.1 Clase 1/i }))

    await waitFor(() => {
      expect(window.location.search).toContain('rs=')
      expect(window.location.search).not.toContain('764:1001')
    })
  })

  it('announces limit reached when 6 series are selected', async () => {
    window.history.replaceState(
      {},
      '',
      '/?t=rubricas&rs=764:1001,764:1002,764:1003,764:1004,764:1005,764:1006'
    )
    vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => createDataset(7),
    } as Response)

    render(<RubricasExplorer />)
    await screen.findByText('Selector de rúbricas')

    expect(screen.getByText(/límite alcanzado: máximo 6 rúbricas/i)).toBeInTheDocument()
  })
})
