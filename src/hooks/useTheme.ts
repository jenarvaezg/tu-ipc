import { useEffect } from "react";
import { isValidThemeId, getThemeColor } from "@/data/themes";

const STORAGE_KEY = "tu-ipc-color-theme";

function getActiveTheme(): string | null {
  const params = new URLSearchParams(window.location.search);
  const urlTheme = params.get("theme");

  // URL is the source of truth: if URL has a theme param, use it (or clear if invalid)
  if (urlTheme !== null) {
    return isValidThemeId(urlTheme) ? urlTheme : null;
  }

  // No theme param in URL: fall back to localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isValidThemeId(saved)) return saved;
  } catch {
    /* ignore */
  }

  return null;
}

function syncThemeToURL(themeId: string | null) {
  const params = new URLSearchParams(window.location.search);
  const currentTheme = params.get("theme");

  if (themeId) {
    if (currentTheme === themeId) return;
    params.set("theme", themeId);
  } else {
    if (currentTheme === null) return;
    params.delete("theme");
  }

  const search = params.toString();
  const url = search
    ? `${window.location.pathname}?${search}`
    : window.location.pathname;
  window.history.replaceState(null, "", url);
}

export function useTheme() {
  useEffect(() => {
    const themeId = getActiveTheme();

    if (themeId) {
      document.documentElement.setAttribute("data-theme", themeId);
      try {
        localStorage.setItem(STORAGE_KEY, themeId);
      } catch {
        /* ignore */
      }
    } else {
      document.documentElement.removeAttribute("data-theme");
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }

    // Always keep URL in sync with active theme
    syncThemeToURL(themeId);

    const isDark = document.documentElement.classList.contains("dark");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", getThemeColor(themeId, isDark));
    }
  }, []);
}
