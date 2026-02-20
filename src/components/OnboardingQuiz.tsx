import { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CATEGORIES, OFFICIAL_WEIGHTS } from "@/data/categories";
import { Info, ArrowLeft, ArrowRight } from "lucide-react";
import { trackEvent } from "@/utils/analytics";

interface OnboardingQuizProps {
  onComplete: (weights: Record<string, number>) => void;
  onSkip: () => void;
}

interface QuizOption {
  label: string;
  emoji: string;
  deltas: Record<string, number>;
  insight: string;
  affected: { code: string; direction: "up" | "down" }[];
}

interface Question {
  text: string;
  context: string;
  options: QuizOption[];
}

interface PersistedQuizState {
  step: number;
  answers: (number | null)[];
  showSummary: boolean;
}

const CATEGORY_SHORT_NAMES: Record<string, string> = {
  "01": "Alimentación",
  "02": "Alcohol/Tabaco",
  "03": "Vestido",
  "04": "Vivienda",
  "05": "Muebles/Hogar",
  "06": "Sanidad",
  "07": "Transporte",
  "08": "Comunicaciones",
  "09": "Ocio/Cultura",
  "10": "Enseñanza",
  "11": "Restaurantes",
  "12": "Otros",
};

const QUESTIONS: Question[] = [
  {
    text: "¿Cuál describe mejor tu situación?",
    context:
      "Tu etapa vital es lo que más influye en cómo distribuyes tu presupuesto. Una familia con hijos gasta de media 43.163 €/año, un joven soltero 22.226 €.",
    options: [
      {
        label: "Estudiante",
        emoji: "🎓",
        deltas: { "01": -4, "04": 10, "07": -8, "09": 1, "10": 10, "11": -1 },
        insight:
          "Como estudiante, la vivienda y la enseñanza pesan mucho más y el transporte mucho menos.",
        affected: [
          { code: "04", direction: "up" },
          { code: "10", direction: "up" },
          { code: "07", direction: "down" },
          { code: "01", direction: "down" },
        ],
      },
      {
        label: "Joven trabajando",
        emoji: "💼",
        deltas: {
          "04": 4,
          "11": 5,
          "09": 2,
          "01": -4,
          "05": -3,
          "06": -2,
          "10": -1,
        },
        insight:
          "Los jóvenes trabajadores gastan más en restaurantes y ocio, y menos en alimentación en casa.",
        affected: [
          { code: "11", direction: "up" },
          { code: "04", direction: "up" },
          { code: "09", direction: "up" },
          { code: "01", direction: "down" },
        ],
      },
      {
        label: "Familia con hijos",
        emoji: "👨‍👩‍👧‍👦",
        deltas: { "01": 3, "03": 2, "10": 5, "06": -1, "11": -5, "09": -2 },
        insight:
          "Las familias destinan más a alimentación, enseñanza y ropa, y salen menos a restaurantes.",
        affected: [
          { code: "10", direction: "up" },
          { code: "01", direction: "up" },
          { code: "03", direction: "up" },
          { code: "11", direction: "down" },
        ],
      },
      {
        label: "Pareja sin hijos",
        emoji: "👫",
        deltas: { "11": 5, "09": 2, "07": 1, "10": -1, "01": -3, "06": -2 },
        insight:
          "Sin hijos, el ocio y los restaurantes ganan peso, y la enseñanza casi desaparece del gasto.",
        affected: [
          { code: "11", direction: "up" },
          { code: "09", direction: "up" },
          { code: "01", direction: "down" },
          { code: "06", direction: "down" },
        ],
      },
      {
        label: "Jubilado/a",
        emoji: "🏖️",
        deltas: {
          "01": 5,
          "06": 5,
          "12": 2,
          "07": -5,
          "09": -2,
          "11": -4,
          "10": -1,
        },
        insight:
          "Los jubilados dedican mucho más a alimentación y sanidad, y menos a transporte y ocio.",
        affected: [
          { code: "01", direction: "up" },
          { code: "06", direction: "up" },
          { code: "07", direction: "down" },
          { code: "11", direction: "down" },
        ],
      },
    ],
  },
  {
    text: "¿Tu vivienda es...?",
    context:
      "La vivienda varía enormemente: un propietario destina ~9% del gasto, pero un inquilino puede llegar al 25%. El 45% de los menores de 35 vive en alquiler.",
    options: [
      {
        label: "En propiedad (pagada)",
        emoji: "🏡",
        deltas: { "04": -6, "05": 2, "09": 2, "12": 2 },
        insight:
          "Sin hipoteca ni alquiler, tu peso de vivienda baja mucho y puedes gastar más en otras cosas.",
        affected: [
          { code: "04", direction: "down" },
          { code: "05", direction: "up" },
          { code: "09", direction: "up" },
        ],
      },
      {
        label: "Con hipoteca",
        emoji: "🏦",
        deltas: { "04": 2, "05": 1, "09": -1, "11": -2 },
        insight:
          "La hipoteca mantiene el peso de vivienda cerca del oficial, con algo menos para restaurantes.",
        affected: [
          { code: "04", direction: "up" },
          { code: "11", direction: "down" },
        ],
      },
      {
        label: "En alquiler",
        emoji: "🔑",
        deltas: { "04": 10, "11": -3, "09": -3, "05": -2, "12": -2 },
        insight:
          "El alquiler puede absorber hasta un 25% de tu gasto total, reduciendo margen en ocio y restaurantes.",
        affected: [
          { code: "04", direction: "up" },
          { code: "11", direction: "down" },
          { code: "09", direction: "down" },
        ],
      },
      {
        label: "Con mis padres / compartida",
        emoji: "🏘️",
        deltas: { "04": -8, "11": 3, "09": 3, "02": 2 },
        insight:
          "Al no pagar vivienda directamente, tu gasto se redistribuye hacia ocio y restaurantes.",
        affected: [
          { code: "04", direction: "down" },
          { code: "11", direction: "up" },
          { code: "09", direction: "up" },
        ],
      },
    ],
  },
  {
    text: "¿Cómo te desplazas habitualmente?",
    context:
      "El transporte pesa un 14.4% en el IPC oficial y es la categoría más volátil por el precio del combustible. En zonas rurales llega al 21%.",
    options: [
      {
        label: "Coche propio",
        emoji: "🚗",
        deltas: { "07": 6, "01": -2, "09": -2, "11": -2 },
        insight:
          "Con coche propio (gasolina, seguro, mantenimiento), el transporte sube del 14% al ~20%.",
        affected: [
          { code: "07", direction: "up" },
          { code: "01", direction: "down" },
          { code: "11", direction: "down" },
        ],
      },
      {
        label: "Transporte público",
        emoji: "🚇",
        deltas: { "07": -7, "11": 3, "09": 2, "04": 2 },
        insight:
          "Sin coche propio, tu peso de transporte baja del 14% al ~7% y liberas presupuesto.",
        affected: [
          { code: "07", direction: "down" },
          { code: "11", direction: "up" },
          { code: "09", direction: "up" },
        ],
      },
      {
        label: "Bici / andando",
        emoji: "🚲",
        deltas: { "07": -10, "09": 3, "11": 3, "01": 2, "06": 2 },
        insight:
          "Sin gasto en transporte motorizado, esta categoría prácticamente desaparece de tu cesta.",
        affected: [
          { code: "07", direction: "down" },
          { code: "09", direction: "up" },
          { code: "11", direction: "up" },
        ],
      },
      {
        label: "Mixto",
        emoji: "🔄",
        deltas: { "07": -2, "11": 1, "09": 1 },
        insight:
          "Combinar medios reduce algo el peso de transporte respecto al oficial.",
        affected: [
          { code: "07", direction: "down" },
          { code: "11", direction: "up" },
        ],
      },
    ],
  },
  {
    text: "¿Cómo son tus comidas del día a día?",
    context:
      "Alimentación en casa + restaurantes suman un tercio del IPC. Si comes mucho fuera, eres más sensible a la inflación en hostelería.",
    options: [
      {
        label: "Cocino casi siempre en casa",
        emoji: "🍳",
        deltas: { "01": 5, "11": -6, "05": 1 },
        insight:
          "Cocinar en casa sube alimentación al ~23% y reduce restaurantes, con un IPC más ligado al precio de la compra.",
        affected: [
          { code: "01", direction: "up" },
          { code: "11", direction: "down" },
        ],
      },
      {
        label: "Mitad y mitad",
        emoji: "⚖️",
        deltas: {},
        insight:
          "Tu reparto entre alimentación y restaurantes se acerca a la media oficial.",
        affected: [],
      },
      {
        label: "Como fuera a menudo",
        emoji: "🍽️",
        deltas: { "11": 6, "01": -4, "05": -2 },
        insight:
          "Comer fuera a menudo sube restaurantes al ~20% y te hace más sensible a la inflación en hostelería.",
        affected: [
          { code: "11", direction: "up" },
          { code: "01", direction: "down" },
        ],
      },
    ],
  },
  {
    text: "¿Cuánto gastas en sanidad privada?",
    context:
      "Los mayores de 65 dedican hasta un 11% a sanidad. Un seguro médico privado puede duplicar el peso oficial del 5.7%.",
    options: [
      {
        label: "Solo sanidad pública",
        emoji: "🏥",
        deltas: { "06": -2, "09": 1, "11": 1 },
        insight:
          "Sin gasto sanitario privado, esta categoría baja del 5.7% al ~4% de tu presupuesto.",
        affected: [
          { code: "06", direction: "down" },
          { code: "09", direction: "up" },
        ],
      },
      {
        label: "Seguro privado",
        emoji: "🩺",
        deltas: { "06": 3, "12": 2, "09": -2, "11": -1 },
        insight:
          "Con seguro privado, sanidad + seguros sube al ~11%, casi el doble del oficial.",
        affected: [
          { code: "06", direction: "up" },
          { code: "12", direction: "up" },
          { code: "09", direction: "down" },
        ],
      },
      {
        label: "Muchos gastos médicos",
        emoji: "💊",
        deltas: { "06": 5, "12": 2, "09": -3, "11": -2 },
        insight:
          "Con gastos médicos frecuentes, sanidad puede llegar al 11% y condiciona mucho tu cesta.",
        affected: [
          { code: "06", direction: "up" },
          { code: "12", direction: "up" },
          { code: "09", direction: "down" },
        ],
      },
    ],
  },
  {
    text: "¿Tienes gastos de educación?",
    context:
      "La enseñanza solo pesa un 1.9% en el IPC oficial, pero para familias con colegios privados sube al 7% y para universitarios al 12%.",
    options: [
      {
        label: "No",
        emoji: "✅",
        deltas: { "10": -1, "11": 1 },
        insight:
          "Sin gastos educativos, esta categoría casi no afecta a tu inflación personal.",
        affected: [
          { code: "10", direction: "down" },
          { code: "11", direction: "up" },
        ],
      },
      {
        label: "Guardería o colegio",
        emoji: "🏫",
        deltas: { "10": 4, "03": 1, "11": -2, "09": -2 },
        insight:
          "Guardería o colegio privado multiplica por 3 el peso oficial de enseñanza (~6%).",
        affected: [
          { code: "10", direction: "up" },
          { code: "03", direction: "up" },
          { code: "11", direction: "down" },
        ],
      },
      {
        label: "Universidad o FP",
        emoji: "🎓",
        deltas: { "10": 6, "08": 1, "11": -3, "09": -2 },
        insight:
          "Matrículas y material universitario pueden llevar enseñanza hasta el 8-12% del gasto.",
        affected: [
          { code: "10", direction: "up" },
          { code: "08", direction: "up" },
          { code: "11", direction: "down" },
        ],
      },
      {
        label: "Formación propia",
        emoji: "📖",
        deltas: { "10": 2, "08": 1, "11": -1 },
        insight:
          "Cursos y formación continua suben algo el peso de enseñanza, aunque menos que la educación reglada.",
        affected: [
          { code: "10", direction: "up" },
          { code: "08", direction: "up" },
        ],
      },
    ],
  },
  {
    text: "¿Dónde vives?",
    context:
      "En municipios de menos de 10.000 hab., el coche es imprescindible (transporte ~21%) pero la vivienda cuesta mucho menos (~9%).",
    options: [
      {
        label: "Gran ciudad (+500k hab.)",
        emoji: "🏙️",
        deltas: { "11": 3, "04": 2, "07": -4, "01": -1 },
        insight:
          "En grandes ciudades se gasta más en restaurantes y vivienda, pero menos en transporte.",
        affected: [
          { code: "11", direction: "up" },
          { code: "04", direction: "up" },
          { code: "07", direction: "down" },
        ],
      },
      {
        label: "Ciudad mediana",
        emoji: "🏘️",
        deltas: {},
        insight:
          "En ciudades medianas, la distribución del gasto se acerca a la media oficial.",
        affected: [],
      },
      {
        label: "Pueblo o zona rural",
        emoji: "🌾",
        deltas: { "07": 5, "01": 3, "04": -4, "11": -4 },
        insight:
          "En zonas rurales el coche es imprescindible y la alimentación pesa más, pero la vivienda mucho menos.",
        affected: [
          { code: "07", direction: "up" },
          { code: "01", direction: "up" },
          { code: "04", direction: "down" },
          { code: "11", direction: "down" },
        ],
      },
    ],
  },
];

