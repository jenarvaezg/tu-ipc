import { describe, it, expect, beforeEach } from 'vitest'
import {
  parseURLState,
  patchURLState,
  syncToURL,
  writeURLState,
} from './useURLState'
import { CATEGORIES, OFFICIAL_WEIGHTS } from '@/data/categories'

function setSearch(search: string) {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, search, pathname: '/' },
    writable: true,
  })
}

describe('parseURLState', () => {
  beforeEach(() => {
    setSearch('')
  })

  it('returns empty object for no params', () => {
    const state = parseURLState()
    expect(state).toEqual({})
  })

  it('parses valid weights', () => {
    const values = CATEGORIES.map((_, i) => (i * 2 + 1).toFixed(1))
    setSearch(`?w=${values.join(',')}`)
    const state = parseURLState()
    expect(state.weights).toBeDefined()
    CATEGORIES.forEach((cat, i) => {
      expect(state.weights![cat.code]).toBe(i * 2 + 1)
    })
  })

  it('parses compact weights (ws)', () => {
    // 1.0, 2.0, ..., 12.0 encoded in base36 with 2-char chunks (scaled x10)
    setSearch('?ws=0a0k0u141e1o1y282i2s323c')
    const state = parseURLState()
    expect(state.weights).toBeDefined()
    CATEGORIES.forEach((cat, i) => {
      expect(state.weights![cat.code]).toBe(i + 1)
    })
  })

  it('prefers compact weights when ws and w are both present', () => {
    setSearch('?ws=0a0k0u141e1o1y282i2s323c&w=99,99,99,99,99,99,99,99,99,99,99,99')
    const state = parseURLState()
    expect(state.weights).toBeDefined()
    CATEGORIES.forEach((cat, i) => {
      expect(state.weights![cat.code]).toBe(i + 1)
    })
  })

  it('ignores invalid weights (wrong count)', () => {
    setSearch('?w=10,20,30')
    const state = parseURLState()
    expect(state.weights).toBeUndefined()
  })

  it('ignores invalid weights (NaN)', () => {
    setSearch('?w=a,b,c,d,e,f,g,h,i,j,k,l')
    const state = parseURLState()
    expect(state.weights).toBeUndefined()
  })

  it('ignores weights out of range', () => {
    const values = CATEGORIES.map(() => '200')
    setSearch(`?w=${values.join(',')}`)
    const state = parseURLState()
    expect(state.weights).toBeUndefined()
  })

  it('parses start and end months', () => {
    setSearch('?s=2024-01&e=2025-06')
    const state = parseURLState()
    expect(state.startMonth).toBe('2024-01')
    expect(state.endMonth).toBe('2025-06')
  })

  it('ignores malformed months', () => {
    setSearch('?s=2024&e=june')
    const state = parseURLState()
    expect(state.startMonth).toBeUndefined()
    expect(state.endMonth).toBeUndefined()
  })

  it('parses region', () => {
    setSearch('?r=madrid')
    const state = parseURLState()
    expect(state.region).toBe('madrid')
  })

  it('parses valid tab', () => {
    setSearch('?t=desglose')
    const state = parseURLState()
    expect(state.activeTab).toBe('desglose')
  })

  it('parses rubricas tab', () => {
    setSearch('?t=rubricas')
    const state = parseURLState()
    expect(state.activeTab).toBe('rubricas')
  })

  it('ignores invalid tab', () => {
    setSearch('?t=invalid')
    const state = parseURLState()
    expect(state.activeTab).toBeUndefined()
  })

  it('parses comparison ids', () => {
    setSearch('?c=joven,pensionista-propietario')
    const state = parseURLState()
    expect(state.comparisonIds).toEqual(['joven', 'pensionista-propietario'])
  })

  it('parses region comparisons', () => {
    setSearch('?cr=madrid,cataluna')
    const state = parseURLState()
    expect(state.comparisonRegions).toEqual(['madrid', 'cataluna'])
  })

  it('parses all params together', () => {
    setSearch('?s=2024-01&e=2025-01&r=madrid&t=sueldo&c=joven&cr=cataluna')
    const state = parseURLState()
    expect(state.startMonth).toBe('2024-01')
    expect(state.endMonth).toBe('2025-01')
    expect(state.region).toBe('madrid')
    expect(state.activeTab).toBe('sueldo')
    expect(state.comparisonIds).toEqual(['joven'])
    expect(state.comparisonRegions).toEqual(['cataluna'])
  })

  it('parses rubricas explorer params', () => {
    setSearch('?t=rubricas&rs=764:304149,764:304150')
    const state = parseURLState()
    expect(state.activeTab).toBe('rubricas')
    expect(state.rubricasSeriesIds).toEqual(['764:304149', '764:304150'])
  })
})

