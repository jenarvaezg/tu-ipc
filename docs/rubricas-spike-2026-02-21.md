# Spike INE — Cobertura histórica por nivel ECOICOP

Fecha de ejecución: 2026-02-21  
Script: `scripts/spike-ine-rubricas.mjs`  
Salida completa: `scripts/outputs/ine-rubricas-spike.json`

## Parámetros usados

- Operación: `IPC`
- Ámbito: `Total Nacional` (`g1=349:16473`)
- Tipo: `Índice` (`g2=3:83`)
- Periodicidad: mensual (`p=1`)
- Rango: `20020101:20271231`
- Mes base para cobertura: `2002-01`
- Niveles analizados: `g3=762`, `763`, `764`, `765`

## Resultado resumido

| Nivel | Catálogo | Series con datos | Series con base 2002 | Cobertura base |
|---|---:|---:|---:|---:|
| 762 (Grupos) | 20 | 20 | 20 | 100.0% |
| 763 (Subgrupos) | 71 | 70 | 57 | 81.4% |
| 764 (Clases) | 188 | 178 | 113 | 63.5% |
| 765 (Subclases, dedupe) | 453 | 381 | 100 | 26.2% |

## Lectura de resultados

- `g3=765` ofrece máxima granularidad, pero cobertura histórica insuficiente para base 2002 en V1.
- `g3=764` mantiene un buen equilibrio entre detalle y trazabilidad histórica.
- `g3=763` tiene mayor cobertura, pero menor resolución analítica.

## Decisión para V1

Se adopta **`g3=764` (Clases ECOICOP)** como nivel objetivo inicial.

Motivo:

- Es el mayor nivel de desagregación con cobertura histórica razonable para visualización acumulada desde 2002.

## Notas técnicas

- Se observan series que arrancan en `2006-12` y `2016-12` en niveles finos.
- Hay coexistencia de series asociada a cambios metodológicos/base, por eso el script aplica deduplicación para métricas comparables.
