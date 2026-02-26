import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PrivacyPolicyProps {
  onBack: () => void;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold tracking-tight mb-4 pb-2 border-b">
        {title}
      </h2>
      {children}
    </section>
  );
}

const LOCAL_STORAGE_KEYS = [
  {
    key: "tu-ipc-weights",
    description: "Tus pesos de gasto personalizados (12 categorías)",
  },
  {
    key: "tu-ipc-locked",
    description: "Categorías que has bloqueado en los sliders",
  },
  {
    key: "tu-ipc-region",
    description: "Tu comunidad autónoma seleccionada",
  },
  {
    key: "tu-ipc-theme",
    description: "Tu preferencia de tema claro/oscuro",
  },
  {
    key: "tu-ipc-salary",
    description: "Los datos introducidos en la calculadora de sueldo",
  },
  {
    key: "tu-ipc-color-theme",
    description:
      "Tu paleta de colores seleccionada (para integraciones de marca)",
  },
  {
    key: "tu-ipc-analytics-consent",
    description:
      "Tu preferencia de analítica opcional (activada o desactivada)",
  },
];

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          &larr; Volver a la calculadora
        </Button>

        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacidad</h1>
        <p className="text-lg text-muted-foreground mb-10">
          Cómo tratamos tus datos en Tu IPC Personal
        </p>

        <Section title="1. Analítica opcional y consentimiento">
          <p className="text-muted-foreground mb-3">
            Utilizamos Google Analytics 4 (GA4) configurado en{" "}
            <strong className="text-foreground">
              Consent Mode v2 con valores denied por defecto
            </strong>
            . Solo activamos la analítica con cookies si das consentimiento al
            entrar en el wizard o al saltar a la calculadora desde la landing
            (consentimiento implícito), o si la activas manualmente desde el
            pie de página.
          </p>
          <ul className="text-muted-foreground space-y-2 ml-4 list-disc mb-4">
            <li>Sin consentimiento, no se instalan cookies de analítica</li>
            <li>
              Con consentimiento, GA4 puede usar cookies como{" "}
              <code className="text-foreground">_ga</code> o{" "}
              <code className="text-foreground">_gid</code>
            </li>
            <li>
              No se recogen datos para publicidad ni personalización de anuncios
            </li>
            <li>
              La dirección IP se anonimiza antes de cualquier procesamiento
            </li>
          </ul>
          <p className="text-muted-foreground">
            Los datos agregados nos ayudan a entender el uso general de la
            herramienta (páginas visitadas, funciones usadas), sin identificar a
            usuarios individuales. Puedes cambiar esta preferencia cuando
            quieras desde el pie de página.
          </p>
        </Section>

        <Section title="2. Almacenamiento local">
          <p className="text-muted-foreground mb-4">
            Guardamos tus preferencias en el{" "}
            <strong className="text-foreground">localStorage</strong> de tu
            navegador. Estos datos{" "}
            <strong className="text-foreground">
              nunca se envían a ningún servidor
            </strong>{" "}
            — permanecen exclusivamente en tu dispositivo.
          </p>
          <div className="space-y-3">
            {LOCAL_STORAGE_KEYS.map((item) => (
              <Card key={item.key}>
                <CardContent className="pt-4 pb-4">
                  <p className="font-mono text-sm text-foreground">
                    {item.key}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="3. Cookies y control">
          <p className="text-muted-foreground">
            Esta web no establece cookies propias de seguimiento. Las cookies de
            analítica de GA4 son opcionales y solo se activan tras el
            consentimiento indicado arriba. Puedes activar o desactivar la
            analítica en cualquier momento desde el enlace del pie de página.
          </p>
        </Section>

        <Section title="4. Tus derechos">
          <p className="text-muted-foreground mb-3">
            Como todos los datos personalizables se guardan localmente en tu
            navegador, tienes control total sobre ellos:
          </p>
          <ul className="text-muted-foreground space-y-2 ml-4 list-disc">
            <li>
              Puedes borrar todos tus datos desde el botón{" "}
              <strong className="text-foreground">"Borrar mis datos"</strong> en
              el pie de página
            </li>
            <li>
              También puedes limpiar el localStorage de tu navegador manualmente
              desde las herramientas de desarrollo
            </li>
            <li>
              No necesitas crear cuenta ni proporcionar datos personales para
              usar la herramienta
            </li>
          </ul>
        </Section>

        <Section title="5. Código abierto">
          <p className="text-muted-foreground">
            El código fuente de esta aplicación es público y auditable en{" "}
            <a
              href="https://github.com/jenarvaezg/tu-ipc"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            . Puedes verificar exactamente qué datos se recogen y cómo se
            procesan.
          </p>
        </Section>

        <div className="text-center pb-8">
          <Button variant="ghost" onClick={onBack}>
            &larr; Volver a la calculadora
          </Button>
        </div>
      </div>
    </div>
  );
}
