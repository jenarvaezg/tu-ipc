import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getThemeColor } from '@/data/themes'
import { Moon, Sun } from 'lucide-react'

function getInitialTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem('tu-ipc-theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* ignore */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('tu-ipc-theme', theme)
    const colorTheme = document.documentElement.getAttribute('data-theme')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', getThemeColor(colorTheme, theme === 'dark'))
    }
  }, [theme])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}
