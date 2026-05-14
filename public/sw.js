self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(removeLegacyPwaState());
});

async function removeLegacyPwaState() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  } catch {
    // Keep unregistering the legacy worker even if cache cleanup fails.
  }

  try {
    await self.clients.claim();
  } catch {
    // Best effort: clients may not be claimable in every browser state.
  }

  let windowClients = [];
  try {
    windowClients = await self.clients.matchAll({ type: 'window' });
  } catch {
    windowClients = [];
  }

  try {
    await self.registration.unregister();
  } catch {
    // The app also unregisters service workers when the new bundle loads.
  }

  await Promise.all(
    windowClients.map((client) => {
      if ('navigate' in client) {
        return client.navigate(client.url).catch(() => undefined);
      }

      return undefined;
    }),
  );
}
