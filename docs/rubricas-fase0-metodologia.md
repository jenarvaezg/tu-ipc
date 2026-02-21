# Fase 0 — Definición metodológica (cerrada)

Fecha: 2026-02-21  
Estado: Aprobada para implementación V1

## 1) Métrica del gráfico principal

El gráfico principal mostrará **inflación acumulada (%)** para cada rúbrica:

```text
inflacion_acumulada(s, t) = ((indice(s, t) / indice(s, base)) - 1) * 100
```

Donde:

- `s` = serie/rúbrica seleccionada.
- `t` = mes del eje X.
- `base` = `2002-01`.

## 2) Referencia del IPC general

Adoptamos el patrón visual de referencia aportado por Santiago Calvo:

- La referencia principal será una **línea horizontal** en el valor de IPC general acumulado del periodo.
- Se calcula así:

```text
benchmark_general = ((indice_ipc_general(t_fin) / indice_ipc_general(base)) - 1) * 100
```

Donde:

- `base = 2002-01`.
- `t_fin` es el último mes visible del rango seleccionado.

Interpretación:

- Las series por encima de la línea acumulan más inflación que el IPC general.
- Las series por debajo acumulan menos inflación que el IPC general.

Nota de implementación:

- La línea horizontal se recalcula si cambia el rango temporal visible.
- Conservamos soporte interno para trazar también la serie acumulada del general, pero no será la visualización por defecto en V1.

## 3) Regla de comparabilidad

En V1 se aplica modo **estricto**:

- Solo se muestran como seleccionables por defecto las series con dato en `2002-01`.
- Las series sin base 2002 podrán habilitarse opcionalmente con etiqueta visual de cobertura reducida (futuro V1.1).

## 4) Nivel de desagregación en V1

Con base en el spike de cobertura (`docs/rubricas-spike-2026-02-21.md`):

- Nivel recomendado para V1: **Clases ECOICOP** (`g3=764`).
- Justificación: es el máximo nivel con cobertura histórica razonable en base 2002 y catálogo amplio.

## 5) Límite de series simultáneas

- Máximo de series activas en gráfico: **6**.
- Motivo: legibilidad, rendimiento en móvil y claridad de tooltip/leyenda.

## 6) Mock funcional (comportamiento)

Layout de V1:

1. Panel izquierdo: búsqueda + árbol de clases ECOICOP (chips seleccionados).
2. Cabecera del gráfico: base fija `2002-01`, selector rango visible, botón reset.
3. Gráfico central: líneas de series seleccionadas + línea “IPC general acumulado”.
4. Leyenda inferior: mostrar nombre, color, cobertura (si no es total), botón quitar.

Ajuste de estilo requerido por referencia:

- Priorizar etiquetas al final de cada línea (evitar depender solo de leyenda).
- Mostrar anotación textual del benchmark general (porcentaje).

Interacción mínima:

1. Seleccionar hasta 6 clases.
2. Hover muestra valor acumulado por mes para cada serie visible.
3. Compartir URL conserva selección y rango.
