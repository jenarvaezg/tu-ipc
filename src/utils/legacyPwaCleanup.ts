interface LegacyServiceWorkerRegistration {
  unregister: () => Promise<boolean> | boolean
}

interface LegacyServiceWorkerContainer {
  getRegistrations: () => Promise<readonly LegacyServiceWorkerRegistration[]>
}

interface LegacyCacheStorage {
  keys: () => Promise<string[]>
  delete: (cacheName: string) => Promise<boolean>
}

export interface LegacyPwaCleanupTarget {
  navigator?: {
    serviceWorker?: LegacyServiceWorkerContainer
  }
  caches?: LegacyCacheStorage
}

async function ignoreCleanupErrors(task: () => Promise<void>): Promise<void> {
  try {
    await task()
  } catch {
    // Best-effort cleanup: stale PWA state must not block the app from rendering.
  }
}

async function unregisterLegacyServiceWorkers(target: LegacyPwaCleanupTarget): Promise<void> {
  const serviceWorker = target.navigator?.serviceWorker
  if (!serviceWorker?.getRegistrations) {
    return
  }

  const registrations = await serviceWorker.getRegistrations()
  await Promise.all(registrations.map((registration) => registration.unregister()))
}

async function deleteLegacyCaches(target: LegacyPwaCleanupTarget): Promise<void> {
  const cacheStorage = target.caches
  if (!cacheStorage) {
    return
  }

  const cacheNames = await cacheStorage.keys()
  await Promise.all(cacheNames.map((cacheName) => cacheStorage.delete(cacheName)))
}

export async function cleanupLegacyPwaState(target: LegacyPwaCleanupTarget): Promise<void> {
  await Promise.all([
    ignoreCleanupErrors(() => unregisterLegacyServiceWorkers(target)),
    ignoreCleanupErrors(() => deleteLegacyCaches(target)),
  ])
}

export function scheduleLegacyPwaCleanup(target: LegacyPwaCleanupTarget = globalThis): void {
  void cleanupLegacyPwaState(target)
}
