# Referencia visual — gráfico de Santiago Calvo (España)

Fuente visual aportada:

- `https://pbs.twimg.com/media/G_mq-HIWgAEXbqB?format=jpg&name=4096x4096`

## Elementos a replicar en V1

1. Eje temporal largo desde 2002.
2. Series por grupo/rúbrica en acumulado (%), todas partiendo de 0 en base.
3. Línea horizontal de referencia (benchmark IPC general acumulado del periodo).
4. Etiquetas al final de cada línea con valor final (evitar dependencia exclusiva de leyenda).
5. Anotación visible del benchmark general.
6. Pie de gráfico con fuente INE.

## Adaptación a versión interactiva

1. Selector dinámico de rúbricas (hasta 6 activas).
2. Benchmark recalculado según rango visible.
3. Tooltip al pasar por cada mes.
4. Modo embed estable para integración externa.

## Notas de diseño

1. Mantener jerarquía visual clara: dato principal > benchmark > contexto.
2. Evitar ruido cuando haya múltiples líneas (control de selección y resaltado en hover).
3. Preservar legibilidad móvil (etiquetado final inteligente + fallback de leyenda).
