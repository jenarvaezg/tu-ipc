# Estado actual del producto

Fecha de auditoria: 2026-05-14
Fuente: inspeccion de `src/`, `scripts/`, `e2e/` y artefactos JSON incluidos en el repositorio.

Este documento describe lo que existe hoy en la aplicacion. No es un plan de implementacion ni una especificacion futura.

## Resumen

Tu IPC es una calculadora de inflacion personal para Espana. Permite ajustar la cesta de gasto del usuario, comparar el resultado con el IPC oficial del INE, explorar rubricas ECOICOP de larga serie historica y compartir resultados por URL o imagen.

## Datos disponibles

### IPC por categorias y regiones

Archivo: `src/data/ipc-data.json`

- Ultima generacion registrada: `2026-04-28T10:09:08.033Z`.
- Rango mensual incluido: `2002-01` a `2026-03`.
- Meses incluidos: 291.
- Ambito territorial: Total Nacional + 19 comunidades/ciudades autonomas.
- Categorias: indice general `00` + 12 grupos ECOICOP usados por la calculadora.

El script `scripts/download-ine-data.mjs` descarga datos del INE, mantiene la serie historica ECOICOP v1/base 2021 y encadena meses recientes de la tabla base 2025. En la tabla base 2025, la categoria antigua `12` se reconstruye combinando las nuevas categorias `12` y `13`.

### Rubricas ECOICOP

Archivo: `src/data/ipc-rubricas.json`

- Version de esquema: `1.0`.
- Ultima generacion registrada: `2026-04-28T10:09:29.661Z`.
- Mes base: `2002-01`.
- Rango mensual incluido: `2002-01` a `2026-03`.
- Series incluidas: 1 serie de grupo para `Indice general` + 108 series de clase ECOICOP con dato en el mes base.
- Catalogo incluido: 20 grupos, 71 subgrupos y 188 clases.

El modulo de rubricas usa como nivel operativo las **clases ECOICOP** (`g3=764`). El dataset conserva el catalogo jerarquico para busqueda y contexto, pero solo las clases se seleccionan en la UI.

## Flujos de producto

### Entrada y onboarding

- Landing page con CTA para iniciar un quiz o saltar directamente a la calculadora.
- Quiz de 7 preguntas que genera pesos personalizados a partir de etapa vital, vivienda, transporte, habitos de comida y otros patrones de consumo.
- La entrada al wizard o el salto a la calculadora activa el consentimiento implicito de analitica opcional; el usuario puede desactivarla desde el pie.

### Calculadora principal

- Seleccion de comunidad autonoma y periodo.
- KPIs de IPC personal, IPC oficial y diferencia en puntos porcentuales.
- Cuando los pesos coinciden con los oficiales, el resultado personal se fuerza a coincidir con el IPC oficial para evitar ruido por aproximacion ponderada.
- Resumen narrativo cuando la cesta es personalizada.
- Sugerencia de compartir si la diferencia frente al IPC oficial es relevante.

### Evolucion

- Grafico de evolucion acumulada del IPC personal frente al IPC oficial.
- Modo alternativo de variacion interanual cuando hay datos disponibles.
- Soporte para comparar hasta 4 series adicionales combinando perfiles predefinidos y regiones.
- Anotaciones de eventos historicos en el grafico.

### Rubricas

- Selector de clases ECOICOP con busqueda por codigo, nombre, grupo o subgrupo.
- Seleccion sugerida basada en las categorias con mayor peso del usuario y las rubricas con mayor variacion acumulada.
- Limite de 6 rubricas activas.
- Estado de seleccion persistido en URL mediante `rs`.
- Grafico de inflacion acumulada por rubrica en el periodo seleccionado.
- Benchmark horizontal rojo: IPC general acumulado entre el mes inicial y final visibles.
- Etiquetas al final de lineas en escritorio y resumen de valores finales como chips removibles.
- Modo embed disponible con `?embed=1&t=rubricas`.

### Desglose

