import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import PeriodSelector from './PeriodSelector'

const months = ['2024-01', '2024-06', '2024-12', '2025-01', '2025-06', '2025-12']

describe('PeriodSelector', () => {
  it('renders the title', () => {
    render(
      <PeriodSelector
        months={months}
        startMonth="2024-01"
        endMonth="2025-12"
        onStartChange={() => {}}
        onEndChange={() => {}}
      />
    )
    expect(screen.getByText('Periodo de comparación')).toBeInTheDocument()
  })

  it('renders preset buttons without 6 months', () => {
    render(
      <PeriodSelector
        months={months}
        startMonth="2024-01"
        endMonth="2025-12"
        onStartChange={() => {}}
        onEndChange={() => {}}
      />
    )
    expect(screen.getByText('Último año')).toBeInTheDocument()
    expect(screen.getByText('Últimos 2 años')).toBeInTheDocument()
    expect(screen.getByText('Todo el histórico')).toBeInTheDocument()
    expect(screen.queryByText('Últimos 6 meses')).not.toBeInTheDocument()
  })

  it('calls onStartChange and onEndChange when preset clicked', async () => {
    const user = userEvent.setup()
    const onStartChange = vi.fn()
    const onEndChange = vi.fn()
    render(
      <PeriodSelector
        months={months}
        startMonth="2024-01"
        endMonth="2025-12"
        onStartChange={onStartChange}
        onEndChange={onEndChange}
      />
    )
    await user.click(screen.getByText('Todo el histórico'))
    expect(onStartChange).toHaveBeenCalled()
    expect(onEndChange).toHaveBeenCalledWith('2025-12')
  })

  it('renders Desde and Hasta labels', () => {
    render(
      <PeriodSelector
        months={months}
        startMonth="2024-01"
        endMonth="2025-12"
        onStartChange={() => {}}
        onEndChange={() => {}}
      />
    )
    expect(screen.getByText('Desde')).toBeInTheDocument()
    expect(screen.getByText('Hasta')).toBeInTheDocument()
  })
})
