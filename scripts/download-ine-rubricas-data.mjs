import { mkdirSync } from 'fs'
import { readFile } from 'fs/promises'
import { execFileSync } from 'child_process'
import {
  buildSeriesPayload,
  buildValueIndexes,
  computeMonths,
  dedupeByRubricaName,
  normalizeSeries,
} from './lib/download-ine-rubricas-core.mjs'
import { fetchJsonWithRetry, isRetriableInePayload } from './lib/ine-fetch.mjs'
import { writeJsonPreservingMetadata } from './lib/stable-json-output.mjs'

const BASE = 'https://servicios.ine.es/wstempus/js/ES'
const DATE_RANGE = '20020101:20271231'
const BASE_MONTH = '2002-01'
const OUTPUT_PATH = 'src/data/ipc-rubricas.json'

const args = process.argv.slice(2)
const inputDirArg = args.find(arg => arg.startsWith('--input-dir='))
const inputDir = inputDirArg ? inputDirArg.replace('--input-dir=', '') : ''
const includeNoBase = args.includes('--include-no-base')

const LEVEL_BY_VARIABLE = {
  762: 'grupo',
  763: 'subgrupo',
  764: 'clase',
}


async function fetchJSON(url, label) {
  console.log(`  ${label}`)
  try {
    return await fetchJsonWithRetry(url, label)
  } catch (_error) {
    const raw = execFileSync('curl', ['-sS', url], {
      encoding: 'utf8',
      maxBuffer: 100 * 1024 * 1024,
    })
    const payload = JSON.parse(raw)
    if (isRetriableInePayload(payload)) {
      throw new Error(`Respuesta temporal del INE en ${label}: ${payload.status || payload.Status}`)
    }
    return payload
  }
}

async function loadValues(variableId) {
  if (inputDir) {
    const path = `${inputDir}/ine-values-${variableId}.json`
    console.log(`  Leyendo dump local: ${path}`)
    return JSON.parse(await readFile(path, 'utf8'))
  }

  const url = `${BASE}/VALORES_VARIABLEOPERACION/${variableId}/IPC`
  return fetchJSON(url, `VALORES_VARIABLEOPERACION/${variableId}`)
}

async function loadSeries(variableId) {
  if (inputDir) {
    const path = `${inputDir}/ine-data-${variableId}.json`
    console.log(`  Leyendo dump local: ${path}`)
    return JSON.parse(await readFile(path, 'utf8'))
  }

  const url = `${BASE}/DATOS_METADATAOPERACION/IPC?g1=349:16473&g2=3:83&g3=${variableId}:&p=1&date=${DATE_RANGE}`
  return fetchJSON(url, `DATOS_METADATAOPERACION g3=${variableId}`)
}

function makeCatalogNode(value) {
  return {
    id: value.Id,
    variableId: value.FK_Variable,
    level: LEVEL_BY_VARIABLE[value.FK_Variable],
    codigo: value.Codigo || '',
    nombre: value.Nombre || '',
    parentIds: value.FK_JerarquiaPadres || [],
  }
}


function dedupeCatalog(valuesByLevel) {
  const map = new Map()
  for (const values of valuesByLevel) {
    for (const value of values) {
      const key = `${value.FK_Variable}:${(value.Nombre || '').toLowerCase()}`
      if (!map.has(key)) map.set(key, value)
    }
  }
  return [...map.values()].map(makeCatalogNode)
}

async function main() {
  console.log('Generando dataset de rúbricas IPC (V1)...\n')
  if (inputDir) console.log(`Modo offline con input-dir: ${inputDir}`)

  console.log('\n1) Cargando catálogos 762/763/764...')
  const [values762, values763, values764] = await Promise.all([loadValues(762), loadValues(763), loadValues(764)])

  console.log('\n2) Cargando series 764 (clases) + 762 (referencia IPC general)...')
  const [raw764, raw762] = await Promise.all([loadSeries(764), loadSeries(762)])

  console.log('\n3) Normalizando y deduplicando series...')
  const classSeries = dedupeByRubricaName(normalizeSeries(raw764, BASE_MONTH)).filter(item => item.points.length > 0)
  const groupSeries = dedupeByRubricaName(normalizeSeries(raw762, BASE_MONTH)).filter(item => item.points.length > 0)
  const generalSeries = groupSeries.find(item => item.rubricaName.toLowerCase() === 'índice general')

  if (!generalSeries) {
    throw new Error('No se encontró la serie de Índice general en g3=762')
  }

  const valueIndexes764 = buildValueIndexes(values764)
  const valueIndexes762 = buildValueIndexes(values762)

  const { payload: classPayload, missing: missingClassMap } = buildSeriesPayload(
    classSeries,
    valueIndexes764,
    764,
    'clase'
  )

  const { payload: generalPayload } = buildSeriesPayload([generalSeries], valueIndexes762, 762, 'grupo')

  let selectedClassPayload = classPayload
  if (!includeNoBase) {
    selectedClassPayload = classPayload.filter(item => item.hasBaseMonth)
  }

  const allSeries = [...generalPayload, ...selectedClassPayload]
  const months = computeMonths(allSeries)
  const catalog = dedupeCatalog([values762, values763, values764])

  const output = {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    baseMonth: BASE_MONTH,
    months,
    series: allSeries,
    catalog,
  }

  mkdirSync('src/data', { recursive: true })
  const writeResult = writeJsonPreservingMetadata(OUTPUT_PATH, output, 'generatedAt')

  console.log(writeResult.dataChanged ? '\n✅ Dataset generado' : '\n✅ Dataset sin cambios reales')
  console.log(`  Catálogo: ${catalog.length} nodos`)
  console.log(`  Series clase (dedupe): ${classPayload.length}`)
  console.log(
    `  Series clase incluidas: ${selectedClassPayload.length} (${includeNoBase ? 'incluye sin base' : 'solo con base 2002'})`
  )
  console.log(`  Serie de referencia IPC general: ${generalPayload.length}`)
  console.log(`  Meses: ${months[0]} → ${months[months.length - 1]} (${months.length})`)
  if (writeResult.metadataPreserved) {
    console.log('  generatedAt conservado porque los datos no cambiaron')
  }
  if (missingClassMap.length > 0) {
    console.log(`  Aviso: ${missingClassMap.length} clases sin mapping por nombre`)
  }
  console.log(`  Salida: ${OUTPUT_PATH}`)
}

main().catch(error => {
  console.error('\nError:', error)
  process.exit(1)
})
