# ROADMAP — Rúbricas INE + Inflación Acumulada (2002+)

Estado: Activo  
Última actualización: 2026-02-21

## 1. Objetivo

Construir un módulo interactivo que permita:

- Seleccionar productos/rúbricas al máximo nivel de desagregación disponible en INE.
- Ver la inflación acumulada desde `2002-01` hasta el último dato disponible.
- Añadir una referencia del IPC general para comparación.
- Integrar el módulo en la web del Centro (embebible y estable).

## 2. Alcance de V1

- Selector de rúbricas (búsqueda + jerarquía).
- Gráfico temporal interactivo (multi-serie).
- Cálculo de inflación acumulada robusto y testeado.
- URL compartible con estado de selección.
- Modo `embed` listo para integración externa.

Fuera de alcance en V1:

- Exportación avanzada (PDF/CSV complejo con branding).
- Comparación internacional.
- Segmentaciones demográficas avanzadas.

## 3. Decisiones Bloqueantes (Fase 0)

Antes de desarrollar, cerrar estas 3 decisiones:

- Definir métrica exacta de la línea de referencia del IPC general.
- Confirmar nivel máximo de desagregación que usaremos en UI (rúbrica/subrúbrica/artículo, según cobertura real de INE).
- Confirmar máximo de series simultáneas en gráfico (recomendado: 6).

Recomendación técnica para coherencia estadística:

- Gráfico principal: inflación acumulada por serie, base `2002-01 = 0%`.
- Referencia IPC general: serie acumulada del IPC general en el mismo eje.
- Si se exige línea horizontal, usar una métrica explícita separada (p. ej. promedio anualizado) y etiquetarla como referencia, no como acumulado.

## 4. Plan por Fases (orden de ejecución)

### Fase 0 — Cierre metodológico (1-2 días)

- [x] Documento corto de definición estadística (fórmulas y etiquetas finales).
- [x] Decisión final de referencia IPC general.
- [x] Mock rápido del comportamiento UI para validar con stakeholders.

Criterio de aceptación:

- Definición aprobada por negocio/autor (sin ambigüedades de interpretación).

### Fase 1 — Datos INE al máximo desglose (4-6 días)

- [x] Extender script de datos para obtener series de mayor desagregación (`scripts/download-ine-rubricas-data.mjs`).
- [x] Incorporar metadatos por serie: `id`, `nombre`, `nivel`, `parentId`, `firstMonth`, `lastMonth`, `coverage`.
- [ ] Mantener compatibilidad con empalme de bases/metodologías.
- [x] Validar cobertura desde 2002 y registrar huecos.
- [x] Generar artefacto estático optimizado para frontend (`src/data/ipc-rubricas.json`).

Criterio de aceptación:

- Dataset reproducible por script, con cobertura documentada y sin mezcla metodológica incorrecta.

### Fase 2 — Motor de cálculo y validación (2-3 días)

- [x] Crear utilidades puras para inflación acumulada desde fecha base.
- [x] Manejo de series incompletas (arranque tardío, meses faltantes).
- [x] Añadir tests unitarios de fórmulas y casos borde.
- [ ] Verificación cruzada con muestra manual INE.

Criterio de aceptación:

- Cálculos deterministas, testeados y trazables a datos fuente.

### Fase 3 — UX de selección de rúbricas (3-4 días)

- [x] Nuevo selector jerárquico con búsqueda textual.
- [x] Límite de selección simultánea y feedback de validación.
- [x] Estado persistente en URL.
- [x] Accesibilidad completa (teclado, etiquetas, roles).

Criterio de aceptación:

- Selección rápida incluso con catálogo grande y sin degradar accesibilidad.

### Fase 4 — Gráfico interactivo (3-4 días)

- [x] Componente de gráfico lazy-loaded.
- [x] Render multi-serie + referencia IPC general (línea horizontal benchmark).
- [x] Tooltip claro (valor, base, mes, acumulado).
- [x] Zoom/rango temporal y reset.
- [x] Etiquetado directo al final de líneas + leyenda robusta para móvil/desktop.

Criterio de aceptación:

- Interacción fluida en móvil/desktop con datos reales y leyenda comprensible.

### Fase 5 — Integración embed para web del Centro (1-2 días)

- [ ] Ruta/vista específica para `embed`.
- [ ] Parámetros por URL (`series`, `from`, `to`, `lang`, etc.).
- [ ] Layout minimal y estable para iframe.
- [ ] Guía de integración para terceros.

Criterio de aceptación:

- Embed funcional en entorno externo sin romper navegación principal.

### Fase 6 — QA, rendimiento y release (2-3 días)

- [ ] Performance budget (peso de dataset, tiempo de render, interacciones).
- [ ] Tests de integración y smoke E2E del flujo principal.
- [ ] Revisión de copy y metodología en español.
- [ ] Checklist final de release.

Criterio de aceptación:

- Build de producción estable, métricas dentro de umbral y documentación actualizada.

## 5. Riesgos y mitigaciones

- Riesgo: incoherencia estadística entre acumulado y referencia horizontal.
  - Mitigación: cerrar definición en Fase 0 y reflejarla en labels.
- Riesgo: explosión de volumen de datos al máximo desglose.
  - Mitigación: particionado/lazy load y límite de series activas.
- Riesgo: series con cobertura desigual desde 2002.
  - Mitigación: mostrar cobertura por serie y controlar comparabilidad.

## 6. Entregables

- `scripts/download-ine-data.mjs` ampliado y documentado.
- Nuevo dataset y metadatos de rúbricas.
- Nuevo módulo UI de selección + gráfico.
- Tests unitarios/integración para cálculos y flujo principal.
- Documentación de metodología e integración `embed`.

## 7. Estado actual y pausa

Bloque principal de rúbricas implementado:

- Dataset de rúbricas + script de descarga.
- Selector interactivo + benchmark IPC general.
- Integración en pestaña principal y modo `embed`.
- Test unitarios de cálculo y test de componente.
- Suite Playwright base (smoke + rubricas) y script de capturas.

## 8. Pendientes inmediatos (dejados en pausa)

- [ ] Ejecutar `npm run test:e2e` completo (desktop + mobile) y dejar evidencia de ejecución final.
- [ ] Re-generar `npm run qa:screenshots` y validar visualmente ausencia de clipping en:
  - `/?t=rubricas`
  - `/?embed=1&t=rubricas`
  - móvil y desktop
- [ ] Cerrar verificación cruzada manual INE (muestra de rúbricas vs cálculo acumulado) y documentarla.
- [ ] Completar guía de integración embed para web externa (parámetros soportados y snippet iframe).
