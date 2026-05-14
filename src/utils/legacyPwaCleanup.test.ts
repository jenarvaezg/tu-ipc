import { describe, expect, it, vi } from 'vitest'
import { cleanupLegacyPwaState } from './legacyPwaCleanup'

describe('cleanupLegacyPwaState', () => {
  it('unregisters legacy service workers and deletes cache storage entries', async () => {
    const unregisterA = vi.fn().mockResolvedValue(true)
    const unregisterB = vi.fn().mockResolvedValue(true)
    const deleteCache = vi.fn().mockResolvedValue(true)
    const target = {
      navigator: {
        serviceWorker: {
          getRegistrations: vi.fn().mockResolvedValue([
            { unregister: unregisterA },
            { unregister: unregisterB },
          ]),
        },
      },
      caches: {
        keys: vi.fn().mockResolvedValue(['workbox-precache-v2', 'runtime-cache']),
        delete: deleteCache,
      },
    }

    await cleanupLegacyPwaState(target)

    expect(target.navigator.serviceWorker.getRegistrations).toHaveBeenCalledOnce()
    expect(unregisterA).toHaveBeenCalledOnce()
    expect(unregisterB).toHaveBeenCalledOnce()
    expect(target.caches.keys).toHaveBeenCalledOnce()
    expect(deleteCache).toHaveBeenCalledWith('workbox-precache-v2')
    expect(deleteCache).toHaveBeenCalledWith('runtime-cache')
  })

  it('does nothing when browser cleanup APIs are unavailable', async () => {
    await expect(cleanupLegacyPwaState({})).resolves.toBeUndefined()
  })

  it('still deletes caches when service worker cleanup fails', async () => {
    const deleteCache = vi.fn().mockResolvedValue(true)
    const target = {
      navigator: {
        serviceWorker: {
          getRegistrations: vi.fn().mockRejectedValue(new Error('blocked')),
        },
      },
      caches: {
        keys: vi.fn().mockResolvedValue(['workbox-precache-v2']),
        delete: deleteCache,
      },
    }

    await expect(cleanupLegacyPwaState(target)).resolves.toBeUndefined()

    expect(deleteCache).toHaveBeenCalledWith('workbox-precache-v2')
  })
})