const QUIZ_PROGRESS_KEY = "tu-ipc-quiz-progress";

function normalizeWeights(
  weights: Record<string, number>,
): Record<string, number> {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total <= 0) return weights;
  const result: Record<string, number> = {};
  for (const [code, w] of Object.entries(weights)) {
    result[code] = +((w / total) * 100).toFixed(1);
  }
  return result;
}

function computeWeights(answers: (number | null)[]): Record<string, number> {
  const weights = { ...OFFICIAL_WEIGHTS };
  answers.forEach((ansIdx, qIdx) => {
    if (ansIdx === null) return;
    const deltas = QUESTIONS[qIdx].options[ansIdx]?.deltas || {};
    for (const [code, delta] of Object.entries(deltas)) {
      weights[code] = Math.max(0.5, (weights[code] || 0) + delta);
    }
  });
  return normalizeWeights(weights);
}

function getCategoryIcon(code: string): string {
  return CATEGORIES.find((c) => c.code === code)?.icon || "";
}

function clearQuizProgress() {
  try {
    sessionStorage.removeItem(QUIZ_PROGRESS_KEY);
  } catch {
    // ignore
  }
}

function loadQuizProgress(): PersistedQuizState | null {
  try {
    const raw = sessionStorage.getItem(QUIZ_PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedQuizState;

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.step !== "number" ||
      !Array.isArray(parsed.answers) ||
      typeof parsed.showSummary !== "boolean"
    ) {
      return null;
    }

    if (
      parsed.step < 0 ||
      parsed.step > QUESTIONS.length - 1 ||
      parsed.answers.length !== QUESTIONS.length
    ) {
      return null;
    }

    const sanitizedAnswers = parsed.answers.map((answer, idx) => {
      if (answer === null) return null;
      if (
        typeof answer === "number" &&
        answer >= 0 &&
        answer < QUESTIONS[idx].options.length
      ) {
        return answer;
      }
      return null;
    });

    return {
      step: parsed.step,
      answers: sanitizedAnswers,
      showSummary: parsed.showSummary,
    };
  } catch {
    return null;
  }
}

