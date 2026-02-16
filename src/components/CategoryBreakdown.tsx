import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { CategoryVariation } from '@/data/types'
import { CATEGORIES } from '@/data/categories'

interface CategoryBreakdownProps {
  breakdown: CategoryVariation[]
}

export default function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  if (breakdown.length === 0) return null

  const maxAbsContrib = Math.max(...breakdown.map((b) => Math.abs(b.contribution)), 0.01)
  const iconMap = Object.fromEntries(CATEGORIES.map((c) => [c.code, c.icon]))

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Desglose por categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {breakdown.map((item) => {
            const barWidth = (Math.abs(item.contribution) / maxAbsContrib) * 100
            const isPositive = item.contribution >= 0

            return (
              <div key={item.code} className="flex items-center gap-3">
                <span className="text-lg w-7 text-center flex-shrink-0">
                  {iconMap[item.code] || ''}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-3 flex-shrink-0 text-sm">
                      <span className="text-muted-foreground w-12 text-right">
                        {item.weight.toFixed(1)}%
                      </span>
                      <span
                        className={`font-semibold w-16 text-right ${
                          item.variation >= 0 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {item.variation >= 0 ? '+' : ''}{item.variation.toFixed(1)}%
                      </span>
                      <span
                        className={`font-bold w-16 text-right ${
                          isPositive ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}{item.contribution.toFixed(2)}pp
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isPositive ? 'bg-red-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Contribución = peso normalizado x variación</span>
          <span>Ordenado por impacto absoluto</span>
        </div>
      </CardContent>
    </Card>
  )
}
