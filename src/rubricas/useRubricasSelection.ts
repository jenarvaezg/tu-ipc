import { useCallback, useEffect, useRef, useState } from 'react'
import type { RubricaSeries } from '@/data/rubricasTypes'
import { parseURLState, patchURLState } from '@/hooks/useURLState'
import { getSuggestedSelection } from './getSuggestedSelection'

export const MAX_SELECTED_SERIES = 6

export interface RubricasSelection {
  selectedSeriesIds: string[]
  selectionNotice: string
  canAddMore: boolean
  limitMessage: string
  toggle: (id: string) => void
  clear: () => void
  reset: () => void
}

export interface RubricasSelectionOptions {
  classSeries: RubricaSeries[]
  startMonth: string
  endMonth: string
  userWeights: Record<string, number>
  /**
   * When false, the hook is paused (used while data is still loading). Set to
   * true once `classSeries` and the visible period are stable, so the URL
   * is read once and the initial selection is computed.
   */
  ready: boolean
}

export function useRubricasSelection({
  classSeries,
  startMonth,
  endMonth,
  userWeights,
  ready,
}: RubricasSelectionOptions): RubricasSelection {
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<string[]>([])
  const [selectionNotice, setSelectionNotice] = useState<string>('')
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!ready || initializedRef.current) return

    const urlState = parseURLState()
    const validIds = new Set(classSeries.map(item => item.id))

    const parsedSelection = (urlState.rubricasSeriesIds ?? [])
      .filter(id => validIds.has(id))
      .slice(0, MAX_SELECTED_SERIES)

    setSelectedSeriesIds(
      parsedSelection.length > 0
        ? parsedSelection
        : getSuggestedSelection(classSeries, startMonth, endMonth, userWeights),
    )

    initializedRef.current = true
  }, [classSeries, ready, startMonth, endMonth, userWeights])

  useEffect(() => {
    if (!ready) return
    patchURLState({
      rubricasSeriesIds:
        selectedSeriesIds.length > 0 ? selectedSeriesIds : undefined,
    })
  }, [ready, selectedSeriesIds])

  const canAddMore = selectedSeriesIds.length < MAX_SELECTED_SERIES
  const limitMessage = !canAddMore
    ? `Límite alcanzado: máximo ${MAX_SELECTED_SERIES} rúbricas.`
    : ''

  const toggle = useCallback((id: string) => {
    setSelectedSeriesIds(prev => {
      if (prev.includes(id)) {
        setSelectionNotice('')
        return prev.filter(x => x !== id)
      }
      if (prev.length >= MAX_SELECTED_SERIES) {
        setSelectionNotice(
          `Límite alcanzado: máximo ${MAX_SELECTED_SERIES} rúbricas.`,
        )
        return prev
      }
      setSelectionNotice('')
      return [...prev, id]
    })
  }, [])

  const clear = useCallback(() => {
    setSelectionNotice('')
    setSelectedSeriesIds([])
  }, [])

  const reset = useCallback(() => {
    setSelectionNotice('')
    setSelectedSeriesIds(
      getSuggestedSelection(classSeries, startMonth, endMonth, userWeights),
    )
  }, [classSeries, startMonth, endMonth, userWeights])

  return {
    selectedSeriesIds,
    selectionNotice,
    canAddMore,
    limitMessage,
    toggle,
    clear,
    reset,
  }
}