export default function OnboardingQuiz({
  onComplete,
  onSkip,
}: OnboardingQuizProps) {
  const initialProgress = useMemo(() => loadQuizProgress(), []);
  const [step, setStep] = useState(initialProgress?.step ?? 0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => initialProgress?.answers ?? new Array(QUESTIONS.length).fill(null),
  );
  const [showSummary, setShowSummary] = useState(
    initialProgress?.showSummary ?? false,
  );

  const selectedOption = answers[step];

  useEffect(() => {
    try {
      const payload: PersistedQuizState = {
        step,
        answers,
        showSummary,
      };
      sessionStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [step, answers, showSummary]);

  const handleSelect = useCallback(
    (optionIndex: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[step] = optionIndex;
        return next;
      });
    },
    [step],
  );

  const handleNext = useCallback(() => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setShowSummary(true);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (showSummary) {
      setShowSummary(false);
    } else if (step > 0) {
      setStep(step - 1);
    }
  }, [step, showSummary]);

  const handleComplete = useCallback(() => {
    clearQuizProgress();
    const w = computeWeights(answers);
    trackEvent("quiz_complete");
    onComplete(w);
  }, [answers, onComplete]);

  const handleSkip = useCallback(() => {
    clearQuizProgress();
    trackEvent("quiz_skip");
    onSkip();
  }, [onSkip]);

  const finalWeights = useMemo(() => computeWeights(answers), [answers]);

  const topDifferences = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      code: cat.code,
      name: CATEGORY_SHORT_NAMES[cat.code],
      icon: cat.icon,
      personal: finalWeights[cat.code] || 0,
      official: cat.officialWeight,
      diff: (finalWeights[cat.code] || 0) - cat.officialWeight,
    }))
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
      .slice(0, 5);
  }, [finalWeights]);

  if (showSummary) {
    return (
      <div className="max-w-lg mx-auto">
        {/* Back button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold mb-1 text-center">
              Tu perfil de consumo
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Basado en tus respuestas, así se distribuye tu gasto estimado:
            </p>

            <div className="space-y-3 mb-6">
              {topDifferences.map((item) => (
                <div key={item.code} className="flex items-center gap-3">
                  <span className="text-lg w-7 text-center">{item.icon}</span>
                  <span className="text-sm font-medium flex-1">
                    {item.name}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {item.personal.toFixed(1)}%
                  </span>
                  <span
                    className={`text-xs tabular-nums ${
                      item.diff > 0.5
                        ? "text-red-600 dark:text-red-400"
                        : item.diff < -0.5
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    (oficial: {item.official}%)
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mb-2">
              Puedes ajustar estos pesos después en la pestaña
              &quot;Desglose&quot;.
            </p>

            <p className="text-xs text-muted-foreground/70 text-center mb-4">
              Estos pesos son una aproximación orientativa. Podrás ajustarlos
              manualmente en la calculadora.
            </p>

            <Button className="w-full" size="lg" onClick={handleComplete}>
              Calcular mi IPC
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Saltar al calculador
          </Button>
        </div>
      </div>
    );
  }

  const question = QUESTIONS[step];
  const currentOption =
    selectedOption !== null ? question.options[selectedOption] : null;
  const hasSelection = selectedOption !== null;

  return (
    <div className="max-w-lg mx-auto pb-32">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i < step ? "bg-primary" : i === step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center mb-6">
        Pregunta {step + 1} de {QUESTIONS.length}
      </p>

      <Card>
        <CardContent className="pt-6">
          {/* Question text */}
          <h3 className="text-lg font-semibold mb-3 text-center">
            {question.text}
          </h3>

          {/* Context card */}
          <div className="bg-muted/50 rounded-lg p-3 mb-4 flex gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {question.context}
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2 mb-4">
            {question.options.map((option, i) => {
              const isSelected = selectedOption === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(i)}
                  className={`flex items-center gap-3 w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border bg-background hover:bg-muted/50"
                  }`}
                >
                  <span className="text-lg">{option.emoji}</span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Insight card — appears after selecting */}
          {currentOption && (
            <div className="bg-muted/30 border border-border rounded-lg p-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <p className="text-xs text-foreground/80 leading-relaxed mb-2">
                {currentOption.insight}
              </p>
              {currentOption.affected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {currentOption.affected.map((a) => (
                    <span
                      key={a.code}
                      className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2 py-0.5"
                    >
                      {getCategoryIcon(a.code)} {CATEGORY_SHORT_NAMES[a.code]}{" "}
                      {a.direction === "up" ? "↑" : "↓"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sticky actions (mobile + desktop) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
          <div className="flex items-center justify-between gap-2">
            {step > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            ) : (
              <div className="w-24" />
            )}
            <Button size="sm" onClick={handleNext} disabled={!hasSelection}>
              {step < QUESTIONS.length - 1 ? (
                <>
                  Siguiente
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Ver mi perfil
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <div className="mt-2 text-center sm:text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Saltar al calculador
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
