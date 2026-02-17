import { useState, useMemo, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import ipcDataRaw from '@/data/ipc-data.json'
import type { IPCData } from '@/data/types'
import { useIPCCalculator, computeYoY } from '@/hooks/useIPCCalculator'
import { parseURLState, syncToURL } from '@/hooks/useURLState'
import { useWeights } from '@/hooks/useWeights'
import { useComparisons } from '@/hooks/useComparisons'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { debounce } from '@/utils/debounce'
import { trackEvent } from '@/utils/analytics'
import Header from '@/components/Header'
import KPICards from '@/components/KPICards'
import TabNavigation from '@/components/TabNavigation'
import WeightSliders from '@/components/WeightSliders'
import CategoryBreakdown from '@/components/CategoryBreakdown'
import PresetSelector from '@/components/PresetSelector'
import ShareButton from '@/components/ShareButton'
import CopyLinkButton from '@/components/CopyLinkButton'
import NarrativeSummary from '@/components/NarrativeSummary'
import ShareSuggestion from '@/components/ShareSuggestion'
import Footer from '@/components/Footer'
import FilterSidebar from '@/components/FilterSidebar'
import LandingPage from '@/components/LandingPage'

const EvolutionChart = lazy(() => import('@/components/EvolutionChart'))
const Methodology = lazy(() => import('@/components/Methodology'))
const SalaryCalculator = lazy(() => import('@/components/SalaryCalculator'))
const RegionRanking = lazy(() => import('@/components/RegionRanking'))

const ipcData = ipcDataRaw as IPCData

const BASE = import.meta.env.BASE_URL // '/tu-ipc/' in prod, '/' in dev

function getSubRoute(): string {
  const path = window.location.pathname
  const sub = path.startsWith(BASE) ? path.slice(BASE.length) : path.slice(1)
  return sub.replace(/\/$/, '')
}

const isEmbed = new URLSearchParams(window.location.search).get('embed') === '1'

const STORAGE_KEY_REGION = 'tu-ipc-region'

function LazyFallback() {
  return <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Cargando...</div>
}

function loadRegion(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_REGION)
    if (saved && ipcData.regions[saved]) return saved
  } catch { /* ignore */ }
  return 'nacional'
}

function saveRegion(region: string) {
  localStorage.setItem(STORAGE_KEY_REGION, region)
}

