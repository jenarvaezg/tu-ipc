import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Link2, Check } from 'lucide-react'

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = window.location.href
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={`h-8 w-8 transition-colors ${copied ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'hover:bg-primary/10'}`}
      title={copied ? '¡Copiado!' : 'Copiar enlace'}
      aria-label={copied ? '¡Copiado!' : 'Copiar enlace'}
    >
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
    </Button>
  )
}
