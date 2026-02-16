# Metodología: Calculadora de IPC Personal

## Fuente de datos

Los datos provienen de la **API JSON del Instituto Nacional de Estadística (INE)** de España.

- Documentación oficial: https://www.ine.es/dyngs/DAB/index.htm?cid=1100
- Base URL: `https://servicios.ine.es/wstempus/js/ES`

### Endpoint principal

```
GET /DATOS_METADATAOPERACION/IPC?g1=349:16473&g2=3:83&g3=762:&p=1&date=20100101:20261231
```

**Parámetros:**
| Parámetro | Significado |
|-----------|-------------|
| `g1=349:16473` | Variable 349 (Ámbito geográfico) = Valor 16473 (Total Nacional) |
| `g2=3:83` | Variable 3 (Tipo de dato) = Valor 83 (Índice, base 2021=100) |
| `g3=762:` | Variable 762 (Grupos ECOICOP) = todos los grupos |
| `p=1` | Periodicidad mensual |
| `date=20100101:20261231` | Rango de fechas solicitado |

El valor 83 ("Índice") devuelve el **valor crudo del índice de precios con base 2021=100**. Esto significa que un valor de 105.3 indica que los precios son un 5.3% superiores a la media de 2021.

### Respuesta de la API

La API devuelve un array de series temporales. Cada serie corresponde a una combinación categoría × tipo de dato:

```json
{
  "COD": "IPC251852",
  "Nombre": "Total Nacional. Índice general. Índice.",
  "Data": [
    {
      "Fecha": 1767222000000,
      "Valor": 107.3,
      "Anyo": 2026,
      "FK_Periodo": 1
    }
  ]
}
```

- `Fecha`: timestamp Unix en **milisegundos**. Se parsea con `new Date(timestamp)` usando `getUTCFullYear()` y `getUTCMonth()` (el INE usa UTC).
- `Valor`: valor del índice con 3 decimales de precisión.

---

## Las 12+1 categorías ECOICOP

El IPC español se desglosa en 12 categorías de gasto según la clasificación europea ECOICOP, más el índice general (código 00):

| Código | Categoría | Peso oficial INE (~2024) |
|--------|-----------|--------------------------|
| 00 | Índice general | — |
| 01 | Alimentos y bebidas no alcohólicas | 21.9% |
| 02 | Bebidas alcohólicas y tabaco | 3.2% |
| 03 | Vestido y calzado | 4.8% |
| 04 | Vivienda, agua, electricidad, gas | 13.5% |
| 05 | Muebles y artículos del hogar | 6.1% |
| 06 | Sanidad | 4.6% |
| 07 | Transporte | 13.8% |
| 08 | Comunicaciones | 3.2% |
| 09 | Ocio y cultura | 8.2% |
| 10 | Enseñanza | 1.8% |
| 11 | Restaurantes y hoteles | 12.8% |
| 12 | Otros bienes y servicios | 6.1% |

---

## Problema: Coexistencia de ECOICOP v1 y v2

### El problema

Desde aproximadamente 2024-2025, el INE empezó a publicar series con la **nueva clasificación ECOICOP v2** junto a las clásicas v1. Ambas coexisten en la API:

**ECOICOP v1 (clásicas, IDs 304092-304104):**
- Series históricas completas desde 2009
- Base 2021=100 consistente en todo el rango

**ECOICOP v2 (nuevas, IDs 418050-418061):**
- Series más cortas, empiezan más tarde
- Usan una **base diferente** (no compatible con v1)
- Renombran algunas categorías (ej: "Comunicaciones" → "Información y comunicaciones")

### Por qué es un problema

Si mezclas datos v1 y v2 para la misma categoría, obtienes **discontinuidades falsas**. Por ejemplo, Restaurantes podría mostrar un salto de 125 → 101 en un solo mes, cuando en realidad es un cambio de base, no una caída real de precios.

### Nuestra solución

El script de descarga (`scripts/download-ine-data.mjs`) resuelve esto con la estrategia **"serie más larga gana"**:

