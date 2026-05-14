import { describe, it, expect } from 'vitest'
import type { IPCResult } from '@/data/types'
import {
  applyOfficialConvergenceToResult,
  applyOfficialConvergenceToYoY,
} from './officialConvergence'

const RAW_RESULT: IPCResult = {
  personalIPC: 3.27,
  officialIPC: 3.21,
  difference: 0.06,
  evolution: [
    { month: '2024-01', personal: 1.05, official: 1.04 },
    { month: '2024-02', personal: 1.81, official: 1.79 },
  ],
  breakdown: [],
}

describe('applyOfficialConvergenceToResult', () => {
  it('returns the raw result untouched when the basket is customised', () => {
    const out = applyOfficialConvergenceToResult(RAW_RESULT, true)
    expect(out).toBe(RAW_RESULT)
  })

  it('forces personal IPC to track the official IPC when not customised', () => {
    const out = applyOfficialConvergenceToResult(RAW_RESULT, false)
    expect(out.personalIPC).toBe(RAW_RESULT.officialIPC)
    expect(out.difference).toBe(0)
  })

  it('overwrites every evolution point so personal = official', () => {
    const out = applyOfficialConvergenceToResult(RAW_RESULT, false)
    expect(out.evolution).toEqual([
      { month: '2024-01', personal: 1.04, official: 1.04 },
      { month: '2024-02', personal: 1.79, official: 1.79 },
    ])
  })

  it('does not mutate the input', () => {
    const before = JSON.parse(JSON.stringify(RAW_RESULT))
    applyOfficialConvergenceToResult(RAW_RESULT, false)
    expect(RAW_RESULT).toEqual(before)
  })

  it('preserves breakdown verbatim', () => {
    const withBreakdown: IPCResult = {
      ...RAW_RESULT,
      breakdown: [
        {
          code: '01',
          name: 'Alimentos',
          variation: 5.4,
          weight: 21.9,
          contribution: 1.18,
        },
      ],
    }
    const out = applyOfficialConvergenceToResult(withBreakdown, false)
    expect(out.breakdown).toBe(withBreakdown.breakdown)
  })
})

describe('applyOfficialConvergenceToYoY', () => {
  const yoy = [
    { month: '2024-01', personal: 3.5, official: 3.2 },
    { month: '2024-02', personal: 2.9, official: 2.7 },
  ]

  it('returns the input unchanged when the basket is customised', () => {
    expect(applyOfficialConvergenceToYoY(yoy, true)).toBe(yoy)
  })

  it('forces personal to track official when not customised', () => {
    expect(applyOfficialConvergenceToYoY(yoy, false)).toEqual([
      { month: '2024-01', personal: 3.2, official: 3.2 },
      { month: '2024-02', personal: 2.7, official: 2.7 },
    ])
  })

  it('does not mutate the input', () => {
    const snapshot = JSON.parse(JSON.stringify(yoy))
    applyOfficialConvergenceToYoY(yoy, false)
    expect(yoy).toEqual(snapshot)
  })
})
