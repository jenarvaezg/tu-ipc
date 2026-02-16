import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
}: PeriodSelectorProps) {
  const lastMonth = months[months.length - 1]

  const presets = [
    { label: 'Último año', offset: 12 },
    { label: 'Últimos 2 años', offset: 24 },
    { label: 'Últimos 5 años', offset: 60 },
    { label: 'Desde 2021 (base)', month: '2021-01' },
    { label: 'Desde 2018', month: '2018-01' },
    { label: 'Desde 2015', month: '2015-01' },
    { label: 'Todo el histórico', month: '2000-01' },
  ]

  function applyPreset(preset: (typeof presets)[number]) {
    if (preset.month) {
      const found = months.find((m) => m >= preset.month!) || months[0]
      onStartChange(found)
    } else if (preset.offset) {
      const idx = Math.max(0, months.length - 1 - preset.offset)
      onStartChange(months[idx])
    }
    onEndChange(lastMonth)
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
            <Select value={startMonth} onValueChange={onStartChange}>
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
            <Select value={endMonth} onValueChange={onEndChange}>
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