1. **Agrupa** todas las series de la API por categoría (matching por keywords en el nombre)
2. Para cada categoría, **ordena** las series por número de puntos de datos (descendente)
3. **Selecciona solo la serie más larga** — que es siempre la v1, porque tiene el historial completo
4. Las series v2 (más cortas) se descartan automáticamente

```javascript
// Para cada categoría, pick la serie con más datos (v1 = histórica completa)
const sorted = allSeries
  .map(s => ({ series: s, points: (s.Data || []).length }))
  .sort((a, b) => b.points - a.points)
const best = sorted[0] // La más larga = v1
```

Esto garantiza una serie temporal **continua y coherente** en toda la base 2021=100.

### Matching de categorías

Las series se asignan a categorías mediante keywords en el campo `Nombre`:

```javascript
const catMap = [
  { code: '01', keywords: ['alimentos'], name: 'Alimentos...' },
  { code: '02', keywords: ['alcohólicas', 'tabaco'], name: 'Bebidas...' },
  // etc.
]
```

Caso especial: la categoría 02 incluye "alcohólicas" pero la 01 también contiene "bebidas no alcohólicas". Se filtra con: `if (cat.code === '02' && nombre.includes('alimentos')) continue`.

---

## Cálculo del IPC personal

### Fórmula

Para calcular la **variación acumulada** entre un mes base `t₀` y un mes `t`:

```
variación_categoría(c) = (Índice_c(t) - Índice_c(t₀)) / Índice_c(t₀) × 100
```

Donde `Índice_c(t)` es el valor del índice de precios de la categoría `c` en el mes `t`.

El **IPC personal** es la media ponderada de las variaciones por categoría:

```
IPC_personal = Σ (w_c × variación_categoría(c))
```

Donde `w_c` es el peso normalizado del usuario para la categoría `c`:

```
w_c = peso_usuario(c) / Σ pesos_usuario
```

### IPC oficial (para comparación)

Se calcula exactamente igual, pero usando los **pesos oficiales del INE** en lugar de los del usuario. Esto permite comparar "tu inflación" vs "la inflación media".

### Ejemplo

Si entre enero 2023 y diciembre 2025:
- Alimentos subió un 8% y tú gastas el 40% en alimentos (peso normalizado = 0.40)
- Transporte bajó un 2% y tú gastas el 10% en transporte (peso normalizado = 0.10)

Contribución de alimentos: 0.40 × 8% = 3.20 pp
Contribución de transporte: 0.10 × (-2%) = -0.20 pp

Tu IPC personal incluiría +3.20 pp de alimentos y -0.20 pp de transporte (más el resto de categorías).

### Diferencia con el IPC oficial

La **diferencia** (en puntos porcentuales) indica cuánto más o menos suben tus precios respecto al consumidor medio:

```
diferencia = IPC_personal - IPC_oficial
```

- **Positiva**: tu coste de vida sube más que la media
- **Negativa**: tu coste de vida sube menos que la media

---

## Notas técnicas

### Estacionalidad

Algunas categorías muestran fuertes patrones estacionales. Por ejemplo, **Vestido y calzado** cae ~13-15% cada diciembre (rebajas de invierno) y sube de vuelta en primavera. Esto es real y se refleja correctamente en los datos.

### Precisión

El INE publica valores con 3 decimales. Los cálculos internos mantienen precisión completa; la UI muestra 1-2 decimales.

### Base 2021=100

Todos los índices están en base 2021=100. Esto significa que el valor 100 corresponde al nivel medio de precios del año 2021. Un valor de 95 indica precios un 5% inferiores a 2021; un valor de 110 indica precios un 10% superiores.

### Actualización

El INE publica nuevos datos del IPC mensualmente, normalmente entre el 10-15 del mes siguiente. Para actualizar los datos de la app:

```bash
npm run download-data
```

### CORS

La API del INE no tiene cabeceras CORS fiables para llamadas desde el navegador. Por eso usamos un **enfoque de datos estáticos**: el script Node descarga los datos y los guarda como JSON, que Vite incluye en el bundle.
