import { mkdirSync, writeFileSync } from 'fs'
import { readFile } from 'fs/promises'
import { execFileSync } from 'child_process'

const BASE = 'https://servicios.ine.es/wstempus/js/ES'
const DATE_RANGE = '20020101:20271231'
const BASE_MONTH = '2002-01'
const OUTPUT_PATH = 'scripts/outputs/ine-rubricas-spike.json'

const LEVELS = [
  { id: 762, name: 'grupos-ecoicop' },
  { id: 763, name: 'subgrupos-ecoicop' },
  { id: 764, name: 'clases-ecoicop' },
  { id: 765, name: 'subclases-ecoicop' },
]

const args = process.argv.slice(2)
const inputDirArg = args.find(arg => arg.startsWith('--input-dir='))
const inputDir = inputDirArg ? inputDirArg.replace('--input-dir=', '') : ''

function monthLabel(timestamp) {
  const date = new Date(timestamp)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function cleanSeriesName(value = '') {
  return value.replace(/\.\s*$/, '').trim()
}

function extractRubricaName(seriesName) {
  const parts = cleanSeriesName(seriesName)
    .split('.')
    .map(part => part.trim())
    .filter(Boolean)

  if (parts.length >= 2) return parts[1]
  return cleanSeriesName(seriesName)
}

function toPercent(value, total) {
  if (!total) return 0
  return Math.round((value / total) * 1000) / 10
}

function percentile(sortedValues, p) {
  if (sortedValues.length === 0) return 0
  const idx = Math.floor((sortedValues.length - 1) * p)
  return sortedValues[idx]
}

function summarizeSeries(series) {
  const withData = series.filter(item => item.points > 0)
  const withBaseMonth = withData.filter(item => item.hasBaseMonth)
  const points = withData.map(item => item.points).sort((a, b) => a - b)

  let firstMonth = null
  let lastMonth = null
  for (const item of withData) {
    if (!firstMonth || item.firstMonth < firstMonth) firstMonth = item.firstMonth
    if (!lastMonth || item.lastMonth > lastMonth) lastMonth = item.lastMonth
  }

  const topWithoutBase = withData
    .filter(item => !item.hasBaseMonth)
    .sort((a, b) => b.points - a.points)
    .slice(0, 10)
    .map(item => ({
      code: item.code,
      name: item.rubricaName,
      points: item.points,
      firstMonth: item.firstMonth,
      lastMonth: item.lastMonth,
    }))

  return {
    totalSeries: series.length,
    withDataCount: withData.length,
    withBaseMonthCount: withBaseMonth.length,
    withDataPct: toPercent(withData.length, series.length),
    coverageAtBasePct: toPercent(withBaseMonth.length, withData.length),
    firstMonth,
    lastMonth,
    pointsStats: {
      min: points[0] ?? 0,
      p25: percentile(points, 0.25),
      median: percentile(points, 0.5),
      p75: percentile(points, 0.75),
      max: points[points.length - 1] ?? 0,
    },
    topWithoutBase,
  }
}

function dedupeByRubricaName(series) {
  const bestByRubrica = new Map()

  for (const item of series) {
    const key = item.rubricaName.toLowerCase()
    const existing = bestByRubrica.get(key)
    if (!existing) {
      bestByRubrica.set(key, item)
      continue
    }

    const hasMorePoints = item.points > existing.points
    const samePointsButMoreRecent = item.points === existing.points && item.lastMonth > existing.lastMonth

    if (hasMorePoints || samePointsButMoreRecent) {
      bestByRubrica.set(key, item)
    }
  }

  return [...bestByRubrica.values()]
}

async function fetchJSON(url, label) {
  console.log(`  ${label}`)
  try {
    const resp = await fetch(url)
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} en ${label}`)
    }
    return resp.json()
  } catch (error) {
    // En algunos entornos de ejecución, fetch de Node no resuelve DNS
    // pero curl sí. Fallback para no bloquear el spike.
    const raw = execFileSync('curl', ['-sS', url], {
      encoding: 'utf8',
      maxBuffer: 100 * 1024 * 1024,
    })
    if (!raw) throw error
    return JSON.parse(raw)
  }
}

function normalizeSeries(raw) {
  const series = []

  for (const item of raw) {
    const dataPoints = item.Data || []

    let firstMonth = null
    let lastMonth = null
    let hasBaseMonth = false

    for (const point of dataPoints) {
      const month = monthLabel(point.Fecha)
      if (!firstMonth || month < firstMonth) firstMonth = month
      if (!lastMonth || month > lastMonth) lastMonth = month
      if (month === BASE_MONTH) hasBaseMonth = true
    }

    series.push({
      code: item.COD || '',
      name: cleanSeriesName(item.Nombre || ''),
      rubricaName: extractRubricaName(item.Nombre || ''),
      points: dataPoints.length,
      firstMonth,
      lastMonth,
      hasBaseMonth,
    })
  }

  return series
}

async function fetchLevelReport(level) {
  console.log(`\nAnalizando ${level.name} (${level.id})...`)
  let values
  let rawSeries

  if (inputDir) {
    const valuesPath = `${inputDir}/ine-values-${level.id}.json`
    const dataPath = `${inputDir}/ine-data-${level.id}.json`
    console.log(`  Leyendo dump local: ${valuesPath}`)
    console.log(`  Leyendo dump local: ${dataPath}`)
    values = JSON.parse(await readFile(valuesPath, 'utf8'))
    rawSeries = JSON.parse(await readFile(dataPath, 'utf8'))
  } else {
    const valuesUrl = `${BASE}/VALORES_VARIABLEOPERACION/${level.id}/IPC`
    const dataUrl = `${BASE}/DATOS_METADATAOPERACION/IPC?g1=349:16473&g2=3:83&g3=${level.id}:&p=1&date=${DATE_RANGE}`

    ;[values, rawSeries] = await Promise.all([
      fetchJSON(valuesUrl, `VALORES_VARIABLEOPERACION/${level.id}`),
      fetchJSON(dataUrl, `DATOS_METADATAOPERACION g3=${level.id}`),
    ])
  }

  const normalized = normalizeSeries(rawSeries)
  const deduped = dedupeByRubricaName(normalized)
  const uniqueCodes = new Set(values.map(value => value.Codigo).filter(Boolean))
  const valuesWithParents = values.filter(value => (value.FK_JerarquiaPadres || []).length > 0)

  const report = {
    levelId: level.id,
    levelName: level.name,
    valuesCount: values.length,
    uniqueCodesCount: uniqueCodes.size,
    valuesWithParentsCount: valuesWithParents.length,
    rawSeries: summarizeSeries(normalized),
    dedupedSeries: summarizeSeries(deduped),
  }

  console.log(
    `  Catálogo: ${report.valuesCount} valores | Series: ${report.rawSeries.totalSeries} | ` +
      `Cobertura base (dedupe): ${report.dedupedSeries.coverageAtBasePct}%`
  )

  return report
}

function pickRecommendation(levelReports) {
  const threshold = 60
  const depthOrder = [762, 763, 764, 765]
  const eligible = levelReports
    .filter(report => report.dedupedSeries.coverageAtBasePct >= threshold)
    .sort((a, b) => depthOrder.indexOf(b.levelId) - depthOrder.indexOf(a.levelId))

  if (eligible.length > 0) {
    const chosen = eligible[0]
    return {
      strategy: 'max-depth-with-min-coverage',
      minCoveragePct: threshold,
      recommendedLevelId: chosen.levelId,
      recommendedLevelName: chosen.levelName,
      rationale:
        'Se selecciona el nivel más desagregado que mantiene cobertura histórica suficiente en 2002-01 tras deduplicar series.',
    }
  }

  const fallback = [...levelReports].sort(
    (a, b) => b.dedupedSeries.coverageAtBasePct - a.dedupedSeries.coverageAtBasePct
  )[0]

  return {
    strategy: 'max-coverage-fallback',
    minCoveragePct: threshold,
    recommendedLevelId: fallback.levelId,
    recommendedLevelName: fallback.levelName,
    rationale:
      'Ningún nivel alcanzó la cobertura mínima. Se propone el nivel con mayor cobertura histórica en 2002-01.',
  }
}

async function main() {
  console.log('Spike INE: cobertura de desagregación ECOICOP (2002+)\n')
  console.log(`Rango de análisis: ${DATE_RANGE} | Mes base: ${BASE_MONTH}`)
  if (inputDir) console.log(`Modo offline con input-dir: ${inputDir}`)

  const levelReports = []
  for (const level of LEVELS) {
    const report = await fetchLevelReport(level)
    levelReports.push(report)
  }

  const result = {
    generatedAt: new Date().toISOString(),
    baseMonth: BASE_MONTH,
    dateRange: DATE_RANGE,
    levelReports,
    recommendation: pickRecommendation(levelReports),
  }

  mkdirSync('scripts/outputs', { recursive: true })
  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2))

  console.log('\nResumen final:')
  for (const report of levelReports) {
    console.log(
      `  ${report.levelId} ${report.levelName}: ` +
        `cobertura base dedupe ${report.dedupedSeries.coverageAtBasePct}% ` +
        `(${report.dedupedSeries.withBaseMonthCount}/${report.dedupedSeries.withDataCount})`
    )
  }
  console.log(`\nRecomendación: ${result.recommendation.recommendedLevelName} (${result.recommendation.recommendedLevelId})`)
  console.log(`Guardado en ${OUTPUT_PATH}`)
}

main().catch(error => {
  console.error('\nError en spike:', error)
  process.exit(1)
})
