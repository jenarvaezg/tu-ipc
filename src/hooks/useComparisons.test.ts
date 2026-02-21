import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ipcDataRaw from '@/data/ipc-data.json'
import type { IPCData } from '@/data/types'
import { OFFICIAL_WEIGHTS } from '@/data/categories'
import { useComparisons } from './useComparisons'

const ipcData = ipcDataRaw as IPCData
const months = ipcData.months
const startMonth = months[Math.max(0, months.length - 13)]
const endMonth = months[months.length - 1]
const regionCategories = ipcData.regions.nacional.categories

describe('useComparisons', () => {
  it('clamps initial selections to four total comparisons', () => {
    const { result } = renderHook(() =>
      useComparisons(
        regionCategories,
        ipcData.regions.nacional.name,
        months,
        { ...OFFICIAL_WEIGHTS },
        startMonth,
        endMonth,
        ['joven', 'familia', 'autonomo'],
        ['madrid', 'cataluna', 'andalucia']
      )
    )

    expect(result.current.comparisonIds).toEqual(['joven', 'familia', 'autonomo'])
    expect(result.current.comparisonRegions).toEqual(['madrid'])
    expect(result.current.allComparisons).toHaveLength(4)
  })

  it('prevents adding profile comparisons beyond the max total', () => {
    const { result } = renderHook(() =>
      useComparisons(
        regionCategories,
        ipcData.regions.nacional.name,
        months,
        { ...OFFICIAL_WEIGHTS },
        startMonth,
        endMonth,
        ['joven', 'familia', 'autonomo'],
        ['madrid']
      )
    )

    act(() => {
      result.current.handleToggleComparison('estudiante')
    })

    expect(result.current.comparisonIds).toEqual(['joven', 'familia', 'autonomo'])
    expect(result.current.comparisonRegions).toEqual(['madrid'])
  })

  it('prevents adding region comparisons beyond the max total', () => {
    const { result } = renderHook(() =>
      useComparisons(
        regionCategories,
        ipcData.regions.nacional.name,
        months,
        { ...OFFICIAL_WEIGHTS },
        startMonth,
        endMonth,
        ['joven', 'familia', 'autonomo', 'estudiante'],
        []
      )
    )

    act(() => {
      result.current.handleToggleRegionComparison('madrid')
    })

    expect(result.current.comparisonRegions).toEqual([])
  })
})
