import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BarChart3, TrendingUp, Share2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface LandingPageProps {
  onStart: () => void
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const featuresRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.1 }
    )

    if (featuresRef.current) observer.observe(featuresRef.current)
    if (stepsRef.current) observer.observe(stepsRef.current)

    return () => observer.disconnect()
  }, [])

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background animate-gradient" />

        <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-32">
          <div className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Title with emphasis */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
              <span className="text-foreground">Tu</span>{' '}
              <span className="text-primary relative inline-block">
                IPC
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/20 rounded-full" />
              </span>
            </h1>

            <p className="text-2xl md:text-3xl text-muted-foreground font-light mb-8">
              Calculadora de inflación personal
            </p>

            <p className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed">
              Ajusta tus hábitos de consumo para descubrir cómo te afecta realmente la inflación.
              Compara tu IPC personal con el oficial y entiende el impacto en tu economía.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                size="lg"
                onClick={onStart}
                className="text-lg px-8 py-6 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Calcular mi IPC
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToFeatures}
                className="text-lg px-8 py-6 h-auto font-semibold"
              >
                ¿Cómo funciona?
              </Button>
            </div>

            {/* Floating numbers animation */}
            <div className="relative h-20 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center gap-8 text-muted-foreground/20 text-4xl font-bold animate-float">
                <span className="animate-float-delay-0">+3.2%</span>
                <span className="animate-float-delay-1">+5.8%</span>
                <span className="animate-float-delay-2">+2.1%</span>
                <span className="animate-float-delay-3">+4.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="max-w-6xl mx-auto px-4 py-20 opacity-0 transition-all duration-700">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Personaliza tus gastos</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Ajusta 12 categorías de consumo (alimentación, vivienda, transporte...) para reflejar tu estilo de vida real
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Compara con el IPC oficial</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Descubre la diferencia entre tu inflación personal y la media nacional, mes a mes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                <Share2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Comparte tus resultados</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Genera enlaces personalizados o imágenes para compartir tu análisis en redes sociales
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* How it works Section */}
      <div ref={stepsRef} className="bg-muted/30 opacity-0 transition-all duration-700">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Cómo funciona
          </h2>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Ajusta los pesos de tus categorías de gasto
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Usa los controles deslizantes para distribuir tu presupuesto entre alimentación, vivienda, transporte y otras 9 categorías. ¿Gastas más en alquiler que la media? ¿Menos en ocio? Personaliza tu cesta.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Selecciona el periodo que te interesa
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Elige tu comunidad autónoma y el rango de fechas (último año, dos años, periodo personalizado). Los datos provienen del INE y se actualizan mensualmente.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Descubre tu inflación personal
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Visualiza gráficos interactivos con la evolución de tu IPC, compara con el oficial, analiza categorías individuales y calcula cuánto debería subir tu sueldo para mantener tu poder adquisitivo.
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-16">
            <Button
              size="lg"
              onClick={onStart}
              className="text-lg px-10 py-6 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Empieza ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>
          Datos oficiales del Instituto Nacional de Estadística (INE) ·
          Índices ECOICOP por comunidad autónoma
        </p>
      </div>
    </div>
  )
}