describe('syncToURL', () => {
  let lastURL: string | undefined

  beforeEach(() => {
    lastURL = undefined
    Object.defineProperty(window, 'location', {
      value: { ...window.location, pathname: '/', search: '' },
      writable: true,
    })
    window.history.replaceState = (_data: unknown, _title: string, url?: string | URL | null) => {
      lastURL = url as string
    }
  })

  it('produces clean URL for default state', () => {
    syncToURL({
      weights: { ...OFFICIAL_WEIGHTS },
      startMonth: '2024-01',
      endMonth: '2025-01',
      region: 'nacional',
      activeTab: 'evolucion',
      comparisonIds: [],
      comparisonRegions: [],
    })
    expect(lastURL).toBeDefined()
    // Should not include weights param for official weights
    expect(lastURL).not.toContain('w=')
    // Should not include region for nacional
    expect(lastURL).not.toContain('r=')
    // Should not include tab for evolucion
    expect(lastURL).not.toContain('t=')
  })

  it('includes weights when non-official', () => {
    const weights: Record<string, number> = {}
    CATEGORIES.forEach(cat => { weights[cat.code] = 100 / 12 })
    weights[CATEGORIES[0].code] = 50

    syncToURL({
      weights,
      startMonth: '2024-01',
      endMonth: '2025-01',
      region: 'nacional',
      activeTab: 'evolucion',
      comparisonIds: [],
      comparisonRegions: [],
    })
    expect(lastURL).toContain('ws=')
    expect(lastURL).not.toContain('w=')
  })

  it('includes region when not nacional', () => {
    syncToURL({
      weights: { ...OFFICIAL_WEIGHTS },
      startMonth: '2024-01',
      endMonth: '2025-01',
      region: 'madrid',
      activeTab: 'evolucion',
      comparisonIds: [],
      comparisonRegions: [],
    })
    expect(lastURL).toContain('r=madrid')
  })

  it('includes comparisons and region comparisons', () => {
    syncToURL({
      weights: { ...OFFICIAL_WEIGHTS },
      startMonth: '2024-01',
      endMonth: '2025-01',
      region: 'nacional',
      activeTab: 'evolucion',
      comparisonIds: ['joven'],
      comparisonRegions: ['cataluna', 'madrid'],
    })
    expect(lastURL).toContain('c=joven')
    expect(lastURL).toContain('cr=cataluna%2Cmadrid')
  })

  it('preserves embed mode query param', () => {
    setSearch('?embed=1')
    syncToURL({
      weights: { ...OFFICIAL_WEIGHTS },
      startMonth: '2024-01',
      endMonth: '2025-01',
      region: 'nacional',
      activeTab: 'evolucion',
      comparisonIds: [],
      comparisonRegions: [],
    })
    expect(lastURL).toContain('embed=1')
  })

  it('preserves rubricas query params when syncing calculator state', () => {
    setSearch('?t=rubricas&rs=764:304149%2C764:304150&rf=2004-01&re=2024-12')
    syncToURL({
      weights: { ...OFFICIAL_WEIGHTS },
      startMonth: '2024-01',
      endMonth: '2025-01',
      region: 'nacional',
      activeTab: 'desglose',
      comparisonIds: [],
      comparisonRegions: [],
    })
    expect(lastURL).toContain('rs=764%3A304149%2C764%3A304150')
    expect(lastURL).not.toContain('rf=')
    expect(lastURL).not.toContain('re=')
  })
})

