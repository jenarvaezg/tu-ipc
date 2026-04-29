import { describe, expect, it, vi } from 'vitest'
import {
  fetchJsonWithRetry,
  isRetriableInePayload,
  shouldRetryHttpStatus,
} from './ine-fetch.mjs'

function jsonResponse(status: number, payload: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response
}

describe('INE fetch helpers', () => {
  it('classifies the INE in-progress payload as retriable', () => {
    expect(
      isRetriableInePayload({
        status: 'Petición en proceso. Actualice página pasados unos minutos.',
      })
    ).toBe(true)
  })

  it('does not classify arbitrary error objects as retriable', () => {
    expect(isRetriableInePayload({ COD: 123, Error: [{ COD: 56 }] })).toBe(false)
  })

  it('retries transient INE payloads and returns the eventual JSON payload', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, {
          status: 'Petición en proceso. Actualice página pasados unos minutos.',
        })
      )
      .mockResolvedValueOnce(jsonResponse(200, [{ Id: 1 }]))
    const sleep = vi.fn().mockResolvedValue(undefined)

    const payload = await fetchJsonWithRetry('https://example.test/ine', 'Tabla test', {
      attempts: 2,
      delayMs: 25,
      fetchImpl,
      onRetry: vi.fn(),
      sleep,
    })

    expect(payload).toEqual([{ Id: 1 }])
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(sleep).toHaveBeenCalledWith(25)
  })

  it('retries 5xx responses but not permanent 4xx responses', async () => {
    expect(shouldRetryHttpStatus(500)).toBe(true)
    expect(shouldRetryHttpStatus(503)).toBe(true)
    expect(shouldRetryHttpStatus(429)).toBe(true)
    expect(shouldRetryHttpStatus(404)).toBe(false)

    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(503, { error: 'busy' }))
      .mockResolvedValueOnce(jsonResponse(200, [{ Id: 2 }]))
    const sleep = vi.fn().mockResolvedValue(undefined)

    await expect(
      fetchJsonWithRetry('https://example.test/ine', 'Tabla test', {
        attempts: 2,
        fetchImpl,
        onRetry: vi.fn(),
        sleep,
      })
    ).resolves.toEqual([{ Id: 2 }])

    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('fails immediately for permanent HTTP errors', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(404, { error: 'missing' }))
    const sleep = vi.fn().mockResolvedValue(undefined)

    await expect(
      fetchJsonWithRetry('https://example.test/ine', 'Tabla test', {
        attempts: 3,
        fetchImpl,
        sleep,
      })
    ).rejects.toThrow(/HTTP 404/)

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(sleep).not.toHaveBeenCalled()
  })
})
