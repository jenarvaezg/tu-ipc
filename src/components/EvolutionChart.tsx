import { forwardRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

import { COMPARISON_COLORS } from '@/data/constants'
import { HISTORICAL_EVENTS } from '@/data/historicalEvents'

interface ComparisonSeries {
  label: string
  data: { month: string; personal: number; official: number }[]
}

interface EvolutionChartProps {
  data: { month: string; personal: number; official: number }[]
  yoyData?: { month: string; personal: number; official: number }[]
  comparisons?: ComparisonSeries[]
  isCustom?: boolean
}

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

function formatTick(m: string): string {
  const [year, month] = m.split('-')
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year.slice(2)}`
}

const EvolutionChart = forwardRef<HTMLDivElement, EvolutionChartProps>(function EvolutionChart({ data, yoyData, comparisons = [], isCustom = true }, ref) {
  const [mode, setMode] = useState<'acumulado' | 'interanual'>('acumulado')

  // Select data based on mode
  const activeData = mode === 'interanual' && yoyData ? yoyData : data

  if (activeData.length < 2) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6 text-center text-muted-foreground">
          Selecciona un rango de al menos 2 meses para ver la evolución
        </CardContent>
      </Card>
    )
  }

  // Merge comparison data into chart data (only in acumulado mode)
  const chartData = activeData.map((d, i) => {
    const row: Record<string, unknown> = { ...d }
    if (mode === 'acumulado') {
      comparisons.forEach((comp, ci) => {
        row[`comp_${ci}`] = comp.data[i]?.personal ?? null
      })
    }
    return row
  })

  // Build label map for tooltip/legend
  const labelMap: Record<string, string> = {
    personal: 'Tu IPC personal',
    official: 'IPC oficial',
  }
  if (mode === 'acumulado') {
    comparisons.forEach((comp, ci) => {
      labelMap[`comp_${ci}`] = comp.label
    })
  }

  return (
    <Card ref={ref} className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Evolución del IPC</CardTitle>
          {yoyData && (
            <div className="flex gap-1" role="group" aria-label="Modo de visualización">
              <Button
                variant={mode === 'acumulado' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setMode('acumulado')}
                className={mode === 'acumulado' ? '' : 'hover:bg-primary/10 hover:text-primary transition-colors'}
              >
                Acumulado
              </Button>
              <Button
                variant={mode === 'interanual' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setMode('interanual')}
                className={mode === 'interanual' ? '' : 'hover:bg-primary/10 hover:text-primary transition-colors'}
              >
                Interanual
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="month"
              tickFormatter={formatTick}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toFixed(2)}%`,
                labelMap[name] || name,
              ]}
              labelFormatter={formatTick}
              contentStyle={{
                borderRadius: 'var(--radius)',
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
              }}
              labelStyle={{
                color: 'hsl(var(--card-foreground))',
                fontWeight: 600,
              }}
              itemStyle={{
                color: 'hsl(var(--card-foreground))',
              }}
            />
            <Legend
              formatter={(value: string) => labelMap[value] || value}
            />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            {activeData.length <= 60 && HISTORICAL_EVENTS
              .filter(event => {
                const first = activeData[0]?.month
                const last = activeData[activeData.length - 1]?.month
                return first && last && event.month >= first && event.month <= last
              })
              .map(event => (
                <ReferenceLine
                  key={event.month}
                  x={event.month}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="2 4"
                  strokeOpacity={0.5}
                  label={{
                    value: event.shortLabel,
                    position: 'top',
                    fontSize: 10,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />
              ))}
            {isCustom && (
              <Line
                type="monotone"
                dataKey="personal"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="official"
              stroke={isCustom ? 'hsl(var(--muted-foreground))' : 'hsl(var(--chart-1))'}
              strokeWidth={isCustom ? 2 : 2.5}
              strokeDasharray={isCustom ? '6 3' : undefined}
              dot={false}
              activeDot={{ r: isCustom ? 4 : 5 }}
            />
            {mode === 'acumulado' && comparisons.map((_, ci) => (
              <Line
                key={`comp_${ci}`}
                type="monotone"
                dataKey={`comp_${ci}`}
                stroke={COMPARISON_COLORS[ci % COMPARISON_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
})

export default EvolutionChart
