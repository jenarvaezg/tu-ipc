import { useCallback, useEffect, useState } from 'react'
import { parseURLState, type URLState } from '@/hooks/useURLState'

export type Tab = 'evolucion' | 'rubricas' | 'desglose' | 'sueldo' | 'regiones'

export type Shell =
  | { kind: 'landing' }
  | { kind: 'methodology' }
  | { kind: 'privacy' }
  | { kind: 'calculadora' }
  | { kind: 'embed-calc' }
  | { kind: 'embed-rubricas' }

export type SubRoute = 'metodologia' | 'privacidad' | ''

const VALID_TABS: readonly Tab[] = [
  'evolucion',
  'rubricas',
  'desglose',
  'sueldo',
  'regiones',
]

function isValidTab(value: unknown): value is Tab {
  return (
    typeof value === 'string' &&
    (VALID_TABS as readonly string[]).includes(value)
  )
}

export interface ShellLocation {
  isEmbed: boolean
  subRoute: SubRoute
  activeTab: Tab
  hasCalcParams: boolean
  historyHint?: 'calculator' | null
}

export function hasCalculatorParams(state: URLState): boolean {
  return (
    state.weights != null ||
    state.comparisonIds != null ||
    state.comparisonRegions != null ||
    state.startMonth != null ||
    state.endMonth != null ||
    state.region != null ||
    state.activeTab != null
  )
}

export function readSubRoute(pathname: string, base: string): SubRoute {
  const sub = pathname.startsWith(base)
    ? pathname.slice(base.length)
    : pathname.slice(1)
  const cleaned = sub.replace(/\/$/, '')
  if (cleaned === 'metodologia' || cleaned === 'privacidad') return cleaned
  return ''
}

export function resolveShell(loc: ShellLocation): Shell {
  if (loc.isEmbed) {
    return loc.activeTab === 'rubricas'
      ? { kind: 'embed-rubricas' }
      : { kind: 'embed-calc' }
  }
  if (loc.subRoute === 'metodologia') return { kind: 'methodology' }
  if (loc.subRoute === 'privacidad') return { kind: 'privacy' }
  if (loc.historyHint === 'calculator' || loc.hasCalcParams) {
    return { kind: 'calculadora' }
  }
  return { kind: 'landing' }
}

function readShellLocationFromWindow(base: string): ShellLocation {
  const params = new URLSearchParams(window.location.search)
  const isEmbed = params.get('embed') === '1'
  const subRoute = readSubRoute(window.location.pathname, base)
  const urlState = parseURLState()
  const activeTab: Tab = isValidTab(urlState.activeTab)
    ? urlState.activeTab
    : 'evolucion'
  const hasCalcParams = hasCalculatorParams(urlState)
  const historyState = window.history.state
  const historyHint =
    historyState &&
    typeof historyState === 'object' &&
    (historyState as { page?: unknown }).page === 'calculator'
      ? 'calculator'
      : null
  return { isEmbed, subRoute, activeTab, hasCalcParams, historyHint }
}

export interface ShellNavigation {
  shell: Shell
  navigateToCalculator: () => void
  navigateToMethodology: () => void
  navigateToPrivacy: () => void
  goBack: () => void
}

export function useShellNavigation(base: string): ShellNavigation {
  const [shell, setShell] = useState<Shell>(() =>
    resolveShell(readShellLocationFromWindow(base)),
  )

  useEffect(() => {
    function handlePopState() {
      setShell(resolveShell(readShellLocationFromWindow(base)))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [base])

  const navigateToCalculator = useCallback(() => {
    window.history.pushState({ page: 'calculator' }, '', base)
    setShell(resolveShell(readShellLocationFromWindow(base)))
  }, [base])

  const navigateToMethodology = useCallback(() => {
    window.history.pushState({ page: 'methodology' }, '', base + 'metodologia')
    setShell({ kind: 'methodology' })
  }, [base])

  const navigateToPrivacy = useCallback(() => {
    window.history.pushState({ page: 'privacy' }, '', base + 'privacidad')
    setShell({ kind: 'privacy' })
  }, [base])

  const goBack = useCallback(() => {
    window.history.back()
  }, [])

  return {
    shell,
    navigateToCalculator,
    navigateToMethodology,
    navigateToPrivacy,
    goBack,
  }
}
