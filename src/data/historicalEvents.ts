export interface HistoricalEvent {
  month: string
  label: string
  shortLabel: string
}

export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  { month: '2020-03', label: 'COVID-19: estado de alarma', shortLabel: 'COVID' },
  { month: '2021-01', label: 'Borrasca Filomena', shortLabel: 'Filomena' },
  { month: '2021-09', label: 'Inicio crisis energética', shortLabel: 'Crisis energía' },
  { month: '2022-02', label: 'Invasión de Ucrania', shortLabel: 'Ucrania' },
  { month: '2022-06', label: 'Pico de inflación en España', shortLabel: 'Pico IPC' },
  { month: '2022-10', label: 'Tope al gas (excepción ibérica)', shortLabel: 'Tope gas' },
  { month: '2023-01', label: 'Rebaja IVA alimentos', shortLabel: 'IVA alimentos' },
]
