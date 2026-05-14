import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  lazy,
  Suspense,
} from "react";
import ipcDataRaw from "@/data/ipc-data.json";
import type { IPCData } from "@/data/types";
import { Card, CardContent } from "@/components/ui/card";
import { parseURLState } from "@/hooks/useURLState";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useTheme } from "@/hooks/useTheme";
import { useShellNavigation } from "@/router/shellRouter";
import { useCalculadora } from "@/calculadora/useCalculadora";
import {
  getAnalyticsConsent,
  grantAnalyticsConsent,
  initializeAnalyticsConsent,
  setAnalyticsConsent as persistAnalyticsConsent,
  trackEvent,
  trackPageView,
  type AnalyticsConsent,
} from "@/utils/analytics";
import Header from "@/components/Header";
import KPICards from "@/components/KPICards";
import TabNavigation from "@/components/TabNavigation";
import WeightSliders from "@/components/WeightSliders";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import PresetSelector from "@/components/PresetSelector";
import ShareButton from "@/components/ShareButton";
import CopyLinkButton from "@/components/CopyLinkButton";
import NarrativeSummary from "@/components/NarrativeSummary";
import ShareSuggestion from "@/components/ShareSuggestion";
import Footer from "@/components/Footer";
import FilterSidebar from "@/components/FilterSidebar";
import LandingPage from "@/components/LandingPage";
import LazyFallback from "@/components/LazyFallback";
import EmbedRubricasShell from "@/shells/EmbedRubricasShell";
import EmbedCalcShell from "@/shells/EmbedCalcShell";

const EvolutionChart = lazy(() => import("@/components/EvolutionChart"));
const RubricasExplorer = lazy(() => import("@/components/RubricasExplorer"));
const Methodology = lazy(() => import("@/components/Methodology"));
const SalaryCalculator = lazy(() => import("@/components/SalaryCalculator"));
const RegionRanking = lazy(() => import("@/components/RegionRanking"));
const PrivacyPolicy = lazy(() => import("@/components/PrivacyPolicy"));

const ipcData = ipcDataRaw as IPCData;

const BASE = import.meta.env.BASE_URL; // configurable via BASE_URL, '/' by default

