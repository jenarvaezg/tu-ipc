declare global {
  interface Window {
    gtag?: (...args: [string, string, Record<string, string | number>?]) => void
  }
}

export function trackEvent(name: string, params?: Record<string, string | number>) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
}
