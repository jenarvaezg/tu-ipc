import { CATEGORIES, OFFICIAL_WEIGHTS } from '@/data/categories'
import { isValidThemeId } from '@/data/themes'

const WEIGHTS_SCALE = 10
const WEIGHTS_RADIX = 36
const WEIGHTS_CHUNK_SIZE = 2
const WEIGHTS_MIN_SCALED = 0
const WEIGHTS_MAX_SCALED = 1000
const WEIGHTS_COMPACT_LENGTH = CATEGORIES.length * WEIGHTS_CHUNK_SIZE
const COMPACT_WEIGHTS_PARAM = 'ws'
const LEGACY_WEIGHTS_PARAM = 'w'
// DEPRECATED (2026-02-23): keep `w` support only for backwards-compatible shared links.
// TODO(boy-scout): remove legacy `w` parsing/fallback after migration window once usage is negligible.

const VALID_TABS = ['evolucion', 'rubricas', 'desglose', 'sueldo', 'regiones'] as const
type ValidTab = (typeof VALID_TABS)[number]

export interface URLState {
  weights?: Record<string, number>
  startMonth?: string
  endMonth?: string
  region?: string
  activeTab?: string
  comparisonIds?: string[]
  comparisonRegions?: string[]
  rubricasSeriesIds?: string[]
  theme?: string
}

function decodeCompactWeights(compact: string): Record<string, number> | undefined {
  if (compact.length !== WEIGHTS_COMPACT_LENGTH) return undefined

  const normalized = compact.toLowerCase()
  const weights: Record<string, number> = {}

  for (let i = 0; i < CATEGORIES.length; i += 1) {
    const chunk = normalized.slice(i * WEIGHTS_CHUNK_SIZE, (i + 1) * WEIGHTS_CHUNK_SIZE)
    const scaled = parseInt(chunk, WEIGHTS_RADIX)
    if (
      Number.isNaN(scaled) ||
      scaled < WEIGHTS_MIN_SCALED ||
      scaled > WEIGHTS_MAX_SCALED
    ) {
      return undefined
    }
    weights[CATEGORIES[i].code] = scaled / WEIGHTS_SCALE
  }

  return weights
}

function encodeCompactWeights(weights: Record<string, number>): string | undefined {
  const chunks: string[] = []

  for (const cat of CATEGORIES) {
    const raw = weights[cat.code]
    if (!Number.isFinite(raw)) return undefined
    const scaled = Math.round(raw * WEIGHTS_SCALE)
    if (scaled < WEIGHTS_MIN_SCALED || scaled > WEIGHTS_MAX_SCALED) return undefined
    chunks.push(scaled.toString(WEIGHTS_RADIX).padStart(WEIGHTS_CHUNK_SIZE, '0'))
  }

  return chunks.join('')
}