export default function App() {
  // URL params take priority over localStorage
  const urlState = useMemo(() => parseURLState(), [])

  const initialRoute = useMemo(() => getSubRoute(), [])

  // Skip landing if URL has calculator params or we're on a sub-route
  const hasCalcParams = useMemo(() => {
    return urlState.weights != null || urlState.comparisonIds != null || urlState.comparisonRegions != null
      || urlState.startMonth != null || urlState.endMonth != null || urlState.region != null || urlState.activeTab != null
  }, [urlState])

  const [showLanding, setShowLanding] = useState(() => initialRoute !== 'metodologia' && !hasCalcParams)
  const [showMethodology, setShowMethodology] = useState(() => initialRoute === 'metodologia')

  const {
    weights,
    locked,
    isCustom,
    handleWeightChange,
    handleToggleLock,
    handleReset,
    handlePresetSelect,
  } = useWeights(urlState.weights)

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

  const chartRef = useRef<HTMLDivElement>(null)

  const regionData = ipcData.regions[region]
  const regionCategories = regionData?.categories ?? {}
  const generalIndex = regionCategories['00']

  const rawResult = useIPCCalculator(regionCategories, months, weights, startMonth, endMonth, generalIndex)

  const rawYoyEvolution = useMemo(
    () => computeYoY(regionCategories, months, weights, startMonth, endMonth, generalIndex),
    [regionCategories, months, weights, startMonth, endMonth, generalIndex]
  )

  // When weights are official, personal = official (avoid spurious differences from weighted-sum approximation vs INE general index)
  const result = useMemo(() => {
    if (isCustom) return rawResult
    return {
      ...rawResult,
      personalIPC: rawResult.officialIPC,
      difference: 0,
      evolution: rawResult.evolution.map(d => ({ ...d, personal: d.official })),
    }
  }, [rawResult, isCustom])

  const yoyEvolution = useMemo(() => {
    if (isCustom) return rawYoyEvolution
    return rawYoyEvolution.map(d => ({ ...d, personal: d.official }))
  }, [rawYoyEvolution, isCustom])

  const {
    comparisonIds,
    comparisonRegions,
    regionComparisonResults,
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
    urlState.comparisonRegions
  )

  const handleRegionChange = useCallback((code: string) => {
    trackEvent('region_change', { region: code })
    setRegion(code)
    saveRegion(code)
  }, [])

  const categoryVariations = useMemo(() => {
    const vars: Record<string, number> = {}
    for (const item of result.breakdown) {
      vars[item.code] = item.variation
    }
    return vars
  }, [result.breakdown])

  // Debounced syncToURL
  const debouncedSyncRef = useRef(debounce(syncToURL, 300))

  useEffect(() => {
    return () => debouncedSyncRef.current.cancel()
  }, [])

  // Sync state to URL (only when calculator is visible)
  useEffect(() => {
    if (!showLanding && !showMethodology) {
      debouncedSyncRef.current({ weights, startMonth, endMonth, region, activeTab, comparisonIds, comparisonRegions })
    }
  }, [showLanding, showMethodology, weights, startMonth, endMonth, region, activeTab, comparisonIds, comparisonRegions])

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const handleLandingStart = useCallback((quizWeights?: Record<string, number>) => {
    if (quizWeights) {
      handlePresetSelect(quizWeights)
    }
    window.history.pushState({ page: 'calculator' }, '', BASE)
    setShowLanding(false)
  }, [handlePresetSelect])

  const navigateToMethodology = useCallback(() => {
    trackEvent('methodology_view')
    window.history.pushState({ page: 'methodology' }, '', BASE + 'metodologia')
    setShowMethodology(true)
  }, [])

  // Browser back/forward: derive page from URL
  useEffect(() => {
    function handlePopState(e: PopStateEvent) {
      const route = getSubRoute()
      if (route === 'metodologia') {
        setShowMethodology(true)
        setShowLanding(false)
      } else {
        setShowMethodology(false)
        // Check if we should show calculator or landing
        if (e.state?.page === 'calculator') {
          setShowLanding(false)
        } else {
          const params = parseURLState()
          const hasParams = params.weights != null || params.startMonth != null
            || params.endMonth != null || params.region != null
            || params.activeTab != null || params.comparisonIds != null
            || params.comparisonRegions != null
          setShowLanding(!hasParams)
        }
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useDocumentMeta(
    showMethodology
      ? 'Metodología — Tu IPC Personal'
      : 'Tu IPC Personal — Descubre tu inflación real en España',
    showMethodology
      ? 'Cómo se calcula tu inflación personal: fuente de datos del INE, categorías ECOICOP, encadenamiento de bases y fórmulas.'
      : 'Ajusta los pesos de gasto a tu estilo de vida y compara tu inflación personal con el IPC oficial del INE. Datos actualizados por comunidad autónoma.',
  )

  if (showMethodology) {
    return (
      <main>
        <Suspense fallback={<LazyFallback />}>
          <Methodology onBack={() => window.history.back()} />
        </Suspense>
      </main>
    )
  }

  if (showLanding) {
    return <main><LandingPage onStart={handleLandingStart} /></main>
  }

  if (isEmbed) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-4">
        <KPICards
          personalIPC={result.personalIPC}
          officialIPC={result.officialIPC}
          difference={result.difference}
          isCustom={isCustom}
          startMonth={startMonth}
          endMonth={endMonth}
        />
        <Suspense fallback={<LazyFallback />}>
          <EvolutionChart
            data={result.evolution}
            isCustom={isCustom}
          />
        </Suspense>
      </main>
    )
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar — desktop: visible, mobile: Sheet */}
      <FilterSidebar
        region={region}
        onRegionChange={handleRegionChange}
        months={months}
        startMonth={startMonth}
        endMonth={endMonth}
        onStartChange={setStartMonth}
        onEndChange={setEndMonth}
        comparisonIds={comparisonIds}
        onToggleComparison={handleToggleComparison}
        onClearComparisons={handleClearComparisons}
        currentRegion={region}
        comparisonRegions={comparisonRegions}
        onToggleRegionComparison={handleToggleRegionComparison}
        onClearRegionComparisons={handleClearRegionComparisons}
        maxRegionComparisons={4 - allComparisons.length + regionComparisonResults.length}
        mobileOpen={mobileFiltersOpen}
        onMobileOpenChange={setMobileFiltersOpen}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
          <Header
            lastUpdated={ipcData.lastUpdated}
            dataMonth={ipcData.months[ipcData.months.length - 1]}
            onMethodology={navigateToMethodology}
            onOpenFilters={() => setMobileFiltersOpen(true)}
            actions={
              <div className="flex items-center gap-1">
                <CopyLinkButton />
                <ShareButton
                  personalIPC={result.personalIPC}
                  officialIPC={result.officialIPC}
                  difference={result.difference}
                  startMonth={startMonth}
                  endMonth={endMonth}
                  region={region}
                  isCustom={isCustom}
                  chartRef={chartRef}
                />
              </div>
            }
          />
          <KPICards
            personalIPC={result.personalIPC}
            officialIPC={result.officialIPC}
            difference={result.difference}
            comparisons={allComparisons.map(c => ({ label: c.label, ipc: c.result.personalIPC }))}
            isCustom={isCustom}
            startMonth={startMonth}
            endMonth={endMonth}
          />
          {isCustom && (
            <NarrativeSummary
              breakdown={result.breakdown}
              personalIPC={result.personalIPC}
              difference={result.difference}
              startMonth={startMonth}
              endMonth={endMonth}
            />
          )}
          <ShareSuggestion difference={result.difference} isCustom={isCustom} personalIPC={result.personalIPC} />
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === 'evolucion' && (
            <div role="tabpanel" id="evolucion-panel" aria-labelledby="evolucion-tab">
              <Suspense fallback={<LazyFallback />}>
                <EvolutionChart
                  ref={chartRef}
                  data={result.evolution}
                  yoyData={yoyEvolution}
                  comparisons={allComparisons.map(c => ({ label: c.label, data: c.result.evolution, yoyData: c.yoyEvolution }))}
                  isCustom={isCustom}
                />
              </Suspense>
            </div>
          )}
          {activeTab === 'desglose' && (
            <div role="tabpanel" id="desglose-panel" aria-labelledby="desglose-tab">
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
            </div>
          )}
          {activeTab === 'sueldo' && (
            <div role="tabpanel" id="sueldo-panel" aria-labelledby="sueldo-tab">
              <Suspense fallback={<LazyFallback />}>
                <SalaryCalculator
                  personalIPC={result.personalIPC}
                  startMonth={startMonth}
                  endMonth={endMonth}
                />
              </Suspense>
            </div>
          )}
          {activeTab === 'regiones' && (
            <div role="tabpanel" id="regiones-panel" aria-labelledby="regiones-tab">
              <Suspense fallback={<LazyFallback />}>
                <RegionRanking
                  ipcData={ipcData}
                  weights={weights}
                  startMonth={startMonth}
                  endMonth={endMonth}
                  currentRegion={region}
                />
              </Suspense>
            </div>
          )}
          <Footer onMethodology={navigateToMethodology} />
        </div>
      </main>
    </div>
  )
}
