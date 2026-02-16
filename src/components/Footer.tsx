import { Button } from '@/components/ui/button'

interface FooterProps {
  onMethodology?: () => void
}

export default function Footer({ onMethodology }: FooterProps) {
  return (
    <footer className="py-8">
      <div className="mb-6 h-px bg-border" />
      <div className="text-center text-xs text-muted-foreground">
        <p className="mb-1">
          Datos del{' '}
          <a
            href="https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176802&menu=ultiDatos&idp=1254735976607"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-primary transition-colors"
          >
            Instituto Nacional de Estadística (INE)
          </a>
          {' '}· Índices de precios ECOICOP · Base 2021 = 100
        </p>
        <p>
          Esta herramienta es orientativa. El IPC oficial se calcula con metodología más compleja.
          {' '}
          <a
            href="https://www.ine.es/dyngs/DAB/index.htm?cid=1100"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-primary transition-colors"
          >
            API del INE
          </a>
          {onMethodology && (
            <>
              {' · '}
              <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground underline hover:text-primary" onClick={onMethodology}>
                Metodología
              </Button>
            </>
          )}
        </p>
      </div>
    </footer>
  )
}
