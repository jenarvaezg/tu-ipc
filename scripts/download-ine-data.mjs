import { writeFileSync, mkdirSync } from 'fs'
import {
  assertArrayResponse,
  chainLinkRegions,
  collectSortedNewMonths,
  combineSplitCategory12,
  matchCategory,
  parseSeriesData,
  resolveRegionCode,
} from './lib/download-ine-data-core.mjs'

const BASE = 'https://servicios.ine.es/wstempus/js/ES'
const HISTORICAL_DATE_RANGE = '20020101:20271231'
const RECENT_DATE_RANGE = '20091201:20271231'

// Table 50913: IPC Base 2021, ECOICOP v1 (12 categories), historical monthly range (2002+)
const OLD_TABLE = '50913'

// Table 76136: IPC Base 2025, ECOICOP v2 (13 categories), Dec 2024 onwards
// Used for chain-linking months beyond the old table's range.
// ECOICOP v2 splits old category 12 into:
//   12: "Seguros y servicios financieros"
//   13: "Cuidado personal, protección social, y bienes y servicios diversos"
const NEW_TABLE = '76136'

// Approximate IPC weights for the two subcategories of old cat 12 (from IPC 2025 base 2021).
// Used to combine new-12 + new-13 into a synthetic old-12 index before chain-linking.
const WEIGHT_NEW_12 = 3.7 // Seguros y servicios financieros
const WEIGHT_NEW_13 = 4.0 // Cuidado personal, protección social...

const REGION_DISPLAY_NAMES = {
  'nacional': 'Total Nacional',
  'andalucia': 'Andalucía',
  'aragon': 'Aragón',
  'asturias': 'Asturias',
  'baleares': 'Illes Balears',
  'canarias': 'Canarias',
  'cantabria': 'Cantabria',
  'castilla-leon': 'Castilla y León',
  'castilla-mancha': 'Castilla-La Mancha',
  'cataluna': 'Cataluña',
  'valencia': 'Comunitat Valenciana',
  'extremadura': 'Extremadura',
  'galicia': 'Galicia',
  'madrid': 'Comunidad de Madrid',
  'murcia': 'Región de Murcia',
  'navarra': 'Navarra',
  'pais-vasco': 'País Vasco',
  'rioja': 'La Rioja',
  'ceuta': 'Ceuta',
  'melilla': 'Melilla',
}

// Category matching for old table (ECOICOP v1, 12 + general)
const catMap = [
  { code: '00', keywords: ['índice general'], name: 'Índice general' },
  { code: '01', keywords: ['alimentos'], name: 'Alimentos y bebidas no alcohólicas' },
  { code: '02', keywords: ['alcohólicas', 'tabaco'], name: 'Bebidas alcohólicas y tabaco' },
  { code: '03', keywords: ['vestido'], name: 'Vestido y calzado' },
  { code: '04', keywords: ['vivienda'], name: 'Vivienda, agua, electricidad, gas' },
  { code: '05', keywords: ['muebles'], name: 'Muebles y artículos del hogar' },
  { code: '06', keywords: ['sanidad'], name: 'Sanidad' },
  { code: '07', keywords: ['transporte'], name: 'Transporte' },
  { code: '08', keywords: ['comunicacion', 'información y comunic'], name: 'Comunicaciones' },
  { code: '09', keywords: ['ocio', 'recreativ'], name: 'Ocio y cultura' },
  { code: '10', keywords: ['enseñanza', 'educación'], name: 'Enseñanza' },
  { code: '11', keywords: ['restaurante'], name: 'Restaurantes y hoteles' },
  { code: '12', keywords: ['otros bienes', 'cuidado personal', 'seguros y servicio'], name: 'Otros bienes y servicios' },
]

// Category matching for new table (ECOICOP v2, 13 + general)
// Uses separate codes '12a' and '12b' for the split categories, combined later.
const newCatMap = [
  { code: '00', keywords: ['índice general'] },
  { code: '01', keywords: ['alimentos'] },
  { code: '02', keywords: ['alcohólicas', 'tabaco', 'estupefaciente'] },
  { code: '03', keywords: ['vestido'] },
  { code: '04', keywords: ['vivienda'] },
  { code: '05', keywords: ['muebles'] },
  { code: '06', keywords: ['sanidad'] },
  { code: '07', keywords: ['transporte'] },
  { code: '08', keywords: ['información y comunic'] },
  { code: '09', keywords: ['recreativ'] },
  { code: '10', keywords: ['educación'] },
  { code: '11', keywords: ['restaurante'] },
  { code: '12a', keywords: ['seguros y servicio'] },
  { code: '12b', keywords: ['cuidado personal'] },
]

