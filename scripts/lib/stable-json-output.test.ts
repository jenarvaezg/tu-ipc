import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import {
  isSameJsonData,
  writeJsonPreservingMetadata,
} from './stable-json-output.mjs'

describe('stable json output', () => {
  it('compares payloads while ignoring configured metadata keys', () => {
    const existing = {
      lastUpdated: '2026-01-01T00:00:00.000Z',
      months: ['2026-01'],
      regions: { nacional: { value: 1 } },
    }
    const next = {
      lastUpdated: '2026-01-02T00:00:00.000Z',
      months: ['2026-01'],
      regions: { nacional: { value: 1 } },
    }

    expect(isSameJsonData(existing, next, ['lastUpdated'])).toBe(true)
  })

  it('preserves existing metadata and avoids rewriting when data is unchanged', () => {
    const dir = mkdtempSync(join(tmpdir(), 'stable-json-output-'))
    const path = join(dir, 'data.json')
    const existing = {
      generatedAt: '2026-01-01T00:00:00.000Z',
      series: [{ id: '1', points: [{ month: '2026-01', value: 100 }] }],
    }
    const next = {
      generatedAt: '2026-01-02T00:00:00.000Z',
      series: [{ id: '1', points: [{ month: '2026-01', value: 100 }] }],
    }

    writeFileSync(path, JSON.stringify(existing))
    const result = writeJsonPreservingMetadata(path, next, 'generatedAt')

    expect(result).toEqual({
      dataChanged: false,
      metadataPreserved: true,
      wroteFile: false,
    })
    expect(JSON.parse(readFileSync(path, 'utf8'))).toEqual(existing)

    rmSync(dir, { recursive: true, force: true })
  })

  it('updates metadata when data changes', () => {
    const dir = mkdtempSync(join(tmpdir(), 'stable-json-output-'))
    const path = join(dir, 'data.json')
    const existing = {
      lastUpdated: '2026-01-01T00:00:00.000Z',
      months: ['2026-01'],
    }
    const next = {
      lastUpdated: '2026-01-02T00:00:00.000Z',
      months: ['2026-01', '2026-02'],
    }

    writeFileSync(path, JSON.stringify(existing))
    const result = writeJsonPreservingMetadata(path, next, 'lastUpdated')

    expect(result).toEqual({
      dataChanged: true,
      metadataPreserved: false,
      wroteFile: true,
    })
    expect(JSON.parse(readFileSync(path, 'utf8'))).toEqual(next)

    rmSync(dir, { recursive: true, force: true })
  })
})
