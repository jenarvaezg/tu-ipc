import { useState, useCallback, useMemo } from 'react'
import { computeIPC, computeYoY } from '@/hooks/useIPCCalculator'
import { PRESETS } from '@/data/presets'
import type { IPCCategory, IPCData } from '@/data/types'
import ipcDataRaw from '@/data/ipc-data.json'
import { trackEvent } from '@/utils/analytics'

const ipcData = ipcDataRaw as IPCData
const MAX_COMPARISONS = 4

function unique(items?: string[]) {
  return Array.from(new Set(items || []))
}

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
  const initialIds = unique(initialComparisonIds).slice(0, MAX_COMPARISONS)
  const initialRegions = unique(initialComparisonRegions).slice(0, Math.max(0, MAX_COMPARISONS - initialIds.length))

  const [comparisonIds, setComparisonIds] = useState<string[]>(initialIds)
  const [comparisonRegions, setComparisonRegions] = useState<string[]>(initialRegions)

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
    return [...comparisonResults, ...regionComparisonResults].slice(0, MAX_COMPARISONS)
  }, [comparisonResults, regionComparisonResults])

  const handleToggleComparison = useCallback((presetId: string) => {
    setComparisonIds(prev => {
      if (prev.includes(presetId)) {
        return prev.filter(id => id !== presetId)
      }
      if (prev.length + comparisonRegions.length >= MAX_COMPARISONS) {
        return prev
      }
      trackEvent('comparison_add', { preset_id: presetId })
      return [...prev, presetId]
    })
  }, [comparisonRegions.length])

  const handleClearComparisons = useCallback(() => {
    setComparisonIds([])
  }, [])

  const handleToggleRegionComparison = useCallback((regionCode: string) => {
    setComparisonRegions(prev => {
      if (prev.includes(regionCode)) {
        return prev.filter(r => r !== regionCode)
      }
      if (comparisonIds.length + prev.length >= MAX_COMPARISONS) {
        return prev
      }
      trackEvent('region_compare', { region: regionCode })
      return [...prev, regionCode]
    })
  }, [comparisonIds.length])

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
