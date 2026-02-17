import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface MethodologyProps {
  onBack: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold tracking-tight mb-4 pb-2 border-b">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-zinc-950 text-zinc-100 rounded-lg p-4 overflow-x-auto text-sm mb-4">
      <code>{children}</code>
    </pre>
  )
}

export default function Methodology({ onBack }: MethodologyProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          &larr; Volver a la calculadora
        </Button>

        <h1 className="text-4xl font-bold tracking-tight mb-2">Metodología</h1>
        <p className="text-lg text-muted-foreground mb-10">
          Cómo funciona esta calculadora: fuente de datos, transformaciones y cálculos
        </p>

        <Section title="1. Fuente de datos">
          <p className="text-muted-foreground mb-3">
            Los datos provienen de la{' '}
            <a
              href="https://www.ine.es/dyngs/DAB/index.htm?cid=1100"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              API JSON del Instituto Nacional de Estadística (INE)
            </a>
            , el organismo oficial de estadística de España.
          </p>
          <p className="text-muted-foreground mb-4">
            Consultamos el endpoint principal de la operación IPC con los siguientes parámetros:
          </p>
          <Code>
{`GET https://servicios.ine.es/wstempus/js/ES/DATOS_METADATAOPERACION/IPC
  ?g1=349:16473   # Total Nacional
  &g2=3:83        # Tipo: Índice (base 2021=100)
  &g3=762:        # Todos los grupos ECOICOP
  &p=1            # Periodicidad mensual
  &date=20100101:20261231`}
          </Code>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parámetro</TableHead>
                <TableHead>Variable</TableHead>
                <TableHead>Significado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableCell className="font-mono text-sm">g1=349:16473</TableCell><TableCell>Ámbito geográfico</TableCell><TableCell>Total Nacional (toda España)</TableCell></TableRow>
              <TableRow><TableCell className="font-mono text-sm">g2=3:83</TableCell><TableCell>Tipo de dato</TableCell><TableCell>Índice — valor crudo, base 2021=100</TableCell></TableRow>
              <TableRow><TableCell className="font-mono text-sm">g3=762:</TableCell><TableCell>Grupos ECOICOP</TableCell><TableCell>Todas las categorías de gasto</TableCell></TableRow>
              <TableRow><TableCell className="font-mono text-sm">p=1</TableCell><TableCell>Periodicidad</TableCell><TableCell>Datos mensuales</TableCell></TableRow>
              <TableRow><TableCell className="font-mono text-sm">date=...</TableCell><TableCell>Rango temporal</TableCell><TableCell>Desde enero 2010 hasta la actualidad</TableCell></TableRow>
            </TableBody>
          </Table>
          <p className="text-muted-foreground mt-4 mb-3">
            El <strong className="text-foreground">valor del índice base 2021=100</strong> significa que un valor de 105.3
            indica precios un 5.3% superiores a la media de 2021. Un valor de 95 indica precios
            un 5% inferiores.
          </p>
          <p className="text-sm text-muted-foreground/70">
            Las fechas vienen como timestamps Unix en milisegundos. Se parsean en UTC
            para evitar problemas de zona horaria.
          </p>
        </Section>

        <Section title="2. Las 12 categorías ECOICOP">
          <p className="text-muted-foreground mb-4">
            El IPC español desglosa el gasto de los hogares en 12 categorías según la
            clasificación europea ECOICOP (European Classification of Individual Consumption
            by Purpose):
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Peso IPC 2025</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ['01', 'Alimentos y bebidas no alcohólicas', '18.5%'],
                ['02', 'Bebidas alcohólicas y tabaco', '3.8%'],
                ['03', 'Vestido y calzado', '4.0%'],
                ['04', 'Vivienda, agua, electricidad, gas', '12.2%'],
                ['05', 'Muebles y artículos del hogar', '5.3%'],
                ['06', 'Sanidad', '5.7%'],
                ['07', 'Transporte', '14.4%'],
                ['08', 'Comunicaciones', '3.3%'],
                ['09', 'Ocio y cultura', '8.5%'],
                ['10', 'Enseñanza', '1.9%'],
                ['11', 'Restaurantes y hoteles', '14.7%'],
                ['12', 'Otros bienes y servicios', '7.7%'],
              ].map(([code, name, weight]) => (
                <TableRow key={code}>
                  <TableCell className="font-mono">{code}</TableCell>
                  <TableCell>{name}</TableCell>
                  <TableCell className="text-right">{weight}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-muted-foreground mt-4">
            Los pesos oficiales representan la distribución de gasto del consumidor medio
            español. Tu IPC personal te permite ajustar estos pesos según tus hábitos reales.
          </p>
        </Section>

        <Section title="3. Cambio de base y encadenamiento">
          <p className="text-muted-foreground mb-3">
            En enero 2026, el INE cambió la base del IPC de 2021 a 2025, y la clasificación de
            ECOICOP v1 (12 categorías) a ECOICOP v2 (13 categorías). Esto implica que hay dos
            tablas de datos con bases incompatibles:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-800">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Tabla 50913 — Base 2021</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>ECOICOP v1: 12 categorías</li>
                  <li>Historial completo desde dic 2009</li>
                  <li>Termina en nov 2025</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/30 dark:border-amber-800">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Tabla 76136 — Base 2025</h3>
                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                  <li>ECOICOP v2: 13 categorías</li>
                  <li>Empieza en dic 2024</li>
                  <li>Datos actuales y futuros</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/30 dark:border-red-800 mb-4">
            <CardContent className="pt-6">
              <p className="text-red-800 dark:text-red-300 font-medium mb-1">El problema</p>
              <p className="text-red-700 dark:text-red-400 text-sm">
                No se pueden mezclar directamente. Un valor de 119.4 (base 2021) y 100.8 (base 2025)
                para el mismo mes representan el mismo nivel de precios, pero con escalas distintas.
                Además, la categoría 12 ("Otros bienes y servicios") se ha dividido en dos:
                "Seguros y servicios financieros" y "Cuidado personal y protección social".
              </p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/30 dark:border-green-800 mb-4">
            <CardContent className="pt-6">
              <p className="text-green-800 dark:text-green-300 font-medium mb-1">Nuestra solución: encadenamiento (chain-linking)</p>
              <p className="text-green-700 dark:text-green-400 text-sm mb-2">
                Usamos la tabla antigua como base principal (historial largo y consistente).
                Para los meses posteriores a noviembre 2025, encadenamos los datos de la tabla
                nueva usando el último mes de solapamiento como punto de enlace:
              </p>
              <Code>
{`// Factor de enlace: relación entre bases en el mes de solapamiento
factor = valor_base2021[nov 2025] / valor_base2025[nov 2025]

// Convertir meses nuevos a la escala antigua
valor_encadenado[dic 2025] = valor_base2025[dic 2025] × factor

// Para la categoría 12 (dividida en v2):
// Se combinan las dos subcategorías con media ponderada
cat12_combinada = (3.7 × seguros + 4.0 × cuidado_personal) / 7.7`}
              </Code>
              <p className="text-green-700 dark:text-green-400 text-sm mt-2">
                Esto produce una serie continua sin saltos artificiales. Las variaciones
                porcentuales calculadas sobre la serie encadenada son exactas.
              </p>
            </CardContent>
          </Card>
        </Section>

        <Section title="4. Cálculo del IPC personal">
          <p className="text-muted-foreground mb-4">
            El cálculo se realiza en tres pasos:
          </p>

          <h3 className="text-lg font-semibold mb-2">
            Paso 1: Variación por categoría
          </h3>
          <p className="text-muted-foreground mb-2">
            Para cada categoría <em>c</em>, calculamos cuánto han variado los precios entre
            el mes base <em>t₀</em> y el mes actual <em>t</em>:
          </p>
          <Card className="mb-4">
            <CardContent className="pt-6 text-center font-mono text-sm">
              variación(c) = (Índice(c, t) − Índice(c, t₀)) / Índice(c, t₀) × 100
            </CardContent>
          </Card>

          <h3 className="text-lg font-semibold mb-2">
            Paso 2: Normalización de pesos
          </h3>
          <p className="text-muted-foreground mb-2">
            Los pesos del usuario se normalizan para que sumen 100%:
          </p>
          <Card className="mb-4">
            <CardContent className="pt-6 text-center font-mono text-sm">
              peso_normalizado(c) = peso_usuario(c) / suma_todos_los_pesos
            </CardContent>
          </Card>

          <h3 className="text-lg font-semibold mb-2">
            Paso 3: Media ponderada
          </h3>
          <p className="text-muted-foreground mb-2">
            El IPC personal es la suma de cada variación multiplicada por su peso:
          </p>
          <Card className="mb-4">
            <CardContent className="pt-6 text-center font-mono text-sm">
              IPC_personal = Σ (peso_normalizado(c) × variación(c))
            </CardContent>
          </Card>

          <h3 className="text-lg font-semibold mb-2">Ejemplo concreto</h3>
          <Card className="mb-4">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              <p className="mb-2">Si entre ene 2023 y dic 2025:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>
                  <strong className="text-foreground">Alimentos</strong> subió un 8% y tu peso normalizado es 40%
                  → contribución: 0.40 × 8 = <strong className="text-foreground">+3.20 pp</strong>
                </li>
                <li>
                  <strong className="text-foreground">Transporte</strong> bajó un 2% y tu peso normalizado es 10%
                  → contribución: 0.10 × (−2) = <strong className="text-foreground">−0.20 pp</strong>
                </li>
              </ul>
              <p className="mt-2">
                Tu IPC personal incluiría +3.20 pp de alimentos y −0.20 pp de transporte,
                más las contribuciones del resto de categorías.
              </p>
            </CardContent>
          </Card>
        </Section>

        <Section title="5. Comparación con el IPC oficial">
          <p className="text-muted-foreground mb-3">
            El IPC oficial se calcula con la misma fórmula, pero usando los <strong className="text-foreground">pesos
            oficiales del INE</strong> en lugar de los tuyos. La diferencia (en puntos
            porcentuales) indica cuánto más o menos suben tus precios respecto al consumidor
            medio:
          </p>
          <Card className="mb-4">
            <CardContent className="pt-6 text-center font-mono text-sm">
              diferencia = IPC_personal − IPC_oficial
            </CardContent>
          </Card>
          <ul className="text-muted-foreground space-y-1 ml-4 list-disc mb-4">
            <li>
              <span className="text-red-600 font-semibold">Positiva:</span> tu coste de
              vida sube más que la media
            </li>
            <li>
              <span className="text-green-600 font-semibold">Negativa:</span> tu coste de
              vida sube menos que la media
            </li>
          </ul>
          <p className="text-sm text-muted-foreground/70">
            Cuando está disponible el índice general (categoría "00"), se usa directamente como
            IPC oficial, lo que proporciona un valor exacto. En caso contrario, se calcula
            como media ponderada con los pesos oficiales del INE.
          </p>
        </Section>

        <Section title="6. Perfiles de gasto predefinidos">
          <p className="text-muted-foreground mb-4">
            Ofrecemos varios perfiles de gasto tipo para que puedas empezar rápidamente
            con una configuración realista. Los pesos de cada perfil son <strong className="text-foreground">estimaciones orientativas</strong> basadas
            en datos de la Encuesta de Presupuestos Familiares (EPF) del INE 2023/2024, las ponderaciones oficiales del IPC 2025,
            y estudios de patrones de consumo por perfil demográfico de CaixaBank Research.
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Perfil</TableHead>
                <TableHead>Base empírica</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">📊 Oficial INE</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Ponderaciones oficiales del IPC 2025 (base 2021), publicadas por el INE en enero 2025.
                  Reflejan la cesta de consumo media de los hogares españoles
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">🏠 Pensionista (propietario)</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  EPF 2024: persona sola 65+ gasta €22.081 de media. CaixaBank Research: tras jubilación,
                  alimentación y sanidad suben, transporte y educación bajan. ~80% de 65+ son propietarios
                  (Censo 2021). Vivienda al 15% (suministros, IBI, comunidad, sin alquiler). Sanidad al 11%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">👴 Pensionista (inquilino)</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  EPF 2024 + ECV: ~20% de pensionistas en alquiler. Vivienda al 25% (alquiler real + suministros
                  sobre presupuesto reducido). EPF Q1: hogares con menor gasto dedican 42.5% a vivienda + 21% a
                  alimentación. Alto gasto en seguros (12: Otros) por pólizas de salud complementaria
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">👨‍👩‍👧‍👦 Familia con hijos</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  EPF 2024: pareja con hijos = gasto más alto (€43.163). Educación al 7% (el grupo
                  con mayor diferencia vs media del 1.9%). Vestido al 6% (niños crecen). Alimentación
                  al 21%. Restaurantes bajan al 8% (menos cenas fuera con niños)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">🧑 Joven soltero/a</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  EPF 2024: unipersonal &lt;65 = €22.226. CaixaBank Research: jóvenes dedican +4pp a vivienda
                  (45.4% alquilan, vs 25% media nacional) y -2.3pp a transporte (menos coches). Restaurantes
                  al 20% y ocio al 10%: los jóvenes aumentaron gasto en comer fuera un 17.5% en la recuperación post-crisis
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">💼 Autónomo</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Basado en EPF por situación profesional. Gastos mixtos personal/profesional: transporte al 18%
                  (desplazamientos laborales), comunicaciones al 5% (herramienta de trabajo), restaurantes al 15%
                  (comidas de negocio). Formación continua eleva educación al 2.5%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">🎓 Estudiante</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Presupuesto muy ajustado. Vivienda al 24% (piso compartido en alquiler). Educación al 12%
                  (matrícula universitaria, libros, material). Transporte al 6% (abono transporte público).
                  Patrón similar al quintil 1 de la EPF con peso extra en enseñanza
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">👫 Pareja sin hijos</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  EPF 2024: pareja sin hijos = €35.059. Doble ingreso sin dependientes (DINK): restaurantes al 20%
                  y ocio al 10% (patrón quintil 5 EPF: 34.7% en transporte + restaurantes + ocio). Educación
                  casi nula (0.5%). Vivienda al 12% (costes compartidos)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">🏡 Teletrabajador</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Basado en estudios de impacto del teletrabajo en el consumo. Transporte baja al 5%
                  (sin commute). Vivienda sube al 17% (suministros más altos). Muebles/hogar al 7%
                  (equipamiento home office). Comunicaciones al 5.5% (internet de calidad esencial)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">🌾 Rural</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  EPF por tamaño de municipio (&lt;10.000 hab.). Transporte al 21% (coche imprescindible,
                  grandes distancias). Vivienda baja al 9% (mucho más barata). Alimentación al 22%
                  (más cocina en casa). Restaurantes al 10% (menos oferta hostelera)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">💑 Pareja joven</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Combina datos EPF &lt;35 y pareja sin hijos. Vivienda al 18% (alquiler compartido pero caro).
                  Restaurantes al 20% (vida social activa). CaixaBank: jóvenes recuperaron gasto en
                  ropa (+10.2%) y comer fuera (+17.5%) tras la crisis, patrón mantenido
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <h3 className="text-lg font-semibold mt-6 mb-3">Fuentes y referencias</h3>
          <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
            <li>
              <a href="https://www.ine.es/dyngs/Prensa/EPF2024.htm"
                target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors">
                Encuesta de Presupuestos Familiares (EPF) 2024
              </a> — INE. Gasto medio €34.044. Estructura porcentual por ECOICOP: alimentación 15.8%,
              vivienda 32.4%, transporte 11.4%, restaurantes 9.9%. Gasto por tipo de hogar
            </li>
            <li>
              <a href="https://www.ine.es/dyngs/Prensa/EPF2023.htm"
                target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors">
                Encuesta de Presupuestos Familiares (EPF) 2023
              </a> — INE. Distribución por quintiles: Q1 dedica 42.5% a vivienda y 21% a alimentación;
              Q5 dedica 34.7% a transporte, restaurantes y ocio
            </li>
            <li>
              <a href="https://www.ine.es/dyngs/Prensa/IPC0125.htm"
                target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors">
                Ponderaciones IPC 2025
              </a> — INE. Nota de prensa IPC enero 2025: ponderaciones oficiales actualizadas
              por grupo ECOICOP (base 2021)
            </li>
            <li>
              <a href="https://www.caixabankresearch.com/en/economics-markets/labour-market-demographics/consumption-and-saving-patterns-after-retirement"
                target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors">
                Patrones de consumo tras la jubilación
              </a> — CaixaBank Research. Tras jubilación: vivienda+suministros 40%, alimentación 17%,
              ocio/turismo 10%. Sanidad sube, transporte y educación bajan
            </li>
            <li>
              <a href="https://www.caixabankresearch.com/en/economics-markets/activity-growth/how-have-young-adults-changed-their-consumption-and-savings"
                target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors">
                Consumo de jóvenes adultos
              </a> — CaixaBank Research. Vivienda +4pp (45.4% alquilan), transporte -2.3pp (menos coches).
              Gasto en comer fuera +17.5%, ropa +10.2% en recuperación
            </li>
            <li>
              <a href="https://www.caixabankresearch.com/en/economics-markets/activity-growth/consumption-who-how-much-and-what"
                target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors">
                Consumo: quién, cuánto y de qué
              </a> — CaixaBank Research. Diferencias de consumo por edad y nivel de ingresos
            </li>
            <li>
              <a href="https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176807&menu=ultiDatos&idp=1254735976608"
                target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors">
                Encuesta de Condiciones de Vida (ECV)
              </a> — INE. Régimen de tenencia de vivienda, costes y cargas por edad y tipo de hogar
            </li>
            <li>
              <a href="https://www.ine.es/censos2021/"
                target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors">
                Censo de Población y Viviendas 2021
              </a> — INE. Datos de tenencia de vivienda por grupo de edad (~80% propietarios en 65+)
            </li>
          </ul>

          <p className="text-sm text-muted-foreground/70 mt-4">
            Estos perfiles son aproximaciones orientativas para facilitar el uso de la herramienta.
            Para obtener tu IPC más preciso, ajusta los pesos manualmente según tus gastos reales.
            El IPC del INE no incluye alquileres imputados (el coste teórico de vivir en una vivienda en propiedad),
            por eso la distinción entre propietario e inquilino se refiere exclusivamente al alquiler real.
            La EPF sí incluye alquileres imputados, lo que explica que su peso de vivienda (~32%) sea muy
            superior al del IPC (~12%).
          </p>
        </Section>

        <Section title="7. Notas técnicas">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Estacionalidad</h3>
              <p className="text-muted-foreground text-sm">
                Algunas categorías muestran patrones estacionales fuertes. Por ejemplo,
                <strong className="text-foreground"> Vestido y calzado cae ~13-15% cada diciembre</strong> (rebajas de
                invierno) y sube en primavera. Esto es un comportamiento real de los precios,
                no un error en los datos.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-1">Precisión</h3>
              <p className="text-muted-foreground text-sm">
                El INE publica con 3 decimales. Los cálculos internos mantienen precisión
                completa; la interfaz muestra 1-2 decimales.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-1">CORS y datos estáticos</h3>
              <p className="text-muted-foreground text-sm mb-2">
                La API del INE no tiene cabeceras CORS fiables para llamadas desde el navegador.
                Usamos un enfoque de datos estáticos: un script Node descarga los datos y los
                guarda como JSON, que se incluye en el bundle de la aplicación. Para actualizar:
              </p>
              <Code>npm run download-data</Code>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-1">Actualización</h3>
              <p className="text-muted-foreground text-sm">
                El INE publica nuevos datos del IPC mensualmente, normalmente entre el 10-15
                del mes siguiente. El script de descarga obtiene ambas tablas (base 2021 y base 2025)
                y encadena automáticamente los meses más recientes.
              </p>
            </div>
          </div>
        </Section>

        <div className="text-center pb-8">
          <Button variant="ghost" onClick={onBack}>
            &larr; Volver a la calculadora
          </Button>
        </div>
      </div>
    </div>
  )
}
