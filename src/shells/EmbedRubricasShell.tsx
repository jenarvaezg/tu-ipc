import { lazy, Suspense } from "react";
import LazyFallback from "@/components/LazyFallback";

const RubricasExplorer = lazy(() => import("@/components/RubricasExplorer"));

export interface EmbedRubricasShellProps {
  startMonth: string;
  endMonth: string;
  userWeights: Record<string, number>;
}

export default function EmbedRubricasShell({
  startMonth,
  endMonth,
  userWeights,
}: EmbedRubricasShellProps) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-4">
      <Suspense fallback={<LazyFallback />}>
        <RubricasExplorer
          startMonth={startMonth}
          endMonth={endMonth}
          userWeights={userWeights}
        />
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
