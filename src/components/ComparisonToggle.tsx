import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PRESETS } from '@/data/presets'

interface ComparisonToggleProps {
  comparisonId: string | null
  onSelect: (presetId: string | null) => void
}

export default function ComparisonToggle({ comparisonId, onSelect }: ComparisonToggleProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (comparisonId) {
    const preset = PRESETS.find(p => p.id === comparisonId)
    return (
      <div className="flex items-center gap-2 mb-6 justify-center">
        <span className="text-sm text-muted-foreground">
          Comparando con: <span className="font-medium text-foreground">{preset?.icon} {preset?.name}</span>
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelect(null)}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕ Quitar
        </Button>
      </div>
    )
  }

  return (
    <div className="relative mb-6 text-center" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
      >
        Comparar con...
      </Button>
      {open && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-10 bg-popover border border-border rounded-lg shadow-lg p-2 min-w-[200px]">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => {
                onSelect(preset.id)
                setOpen(false)
              }}
            >
              {preset.icon} {preset.name}
              <span className="block text-xs text-muted-foreground">{preset.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
