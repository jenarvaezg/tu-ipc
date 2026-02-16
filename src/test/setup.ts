import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// jsdom doesn't implement clipboard API — expose calls for test assertions
;(window as any).__clipboardCalls = [] as string[]
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: (text: string) => {
      ;(window as any).__clipboardCalls.push(text)
      return Promise.resolve()
    },
    readText: () => Promise.resolve(''),
  },
  writable: true,
  configurable: true,
})

// Ensure localStorage works in jsdom
const store: Record<string, string> = {}
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { for (const k in store) delete store[k] },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  },
})
