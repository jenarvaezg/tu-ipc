import { Button } from "@/components/ui/button";
import type { AnalyticsConsent } from "@/utils/analytics";

interface FooterProps {
  onMethodology?: () => void;
  onPrivacy?: () => void;
  analyticsConsent?: AnalyticsConsent | null;
  onEnableAnalytics?: () => void;
  onDisableAnalytics?: () => void;
}

function handleClearData() {
  if (!window.confirm("¿Borrar todas tus preferencias guardadas?")) return;
  const keys = [
    "tu-ipc-weights",
    "tu-ipc-locked",
    "tu-ipc-region",
    "tu-ipc-theme",
    "tu-ipc-color-theme",
    "tu-ipc-salary",
    "tu-ipc-analytics-consent",
  ];
  for (const key of keys) {
    localStorage.removeItem(key);
  }
  window.location.reload();
}

export default function Footer({
  onMethodology,
  onPrivacy,
  analyticsConsent,
  onEnableAnalytics,
  onDisableAnalytics,
}: FooterProps) {
  const analyticsEnabled = analyticsConsent === "granted";
  const canToggleAnalytics = analyticsEnabled
    ? typeof onDisableAnalytics === "function"
    : typeof onEnableAnalytics === "function";

  return (
    <footer className="py-8">
      <div className="mb-6 h-px bg-border" />
      <div className="text-center text-xs text-muted-foreground">
        <p className="mb-1">
          Datos del{" "}
          <a
            href="https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176802&menu=ultiDatos&idp=1254735976607"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-primary transition-colors"
          >
            Instituto Nacional de Estadística (INE)
          </a>{" "}
          · Índices de precios ECOICOP · Base 2021 = 100
        </p>
        <p>
          Esta herramienta es orientativa. El IPC oficial se calcula con
          metodología más compleja.{" "}
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
              {" · "}
              <Button
                variant="link"
                className="p-0 h-auto text-xs text-muted-foreground underline hover:text-primary"
                onClick={onMethodology}
              >
                Metodología
              </Button>
            </>
          )}
          {onPrivacy && (
            <>
              {" · "}
              <Button
                variant="link"
                className="p-0 h-auto text-xs text-muted-foreground underline hover:text-primary"
                onClick={onPrivacy}
              >
                Privacidad
              </Button>
            </>
          )}
        </p>
        <p className="mt-2">
          Hecho por{" "}
          <a
            href="https://github.com/jenarvaezg"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-primary transition-colors"
          >
            jenarvaezg
          </a>
          {" · "}
          <a
            href="https://github.com/jenarvaezg/tu-ipc"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-primary transition-colors"
          >
            Código fuente
          </a>
          {" · "}
          <Button
            variant="link"
            className="p-0 h-auto text-xs text-muted-foreground underline hover:text-primary"
            onClick={handleClearData}
          >
            Borrar mis datos
          </Button>
        </p>
        {canToggleAnalytics && (
          <p className="mt-1">
            Analítica opcional:{" "}
            {analyticsEnabled ? "activada" : "desactivada"}
            {" · "}
            <Button
              variant="link"
              className="p-0 h-auto text-xs text-muted-foreground underline hover:text-primary"
              onClick={analyticsEnabled ? onDisableAnalytics : onEnableAnalytics}
            >
              {analyticsEnabled ? "Desactivar" : "Activar"}
            </Button>
          </p>
        )}
      </div>
    </footer>
  );
}
