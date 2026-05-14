# ROADMAP — Estado actual y próximos pasos

Estado: Vivo
Última revisión: 2026-05-14

Este roadmap sustituye el plan por fases de febrero de 2026. El inventario detallado de lo que existe hoy está en `docs/estado-actual.md`.

## 1. Producto actual

La aplicación ya incluye:

- Calculadora de IPC personal por comunidad autónoma y periodo.
- Landing + quiz de onboarding para generar pesos personalizados.
- Comparación frente al IPC oficial del INE.
- Comparaciones contra perfiles predefinidos y regiones.
- Pestañas de evolución, rúbricas, desglose, sueldo y regiones.
- Módulo de rúbricas ECOICOP integrado en la app principal y en modo embed.
- Compartir por URL e imagen.
- Rutas de metodología y privacidad.
- Analítica opcional, modo claro/oscuro y tema opcional.

## 2. Decisiones vigentes

- **Datos estáticos en bundle**: la app consume JSON generado por scripts porque la API del INE no es fiable para CORS en navegador.
- **IPC principal encadenado**: `scripts/download-ine-data.mjs` usa la tabla histórica base 2021 y encadena meses recientes de la tabla base 2025.
- **Rúbricas V1 en clases ECOICOP**: el explorador usa `g3=764` como nivel seleccionable.
- **Rúbricas con base 2002 estricta**: por defecto solo entran series con dato en `2002-01`.
- **Benchmark de rúbricas**: la referencia visual actual es una línea horizontal con el IPC general acumulado del periodo visible.
- **Límite de 6 rúbricas**: se mantiene por legibilidad y rendimiento móvil.
- **URL como estado compartible**: la calculadora usa parámetros compactos (`ws`, `s`, `e`, `r`, `t`, `rs`, `c`, `cr`, `theme`, `embed=1`).
- **Carga diferida**: los módulos pesados se cargan con `React.lazy`.
- **Frescura de datos sobre PWA**: la web no optimiza instalación/offline; se retira la PWA activa para evitar caches que puedan mostrar meses antiguos.

## 3. Próximos pasos prioritarios

### P0 — Estabilizar actualización de datos

- [x] Confirmar que el workflow actualiza tanto el dataset principal como el dataset de rúbricas.
- [x] Evitar commits cuando solo cambian `lastUpdated` o `generatedAt`.
- [x] Reescribir historial para agrupar commits automáticos antiguos.
- [x] Retirar la PWA activa y limpiar service workers heredados para priorizar frescura de datos.
- [ ] Confirmar en GitHub Actions que la próxima ejecución programada no genera commit sin cambio real de datos.

### P1 — Verificación de mantenimiento

- [ ] Ejecutar `npm run test:e2e` completo en desktop y mobile antes del próximo cambio funcional.
- [ ] Revisar y corregir el smoke E2E de embed de rúbricas si conserva copy antiguo.
- [ ] Ejecutar `npm run qa:screenshots` antes del próximo ajuste visual relevante.
- [ ] Validar visualmente:
  - `/?t=evolucion`
  - `/?t=rubricas`
  - `/?embed=1&t=rubricas`
  - móvil y desktop
- [ ] Documentar una verificación cruzada manual contra muestra INE para rúbricas acumuladas.

### P1 — Presupuesto de rendimiento

- [ ] Medir peso real de los JSON y chunks principales.
- [ ] Registrar umbrales aceptables para primera carga y cambio de pestaña.
- [ ] Decidir si `ipc-rubricas.json` debe partirse o mantenerse como carga diferida única.

### P1 — Rubricas V1.1

- [ ] Decidir si se exponen series sin base `2002-01`.
- [ ] Si se exponen, añadir etiqueta de cobertura reducida y reglas claras de comparabilidad.
- [ ] Evaluar si el IPC general debe poder mostrarse también como serie temporal opcional además del benchmark horizontal.

### P2 — Exportación y reutilización

- [ ] Crear guía de integración embed si aparece un tercero interesado.
- [ ] Documentar parámetros soportados actualmente.
- [ ] Aclarar que el embed usa `s`/`e` para rango temporal, no `from`/`to`.
- [ ] Definir si hace falta `lang`; hoy toda la UI está en español.
- [ ] Exportación CSV simple del gráfico de rúbricas.
- [ ] Exportación de imagen específica para rúbricas.
- [ ] Presets o URLs preconfiguradas para integraciones editoriales.

## 4. Documentos relacionados

- `docs/estado-actual.md`: inventario actual del producto.
- `docs/rubricas-fase0-metodologia.md`: decisiones metodológicas cerradas para rúbricas V1.
- `docs/rubricas-data-contract.md`: contrato del dataset de rúbricas.
- `docs/rubricas-spike-2026-02-21.md`: análisis de cobertura histórica por nivel ECOICOP.
- `docs/rubricas-referencia-visual-santiago.md`: referencia visual usada para el gráfico de rúbricas.
- `docs/adr/0001-retirar-pwa-para-priorizar-frescura.md`: decisión de retirar PWA activa para priorizar frescura de datos.
