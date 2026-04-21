const REGION_MAP = {
  Nacional: 'nacional',
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
  Ceuta: 'ceuta',
  Melilla: 'melilla',
}

export function matchCategory(nombre, map) {
  const lower = nombre.toLowerCase()
  for (const cat of map) {
    if (cat.keywords.some(kw => lower.includes(kw))) {
      if (cat.code === '02' && lower.includes('alimentos')) continue
      return cat
    }
  }
  return null
}

export function resolveRegionCode(regionName) {
  if (typeof regionName !== 'string') return null
  return REGION_MAP[regionName.trim()] ?? null
}

export function parseSeriesData(dataArray) {
  const data = {}
  for (const d of dataArray || []) {
    const yearFromFields = Number(d.Anyo)
    const periodFromFields = Number(d.FK_Periodo)

    if (
      Number.isInteger(yearFromFields) &&
      Number.isInteger(periodFromFields) &&
      periodFromFields >= 1 &&
      periodFromFields <= 12
    ) {
      const month = String(periodFromFields).padStart(2, '0')
      data[`${yearFromFields}-${month}`] = d.Valor
      continue
    }

    const timestamp = Number(d.Fecha)
    if (!Number.isFinite(timestamp)) continue

    const date = new Date(timestamp)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    data[`${year}-${month}`] = d.Valor
  }
  return data
}

export function assertArrayResponse(data, label) {
  if (!Array.isArray(data)) {
    throw new Error(
      `Respuesta inesperada en ${label}: ${JSON.stringify(data).slice(0, 300)}`
    )
  }
  return data
}

export function combineSplitCategory12(newData, weightNew12, weightNew13) {
  for (const regionCode of Object.keys(newData)) {
    const rd = newData[regionCode]
    if (rd['12a'] && rd['12b']) {
      const combined = {}
      const allKeys = new Set([...Object.keys(rd['12a']), ...Object.keys(rd['12b'])])
      for (const m of allKeys) {
        const v12a = rd['12a'][m]
        const v12b = rd['12b'][m]
        if (v12a != null && v12b != null) {
          combined[m] = (weightNew12 * v12a + weightNew13 * v12b) / (weightNew12 + weightNew13)
        }
      }
      rd['12'] = combined
      delete rd['12a']
      delete rd['12b']
    }
  }
}

export function collectSortedNewMonths(newData) {
  const newMonths = new Set()
  for (const rd of Object.values(newData)) {
    for (const catData of Object.values(rd)) {
      for (const m of Object.keys(catData)) newMonths.add(m)
    }
  }
  return [...newMonths].sort()
}

export function chainLinkRegions(regions, newData, lastOldMonth, sortedNewMonths, allMonths) {
  let extended = 0
  let skipped = 0

  for (const [regionCode, region] of Object.entries(regions)) {
    const regionNew = newData[regionCode]
    if (!regionNew) continue

    for (const [catCode, catObj] of Object.entries(region.categories)) {
      const newCatData = regionNew[catCode]
      if (!newCatData) continue

      const oldValue = catObj.data[lastOldMonth]
      const newValue = newCatData[lastOldMonth]

      if (oldValue == null || newValue == null || newValue === 0) {
        skipped++
        continue
      }

      const linkFactor = oldValue / newValue

      for (const m of sortedNewMonths) {
        if (m <= lastOldMonth) continue
        if (newCatData[m] == null) continue

        catObj.data[m] = Math.round(newCatData[m] * linkFactor * 1000) / 1000
        allMonths.add(m)
        extended++
      }
    }
  }

  return { extended, skipped }
}
