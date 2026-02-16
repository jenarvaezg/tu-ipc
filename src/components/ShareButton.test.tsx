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
    expect(screen.getByText('Compartir resultado')).toBeInTheDocument()
  })

  it('copies correct text to clipboard on click', async () => {
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
      fireEvent.click(screen.getByText('Compartir resultado'))
      await new Promise(r => setTimeout(r, 0))
    })
    const calls = getClipboardCalls()
    expect(calls).toHaveLength(1)
    expect(calls[0]).toContain('Mi IPC personal')
    expect(calls[0]).toContain('+2.90%')
    expect(calls[0]).toContain('tu-ipc.vercel.app')
  })

  it('shows Copiado! after click', async () => {
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
    await user.click(screen.getByText('Compartir resultado'))
    expect(screen.getByText('Copiado!')).toBeInTheDocument()
  })
})
