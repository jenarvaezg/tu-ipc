import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/utils/analytics";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mobileSticky?: boolean;
  showDesgloseBadge?: boolean;
}

const TABS = [
  { id: "evolucion", label: "Evolución" },
  { id: "rubricas", label: "Rúbricas" },
  { id: "desglose", label: "Desglose" },
  { id: "sueldo", label: "Tu Sueldo" },
  { id: "regiones", label: "Regiones" },
];

export default function TabNavigation({
  activeTab,
  onTabChange,
  mobileSticky = false,
  showDesgloseBadge = false,
}: TabNavigationProps) {
  const mobileGridClass =
    TABS.length === 5 ? "grid grid-cols-5 gap-2" : "grid grid-cols-4 gap-2";

  const renderTabs = (mobile: boolean) => (
    <div
      className={cn(
        "flex gap-2",
        mobile ? mobileGridClass : "flex-wrap justify-start",
      )}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Button
            key={`${mobile ? "mobile" : "desktop"}-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            variant={isActive ? "default" : "secondary"}
            size="sm"
            onClick={() => {
              trackEvent("tab_change", { tab: tab.id });
              onTabChange(tab.id);
            }}
            className={cn(
              "relative",
              mobile ? "w-full px-2" : "",
              !isActive
                ? "hover:bg-primary/10 hover:text-primary transition-colors"
                : "",
            )}
          >
            <span className="truncate">{tab.label}</span>
            {showDesgloseBadge && tab.id === "desglose" && (
              <>
                <span className="ml-1 hidden md:inline-flex rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                  Personalizar
                </span>
                <span
                  className="ml-1 inline-flex h-2 w-2 rounded-full bg-primary md:hidden"
                  aria-hidden="true"
                />
                <span className="sr-only">Personalizar pesos disponible</span>
              </>
            )}
          </Button>
        );
      })}
    </div>
  );

  if (mobileSticky) {
    return (
      <>
        <div
          className="mb-4 hidden lg:block"
          role="tablist"
          aria-label="Secciones de la calculadora"
        >
          {renderTabs(false)}
        </div>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 lg:hidden">
          <div
            className="mx-auto max-w-4xl px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2"
            role="tablist"
            aria-label="Secciones de la calculadora"
          >
            {renderTabs(true)}
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className="mb-4"
      role="tablist"
      aria-label="Secciones de la calculadora"
    >
      {renderTabs(false)}
    </div>
  );
}
