import { Button } from '@/components/ui/button'
import { REGIONS } from '@/data/regions'

const COMPARISON_COLORS = [
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

interface RegionComparisonProps {
  currentRegion: string
  comparisonRegions: string[]
  onToggle: (regionCode: string) => void
  onClear: () => void
  maxComparisons: number
}

export default function RegionComparison({ currentRegion, comparisonRegions, onToggle, onClear, maxComparisons }: RegionComparisonProps) {
  const availableRegions = REGIONS.filter(r => r.code !== currentRegion)

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground mr-1">Comparar regiones:</span>
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
          {availableRegions.map((region) => {
            const idx = comparisonRegions.indexOf(region.code)
            const isActive = idx !== -1
            const color = isActive ? COMPARISON_COLORS[idx % COMPARISON_COLORS.length] : undefined
            const disabled = !isActive && maxComparisons <= 0

            return (
              <Button
                key={region.code}
                variant={isActive ? 'outline' : 'secondary'}
                size="sm"
                onClick={() => onToggle(region.code)}
                disabled={disabled}
                className={
                  isActive
                    ? 'border-2 shrink-0'
                    : 'hover:bg-primary/10 hover:text-primary transition-colors shrink-0'
                }
                style={isActive ? { borderColor: color, color } : undefined}
              >
                {region.name}
              </Button>
            )
          })}
        </div>
        {comparisonRegions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            Quitar
          </Button>
        )}
      </div>
    </div>
  )
}
