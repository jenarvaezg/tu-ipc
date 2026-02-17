import { Button } from '@/components/ui/button'
import { PRESETS } from '@/data/presets'
import { CATEGORIES } from '@/data/categories'
import { trackEvent } from '@/utils/analytics'

interface PresetSelectorProps {
  weights: Record<string, number>
  onSelect: (weights: Record<string, number>) => void
}

function isPresetActive(preset: Record<string, number>, current: Record<string, number>): boolean {
  return CATEGORIES.every(
    cat => Math.abs((preset[cat.code] ?? 0) - (current[cat.code] ?? 0)) < 0.05
  )
}

export default function PresetSelector({ weights, onSelect }: PresetSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {PRESETS.map((preset) => {
        const isActive = isPresetActive(preset.weights, weights)
        return (
          <Button
            key={preset.id}
            variant={isActive ? 'default' : 'secondary'}
            size="sm"
            onClick={() => { trackEvent('preset_select', { preset: preset.name }); onSelect(preset.weights) }}
            className={
              isActive
                ? ''
                : 'hover:bg-primary/10 hover:text-primary transition-colors'
            }
            title={preset.description}
          >
            {preset.icon} {preset.name}
          </Button>
        )
      })}
    </div>
  )
}
