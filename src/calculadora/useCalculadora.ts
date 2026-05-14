import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES, OFFICIAL_WEIGHTS } from '@/data/categories'
import type { IPCData, IPCResult } from '@/data/types'
import { computeYoY, useIPCCalculator } from '@/hooks/useIPCCalculator'
import { useComparisons } from '@/hooks/useComparisons'
import { useWeights } from '@/hooks/useWeights'
import { syncToURL, type URLState } from '@/hooks/useURLState'
import { debounce } from '@/utils/debounce'
import {
  applyOfficialConvergenceToResult,
  applyOfficialConvergenceToYoY,
} from './officialConvergence'

const STORAGE_KEY_REGION = 'tu-ipc-region'

function loadRegion(ipcData: IPCData): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_REGION)
    if (saved && ipcData.regions[saved]) return saved
  } catch {
    /* ignore */
  }
  return 'nacional'
}

function saveRegion(region: string) {
  try {
    localStorage.setItem(STORAGE_KEY_REGION, region)
  } catch {
    /* ignore */
  }
}

export interface WeightDifference {
  code: string
  name: string
  icon: string
  diff: number
}

export type YoYRow = { month: string; personal: number; official: number }

export interface CalculadoraComparison {
  id: string
  label: string
  result: IPCResult
  yoyEvolution: YoYRow[]
}

export interface CalculadoraState {
  // Weights
  weights: Record<string, number>
  locked: Set<string>
  isCustom: boolean
  handleWeightChange: (code: string, value: number) => void
  handleToggleLock: (code: string) => void
  handleReset: (type: 'official' | 'equal') => void
  handlePresetSelect: (weights: Record<string, number>) => void

  // Region / period / tab
  region: string
  setRegion: (code: string) => void
  startMonth: string
  setStartMonth: (month: string) => void
  endMonth: string
  setEndMonth: (month: string) => void
  activeTab: string
  setActiveTab: (tab: string) => void

  // Comparisons
  comparisonIds: string[]
  comparisonRegions: string[]
  allComparisons: CalculadoraComparison[]
  handleToggleComparison: (id: string) => void
  handleClearComparisons: () => void
  handleToggleRegionComparison: (id: string) => void
  handleClearRegionComparisons: () => void

  // Derived
  result: IPCResult
  yoyEvolution: YoYRow[]
  categoryVariations: Record<string, number>
  topWeightDifferences: WeightDifference[]
}

export interface UseCalculadoraOptions {
  ipcData: IPCData
  urlState: URLState
  /** Controls whether weight/region/period changes get synced to the URL. */
  syncEnabled: boolean
}

export function useCalculadora({
  ipcData,
  urlState,
  syncEnabled,
}: UseCalculadoraOptions): CalculadoraState {
  const {
    weights,
    locked,
    isCustom,
    handleWeightChange,
    handleToggleLock,
    handleReset,
    handlePresetSelect,
  } = useWeights(urlState.weights)

  const months = ipcData.months
  const [region, setRegionState] = useState(() =>
    urlState.region && ipcData.regions[urlState.region]
      ? urlState.region
      : loadRegion(ipcData),
  )
  const [startMonth, setStartMonth] = useState(() =>
    urlState.startMonth && months.includes(urlState.startMonth)
      ? urlState.startMonth
      : (months[Math.max(0, months.length - 13)] ?? months[0] ?? ''),
  )
  const [endMonth, setEndMonth] = useState(() =>
    urlState.endMonth && months.includes(urlState.endMonth)
      ? urlState.endMonth
      : (months[months.length - 1] ?? ''),
  )
  const [activeTab, setActiveTab] = useState(urlState.activeTab || 'evolucion')

  const setRegion = useCallback((code: string) => {
    setRegionState(code)
    saveRegion(code)
  }, [])

  const regionData = ipcData.regions[region]
  const regionCategories = useMemo(
    () => regionData?.categories ?? {},
    [regionData],
  )
  const generalIndex = regionCategories['00']

  const rawResult = useIPCCalculator(
    regionCategories,
    months,
    weights,
    startMonth,
    endMonth,
    generalIndex,
  )

  const rawYoyEvolution = useMemo(
    () =>
      computeYoY(
        regionCategories,
        months,
        weights,
        startMonth,
        endMonth,
        generalIndex,
      ),
    [regionCategories, months, weights, startMonth, endMonth, generalIndex],
  )

  const result = useMemo(
    () => applyOfficialConvergenceToResult(rawResult, isCustom),
    [rawResult, isCustom],
  )
  const yoyEvolution = useMemo(
    () => applyOfficialConvergenceToYoY(rawYoyEvolution, isCustom),
    [rawYoyEvolution, isCustom],
  )

  const {
    comparisonIds,
    comparisonRegions,
    allComparisons,
    handleToggleComparison,
    handleClearComparisons,
    handleToggleRegionComparison,
    handleClearRegionComparisons,
  } = useComparisons(
    regionCategories,
    regionData?.name,
    months,
    weights,
    startMonth,
    endMonth,
    urlState.comparisonIds,
    urlState.comparisonRegions,
  )

  const categoryVariations = useMemo(() => {
    const vars: Record<string, number> = {}
    for (const item of result.breakdown) {
      vars[item.code] = item.variation
    }
    return vars
  }, [result.breakdown])

  const topWeightDifferences = useMemo<WeightDifference[]>(() => {
    return CATEGORIES.map(cat => {
      const current = weights[cat.code] ?? 0
      const official = OFFICIAL_WEIGHTS[cat.code] ?? 0
      const diff = current - official
      return {
        code: cat.code,
        name: cat.name,
        icon: cat.icon,
        diff,
      }
    })
      .filter(item => Math.abs(item.diff) >= 0.1)
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
      .slice(0, 3)
  }, [weights])

  // Sync calculator state to URL with debouncing. Skipped when the calculator
  // is not visible so landing / methodology / privacy don't dirty the URL.
  const debouncedSyncRef = useRef(debounce(syncToURL, 300))
  useEffect(() => {
    return () => debouncedSyncRef.current.cancel()
  }, [])
  useEffect(() => {
    if (!syncEnabled) return
    debouncedSyncRef.current({
      weights,
      startMonth,
      endMonth,
      region,
      activeTab,
      comparisonIds,
      comparisonRegions,
    })
  }, [
    syncEnabled,
    weights,
    startMonth,
    endMonth,
    region,
    activeTab,
    comparisonIds,
    comparisonRegions,
  ])

  return {
    weights,
    locked,
    isCustom,
    handleWeightChange,
    handleToggleLock,
    handleReset,
    handlePresetSelect,

    region,
    setRegion,
    startMonth,
    setStartMonth,
    endMonth,
    setEndMonth,
    activeTab,
    setActiveTab,

    comparisonIds,
    comparisonRegions,
    allComparisons,
    handleToggleComparison,
    handleClearComparisons,
    handleToggleRegionComparison,
    handleClearRegionComparisons,

    result,
    yoyEvolution,
    categoryVariations,
    topWeightDifferences,
  }
}
