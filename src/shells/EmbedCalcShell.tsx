import { lazy, Suspense } from "react";
import KPICards from "@/components/KPICards";
import LazyFallback from "@/components/LazyFallback";
import type { IPCResult } from "@/data/types";

const EvolutionChart = lazy(() => import("@/components/EvolutionChart"));

export interface EmbedCalcShellProps {
  result: IPCResult;
  isCustom: boolean;
  startMonth: string;
  endMonth: string;
}

export default function EmbedCalcShell({
  result,
  isCustom,
  startMonth,
  endMonth,
}: EmbedCalcShellProps) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-4">
      <KPICards
        personalIPC={result.personalIPC}
        officialIPC={result.officialIPC}
        difference={result.difference}
        isCustom={isCustom}
        startMonth={startMonth}
        endMonth={endMonth}
      />
      <Suspense fallback={<LazyFallback />}>
        <EvolutionChart data={result.evolution} isCustom={isCustom} />
      </Suspense>
      <p className="text-xs text-muted-foreground text-center mt-2">
        Datos del INE ·{" "}
        <a href="https://tu-ipc.es" className="underline">
          tu-ipc.es
        </a>
      </p>
    </main>
  );
}
