import { Card, CardContent } from '@/components/ui/card'
import { COMPARISON_COLORS } from '@/data/constants'

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
  startMonth: string
  endMonth: string
}

function monthsDiff(start: string, end: string): number {
  const [sy, sm] = start.split('-').map(Number)
  const [ey, em] = end.split('-').map(Number)
  return (ey - sy) * 12 + (em - sm)
}

function halvingYears(rate: number, months: number): number | null {
  if (rate <= 0 || months <= 0) return null
  const annualRate = Math.pow(1 + rate / 100, 12 / months) - 1
  if (annualRate <= 0) return null
  return Math.log(2) / Math.log(1 + annualRate)
}

function formatHalving(years: number | null): string | null {
  if (years == null || years > 200) return null
  if (years >= 1) return `${Math.round(years)} años`
  const months = Math.round(years * 12)
  return months <= 1 ? '1 mes' : `${months} meses`
}

export default function KPICards({ personalIPC, officialIPC, difference, comparisons = [], isCustom = true, startMonth, endMonth }: KPICardsProps) {
  const personalColor = personalIPC >= 0 ? 'text-rose-400' : 'text-emerald-400'
  const officialColor = officialIPC >= 0 ? 'text-rose-400' : 'text-emerald-400'
  const diffColor = difference >= 0 ? 'text-rose-400' : 'text-emerald-400'

  const months = monthsDiff(startMonth, endMonth)
  const personalHalving = formatHalving(halvingYears(personalIPC, months))
  const officialHalving = formatHalving(halvingYears(officialIPC, months))

  const diffText =
    difference > 0
      ? 'Tu coste de vida sube más que la media'
      : difference < 0
        ? 'Tu coste de vida sube menos que la media'
        : 'Tu inflación coincide con la media'

  const GRID_CLASSES: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
    5: 'md:grid-cols-3 lg:grid-cols-5',
    6: 'md:grid-cols-3 lg:grid-cols-6',
  }
  const baseCards = isCustom ? 3 : 1
  const totalCards = baseCards + comparisons.length
  const gridCols = GRID_CLASSES[Math.min(totalCards, 6)] || 'md:grid-cols-3'

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-4 mb-8`}>
      {isCustom && (
        <Card className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <CardContent className="pt-6 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">Tu IPC personal</p>
            <p className={`text-3xl font-bold ${personalColor}`}>
              {personalIPC >= 0 ? '+' : ''}{personalIPC.toFixed(2)}%
            </p>
            {personalHalving && (
              <p className="text-xs text-muted-foreground mt-2">
                Tu dinero vale la mitad en ~{personalHalving}
              </p>
            )}
          </CardContent>
        </Card>
      )}
      <Card className="animate-slide-up" style={{ animationDelay: isCustom ? '0.1s' : '0.05s' }}>
        <CardContent className="pt-6 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">IPC oficial</p>
          <p className={`text-3xl font-bold ${officialColor}`}>
            {officialIPC >= 0 ? '+' : ''}{officialIPC.toFixed(2)}%
          </p>
          {officialHalving && (
            <p className="text-xs text-muted-foreground mt-2">
              {isCustom ? 'El dinero' : 'Tu dinero'} vale la mitad en ~{officialHalving}
            </p>
          )}
          {!isCustom && !officialHalving && (
            <p className="text-xs text-muted-foreground mt-2">
              Personaliza tus pesos para calcular tu IPC
            </p>
          )}
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
      {comparisons.map((comp, i) => {
        const compHalving = formatHalving(halvingYears(comp.ipc, months))
        return (
          <Card key={comp.label} className="animate-slide-up" style={{ animationDelay: `${0.2 + i * 0.05}s` }}>
            <CardContent className="pt-6 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">{comp.label}</p>
              <p className="text-3xl font-bold" style={{ color: COMPARISON_COLORS[i % COMPARISON_COLORS.length] }}>
                {comp.ipc >= 0 ? '+' : ''}{comp.ipc.toFixed(2)}%
              </p>
              {compHalving && (
                <p className="text-xs text-muted-foreground mt-2">
                  El dinero vale la mitad en ~{compHalving}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
