import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface EvolutionChartProps {
  data: { month: string; personal: number; official: number }[]
  comparisonData?: { month: string; personal: number; official: number }[]
  comparisonLabel?: string
}

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

function formatTick(m: string): string {
  const [year, month] = m.split('-')
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year.slice(2)}`
}

export default function EvolutionChart({ data, comparisonData, comparisonLabel }: EvolutionChartProps) {
  if (data.length < 2) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6 text-center text-muted-foreground">
          Selecciona un rango de al menos 2 meses para ver la evolución
        </CardContent>
      </Card>
    )
  }

  const chartData = comparisonData
    ? data.map((d, i) => ({
        ...d,
        comparison: comparisonData[i]?.personal ?? null,
      }))
    : data

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Evolución del IPC</CardTitle>
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
                name === 'personal' ? 'Tu IPC' : name === 'official' ? 'IPC oficial' : comparisonLabel || 'Comparación',
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
              formatter={(value: string) =>
                value === 'personal' ? 'Tu IPC personal' : value === 'official' ? 'IPC oficial' : comparisonLabel || 'Comparación'
              }
            />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="personal"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="official"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 4 }}
            />
            {comparisonData && (
              <Line
                type="monotone"
                dataKey="comparison"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
