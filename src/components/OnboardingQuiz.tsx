import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OFFICIAL_WEIGHTS } from '@/data/categories'

interface OnboardingQuizProps {
  onComplete: (weights: Record<string, number>) => void
  onSkip: () => void
}

interface Question {
  text: string
  options: { label: string; deltas: Record<string, number> }[]
}

const QUESTIONS: Question[] = [
  {
    text: '¿Tu vivienda es...?',
    options: [
      { label: 'En propiedad', deltas: { '04': -8, '05': 3, '12': 3, '06': 2 } },
      { label: 'En alquiler', deltas: { '04': 12, '11': -3, '09': -3, '05': -3, '12': -3 } },
      { label: 'Con mis padres', deltas: { '04': -10, '11': 4, '09': 4, '02': 2 } },
    ],
  },
  {
    text: '¿Tienes coche?',
    options: [
      { label: 'Sí', deltas: { '07': 6, '01': -2, '09': -2, '11': -2 } },
      { label: 'No', deltas: { '07': -8, '11': 3, '09': 3, '04': 2 } },
    ],
  },
  {
    text: '¿Comes fuera a menudo?',
    options: [
      { label: 'Mucho', deltas: { '11': 8, '01': -5, '05': -3 } },
      { label: 'Normal', deltas: {} },
      { label: 'Casi nunca', deltas: { '11': -5, '01': 4, '05': 1 } },
    ],
  },
  {
    text: '¿Tienes hijos?',
    options: [
      { label: 'Sí', deltas: { '10': 5, '03': 3, '01': 3, '09': -4, '11': -4, '02': -3 } },
      { label: 'No', deltas: { '10': -1, '09': 1 } },
    ],
  },
  {
    text: '¿Trabajas desde casa?',
    options: [
      { label: 'Sí', deltas: { '04': 5, '08': 3, '07': -6, '11': -2 } },
      { label: 'No', deltas: { '07': 2, '11': 1, '04': -2, '08': -1 } },
      { label: 'Mixto', deltas: {} },
    ],
  },
]

function normalizeWeights(weights: Record<string, number>): Record<string, number> {
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  if (total <= 0) return weights
  const result: Record<string, number> = {}
  for (const [code, w] of Object.entries(weights)) {
    result[code] = +((w / total) * 100).toFixed(1)
  }
  return result
}

export default function OnboardingQuiz({ onComplete, onSkip }: OnboardingQuizProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])

  const handleAnswer = useCallback((optionIndex: number) => {
    const newAnswers = [...answers, optionIndex]
    setAnswers(newAnswers)

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      // Compute final weights
      const weights = { ...OFFICIAL_WEIGHTS }
      newAnswers.forEach((ansIdx, qIdx) => {
        const deltas = QUESTIONS[qIdx].options[ansIdx]?.deltas || {}
        for (const [code, delta] of Object.entries(deltas)) {
          weights[code] = Math.max(0.5, (weights[code] || 0) + delta)
        }
      })
      onComplete(normalizeWeights(weights))
    }
  }, [step, answers, onComplete])

  const question = QUESTIONS[step]

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-6">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i < step ? 'bg-primary' : i === step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 text-center">{question.text}</h3>
          <div className="flex flex-col gap-2">
            {question.options.map((option, i) => (
              <Button
                key={i}
                variant="secondary"
                className="w-full justify-center py-3 hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => handleAnswer(i)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-4">
        <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
          Saltar al calculador
        </Button>
      </div>
    </div>
  )
}
