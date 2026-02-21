import { CATEGORIES, OFFICIAL_WEIGHTS } from '@/data/categories'

interface URLState {
  weights?: Record<string, number>
  startMonth?: string
  endMonth?: string
  region?: string
  activeTab?: string
  comparisonIds?: string[]
  comparisonRegions?: string[]
}

// Parse URL params into state. Returns only fields that are present AND valid.
export function parseURLState(): URLState {
  const params = new URLSearchParams(window.location.search)
  const result: URLState = {}

  // Parse weights: w=21.9,3.2,4.8,...  (12 comma-separated numbers, category order 01-12)
  const w = params.get('w')
  if (w) {
    const parts = w.split(',').map(Number)
    if (parts.length === 12 && parts.every(n => !isNaN(n) && n >= 0 && n <= 100)) {
      const weights: Record<string, number> = {}
      CATEGORIES.forEach((cat, i) => {
        weights[cat.code] = parts[i]
      })
      result.weights = weights
    }
  }

  // Parse start/end months: s=2024-01, e=2025-01
  const s = params.get('s')
  if (s && /^\d{4}-\d{2}$/.test(s)) {
    result.startMonth = s
  }
  const e = params.get('e')
  if (e && /^\d{4}-\d{2}$/.test(e)) {
    result.endMonth = e
  }

  // Parse region: r=nacional
  const r = params.get('r')
  if (r) {
    result.region = r
  }

  // Parse tab: t=evolucion
  const t = params.get('t')
  if (t && ['evolucion', 'desglose', 'sueldo', 'regiones'].includes(t)) {
    result.activeTab = t
  }

  // Parse comparisons: c=joven,pensionista-propietario
  const c = params.get('c')
  if (c) {
    result.comparisonIds = c.split(',').filter(Boolean)
  }

  // Parse region comparisons: cr=madrid,cataluna
  const cr = params.get('cr')
  if (cr) {
    result.comparisonRegions = cr.split(',').filter(Boolean)
  }

  return result
}

// Sync current state to URL using replaceState (no history pollution)
export function syncToURL(state: {
  weights: Record<string, number>
  startMonth: string
  endMonth: string
  region: string
  activeTab: string
  comparisonIds: string[]
  comparisonRegions: string[]
}) {
  const current = new URLSearchParams(window.location.search)
  const params = new URLSearchParams()

  // Only add weights if they differ from official
  const weightsArr = CATEGORIES.map(cat => state.weights[cat.code] ?? 0)
  const isOfficial = CATEGORIES.every(
    cat => Math.abs((state.weights[cat.code] ?? 0) - (OFFICIAL_WEIGHTS[cat.code] ?? 0)) < 0.01
  )
  if (!isOfficial) {
    params.set('w', weightsArr.map(w => w.toFixed(1)).join(','))
  }

  params.set('s', state.startMonth)
  params.set('e', state.endMonth)

  if (state.region !== 'nacional') {
    params.set('r', state.region)
  }

  if (state.activeTab !== 'evolucion') {
    params.set('t', state.activeTab)
  }

  if (state.comparisonIds.length > 0) {
    params.set('c', state.comparisonIds.join(','))
  }

  if (state.comparisonRegions.length > 0) {
    params.set('cr', state.comparisonRegions.join(','))
  }

  // Keep embed mode stable while syncing calculator params.
  if (current.get('embed') === '1') {
    params.set('embed', '1')
  }

  const search = params.toString()
  const url = search ? `${window.location.pathname}?${search}` : window.location.pathname
  window.history.replaceState(null, '', url)
}
