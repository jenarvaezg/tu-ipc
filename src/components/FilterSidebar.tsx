import { Settings, BarChart3 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import RegionSelector from '@/components/RegionSelector'
import PeriodSelector from '@/components/PeriodSelector'
import ComparisonToggle from '@/components/ComparisonToggle'
import RegionComparison from '@/components/RegionComparison'
import { useEffect, useMemo, useState } from 'react'

interface FilterSidebarProps {
  // Region
  region: string
  onRegionChange: (code: string) => void
  // Period
  months: string[]
  startMonth: string
  endMonth: string
  onStartChange: (month: string) => void
  onEndChange: (month: string) => void
  // Comparison profiles
  comparisonIds: string[]
  onToggleComparison: (presetId: string) => void
  onClearComparisons: () => void
  // Region comparisons
  currentRegion: string
  comparisonRegions: string[]
  onToggleRegionComparison: (regionCode: string) => void
  onClearRegionComparisons: () => void
  maxRegionComparisons: number
  // Mobile sheet control
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

function FilterSidebarContent({
  region,
  onRegionChange,
  months,
  startMonth,
  endMonth,
  onStartChange,
  onEndChange,
  comparisonIds,
  onToggleComparison,
  onClearComparisons,
  currentRegion,
  comparisonRegions,
  onToggleRegionComparison,
  onClearRegionComparisons,
  maxRegionComparisons
}: Omit<FilterSidebarProps, 'mobileOpen' | 'onMobileOpenChange'>) {
  return (
    <div className="space-y-6">
      {/* Section: CONFIGURACIÓN */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Configuración
          </span>
        </div>

        <div className="space-y-4">
          <RegionSelector value={region} onChange={onRegionChange} compact />
          <PeriodSelector
            months={months}
            startMonth={startMonth}
            endMonth={endMonth}
            onStartChange={onStartChange}
            onEndChange={onEndChange}
            compact
          />
        </div>
      </div>

      <Separator />

      {/* Section: COMPARAR */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Comparar
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Perfiles</label>
            <ComparisonToggle
              comparisonIds={comparisonIds}
              onToggle={onToggleComparison}
              onClear={onClearComparisons}
              compact
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2">Regiones</label>
            <RegionComparison
              currentRegion={currentRegion}
              comparisonRegions={comparisonRegions}
              onToggle={onToggleRegionComparison}
              onClear={onClearRegionComparisons}
              maxComparisons={maxRegionComparisons}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FilterSidebar(props: FilterSidebarProps) {
  const {
    mobileOpen,
    onMobileOpenChange,
    region,
    onRegionChange,
    months,
    startMonth,
    endMonth,
    onStartChange,
    onEndChange,
    comparisonIds,
    onToggleComparison,
    onClearComparisons,
    currentRegion,
    comparisonRegions,
    onToggleRegionComparison,
    onClearRegionComparisons,
    maxRegionComparisons,
  } = props

  const [draftRegion, setDraftRegion] = useState(region)
  const [draftStartMonth, setDraftStartMonth] = useState(startMonth)
  const [draftEndMonth, setDraftEndMonth] = useState(endMonth)
  const [draftComparisonIds, setDraftComparisonIds] = useState(comparisonIds)
  const [draftComparisonRegions, setDraftComparisonRegions] = useState(comparisonRegions)

  useEffect(() => {
    if (mobileOpen) {
      setDraftRegion(region)
      setDraftStartMonth(startMonth)
      setDraftEndMonth(endMonth)
      setDraftComparisonIds(comparisonIds)
      setDraftComparisonRegions(comparisonRegions)
    }
  }, [mobileOpen, region, startMonth, endMonth, comparisonIds, comparisonRegions])

  useEffect(() => {
    const allowedRegionCount = Math.max(0, 4 - draftComparisonIds.length)
    if (draftComparisonRegions.length > allowedRegionCount) {
      setDraftComparisonRegions((prev) => prev.slice(0, allowedRegionCount))
    }
  }, [draftComparisonIds, draftComparisonRegions.length])

  const draftMaxRegionComparisons = Math.max(0, 4 - draftComparisonIds.length)
  const hasPendingChanges = useMemo(() => {
    return (
      draftRegion !== region
      || draftStartMonth !== startMonth
      || draftEndMonth !== endMonth
      || !arraysEqual(draftComparisonIds, comparisonIds)
      || !arraysEqual(draftComparisonRegions, comparisonRegions)
    )
  }, [
    draftRegion,
    region,
    draftStartMonth,
    startMonth,
    draftEndMonth,
    endMonth,
    draftComparisonIds,
    comparisonIds,
    draftComparisonRegions,
    comparisonRegions,
  ])
  const pendingChangesCount = useMemo(() => {
    return (
      (draftRegion !== region ? 1 : 0)
      + (draftStartMonth !== startMonth || draftEndMonth !== endMonth ? 1 : 0)
      + (!arraysEqual(draftComparisonIds, comparisonIds) ? 1 : 0)
      + (!arraysEqual(draftComparisonRegions, comparisonRegions) ? 1 : 0)
    )
  }, [
    draftRegion,
    region,
    draftStartMonth,
    startMonth,
    draftEndMonth,
    endMonth,
    draftComparisonIds,
    comparisonIds,
    draftComparisonRegions,
    comparisonRegions,
  ])

  const applyArraySelection = (
    nextItems: string[],
    currentItems: string[],
    clear: () => void,
    toggle: (item: string) => void
  ) => {
    if (arraysEqual(nextItems, currentItems)) return
    clear()
    for (const item of nextItems) {
      toggle(item)
    }
  }

  const resetDraftToCurrent = () => {
    setDraftRegion(region)
    setDraftStartMonth(startMonth)
    setDraftEndMonth(endMonth)
    setDraftComparisonIds(comparisonIds)
    setDraftComparisonRegions(comparisonRegions)
  }

  const handleApplyMobile = () => {
    if (draftRegion !== region) onRegionChange(draftRegion)
    if (draftStartMonth !== startMonth) onStartChange(draftStartMonth)
    if (draftEndMonth !== endMonth) onEndChange(draftEndMonth)

    applyArraySelection(draftComparisonIds, comparisonIds, onClearComparisons, onToggleComparison)

    const finalRegions = draftComparisonRegions.slice(0, Math.max(0, 4 - draftComparisonIds.length))
    applyArraySelection(finalRegions, comparisonRegions, onClearRegionComparisons, onToggleRegionComparison)

    onMobileOpenChange(false)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-72 shrink-0 border-r border-border bg-muted/30 overflow-y-auto sticky top-0 h-screen p-4">
        <FilterSidebarContent
          region={region}
          onRegionChange={onRegionChange}
          months={months}
          startMonth={startMonth}
          endMonth={endMonth}
          onStartChange={onStartChange}
          onEndChange={onEndChange}
          comparisonIds={comparisonIds}
          onToggleComparison={onToggleComparison}
          onClearComparisons={onClearComparisons}
          currentRegion={currentRegion}
          comparisonRegions={comparisonRegions}
          onToggleRegionComparison={onToggleRegionComparison}
          onClearRegionComparisons={onClearRegionComparisons}
          maxRegionComparisons={maxRegionComparisons}
        />
      </aside>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="bottom" className="h-[92dvh] max-h-[92dvh] rounded-t-2xl px-0 pb-0">
          <SheetHeader className="sticky top-0 z-20 border-b border-border bg-background px-4 pb-3 pt-4">
            <div className="flex items-center justify-between gap-2 pr-8">
              <div className="min-w-0 text-left">
                <SheetTitle className="text-base">Filtros</SheetTitle>
                <SheetDescription>Configura tu calculadora de IPC</SheetDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={resetDraftToCurrent}
                  disabled={!hasPendingChanges}
                >
                  Restablecer
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={handleApplyMobile}
                  disabled={!hasPendingChanges}
                >
                  Aplicar{pendingChangesCount > 0 ? ` (${pendingChangesCount})` : ""}
                </Button>
              </div>
            </div>
          </SheetHeader>
          <div className="h-[calc(92dvh-84px)] overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
            <FilterSidebarContent
              region={draftRegion}
              onRegionChange={setDraftRegion}
              months={months}
              startMonth={draftStartMonth}
              endMonth={draftEndMonth}
              onStartChange={setDraftStartMonth}
              onEndChange={setDraftEndMonth}
              comparisonIds={draftComparisonIds}
              onToggleComparison={(presetId) => {
                setDraftComparisonIds((prev) =>
                  prev.includes(presetId) ? prev.filter((id) => id !== presetId) : [...prev, presetId]
                )
              }}
              onClearComparisons={() => setDraftComparisonIds([])}
              currentRegion={draftRegion}
              comparisonRegions={draftComparisonRegions}
              onToggleRegionComparison={(regionCode) => {
                setDraftComparisonRegions((prev) =>
                  prev.includes(regionCode) ? prev.filter((id) => id !== regionCode) : [...prev, regionCode]
                )
              }}
              onClearRegionComparisons={() => setDraftComparisonRegions([])}
              maxRegionComparisons={draftMaxRegionComparisons}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
