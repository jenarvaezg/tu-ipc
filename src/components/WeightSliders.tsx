import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, LockOpen } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CATEGORIES, OFFICIAL_WEIGHTS } from '@/data/categories'

interface WeightSlidersProps {
  weights: Record<string, number>
  locked: Set<string>
  onChange: (code: string, value: number) => void
  onToggleLock: (code: string) => void
  onReset: (type: 'official' | 'equal') => void
  categoryVariations: Record<string, number>
}

export default function WeightSliders({
  weights,
  locked,
  onChange,
  onToggleLock,
  onReset,
  categoryVariations,
}: WeightSlidersProps) {
  const lockedCount = locked.size

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle>Ajusta tus pesos de gasto</CardTitle>
            <CardDescription className="mt-1">
              Mueve los sliders según cuánto gastas en cada categoría. El resto se ajusta automáticamente.
              {lockedCount > 0 && (
                <span className="text-blue-400 font-medium">
                  {' '}{lockedCount} categoría{lockedCount > 1 ? 's' : ''} bloqueada{lockedCount > 1 ? 's' : ''}.
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => onReset('official')}>
              Pesos INE
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onReset('equal')}>
              Igualar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={200}>
          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const value = weights[cat.code] || 0
              const isLocked = locked.has(cat.code)
              const variation = categoryVariations[cat.code]
              const officialNorm = OFFICIAL_WEIGHTS[cat.code]

              return (
                <div key={cat.code} className={`pb-4 border-b border-border/30 last:border-0 last:pb-0 ${isLocked ? 'opacity-75' : ''}`}>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xl w-8 text-center flex-shrink-0 cursor-help">
                          {cat.icon}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-medium mb-1">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium truncate">
                          {cat.name}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">
                            INE: {officialNorm.toFixed(1)}%
                          </span>
                          <span className="text-sm font-semibold w-14 text-right">
                            {value.toFixed(1)}%
                          </span>
                          {variation != null && (
                            <Badge variant={variation >= 0 ? 'destructive' : 'secondary'} className={`text-xs border ${variation >= 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                              {variation >= 0 ? '+' : ''}{variation.toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={([v]) => onChange(cat.code, v)}
                        min={0}
                        max={50}
                        step={0.1}
                        disabled={isLocked}
                        className="w-full"
                        aria-label={cat.name}
                      />
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isLocked ? 'default' : 'ghost'}
                          size="icon"
                          className={`h-8 w-8 flex-shrink-0 ${isLocked ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-muted-foreground hover:text-foreground'}`}
                          onClick={() => onToggleLock(cat.code)}
                          aria-label={isLocked ? `Desbloquear ${cat.name}` : `Bloquear ${cat.name}`}
                        >
                          {isLocked ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            <LockOpen className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isLocked
                          ? `Desbloquear (fijado en ${value.toFixed(1)}%)`
                          : 'Bloquear este peso'}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
