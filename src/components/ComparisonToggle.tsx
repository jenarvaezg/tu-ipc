import { Button } from '@/components/ui/button'
import { PRESETS } from '@/data/presets'
import { COMPARISON_COLORS } from '@/data/constants'
import { cn } from '@/lib/utils'

interface ComparisonToggleProps {
  comparisonIds: string[]
  onToggle: (presetId: string) => void
  onClear: () => void
  compact?: boolean
  maxComparisons?: number
  ariaLabelledBy?: string
}

export default function ComparisonToggle({
  comparisonIds,
  onToggle,
  onClear,
  compact,
  maxComparisons = 4,
  ariaLabelledBy,
}: ComparisonToggleProps) {
  if (compact) {
    return (
      <div role="group" aria-labelledby={ariaLabelledBy}>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.filter(p => p.id !== 'oficial').map((preset) => {
            const idx = comparisonIds.indexOf(preset.id)
            const isActive = idx !== -1
            const color = isActive ? COMPARISON_COLORS[idx % COMPARISON_COLORS.length] : undefined
            const disabled = !isActive && comparisonIds.length >= maxComparisons
            return (
              <Button
                key={preset.id}
                variant={isActive ? 'outline' : 'secondary'}
                size="sm"
                onClick={() => onToggle(preset.id)}
                disabled={disabled}
                className={cn(
                  'text-xs h-7 px-2 w-full justify-start min-w-0',
                  isActive ? 'border-2' : 'hover:bg-primary/10 hover:text-primary transition-colors'
                )}
                style={isActive ? { borderColor: color, color } : undefined}
              >
                <span className="truncate">{preset.icon} {preset.name}</span>
              </Button>
            )
          })}
        </div>
        {comparisonIds.length > 0 && (
          <Button
            variant="link"
            size="sm"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground mt-1 h-auto p-0"
          >
            Quitar todo
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-6" role="group" aria-labelledby={ariaLabelledBy}>
      <span className="text-sm text-muted-foreground mr-1">Comparar con:</span>
      {PRESETS.filter(p => p.id !== 'oficial').map((preset) => {
        const idx = comparisonIds.indexOf(preset.id)
        const isActive = idx !== -1
        const color = isActive ? COMPARISON_COLORS[idx % COMPARISON_COLORS.length] : undefined
        const disabled = !isActive && comparisonIds.length >= maxComparisons
        return (
          <Button
            key={preset.id}
            variant={isActive ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => onToggle(preset.id)}
            disabled={disabled}
            className={
              isActive
                ? 'border-2'
                : 'hover:bg-primary/10 hover:text-primary transition-colors'
            }
            style={isActive ? { borderColor: color, color } : undefined}
          >
            {preset.icon} {preset.name}
          </Button>
        )
      })}
      {comparisonIds.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground"
        >
          Quitar todo
        </Button>
      )}
    </div>
  )
}
