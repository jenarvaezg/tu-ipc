import type { RubricaSeries } from '@/data/rubricasTypes'
import { computeGeneralBenchmark } from '@/utils/accumulatedInflation'
import { foldV2GroupCodeToV1 } from '@/utils/ecoicop.mjs'

export const MAX_SUGGESTED_SERIES = 4

function categoryCodeFromRubricaCode(rubricaCode: string): string | null {
  const match = rubricaCode.match(/^(\d{2})/)
  if (!match) return null
  return foldV2GroupCodeToV1(match[1])
}

export function getSuggestedSelection(
  series: RubricaSeries[],
  startMonth: string,
  endMonth: string,
  userWeights: Record<string, number>,
): string[] {
  if (!startMonth || !endMonth || startMonth > endMonth) return []

  const ranked = series
    .map(item => ({
      id: item.id,
      categoryCode: categoryCodeFromRubricaCode(item.codigo),
      endAccumulated: computeGeneralBenchmark(item.points, startMonth, endMonth),
    }))
    .filter(item => item.endAccumulated != null)
    .sort(
      (a, b) =>
        Math.abs(b.endAccumulated ?? 0) - Math.abs(a.endAccumulated ?? 0),
    )

  const topWeightedCategoryCodes = Object.entries(userWeights)
    .filter(([, weight]) => Number.isFinite(weight) && weight > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([code]) => code)

  const selectedIds: string[] = []

  for (const categoryCode of topWeightedCategoryCodes) {
    const bestInCategory = ranked.find(
      item =>
        item.categoryCode === categoryCode && !selectedIds.includes(item.id),
    )
    if (bestInCategory) selectedIds.push(bestInCategory.id)
  }

  for (const item of ranked) {
    if (selectedIds.length >= MAX_SUGGESTED_SERIES) break
    if (!selectedIds.includes(item.id)) selectedIds.push(item.id)
  }

  return selectedIds
}
