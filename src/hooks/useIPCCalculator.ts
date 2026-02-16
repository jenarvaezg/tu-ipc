import { useMemo } from 'react'
import type { IPCCategory, IPCResult } from '@/data/types'
import { OFFICIAL_WEIGHTS } from '@/data/categories'

export function computeIPC(
  categories: Record<string, IPCCategory>,
  months: string[],
  weights: Record<string, number>,
  startMonth: string,
  endMonth: string,
  generalIndex?: IPCCategory
): IPCResult {
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
    const normalizedWeights: Record<string, number> = {}
    for (const [code, w] of Object.entries(weights)) {
      normalizedWeights[code] = totalWeight > 0 ? w / totalWeight : 0
    }

    const totalOfficialWeight = Object.values(OFFICIAL_WEIGHTS).reduce((a, b) => a + b, 0)
    const normalizedOfficial: Record<string, number> = {}
    for (const [code, w] of Object.entries(OFFICIAL_WEIGHTS)) {
      normalizedOfficial[code] = w / totalOfficialWeight
    }

    const filteredMonths = months.filter((m) => m >= startMonth && m <= endMonth)

    const evolution = filteredMonths.map((month) => {
      let personal = 0
      let official = 0

      for (const code of Object.keys(weights)) {
        const cat = categories[code]
        if (!cat) continue

        const baseValue = cat.data[startMonth]
        const currentValue = cat.data[month]
        if (baseValue == null || currentValue == null || baseValue === 0) continue

        const variation = ((currentValue - baseValue) / baseValue) * 100

        personal += (normalizedWeights[code] || 0) * variation
        official += (normalizedOfficial[code] || 0) * variation
      }

      // Use generalIndex for official if available
      if (generalIndex) {
        const baseValue = generalIndex.data[startMonth]
        const currentValue = generalIndex.data[month]
        if (baseValue != null && currentValue != null && baseValue !== 0) {
          official = ((currentValue - baseValue) / baseValue) * 100
        }
      }

      return { month, personal: +personal.toFixed(2), official: +official.toFixed(2) }
    })

    const last = evolution[evolution.length - 1] || { personal: 0, official: 0 }

    const breakdown = Object.keys(weights)
      .map((code) => {
        const cat = categories[code]
        if (!cat) return null

        const baseValue = cat.data[startMonth]
        const endValue = cat.data[endMonth]
        if (baseValue == null || endValue == null || baseValue === 0) return null

        const variation = ((endValue - baseValue) / baseValue) * 100
        const weight = normalizedWeights[code] || 0
        const contribution = weight * variation

        return {
          code,
          name: cat.name,
          variation: +variation.toFixed(2),
          weight: +(weight * 100).toFixed(1),
          contribution: +contribution.toFixed(2),
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))

    return {
      personalIPC: last.personal,
      officialIPC: last.official,
      difference: +(last.personal - last.official).toFixed(2),
      evolution,
      breakdown,
    }
}

export function useIPCCalculator(
  categories: Record<string, IPCCategory>,
  months: string[],
  weights: Record<string, number>,
  startMonth: string,
  endMonth: string,
  generalIndex?: IPCCategory
): IPCResult {
  return useMemo(
    () => computeIPC(categories, months, weights, startMonth, endMonth, generalIndex),
    [categories, months, weights, startMonth, endMonth, generalIndex]
  )
}

export function computeYoY(
  categories: Record<string, IPCCategory>,
  months: string[],
  weights: Record<string, number>,
  startMonth: string,
  endMonth: string,
  generalIndex?: IPCCategory
): { month: string; personal: number; official: number }[] {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  const normalizedWeights: Record<string, number> = {}
  for (const [code, w] of Object.entries(weights)) {
    normalizedWeights[code] = totalWeight > 0 ? w / totalWeight : 0
  }

  const totalOfficialWeight = Object.values(OFFICIAL_WEIGHTS).reduce((a, b) => a + b, 0)
  const normalizedOfficial: Record<string, number> = {}
  for (const [code, w] of Object.entries(OFFICIAL_WEIGHTS)) {
    normalizedOfficial[code] = w / totalOfficialWeight
  }

  const filteredMonths = months.filter((m) => m >= startMonth && m <= endMonth)

  return filteredMonths.map((month) => {
    // Find the same month one year ago
    const [year, mon] = month.split('-')
    const prevMonth = `${parseInt(year) - 1}-${mon}`

    let personal = 0
    let official = 0

    for (const code of Object.keys(weights)) {
      const cat = categories[code]
      if (!cat) continue

      const prevValue = cat.data[prevMonth]
      const currentValue = cat.data[month]
      if (prevValue == null || currentValue == null || prevValue === 0) continue

      const variation = ((currentValue - prevValue) / prevValue) * 100

      personal += (normalizedWeights[code] || 0) * variation
      official += (normalizedOfficial[code] || 0) * variation
    }

    // Use generalIndex for official if available
    if (generalIndex) {
      const prevValue = generalIndex.data[prevMonth]
      const currentValue = generalIndex.data[month]
      if (prevValue != null && currentValue != null && prevValue !== 0) {
        official = ((currentValue - prevValue) / prevValue) * 100
      }
    }

    return { month, personal: +personal.toFixed(2), official: +official.toFixed(2) }
  })
}
