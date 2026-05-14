import { describe, it, expect } from 'vitest'
import {
  hasCalculatorParams,
  readSubRoute,
  resolveShell,
  type ShellLocation,
} from './shellRouter'

function makeLocation(partial: Partial<ShellLocation> = {}): ShellLocation {
  return {
    isEmbed: false,
    subRoute: '',
    activeTab: 'evolucion',
    hasCalcParams: false,
    historyHint: null,
    ...partial,
  }
}

describe('readSubRoute', () => {
  it('returns empty for root', () => {
    expect(readSubRoute('/', '/')).toBe('')
  })

  it('reads metodologia at root base', () => {
    expect(readSubRoute('/metodologia', '/')).toBe('metodologia')
  })

  it('reads privacidad at root base', () => {
    expect(readSubRoute('/privacidad', '/')).toBe('privacidad')
  })

  it('strips trailing slash', () => {
    expect(readSubRoute('/metodologia/', '/')).toBe('metodologia')
  })

  it('respects a non-root base', () => {
    expect(readSubRoute('/tu-ipc/metodologia', '/tu-ipc/')).toBe('metodologia')
  })

  it('returns empty string for unknown sub-routes', () => {
    expect(readSubRoute('/random', '/')).toBe('')
  })
})

describe('hasCalculatorParams', () => {
  it('returns false for empty state', () => {
    expect(hasCalculatorParams({})).toBe(false)
  })

  it('returns true when any calculator param is present', () => {
    expect(hasCalculatorParams({ weights: { '01': 10 } })).toBe(true)
    expect(hasCalculatorParams({ region: 'madrid' })).toBe(true)
    expect(hasCalculatorParams({ startMonth: '2024-01' })).toBe(true)
    expect(hasCalculatorParams({ endMonth: '2025-01' })).toBe(true)
    expect(hasCalculatorParams({ activeTab: 'desglose' })).toBe(true)
    expect(hasCalculatorParams({ comparisonIds: ['joven'] })).toBe(true)
    expect(hasCalculatorParams({ comparisonRegions: ['madrid'] })).toBe(true)
  })

  it('ignores rubricas-only and theme params', () => {
    expect(
      hasCalculatorParams({
        rubricasSeriesIds: ['764:1'],
        theme: 'hesperides',
      }),
    ).toBe(false)
  })
})

describe('resolveShell', () => {
  it('returns landing when no params, no sub-route, no history hint', () => {
    expect(resolveShell(makeLocation())).toEqual({ kind: 'landing' })
  })

  it('returns calculadora when calc params are present', () => {
    expect(resolveShell(makeLocation({ hasCalcParams: true }))).toEqual({
      kind: 'calculadora',
    })
  })

  it('returns calculadora when history hint is calculator', () => {
    expect(
      resolveShell(makeLocation({ historyHint: 'calculator' })),
    ).toEqual({ kind: 'calculadora' })
  })

  it('returns methodology for /metodologia', () => {
    expect(resolveShell(makeLocation({ subRoute: 'metodologia' }))).toEqual({
      kind: 'methodology',
    })
  })

  it('returns privacy for /privacidad', () => {
    expect(resolveShell(makeLocation({ subRoute: 'privacidad' }))).toEqual({
      kind: 'privacy',
    })
  })

  it('returns embed-calc when embed=1 with default tab', () => {
    expect(resolveShell(makeLocation({ isEmbed: true }))).toEqual({
      kind: 'embed-calc',
    })
  })

  it('returns embed-rubricas when embed=1 and tab=rubricas', () => {
    expect(
      resolveShell(makeLocation({ isEmbed: true, activeTab: 'rubricas' })),
    ).toEqual({ kind: 'embed-rubricas' })
  })

  it('embed beats sub-route', () => {
    expect(
      resolveShell(
        makeLocation({ isEmbed: true, subRoute: 'metodologia' }),
      ),
    ).toEqual({ kind: 'embed-calc' })
  })

  it('embed beats calc params', () => {
    expect(
      resolveShell(
        makeLocation({ isEmbed: true, hasCalcParams: true }),
      ),
    ).toEqual({ kind: 'embed-calc' })
  })

  it('sub-route beats calc params', () => {
    expect(
      resolveShell(
        makeLocation({ subRoute: 'metodologia', hasCalcParams: true }),
      ),
    ).toEqual({ kind: 'methodology' })
  })
})
