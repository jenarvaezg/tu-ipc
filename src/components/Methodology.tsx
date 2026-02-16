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
                <TableHead className="text-right">Peso oficial INE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ['01', 'Alimentos y bebidas no alcohólicas', '21.9%'],
                ['02', 'Bebidas alcohólicas y tabaco', '3.2%'],
                ['03', 'Vestido y calzado', '4.8%'],
                ['04', 'Vivienda, agua, electricidad, gas', '13.5%'],
                ['05', 'Muebles y artículos del hogar', '6.1%'],
                ['06', 'Sanidad', '4.6%'],
                ['07', 'Transporte', '13.8%'],
                ['08', 'Comunicaciones', '3.2%'],
                ['09', 'Ocio y cultura', '8.2%'],
                ['10', 'Enseñanza', '1.8%'],
                ['11', 'Restaurantes y hoteles', '12.8%'],
                ['12', 'Otros bienes y servicios', '6.1%'],
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

        <Section title="3. El problema de ECOICOP v1 vs v2">
          <p className="text-muted-foreground mb-3">
            Desde ~2024-2025, el INE publica simultáneamente series con dos clasificaciones:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-800 mb-2">ECOICOP v1 (clásica)</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>IDs 304092-304104</li>
                  <li>Series históricas completas desde 2009</li>
                  <li>Base 2021=100 consistente</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-amber-800 mb-2">ECOICOP v2 (nueva)</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>IDs 418050-418061</li>
                  <li>Series más cortas, empiezan más tarde</li>
                  <li>Base diferente (incompatible con v1)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <Card className="border-red-200 bg-red-50/50 mb-4">
            <CardContent className="pt-6">
              <p className="text-red-800 font-medium mb-1">El problema</p>
              <p className="text-red-700 text-sm">
                Si mezclas datos v1 y v2 para la misma categoría, obtienes discontinuidades
                falsas. Por ejemplo, Restaurantes podría mostrar un salto de 125 → 101 en un
                solo mes, que no es una caída real sino un cambio de base.
              </p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <p className="text-green-800 font-medium mb-1">Nuestra solución: "la serie más larga gana"</p>
              <p className="text-green-700 text-sm mb-2">
                El script de descarga agrupa todas las series por categoría y selecciona
                únicamente la que tiene más puntos de datos — que es siempre la v1 (historial
                completo, base consistente):
              </p>
              <Code>
{`// Para cada categoría, elegir la serie con más datos
const sorted = seriesDelMismoGrupo
  .sort((a, b) => b.puntos - a.puntos)
const elegida = sorted[0] // Más larga = v1`}
              </Code>
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
            Nota: nuestro cálculo del "IPC oficial" es una aproximación. El INE usa una
            metodología más compleja con ponderaciones encadenadas que se actualizan anualmente.
            Los resultados pueden diferir ligeramente del dato publicado.
          </p>
        </Section>

        <Section title="6. Perfiles de gasto predefinidos">
          <p className="text-muted-foreground mb-4">
            Ofrecemos varios perfiles de gasto tipo para que puedas empezar rápidamente
            con una configuración realista. Los pesos de cada perfil son <strong className="text-foreground">estimaciones orientativas</strong> basadas
            en datos de la Encuesta de Presupuestos Familiares (EPF) del INE y estudios de patrones de consumo por perfil demográfico.
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Perfil</TableHead>
                <TableHead>Criterio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">📊 Oficial INE</TableCell>
                <TableCell className="text-sm text-muted-foreground">Ponderaciones oficiales del INE para el consumidor medio español</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">🏠 Pensionista (propietario)</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  ~80% de los mayores de 65 años son propietarios sin hipoteca. Se reduce vivienda a ~10%
                  (solo suministros y mantenimiento, sin alquiler) y se eleva alimentación (~30%), sanidad (~14%)
                  y otros servicios (seguros, cuidado personal)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">👴 Pensionista (inquilino)</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  ~20% de pensionistas que pagan alquiler. Vivienda sube a ~22% (incluye alquiler real + suministros).
                  Alto gasto en alimentación y sanidad, menor gasto en ocio y restaurantes
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">👨‍👩‍👧‍👦 Familia con hijos</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Basado en EPF para hogares con menores. Alto gasto en alimentación (~25%), educación (~6%),
                  vivienda (~18%) y vestido/calzado (~7%). Menor gasto relativo en ocio y restaurantes
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">🧑 Joven soltero/a</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Basado en EPF para hogares unipersonales &lt;35 años. Alto gasto en restaurantes (~18%),
                  ocio (~12%), transporte (~14%) y comunicaciones (~5%). Menor gasto en alimentación en casa
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <p className="text-sm text-muted-foreground/70 mt-4">
            Estos perfiles son aproximaciones para facilitar el uso de la herramienta.
            Para obtener tu IPC más preciso, ajusta los pesos manualmente según tus gastos reales.
            El IPC del INE no incluye alquileres imputados (el coste teórico de vivir en una vivienda en propiedad),
            por eso la distinción entre propietario e inquilino se refiere exclusivamente al alquiler real.
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
                del mes siguiente.
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
