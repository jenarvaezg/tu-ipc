import { Settings, BarChart3 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import RegionSelector from '@/components/RegionSelector'
import PeriodSelector from '@/components/PeriodSelector'
import ComparisonToggle from '@/components/ComparisonToggle'
import RegionComparison from '@/components/RegionComparison'

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
  const { mobileOpen, onMobileOpenChange, ...contentProps } = props

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-72 shrink-0 border-r bg-muted/30 overflow-y-auto sticky top-0 h-screen p-4">
        <FilterSidebarContent {...contentProps} />
      </aside>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>Configura tu calculadora de IPC</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <FilterSidebarContent {...contentProps} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
