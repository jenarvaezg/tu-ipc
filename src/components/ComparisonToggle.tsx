import { Button } from '@/components/ui/button'
import { PRESETS } from '@/data/presets'
import { COMPARISON_COLORS } from '@/data/constants'

interface ComparisonToggleProps {
  comparisonIds: string[]
  onToggle: (presetId: string) => void
  onClear: () => void
}

export default function ComparisonToggle({ comparisonIds, onToggle, onClear }: ComparisonToggleProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
      <span className="text-sm text-muted-foreground mr-1">Comparar con:</span>
      {PRESETS.filter(p => p.id !== 'oficial').map((preset) => {
        const idx = comparisonIds.indexOf(preset.id)
        const isActive = idx !== -1
        const color = isActive ? COMPARISON_COLORS[idx % COMPARISON_COLORS.length] : undefined
        return (
          <Button
            key={preset.id}
            variant={isActive ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => onToggle(preset.id)}
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
