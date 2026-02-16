import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useIPCCalculator } from './useIPCCalculator'
import type { IPCCategory } from '@/data/types'

const mockCategories: Record<string, IPCCategory> = {
  '01': {
    name: 'Alimentos',
    data: {
      '2024-01': 100,
      '2024-06': 103,
      '2024-12': 105,
    },
  },
  '07': {
    name: 'Transporte',
    data: {
      '2024-01': 100,
      '2024-06': 98,
      '2024-12': 102,
    },
  },
}

const months = ['2024-01', '2024-06', '2024-12']

describe('useIPCCalculator', () => {
  it('returns zero when start equals end', () => {
    const { result } = renderHook(() =>
      useIPCCalculator(mockCategories, months, { '01': 50, '07': 50 }, '2024-01', '2024-01')
    )
    expect(result.current.personalIPC).toBe(0)
    expect(result.current.officialIPC).toBe(0)
    expect(result.current.difference).toBe(0)
  })

  it('calculates weighted personal IPC', () => {
    const weights = { '01': 80, '07': 20 }
    const { result } = renderHook(() =>
      useIPCCalculator(mockCategories, months, weights, '2024-01', '2024-12')
    )
    // 01: (105-100)/100 = 5%, 07: (102-100)/100 = 2%
    // personal: 0.8*5 + 0.2*2 = 4.4%
    expect(result.current.personalIPC).toBe(4.4)
  })

  it('calculates difference between personal and official', () => {
    const weights = { '01': 100, '07': 0 }
    const { result } = renderHook(() =>
      useIPCCalculator(mockCategories, months, weights, '2024-01', '2024-12')
    )
    // personal is 100% alimentos = 5%
    // official uses OFFICIAL_WEIGHTS
    expect(result.current.personalIPC).toBe(5)
    expect(result.current.difference).toBe(
      +(result.current.personalIPC - result.current.officialIPC).toFixed(2)
    )
  })

  it('returns evolution data for each month in range', () => {
    const { result } = renderHook(() =>
      useIPCCalculator(mockCategories, months, { '01': 50, '07': 50 }, '2024-01', '2024-12')
    )
    expect(result.current.evolution).toHaveLength(3)
    expect(result.current.evolution[0].month).toBe('2024-01')
    expect(result.current.evolution[2].month).toBe('2024-12')
  })

  it('returns breakdown sorted by absolute contribution', () => {
    const { result } = renderHook(() =>
      useIPCCalculator(mockCategories, months, { '01': 50, '07': 50 }, '2024-01', '2024-12')
    )
    expect(result.current.breakdown.length).toBeGreaterThan(0)
    for (let i = 1; i < result.current.breakdown.length; i++) {
      expect(Math.abs(result.current.breakdown[i - 1].contribution))
        .toBeGreaterThanOrEqual(Math.abs(result.current.breakdown[i].contribution))
    }
  })

  it('handles empty categories gracefully', () => {
    const { result } = renderHook(() =>
      useIPCCalculator({}, months, { '01': 50 }, '2024-01', '2024-12')
    )
    expect(result.current.personalIPC).toBe(0)
    expect(result.current.breakdown).toHaveLength(0)
  })

  it('handles missing month data gracefully', () => {
    const { result } = renderHook(() =>
      useIPCCalculator(mockCategories, months, { '01': 50, '07': 50 }, '2023-01', '2024-12')
    )
    // 2023-01 doesn't exist in data, base is undefined → should skip
    expect(result.current.personalIPC).toBe(0)
  })
})
