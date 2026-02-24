import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowRight, BarChart3, TrendingUp, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import OnboardingQuiz from "@/components/OnboardingQuiz";
import Footer from "@/components/Footer";

interface LandingPageProps {
  onStart: (weights?: Record<string, number>) => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-background relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-14">
          <h2 className="text-3xl font-bold text-center mb-2">
            Descubre tu perfil
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            7 preguntas rápidas para personalizar tu IPC
          </p>
          <OnboardingQuiz
            onComplete={(weights) => onStart(weights)}
            onSkip={() => onStart()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background animate-gradient" />

        <div className="relative mx-auto max-w-5xl px-4 py-12 md:py-20">
          <div
            className={`text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {/* Title with emphasis */}
            <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              <span className="text-foreground">Tu</span>{" "}
              <span className="text-primary relative inline-block">
                IPC
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-primary/20 rounded-full" />
              </span>
            </h1>

            <p className="mb-4 text-lg font-light text-muted-foreground md:text-2xl">
              Calculadora de inflación personal
            </p>

            <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Ajusta tus hábitos de consumo, compara con el IPC oficial y
              entiende en segundos cómo impacta la inflación en tu economía.
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
                variant="ghost"
                onClick={() => onStart()}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Saltar al calculador
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div
          className="grid gap-4 md:grid-cols-3"
          style={{ animation: "slide-up 0.6s ease-out 0.2s both" }}
        >
          <Card
            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: "0.05s" }}
          >
            <CardHeader>
              <div className="mb-3 p-2.5 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-lg">Personaliza tus gastos</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Ajusta 12 categorías de consumo (alimentación, vivienda,
                transporte...) para reflejar tu estilo de vida real
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <div className="mb-3 p-2.5 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-lg">
                Compara con el IPC oficial
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Descubre la diferencia entre tu inflación personal y la media
                nacional, mes a mes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: "0.15s" }}
          >
            <CardHeader>
              <div className="mb-3 p-2.5 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                <Share2 className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-lg">Comparte tus resultados</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Genera enlaces personalizados o imágenes para compartir tu
                análisis en redes sociales
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* FAQ Section — targets "mi IPC" search intent */}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="mb-6 text-center text-2xl font-bold md:text-3xl">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-5 text-sm leading-relaxed md:text-base">
          <div>
            <dt className="font-semibold text-foreground mb-1">
              ¿Cómo calculo mi IPC personal?
            </dt>
            <dd className="text-muted-foreground">
              Ajusta los pesos de las 12 categorías de gasto (alimentación,
              vivienda, transporte, ocio...) para que reflejen tu consumo real.
              La calculadora aplica esos pesos a los índices oficiales del INE y
              obtiene tu IPC personal.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground mb-1">
              ¿Qué diferencia hay entre mi IPC y el IPC oficial?
            </dt>
            <dd className="text-muted-foreground">
              El IPC oficial usa pesos medios de todos los hogares españoles. Tu
              IPC personal refleja tus hábitos reales: si gastas más en
              alimentación y menos en ocio, tu inflación puede ser mayor o menor
              que la media.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground mb-1">
              ¿De dónde salen los datos de mi IPC?
            </dt>
            <dd className="text-muted-foreground">
              Todos los datos provienen del Instituto Nacional de Estadística
              (INE). Se actualizan mensualmente con los índices ECOICOP por
              comunidad autónoma, base 2021=100.
            </dd>
          </div>
        </dl>
      </div>

      {/* How it works Section */}
      <div className="bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
            Cómo funciona
          </h2>

          <div className="space-y-6">
            <div
              className="flex flex-col md:flex-row gap-4 items-start"
              style={{ animation: "slide-up 0.6s ease-out 0.3s both" }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1.5">
                  Ajusta los pesos de tus categorías de gasto
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Distribuye tu presupuesto entre 12 categorías para reflejar tu
                  realidad: alquiler, alimentación, transporte, ocio y más.
                </p>
              </div>
            </div>

            <div
              className="flex flex-col md:flex-row gap-4 items-start"
              style={{ animation: "slide-up 0.6s ease-out 0.4s both" }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1.5">
                  Selecciona el periodo que te interesa
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Elige comunidad autónoma y rango de fechas. Trabajas siempre
                  con datos oficiales del INE actualizados mensualmente.
                </p>
              </div>
            </div>

            <div
              className="flex flex-col md:flex-row gap-4 items-start"
              style={{ animation: "slide-up 0.6s ease-out 0.5s both" }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1.5">
                  Descubre tu inflación personal
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Obtén tu IPC personal, compáralo con la media oficial y
                  detecta qué categorías explican la diferencia.
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-10">
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
  );
}
