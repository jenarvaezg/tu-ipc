import { Card, CardContent } from '@/components/ui/card'

const COMPARISON_COLORS = [
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

interface ComparisonKPI {
  label: string
  ipc: number
}

interface KPICardsProps {
  personalIPC: number
  officialIPC: number
  difference: number
  comparisons?: ComparisonKPI[]
  isCustom?: boolean
}

export default function KPICards({ personalIPC, officialIPC, difference, comparisons = [], isCustom = true }: KPICardsProps) {
  const personalColor = personalIPC >= 0 ? 'text-rose-400' : 'text-emerald-400'
  const officialColor = officialIPC >= 0 ? 'text-rose-400' : 'text-emerald-400'
  const diffColor = difference >= 0 ? 'text-rose-400' : 'text-emerald-400'

  const diffText =
    difference > 0
      ? 'Tu coste de vida sube más que la media'
      : difference < 0
        ? 'Tu coste de vida sube menos que la media'
        : 'Tu inflación coincide con la media'

  const baseCards = isCustom ? 3 : 1
  const totalCards = baseCards + comparisons.length
  const gridCols = totalCards <= 1 ? 'md:grid-cols-1 max-w-sm mx-auto' :
    totalCards <= 3 ? `md:grid-cols-${totalCards}` :
    totalCards === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
    'md:grid-cols-3 lg:grid-cols-' + Math.min(totalCards, 6)

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-4 mb-8`}>
      {isCustom && (
        <Card className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <CardContent className="pt-6 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">Tu IPC personal</p>
            <p className={`text-3xl font-bold ${personalColor}`}>
              {personalIPC >= 0 ? '+' : ''}{personalIPC.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      )}
      <Card className="animate-slide-up" style={{ animationDelay: isCustom ? '0.1s' : '0.05s' }}>
        <CardContent className="pt-6 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">IPC oficial</p>
          <p className={`text-3xl font-bold ${officialColor}`}>
            {officialIPC >= 0 ? '+' : ''}{officialIPC.toFixed(2)}%
          </p>
        </CardContent>
      </Card>
      {isCustom && (
        <Card className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <CardContent className="pt-6 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">Diferencia</p>
            <p className={`text-3xl font-bold ${diffColor}`}>
              {difference >= 0 ? '+' : ''}{difference.toFixed(2)} pp
            </p>
            <p className={`text-xs mt-1 ${diffColor}`}>{diffText}</p>
          </CardContent>
        </Card>
      )}
      {comparisons.map((comp, i) => (
        <Card key={comp.label} className="animate-slide-up" style={{ animationDelay: `${0.2 + i * 0.05}s` }}>
          <CardContent className="pt-6 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">{comp.label}</p>
            <p className="text-3xl font-bold" style={{ color: COMPARISON_COLORS[i % COMPARISON_COLORS.length] }}>
              {comp.ipc >= 0 ? '+' : ''}{comp.ipc.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
