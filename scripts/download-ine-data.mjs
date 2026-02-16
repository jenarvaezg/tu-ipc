import { writeFileSync, mkdirSync } from 'fs'

const BASE = 'https://servicios.ine.es/wstempus/js/ES'

// Table 50913: IPC Base 2021, all regions, all ECOICOP categories
const TABLE_ID = '50913'

// Map INE region names (from series "Nombre" field) to our codes
const REGION_MAP = {
  'Total Nacional': 'nacional',
  'Andalucía': 'andalucia',
  'Aragón': 'aragon',
  'Asturias, Principado de': 'asturias',
  'Balears, Illes': 'baleares',
  'Canarias': 'canarias',
  'Cantabria': 'cantabria',
  'Castilla y León': 'castilla-leon',
  'Castilla - La Mancha': 'castilla-mancha',
  'Cataluña': 'cataluna',
  'Comunitat Valenciana': 'valencia',
  'Extremadura': 'extremadura',
  'Galicia': 'galicia',
  'Madrid, Comunidad de': 'madrid',
  'Murcia, Región de': 'murcia',
  'Navarra, Comunidad Foral de': 'navarra',
  'País Vasco': 'pais-vasco',
  'Rioja, La': 'rioja',
  'Ceuta': 'ceuta',
  'Melilla': 'melilla',
}

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

// Match category from the second part of the series name
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

function matchCategory(nombre) {
  const lower = nombre.toLowerCase()
  for (const cat of catMap) {
    if (cat.keywords.some(kw => lower.includes(kw))) {
      if (cat.code === '02' && lower.includes('alimentos')) continue
      return cat
    }
  }
  return null
}

async function main() {
  console.log('Descargando datos del IPC del INE (tabla 50913, todas las regiones)...\n')

  // Fetch all series from table 50913 with full date range
  const url = `${BASE}/DATOS_TABLA/${TABLE_ID}?date=20100101:20261231`
  console.log(`URL: ${url}`)
  console.log('(esto puede tardar ~30s...)\n')

  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
  const rawData = await resp.json()

  console.log(`Recibidas ${rawData.length} series del INE\n`)

  // Filter for "Índice." series only (not variations)
  const indexSeries = rawData.filter(s => s.Nombre?.includes('Índice.'))
  console.log(`Series de tipo Índice: ${indexSeries.length}`)

  // Parse each series: "Region. Category. Índice."
  const regions = {}
  const allMonths = new Set()
  let matched = 0
  let unmatched = 0

  for (const series of indexSeries) {
    const parts = series.Nombre.split('.')
    if (parts.length < 3) continue

    const regionName = parts[0].trim()
    const categoryPart = parts[1].trim()
    const regionCode = REGION_MAP[regionName]

    if (!regionCode) {
      console.log(`  Región desconocida: "${regionName}"`)
      unmatched++
      continue
    }

    const cat = matchCategory(categoryPart)
    if (!cat) {
      unmatched++
      continue
    }

    // Initialize region if needed
    if (!regions[regionCode]) {
      regions[regionCode] = {
        name: REGION_DISPLAY_NAMES[regionCode],
        categories: {},
      }
    }

    // For each category, keep the longest series (v1 wins over v2)
    const existing = regions[regionCode].categories[cat.code]
    const newPoints = (series.Data || []).length

    if (existing && existing._points >= newPoints) continue

    const data = {}
    for (const d of series.Data || []) {
      const date = new Date(d.Fecha)
      const year = date.getUTCFullYear()
      const month = String(date.getUTCMonth() + 1).padStart(2, '0')
      const label = `${year}-${month}`
      data[label] = d.Valor
      allMonths.add(label)
    }

    regions[regionCode].categories[cat.code] = { name: cat.name, data, _points: newPoints }
    matched++
  }

  // Remove the _points helper field
  for (const region of Object.values(regions)) {
    for (const cat of Object.values(region.categories)) {
      delete cat._points
    }
  }

  // Summary
  console.log(`\nSeries procesadas: ${matched} matched, ${unmatched} sin match`)
  for (const [code, region] of Object.entries(regions)) {
    const catCount = Object.keys(region.categories).length
    console.log(`  ✓ ${region.name}: ${catCount} categorías`)
  }

  const months = [...allMonths].sort()
  const output = {
    lastUpdated: new Date().toISOString(),
    months,
    regions,
  }

  mkdirSync('src/data', { recursive: true })
  writeFileSync('src/data/ipc-data.json', JSON.stringify(output))

  const sizeKB = (Buffer.byteLength(JSON.stringify(output)) / 1024).toFixed(0)
  console.log(`\n✅ Guardado: ${months.length} meses, ${Object.keys(regions).length} regiones (${sizeKB} KB)`)
  console.log(`   Rango: ${months[0]} → ${months[months.length - 1]}`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
