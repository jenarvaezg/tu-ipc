# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Start Vite dev server (localhost:5173)
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build
npm run test         # Run Vitest tests
npm run test:watch   # Run Vitest in watch mode
npm run download-data  # Fetch fresh IPC data from INE API → src/data/ipc-data.json
```

## Testing

Vitest is configured with jsdom environment and globals enabled (`vite.config.ts` → `test`). Tests live next to their source files (`*.test.ts` / `*.test.tsx`). Run with `npm test`.

## Architecture

Personal IPC calculator: users adjust 12 ECOICOP spending category weights to compute their personal inflation vs Spain's official CPI.

**Stack:** Vite + React 19 + TypeScript (strict) + Tailwind CSS + Recharts + shadcn/ui

**Data flow:**
1. `scripts/download-ine-data.mjs` fetches from INE API → writes `src/data/ipc-data.json` (static, bundled)
2. `useIPCCalculator` hook computes weighted variations from the JSON data. Uses category "00" (general index) for official IPC when available.
3. `App.tsx` orchestrates state via extracted hooks (`useWeights`, `useComparisons`) and passes results to presentational components. Heavy components (EvolutionChart, Methodology, SalaryCalculator, RegionRanking) are lazy-loaded.

**Key design decisions:**
- **Static data bundle** — INE API lacks CORS headers, so data is pre-downloaded and shipped as JSON
- **ECOICOP v1 vs v2** — INE publishes overlapping series with incompatible bases. The download script groups series by category and picks the longest (always v1, base 2021=100). Never mix v1/v2 data.
- **Weight system** — Weights are normalized percentages that sum to 100. Moving one slider redistributes the delta proportionally among unlocked categories (see `src/utils/weightRedistribution.ts`). Locked categories hold fixed values.
- **INE timestamps** — Unix milliseconds; must use `getUTCFullYear()`/`getUTCMonth()` to avoid timezone shifts
- **ErrorBoundary** — Global error boundary in `main.tsx` catches render errors and shows a Spanish fallback UI
- **Lazy loading** — EvolutionChart, Methodology, SalaryCalculator, RegionRanking use `React.lazy()` with `<Suspense>` for code splitting
- **Embed mode** — `?embed=1` URL param renders a minimal view with only KPIs and chart (no header, tabs, or controls)
- **General index** — Category code "00" is the INE general index, used for official IPC when available (more accurate than weighted sum of 12 categories)

**File layout:**
- `src/App.tsx` — State orchestration hub (delegates to useWeights/useComparisons hooks, lazy loads heavy components)
- `src/hooks/useIPCCalculator.ts` — Pure memoized calculation (variation per category, weighted sum, YoY computation via `computeYoY`)
- `src/hooks/useWeights.ts` — Weight state management (localStorage persistence, debounced saves, redistribution)
- `src/hooks/useComparisons.ts` — Comparison state management (profile & region comparisons)
- `src/hooks/useSalaryComparison.ts` — Salary vs inflation comparison (Fisher equation for real growth)
- `src/utils/weightRedistribution.ts` — Pure function for proportional weight redistribution
- `src/utils/debounce.ts` — Generic debounce utility with cancel()
- `src/utils/formatMonth.ts` — Format "2024-01" → "enero 2024"
- `src/data/categories.ts` — 12 ECOICOP categories with official weights and keyword matchers
- `src/data/constants.ts` — Shared constants (COMPARISON_COLORS)
- `src/data/presets.ts` — Weight presets (oficial, 6 lifestyle profiles)
- `src/data/historicalEvents.ts` — Historical events for chart annotations (COVID, Ukraine, etc.)
- `src/data/types.ts` — TypeScript interfaces (IPCData, IPCResult, CategoryVariation)
- `src/components/` — Presentational components (all use shadcn/ui primitives from `ui/`)
- `src/components/OnboardingQuiz.tsx` — 5-question onboarding wizard to generate personalized weights
- `src/components/RegionRanking.tsx` — Region ranking by personal IPC (lazy loaded)
- `src/components/NarrativeSummary.tsx` — Generated text summary of personal inflation
- `src/components/ShareSuggestion.tsx` — Dismissable share prompt when difference > 1.5pp
- `src/components/CopyLinkButton.tsx` — Copy current URL to clipboard
- `src/components/ErrorBoundary.tsx` — Global React error boundary
- `scripts/download-ine-data.mjs` — INE API download with v1/v2 deduplication

**Path aliases:** `@` → `./src` (configured in both `tsconfig.json` and `vite.config.ts`)

## Deployment

Deployed to GitHub Pages via `.github/workflows/deploy.yml`. CI sets `BASE_URL=/tu-ipc/` for asset paths. Do not modify `deploy.yml` or `vite.config.ts` base path logic.

## Conventions

- **Tailwind classes must be literal strings** — never use string interpolation like `` `grid-cols-${n}` ``. Use a lookup map of literal class strings instead, so Tailwind can purge correctly.
- **Shared constants** — Colors and theme tokens shared across components go in `src/data/constants.ts`.
- **Accessibility** — Interactive controls must have `aria-label`. Form inputs must have associated `<label htmlFor>`. Tab panels use `role="tabpanel"` with `aria-labelledby`.
- **Icons** — Use `lucide-react` (already in dependencies) instead of inline SVGs.

## INE Data Notes

- API base: `https://servicios.ine.es/wstempus/js/ES`
- **Two tables, chain-linked:** Table 50913 (base 2021, ECOICOP v1, Dec 2009–Nov 2025) is the primary source. Table 76136 (base 2025, ECOICOP v2, Dec 2024 onwards) extends the series via chain-linking using the last overlap month as conversion factor: `linked_value = new_value * (old_value / new_value)` at overlap month.
- **ECOICOP v2 category 12 split:** New table splits old "Otros bienes y servicios" into "Seguros y servicios financieros" (12a) + "Cuidado personal..." (12b). The download script combines them using weighted average (3.7% + 4.0%) before chain-linking.
- Vestido y calzado shows ~13-15% drops every December — this is real (winter sales), not a bug
- When updating the download script, always verify no v2 series (IDs 418050-418061) overwrite v1 data in the old table

## UI Language

All user-facing text is in Spanish.