export default function App() {
  useTheme();

  // URL params take priority over localStorage
  const urlState = useMemo(() => parseURLState(), []);

  const {
    shell,
    navigateToCalculator,
    navigateToMethodology: routerNavigateToMethodology,
    navigateToPrivacy: routerNavigateToPrivacy,
    goBack,
  } = useShellNavigation(BASE);

  const [analyticsConsent, setAnalyticsConsentStatus] =
    useState<AnalyticsConsent | null>(() => getAnalyticsConsent());

  const months = ipcData.months;

  const syncableShell =
    shell.kind === "calculadora" ||
    shell.kind === "embed-calc" ||
    shell.kind === "embed-rubricas";

  const {
    weights,
    locked,
    isCustom,
    handleWeightChange,
    handleToggleLock,
    handleReset,
    handlePresetSelect,
    region,
    setRegion,
    startMonth,
    setStartMonth,
    endMonth,
    setEndMonth,
    activeTab,
    setActiveTab,
    comparisonIds,
    comparisonRegions,
    allComparisons,
    handleToggleComparison,
    handleClearComparisons,
    handleToggleRegionComparison,
    handleClearRegionComparisons,
    result,
    yoyEvolution,
    categoryVariations,
    topWeightDifferences,
  } = useCalculadora({ ipcData, urlState, syncEnabled: syncableShell });

  const chartRef = useRef<HTMLDivElement>(null);
  const lastTrackedPageRef = useRef("");

  useEffect(() => {
    initializeAnalyticsConsent();
    setAnalyticsConsentStatus(getAnalyticsConsent());
  }, []);

  const handleGrantAnalyticsConsent = useCallback((source: string) => {
    grantAnalyticsConsent(source);
    setAnalyticsConsentStatus("granted");
  }, []);

  const handleDisableAnalyticsConsent = useCallback(() => {
    trackEvent("analytics_consent_revoked");
    persistAnalyticsConsent("denied");
    setAnalyticsConsentStatus("denied");
  }, []);

  const handleEnableAnalyticsFromFooter = useCallback(() => {
    handleGrantAnalyticsConsent("footer_enable");
  }, [handleGrantAnalyticsConsent]);

  const handleRegionChange = useCallback(
    (code: string) => {
      trackEvent("region_change", { region: code });
      setRegion(code);
    },
    [setRegion],
  );

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLandingStart = useCallback(
    (quizWeights?: Record<string, number>) => {
      if (quizWeights) {
        handlePresetSelect(quizWeights);
      }
      navigateToCalculator();
    },
    [handlePresetSelect, navigateToCalculator],
  );

  const navigateToMethodology = useCallback(() => {
    trackEvent("methodology_view");
    routerNavigateToMethodology();
  }, [routerNavigateToMethodology]);

  const navigateToPrivacy = useCallback(() => {
    trackEvent("privacy_view");
    routerNavigateToPrivacy();
  }, [routerNavigateToPrivacy]);

  useDocumentMeta(
    shell.kind === "methodology"
      ? "Metodología — Tu IPC Personal"
      : shell.kind === "privacy"
        ? "Privacidad — Tu IPC Personal"
        : "Tu IPC Personal — Estima tu inflación en España",
    shell.kind === "methodology"
      ? "Cómo se calcula tu inflación personal: fuente de datos del INE, categorías ECOICOP, encadenamiento de bases y fórmulas."
      : shell.kind === "privacy"
        ? "Política de privacidad de Tu IPC Personal: analítica opcional con consentimiento, datos locales y control del usuario."
        : "¿Cuál es mi IPC? Calcula tu inflación personal ajustando tus gastos reales y compara con el IPC oficial del INE. Datos actualizados por comunidad autónoma.",
  );

  useEffect(() => {
    let pagePath = "/landing";
    switch (shell.kind) {
      case "embed-rubricas":
        pagePath = "/embed/rubricas";
        break;
      case "embed-calc":
        pagePath = "/embed/calculadora";
        break;
      case "methodology":
        pagePath = "/metodologia";
        break;
      case "privacy":
        pagePath = "/privacidad";
        break;
      case "calculadora":
        pagePath = `/calculadora/${activeTab}`;
        break;
      case "landing":
        pagePath = "/landing";
        break;
    }

    if (lastTrackedPageRef.current === pagePath) return;
    lastTrackedPageRef.current = pagePath;
    trackPageView(pagePath);
  }, [shell, activeTab]);

  if (shell.kind === "embed-rubricas") {
    return (
      <EmbedRubricasShell
        startMonth={startMonth}
        endMonth={endMonth}
        userWeights={weights}
      />
    );
  }

  if (shell.kind === "embed-calc") {
    return (
      <EmbedCalcShell
        result={result}
        isCustom={isCustom}
        startMonth={startMonth}
        endMonth={endMonth}
      />
    );
  }

  if (shell.kind === "methodology") {
    return (
      <main>
        <Suspense fallback={<LazyFallback />}>
          <Methodology onBack={goBack} />
        </Suspense>
      </main>
    );
  }

  if (shell.kind === "privacy") {
    return (
      <main>
        <Suspense fallback={<LazyFallback />}>
          <PrivacyPolicy onBack={goBack} />
        </Suspense>
      </main>
    );
  }

  if (shell.kind === "landing") {
    return (
      <main>
        <LandingPage
          onStart={handleLandingStart}
          onImplicitAnalyticsConsent={handleGrantAnalyticsConsent}
        />
      </main>
    );
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar — desktop: visible, mobile: Sheet */}
      <FilterSidebar
        region={region}
        onRegionChange={handleRegionChange}
        months={months}
        startMonth={startMonth}
        endMonth={endMonth}
        onStartChange={setStartMonth}
        onEndChange={setEndMonth}
        comparisonIds={comparisonIds}
        onToggleComparison={handleToggleComparison}
        onClearComparisons={handleClearComparisons}
        currentRegion={region}
        comparisonRegions={comparisonRegions}
        onToggleRegionComparison={handleToggleRegionComparison}
        onClearRegionComparisons={handleClearRegionComparisons}
        maxRegionComparisons={Math.max(0, 4 - comparisonIds.length)}
        mobileOpen={mobileFiltersOpen}
        onMobileOpenChange={setMobileFiltersOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-screen-xl px-4 pb-24 pt-6 lg:py-8 lg:pb-8">
          <Header
            lastUpdated={ipcData.lastUpdated}
            dataMonth={ipcData.months[ipcData.months.length - 1]}
            onMethodology={navigateToMethodology}
            onOpenFilters={() => setMobileFiltersOpen(true)}
            actions={
              <div className="flex items-center gap-1">
                <CopyLinkButton />
                <ShareButton
                  personalIPC={result.personalIPC}
                  officialIPC={result.officialIPC}
                  difference={result.difference}
                  startMonth={startMonth}
                  endMonth={endMonth}
                  region={region}
                  isCustom={isCustom}
                  chartRef={chartRef}
                />
              </div>
            }
          />
          <KPICards
            personalIPC={result.personalIPC}
            officialIPC={result.officialIPC}
            difference={result.difference}
            comparisons={allComparisons.map((c) => ({
              label: c.label,
              ipc: c.result.personalIPC,
            }))}
            isCustom={isCustom}
            startMonth={startMonth}
            endMonth={endMonth}
          />
          {isCustom && (
            <NarrativeSummary
              breakdown={result.breakdown}
              personalIPC={result.personalIPC}
              difference={result.difference}
              startMonth={startMonth}
              endMonth={endMonth}
            />
          )}
          <ShareSuggestion
            difference={result.difference}
            isCustom={isCustom}
            personalIPC={result.personalIPC}
          />
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            mobileSticky
            showDesgloseBadge
          />
          {activeTab === "evolucion" && (
            <div role="tabpanel" id="evolucion-panel">
              <Suspense fallback={<LazyFallback />}>
                <EvolutionChart
                  ref={chartRef}
                  data={result.evolution}
                  yoyData={yoyEvolution}
                  comparisons={allComparisons.map((c) => ({
                    label: c.label,
                    data: c.result.evolution,
                    yoyData: c.yoyEvolution,
                  }))}
                  isCustom={isCustom}
                />
              </Suspense>
            </div>
          )}
          {activeTab === "rubricas" && (
            <div role="tabpanel" id="rubricas-panel">
              <Suspense fallback={<LazyFallback />}>
                <RubricasExplorer
                  startMonth={startMonth}
                  endMonth={endMonth}
                  userWeights={weights}
                />
              </Suspense>
            </div>
          )}
          {activeTab === "desglose" && (
            <div role="tabpanel" id="desglose-panel">
              <Card className="mb-4 border-primary/30 bg-primary/5">
                <CardContent className="py-4">
                  <p className="text-sm font-medium text-foreground">
                    Principales diferencias de tu cesta frente al INE
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ajusta tus pesos para adaptar el cálculo a tu realidad.
                  </p>
                  {isCustom ? (
                    topWeightDifferences.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {topWeightDifferences.map((item) => (
                          <span
                            key={item.code}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground"
                          >
                            <span>{item.icon}</span>
                            <span className="max-w-[10rem] truncate">
                              {item.name}
                            </span>
                            <span
                              className={
                                item.diff >= 0
                                  ? "text-red-400"
                                  : "text-emerald-400"
                              }
                            >
                              {item.diff >= 0 ? "+" : ""}
                              {item.diff.toFixed(1)} pp
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Ya estás casi en la media oficial. Ajusta sliders para
                        afinar aún más.
                      </p>
                    )
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Aún usas los pesos oficiales del INE. Elige un preset o
                      mueve sliders para ver tus diferencias.
                    </p>
                  )}
                </CardContent>
              </Card>
              <PresetSelector weights={weights} onSelect={handlePresetSelect} />
              <WeightSliders
                weights={weights}
                locked={locked}
                onChange={handleWeightChange}
                onToggleLock={handleToggleLock}
                onReset={handleReset}
                categoryVariations={categoryVariations}
              />
              <CategoryBreakdown breakdown={result.breakdown} />
            </div>
          )}
          {activeTab === "sueldo" && (
            <div role="tabpanel" id="sueldo-panel">
              <Suspense fallback={<LazyFallback />}>
                <SalaryCalculator
                  personalIPC={result.personalIPC}
                  startMonth={startMonth}
                  endMonth={endMonth}
                />
              </Suspense>
            </div>
          )}
          {activeTab === "regiones" && (
            <div role="tabpanel" id="regiones-panel">
              <Suspense fallback={<LazyFallback />}>
                <RegionRanking
                  ipcData={ipcData}
                  weights={weights}
                  startMonth={startMonth}
                  endMonth={endMonth}
                  currentRegion={region}
                />
              </Suspense>
            </div>
          )}
          <Footer
            onMethodology={navigateToMethodology}
            onPrivacy={navigateToPrivacy}
            analyticsConsent={analyticsConsent}
            onEnableAnalytics={handleEnableAnalyticsFromFooter}
            onDisableAnalytics={handleDisableAnalyticsConsent}
          />
        </div>
      </main>
    </div>
  );
}
