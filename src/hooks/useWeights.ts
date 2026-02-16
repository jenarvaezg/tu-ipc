import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { CATEGORIES, OFFICIAL_WEIGHTS } from '@/data/categories'
import { redistributeWeights } from '@/utils/weightRedistribution'
import { debounce } from '@/utils/debounce'

const STORAGE_KEY = 'tu-ipc-weights'
const STORAGE_KEY_LOCKED = 'tu-ipc-locked'

function loadWeights(): Record<string, number> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (typeof parsed === 'object' && parsed !== null) return parsed
    }
  } catch { /* ignore */ }
  return { ...OFFICIAL_WEIGHTS }
}

function loadLocked(): Set<string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LOCKED)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return new Set(parsed)
    }
  } catch { /* ignore */ }
  return new Set()
}

function saveWeights(weights: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(weights))
}

function saveLocked(locked: Set<string>) {
  localStorage.setItem(STORAGE_KEY_LOCKED, JSON.stringify([...locked]))
}

export function useWeights(initialWeights?: Record<string, number>) {
  const [weights, setWeights] = useState<Record<string, number>>(
    () => initialWeights || loadWeights()
  )
  const [locked, setLocked] = useState<Set<string>>(loadLocked)

  // Debounced saveWeights
  const debouncedSaveWeightsRef = useRef(debounce(saveWeights, 300))

  useEffect(() => {
    return () => debouncedSaveWeightsRef.current.cancel()
  }, [])

  const handleWeightChange = useCallback((code: string, newValue: number) => {
    setWeights((prev) => {
      const next = redistributeWeights(prev, code, newValue, locked)
      debouncedSaveWeightsRef.current(next)
      return next
    })
  }, [locked])

  const handleToggleLock = useCallback((code: string) => {
    setLocked((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      saveLocked(next)
      return next
    })
  }, [])

  const handleReset = useCallback((type: 'official' | 'equal') => {
    const next =
      type === 'official'
        ? { ...OFFICIAL_WEIGHTS }
        : Object.fromEntries(CATEGORIES.map((c) => [c.code, +(100 / 12).toFixed(2)]))
    setWeights(next)
    saveWeights(next)
    setLocked(new Set())
    saveLocked(new Set())
  }, [])

  const handlePresetSelect = useCallback((presetWeights: Record<string, number>) => {
    setWeights(presetWeights)
    saveWeights(presetWeights)
    setLocked(new Set())
    saveLocked(new Set())
  }, [])

  const isCustom = useMemo(() => {
    return !CATEGORIES.every(
      cat => Math.abs((weights[cat.code] ?? 0) - (OFFICIAL_WEIGHTS[cat.code] ?? 0)) < 0.01
    )
  }, [weights])

  return {
    weights,
    setWeights,
    locked,
    isCustom,
    handleWeightChange,
    handleToggleLock,
    handleReset,
    handlePresetSelect,
  }
}
