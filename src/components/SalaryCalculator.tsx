import { useState, useEffect, useId } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSalaryComparison, PayType } from "@/hooks/useSalaryComparison";
import { formatMonth } from "@/utils/formatMonth";

const STORAGE_KEY_SALARY = "tu-ipc-salary";

interface SalaryInputs {
  before: string;
  after: string;
  payType: PayType;
  convention: string;
}

function loadSalaryInputs(): SalaryInputs {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SALARY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.before !== undefined) return parsed;
    }
  } catch {
    /* ignore */
  }
  return { before: "", after: "", payType: "12", convention: "" };
}

function saveSalaryInputs(inputs: SalaryInputs) {
  localStorage.setItem(STORAGE_KEY_SALARY, JSON.stringify(inputs));
}

interface SalaryCalculatorProps {
  personalIPC: number;
  startMonth: string;
  endMonth: string;
}

const PAY_TYPES: { id: PayType; label: string }[] = [
  { id: "12", label: "12 pagas" },
  { id: "14", label: "14 pagas" },
  { id: "anual", label: "Anual" },
];

export default function SalaryCalculator({
  personalIPC,
  startMonth,
  endMonth,
}: SalaryCalculatorProps) {
  const salaryTypeLabelId = useId();
  const [inputs, setInputs] = useState<SalaryInputs>(loadSalaryInputs);

  const salaryBefore = parseFloat(inputs.before) || 0;
  const salaryAfter = parseFloat(inputs.after) || 0;
  const conventionRate = parseFloat(inputs.convention) || 0;

  const result = useSalaryComparison(
    salaryBefore,
    salaryAfter,
    inputs.payType,
    personalIPC,
  );

  useEffect(() => {
    saveSalaryInputs(inputs);
  }, [inputs]);

  const handleChange = (field: "before" | "after", value: string) => {
    // Allow only numbers and decimal point
    if (value && !/^\d*\.?\d*$/.test(value)) return;
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tu Sueldo vs Tu Inflación</CardTitle>
          <CardDescription>
            Compara tu evolución salarial con tu inflación personal (
            {startMonth} a {endMonth})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pay type selector */}
          <div>
            <label
              id={salaryTypeLabelId}
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              Tipo de salario
            </label>
            <div
              className="flex gap-2"
              role="group"
              aria-labelledby={salaryTypeLabelId}
            >
              {PAY_TYPES.map((pt) => (
                <Button
                  key={pt.id}
                  variant={inputs.payType === pt.id ? "default" : "secondary"}
                  size="sm"
                  onClick={() =>
                    setInputs((prev) => ({ ...prev, payType: pt.id }))
                  }
                  className={
                    inputs.payType === pt.id
                      ? ""
                      : "hover:bg-primary/10 hover:text-primary transition-colors"
                  }
                >
                  {pt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Salary inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="salary-before"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Salario neto {inputs.payType === "anual" ? "anual" : "mensual"}{" "}
                en {formatMonth(startMonth)}
              </label>
              <div className="relative">
                <input
                  id="salary-before"
                  type="text"
                  inputMode="decimal"
                  value={inputs.before}
                  onChange={(e) => handleChange("before", e.target.value)}
                  placeholder="1.500"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  €
                </span>
              </div>
            </div>
            <div>
              <label
                htmlFor="salary-after"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Salario neto {inputs.payType === "anual" ? "anual" : "mensual"}{" "}
                en {formatMonth(endMonth)}
              </label>
              <div className="relative">
                <input
                  id="salary-after"
                  type="text"
                  inputMode="decimal"
                  value={inputs.after}
                  onChange={(e) => handleChange("after", e.target.value)}
                  placeholder="1.600"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  €
                </span>
              </div>
            </div>
          </div>

          {/* Convention input */}
          <div>
            <label
              htmlFor="convention-rate"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Subida pactada en convenio (%)
            </label>
            <div className="relative">
              <input
                id="convention-rate"
                type="text"
                inputMode="decimal"
                value={inputs.convention}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v && !/^\d*\.?\d*$/.test(v)) return;
                  setInputs((prev) => ({ ...prev, convention: v }));
                }}
                placeholder="2.5"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            className="animate-slide-up"
            style={{ animationDelay: "0.05s" }}
          >
            <CardContent className="pt-6 text-center">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Subida salarial
              </p>
              <p
                className={`text-2xl font-bold ${result.nominalGrowth >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                {result.nominalGrowth >= 0 ? "+" : ""}
                {result.nominalGrowth.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardContent className="pt-6 text-center">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Tu inflación
              </p>
              <p
                className={`text-2xl font-bold ${personalIPC >= 0 ? "text-rose-400" : "text-emerald-400"}`}
              >
                {personalIPC >= 0 ? "+" : ""}
                {personalIPC.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          <Card
            className="animate-slide-up"
            style={{ animationDelay: "0.15s" }}
          >
            <CardContent className="pt-6 text-center">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Cambio real
              </p>
              <p
                className={`text-2xl font-bold ${result.realGrowth >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                {result.realGrowth >= 0 ? "+" : ""}
                {result.realGrowth.toFixed(2)}%
              </p>
              <p
                className={`text-xs mt-1 ${result.realGrowth >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                {result.realGrowth >= 0
                  ? "Tu sueldo le gana a la inflación"
                  : "La inflación le gana a tu sueldo"}
              </p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardContent className="pt-6 text-center">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Poder adquisitivo
              </p>
              <p
                className={`text-2xl font-bold ${result.monthlyChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                {result.monthlyChange >= 0 ? "+" : ""}
                {result.monthlyChange}€/mes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {conventionRate > 0 && (
        <>
          <Card
            className="animate-slide-up"
            style={{ animationDelay: "0.25s" }}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Tu convenio vs tu inflación
                </p>
                <p
                  className={`text-2xl font-bold ${conventionRate >= personalIPC ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {conventionRate >= personalIPC ? "+" : ""}
                  {(conventionRate - personalIPC).toFixed(2)} pp
                </p>
                <p
                  className={`text-xs mt-1 ${conventionRate >= personalIPC ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {conventionRate >= personalIPC
                    ? "Tu convenio cubre tu inflación personal"
                    : `Tu convenio sube ${conventionRate.toFixed(1)}% pero tu inflación es ${personalIPC.toFixed(1)}%`}
                </p>
              </div>
            </CardContent>
          </Card>
          {(() => {
            const [sy, sm] = startMonth.split("-").map(Number);
            const [ey, em] = endMonth.split("-").map(Number);
            const md = (ey - sy) * 12 + (em - sm);
            return md !== 12 ? (
              <p className="text-xs text-amber-500 text-center mt-2">
                El periodo seleccionado es de {md} meses. La subida de convenio
                suele ser anual (12 meses). Compara con precaución.
              </p>
            ) : null;
          })()}
        </>
      )}

      {!result && (salaryBefore > 0 || salaryAfter > 0) && (
        <p className="text-center text-sm text-muted-foreground">
          Introduce ambos salarios para ver el resultado
        </p>
      )}
    </div>
  );
}
