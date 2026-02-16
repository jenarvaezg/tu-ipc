import { useState, useCallback, useMemo, useEffect } from 'react'
import ipcDataRaw from '@/data/ipc-data.json'
import type { IPCData } from '@/data/types'
import { CATEGORIES, OFFICIAL_WEIGHTS } from '@/data/categories'
import { useIPCCalculator } from '@/hooks/useIPCCalculator'
import { parseURLState, syncToURL } from '@/hooks/useURLState'
import Header from '@/components/Header'
import KPICards from '@/components/KPICards'
import RegionSelector from '@/components/RegionSelector'
import PeriodSelector from '@/components/PeriodSelector'
import TabNavigation from '@/components/TabNavigation'
import EvolutionChart from '@/components/EvolutionChart'
import WeightSliders from '@/components/WeightSliders'
import CategoryBreakdown from '@/components/CategoryBreakdown'
import PresetSelector from '@/components/PresetSelector'
import ShareButton from '@/components/ShareButton'
import Footer from '@/components/Footer'
import Methodology from '@/components/Methodology'
import SalaryCalculator from '@/components/SalaryCalculator'
import ComparisonToggle from '@/components/ComparisonToggle'
import { PRESETS } from '@/data/presets'

const ipcData = ipcDataRaw as IPCData

const STORAGE_KEY = 'tu-ipc-weights'
const STORAGE_KEY_LOCKED = 'tu-ipc-locked'
const STORAGE_KEY_REGION = 'tu-ipc-region'

function loadWeights(): Record<string, number> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (typeof parsed === 'object' && parsed !== null) return parsed
    }
  } catch { /* ignore */ }
  return { ...OFFICIAL_WEIGHTS }
}

function loadLocked(): Set<string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LOCKED)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return new Set(parsed)
    }
  } catch { /* ignore */ }
  return new Set()
}

function loadRegion(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_REGION)
    if (saved && ipcData.regions[saved]) return saved
  } catch { /* ignore */ }
  return 'nacional'
}

function saveWeights(weights: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(weights))
}

function saveLocked(locked: Set<string>) {
  localStorage.setItem(STORAGE_KEY_LOCKED, JSON.stringify([...locked]))
}

function saveRegion(region: string) {
  localStorage.setItem(STORAGE_KEY_REGION, region)
}

