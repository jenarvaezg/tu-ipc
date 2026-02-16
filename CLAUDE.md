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
2. `useIPCCalculator` hook computes weighted variations from the JSON data
3. `App.tsx` owns all state (weights, locked set, period) and passes results to presentational components

**Key design decisions:**
- **Static data bundle** — INE API lacks CORS headers, so data is pre-downloaded and shipped as JSON
- **ECOICOP v1 vs v2** — INE publishes overlapping series with incompatible bases. The download script groups series by category and picks the longest (always v1, base 2021=100). Never mix v1/v2 data.
- **Weight system** — Weights are normalized percentages that sum to 100. Moving one slider redistributes the delta proportionally among unlocked categories. Locked categories hold fixed values.
- **INE timestamps** — Unix milliseconds; must use `getUTCFullYear()`/`getUTCMonth()` to avoid timezone shifts
- **ErrorBoundary** — Global error boundary in `main.tsx` catches render errors and shows a Spanish fallback UI

**File layout:**
- `src/App.tsx` — State management hub (weights, locks, period, page routing)
- `src/hooks/useIPCCalculator.ts` — Pure memoized calculation (variation per category, weighted sum)
- `src/data/categories.ts` — 12 ECOICOP categories with official weights and keyword matchers
- `src/data/constants.ts` — Shared constants (COMPARISON_COLORS)
- `src/data/types.ts` — TypeScript interfaces (IPCData, IPCResult, CategoryVariation)
- `src/components/` — Presentational components (all use shadcn/ui primitives from `ui/`)
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
- Data endpoint uses `date=20100101:20261231` for full historical range (193 months)
- Vestido y calzado shows ~13-15% drops every December — this is real (winter sales), not a bug
- When updating the download script, always verify no v2 series (IDs 418050-418061) overwrite v1 data

## UI Language

All user-facing text is in Spanish.
