// Single source of truth for the ECOICOP v1 ↔ v2 transition.
//
// The new INE table (base 2025, ECOICOP v2) splits the old "Otros bienes y
// servicios" category 12 into two:
//   12  Seguros y servicios financieros
//   13  Cuidado personal, protección social y bienes/servicios diversos
//
// Tu IPC keeps the legacy 12-category basket, so we fold v2 categories 12+13
// back into v1 category 12 using a weighted average of their indices with the
// official ECOICOP 2025 base-2021 weights.

export const V2_SPLIT_12_WEIGHTS = Object.freeze({
  12: 3.7, // Seguros y servicios financieros
  13: 4.0, // Cuidado personal, protección social...
})

/**
 * Map a two-digit ECOICOP v2 group code to its v1 equivalent.
 * Only code 13 needs remapping; everything else passes through.
 *
 * @param {string} twoDigitCode
 * @returns {string}
 */
export function foldV2GroupCodeToV1(twoDigitCode) {
  if (twoDigitCode === '13') return '12'
  return twoDigitCode
}

/**
 * In-place: replace `newData[region]['12a']` + `newData[region]['12b']` with
 * a synthetic `newData[region]['12']` series, combining the two split v2
 * categories using {@link V2_SPLIT_12_WEIGHTS}. Months that exist in only one
 * side are skipped — only months present in BOTH are combined. Regions
 * without both splits are left untouched.
 *
 * @param {Record<string, Record<string, Record<string, number>>>} newData
 */
export function combineV2SplitCategory12(newData) {
  const w12 = V2_SPLIT_12_WEIGHTS[12]
  const w13 = V2_SPLIT_12_WEIGHTS[13]
  const denom = w12 + w13

  for (const regionCode of Object.keys(newData)) {
    const rd = newData[regionCode]
    if (rd['12a'] && rd['12b']) {
      const combined = {}
      const allKeys = new Set([
        ...Object.keys(rd['12a']),
        ...Object.keys(rd['12b']),
      ])
      for (const m of allKeys) {
        const v12a = rd['12a'][m]
        const v12b = rd['12b'][m]
        if (v12a != null && v12b != null) {
          combined[m] = (w12 * v12a + w13 * v12b) / denom
        }
      }
      rd['12'] = combined
      delete rd['12a']
      delete rd['12b']
    }
  }
}
