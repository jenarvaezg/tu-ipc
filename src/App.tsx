import { useState, useMemo, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import ipcDataRaw from '@/data/ipc-data.json'
import type { IPCData } from '@/data/types'
import { Card, CardContent } from '@/components/ui/card'
import { CATEGORIES, OFFICIAL_WEIGHTS } from '@/data/categories'
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
const PrivacyPolicy = lazy(() => import('@/components/PrivacyPolicy'))

const ipcData = ipcDataRaw as IPCData

const BASE = import.meta.env.BASE_URL // configurable via BASE_URL, '/' by default

function getSubRoute(): string {
  const path = window.location.pathname
  const sub = path.startsWith(BASE) ? path.slice(BASE.length) : path.slice(1)
  return sub.replace(/\/$/, '')
}

function getIsEmbed(): boolean {
  return new URLSearchParams(window.location.search).get('embed') === '1'
}

const STORAGE_KEY_REGION = 'tu-ipc-region'

function LazyFallback() {
  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-6 animate-pulse">
      <div className="mb-4 h-5 w-40 rounded bg-muted" />
      <div className="h-56 rounded bg-muted/70" />
      <span className="sr-only">Cargando contenido</span>
    </div>
  )
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
  const [isEmbed, setIsEmbed] = useState(getIsEmbed)

  // URL params take priority over localStorage
  const urlState = useMemo(() => parseURLState(), [])

  const initialRoute = useMemo(() => getSubRoute(), [])

  // Skip landing if URL has calculator params or we're on a sub-route
  const hasCalcParams = useMemo(() => {
    return urlState.weights != null || urlState.comparisonIds != null || urlState.comparisonRegions != null
      || urlState.startMonth != null || urlState.endMonth != null || urlState.region != null || urlState.activeTab != null
  }, [urlState])

  const [showLanding, setShowLanding] = useState(
    () => !isEmbed && initialRoute !== 'metodologia' && initialRoute !== 'privacidad' && !hasCalcParams
  )
  const [showMethodology, setShowMethodology] = useState(() => !isEmbed && initialRoute === 'metodologia')
  const [showPrivacy, setShowPrivacy] = useState(() => !isEmbed && initialRoute === 'privacidad')

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
  const topWeightDifferences = useMemo(() => {
    return CATEGORIES.map((cat) => {
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
      .filter((item) => Math.abs(item.diff) >= 0.1)
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
      .slice(0, 3)
  }, [weights])

  // Debounced syncToURL
  const debouncedSyncRef = useRef(debounce(syncToURL, 300))

  useEffect(() => {
    return () => debouncedSyncRef.current.cancel()
  }, [])

  // Sync state to URL (only when calculator is visible)
  useEffect(() => {
    if (!showLanding && !showMethodology && !showPrivacy) {
      debouncedSyncRef.current({ weights, startMonth, endMonth, region, activeTab, comparisonIds, comparisonRegions })
    }
  }, [showLanding, showMethodology, showPrivacy, weights, startMonth, endMonth, region, activeTab, comparisonIds, comparisonRegions])

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
    setShowPrivacy(false)
  }, [])

  const navigateToPrivacy = useCallback(() => {
    trackEvent('privacy_view')
    window.history.pushState({ page: 'privacy' }, '', BASE + 'privacidad')
    setShowPrivacy(true)
    setShowMethodology(false)
  }, [])

  // Browser back/forward: derive page from URL
  useEffect(() => {
    function handlePopState(e: PopStateEvent) {
      const embedMode = getIsEmbed()
      setIsEmbed(embedMode)
      if (embedMode) {
        setShowMethodology(false)
        setShowPrivacy(false)
        setShowLanding(false)
        return
      }

      const route = getSubRoute()
      if (route === 'metodologia') {
        setShowMethodology(true)
        setShowPrivacy(false)
        setShowLanding(false)
      } else if (route === 'privacidad') {
        setShowPrivacy(true)
        setShowMethodology(false)
        setShowLanding(false)
      } else {
        setShowMethodology(false)
        setShowPrivacy(false)
        // Check if we should show calculator or landing
        if (e.state?.page === 'calculator') {
          setShowLanding(false)
        } else {
          const params = parseURLState()
          const hasParams = params.weights != null || params.startMonth != null
            || params.endMonth != null || params.region != null
            || params.activeTab != null || params.comparisonIds != null
            || params.comparisonRegions != null
          setShowLanding(!hasParams && !embedMode)
        }
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useDocumentMeta(
    showMethodology
      ? 'Metodología — Tu IPC Personal'
      : showPrivacy
        ? 'Privacidad — Tu IPC Personal'
        : 'Tu IPC Personal — Estima tu inflación en España',
    showMethodology
      ? 'Cómo se calcula tu inflación personal: fuente de datos del INE, categorías ECOICOP, encadenamiento de bases y fórmulas.'
      : showPrivacy
        ? 'Política de privacidad de Tu IPC Personal: analítica sin cookies, datos locales, código abierto.'
        : 'Ajusta los pesos de gasto a tu estilo de vida y compara tu inflación personal con el IPC oficial del INE. Datos actualizados por comunidad autónoma.',
  )

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
        <p className="text-xs text-muted-foreground text-center mt-2">
          Datos del INE · <a href="https://tu-ipc.es" className="underline">tu-ipc.es</a>
        </p>
      </main>
    )
  }

  if (showMethodology) {
    return (
      <main>
        <Suspense fallback={<LazyFallback />}>
          <Methodology onBack={() => window.history.back()} />
        </Suspense>
      </main>
    )
  }

  if (showPrivacy) {
    return (
      <main>
        <Suspense fallback={<LazyFallback />}>
          <PrivacyPolicy onBack={() => window.history.back()} />
        </Suspense>
      </main>
    )
  }

  if (showLanding) {
    return <main><LandingPage onStart={handleLandingStart} /></main>
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
        maxRegionComparisons={Math.max(0, 4 - comparisonIds.length)}
        mobileOpen={mobileFiltersOpen}
        onMobileOpenChange={setMobileFiltersOpen}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 lg:py-8 lg:pb-8">
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
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            mobileSticky
            showDesgloseBadge
          />
          {activeTab === 'evolucion' && (
            <div role="tabpanel" id="evolucion-panel">
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
            <div role="tabpanel" id="desglose-panel">
              <Card className="mb-4 border-primary/30 bg-primary/5">
                <CardContent className="py-4">
                  <p className="text-sm font-medium text-foreground">
                    Principales diferencias de tu cesta frente al INE
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ajusta tus pesos para adaptar el cálculo a tu realidad.
                  </p>
                  {isCustom ? (
                    topWeightDifferences.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {topWeightDifferences.map((item) => (
                          <span
                            key={item.code}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground"
                          >
                            <span>{item.icon}</span>
                            <span className="max-w-[10rem] truncate">{item.name}</span>
                            <span className={item.diff >= 0 ? 'text-red-400' : 'text-emerald-400'}>
                              {item.diff >= 0 ? '+' : ''}{item.diff.toFixed(1)} pp
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Ya estás casi en la media oficial. Ajusta sliders para afinar aún más.
                      </p>
                    )
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Aún usas los pesos oficiales del INE. Elige un preset o mueve sliders para ver tus diferencias.
                    </p>
                  )}
                </CardContent>
              </Card>
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
            <div role="tabpanel" id="sueldo-panel">
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
            <div role="tabpanel" id="regiones-panel">
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
          <Footer onMethodology={navigateToMethodology} onPrivacy={navigateToPrivacy} />
        </div>
      </main>
    </div>
  )
}
