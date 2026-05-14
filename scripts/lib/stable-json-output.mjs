import { existsSync, readFileSync, writeFileSync } from 'fs'

function omitTopLevelKeys(value, keysToOmit) {
  if (!value || typeof value !== 'object') {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !keysToOmit.has(key))
  )
}

export function isSameJsonData(existing, next, metadataKeys) {
  const keysToOmit = new Set(metadataKeys)
  return (
    JSON.stringify(omitTopLevelKeys(existing, keysToOmit)) ===
    JSON.stringify(omitTopLevelKeys(next, keysToOmit))
  )
}

export function writeJsonPreservingMetadata(outputPath, next, metadataKey) {
  let output = next
  let dataChanged = true
  let metadataPreserved = false

  if (existsSync(outputPath)) {
    const existingRaw = readFileSync(outputPath, 'utf8')
    const existing = JSON.parse(existingRaw)

    if (isSameJsonData(existing, next, [metadataKey])) {
      output = {
        ...next,
        [metadataKey]: existing[metadataKey] ?? next[metadataKey],
      }
      dataChanged = false
      metadataPreserved = true

      const nextRaw = JSON.stringify(output)
      if (existingRaw === nextRaw) {
        return { dataChanged, metadataPreserved, wroteFile: false }
      }
    }
  }

  writeFileSync(outputPath, JSON.stringify(output))
  return { dataChanged, metadataPreserved, wroteFile: true }
}