- Presets de pesos: oficial INE, pensionista propietario, pensionista inquilino, familia con hijos, joven soltero, autonomo, estudiante, pareja sin hijos, teletrabajador, rural y pareja joven.
- Sliders por las 12 categorias ECOICOP.
- Bloqueo de categorias para mantener pesos fijos.
- Redistribucion proporcional automatica para mantener suma 100.
- Reset a pesos INE o pesos iguales.
- Desglose por categoria con peso, variacion y contribucion en puntos porcentuales.

### Sueldo

- Comparador de sueldo frente a la inflacion personal.
- Soporta 12 pagas, 14 pagas o salario anual.
- Calcula subida nominal, crecimiento real mediante ecuacion de Fisher y cambio mensual de poder adquisitivo.
- Campo opcional de subida pactada en convenio con aviso si el periodo no es anual.

### Regiones

- Ranking de comunidades autonomas segun el IPC personal con la cesta actual.
- La comunidad seleccionada se destaca en el ranking.

### Compartir

- URL compartible con estado de calculadora.
- Codificacion compacta de pesos en `ws`; soporte legado de `w` mantenido para enlaces antiguos.
- Copia de enlace.
- Generacion de imagen PNG desde el grafico o tarjeta de respaldo; en movil usa Web Share API cuando esta disponible.

### Embed

- `?embed=1` renderiza una vista minima sin landing, cabecera, sidebar, tabs ni controles globales.
- `?embed=1&t=evolucion` muestra KPIs + grafico de evolucion.
- `?embed=1&t=rubricas` muestra el explorador de rubricas.
- El embed reutiliza los mismos parametros de URL que la app principal; no hay todavia una guia formal de integracion externa.

### Privacidad, tema y PWA

- Ruta `metodologia` para explicacion metodologica.
- Ruta `privacidad` para politica de privacidad.
- Analitica con Google Analytics condicionada a consentimiento local.
- Modo claro/oscuro persistido.
- Tema de color opcional por parametro `theme`; hoy existe `hesperides`.
- Configuracion PWA en Vite.

## Parametros URL actuales

- `ws`: pesos compactos.
- `w`: pesos legados, soportados solo para compatibilidad.
- `s`: mes inicial.
- `e`: mes final.
- `r`: region principal.
- `t`: pestana activa (`evolucion`, `rubricas`, `desglose`, `sueldo`, `regiones`).
- `rs`: series de rubricas seleccionadas.
- `c`: perfiles comparados.
- `cr`: regiones comparadas.
- `theme`: tema de color.
- `embed=1`: modo embebido.

## Verificacion existente

- Vitest cubre calculo de IPC, pesos, URL state, categorias, componentes principales, rubricas y utilidades de descarga.
- Playwright cubre smoke de calculadora, ausencia de overflow global y flujo basico de rubricas.
- `scripts/qa-playwright-screenshots.mjs` genera capturas de QA para evolucion, rubricas y embed.

## Actualizacion de datos

- Workflow: `.github/workflows/update-data.yml`.
- Frecuencia: dias laborables a las 08:00 y 12:00 UTC.
- Regenera `src/data/ipc-data.json` con indice general, categorias ECOICOP y regiones.
- Regenera `src/data/ipc-rubricas.json` con clases ECOICOP nacionales y referencia de indice general.
- La intencion operativa es commitear solo cuando hay cambios reales en los datos, no por cambios de timestamp de generacion.

## Gaps conocidos

- La web publica `tu-ipc.es` ya esta live; no hay una release pendiente que bloquee el producto actual.
- El smoke E2E de embed de rubricas contiene al menos una expectativa textual que parece anterior al copy actual y debe revisarse antes de tratar E2E como verde.
- Falta regenerar y revisar capturas de QA visual tras los cambios recientes.
- Falta verificacion cruzada manual documentada contra una muestra de datos INE para el calculo acumulado de rubricas.
- El embed ya funciona, pero no hay demanda activa de integracion externa; la guia de integracion queda aparcada hasta que aparezca un tercero interesado.
- El modulo de rubricas documenta la decision de V1, pero todavia no hay soporte UI para series sin base `2002-01` con etiqueta de cobertura reducida.
