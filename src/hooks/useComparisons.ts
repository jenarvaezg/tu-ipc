import { useState, useCallback, useMemo } from 'react'
import { computeIPC, computeYoY } from '@/hooks/useIPCCalculator'
import { PRESETS } from '@/data/presets'
import type { IPCCategory, IPCData } from '@/data/types'
import ipcDataRaw from '@/data/ipc-data.json'

const ipcData = ipcDataRaw as IPCData

export function useComparisons(
  regionCategories: Record<string, IPCCategory>,
  regionName: string | undefined,
  months: string[],
  weights: Record<string, number>,
  startMonth: string,
  endMonth: string,
  initialComparisonIds?: string[],
  initialComparisonRegions?: string[]
) {
  const [comparisonIds, setComparisonIds] = useState<string[]>(initialComparisonIds || [])
  const [comparisonRegions, setComparisonRegions] = useState<string[]>(initialComparisonRegions || [])

  const comparisonResults = useMemo(() => {
    const showRegion = comparisonRegions.length > 0 && regionName
    return comparisonIds.map(id => {
      const preset = PRESETS.find(p => p.id === id)
      if (!preset) return null
      return {
        id,
        label: showRegion ? `${preset.name} (${regionName})` : preset.name,
        result: computeIPC(regionCategories, months, preset.weights, startMonth, endMonth),
        yoyEvolution: computeYoY(regionCategories, months, preset.weights, startMonth, endMonth),
      }
    }).filter((x): x is NonNullable<typeof x> => x !== null)
  }, [comparisonIds, regionCategories, months, startMonth, endMonth, regionName, comparisonRegions.length])

  const regionComparisonResults = useMemo(() => {
    return comparisonRegions.map(regionCode => {
      const regData = ipcData.regions[regionCode]
      if (!regData) return null
      return {
        id: regionCode,
        label: regData.name,
        result: computeIPC(regData.categories, months, weights, startMonth, endMonth),
        yoyEvolution: computeYoY(regData.categories, months, weights, startMonth, endMonth),
      }
    }).filter((x): x is NonNullable<typeof x> => x !== null)
  }, [comparisonRegions, months, weights, startMonth, endMonth])

  const allComparisons = useMemo(() => {
    return [...comparisonResults, ...regionComparisonResults].slice(0, 4)
  }, [comparisonResults, regionComparisonResults])

  const handleToggleComparison = useCallback((presetId: string) => {
    setComparisonIds(prev =>
      prev.includes(presetId)
        ? prev.filter(id => id !== presetId)
        : [...prev, presetId]
    )
  }, [])

  const handleClearComparisons = useCallback(() => {
    setComparisonIds([])
  }, [])

  const handleToggleRegionComparison = useCallback((regionCode: string) => {
    setComparisonRegions(prev =>
      prev.includes(regionCode) ? prev.filter(r => r !== regionCode) : [...prev, regionCode]
    )
  }, [])

  const handleClearRegionComparisons = useCallback(() => {
    setComparisonRegions([])
  }, [])

  return {
    comparisonIds,
    setComparisonIds,
    comparisonRegions,
    setComparisonRegions,
    comparisonResults,
    regionComparisonResults,
    allComparisons,
    handleToggleComparison,
    handleClearComparisons,
    handleToggleRegionComparison,
    handleClearRegionComparisons,
  }
}