describe('patchURLState', () => {
  let lastURL: string | undefined

  beforeEach(() => {
    lastURL = undefined
    Object.defineProperty(window, 'location', {
      value: { ...window.location, pathname: '/', search: '' },
      writable: true,
    })
    window.history.replaceState = (
      _data: unknown,
      _title: string,
      url?: string | URL | null,
    ) => {
      lastURL = url as string
    }
  })

  function setSearch(search: string) {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search, pathname: '/' },
      writable: true,
    })
  }

  it('writes rubricas series ids when patched', () => {
    patchURLState({ rubricasSeriesIds: ['764:304149', '764:304150'] })
    expect(lastURL).toContain('rs=764%3A304149%2C764%3A304150')
  })

  it('removes rubricas series ids when patched to undefined', () => {
    setSearch('?rs=764:304149')
    patchURLState({ rubricasSeriesIds: undefined })
    expect(lastURL).not.toContain('rs=')
  })

  it('removes rubricas series ids when patched to empty array', () => {
    setSearch('?rs=764:304149')
    patchURLState({ rubricasSeriesIds: [] })
    expect(lastURL).not.toContain('rs=')
  })

  it('preserves unrelated calculator params when only rs is patched', () => {
    setSearch('?s=2024-01&e=2025-01&r=madrid&t=desglose&c=joven&cr=cataluna')
    patchURLState({ rubricasSeriesIds: ['764:304149'] })
    expect(lastURL).toContain('rs=764%3A304149')
    expect(lastURL).toContain('s=2024-01')
    expect(lastURL).toContain('e=2025-01')
    expect(lastURL).toContain('r=madrid')
    expect(lastURL).toContain('t=desglose')
    expect(lastURL).toContain('c=joven')
    expect(lastURL).toContain('cr=cataluna')
  })

  it('preserves embed=1 toggle when patching', () => {
    setSearch('?embed=1&t=rubricas')
    patchURLState({ rubricasSeriesIds: ['764:304149'] })
    expect(lastURL).toContain('embed=1')
    expect(lastURL).toContain('t=rubricas')
  })

  it('preserves theme when patching', () => {
    setSearch('?theme=hesperides')
    patchURLState({ rubricasSeriesIds: ['764:304149'] })
    expect(lastURL).toContain('theme=hesperides')
  })

  it('strips unknown params', () => {
    setSearch('?rf=2004-01&re=2024-12&rs=764:304149')
    patchURLState({ activeTab: 'rubricas' })
    expect(lastURL).toContain('t=rubricas')
    expect(lastURL).toContain('rs=764%3A304149')
    expect(lastURL).not.toContain('rf=')
    expect(lastURL).not.toContain('re=')
  })
})

describe('writeURLState', () => {
  let lastURL: string | undefined

  beforeEach(() => {
    lastURL = undefined
    Object.defineProperty(window, 'location', {
      value: { ...window.location, pathname: '/', search: '' },
      writable: true,
    })
    window.history.replaceState = (
      _data: unknown,
      _title: string,
      url?: string | URL | null,
    ) => {
      lastURL = url as string
    }
  })

  it('writes only the fields present in the URLState', () => {
    writeURLState({ startMonth: '2024-01', endMonth: '2025-01' })
    expect(lastURL).toContain('s=2024-01')
    expect(lastURL).toContain('e=2025-01')
    expect(lastURL).not.toContain('w=')
    expect(lastURL).not.toContain('r=')
    expect(lastURL).not.toContain('t=')
    expect(lastURL).not.toContain('rs=')
  })

  it('produces a bare path when state is empty', () => {
    writeURLState({})
    expect(lastURL).toBe('/')
  })
})
