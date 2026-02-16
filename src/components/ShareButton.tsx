import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ShareButtonProps {
  personalIPC: number
  officialIPC: number
  difference: number
  startMonth: string
  endMonth: string
}

export default function ShareButton({
  personalIPC,
  officialIPC,
  difference,
  startMonth,
  endMonth,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const text = [
      `Mi IPC personal (${startMonth} a ${endMonth}):`,
      `  Tu IPC: ${personalIPC >= 0 ? '+' : ''}${personalIPC.toFixed(2)}%`,
      `  IPC oficial: ${officialIPC >= 0 ? '+' : ''}${officialIPC.toFixed(2)}%`,
      `  Diferencia: ${difference >= 0 ? '+' : ''}${difference.toFixed(2)} pp`,
      '',
      'Calcula el tuyo en tu-ipc.vercel.app',
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Button onClick={handleShare}>
      {copied ? 'Copiado!' : 'Compartir resultado'}
    </Button>
  )
}
