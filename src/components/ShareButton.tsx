import { useState, useRef, useCallback } from 'react'
import { toPng } from 'html-to-image'
import { Button } from '@/components/ui/button'
import { Link2, Type, Image } from 'lucide-react'
import ShareCard from '@/components/ShareCard'

interface ShareButtonProps {
  personalIPC: number
  officialIPC: number
  difference: number
  startMonth: string
  endMonth: string
  region?: string
  isCustom?: boolean
}

export default function ShareButton({
  personalIPC,
  officialIPC,
  difference,
  startMonth,
  endMonth,
  region = 'nacional',
  isCustom = true,
}: ShareButtonProps) {
  const [copiedText, setCopiedText] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  function handleShareText() {
    const lines = isCustom
      ? [
          `Mi IPC personal (${startMonth} a ${endMonth}):`,
          `  Tu IPC: ${personalIPC >= 0 ? '+' : ''}${personalIPC.toFixed(2)}%`,
          `  IPC oficial: ${officialIPC >= 0 ? '+' : ''}${officialIPC.toFixed(2)}%`,
          `  Diferencia: ${difference >= 0 ? '+' : ''}${difference.toFixed(2)} pp`,
        ]
      : [
          `IPC en España (${startMonth} a ${endMonth}): ${officialIPC >= 0 ? '+' : ''}${officialIPC.toFixed(2)}%`,
        ]
    const text = [...lines, '', `Calcula el tuyo en ${window.location.href}`].join('\n')

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
      <div className="inline-flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShareText}
          className="h-8 w-8 hover:bg-primary/10"
          title={copiedText ? '¡Copiado!' : 'Copiar como texto'}
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopyLink}
          className="h-8 w-8 hover:bg-primary/10"
          title={copiedLink ? '¡Copiado!' : 'Copiar enlace'}
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShareImage}
          disabled={generatingImage}
          className="h-8 w-8 hover:bg-primary/10"
          title={generatingImage ? 'Generando...' : 'Descargar como imagen'}
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>
      <div style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
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
      </div>
    </>
  )
}
