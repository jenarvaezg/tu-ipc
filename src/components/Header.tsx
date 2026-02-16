import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'

interface HeaderProps {
  lastUpdated: string
  onMethodology?: () => void
}

export default function Header({ lastUpdated, onMethodology }: HeaderProps) {
  const dateStr = new Date(lastUpdated).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <header className="text-center mb-10 animate-fade-in relative">
      <div className="absolute right-0 top-0">
        <ThemeToggle />
      </div>
      <h1 className="text-5xl font-bold tracking-tight mb-3">
        Tu IPC Personal
      </h1>
      <p className="text-lg text-muted-foreground mb-2">
        Calcula tu inflación real según tus hábitos de consumo
      </p>
      <p className="text-sm text-muted-foreground/60">
        Datos del INE · Índices ECOICOP por CCAA · Actualizado: {dateStr}
        {onMethodology && (
          <>
            {' · '}
            <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground/60 underline hover:text-foreground transition-colors" onClick={onMethodology}>
              Metodología
            </Button>
          </>
        )}
      </p>
    </header>
  )
}
