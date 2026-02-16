import { Button } from '@/components/ui/button'

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const TABS = [
  { id: 'evolucion', label: 'Evolución' },
  { id: 'desglose', label: 'Desglose' },
  { id: 'sueldo', label: 'Tu Sueldo' },
]

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="mb-8" role="tablist" aria-label="Secciones de la calculadora">
      <div className="flex flex-wrap gap-2 justify-center">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            id={`${tab.id}-tab`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            variant={activeTab === tab.id ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onTabChange(tab.id)}
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
