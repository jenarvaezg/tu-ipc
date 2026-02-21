# Contrato de datos — Módulo de Rúbricas (V1)

Archivo objetivo: `src/data/ipc-rubricas.json`  
Versión de esquema: `1.0`

## Objetivo

Definir un contrato estable para:

- Renderizar selector jerárquico ECOICOP.
- Calcular inflación acumulada desde `2002-01`.
- Mostrar metadatos de cobertura temporal por serie.

## Estructura JSON

```json
{
  "schemaVersion": "1.0",
  "generatedAt": "2026-02-21T00:00:00.000Z",
  "baseMonth": "2002-01",
  "months": ["2002-01", "2002-02"],
  "series": [],
  "catalog": []
}
```

## `catalog[]` (nodos jerárquicos)

Cada entrada representa una rúbrica disponible:

```json
{
  "id": 304149,
  "variableId": 764,
  "level": "clase",
  "codigo": "0111",
  "nombre": "Pan y cereales",
  "parentIds": [304105]
}
```

Reglas:

- `id` corresponde a `VALORES_VARIABLEOPERACION/{variableId}/IPC`.
- `parentIds` puede tener múltiples valores en transición v1/v2.

## `series[]` (serie temporal utilizable)

```json
{
  "id": "764:304149",
  "ineSeriesCode": "IPC123456",
  "variableId": 764,
  "level": "clase",
  "rubricaId": 304149,
  "parentRubricaId": 304105,
  "codigo": "0111",
  "nombre": "Pan y cereales",
  "firstMonth": "2001-12",
  "lastMonth": "2025-12",
  "hasBaseMonth": true,
  "points": [
    { "month": "2002-01", "value": 82.133 },
    { "month": "2002-02", "value": 82.441 }
  ]
}
```

Reglas:

- `points` ordenado ascendente por mes.
- Mes en formato `YYYY-MM`.
- Valor con precisión original INE (sin redondeo destructivo intermedio).

## Regla de deduplicación de series (obligatoria)

Si múltiples series INE mapean a la misma rúbrica (`rubricaId`/`nombre`):

1. Mantener la serie con más puntos.
2. Empate: mantener la de `lastMonth` más reciente.
3. Registrar trazabilidad en logs de generación.

## Tipos TypeScript asociados

Interfaces base añadidas en `src/data/rubricasTypes.ts`.

## Criterios de validación del artefacto

1. `schemaVersion` definido y compatible.
2. No hay series con `points` vacíos en el dataset final de producción.
3. `firstMonth <= lastMonth` en todas las series.
4. `months` cubre la unión de meses presentes en `series[].points`.
5. Consistencia de relación `rubricaId` ↔ `catalog.id`.

## Generación actual

Script de generación: `scripts/download-ine-rubricas-data.mjs`

Comandos:

```bash
npm run download-rubricas-data
npm run download-rubricas-data -- --input-dir=/tmp
```

Comportamiento por defecto:

- Nivel principal: `g3=764` (clases ECOICOP).
- Incluye referencia `Índice general` desde `g3=762`.
- Modo estricto por defecto: solo series con dato en `2002-01`.
