import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'
import { formatMonth } from '@/utils/formatMonth'
import { SlidersHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'

interface HeaderProps {
  lastUpdated: string
  dataMonth?: string
  onMethodology?: () => void
  onOpenFilters?: () => void
  actions?: ReactNode
}

export default function Header({ lastUpdated, dataMonth, onMethodology, onOpenFilters, actions }: HeaderProps) {
  const dateStr = dataMonth
    ? formatMonth(dataMonth)
    : new Date(lastUpdated).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
      })

  return (
    <header className="text-center mb-6 animate-fade-in relative">
      <div className="absolute right-0 top-0 flex items-center gap-1">
        {onOpenFilters && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onOpenFilters}
            aria-label="Abrir filtros"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        )}
        {actions}
        <ThemeToggle />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Tu IPC Personal
      </h1>
      <p className="text-lg text-muted-foreground mb-2">
        Calcula tu inflación real según tus hábitos de consumo
      </p>
      <p className="text-sm text-muted-foreground/60">
        Datos del INE · Índices ECOICOP por CCAA · Últimos datos: {dateStr}
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
