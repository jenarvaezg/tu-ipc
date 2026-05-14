import type { IPCResult } from '@/data/types'

// When the user has not customised their basket (weights match the official
// INE basket), the weighted-sum approximation produces tiny drifts versus the
// INE general index. We force convergence so the UI does not surface those
// drifts as a real "personal vs official" difference.

export interface PersonalOfficialRow {
  personal: number
  official: number
}

function convergePersonalToOfficial<T extends PersonalOfficialRow>(items: T[]): T[] {
  return items.map(item => ({ ...item, personal: item.official }))
}

export function applyOfficialConvergenceToResult(
  rawResult: IPCResult,
  isCustom: boolean,
): IPCResult {
  if (isCustom) return rawResult
  return {
    ...rawResult,
    personalIPC: rawResult.officialIPC,
    difference: 0,
    evolution: convergePersonalToOfficial(rawResult.evolution),
  }
}

export function applyOfficialConvergenceToYoY<T extends PersonalOfficialRow>(
  yoyData: T[],
  isCustom: boolean,
): T[] {
  if (isCustom) return yoyData
  return convergePersonalToOfficial(yoyData)
}
