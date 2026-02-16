import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ShareButton from './ShareButton'

describe('ShareButton', () => {
  it('renders the share button', () => {
    render(
      <ShareButton
        personalIPC={2.9}
        officialIPC={2.9}
        difference={0}
        startMonth="2024-01"
        endMonth="2025-01"
      />
    )
    expect(screen.getByTitle('Compartir imagen')).toBeInTheDocument()
  })

  it('renders as a single button', () => {
    render(
      <ShareButton
        personalIPC={2.9}
        officialIPC={2.9}
        difference={0}
        startMonth="2024-01"
        endMonth="2025-01"
      />
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
  })
})
