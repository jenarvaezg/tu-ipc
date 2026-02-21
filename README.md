# Tu IPC — Calculadora de inflacion personal

**[tu-ipc.es](https://tu-ipc.es)**

El IPC oficial mide la inflacion del consumidor medio, pero nadie es el consumidor medio. **Tu IPC** calcula cuanto suben *tus* precios segun como gastas realmente.

Ajusta 12 categorias de gasto, compara con el IPC oficial del INE, y descubre si la inflacion te afecta mas o menos que a la media.

## Que hace

- **Quiz personalizado** — 7 preguntas respaldadas por datos del INE/EPF que generan un perfil de consumo adaptado a tu etapa vital, vivienda, transporte y habitos
- **IPC personal vs oficial** — Grafico interactivo mes a mes comparando tu inflacion con la media nacional
- **Desglose por categorias** — Ajusta los pesos de las 12 categorias ECOICOP con sliders y bloqueos
- **Perfiles predefinidos** — Estudiante, jubilado, familia con hijos, urbanita... basados en la Encuesta de Presupuestos Familiares
- **Comparador de salarios** — Calcula si tu sueldo ha seguido el ritmo de tu inflacion personal (ecuacion de Fisher)
- **Ranking por comunidades** — Compara tu IPC personal entre comunidades autonomas
- **Compartir resultados** — Enlace con pesos codificados en la URL o captura de imagen

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · Recharts · shadcn/ui

## Desarrollo

```bash
npm install
npm run dev          # localhost:5173
```

## Otros comandos

```bash
npm run build        # TypeScript check + build de produccion
npm run lint         # TypeScript check sin emitir archivos
npm test             # Vitest
npm run test:watch   # Vitest en modo watch
npm run test:coverage # Vitest con cobertura
npm run test:e2e     # Playwright E2E (build + tests)
npm run download-data  # Descarga datos frescos de la API del INE
npm run download-rubricas-data # Genera dataset de rúbricas (clases ECOICOP) para módulo histórico
npm run spike:rubricas # Spike de cobertura ECOICOP 2002+ (usa -- --input-dir=/tmp para modo offline)
npm run qa:screenshots # Capturas de QA visual con Playwright
```

## Datos

Los datos provienen de la [API del INE](https://www.ine.es/dyngs/DAB/index.htm?cid=1100) (indices ECOICOP, base 2021=100). Como la API no tiene CORS fiable, los datos se descargan con un script Node y se incluyen como JSON estatico en el bundle.

El script maneja la coexistencia de series ECOICOP v1 y v2 seleccionando siempre la serie mas larga (v1, historico completo desde 2009) y encadenando datos de la tabla con base 2025 para extender la serie.

```bash
npm run download-data   # Actualizar tras la publicacion mensual del INE (~dia 12-15)
```

## Deploy

Push a `main` → GitHub Actions ejecuta tests + build → GitHub Pages en [tu-ipc.es](https://tu-ipc.es).

## Roadmap

El plan de implementación para el módulo de rúbricas y acumulado histórico está en `ROADMAP.md`.

## Licencia

MIT
