import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import ShareButton from './ShareButton'

function getClipboardCalls(): string[] {
  return (window as any).__clipboardCalls
}

describe('ShareButton', () => {
  beforeEach(() => {
    getClipboardCalls().length = 0
  })

  it('renders the share buttons', () => {
    render(
      <ShareButton
        personalIPC={2.9}
        officialIPC={2.9}
        difference={0}
        startMonth="2024-01"
        endMonth="2025-01"
      />
    )
    expect(screen.getByText('Texto')).toBeInTheDocument()
    expect(screen.getByText('Enlace')).toBeInTheDocument()
    expect(screen.getByText('Imagen')).toBeInTheDocument()
  })

  it('copies correct text to clipboard on Texto click', async () => {
    render(
      <ShareButton
        personalIPC={2.9}
        officialIPC={2.9}
        difference={0}
        startMonth="2024-01"
        endMonth="2025-01"
      />
    )
    await act(async () => {
      fireEvent.click(screen.getByText('Texto'))
      await new Promise(r => setTimeout(r, 0))
    })
    const calls = getClipboardCalls()
    expect(calls).toHaveLength(1)
    expect(calls[0]).toContain('Mi IPC personal')
    expect(calls[0]).toContain('+2.90%')
  })

  it('copies link to clipboard on Enlace click', async () => {
    render(
      <ShareButton
        personalIPC={2.9}
        officialIPC={2.9}
        difference={0}
        startMonth="2024-01"
        endMonth="2025-01"
      />
    )
    await act(async () => {
      fireEvent.click(screen.getByText('Enlace'))
      await new Promise(r => setTimeout(r, 0))
    })
    const calls = getClipboardCalls()
    expect(calls).toHaveLength(1)
    expect(calls[0]).toContain('http://localhost')
  })

  it('shows Copiado! after Texto click', async () => {
    const user = userEvent.setup()
    render(
      <ShareButton
        personalIPC={2.9}
        officialIPC={2.9}
        difference={0}
        startMonth="2024-01"
        endMonth="2025-01"
      />
    )
    await user.click(screen.getByText('Texto'))
    expect(screen.getAllByText('Copiado!').length).toBeGreaterThanOrEqual(1)
  })
})