// Parse URL params into state. Returns only fields that are present AND valid.
export function parseURLState(): URLState {
  const params = new URLSearchParams(window.location.search)
  const result: URLState = {}

  // Parse compact weights: ws=4f133...
  const ws = params.get(COMPACT_WEIGHTS_PARAM)
  if (ws) {
    const compactWeights = decodeCompactWeights(ws)
    if (compactWeights) {
      result.weights = compactWeights
    }
  }

  // Parse weights: w=21.9,3.2,4.8,...  (12 comma-separated numbers, category order 01-12)
  // Legacy fallback kept for backwards-compatible old links (deprecated).
  const w = params.get(LEGACY_WEIGHTS_PARAM)
  if (!result.weights && w) {
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
  if (t && (VALID_TABS as readonly string[]).includes(t)) {
    result.activeTab = t
  }

  const rs = params.get('rs')
  if (rs) {
    const ids = rs.split(',').filter(Boolean)
    if (ids.length > 0) result.rubricasSeriesIds = ids
  }

  // Parse comparisons: c=joven,pensionista-propietario
  const c = params.get('c')
  if (c) {
    const ids = c.split(',').filter(Boolean)
    if (ids.length > 0) result.comparisonIds = ids
  }

  // Parse region comparisons: cr=madrid,cataluna
  const cr = params.get('cr')
  if (cr) {
    const ids = cr.split(',').filter(Boolean)
    if (ids.length > 0) result.comparisonRegions = ids
  }

  // Parse color theme: theme=hesperides
  const themeParam = params.get('theme')
  if (themeParam && isValidThemeId(themeParam)) {
    result.theme = themeParam
  }

  return result
}

// Serialize URLState into URL search params. Always preserves embed=1 flag
// because it is a routing toggle owned by the host page, not the calculator.
function serializeURLState(state: URLState): URLSearchParams {
  const params = new URLSearchParams()

  if (state.weights) {
    const weightsArr = CATEGORIES.map(cat => state.weights![cat.code] ?? 0)
    const compactWeights = encodeCompactWeights(state.weights)
    if (compactWeights) {
      params.set(COMPACT_WEIGHTS_PARAM, compactWeights)
    } else {
      // Safe fallback kept only while legacy `w` support exists.
      params.set(LEGACY_WEIGHTS_PARAM, weightsArr.map(w => w.toFixed(1)).join(','))
    }
  }

  if (state.startMonth) params.set('s', state.startMonth)
  if (state.endMonth) params.set('e', state.endMonth)
  if (state.region) params.set('r', state.region)
  if (state.activeTab) params.set('t', state.activeTab)

  if (state.comparisonIds && state.comparisonIds.length > 0) {
    params.set('c', state.comparisonIds.join(','))
  }
  if (state.comparisonRegions && state.comparisonRegions.length > 0) {
    params.set('cr', state.comparisonRegions.join(','))
  }
  if (state.rubricasSeriesIds && state.rubricasSeriesIds.length > 0) {
    params.set('rs', state.rubricasSeriesIds.join(','))
  }

  if (state.theme) params.set('theme', state.theme)

  // embed is a routing toggle preserved verbatim from the current URL.
  const current = new URLSearchParams(window.location.search)
  if (current.get('embed') === '1') {
    params.set('embed', '1')
  }

  return params
}

// Write a complete URLState to the URL via history.replaceState.
export function writeURLState(state: URLState): void {
  const params = serializeURLState(state)
  const search = params.toString()
  const url = search
    ? `${window.location.pathname}?${search}`
    : window.location.pathname
  window.history.replaceState(null, '', url)
}

// Merge `partial` with the current parsed URLState and write the result.
// Keys present in `partial` (even with explicit `undefined`) replace the
// parsed value. Keys absent from `partial` are preserved from the URL.
export function patchURLState(partial: Partial<URLState>): void {
  const next: URLState = { ...parseURLState(), ...partial }
  writeURLState(next)
}

// Sync calculator state to URL using `replaceState`. Translates the structured
// calculator state into a URLState patch (applying default-omission rules:
// drop weights when official, drop region when nacional, etc.) and merges with
// other params (rs, theme, embed) preserved by `patchURLState`.
export function syncToURL(state: {
  weights: Record<string, number>
  startMonth: string
  endMonth: string
  region: string
  activeTab: string
  comparisonIds: string[]
  comparisonRegions: string[]
}): void {
  const isOfficial = CATEGORIES.every(
    cat => Math.abs((state.weights[cat.code] ?? 0) - (OFFICIAL_WEIGHTS[cat.code] ?? 0)) < 0.01
  )

  const isValidTab = (VALID_TABS as readonly string[]).includes(state.activeTab)
  const tab = isValidTab ? (state.activeTab as ValidTab) : 'evolucion'

  patchURLState({
    weights: isOfficial ? undefined : state.weights,
    startMonth: state.startMonth,
    endMonth: state.endMonth,
    region: state.region !== 'nacional' ? state.region : undefined,
    activeTab: tab !== 'evolucion' ? tab : undefined,
    comparisonIds: state.comparisonIds.length > 0 ? state.comparisonIds : undefined,
    comparisonRegions:
      state.comparisonRegions.length > 0 ? state.comparisonRegions : undefined,
  })
}
