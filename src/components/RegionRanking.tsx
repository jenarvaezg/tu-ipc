import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { computeIPC } from '@/hooks/useIPCCalculator'
import { REGIONS } from '@/data/regions'
import type { IPCData } from '@/data/types'

interface RegionRankingProps {
  ipcData: IPCData
  weights: Record<string, number>
  startMonth: string
  endMonth: string
  currentRegion: string
}

export default function RegionRanking({
  ipcData,
  weights,
  startMonth,
  endMonth,
  currentRegion,
}: RegionRankingProps) {
  const rankings = useMemo(() => {
    return REGIONS
      .filter(r => r.code !== 'nacional')
      .map(r => {
        const regionData = ipcData.regions[r.code]
        if (!regionData) return null
        const result = computeIPC(regionData.categories, ipcData.months, weights, startMonth, endMonth)
        return {
          code: r.code,
          name: r.name,
          personalIPC: result.personalIPC,
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.personalIPC - a.personalIPC)
  }, [ipcData, weights, startMonth, endMonth])

  if (rankings.length === 0) return null

  const maxAbs = Math.max(...rankings.map(r => Math.abs(r.personalIPC)), 0.01)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking por comunidad autónoma</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rankings.map((r, i) => {
          const isCurrent = r.code === currentRegion
          const width = Math.abs(r.personalIPC) / maxAbs * 100
          const isPositive = r.personalIPC >= 0

          return (
            <div
              key={r.code}
              className={`flex items-center gap-3 py-1.5 px-2 rounded transition-colors ${
                isCurrent ? 'bg-primary/10' : ''
              }`}
            >
              <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
              <span className={`text-sm flex-1 truncate ${isCurrent ? 'font-semibold' : ''}`}>
                {r.name}
              </span>
              <div className="w-32 h-4 bg-muted rounded-full overflow-hidden flex-shrink-0">
                <div
                  className={`h-full rounded-full transition-all ${
                    isPositive ? 'bg-rose-400/70' : 'bg-emerald-400/70'
                  }`}
                  style={{ width: `${Math.max(width, 2)}%` }}
                />
              </div>
              <span className={`text-sm font-mono w-16 text-right ${
                isPositive ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {r.personalIPC >= 0 ? '+' : ''}{r.personalIPC.toFixed(2)}%
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
