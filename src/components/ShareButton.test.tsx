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
    expect(screen.getByTitle('Copiar como texto')).toBeInTheDocument()
    expect(screen.getByTitle('Copiar enlace')).toBeInTheDocument()
    expect(screen.getByTitle('Descargar como imagen')).toBeInTheDocument()
  })

  it('copies correct text to clipboard on text button click', async () => {
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
      fireEvent.click(screen.getByTitle('Copiar como texto'))
      await new Promise(r => setTimeout(r, 0))
    })
    const calls = getClipboardCalls()
    expect(calls).toHaveLength(1)
    expect(calls[0]).toContain('IPC')
    expect(calls[0]).toContain('+2.90%')
  })

  it('copies link to clipboard on link button click', async () => {
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
      fireEvent.click(screen.getByTitle('Copiar enlace'))
      await new Promise(r => setTimeout(r, 0))
    })
    const calls = getClipboardCalls()
    expect(calls).toHaveLength(1)
    expect(calls[0]).toContain('http://localhost')
  })

  it('shows Copiado title after text button click', async () => {
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
    await user.click(screen.getByTitle('Copiar como texto'))
    expect(screen.getByTitle('¡Copiado!')).toBeInTheDocument()
  })
})
