import { useEffect } from 'react'
import { isValidThemeId, getThemeColor } from '@/data/themes'

const STORAGE_KEY = 'tu-ipc-color-theme'

function getActiveTheme(): string | null {
  const params = new URLSearchParams(window.location.search)
  const urlTheme = params.get('theme')
  if (urlTheme && isValidThemeId(urlTheme)) return urlTheme

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && isValidThemeId(saved)) return saved
  } catch { /* ignore */ }

  return null
}

export function useTheme() {
  useEffect(() => {
    const themeId = getActiveTheme()

    if (themeId) {
      document.documentElement.setAttribute('data-theme', themeId)
      try { localStorage.setItem(STORAGE_KEY, themeId) } catch { /* ignore */ }
    } else {
      document.documentElement.removeAttribute('data-theme')
      try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    }

    const isDark = document.documentElement.classList.contains('dark')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', getThemeColor(themeId, isDark))
    }
  }, [])
}
