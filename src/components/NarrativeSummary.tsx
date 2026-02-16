import { Card, CardContent } from '@/components/ui/card'
import { formatMonth } from '@/utils/formatMonth'
import type { CategoryVariation } from '@/data/types'

interface NarrativeSummaryProps {
  breakdown: CategoryVariation[]
  personalIPC: number
  difference: number
  startMonth: string
  endMonth: string
}

export default function NarrativeSummary({
  breakdown,
  personalIPC,
  difference,
  startMonth,
  endMonth,
}: NarrativeSummaryProps) {
  if (breakdown.length === 0) return null

  // Find category with highest positive contribution (hurts most)
  const sorted = [...breakdown].sort((a, b) => b.contribution - a.contribution)
  const mostHurts = sorted[0]
  const mostHelps = sorted[sorted.length - 1]

  const period = `${formatMonth(startMonth)} – ${formatMonth(endMonth)}`

  const absDiff = Math.abs(difference)
  const diffText = difference > 0
    ? `${absDiff.toFixed(1)} puntos porcentuales por encima de la media`
    : difference < 0
      ? `${absDiff.toFixed(1)} puntos porcentuales por debajo de la media`
      : 'exactamente en la media nacional'

  const parts: string[] = []

  parts.push(
    `Entre ${period}, tu inflación personal ha sido del ${personalIPC >= 0 ? '+' : ''}${personalIPC.toFixed(2)}%, ${diffText}.`
  )

  if (mostHurts && mostHurts.contribution > 0) {
    parts.push(
      `La categoría que más te afecta es ${mostHurts.name.toLowerCase()} (+${mostHurts.variation.toFixed(1)}%), que aporta ${mostHurts.contribution.toFixed(2)} pp a tu IPC.`
    )
  }

  if (mostHelps && mostHelps.contribution < 0) {
    parts.push(
      `En cambio, ${mostHelps.name.toLowerCase()} (${mostHelps.variation.toFixed(1)}%) reduce tu inflación en ${Math.abs(mostHelps.contribution).toFixed(2)} pp.`
    )
  }

  return (
    <Card className="mb-8 animate-slide-up" style={{ animationDelay: '0.25s' }}>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {parts.join(' ')}
        </p>
      </CardContent>
    </Card>
  )
}
