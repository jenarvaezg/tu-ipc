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
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Tu IPC Personal
          </h1>
          <p className="mt-1 text-base text-muted-foreground sm:text-lg">
            Estima tu inflación según tus hábitos de consumo
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onOpenFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
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
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>Datos del INE · Índices ECOICOP por CCAA</span>
        <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          Últimos datos: {dateStr}
        </span>
        {onMethodology && (
          <Button
            variant="link"
            className="h-auto p-0 text-sm text-muted-foreground underline transition-colors hover:text-foreground"
            onClick={onMethodology}
          >
            Metodología
          </Button>
        )}
      </div>
      {daysSinceUpdate > 45 && (
        <p className="text-xs text-amber-500 mt-1">
          Datos no actualizados desde hace {daysSinceUpdate} días
        </p>
      )}
    </header>
  );
}
