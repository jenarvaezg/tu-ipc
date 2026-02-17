import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BarChart3, TrendingUp, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import OnboardingQuiz from '@/components/OnboardingQuiz'
import Footer from '@/components/Footer'

interface LandingPageProps {
  onStart: (weights?: Record<string, number>) => void
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-2">Descubre tu perfil</h2>
          <p className="text-center text-muted-foreground mb-8">
            7 preguntas rápidas para personalizar tu IPC
          </p>
          <OnboardingQuiz
            onComplete={(weights) => onStart(weights)}
            onSkip={() => onStart()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background animate-gradient" />

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Title with emphasis */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
              <span className="text-foreground">Tu</span>{' '}
              <span className="text-primary relative inline-block">
                IPC
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-primary/20 rounded-full" />
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground font-light mb-6">
              Calculadora de inflación personal
            </p>

            <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Ajusta tus hábitos de consumo para descubrir cómo te afecta realmente la inflación.
              Compara tu IPC personal con el oficial y entiende el impacto en tu economía.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                size="lg"
                onClick={() => setShowQuiz(true)}
                className="text-base px-8 py-5 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Descubre tu IPC
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onStart()}
                className="text-base px-8 py-5 h-auto"
              >
                Saltar al calculador
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6" style={{ animation: 'slide-up 0.6s ease-out 0.2s both' }}>
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1" style={{ animationDelay: '0.05s' }}>
            <CardHeader>
              <div className="mb-3 p-2.5 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-lg">Personaliza tus gastos</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Ajusta 12 categorías de consumo (alimentación, vivienda, transporte...) para reflejar tu estilo de vida real
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <div className="mb-3 p-2.5 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-lg">Compara con el IPC oficial</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Descubre la diferencia entre tu inflación personal y la media nacional, mes a mes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1" style={{ animationDelay: '0.15s' }}>
            <CardHeader>
              <div className="mb-3 p-2.5 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                <Share2 className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-lg">Comparte tus resultados</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Genera enlaces personalizados o imágenes para compartir tu análisis en redes sociales
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* How it works Section */}
      <div className="bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Cómo funciona
          </h2>

          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-start" style={{ animation: 'slide-up 0.6s ease-out 0.3s both' }}>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1.5">
                  Ajusta los pesos de tus categorías de gasto
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Usa los controles deslizantes para distribuir tu presupuesto entre alimentación, vivienda, transporte y otras 9 categorías. ¿Gastas más en alquiler que la media? ¿Menos en ocio? Personaliza tu cesta.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start" style={{ animation: 'slide-up 0.6s ease-out 0.4s both' }}>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1.5">
                  Selecciona el periodo que te interesa
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Elige tu comunidad autónoma y el rango de fechas (último año, dos años, periodo personalizado). Los datos provienen del INE y se actualizan mensualmente.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start" style={{ animation: 'slide-up 0.6s ease-out 0.5s both' }}>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1.5">
                  Descubre tu inflación personal
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Visualiza gráficos interactivos con la evolución de tu IPC, compara con el oficial, analiza categorías individuales y calcula cuánto debería subir tu sueldo para mantener tu poder adquisitivo.
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => setShowQuiz(true)}
              className="text-base px-10 py-5 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Empieza ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <Footer />
      </div>
    </div>
  )
}
