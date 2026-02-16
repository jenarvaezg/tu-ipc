import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CategoryBreakdown from './CategoryBreakdown'
import type { CategoryVariation } from '@/data/types'

const mockBreakdown: CategoryVariation[] = [
  { code: '04', name: 'Vivienda, agua, electricidad, gas', variation: 5.7, weight: 13.5, contribution: 0.77 },
  { code: '01', name: 'Alimentos y bebidas no alcohólicas', variation: 3.0, weight: 21.9, contribution: 0.66 },
  { code: '03', name: 'Vestido y calzado', variation: -1.2, weight: 4.8, contribution: -0.06 },
]

describe('CategoryBreakdown', () => {
  it('renders nothing when breakdown is empty', () => {
    const { container } = render(<CategoryBreakdown breakdown={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders the title', () => {
    render(<CategoryBreakdown breakdown={mockBreakdown} />)
    expect(screen.getByText('Desglose por categoría')).toBeInTheDocument()
  })

  it('renders all categories', () => {
    render(<CategoryBreakdown breakdown={mockBreakdown} />)
    expect(screen.getByText('Vivienda, agua, electricidad, gas')).toBeInTheDocument()
    expect(screen.getByText('Alimentos y bebidas no alcohólicas')).toBeInTheDocument()
    expect(screen.getByText('Vestido y calzado')).toBeInTheDocument()
  })

  it('shows positive contributions with + sign', () => {
    render(<CategoryBreakdown breakdown={mockBreakdown} />)
    expect(screen.getByText('+0.77pp')).toBeInTheDocument()
    expect(screen.getByText('+0.66pp')).toBeInTheDocument()
  })

  it('shows negative contributions with - sign', () => {
    render(<CategoryBreakdown breakdown={mockBreakdown} />)
    expect(screen.getByText('-0.06pp')).toBeInTheDocument()
  })

  it('applies red color for positive and emerald for negative', () => {
    render(<CategoryBreakdown breakdown={mockBreakdown} />)
    const negative = screen.getByText('-0.06pp')
    expect(negative.className).toContain('emerald')
    const positive = screen.getByText('+0.77pp')
    expect(positive.className).toContain('red')
  })
})