export default function App() {
  const [page, setPage] = useState<'calculator' | 'methodology'>('calculator')

  // URL params take priority over localStorage
  const urlState = useMemo(() => parseURLState(), [])

  const [weights, setWeights] = useState<Record<string, number>>(
    () => urlState.weights || loadWeights()
  )
  const [locked, setLocked] = useState<Set<string>>(loadLocked)
  const [region, setRegion] = useState(
    () => urlState.region && ipcData.regions[urlState.region] ? urlState.region : loadRegion()
  )
  const months = ipcData.months
  const [startMonth, setStartMonth] = useState(
    () => urlState.startMonth && months.includes(urlState.startMonth)
      ? urlState.startMonth
      : months[Math.max(0, months.length - 13)] || months[0]
  )
  const [endMonth, setEndMonth] = useState(
    () => urlState.endMonth && months.includes(urlState.endMonth)
      ? urlState.endMonth
      : months[months.length - 1]
  )
  const [activeTab, setActiveTab] = useState(urlState.activeTab || 'evolucion')
  const [comparisonId, setComparisonId] = useState<string | null>(urlState.comparisonId || null)

  const regionData = ipcData.regions[region]
  const regionCategories = regionData?.categories ?? {}

  const result = useIPCCalculator(regionCategories, months, weights, startMonth, endMonth)

  const comparisonWeights = useMemo(() => {
    if (!comparisonId) return null
    const preset = PRESETS.find(p => p.id === comparisonId)
    return preset?.weights ?? null
  }, [comparisonId])

  const comparisonResult = useIPCCalculator(
    regionCategories, months, comparisonWeights ?? weights, startMonth, endMonth
  )

  const handleRegionChange = useCallback((code: string) => {
    setRegion(code)
    saveRegion(code)
  }, [])

  const handleWeightChange = useCallback((code: string, newValue: number) => {
    setWeights((prev) => {
      const oldValue = prev[code] || 0
      const delta = newValue - oldValue

      // Find unlocked categories (excluding the one being changed)
      const adjustable = CATEGORIES
        .filter((c) => c.code !== code && !locked.has(c.code))
        .map((c) => c.code)

      if (adjustable.length === 0) return prev

      // Distribute -delta proportionally among adjustable categories
      const adjustableTotal = adjustable.reduce((sum, c) => sum + (prev[c] || 0), 0)
      const next = { ...prev, [code]: Math.max(0, Math.min(100, newValue)) }

      if (adjustableTotal > 0) {
        for (const c of adjustable) {
          const share = (prev[c] || 0) / adjustableTotal
          next[c] = Math.max(0, (prev[c] || 0) - delta * share)
        }
      } else {
        // All adjustable are at 0, distribute equally
        const each = -delta / adjustable.length
        for (const c of adjustable) {
          next[c] = Math.max(0, each)
        }
      }

      saveWeights(next)
      return next
    })
  }, [locked])

  const handleToggleLock = useCallback((code: string) => {
    setLocked((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      saveLocked(next)
      return next
    })
  }, [])

  const handleReset = useCallback((type: 'official' | 'equal') => {
    const next =
      type === 'official'
        ? { ...OFFICIAL_WEIGHTS }
        : Object.fromEntries(CATEGORIES.map((c) => [c.code, +(100 / 12).toFixed(2)]))
    setWeights(next)
    saveWeights(next)
    setLocked(new Set())
    saveLocked(new Set())
  }, [])

  const handlePresetSelect = useCallback((presetWeights: Record<string, number>) => {
    setWeights(presetWeights)
    saveWeights(presetWeights)
    setLocked(new Set())
    saveLocked(new Set())
  }, [])

  const categoryVariations = useMemo(() => {
    const vars: Record<string, number> = {}
    for (const item of result.breakdown) {
      vars[item.code] = item.variation
    }
    return vars
  }, [result.breakdown])

  // Sync state to URL
  useEffect(() => {
    syncToURL({ weights, startMonth, endMonth, region, activeTab, comparisonId })
  }, [weights, startMonth, endMonth, region, activeTab, comparisonId])

  if (page === 'methodology') {
    return <Methodology onBack={() => setPage('calculator')} />
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Header lastUpdated={ipcData.lastUpdated} onMethodology={() => setPage('methodology')} />
        <KPICards
          personalIPC={result.personalIPC}
          officialIPC={result.officialIPC}
          difference={result.difference}
          comparisonIPC={comparisonId ? comparisonResult.personalIPC : undefined}
          comparisonLabel={comparisonId ? (PRESETS.find(p => p.id === comparisonId)?.name ?? '') : undefined}
        />
        <RegionSelector value={region} onChange={handleRegionChange} />
        <PeriodSelector
          months={months}
          startMonth={startMonth}
          endMonth={endMonth}
          onStartChange={setStartMonth}
          onEndChange={setEndMonth}
        />
        <div className="text-center mb-6">
          <ShareButton
            personalIPC={result.personalIPC}
            officialIPC={result.officialIPC}
            difference={result.difference}
            startMonth={startMonth}
            endMonth={endMonth}
            region={region}
          />
        </div>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'evolucion' && (
          <>
            <ComparisonToggle comparisonId={comparisonId} onSelect={setComparisonId} />
            <EvolutionChart
              data={result.evolution}
              comparisonData={comparisonId ? comparisonResult.evolution : undefined}
              comparisonLabel={comparisonId ? (PRESETS.find(p => p.id === comparisonId)?.name ?? '') : undefined}
            />
          </>
        )}
        {activeTab === 'desglose' && (
          <>
            <PresetSelector weights={weights} onSelect={handlePresetSelect} />
            <WeightSliders
              weights={weights}
              locked={locked}
              onChange={handleWeightChange}
              onToggleLock={handleToggleLock}
              onReset={handleReset}
              categoryVariations={categoryVariations}
            />
            <CategoryBreakdown breakdown={result.breakdown} />
          </>
        )}
        {activeTab === 'sueldo' && (
          <SalaryCalculator
            personalIPC={result.personalIPC}
            startMonth={startMonth}
            endMonth={endMonth}
          />
        )}
        <Footer onMethodology={() => setPage('methodology')} />
      </div>
    </div>
  )
}
