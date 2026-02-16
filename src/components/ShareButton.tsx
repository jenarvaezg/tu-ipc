import { useState, useRef, useCallback, type RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Loader2, Check } from 'lucide-react'
import ShareCard from '@/components/ShareCard'

interface ShareButtonProps {
  personalIPC: number
  officialIPC: number
  difference: number
  startMonth: string
  endMonth: string
  region?: string
  isCustom?: boolean
  chartRef?: RefObject<HTMLDivElement | null>
}

export default function ShareButton({
  personalIPC,
  officialIPC,
  difference,
  startMonth,
  endMonth,
  region = 'nacional',
  chartRef,
}: ShareButtonProps) {
  const [state, setState] = useState<'idle' | 'generating' | 'done'>('idle')
  const fallbackRef = useRef<HTMLDivElement>(null)

  const handleShare = useCallback(async () => {
    const target = chartRef?.current || fallbackRef.current
    if (!target || state === 'generating') return
    setState('generating')

    try {
      const { toPng } = await import('html-to-image')
      const isDark = document.documentElement.classList.contains('dark')
      const dataUrl = await toPng(target, {
        pixelRatio: 2,
        backgroundColor: isDark ? '#09090b' : '#ffffff',
      })

      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'mi-ipc-personal.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Mi IPC Personal',
          text: `Mi inflación personal: ${personalIPC >= 0 ? '+' : ''}${personalIPC.toFixed(2)}%`,
        })
      } else {
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = 'mi-ipc-personal.png'
        link.click()
      }

      setState('done')
      setTimeout(() => setState('idle'), 2000)
    } catch (err) {
      console.error('Error generating image:', err)
      setState('idle')
    }
  }, [personalIPC, state, chartRef])

  const title = state === 'generating' ? 'Generando...' : state === 'done' ? '¡Compartido!' : 'Compartir imagen'

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleShare}
        disabled={state === 'generating'}
        className={`h-8 w-8 transition-colors ${state === 'done' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'hover:bg-primary/10'}`}
        title={title}
      >
        {state === 'generating' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : state === 'done' ? (
          <Check className="h-4 w-4" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
      </Button>
      <div style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
        <ShareCard
          ref={fallbackRef}
          personalIPC={personalIPC}
          officialIPC={officialIPC}
          difference={difference}
          startMonth={startMonth}
          endMonth={endMonth}
          region={region}
          url={typeof window !== 'undefined' ? window.location.href : ''}
        />
      </div>
    </>
  )
}
