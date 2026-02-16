export interface HistoricalEvent {
  month: string
  label: string
  shortLabel: string
}

export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  { month: '2012-06', label: 'Rescate bancario español', shortLabel: 'Rescate' },
  { month: '2020-03', label: 'COVID-19: estado de alarma', shortLabel: 'COVID' },
  { month: '2022-02', label: 'Invasión de Ucrania', shortLabel: 'Ucrania' },
  { month: '2022-07', label: 'Pico de inflación (~10,8%)', shortLabel: 'Pico IPC' },
  { month: '2023-01', label: 'Rebaja IVA alimentos', shortLabel: 'IVA alim.' },
]
