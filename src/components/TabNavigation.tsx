import { Button } from '@/components/ui/button'
import { trackEvent } from '@/utils/analytics'

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const TABS = [
  { id: 'evolucion', label: 'Evolución' },
  { id: 'desglose', label: 'Desglose' },
  { id: 'sueldo', label: 'Tu Sueldo' },
  { id: 'regiones', label: 'Regiones' },
]

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="mb-4" role="tablist" aria-label="Secciones de la calculadora">
      <div className="flex flex-wrap gap-2 justify-start">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            id={`${tab.id}-tab`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            variant={activeTab === tab.id ? 'default' : 'secondary'}
            size="sm"
            onClick={() => { trackEvent('tab_change', { tab: tab.id }); onTabChange(tab.id) }}
            className={
              activeTab === tab.id
                ? ''
                : 'hover:bg-primary/10 hover:text-primary transition-colors'
            }
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
