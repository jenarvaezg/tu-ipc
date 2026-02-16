import { CATEGORIES } from '@/data/categories'

export function redistributeWeights(
  currentWeights: Record<string, number>,
  changedCode: string,
  newValue: number,
  lockedCodes: Set<string>
): Record<string, number> {
  const oldValue = currentWeights[changedCode] || 0
  const delta = newValue - oldValue

  const adjustable = CATEGORIES
    .filter((c) => c.code !== changedCode && !lockedCodes.has(c.code))
    .map((c) => c.code)

  if (adjustable.length === 0) return currentWeights

  const adjustableTotal = adjustable.reduce((sum, c) => sum + (currentWeights[c] || 0), 0)
  const next = { ...currentWeights, [changedCode]: Math.max(0, Math.min(100, newValue)) }

  if (adjustableTotal > 0) {
    for (const c of adjustable) {
      const share = (currentWeights[c] || 0) / adjustableTotal
      next[c] = Math.max(0, (currentWeights[c] || 0) - delta * share)
    }
  } else {
    // All adjustable are at 0, distribute equally
    const each = -delta / adjustable.length
    for (const c of adjustable) {
      next[c] = Math.max(0, each)
    }
  }

  return next
}
