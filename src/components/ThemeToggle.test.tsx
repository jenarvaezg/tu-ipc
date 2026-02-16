import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import ThemeToggle from './ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    cleanup()
    document.documentElement.classList.remove('dark')
    localStorage.removeItem('tu-ipc-theme')
  })

  it('renders a button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('toggles dark class on html element', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const button = screen.getByRole('button')

    // Default is light (matchMedia returns false in setup)
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    await user.click(button)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('persists theme preference to localStorage', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(screen.getByRole('button'))
    expect(localStorage.getItem('tu-ipc-theme')).toBe('dark')
  })
})
