export interface IndexPoint {
  month: string
  value: number
}

export interface AccumulatedPoint {
  month: string
  value: number | null
}

function isValidIndex(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function toMonthMap(points: IndexPoint[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const point of points) {
    map.set(point.month, point.value)
  }
  return map
}

export function computeAccumulatedInflation(baseIndex: number, targetIndex: number): number | null {
  if (!isValidIndex(baseIndex) || !isValidIndex(targetIndex)) return null
  return ((targetIndex / baseIndex) - 1) * 100
}

export function computeAccumulatedAtMonth(
  points: IndexPoint[],
  baseMonth: string,
  targetMonth: string
): number | null {
  const monthMap = toMonthMap(points)
  const baseIndex = monthMap.get(baseMonth)
  const targetIndex = monthMap.get(targetMonth)

  if (!isValidIndex(baseIndex) || !isValidIndex(targetIndex)) return null
  return computeAccumulatedInflation(baseIndex, targetIndex)
}

export function buildAccumulatedSeries(
  points: IndexPoint[],
  baseMonth: string,
  months?: string[]
): AccumulatedPoint[] {
  const monthMap = toMonthMap(points)
  const baseIndex = monthMap.get(baseMonth)
  if (!isValidIndex(baseIndex)) return []

  const timeline = (months ?? points.map(point => point.month))
    .filter(month => month >= baseMonth)
    .sort()

  return timeline.map(month => {
    const targetIndex = monthMap.get(month)
    if (!isValidIndex(targetIndex)) return { month, value: null }
    return {
      month,
      value: computeAccumulatedInflation(baseIndex, targetIndex),
    }
  })
}

export function computeGeneralBenchmark(
  generalIndexPoints: IndexPoint[],
  baseMonth: string,
  endMonth: string
): number | null {
  return computeAccumulatedAtMonth(generalIndexPoints, baseMonth, endMonth)
}
