import { useMemo } from 'react'

export type PayType = '12' | '14' | 'anual'

interface SalaryResult {
  nominalGrowth: number    // percentage
  realGrowth: number       // percentage (nominal - personalIPC)
  monthlyChange: number    // euros per month change in purchasing power
}

function toAnnual(salary: number, payType: PayType): number {
  switch (payType) {
    case '12': return salary * 12
    case '14': return salary * 14
    case 'anual': return salary
  }
}

export function useSalaryComparison(
  salaryBefore: number,
  salaryAfter: number,
  payType: PayType,
  personalIPC: number,
): SalaryResult | null {
  return useMemo(() => {
    if (salaryBefore <= 0 || salaryAfter <= 0) return null

    const annualBefore = toAnnual(salaryBefore, payType)
    const annualAfter = toAnnual(salaryAfter, payType)

    const nominalGrowth = ((annualAfter - annualBefore) / annualBefore) * 100
    const realGrowth = nominalGrowth - personalIPC

    // Monthly purchasing power change in euros
    // What you'd need to earn monthly to match inflation, vs what you got
    const monthlyBefore = annualBefore / 12
    const monthlyAfter = annualAfter / 12
    const inflationAdjusted = monthlyBefore * (1 + personalIPC / 100)
    const monthlyChange = monthlyAfter - inflationAdjusted

    return {
      nominalGrowth: +nominalGrowth.toFixed(2),
      realGrowth: +realGrowth.toFixed(2),
      monthlyChange: +monthlyChange.toFixed(0),
    }
  }, [salaryBefore, salaryAfter, payType, personalIPC])
}
