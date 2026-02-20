import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { REGIONS } from '@/data/regions'
import { COMPARISON_COLORS } from '@/data/constants'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface RegionComparisonProps {
  currentRegion: string
  comparisonRegions: string[]
  onToggle: (regionCode: string) => void
  onClear: () => void
  maxComparisons: number
  compact?: boolean
}

export default function RegionComparison({ currentRegion, comparisonRegions, onToggle, onClear, maxComparisons, compact }: RegionComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const availableRegions = REGIONS.filter(r => r.code !== currentRegion)

  return (
    <div className={compact ? '' : 'mb-6'}>
      {/* Active region badges — always visible */}
      {comparisonRegions.length > 0 && (
        <div className={`flex flex-wrap items-center gap-1.5 mb-2 ${compact ? 'justify-start' : 'justify-center'}`}>
          {comparisonRegions.map((code, i) => {
            const region = REGIONS.find(r => r.code === code)
            if (!region) return null
            const color = COMPARISON_COLORS[i % COMPARISON_COLORS.length]
            return (
              <Button
                key={code}
                variant="outline"
                size="sm"
                className="h-7 border-2 px-2 text-xs"
                style={{ borderColor: color, color }}
                onClick={() => onToggle(code)}
                aria-label={`Quitar comparación con ${region.name}`}
              >
                {region.name}
                <X className="ml-1 h-3 w-3" />
              </Button>
            )
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground h-6 px-2 text-xs"
          >
            Quitar todo
          </Button>
        </div>
      )}

      {/* Toggle button */}
      <div className={compact ? '' : 'flex justify-center'}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-xs hover:bg-primary/10 hover:text-primary transition-colors ${compact ? 'w-full justify-start' : ''}`}
        >
          Comparar regiones
          {comparisonRegions.length > 0 && ` (${comparisonRegions.length})`}
          {isExpanded ? <ChevronUp className="ml-1 h-3.5 w-3.5" /> : <ChevronDown className="ml-1 h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Expandable region grid */}
      {isExpanded && (
        <div className={`flex flex-wrap gap-1.5 mt-3 ${compact ? 'justify-start' : 'justify-center'}`}>
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
                className={`text-xs h-7 px-2.5 ${
                  isActive
                    ? 'border-2'
                    : 'hover:bg-primary/10 hover:text-primary transition-colors'
                }`}
                style={isActive ? { borderColor: color, color } : undefined}
              >
                {region.name}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
