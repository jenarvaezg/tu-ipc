import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Header from './Header'

describe('Header', () => {
  it('renders the title', () => {
    render(<Header lastUpdated="2026-02-01T00:00:00Z" />)
    expect(screen.getByText('Tu IPC Personal')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<Header lastUpdated="2026-02-01T00:00:00Z" />)
    expect(screen.getByText('Calcula tu inflación real según tus hábitos de consumo')).toBeInTheDocument()
  })

  it('formats the date in Spanish', () => {
    render(<Header lastUpdated="2026-02-01T00:00:00Z" />)
    expect(screen.getByText(/Últimos datos:/)).toBeInTheDocument()
  })

  it('uses dataMonth when provided', () => {
    render(<Header lastUpdated="2026-02-01T00:00:00Z" dataMonth="2025-12" />)
    expect(screen.getByText(/diciembre 2025/)).toBeInTheDocument()
  })

  it('shows methodology button when callback provided', () => {
    const onMethodology = vi.fn()
    render(<Header lastUpdated="2026-02-01T00:00:00Z" onMethodology={onMethodology} />)
    expect(screen.getByText('Metodología')).toBeInTheDocument()
  })

  it('calls onMethodology when clicked', async () => {
    const user = userEvent.setup()
    const onMethodology = vi.fn()
    render(<Header lastUpdated="2026-02-01T00:00:00Z" onMethodology={onMethodology} />)
    await user.click(screen.getByText('Metodología'))
    expect(onMethodology).toHaveBeenCalledOnce()
  })

  it('renders theme toggle', () => {
    render(<Header lastUpdated="2026-02-01T00:00:00Z" />)
    expect(screen.getByRole('button', { name: /modo/i })).toBeInTheDocument()
  })
})
