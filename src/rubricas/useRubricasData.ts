import { useEffect, useState } from 'react'
import rubricasDataUrl from '@/data/ipc-rubricas.json?url'
import type { RubricasData } from '@/data/rubricasTypes'

export type RubricasDataState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: RubricasData; error: null }
  | { status: 'error'; data: null; error: string }

export function useRubricasData(): RubricasDataState {
  const [state, setState] = useState<RubricasDataState>({
    status: 'loading',
    data: null,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const response = await fetch(rubricasDataUrl)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const parsed = (await response.json()) as RubricasData
        if (!cancelled) {
          setState({ status: 'ready', data: parsed, error: null })
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            data: null,
            error: error instanceof Error ? error.message : 'Error desconocido',
          })
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
