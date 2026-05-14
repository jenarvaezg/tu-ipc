# Tu IPC

Tu IPC es una calculadora de inflacion personal para Espana que compara la cesta de gasto del usuario con el IPC oficial del INE.

## Language

**Web publica**:
La version live de Tu IPC disponible para usuarios finales.
_Avoid_: Release pendiente, entorno de pruebas

**Calculadora principal**:
La experiencia completa donde el usuario configura region, periodo, cesta de gasto y comparaciones.
_Avoid_: Dashboard, panel principal

**Embed externo**:
Una version embebible de Tu IPC pensada para integrarse dentro de una web de terceros.
_Avoid_: Widget, iframe suelto

**Guia de integracion**:
La documentacion opcional que explicaria a terceros como embeber Tu IPC y configurar sus parametros.
_Avoid_: Documentacion tecnica generica

**Dataset principal**:
El conjunto de indices IPC usados por la calculadora para regiones, indice general y 12 categorias ECOICOP.
_Avoid_: Datos generales, solo general

**Dataset de rubricas**:
El conjunto de series nacionales de clases ECOICOP usado por el explorador de rubricas.
_Avoid_: Dataset general, rubricas regionales

**Actualizacion de datos**:
El proceso periodico que regenera los datasets incluidos en la web publica desde fuentes del INE.
_Avoid_: Scrape diario, refresh visual

**Cambio real de datos**:
Una modificacion en meses, series, indices o catalogo que afecta al contenido estadistico de un dataset.
_Avoid_: Cambio de timestamp, commit automatico

## Relationships

- La **Web publica** contiene la **Calculadora principal**.
- Un **Embed externo** muestra una experiencia reducida de Tu IPC.
- La **Guia de integracion** describe como usar un **Embed externo** solo si existe interes real de integracion.
- Una **Actualizacion de datos** puede modificar el **Dataset principal**, el **Dataset de rubricas** o ambos.
- Un **Cambio real de datos** excluye cambios puramente administrativos como timestamps de generacion.

## Example dialogue

> **Dev:** "¿La **Actualizacion de datos** solo toca el indice general?"
> **Domain expert:** "No. Puede tocar el **Dataset principal** y el **Dataset de rubricas**; lo que no queremos es un commit si no hay **Cambio real de datos**."

## Flagged ambiguities

- "Release" se uso como si fuera un hito pendiente, pero la **Web publica** ya esta live. Resuelto: el trabajo pendiente es mantenimiento y documentacion, no cierre de release.
- "Terceros" se uso sin integrador concreto. Resuelto: la **Guia de integracion** no es prioridad activa mientras no haya una universidad, medio o web interesada.
- "General" se uso para hablar de la **Actualizacion de datos**, pero el workflow actual no solo descarga el indice general. Resuelto: distinguir **Dataset principal** y **Dataset de rubricas**.
