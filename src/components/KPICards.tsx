import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { COMPARISON_COLORS } from "@/data/constants";
import { formatMonth } from "@/utils/formatMonth";

interface ComparisonKPI {
  label: string;
  ipc: number;
}

interface KPICardsProps {
  personalIPC: number;
  officialIPC: number;
  difference: number;
  comparisons?: ComparisonKPI[];
  isCustom?: boolean;
  startMonth: string;
  endMonth: string;
}

function monthsDiff(start: string, end: string): number {
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  return (ey - sy) * 12 + (em - sm);
}

function halvingYears(rate: number, months: number): number | null {
  if (rate <= 0 || months <= 0) return null;
  const annualRate = Math.pow(1 + rate / 100, 12 / months) - 1;
  if (annualRate <= 0) return null;
  return Math.log(2) / Math.log(1 + annualRate);
}

function formatHalving(years: number | null): string | null {
  if (years == null || years > 200) return null;
  if (years >= 1) return `${Math.round(years)} años`;
  const months = Math.round(years * 12);
  return months <= 1 ? "1 mes" : `${months} meses`;
}

export default function KPICards({
  personalIPC,
  officialIPC,
  difference,
  comparisons = [],
  isCustom = true,
  startMonth,
  endMonth,
}: KPICardsProps) {
  const [showAllMobileComparisons, setShowAllMobileComparisons] = useState(false);

  useEffect(() => {
    if (comparisons.length <= 2 && showAllMobileComparisons) {
      setShowAllMobileComparisons(false);
    }
  }, [comparisons.length, showAllMobileComparisons]);

  const personalColor = personalIPC >= 0 ? "text-rose-400" : "text-emerald-400";
  const officialColor = officialIPC >= 0 ? "text-rose-400" : "text-emerald-400";
  const diffColor = difference >= 0 ? "text-rose-400" : "text-emerald-400";

  const months = monthsDiff(startMonth, endMonth);
  const personalHalving = formatHalving(halvingYears(personalIPC, months));
  const officialHalving = formatHalving(halvingYears(officialIPC, months));

  const diffText =
    difference > 0
      ? "Tu coste de vida sube más que la media"
      : difference < 0
        ? "Tu coste de vida sube menos que la media"
        : "Tu inflación coincide con la media";

  const GRID_CLASSES: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
    5: "md:grid-cols-3 lg:grid-cols-5",
    6: "md:grid-cols-3 lg:grid-cols-6",
  };
  const baseCards = 3;
  const totalCards = baseCards + comparisons.length;
  const gridCols = GRID_CLASSES[Math.min(totalCards, 6)] || "md:grid-cols-3";
  const hiddenComparisons = Math.max(0, comparisons.length - 2);

  return (
    <>
      <div className={`mb-4 grid grid-cols-1 gap-4 ${gridCols}`}>
        <Card className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <CardContent className="pt-6 text-center">
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              Tu IPC personal
            </p>
            <p className={`text-3xl font-bold tracking-tight ${personalColor}`}>
              {personalIPC !== 0 && (
                <span aria-hidden="true">{personalIPC > 0 ? "↑" : "↓"}</span>
              )}
              <span className="sr-only">
                {personalIPC > 0 ? "subida" : personalIPC < 0 ? "bajada" : ""}
              </span>
              {personalIPC >= 0 ? "+" : ""}
              {personalIPC.toFixed(2)}%
            </p>
            {personalHalving && (
              <p className="mt-2 text-xs text-muted-foreground">
                A este ritmo, valdría la mitad en ~{personalHalving}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardContent className="pt-6 text-center">
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              IPC oficial
            </p>
            <p className={`text-3xl font-bold tracking-tight ${officialColor}`}>
              {officialIPC !== 0 && (
                <span aria-hidden="true">{officialIPC > 0 ? "↑" : "↓"}</span>
              )}
              <span className="sr-only">
                {officialIPC > 0 ? "subida" : officialIPC < 0 ? "bajada" : ""}
              </span>
              {officialIPC >= 0 ? "+" : ""}
              {officialIPC.toFixed(2)}%
            </p>
            {officialHalving && (
              <p className="mt-2 text-xs text-muted-foreground">
                A este ritmo, valdría la mitad en ~{officialHalving}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <CardContent className="pt-6 text-center">
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              Diferencia
            </p>
            <p className={`text-3xl font-bold tracking-tight ${diffColor}`}>
              {difference !== 0 && (
                <span aria-hidden="true">{difference > 0 ? "↑" : "↓"}</span>
              )}
              <span className="sr-only">
                {difference > 0 ? "subida" : difference < 0 ? "bajada" : ""}
              </span>
              {difference >= 0 ? "+" : ""}
              {difference.toFixed(2)} pp
            </p>
            <p className={`mt-1 text-xs ${diffColor}`}>{diffText}</p>
          </CardContent>
        </Card>

        {comparisons.map((comp, i) => {
          const compHalving = formatHalving(halvingYears(comp.ipc, months));
          const hiddenOnMobile = !showAllMobileComparisons && i >= 2;
          return (
            <Card
              key={comp.label}
              className={`animate-slide-up ${hiddenOnMobile ? "hidden sm:block" : ""}`}
              style={{ animationDelay: `${0.2 + i * 0.05}s` }}
            >
              <CardContent className="pt-6 text-center">
                <p className="mb-1 text-sm font-medium text-muted-foreground">
                  {comp.label}
                </p>
                <p
                  className="text-3xl font-bold tracking-tight"
                  style={{
                    color: COMPARISON_COLORS[i % COMPARISON_COLORS.length],
                  }}
                >
                  {comp.ipc !== 0 && (
                    <span aria-hidden="true">{comp.ipc > 0 ? "↑" : "↓"}</span>
                  )}
                  <span className="sr-only">
                    {comp.ipc > 0 ? "subida" : comp.ipc < 0 ? "bajada" : ""}
                  </span>
                  {comp.ipc >= 0 ? "+" : ""}
                  {comp.ipc.toFixed(2)}%
                </p>
                {compHalving && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    A este ritmo, valdría la mitad en ~{compHalving}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hiddenComparisons > 0 && (
        <div className="mb-4 sm:hidden">
          <button
            type="button"
            onClick={() => setShowAllMobileComparisons((prev) => !prev)}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {showAllMobileComparisons
              ? "Ver menos comparaciones"
              : `Ver ${hiddenComparisons} comparaciones más`}
          </button>
        </div>
      )}

      {!isCustom && (
        <p className="mb-4 text-center text-sm text-primary/80">
          Ajusta tus pesos de gasto para calcular tu IPC personal
        </p>
      )}

      <p className="mb-4 text-center text-sm text-muted-foreground">
        Una cesta de compra de 1.000€ de {formatMonth(startMonth)} hoy costaría{" "}
        <span
          className={`font-semibold ${personalIPC >= 0 ? "text-rose-400" : "text-emerald-400"}`}
        >
          {(1000 * (1 + personalIPC / 100)).toFixed(0)}€
        </span>
      </p>

      {isCustom && (
        <p className="mb-4 text-center text-xs text-muted-foreground">
          Estimación basada en 12 categorías de gasto del INE. Tu inflación real
          depende de los productos específicos que compras.
        </p>
      )}
    </>
  );
}
