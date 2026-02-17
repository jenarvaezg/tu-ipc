import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/utils/analytics'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PeriodSelectorProps {
  months: string[]
  startMonth: string
  endMonth: string
  onStartChange: (month: string) => void
  onEndChange: (month: string) => void
  compact?: boolean
}

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

function formatMonth(m: string): string {
  const [year, month] = m.split('-')
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`
}

export default function PeriodSelector({
  months,
  startMonth,
  endMonth,
  onStartChange,
  onEndChange,
  compact,
}: PeriodSelectorProps) {
  const lastMonth = months[months.length - 1]

  const ALL_PRESETS = [
    { label: 'Último año', offset: 12 },
    { label: 'Últimos 2 años', offset: 24 },
    { label: 'Últimos 5 años', offset: 60 },
    { label: 'Desde 2021 (base)', month: '2021-01' },
    { label: 'Desde 2018', month: '2018-01' },
    { label: 'Desde 2015', month: '2015-01' },
    { label: 'Todo el histórico', month: '2000-01' },
  ]

  const COMPACT_PRESETS = [
    { label: '1 año', offset: 12 },
    { label: '2 años', offset: 24 },
    { label: '5 años', offset: 60 },
    { label: 'Máximo', month: '2000-01' },
  ]

  const presets = compact ? COMPACT_PRESETS : ALL_PRESETS

  function applyPreset(preset: (typeof presets)[number]) {
    trackEvent('period_preset', { period: preset.label })
    if (preset.month) {
      const found = months.find((m) => m >= preset.month!) || months[0]
      onStartChange(found)
    } else if (preset.offset) {
      const idx = Math.max(0, months.length - 1 - preset.offset)
      onStartChange(months[idx])
    }
    onEndChange(lastMonth)
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <Button
              key={p.label}
              variant="secondary"
              size="sm"
              onClick={() => applyPreset(p)}
              className="text-xs h-7 px-2.5 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Desde</label>
            <Select value={startMonth} onValueChange={(v) => {
              onStartChange(v)
              if (v >= endMonth) {
                const nextIdx = months.indexOf(v) + 1
                if (nextIdx < months.length) onEndChange(months[nextIdx])
              }
            }}>
              <SelectTrigger className="w-full h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>{formatMonth(m)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Hasta</label>
            <Select value={endMonth} onValueChange={(v) => {
              onEndChange(v)
              if (v <= startMonth) {
                const prevIdx = months.indexOf(v) - 1
                if (prevIdx >= 0) onStartChange(months[prevIdx])
              }
            }}>
              <SelectTrigger className="w-full h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>{formatMonth(m)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Periodo de comparación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <Button
              key={p.label}
              variant="secondary"
              size="sm"
              onClick={() => applyPreset(p)}
              className="text-xs h-7 px-2.5 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Desde</label>
            <Select value={startMonth} onValueChange={(v) => {
              onStartChange(v)
              if (v >= endMonth) {
                const nextIdx = months.indexOf(v) + 1
                if (nextIdx < months.length) onEndChange(months[nextIdx])
              }
            }}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>{formatMonth(m)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Hasta</label>
            <Select value={endMonth} onValueChange={(v) => {
              onEndChange(v)
              if (v <= startMonth) {
                const prevIdx = months.indexOf(v) - 1
                if (prevIdx >= 0) onStartChange(months[prevIdx])
              }
            }}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>{formatMonth(m)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
