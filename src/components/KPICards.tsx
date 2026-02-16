import { Card, CardContent } from '@/components/ui/card'

interface KPICardsProps {
  personalIPC: number
  officialIPC: number
  difference: number
  comparisonIPC?: number
  comparisonLabel?: string
}

export default function KPICards({ personalIPC, officialIPC, difference, comparisonIPC, comparisonLabel }: KPICardsProps) {
  const personalColor = personalIPC >= 0 ? 'text-rose-400' : 'text-emerald-400'
  const officialColor = officialIPC >= 0 ? 'text-rose-400' : 'text-emerald-400'
  const diffColor = difference >= 0 ? 'text-rose-400' : 'text-emerald-400'

  const diffText =
    difference > 0
      ? 'Tu coste de vida sube más que la media'
      : difference < 0
        ? 'Tu coste de vida sube menos que la media'
        : 'Tu inflación coincide con la media'

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 ${comparisonIPC !== undefined ? 'lg:grid-cols-4' : ''} gap-4 mb-8`}>
      <Card className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <CardContent className="pt-6 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Tu IPC personal</p>
          <p className={`text-3xl font-bold ${personalColor}`}>
            {personalIPC >= 0 ? '+' : ''}{personalIPC.toFixed(2)}%
          </p>
        </CardContent>
      </Card>
      <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <CardContent className="pt-6 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">IPC oficial</p>
          <p className={`text-3xl font-bold ${officialColor}`}>
            {officialIPC >= 0 ? '+' : ''}{officialIPC.toFixed(2)}%
          </p>
        </CardContent>
      </Card>
      <Card className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <CardContent className="pt-6 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Diferencia</p>
          <p className={`text-3xl font-bold ${diffColor}`}>
            {difference >= 0 ? '+' : ''}{difference.toFixed(2)} pp
          </p>
          <p className={`text-xs mt-1 ${diffColor}`}>{diffText}</p>
        </CardContent>
      </Card>
      {comparisonIPC !== undefined && (
        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardContent className="pt-6 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">{comparisonLabel || 'Comparación'}</p>
            <p className={`text-3xl font-bold`} style={{ color: 'hsl(var(--chart-2))' }}>
              {comparisonIPC >= 0 ? '+' : ''}{comparisonIPC.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
