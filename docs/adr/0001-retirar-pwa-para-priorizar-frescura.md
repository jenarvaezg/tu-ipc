# Retirar la PWA para priorizar frescura de datos

Tu IPC prioriza que la web publica muestre los ultimos datos desplegados frente a conservar una experiencia instalable u offline. Retiramos la configuracion PWA activa y dejamos una limpieza invisible para service workers y caches heredadas, porque una cache antigua puede hacer que "Ultimos datos" muestre un mes estadistico ya superado.

**Consecuencia:** la instalacion de la web deja de ser un objetivo del producto; si en el futuro se recupera, debera disenar la cache alrededor de la frescura de datos, no alrededor de offline-first.
