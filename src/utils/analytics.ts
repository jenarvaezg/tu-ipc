export type AnalyticsConsent = "granted" | "denied";

const ANALYTICS_CONSENT_KEY = "tu-ipc-analytics-consent";
const GA_MEASUREMENT_ID = "G-MWRWP36LS5";

type GtagParams = Record<string, string | number | boolean>;
type ConsentParams = {
  analytics_storage: "granted" | "denied";
  ad_storage: "denied";
  ad_user_data: "denied";
  ad_personalization: "denied";
};

declare global {
  interface Window {
    gtag?: {
      (command: "event", action: string, params?: GtagParams): void;
      (command: "consent", action: "default" | "update", params: ConsentParams): void;
      (command: "config", targetId: string, params?: GtagParams): void;
    };
  }
}

const DENIED_CONSENT: ConsentParams = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

const GRANTED_CONSENT: ConsentParams = {
  ...DENIED_CONSENT,
  analytics_storage: "granted",
};

function readStoredConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(ANALYTICS_CONSENT_KEY);
    if (value === "granted" || value === "denied") return value;
    return null;
  } catch {
    return null;
  }
}

function writeStoredConsent(consent: AnalyticsConsent): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
  } catch {
    // ignore storage errors
  }
}

function applyConsentToGtag(consent: AnalyticsConsent): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("consent", "update", consent === "granted" ? GRANTED_CONSENT : DENIED_CONSENT);
}

export function getAnalyticsConsent(): AnalyticsConsent | null {
  return readStoredConsent();
}

export function hasAnalyticsConsent(): boolean {
  return readStoredConsent() === "granted";
}

export function initializeAnalyticsConsent(): void {
  const consent = readStoredConsent();
  if (consent) {
    applyConsentToGtag(consent);
  }
}

export function setAnalyticsConsent(consent: AnalyticsConsent): void {
  writeStoredConsent(consent);
  applyConsentToGtag(consent);
  if (consent === "granted" && typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("config", GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: false,
    });
  }
}

export function grantAnalyticsConsent(source?: string): void {
  const alreadyGranted = hasAnalyticsConsent();
  setAnalyticsConsent("granted");
  if (!alreadyGranted && source) {
    trackEvent("analytics_consent_granted", { source });
  }
}

export function trackEvent(name: string, params?: GtagParams): void {
  if (!hasAnalyticsConsent()) return;
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

export function trackPageView(pagePath: string, pageTitle?: string): void {
  trackEvent("page_view", {
    page_path: pagePath,
    page_title: pageTitle ?? (typeof document !== "undefined" ? document.title : ""),
  });
}
