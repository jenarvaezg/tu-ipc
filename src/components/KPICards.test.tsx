import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import KPICards from './KPICards'

describe('KPICards', () => {
  it('renders all three KPI values', () => {
    render(<KPICards startMonth="2024-01" endMonth="2025-01" personalIPC={3.5} officialIPC={2.1} difference={1.4} />)
    expect(screen.getByText('+3.50%')).toBeInTheDocument()
    expect(screen.getByText('+2.10%')).toBeInTheDocument()
    expect(screen.getByText('+1.40 pp')).toBeInTheDocument()
  })

  it('shows negative values without plus sign', () => {
    render(<KPICards startMonth="2024-01" endMonth="2025-01" personalIPC={-1.2} officialIPC={-0.5} difference={-0.7} />)
    expect(screen.getByText('-1.20%')).toBeInTheDocument()
    expect(screen.getByText('-0.50%')).toBeInTheDocument()
    expect(screen.getByText('-0.70 pp')).toBeInTheDocument()
  })

  it('shows correct message when personal > official', () => {
    render(<KPICards startMonth="2024-01" endMonth="2025-01" personalIPC={3} officialIPC={2} difference={1} />)
    expect(screen.getByText('Tu coste de vida sube más que la media')).toBeInTheDocument()
  })

  it('shows correct message when personal < official', () => {
    render(<KPICards startMonth="2024-01" endMonth="2025-01" personalIPC={1} officialIPC={2} difference={-1} />)
    expect(screen.getByText('Tu coste de vida sube menos que la media')).toBeInTheDocument()
  })

  it('shows correct message when equal', () => {
    render(<KPICards startMonth="2024-01" endMonth="2025-01" personalIPC={2} officialIPC={2} difference={0} />)
    expect(screen.getByText('Tu inflación coincide con la media')).toBeInTheDocument()
  })

  it('applies rose color for positive values', () => {
    render(<KPICards startMonth="2024-01" endMonth="2025-01" personalIPC={1} officialIPC={2} difference={-1} />)
    const personalValue = screen.getByText('+1.00%')
    expect(personalValue.className).toContain('rose')
  })

  it('applies emerald color for negative values', () => {
    render(<KPICards startMonth="2024-01" endMonth="2025-01" personalIPC={-1} officialIPC={-2} difference={1} />)
    const personalValue = screen.getByText('-1.00%')
    expect(personalValue.className).toContain('emerald')
  })
})