async function fetchTable(tableId, label, dateRange) {
  const url = `${BASE}/DATOS_TABLA/${tableId}?date=${dateRange}`
  console.log(`  ${label}: ${url}`)
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching ${label}`)
  return assertArrayResponse(await resp.json(), label)
}

async function main() {
  console.log('Descargando datos del IPC del INE...\n')
  console.log('Descargando tablas (esto puede tardar ~60s)...')

  // Fetch both tables in parallel
  const [oldRaw, newRaw] = await Promise.all([
    fetchTable(OLD_TABLE, `Tabla ${OLD_TABLE} (base 2021, ECOICOP v1)`, HISTORICAL_DATE_RANGE),
    fetchTable(NEW_TABLE, `Tabla ${NEW_TABLE} (base 2025, ECOICOP v2)`, RECENT_DATE_RANGE),
  ])

  console.log(`\nTabla vieja: ${oldRaw.length} series`)
  console.log(`Tabla nueva: ${newRaw.length} series\n`)

  // ─── Step 1: Parse old table (base 2021) ──────────────────────────────
  console.log('Paso 1: Procesando tabla base 2021...')

  const oldIndexSeries = oldRaw.filter(s => s.Nombre?.includes('Índice.'))
  const regions = {}
  const allMonths = new Set()
  let matched = 0

  for (const series of oldIndexSeries) {
    const parts = series.Nombre.split('.')
    if (parts.length < 3) continue

    const regionCode = resolveRegionCode(parts[0])
    if (!regionCode) continue

    const cat = matchCategory(parts[1].trim(), catMap)
    if (!cat) continue

    if (!regions[regionCode]) {
      regions[regionCode] = { name: REGION_DISPLAY_NAMES[regionCode], categories: {} }
    }

    // Keep the longest series per category (v1 wins over v2)
    const existing = regions[regionCode].categories[cat.code]
    const newPoints = (series.Data || []).length
    if (existing && existing._points >= newPoints) continue

    const data = parseSeriesData(series.Data)
    for (const m of Object.keys(data)) allMonths.add(m)

    regions[regionCode].categories[cat.code] = { name: cat.name, data, _points: newPoints }
    matched++
  }

  console.log(`  ${matched} series procesadas`)

  // Find the last month in the old data
  const oldMonths = [...allMonths].sort()
  const lastOldMonth = oldMonths[oldMonths.length - 1]
  console.log(`  Rango viejo: ${oldMonths[0]} → ${lastOldMonth}`)

  // ─── Step 2: Parse new table (base 2025) ──────────────────────────────
  console.log('\nPaso 2: Procesando tabla base 2025...')

  const newIndexSeries = newRaw.filter(s => s.Nombre?.includes('Índice.'))
  // Temporary structure: newData[regionCode][catCode] = { month: value }
  const newData = {}

  for (const series of newIndexSeries) {
    const parts = series.Nombre.split('.')
    if (parts.length < 3) continue

    const regionCode = resolveRegionCode(parts[0])
    if (!regionCode) continue

    const cat = matchCategory(parts[1].trim(), newCatMap)
    if (!cat) continue

    if (!newData[regionCode]) newData[regionCode] = {}

    const data = parseSeriesData(series.Data)
    newData[regionCode][cat.code] = data
  }

  combineSplitCategory12(newData, WEIGHT_NEW_12, WEIGHT_NEW_13)
  const sortedNewMonths = collectSortedNewMonths(newData)
  console.log(`  Rango nuevo: ${sortedNewMonths[0]} → ${sortedNewMonths[sortedNewMonths.length - 1]}`)

  // ─── Step 3: Chain-link new months onto old data ──────────────────────
  // For each region+category, use the last overlap month to compute a conversion factor:
  //   link_factor = old_value / new_value  (at overlap month)
  //   extended_value = new_value * link_factor  (for months beyond old data)
  console.log(`\nPaso 3: Encadenando series (enlace en ${lastOldMonth})...`)

  const { extended, skipped } = chainLinkRegions(
    regions,
    newData,
    lastOldMonth,
    sortedNewMonths,
    allMonths
  )

  console.log(`  ${extended} puntos de datos añadidos`)
  if (skipped > 0) console.log(`  ${skipped} categorías sin enlace (falta overlap)`)

  // ─── Step 4: Cleanup and write ────────────────────────────────────────
  for (const region of Object.values(regions)) {
    for (const cat of Object.values(region.categories)) {
      delete cat._points
    }
  }

  const months = [...allMonths].sort()
  const output = {
    lastUpdated: new Date().toISOString(),
    months,
    regions,
  }

  mkdirSync('src/data', { recursive: true })
  writeFileSync('src/data/ipc-data.json', JSON.stringify(output))

  // Summary
  const sizeKB = (Buffer.byteLength(JSON.stringify(output)) / 1024).toFixed(0)
  console.log(`\n✅ Guardado: ${months.length} meses, ${Object.keys(regions).length} regiones (${sizeKB} KB)`)
  console.log(`   Rango: ${months[0]} → ${months[months.length - 1]}`)

  // Verify chain-link for nacional/00 (general index)
  const nacGeneral = regions['nacional']?.categories['00']?.data
  if (nacGeneral) {
    const lastMonth = months[months.length - 1]
    const prevMonth = months[months.length - 2]
    console.log(`\n   Verificación (nacional, índice general):`)
    console.log(`   ${prevMonth}: ${nacGeneral[prevMonth]}`)
    console.log(`   ${lastMonth}: ${nacGeneral[lastMonth]}`)
  }
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
