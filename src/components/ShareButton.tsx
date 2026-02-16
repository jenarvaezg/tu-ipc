import { useState, useRef, useCallback } from 'react'
import { toPng } from 'html-to-image'
import { Button } from '@/components/ui/button'
import ShareCard from '@/components/ShareCard'

interface ShareButtonProps {
  personalIPC: number
  officialIPC: number
  difference: number
  startMonth: string
  endMonth: string
  region?: string
}

export default function ShareButton({
  personalIPC,
  officialIPC,
  difference,
  startMonth,
  endMonth,
  region = 'nacional',
}: ShareButtonProps) {
  const [copiedText, setCopiedText] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  function handleShareText() {
    const text = [
      `Mi IPC personal (${startMonth} a ${endMonth}):`,
      `  Tu IPC: ${personalIPC >= 0 ? '+' : ''}${personalIPC.toFixed(2)}%`,
      `  IPC oficial: ${officialIPC >= 0 ? '+' : ''}${officialIPC.toFixed(2)}%`,
      `  Diferencia: ${difference >= 0 ? '+' : ''}${difference.toFixed(2)} pp`,
      '',
      `Calcula el tuyo en ${window.location.href}`,
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
    })
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    })
  }

  const handleShareImage = useCallback(async () => {
    if (!cardRef.current || generatingImage) return
    setGeneratingImage(true)

    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1200,
        height: 630,
        pixelRatio: 2,
      })

      // Convert data URL to blob
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'mi-ipc-personal.png', { type: 'image/png' })

      // Try Web Share API (mobile)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Mi IPC Personal',
          text: `Mi inflación personal: ${personalIPC >= 0 ? '+' : ''}${personalIPC.toFixed(2)}%`,
        })
      } else {
        // Fallback: download
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = 'mi-ipc-personal.png'
        link.click()
      }
    } catch (err) {
      console.error('Error generating image:', err)
    } finally {
      setGeneratingImage(false)
    }
  }, [personalIPC, generatingImage])

  return (
    <>
      <div className="inline-flex rounded-lg border border-border overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShareText}
          className="rounded-none border-r border-border"
        >
          {copiedText ? 'Copiado!' : 'Texto'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyLink}
          className="rounded-none border-r border-border"
        >
          {copiedLink ? 'Copiado!' : 'Enlace'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShareImage}
          disabled={generatingImage}
          className="rounded-none"
        >
          {generatingImage ? 'Generando...' : 'Imagen'}
        </Button>
      </div>
      <ShareCard
        ref={cardRef}
        personalIPC={personalIPC}
        officialIPC={officialIPC}
        difference={difference}
        startMonth={startMonth}
        endMonth={endMonth}
        region={region}
        url={window.location.href}
      />
    </>
  )
}
