import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const DISMISS_KEY = 'tu-ipc-share-suggestion-dismissed'

interface ShareSuggestionProps {
  difference: number
  isCustom: boolean
}

export default function ShareSuggestion({ difference, isCustom }: ShareSuggestionProps) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  const show = !dismissed && isCustom && Math.abs(difference) > 1.5

  if (!show) return null

  const direction = difference > 0 ? 'mayor' : 'menor'
  const color = difference > 0 ? 'text-rose-400' : 'text-emerald-400'

  const handleDismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch { /* ignore */ }
  }

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <CardContent className="pt-6 flex items-start gap-3">
        <p className="text-sm text-muted-foreground flex-1">
          Tu inflación es{' '}
          <span className={`font-semibold ${color}`}>
            {Math.abs(difference).toFixed(1)} pp {direction}
          </span>{' '}
          que la media nacional. ¡Comparte tu resultado con amigos o en redes!
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={handleDismiss}
          aria-label="Cerrar sugerencia"
        >
          <X className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}
