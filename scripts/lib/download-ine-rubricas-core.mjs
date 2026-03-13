export function monthLabel(point = {}) {
  const yearFromFields = Number(point.Anyo)
  const periodFromFields = Number(point.FK_Periodo)

  if (
    Number.isInteger(yearFromFields) &&
    Number.isInteger(periodFromFields) &&
    periodFromFields >= 1 &&
    periodFromFields <= 12
  ) {
    return `${yearFromFields}-${String(periodFromFields).padStart(2, '0')}`
  }

  const timestamp = Number(point.Fecha)
  if (!Number.isFinite(timestamp)) return ''

  const date = new Date(timestamp)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function cleanSeriesName(value = '') {
  return value.replace(/\.\s*$/, '').trim()
}

export function extractRubricaName(seriesName) {
  const parts = cleanSeriesName(seriesName)
    .split('.')
    .map(part => part.trim())
    .filter(Boolean)

  if (parts.length >= 2) return parts[1]
  return cleanSeriesName(seriesName)
}

export function normalizeForMatch(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/n\.?c\.?o\.?p\.?/g, 'n')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeSeries(rawSeries, baseMonth) {
  return rawSeries.map(item => {
    const points = (item.Data || [])
      .map(point => ({
        month: monthLabel(point),
        value: point.Valor,
      }))
      .filter(point => point.month)
      .sort((a, b) => a.month.localeCompare(b.month))

    const firstMonth = points[0]?.month ?? ''
    const lastMonth = points[points.length - 1]?.month ?? ''
    const hasBaseMonth = points.some(point => point.month === baseMonth)

    return {
      ineSeriesCode: item.COD || '',
      rubricaName: extractRubricaName(item.Nombre || ''),
      points,
      firstMonth,
      lastMonth,
      hasBaseMonth,
    }
  })
}

export function dedupeByRubricaName(series) {
  const bestByName = new Map()

  for (const item of series) {
    const key = item.rubricaName.toLowerCase()
    const existing = bestByName.get(key)

    if (!existing) {
      bestByName.set(key, item)
      continue
    }

    const hasMorePoints = item.points.length > existing.points.length
    const samePointsButMoreRecent =
      item.points.length === existing.points.length && item.lastMonth > existing.lastMonth

    if (hasMorePoints || samePointsButMoreRecent) {
      bestByName.set(key, item)
    }
  }

  return [...bestByName.values()]
}

export function buildValueIndexes(values) {
  const exact = new Map(values.map(value => [(value.Nombre || '').toLowerCase(), value]))
  const normalized = new Map()

  for (const value of values) {
    const key = normalizeForMatch(value.Nombre || '')
    if (!key) continue
    if (!normalized.has(key)) {
      normalized.set(key, value)
      continue
    }
    normalized.set(key, null)
  }

  return { exact, normalized }
}

export function resolveValueByName(name, indexes) {
  const exactMatch = indexes.exact.get(name.toLowerCase())
  if (exactMatch) return exactMatch

  const normalizedMatch = indexes.normalized.get(normalizeForMatch(name))
  if (normalizedMatch) return normalizedMatch

  return null
}

export function buildSeriesPayload(series, valueIndexes, variableId, level) {
  const missing = []
  const payload = []

  for (const item of series) {
    const value = resolveValueByName(item.rubricaName, valueIndexes)
    if (!value) {
      missing.push(item.rubricaName)
      continue
    }

    payload.push({
      id: `${variableId}:${value.Id}`,
      ineSeriesCode: item.ineSeriesCode,
      variableId,
      level,
      rubricaId: value.Id,
      parentRubricaId: (value.FK_JerarquiaPadres || [])[0],
      codigo: value.Codigo || '',
      nombre: item.rubricaName,
      firstMonth: item.firstMonth,
      lastMonth: item.lastMonth,
      hasBaseMonth: item.hasBaseMonth,
      points: item.points,
    })
  }

  return { payload, missing }
}

export function computeMonths(series) {
  const set = new Set()
  for (const item of series) {
    for (const point of item.points) set.add(point.month)
  }
  return [...set].sort()
}
