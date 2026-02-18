import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { formatMonth } from "@/utils/formatMonth";
import { SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

interface HeaderProps {
  lastUpdated: string;
  dataMonth?: string;
  onMethodology?: () => void;
  onOpenFilters?: () => void;
  actions?: ReactNode;
}

export default function Header({
  lastUpdated,
  dataMonth,
  onMethodology,
  onOpenFilters,
  actions,
}: HeaderProps) {
  const dateStr = dataMonth
    ? formatMonth(dataMonth)
    : new Date(lastUpdated).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
      });

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(lastUpdated).getTime()) / 86400000,
  );

  return (
    <header className="mb-6 animate-fade-in">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Tu IPC Personal
        </h1>
        <div className="flex items-center gap-1 shrink-0">
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
      </div>
      <p className="text-lg text-muted-foreground mb-2 text-center">
        Estima tu inflación según tus hábitos de consumo
      </p>
      <p className="text-sm text-muted-foreground/60">
        Datos del INE · Índices ECOICOP por CCAA · Últimos datos: {dateStr}
        {onMethodology && (
          <>
            {" · "}
            <Button
              variant="link"
              className="p-0 h-auto text-sm text-muted-foreground/60 underline hover:text-foreground transition-colors"
              onClick={onMethodology}
            >
              Metodología
            </Button>
          </>
        )}
      </p>
      {daysSinceUpdate > 45 && (
        <p className="text-xs text-amber-500 mt-1">
          Datos no actualizados desde hace {daysSinceUpdate} días
        </p>
      )}
    </header>
  );
}
